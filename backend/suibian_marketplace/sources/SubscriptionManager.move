module suibian_marketplace::subscription_manager {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    use std::string::String;
    use suibian_marketplace::agent_registry::{Self, TradingAgent};

    // Error codes
    const ENotSubscribed: u64 = 1;
    const EInsufficientPayment: u64 = 2;
    const EAgentNotActive: u64 = 3;
    const EDepositTooLow: u64 = 4;
    const EDepositTooHigh: u64 = 5;
    const ENotSubscriber: u64 = 6;
    const EWithdrawalPending: u64 = 7;
    const EInvalidSignature: u64 = 8;

    /// User subscription record
    public struct UserSubscription has key, store {
        id: sui::object::UID,
        agent_id: sui::object::ID,
        subscriber: address,
        subscription_end: u64,              // When subscription expires
        total_deposited: u64,               // Total amount ever deposited
        is_active: bool,                    // Whether subscription is active
        subscribed_at: u64,                 // When user first subscribed
    }

    /// Withdrawal request in the queue
    public struct WithdrawalRequest has key, store {
        id: sui::object::UID,
        agent_id: sui::object::ID,
        subscriber: address,
        amount: u64,
        requested_at: u64,
        status: u8,                         // 0=PENDING, 1=COMPLETED, 2=REJECTED
    }

    /// Global subscription manager state
    public struct SubscriptionManager has key {
        id: sui::object::UID,
        // Track user subscriptions per agent
        user_subscriptions: Table<vector<u8>, sui::object::ID>,  // key: agent_id + user_address
        // Track withdrawal requests
        withdrawal_requests: Table<sui::object::ID, bool>,       // request_id -> exists
    }

    /// Events
    public struct UserSubscribed has copy, drop {
        agent_id: sui::object::ID,
        subscriber: address,
        subscription_fee_paid: u64,
        subscription_end: u64,
        timestamp: u64,
    }

    public struct FundsDeposited has copy, drop {
        agent_id: sui::object::ID,
        subscriber: address,
        amount: u64,
        tee_wallet_address: address,
        timestamp: u64,
    }

    public struct WithdrawalRequested has copy, drop {
        request_id: sui::object::ID,
        agent_id: sui::object::ID,
        subscriber: address,
        amount: u64,
        timestamp: u64,
    }

    public struct WithdrawalCompleted has copy, drop {
        request_id: sui::object::ID,
        agent_id: sui::object::ID,
        subscriber: address,
        amount: u64,
        tx_hash: vector<u8>,
        timestamp: u64,
    }

    /// Initialize the subscription manager (called once during deployment)
    fun init(ctx: &mut sui::tx_context::TxContext) {
        let manager = SubscriptionManager {
            id: sui::object::new(ctx),
            user_subscriptions: table::new(ctx),
            withdrawal_requests: table::new(ctx),
        };
        
        sui::transfer::share_object(manager);
    }

    /// Subscribe to a trading agent
    public entry fun subscribe_to_agent(
        agent: &mut TradingAgent,
        manager: &mut SubscriptionManager,
        payment: Coin<SUI>,
        subscription_duration_days: u64,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let subscriber = sui::tx_context::sender(ctx);
        let agent_id = sui::object::id(agent);
        
        // Check agent is active
        assert!(agent_registry::is_agent_active(agent), EAgentNotActive);
        
        // Check payment is sufficient
        let subscription_fee = agent_registry::get_subscription_fee(agent);
        assert!(coin::value(&payment) >= subscription_fee, EInsufficientPayment);
        
        // Calculate subscription end time
        let subscription_end = sui::tx_context::epoch_timestamp_ms(ctx) + 
            (subscription_duration_days * 24 * 60 * 60 * 1000);
        
        // Create subscription record
        let subscription = UserSubscription {
            id: sui::object::new(ctx),
            agent_id,
            subscriber,
            subscription_end,
            total_deposited: 0,
            is_active: true,
            subscribed_at: sui::tx_context::epoch_timestamp_ms(ctx),
        };
        
        // Generate key for tracking subscriptions
        let key = generate_subscription_key(agent_id, subscriber);
        table::add(&mut manager.user_subscriptions, key, sui::object::id(&subscription));
        
        // Pay subscription fee to agent creator
        let (_, _, _, _, _, _, _, creator, _, _, _) = agent_registry::get_agent_info(agent);
        sui::transfer::public_transfer(payment, creator);
        
        // Update agent subscriber count
        agent_registry::increment_subscribers(agent);
        
        // Emit subscription event
        event::emit(UserSubscribed {
            agent_id,
            subscriber,
            subscription_fee_paid: subscription_fee,
            subscription_end,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx),
        });
        
        // Share subscription object
        sui::transfer::share_object(subscription);
    }

    /// Deposit trading funds (only for subscribers)
    public entry fun deposit_trading_funds(
        agent: &TradingAgent,
        manager: &SubscriptionManager,
        subscription: &mut UserSubscription,
        deposit: Coin<SUI>,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let subscriber = sui::tx_context::sender(ctx);
        let agent_id = sui::object::id(agent);
        let deposit_amount = coin::value(&deposit);
        
        // Verify subscription belongs to this user and agent
        assert!(subscription.subscriber == subscriber, ENotSubscriber);
        assert!(subscription.agent_id == agent_id, ENotSubscriber);
        assert!(subscription.is_active, ENotSubscribed);
        
        // Check deposit limits
        let (min_deposit, max_deposit) = agent_registry::get_deposit_limits(agent);
        assert!(deposit_amount >= min_deposit, EDepositTooLow);
        assert!(deposit_amount <= max_deposit, EDepositTooHigh);
        
        // Update subscription record
        subscription.total_deposited = subscription.total_deposited + deposit_amount;
        
        // Transfer funds to TEE wallet
        let tee_wallet_address = agent_registry::get_tee_wallet_address(agent);
        sui::transfer::public_transfer(deposit, tee_wallet_address);
        
        // Emit deposit event
        event::emit(FundsDeposited {
            agent_id,
            subscriber,
            amount: deposit_amount,
            tee_wallet_address,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Request withdrawal from TEE wallet
    public entry fun request_withdrawal(
        agent: &TradingAgent,
        manager: &mut SubscriptionManager,
        subscription: &UserSubscription,
        amount: u64,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let subscriber = sui::tx_context::sender(ctx);
        let agent_id = sui::object::id(agent);
        
        // Verify subscription belongs to this user and agent
        assert!(subscription.subscriber == subscriber, ENotSubscriber);
        assert!(subscription.agent_id == agent_id, ENotSubscriber);
        assert!(subscription.is_active, ENotSubscribed);
        
        // Create withdrawal request
        let request = WithdrawalRequest {
            id: sui::object::new(ctx),
            agent_id,
            subscriber,
            amount,
            requested_at: sui::tx_context::epoch_timestamp_ms(ctx),
            status: 0, // PENDING
        };
        
        let request_id = sui::object::id(&request);
        
        // Track withdrawal request
        table::add(&mut manager.withdrawal_requests, request_id, true);
        
        // Emit withdrawal request event (TEE will listen to this)
        event::emit(WithdrawalRequested {
            request_id,
            agent_id,
            subscriber,
            amount,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx),
        });
        
        // Share withdrawal request object
        sui::transfer::share_object(request);
    }

    /// Mark withdrawal as completed (called by TEE or authorized party)
    public entry fun mark_withdrawal_completed(
        agent: &TradingAgent,
        manager: &mut SubscriptionManager,
        request: &mut WithdrawalRequest,
        tx_hash: vector<u8>,
        tee_signature: vector<u8>,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let agent_id = sui::object::id(agent);
        let request_id = sui::object::id(request);
        
        // Verify request exists
        assert!(table::contains(&manager.withdrawal_requests, request_id), EWithdrawalPending);
        
        // Verify TEE signature (simplified - you may want more robust verification)
        let tee_public_key = agent_registry::get_tee_public_key(agent);
        let message = generate_withdrawal_completion_message(request_id, tx_hash);
        assert!(verify_tee_signature(tee_public_key, message, tee_signature), EInvalidSignature);
        
        // Update request status
        request.status = 1; // COMPLETED
        
        // Emit completion event
        event::emit(WithdrawalCompleted {
            request_id,
            agent_id,
            subscriber: request.subscriber,
            amount: request.amount,
            tx_hash,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // Helper functions
    fun generate_subscription_key(agent_id: sui::object::ID, user: address): vector<u8> {
        let mut key = sui::object::id_to_bytes(&agent_id);
        std::vector::append(&mut key, sui::address::to_bytes(user));
        key
    }

    fun generate_withdrawal_completion_message(request_id: sui::object::ID, tx_hash: vector<u8>): vector<u8> {
        let mut message = sui::object::id_to_bytes(&request_id);
        std::vector::append(&mut message, tx_hash);
        message
    }

    // Simplified TEE signature verification (you may want to use proper cryptographic verification)
    fun verify_tee_signature(public_key: vector<u8>, message: vector<u8>, signature: vector<u8>): bool {
        // This is a placeholder - implement proper Ed25519 signature verification
        std::vector::length(&public_key) == 32 && 
        std::vector::length(&signature) == 64 &&
        std::vector::length(&message) > 0
    }

    /// View functions
    public fun is_subscribed(
        manager: &SubscriptionManager,
        agent_id: sui::object::ID,
        user: address
    ): bool {
        let key = generate_subscription_key(agent_id, user);
        table::contains(&manager.user_subscriptions, key)
    }

    public fun get_subscription_info(subscription: &UserSubscription): (
        sui::object::ID, address, u64, u64, bool, u64
    ) {
        (
            subscription.agent_id,
            subscription.subscriber,
            subscription.subscription_end,
            subscription.total_deposited,
            subscription.is_active,
            subscription.subscribed_at
        )
    }

    public fun get_withdrawal_request_info(request: &WithdrawalRequest): (
        sui::object::ID, address, u64, u64, u8
    ) {
        (
            request.agent_id,
            request.subscriber,
            request.amount,
            request.requested_at,
            request.status
        )
    }
}
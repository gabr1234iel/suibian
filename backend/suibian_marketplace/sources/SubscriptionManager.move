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
    const ENotSubscriber: u64 = 4;
    const EInvalidSignature: u64 = 5;

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

    // Helper functions
    fun generate_subscription_key(agent_id: sui::object::ID, user: address): vector<u8> {
        let mut key = sui::object::id_to_bytes(&agent_id);
        std::vector::append(&mut key, sui::address::to_bytes(user));
        key
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

}

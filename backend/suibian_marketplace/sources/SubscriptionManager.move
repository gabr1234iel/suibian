module suibian_marketplace::subscription_manager {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    use sui::balance::{Self, Balance};
    use sui::dynamic_field as df;
    use std::string::String;
    use suibian_marketplace::agent_registry::{Self, TradingAgent};

    // Error codes
    const ENotSubscribed: u64 = 1;
    const EInsufficientPayment: u64 = 2;
    const EAgentNotActive: u64 = 3;
    const ENotSubscriber: u64 = 4;
    const EInvalidSignature: u64 = 5;
    const ENotAuthorized: u64 = 6;
    const EInsufficientDeposit: u64 = 7;
    const EExceedsDepositedAmount: u64 = 8;
    const EAgentWalletNotSet: u64 = 9;
    const ENoRewardsAvailable: u64 = 10;

    /// Deployer capability for admin functions
    public struct DeployerCap has key, store {
        id: sui::object::UID,
    }

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

    /// Agent wallet info for tracking deposits and balances
    public struct AgentWallet has store {
        wallet_address: address,             // TEE wallet address for this agent
        total_deposited: u64,               // Total amount deposited by all users
        user_deposits: Table<address, u64>, // Track individual user deposits
    }

    /// User deposit record
    public struct UserDeposit has store {
        amount: u64,
        timestamp: u64,
    }


    /// Global subscription manager state
    public struct SubscriptionManager has key {
        id: sui::object::UID,
        deployer: address,                                       // Contract deployer address
        // Track user subscriptions per agent
        user_subscriptions: Table<vector<u8>, sui::object::ID>,  // key: agent_id + user_address
        // Track agent wallets
        agent_wallets: Table<sui::object::ID, AgentWallet>,      // agent_id -> wallet info
        // Track withdrawal requests
        withdrawal_requests: Table<sui::object::ID, bool>,       // request_id -> exists
    }

    /// Events
    public struct UserSubscribed has copy, drop {
        agent_id: sui::object::ID,
        subscription_id: sui::object::ID,
        subscriber: address,
        subscription_fee_paid: u64,
        subscription_end: u64,
        timestamp: u64,
    }

    public struct UserDeposited has copy, drop {
        agent_id: sui::object::ID,
        user: address,
        amount: u64,
        timestamp: u64,
    }

    public struct AgentWalletUpdated has copy, drop {
        agent_id: sui::object::ID,
        old_wallet: address,
        new_wallet: address,
        timestamp: u64,
    }

    public struct RewardsClaimed has copy, drop {
        agent_id: sui::object::ID,
        user: address,
        reward_amount: u64,
        user_deposit_share: u64,
        timestamp: u64,
    }

    /// Initialize the subscription manager (called once during deployment)
    fun init(ctx: &mut sui::tx_context::TxContext) {
        let deployer = sui::tx_context::sender(ctx);
        
        let manager = SubscriptionManager {
            id: sui::object::new(ctx),
            deployer,
            user_subscriptions: table::new(ctx),
            agent_wallets: table::new(ctx),
            withdrawal_requests: table::new(ctx),
        };
        
        // Create deployer capability
        let deployer_cap = DeployerCap {
            id: sui::object::new(ctx),
        };
        
        sui::transfer::transfer(deployer_cap, deployer);
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
            subscription_id: sui::object::id(&subscription),  // ADD THIS LINE
            subscriber,
            subscription_fee_paid: subscription_fee,
            subscription_end,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx),
        });
        
        // Share subscription object
        sui::transfer::share_object(subscription);
    }

    /// Update agent wallet address (deployer only)
    public entry fun update_agent_wallet(
        _cap: &DeployerCap,
        manager: &mut SubscriptionManager,
        agent_id: sui::object::ID,
        new_wallet_address: address,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let old_wallet = if (table::contains(&manager.agent_wallets, agent_id)) {
            let wallet_info = table::borrow(&manager.agent_wallets, agent_id);
            wallet_info.wallet_address
        } else {
            @0x0
        };

        if (table::contains(&mut manager.agent_wallets, agent_id)) {
            let wallet_info = table::borrow_mut(&mut manager.agent_wallets, agent_id);
            wallet_info.wallet_address = new_wallet_address;
        } else {
            let new_wallet = AgentWallet {
                wallet_address: new_wallet_address,
                total_deposited: 0,
                user_deposits: table::new(ctx),
            };
            table::add(&mut manager.agent_wallets, agent_id, new_wallet);
        };

        event::emit(AgentWalletUpdated {
            agent_id,
            old_wallet,
            new_wallet: new_wallet_address,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Deposit funds for a specific agent (only subscribed users)
    public entry fun deposit_to_agent(
        manager: &mut SubscriptionManager,
        agent_id: sui::object::ID,
        payment: Coin<SUI>,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let user = sui::tx_context::sender(ctx);
        let amount = coin::value(&payment);
        
        // Check user is subscribed to the agent
        let key = generate_subscription_key(agent_id, user);
        assert!(table::contains(&manager.user_subscriptions, key), ENotSubscribed);
        
        // Ensure agent wallet is set
        assert!(table::contains(&manager.agent_wallets, agent_id), EAgentWalletNotSet);
        
        // Get agent wallet info
        let wallet_info = table::borrow_mut(&mut manager.agent_wallets, agent_id);
        
        // Update deposits tracking
        if (table::contains(&wallet_info.user_deposits, user)) {
            let current_deposit = table::borrow_mut(&mut wallet_info.user_deposits, user);
            *current_deposit = *current_deposit + amount;
        } else {
            table::add(&mut wallet_info.user_deposits, user, amount);
        };
        
        wallet_info.total_deposited = wallet_info.total_deposited + amount;
        
        // Transfer funds directly to agent wallet
        sui::transfer::public_transfer(payment, wallet_info.wallet_address);
        
        event::emit(UserDeposited {
            agent_id,
            user,
            amount,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Withdraw funds (only to subscribed users, can't exceed deposited amount)
    public entry fun withdraw_from_agent(
        manager: &mut SubscriptionManager,
        agent_id: sui::object::ID,
        withdrawal_amount: u64,
        recipient: address,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let sender = sui::tx_context::sender(ctx);
        
        // Check recipient is subscribed to the agent
        let key = generate_subscription_key(agent_id, recipient);
        assert!(table::contains(&manager.user_subscriptions, key), ENotSubscribed);
        
        // Ensure agent wallet is set
        assert!(table::contains(&manager.agent_wallets, agent_id), EAgentWalletNotSet);
        
        let wallet_info = table::borrow_mut(&mut manager.agent_wallets, agent_id);
        
        // Check user has deposited funds
        assert!(table::contains(&wallet_info.user_deposits, recipient), EInsufficientDeposit);
        
        let user_deposited = table::borrow_mut(&mut wallet_info.user_deposits, recipient);
        
        // Ensure withdrawal doesn't exceed deposited amount
        assert!(withdrawal_amount <= *user_deposited, EExceedsDepositedAmount);
        
        // Update deposits tracking
        *user_deposited = *user_deposited - withdrawal_amount;
        wallet_info.total_deposited = wallet_info.total_deposited - withdrawal_amount;
        
        // Note: This function only validates the withdrawal
        // Actual fund transfer should be handled by the agent's TEE wallet
    }

    /// Check agent wallet SUI balance (external call needed)
    public fun get_agent_wallet_address(manager: &SubscriptionManager, agent_id: sui::object::ID): address {
        assert!(table::contains(&manager.agent_wallets, agent_id), EAgentWalletNotSet);
        let wallet_info = table::borrow(&manager.agent_wallets, agent_id);
        wallet_info.wallet_address
    }

    /// Calculate profit for an agent (total_balance - total_deposited)
    public fun calculate_agent_profit(
        manager: &SubscriptionManager,
        agent_id: sui::object::ID,
        current_balance: u64
    ): u64 {
        assert!(table::contains(&manager.agent_wallets, agent_id), EAgentWalletNotSet);
        let wallet_info = table::borrow(&manager.agent_wallets, agent_id);
        
        if (current_balance > wallet_info.total_deposited) {
            current_balance - wallet_info.total_deposited
        } else {
            0
        }
    }

    /// Claim rewards based on user deposit ratio
    public entry fun claim_rewards(
        manager: &SubscriptionManager,
        agent_id: sui::object::ID,
        current_balance: u64,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let user = sui::tx_context::sender(ctx);
        
        // Check user is subscribed
        let key = generate_subscription_key(agent_id, user);
        assert!(table::contains(&manager.user_subscriptions, key), ENotSubscribed);
        
        assert!(table::contains(&manager.agent_wallets, agent_id), EAgentWalletNotSet);
        
        let wallet_info = table::borrow(&manager.agent_wallets, agent_id);
        
        // Check user has deposited funds
        assert!(table::contains(&wallet_info.user_deposits, user), EInsufficientDeposit);
        
        let user_deposited = *table::borrow(&wallet_info.user_deposits, user);
        let total_profit = calculate_agent_profit(manager, agent_id, current_balance);
        
        assert!(total_profit > 0, ENoRewardsAvailable);
        
        // Calculate user's share of rewards based on deposit ratio
        let user_reward = (user_deposited * total_profit) / wallet_info.total_deposited;
        let user_deposit_share = (user_deposited * 10000) / wallet_info.total_deposited; // Basis points
        
        event::emit(RewardsClaimed {
            agent_id,
            user,
            reward_amount: user_reward,
            user_deposit_share,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx),
        });
        
        // Note: Actual reward distribution should be handled by the agent's TEE wallet
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

    /// Get user's deposited amount for a specific agent
    public fun get_user_deposit(
        manager: &SubscriptionManager,
        agent_id: sui::object::ID,
        user: address
    ): u64 {
        if (!table::contains(&manager.agent_wallets, agent_id)) {
            return 0
        };
        
        let wallet_info = table::borrow(&manager.agent_wallets, agent_id);
        
        if (table::contains(&wallet_info.user_deposits, user)) {
            *table::borrow(&wallet_info.user_deposits, user)
        } else {
            0
        }
    }

    /// Get agent's total deposited amount
    public fun get_agent_total_deposited(
        manager: &SubscriptionManager,
        agent_id: sui::object::ID
    ): u64 {
        if (!table::contains(&manager.agent_wallets, agent_id)) {
            return 0
        };
        
        let wallet_info = table::borrow(&manager.agent_wallets, agent_id);
        wallet_info.total_deposited
    }

    /// Check if agent wallet is set
    public fun is_agent_wallet_set(
        manager: &SubscriptionManager,
        agent_id: sui::object::ID
    ): bool {
        table::contains(&manager.agent_wallets, agent_id)
    }

}

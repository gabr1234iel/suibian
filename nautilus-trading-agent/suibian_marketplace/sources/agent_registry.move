module suibian_marketplace::agent_registry {
    use std::string::String;
    use sui::event;

    // Error codes
    const ENotCreator: u64 = 1;
    const EAgentNotActive: u64 = 2;
    const EInvalidTEEKey: u64 = 3;

    /// Trading Agent struct - simple metadata
    public struct TradingAgent has key, store {
        id: sui::object::UID,
        name: String,
        description: String,
        subscription_fee_per_month: u64,        // SUI amount for monthly subscription
        min_deposit: u64,                       // Minimum trading deposit required
        max_deposit: u64,                       // Maximum trading deposit allowed
        tee_public_key: vector<u8>,             // TEE's public key for signature verification
        tee_wallet_address: address,            // TEE's wallet address for receiving funds
        creator: address,                       // Agent creator's address
        is_active: bool,                        // Whether agent accepts new subscriptions
        created_at: u64,                        // Creation timestamp
        total_subscribers: u64,                 // Current number of subscribers
    }

    /// Events
    public struct AgentCreated has copy, drop {
        agent_id: sui::object::ID,
        creator: address,
        name: String,
        subscription_fee: u64,
        tee_wallet_address: address,
        timestamp: u64,
    }

    public struct AgentStatusUpdated has copy, drop {
        agent_id: sui::object::ID,
        is_active: bool,
        timestamp: u64,
    }

    /// Create a new trading agent
    public entry fun create_agent(
        name: vector<u8>,
        description: vector<u8>,
        subscription_fee_per_month: u64,
        min_deposit: u64,
        max_deposit: u64,
        tee_public_key: vector<u8>,
        tee_wallet_address: address,
        ctx: &mut sui::tx_context::TxContext
    ) {
        // Validate TEE public key (basic length check)
        assert!(std::vector::length(&tee_public_key) == 32, EInvalidTEEKey);
        
        let agent = TradingAgent {
            id: sui::object::new(ctx),
            name: std::string::utf8(name),
            description: std::string::utf8(description),
            subscription_fee_per_month,
            min_deposit,
            max_deposit,
            tee_public_key,
            tee_wallet_address,
            creator: sui::tx_context::sender(ctx),
            is_active: true,
            created_at: sui::tx_context::epoch_timestamp_ms(ctx),
            total_subscribers: 0,
        };

        let agent_id = sui::object::id(&agent);

        // Emit creation event
        event::emit(AgentCreated {
            agent_id,
            creator: agent.creator,
            name: agent.name,
            subscription_fee: agent.subscription_fee_per_month,
            tee_wallet_address: agent.tee_wallet_address,
            timestamp: agent.created_at,
        });

        // Make agent discoverable by sharing the object
        sui::transfer::share_object(agent);
    }

    /// Update agent status (activate/deactivate)
    public entry fun update_agent_status(
        agent: &mut TradingAgent,
        is_active: bool,
        ctx: &mut sui::tx_context::TxContext
    ) {
        // Only creator can update status
        assert!(agent.creator == sui::tx_context::sender(ctx), ENotCreator);
        
        agent.is_active = is_active;

        // Emit status update event
        event::emit(AgentStatusUpdated {
            agent_id: sui::object::id(agent),
            is_active,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Update agent metadata (only creator)
    public entry fun update_agent_metadata(
        agent: &mut TradingAgent,
        mut name: std::option::Option<vector<u8>>,
        mut description: std::option::Option<vector<u8>>,
        mut subscription_fee: std::option::Option<u64>,
        ctx: &mut sui::tx_context::TxContext
    ) {
        assert!(agent.creator == sui::tx_context::sender(ctx), ENotCreator);

        if (std::option::is_some(&name)) {
            agent.name = std::string::utf8(std::option::extract(&mut name));
        };

        if (std::option::is_some(&description)) {
            agent.description = std::string::utf8(std::option::extract(&mut description));
        };

        if (std::option::is_some(&subscription_fee)) {
            agent.subscription_fee_per_month = std::option::extract(&mut subscription_fee);
        };
    }

    /// Increment subscriber count (called by SubscriptionManager)
    public(package) fun increment_subscribers(agent: &mut TradingAgent) {
        agent.total_subscribers = agent.total_subscribers + 1;
    }

    /// Decrement subscriber count (called by SubscriptionManager)
    public(package) fun decrement_subscribers(agent: &mut TradingAgent) {
        if (agent.total_subscribers > 0) {
            agent.total_subscribers = agent.total_subscribers - 1;
        };
    }

    /// View functions
    public fun get_agent_info(agent: &TradingAgent): (
        String, String, u64, u64, u64, vector<u8>, address, address, bool, u64, u64
    ) {
        (
            agent.name,
            agent.description,
            agent.subscription_fee_per_month,
            agent.min_deposit,
            agent.max_deposit,
            agent.tee_public_key,
            agent.tee_wallet_address,
            agent.creator,
            agent.is_active,
            agent.created_at,
            agent.total_subscribers
        )
    }

    public fun is_agent_active(agent: &TradingAgent): bool {
        agent.is_active
    }

    public fun get_tee_public_key(agent: &TradingAgent): vector<u8> {
        agent.tee_public_key
    }

    public fun get_tee_wallet_address(agent: &TradingAgent): address {
        agent.tee_wallet_address
    }

    public fun get_subscription_fee(agent: &TradingAgent): u64 {
        agent.subscription_fee_per_month
    }

    public fun get_deposit_limits(agent: &TradingAgent): (u64, u64) {
        (agent.min_deposit, agent.max_deposit)
    }
}
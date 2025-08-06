module avs_on_chain::types {
    use std::string::String;

    // Send data structure
        public struct TradeData has store, copy, drop {
        action: String,        // "TRANSFER"
        amount: u64,           // 100000000 (0.1 SUI)
        recipient: address,    // 0x39a36b6d...
        sender: address,       // 0x91d6de6a...
        timestamp: u64,
        agent_id: String,
    }

    // Task status constants
    public fun pending(): u8 { 0 }
    public fun active(): u8 { 1 }
    public fun completed(): u8 { 2 }
    public fun expired(): u8 { 3 }

    // Constructor for TradeData
    public fun new_trade_data(
        action: String,
        amount: u64,
        recipient: address,
        sender: address,
        timestamp: u64,
        agent_id: String,
    ): TradeData {
        TradeData {
            action,
            amount,
            recipient,
            sender,
            timestamp,
            agent_id,
        }
    }

    // Getters for TradeData
    public fun get_action(trade: &TradeData): String { trade.action }
    public fun get_amount(trade: &TradeData): u64 { trade.amount }
    public fun get_recipient(trade: &TradeData): address { trade.recipient }
    public fun get_sender(trade: &TradeData): address { trade.sender }
    public fun get_timestamp(trade: &TradeData): u64 { trade.timestamp }
    public fun get_agent_id(trade: &TradeData): String { trade.agent_id }
}
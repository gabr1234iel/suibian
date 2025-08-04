module avs_on_chain::types {
    use std::string::String;

    // Trade data structure
    public struct TradeData has store, copy, drop {
        action: String,        // "BUY" or "SELL"
        amount_in: u64,
        amount_out: u64,
        asset_pair: String,    // "SUI/USDC"
        price: u64,
        timestamp: u64,
        agent_id: String,
    }

    // Validation vote
    public struct ValidationVote has store, copy, drop {
        validator: address,
        vote: bool,           // true = approve, false = reject
        timestamp: u64,
        confidence: u64,      // 0-100 confidence score
    }

    // Constructor for ValidationVote
    public fun new_validation_vote(
        validator: address,
        vote: bool,
        timestamp: u64,
        confidence: u64,
    ): ValidationVote {
        ValidationVote {
            validator,
            vote,
            timestamp,
            confidence,
        }
    }

    // Task status constants
    public fun pending(): u8 { 0 }
    public fun active(): u8 { 1 }
    public fun completed(): u8 { 2 }
    public fun expired(): u8 { 3 }

    // Constructor for TradeData
    public fun new_trade_data(
        action: String,
        amount_in: u64,
        amount_out: u64,
        asset_pair: String,
        price: u64,
        timestamp: u64,
        agent_id: String,
    ): TradeData {
        TradeData {
            action,
            amount_in,
            amount_out,
            asset_pair,
            price,
            timestamp,
            agent_id,
        }
    }

    // Getters for TradeData
    public fun get_action(trade: &TradeData): String { trade.action }
    public fun get_amount_in(trade: &TradeData): u64 { trade.amount_in }
    public fun get_agent_id(trade: &TradeData): String { trade.agent_id }

    // Getters for ValidationVote
    public fun get_vote(validation_vote: &ValidationVote): bool {
        validation_vote.vote
    }

    public fun get_validator(validation_vote: &ValidationVote): address {
        validation_vote.validator
    }

    public fun get_timestamp(validation_vote: &ValidationVote): u64 {
        validation_vote.timestamp
    }

    public fun get_confidence(validation_vote: &ValidationVote): u64 {
        validation_vote.confidence
    }
}
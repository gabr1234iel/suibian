module avs_on_chain::validation_task {
    use sui::object::{Self, UID, ID};
    use sui::table::{Self, Table};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;
    use std::vector;
    use std::option::{Self, Option};
    use avs_on_chain::types::{Self, TradeData, ValidationVote};

    // Errors
    const ENotAssignedValidator: u64 = 1;
    const EAlreadyVoted: u64 = 2;
    const ETaskCompleted: u64 = 3;
    const ETaskExpired: u64 = 4;
    const EInvalidStatus: u64 = 5;

    public struct ValidationTask has key {
        id: UID,
        agent_id: String,
        trade_data: TradeData,
        assigned_validators: vector<address>,
        votes: Table<address, ValidationVote>,
        status: u8,
        consensus_result: Option<bool>,
        created_at: u64,
        deadline: u64,
        completed_at: Option<u64>,
    }

    // Events
    public struct TaskCreated has copy, drop {
        task_id: ID,
        agent_id: String,
        assigned_validators: vector<address>,
        deadline: u64,
    }

    public struct VoteSubmitted has copy, drop {
        task_id: ID,
        validator: address,
        vote: bool,
        timestamp: u64,
    }

    public struct TaskCompleted has copy, drop {
        task_id: ID,
        consensus_result: bool,
        total_votes: u64,
        approve_votes: u64,
    }

    // Create validation task
    public entry fun create_validation_task(
        agent_id: String,
        // Instead of TradeData struct, pass individual fields
        action: String,
        amount_in: u64,
        amount_out: u64,
        asset_pair: String,
        price: u64,
        timestamp: u64,
        assigned_validators: vector<address>,
        ctx: &mut TxContext
    ): ID {
        // Create TradeData inside the function
        let trade_data = types::new_trade_data(
            action,
            amount_in,
            amount_out,
            asset_pair,
            price,
            timestamp,
            agent_id,
        );

        let task = ValidationTask {
            id: object::new(ctx),
            agent_id,
            trade_data,
            assigned_validators,
            votes: table::new(ctx),
            status: types::pending(),
            consensus_result: option::none(),
            created_at: tx_context::epoch_timestamp_ms(ctx),
            deadline: tx_context::epoch_timestamp_ms(ctx) + 300000, // 5 minutes
            completed_at: option::none(),
        };

        let task_id = object::uid_to_inner(&task.id);

        event::emit(TaskCreated {
            task_id,
            agent_id: task.agent_id,
            assigned_validators: task.assigned_validators,
            deadline: task.deadline,
        });

        transfer::share_object(task);
        task_id
    }

    // Submit vote (only assigned validators)
    public entry fun submit_vote(
        task: &mut ValidationTask,
        vote: bool,
        confidence: u64,
        ctx: &mut TxContext
    ) {
        let validator = tx_context::sender(ctx);
        
        // Check validator is assigned
        assert!(vector::contains(&task.assigned_validators, &validator), ENotAssignedValidator);
        
        // Check hasn't voted already
        assert!(!table::contains(&task.votes, validator), EAlreadyVoted);
        
        // Check task is not completed or expired
        assert!(task.status != types::completed(), ETaskCompleted);
        assert!(task.status != types::expired(), ETaskExpired);

        // Create vote
        let validation_vote = types::new_validation_vote(
            validator,
            vote,
            tx_context::epoch_timestamp_ms(ctx),
            confidence,
        );

        // Record vote
        table::add(&mut task.votes, validator, validation_vote);
        
        // Update status to ACTIVE if first vote
        if (task.status == types::pending()) {
            task.status = types::active();
        };

        event::emit(VoteSubmitted {
            task_id: object::uid_to_inner(&task.id),
            validator,
            vote,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // Check if all validators have voted
    public fun has_all_votes(task: &ValidationTask): bool {
        table::length(&task.votes) == vector::length(&task.assigned_validators)
    }

    // Get vote counts
    public fun get_vote_counts(task: &ValidationTask): (u64, u64) {
        let mut approve_count = 0u64;
        let mut reject_count = 0u64;
        
        let mut i = 0;
        let validators = &task.assigned_validators;
        
        while (i < vector::length(validators)) {
            let validator = *vector::borrow(validators, i);
            
            if (table::contains(&task.votes, validator)) {
                let vote = table::borrow(&task.votes, validator);
                if (types::get_vote(vote)) {
                    approve_count = approve_count + 1;
                } else {
                    reject_count = reject_count + 1;
                }
            };
            
            i = i + 1;
        };
        
        (approve_count, reject_count)
    }

    // Complete task with consensus result
    public fun complete_task(
        task: &mut ValidationTask,
        consensus_result: bool,
        ctx: &mut TxContext
    ) {
        task.status = types::completed();
        task.consensus_result = option::some(consensus_result);
        task.completed_at = option::some(tx_context::epoch_timestamp_ms(ctx));

        let (approve_votes, _reject_votes) = get_vote_counts(task);

        event::emit(TaskCompleted {
            task_id: object::uid_to_inner(&task.id),
            consensus_result,
            total_votes: table::length(&task.votes),
            approve_votes,
        });
    }

    // Getters
    public fun get_assigned_validators(task: &ValidationTask): vector<address> {
        task.assigned_validators
    }

    public fun get_validator_vote(task: &ValidationTask, validator: address): bool {
        assert!(table::contains(&task.votes, validator), ENotAssignedValidator);
        let vote = table::borrow(&task.votes, validator);
        types::get_vote(vote)  // Use the getter function instead of direct access
    }

    public fun get_task_id(task: &ValidationTask): ID {
        object::uid_to_inner(&task.id)
    }

    public fun get_trade_data(task: &ValidationTask): TradeData {
        task.trade_data
    }

    public fun get_status(task: &ValidationTask): u8 {
        task.status
    }
}
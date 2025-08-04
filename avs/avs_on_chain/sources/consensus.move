module avs_on_chain::consensus {
    use sui::object::ID;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use avs_on_chain::validation_task::{Self, ValidationTask};

    // Events
    public struct ConsensusReached has copy, drop {
        task_id: ID,
        result: bool,
        approve_votes: u64,
        reject_votes: u64,
        total_votes: u64,
    }

    // Check and finalize consensus
    public entry fun check_consensus(
        task: &mut ValidationTask,
        ctx: &mut TxContext
    ) {
        // Must have all votes
        assert!(validation_task::has_all_votes(task), 0);
        
        let (approve_count, reject_count) = validation_task::get_vote_counts(task);
        let total_votes = approve_count + reject_count;
        
        // Simple majority rule
        let consensus_result = approve_count > reject_count;
        
        // Update task status
        validation_task::complete_task(task, consensus_result, ctx);
        
        event::emit(ConsensusReached {
            task_id: validation_task::get_task_id(task),
            result: consensus_result,
            approve_votes: approve_count,
            reject_votes: reject_count,
            total_votes,
        });
    }

    // Alternative: consensus with threshold (e.g., need 2/3 majority)
    public entry fun check_consensus_with_threshold(
        task: &mut ValidationTask,
        threshold_percent: u64, // e.g., 67 for 67%
        ctx: &mut TxContext
    ) {
        assert!(validation_task::has_all_votes(task), 0);
        
        let (approve_count, reject_count) = validation_task::get_vote_counts(task);
        let total_votes = approve_count + reject_count;
        
        // Check if approval meets threshold
        let approval_percent = (approve_count * 100) / total_votes;
        let consensus_result = approval_percent >= threshold_percent;
        
        validation_task::complete_task(task, consensus_result, ctx);
        
        event::emit(ConsensusReached {
            task_id: validation_task::get_task_id(task),
            result: consensus_result,
            approve_votes: approve_count,
            reject_votes: reject_count,
            total_votes,
        });
    }
}
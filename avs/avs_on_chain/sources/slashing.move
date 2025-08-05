module avs_on_chain::slashing {
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::event;
    use std::vector;
    use avs_on_chain::validator_registry::{Self, ValidatorRegistry};
    use avs_on_chain::validation_task::{Self, ValidationTask};

    // Errors
    const EInsufficientFunds: u64 = 1;
    const EInvalidSlashRate: u64 = 2;

    public struct SlashingManager has key {
        id: UID,
        insurance_fund: Balance<SUI>,
        base_reward: u64,        // Base reward per correct validation (in MIST)
        slash_rate: u64,         // Basis points (e.g., 500 = 5%)
        total_rewards_paid: u64,
        total_slashed: u64,
    }

    // Events
    public struct ValidatorRewarded has copy, drop {
        validator: address,
        reward_amount: u64,
        task_id: sui::object::ID,
    }

    public struct ValidatorSlashedEvent has copy, drop {
        validator: address,
        slash_amount: u64,
        task_id: sui::object::ID,
    }

    public struct InsuranceFundUpdated has copy, drop {
        added_amount: u64,
        new_total: u64,
    }

    // Initialize slashing manager
    fun init(ctx: &mut TxContext) {
        let manager = SlashingManager {
            id: object::new(ctx),
            insurance_fund: balance::zero(),
            base_reward: 10000000,  // 0.01 SUI
            slash_rate: 500,        // 5% = 500 basis points
            total_rewards_paid: 0,
            total_slashed: 0,
        };
        transfer::share_object(manager);
    }

    // NEW: Initialize insurance fund during deployment
    public entry fun initialize_insurance_fund(
        manager: &mut SlashingManager,
        initial_funds: Coin<SUI>,
        _ctx: &mut TxContext
    ) {
        let amount = coin::value(&initial_funds);
        balance::join(&mut manager.insurance_fund, coin::into_balance(initial_funds));
        
        event::emit(InsuranceFundUpdated {
            added_amount: amount,
            new_total: balance::value(&manager.insurance_fund),
        });
    }

    // Add funds to insurance fund
    public entry fun fund_insurance(
        manager: &mut SlashingManager,
        funds: Coin<SUI>,
        _ctx: &mut TxContext
    ) {
        let amount = coin::value(&funds);
        balance::join(&mut manager.insurance_fund, coin::into_balance(funds));
        
        event::emit(InsuranceFundUpdated {
            added_amount: amount,
            new_total: balance::value(&manager.insurance_fund),
        });
    }

    // IMPROVED: Execute rewards and slashing after consensus with insurance fund integration
    public entry fun execute_slashing(
        manager: &mut SlashingManager,
        registry: &mut ValidatorRegistry,
        task: &ValidationTask,
        consensus_result: bool,
        ctx: &mut TxContext
    ) {
        let assigned_validators = validation_task::get_assigned_validators(task);
        let task_id = validation_task::get_task_id(task);
        let mut i = 0;
        
        while (i < vector::length(&assigned_validators)) {
            let validator = *vector::borrow(&assigned_validators, i);
            let validator_vote = validation_task::get_validator_vote(task, validator);
            
            if (validator_vote == consensus_result) {
                // Correct vote - reward validator
                reward_validator(manager, registry, validator, task_id, ctx);
            } else {
                // Wrong vote - slash validator and add to insurance fund
                slash_validator_with_insurance(manager, registry, validator, task_id, ctx);
            };
            
            i = i + 1;
        };
    }

    // Reward correct validator
    fun reward_validator(
        manager: &mut SlashingManager,
        registry: &mut ValidatorRegistry,
        validator: address,
        task_id: sui::object::ID,
        ctx: &mut TxContext
    ) {
        // Update validator stats
        validator_registry::update_validator_stats(registry, validator, true);
        
        // Pay reward from insurance fund if available
        if (balance::value(&manager.insurance_fund) >= manager.base_reward) {
            let reward = balance::split(&mut manager.insurance_fund, manager.base_reward);
            let reward_coin = coin::from_balance(reward, ctx);
            transfer::public_transfer(reward_coin, validator);
            
            manager.total_rewards_paid = manager.total_rewards_paid + manager.base_reward;
            
            event::emit(ValidatorRewarded {
                validator,
                reward_amount: manager.base_reward,
                task_id,
            });
        };
    }

    // NEW: Slash incorrect validator and add slashed amount to insurance fund
    fun slash_validator_with_insurance(
        manager: &mut SlashingManager,
        registry: &mut ValidatorRegistry,
        validator: address,
        task_id: sui::object::ID,
        _ctx: &mut TxContext
    ) {
        let slash_amount = calculate_slash_amount(registry, validator, manager.slash_rate);
        
        // Execute the slash and get the slashed balance
        let slashed_balance = validator_registry::slash_validator_stake(registry, validator, slash_amount);
        
        // Add slashed amount to insurance fund
        balance::join(&mut manager.insurance_fund, slashed_balance);
        
        // Update validator stats
        validator_registry::update_validator_stats(registry, validator, false);
        
        manager.total_slashed = manager.total_slashed + slash_amount;
        
        event::emit(ValidatorSlashedEvent {
            validator,
            slash_amount,
            task_id,
        });
        
        event::emit(InsuranceFundUpdated {
            added_amount: slash_amount,
            new_total: balance::value(&manager.insurance_fund),
        });
    }

    // Calculate slash amount based on validator stake and slash rate
    fun calculate_slash_amount(
        registry: &ValidatorRegistry,
        validator: address,
        slash_rate: u64
    ): u64 {
        let stake = validator_registry::get_validator_stake(registry, validator);
        (stake * slash_rate) / 10000  // basis points calculation
    }

    // Update slash rate (governance function)
    public entry fun update_slash_rate(
        manager: &mut SlashingManager,
        new_rate: u64,
        _ctx: &mut TxContext
    ) {
        assert!(new_rate <= 2500, EInvalidSlashRate); // Max 25%
        manager.slash_rate = new_rate;
    }

    // Update base reward (governance function)
    public entry fun update_base_reward(
        manager: &mut SlashingManager,
        new_reward: u64,
        _ctx: &mut TxContext
    ) {
        manager.base_reward = new_reward;
    }

    // NEW: Emergency withdraw from insurance fund (governance function)
    public entry fun emergency_withdraw_insurance(
        manager: &mut SlashingManager,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(balance::value(&manager.insurance_fund) >= amount, EInsufficientFunds);
        
        let withdrawn = balance::split(&mut manager.insurance_fund, amount);
        let coin = coin::from_balance(withdrawn, ctx);
        transfer::public_transfer(coin, recipient);
    }

    // Getters
    public fun get_insurance_fund_balance(manager: &SlashingManager): u64 {
        balance::value(&manager.insurance_fund)
    }

    public fun get_slash_rate(manager: &SlashingManager): u64 {
        manager.slash_rate
    }

    public fun get_base_reward(manager: &SlashingManager): u64 {
        manager.base_reward
    }

    public fun get_total_rewards_paid(manager: &SlashingManager): u64 {
        manager.total_rewards_paid
    }

    public fun get_total_slashed(manager: &SlashingManager): u64 {
        manager.total_slashed
    }
}
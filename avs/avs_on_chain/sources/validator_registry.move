module avs_on_chain::validator_registry {
    use sui::object::{Self, UID};
    use sui::table::{Self, Table};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::vector;

    // Errors
    const EInsufficientStake: u64 = 1;
    const EValidatorNotFound: u64 = 2;
    const EValidatorAlreadyExists: u64 = 3;
    const EValidatorNotActive: u64 = 4;

    public struct ValidatorRegistry has key {
        id: UID,
        validators: Table<address, ValidatorInfo>,
        total_stake: Balance<SUI>,
        min_stake: u64,
        active_count: u64,
    }

    public struct ValidatorInfo has store {
        stake_amount: u64,
        reputation: u64,        // 0-100 score
        total_validations: u64,
        correct_validations: u64,
        is_active: bool,
        joined_at: u64,
    }

    // Events
    public struct ValidatorRegistered has copy, drop {
        validator: address,
        stake_amount: u64,
        timestamp: u64,
    }

    public struct ValidatorSlashed has copy, drop {
        validator: address,
        slash_amount: u64,
        new_stake: u64,
    }

    // Initialize the registry
    fun init(ctx: &mut TxContext) {
        let registry = ValidatorRegistry {
            id: object::new(ctx),
            validators: table::new(ctx),
            total_stake: balance::zero(),
            min_stake: 10000000, // 0.01 SUI minimum
            active_count: 0,
        };
        transfer::share_object(registry);
    }

    // Register as validator
    public entry fun register_validator(
        registry: &mut ValidatorRegistry,
        stake: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let validator = tx_context::sender(ctx);
        let stake_amount = coin::value(&stake);
        
        assert!(stake_amount >= registry.min_stake, EInsufficientStake);
        assert!(!table::contains(&registry.validators, validator), EValidatorAlreadyExists);

        let validator_info = ValidatorInfo {
            stake_amount,
            reputation: 100, // Start with perfect score
            total_validations: 0,
            correct_validations: 0,
            is_active: true,
            joined_at: tx_context::epoch_timestamp_ms(ctx),
        };

        table::add(&mut registry.validators, validator, validator_info);
        balance::join(&mut registry.total_stake, coin::into_balance(stake));
        registry.active_count = registry.active_count + 1;

        event::emit(ValidatorRegistered {
            validator,
            stake_amount,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // Check if address is active validator
    public fun is_active_validator(registry: &ValidatorRegistry, validator: address): bool {
        if (table::contains(&registry.validators, validator)) {
            let info = table::borrow(&registry.validators, validator);
            info.is_active
        } else {
            false
        }
    }

    // Get validator stake amount
    public fun get_validator_stake(registry: &ValidatorRegistry, validator: address): u64 {
        assert!(table::contains(&registry.validators, validator), EValidatorNotFound);
        let info = table::borrow(&registry.validators, validator);
        info.stake_amount
    }

    // Update validator stats after validation
    public fun update_validator_stats(
        registry: &mut ValidatorRegistry,
        validator: address,
        was_correct: bool,
    ) {
        assert!(table::contains(&registry.validators, validator), EValidatorNotFound);
        let info = table::borrow_mut(&mut registry.validators, validator);
        
        info.total_validations = info.total_validations + 1;
        if (was_correct) {
            info.correct_validations = info.correct_validations + 1;
        };
        
        // Update reputation (simplified calculation)
        info.reputation = (info.correct_validations * 100) / info.total_validations;
    }

    // Slash validator stake
    public fun slash_validator_stake(
        registry: &mut ValidatorRegistry,
        validator: address,
        slash_amount: u64,
    ) {
        assert!(table::contains(&registry.validators, validator), EValidatorNotFound);
        let info = table::borrow_mut(&mut registry.validators, validator);
        
        if (slash_amount >= info.stake_amount) {
            info.stake_amount = 0;
            info.is_active = false;
            registry.active_count = registry.active_count - 1;
        } else {
            info.stake_amount = info.stake_amount - slash_amount;
        };

        event::emit(ValidatorSlashed {
            validator,
            slash_amount,
            new_stake: info.stake_amount,
        });
    }

    // Get all validators (simplified - in practice would need pagination)
    public fun get_all_validators(registry: &ValidatorRegistry): vector<address> {
        // In real implementation, iterate through table
        // For now, return empty vector
        vector::empty<address>()
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx);
    }
}
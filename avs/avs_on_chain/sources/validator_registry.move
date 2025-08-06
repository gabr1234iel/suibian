module avs_on_chain::validator_registry {
    use sui::object::{Self, UID};
    use sui::table::{Self, Table};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;

    // Errors
    const EInsufficientStake: u64 = 1;
    const EValidatorNotFound: u64 = 2;
    const EValidatorAlreadyExists: u64 = 3;
    const EValidatorNotActive: u64 = 4;
    const EValidatorStillActive: u64 = 5;
    const EInsufficientStakeForWithdrawal: u64 = 6;

    public struct ValidatorRegistry has key {
        id: UID,
        validators: Table<address, ValidatorInfo>,
        total_stake: Balance<SUI>,
        min_stake: u64,
        active_count: u64,
    }

    public struct ValidatorInfo has store, drop {
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

    public struct ValidatorDeactivated has copy, drop {
        validator: address,
        timestamp: u64,
    }

    public struct ValidatorStakeWithdrawn has copy, drop {
        validator: address,
        withdrawn_amount: u64,
        remaining_stake: u64,
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
        transfer::share_object(registry); // Makes registry accessible to all validators
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

    // NEW: Deactivate validator (required before withdrawal)
    public entry fun deactivate_validator(
        registry: &mut ValidatorRegistry,
        ctx: &mut TxContext
    ) {
        let validator = tx_context::sender(ctx);
        
        assert!(table::contains(&registry.validators, validator), EValidatorNotFound);
        
        let info = table::borrow_mut(&mut registry.validators, validator);
        assert!(info.is_active, EValidatorNotActive);
        
        info.is_active = false;
        registry.active_count = registry.active_count - 1;
        
        event::emit(ValidatorDeactivated {
            validator,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // NEW: Withdraw stake (only for deactivated validators)
    public entry fun withdraw_stake(
        registry: &mut ValidatorRegistry,
        withdrawal_amount: u64,
        ctx: &mut TxContext
    ) {
        let validator = tx_context::sender(ctx);
        
        assert!(table::contains(&registry.validators, validator), EValidatorNotFound);
        
        let info = table::borrow_mut(&mut registry.validators, validator);
        assert!(!info.is_active, EValidatorStillActive);
        assert!(info.stake_amount >= withdrawal_amount, EInsufficientStakeForWithdrawal);
        
        // Update validator stake
        info.stake_amount = info.stake_amount - withdrawal_amount;
        
        // Transfer stake back to validator
        let withdrawn_balance = balance::split(&mut registry.total_stake, withdrawal_amount);
        let withdrawn_coin = coin::from_balance(withdrawn_balance, ctx);
        transfer::public_transfer(withdrawn_coin, validator);
        
        event::emit(ValidatorStakeWithdrawn {
            validator,
            withdrawn_amount: withdrawal_amount,  // Map parameter to struct field
            remaining_stake: info.stake_amount,
        });
        
        // If validator has no stake left, remove them
        if (info.stake_amount == 0) {
            table::remove(&mut registry.validators, validator);
        };
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

    // Check if validator exists in registry (regardless of active status)
    public fun validator_exists(registry: &ValidatorRegistry, validator: address): bool {
        table::contains(&registry.validators, validator)
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

    // MODIFIED: Slash validator stake and return slashed amount for insurance fund
    public fun slash_validator_stake(
        registry: &mut ValidatorRegistry,
        validator: address,
        slash_amount: u64,
    ): Balance<SUI> {
        assert!(table::contains(&registry.validators, validator), EValidatorNotFound);
        let info = table::borrow_mut(&mut registry.validators, validator);
        
        let actual_slash = if (slash_amount >= info.stake_amount) {
            let slashed = info.stake_amount;
            info.stake_amount = 0;
            info.is_active = false;
            registry.active_count = registry.active_count - 1;
            slashed
        } else {
            info.stake_amount = info.stake_amount - slash_amount;
            slash_amount
        };

        event::emit(ValidatorSlashed {
            validator,
            slash_amount: actual_slash,
            new_stake: info.stake_amount,
        });

        // Return the slashed balance for insurance fund
        balance::split(&mut registry.total_stake, actual_slash)
    }

    // Get all validators (simplified - in practice would need pagination)
    public fun get_all_validators(registry: &ValidatorRegistry): vector<address> {
        // In real implementation, iterate through table
        // For now, return empty vector
        vector::empty<address>()
    }

    // NEW: Get validator info for external queries
    public fun get_validator_info(registry: &ValidatorRegistry, validator: address): (u64, u64, u64, u64, bool) {
        assert!(table::contains(&registry.validators, validator), EValidatorNotFound);
        let info = table::borrow(&registry.validators, validator);
        (
            info.stake_amount,
            info.reputation,
            info.total_validations,
            info.correct_validations,
            info.is_active
        )
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx);
    }
}
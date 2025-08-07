module seal_policy::policy_manager {
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::event;
    use std::vector;

    // Error codes
    const ENotAuthorized: u64 = 1;
    const EPolicyNotFound: u64 = 2;
    const EPolicyAlreadyExists: u64 = 3;

    // Seal Policy object that defines encryption parameters
    public struct SealPolicy has key, store {
        id: UID,
        // The identity used for encryption (e.g., Google ID hash)
        identity: vector<u8>,
        // Threshold for decryption (number of key servers needed)
        threshold: u8,
        // The creator/owner of this policy
        creator: address,
        // Whether this policy is active
        active: bool,
    }

    // Cap object that gives permission to create policies
    public struct PolicyCap has key {
        id: UID,
        // The admin who can create policies
        admin: address,
    }

    // Events
    public struct PolicyCreated has copy, drop {
        policy_id: address,
        identity: vector<u8>,
        threshold: u8,
        creator: address,
    }

    public struct PolicyDeactivated has copy, drop {
        policy_id: address,
        identity: vector<u8>,
    }

    // Initialize the contract
    fun init(ctx: &mut TxContext) {
        // Create the admin capability
        let cap = PolicyCap {
            id: object::new(ctx),
            admin: @0x0c92849ffc05b564fd93b5046ff294f5191972f065ceb802207d72621bfc5b98,
        };
        
        // Transfer the capability to the admin (your address)
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    // Create a new Seal policy for encryption
    public entry fun create_policy(
        _cap: &PolicyCap,
        identity: vector<u8>,
        threshold: u8,
        ctx: &mut TxContext
    ) {
        // Security check - only the admin can create policies
        assert!(tx_context::sender(ctx) == _cap.admin, ENotAuthorized);
        
        // Create the policy object
        let policy = SealPolicy {
            id: object::new(ctx),
            identity,
            threshold,
            creator: tx_context::sender(ctx),
            active: true,
        };

        let policy_id = object::uid_to_address(&policy.id);

        // Emit event
        event::emit(PolicyCreated {
            policy_id,
            identity,
            threshold,
            creator: tx_context::sender(ctx),
        });

        // Share the policy object so it can be accessed by anyone
        transfer::share_object(policy);
    }

    // Deactivate a policy
    public entry fun deactivate_policy(
        _cap: &PolicyCap,
        policy: &mut SealPolicy,
        ctx: &mut TxContext
    ) {
        // Security check
        assert!(tx_context::sender(ctx) == _cap.admin, ENotAuthorized);
        
        policy.active = false;

        // Emit event
        event::emit(PolicyDeactivated {
            policy_id: object::uid_to_address(&policy.id),
            identity: policy.identity,
        });
    }

    // Seal access control - this is the key function for Seal integration
    public entry fun seal_approve(
        policy: &SealPolicy,
        requested_identity: vector<u8>,
        ctx: &TxContext
    ) {
        // Verify the policy is active
        assert!(policy.active, EPolicyNotFound);
        
        // Verify the requested identity matches the policy identity
        assert!(policy.identity == requested_identity, ENotAuthorized);
        
        // Additional access controls can be added here:
        // - Time-based restrictions
        // - Address-based permissions
        // - Usage limits
        // - etc.
        
        // If we reach here, access is approved
        // The Seal client will use this approval for encryption/decryption
    }

    // Getter functions
    public fun get_policy_identity(policy: &SealPolicy): vector<u8> {
        policy.identity
    }

    public fun get_policy_threshold(policy: &SealPolicy): u8 {
        policy.threshold
    }

    public fun is_policy_active(policy: &SealPolicy): bool {
        policy.active
    }

    public fun get_policy_creator(policy: &SealPolicy): address {
        policy.creator
    }
}
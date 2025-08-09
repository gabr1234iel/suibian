// In mock_tee_dapp/sources/logic.move

module mock_tee_dapp::logic {
    // NOTE: Most 'use' statements are removed because the new compiler
    // automatically brings standard modules into scope.
    use sui::object::{UID};
    use sui::tx_context::{TxContext};
    use sui::transfer;
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::ed25519;

    // --- Error Constants ---
    const ESignatureInvalid: u64 = 0;
    const EJobNotPending: u64 = 1;

    // --- Objects ---

    // A shared object holding the public key of our trusted "Mock HSM"
    public struct TrustedSigner has key {
        id: UID,
        // CHANGE: We store the raw public key bytes, not the address.
        // The ed25519_verify function requires the public key itself.
        signer_pk_bytes: vector<u8>
    }

    // The user's job request object
    public struct JobRequest has key, store {
        id: UID,
        user: address,
        input_data: vector<u8>,
        status: u8, // 0: Pending, 1: Completed
    }
    
    // --- Functions ---

    // NOTE: The 'entry' keyword was removed from public functions
    // as it is no longer needed.
    public fun initialize(
        // CHANGE: The function now takes the public key bytes.
        signer_pk_bytes: vector<u8>,
        ctx: &mut TxContext
    ) {
        transfer::share_object(TrustedSigner {
            id: object::new(ctx),
            signer_pk_bytes
        });
    }

    public fun request_job(input_data: vector<u8>, ctx: &mut TxContext) {
        transfer::transfer(
            JobRequest {
                id: object::new(ctx),
                user: tx_context::sender(ctx),
                input_data,
                status: 0, // Pending
            },
            tx_context::sender(ctx)
        );
    }

    public fun fulfill_job_and_pay(
        signer_info: &TrustedSigner,
        job: &mut JobRequest,
        payment: &mut Coin<SUI>,
        proof: vector<u8>,
        signature: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Step 1: Verify the signature from the Mock HSM
        // CHANGE: We now pass the raw public key bytes from our struct.
        let is_valid = ed25519::ed25519_verify(&signature, &proof, &signer_info.signer_pk_bytes);
        assert!(is_valid, ESignatureInvalid);

        // Step 2: Check job status
        assert!(job.status == 0, EJobNotPending);

        // Step 3: Execute payment
        // CHANGE: The coin::split function returns a new Coin object, not a Balance.
        let payment_for_user: Coin<SUI> = coin::split(payment, 1000, ctx); 
        transfer::public_transfer(payment_for_user, job.user);
        
        // Step 4: Update job status
        job.status = 1; // Completed
    }
}
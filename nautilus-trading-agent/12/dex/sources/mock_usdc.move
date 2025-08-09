module real_dex::mock_usdc {
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::url;
    use std::option;

    /// One-time witness for MOCK_USDC
    public struct MOCK_USDC has drop {}

    /// Initialize the MOCK_USDC token
    fun init(witness: MOCK_USDC, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<MOCK_USDC>(
            witness,
            6, // 6 decimals like real USDC
            b"MUSDC",
            b"Mock USDC",
            b"Mock USDC token for testing purposes",
            option::some(url::new_unsafe_from_bytes(b"https://example.com/usdc-icon.png")),
            ctx
        );

        // Transfer the treasury capability to the deployer
        transfer::public_transfer(treasury_cap, sui::tx_context::sender(ctx));
        
        // Freeze the metadata object (standard practice)
        transfer::public_freeze_object(metadata);
    }

    /// Public function to mint MOCK_USDC tokens (for testing)
    public fun mint(
        treasury_cap: &mut coin::TreasuryCap<MOCK_USDC>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    /// Burn MOCK_USDC tokens
    public fun burn(
        treasury_cap: &mut coin::TreasuryCap<MOCK_USDC>,
        coin: coin::Coin<MOCK_USDC>
    ) {
        coin::burn(treasury_cap, coin);
    }
}
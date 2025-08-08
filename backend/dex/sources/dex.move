/// Simple Mock DEX for SUI/USDC trading - Uses SUI transfers and USDC balance tracking
module mock_dex::dex {
    use sui::object::UID;
    use sui::tx_context::TxContext;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::event;
    use std::u64;

    // One-time witness for module
    public struct DEX has drop {}

    // Errors
    const EInsufficientLiquidity: u64 = 1;
    const ESlippageTooHigh: u64 = 2;
    const EZeroAmount: u64 = 3;
    const EInsufficientBalance: u64 = 4;

    // Pool with real SUI balance and virtual USDC tracking (no LP tokens)
    public struct Pool has key {
        id: UID,
        sui_reserve: Balance<SUI>,    // Real SUI stored in contract
        usdc_reserve: u64,            // Virtual USDC amount
        fee_rate: u64,
    }

    // User USDC balance tracker
    public struct UserBalance has key {
        id: UID,
        owner: address,
        usdc_balance: u64,
    }

    // LP Token (keeping struct but won't use)
    public struct LPToken has key, store {
        id: UID,
        pool_id: address,
        amount: u64,
    }

    // Events
    public struct SwapEvent has copy, drop {
        trader: address,
        token_in: vector<u8>,
        token_out: vector<u8>,
        amount_in: u64,
        amount_out: u64,
        fee: u64,
    }

    public struct LiquidityEvent has copy, drop {
        provider: address,
        action: vector<u8>,
        sui_amount: u64,
        usdc_amount: u64,
        lp_tokens: u64,
    }

    public struct MintEvent has copy, drop {
        recipient: address,
        amount: u64,
    }

    // Initialize module - creates empty pool
    fun init(otw: DEX, ctx: &mut TxContext) {
        let pool = Pool {
            id: sui::object::new(ctx),
            sui_reserve: balance::zero<SUI>(),
            usdc_reserve: 0,
            fee_rate: 30, // 0.3%
        };

        transfer::share_object(pool);

        event::emit(LiquidityEvent {
            provider: sui::tx_context::sender(ctx),
            action: b"init",
            sui_amount: 0,
            usdc_amount: 0,
            lp_tokens: 0,
        });
    }

    // Create user balance for USDC tracking - transfers to sender automatically
    public fun create_user_balance(ctx: &mut TxContext) {
        let user_balance = UserBalance {
            id: sui::object::new(ctx),
            owner: sui::tx_context::sender(ctx),
            usdc_balance: 0,
        };
        
        // Transfer to sender automatically
        transfer::transfer(user_balance, sui::tx_context::sender(ctx));
    }

    // Bootstrap pool with SUI (creates initial virtual USDC) - simple, no LP tokens
    public fun bootstrap_pool(
        pool: &mut Pool,
        sui_coin: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sui_amount = coin::value(&sui_coin);
        
        assert!(sui_amount > 0, EZeroAmount);
        assert!(balance::value(&pool.sui_reserve) == 0, 0); // Must be first bootstrap

        // Calculate USDC amount: 1.8 USDC per SUI (micro-USDC)
        let sui_in_units = sui_amount / 1000000000; // Convert MIST to SUI
        let usdc_amount = sui_in_units * 1800000; // 1.8 USDC in micro-USDC
        
        // Add SUI to pool's balance
        balance::join(&mut pool.sui_reserve, coin::into_balance(sui_coin));
        pool.usdc_reserve = usdc_amount;

        event::emit(LiquidityEvent {
            provider: sui::tx_context::sender(ctx),
            action: b"bootstrap",
            sui_amount,
            usdc_amount,
            lp_tokens: 0, // No LP tokens
        });
    }

    // Mint USDC to user balance (for testing)
    public fun mint_usdc_to_user(
        user_balance: &mut UserBalance,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(user_balance.owner == sui::tx_context::sender(ctx), EInsufficientBalance);
        user_balance.usdc_balance = user_balance.usdc_balance + amount;
        
        event::emit(MintEvent {
            recipient: sui::tx_context::sender(ctx),
            amount,
        });
    }

    // Swap SUI for USDC - User sends SUI, gets USDC balance
    public fun swap_sui_to_usdc(
        pool: &mut Pool,
        user_balance: &mut UserBalance,
        sui_coin: Coin<SUI>,
        min_usdc_out: u64,
        ctx: &mut TxContext
    ) {
        let sui_amount = coin::value(&sui_coin);
        assert!(sui_amount > 0, EZeroAmount);
        assert!(user_balance.owner == sui::tx_context::sender(ctx), EInsufficientBalance);
        
        let sui_reserve = balance::value(&pool.sui_reserve);
        let usdc_reserve = pool.usdc_reserve;
        
        let fee = (sui_amount * pool.fee_rate) / 10000;
        let sui_after_fee = sui_amount - fee;
        let usdc_out = (usdc_reserve * sui_after_fee) / (sui_reserve + sui_after_fee);
        
        assert!(usdc_out >= min_usdc_out, ESlippageTooHigh);
        assert!(usdc_out < usdc_reserve, EInsufficientLiquidity);
        
        // Add SUI to pool, give USDC to user
        balance::join(&mut pool.sui_reserve, coin::into_balance(sui_coin));
        pool.usdc_reserve = usdc_reserve - usdc_out;
        user_balance.usdc_balance = user_balance.usdc_balance + usdc_out;
        
        event::emit(SwapEvent {
            trader: sui::tx_context::sender(ctx),
            token_in: b"SUI",
            token_out: b"USDC",
            amount_in: sui_amount,
            amount_out: usdc_out,
            fee,
        });
    }

    // Swap USDC for SUI - User burns USDC balance, gets SUI coin
    public fun swap_usdc_to_sui(
        pool: &mut Pool,
        user_balance: &mut UserBalance,
        usdc_amount: u64,
        min_sui_out: u64,
        ctx: &mut TxContext
    ): Coin<SUI> {
        assert!(usdc_amount > 0, EZeroAmount);
        assert!(user_balance.owner == sui::tx_context::sender(ctx), EInsufficientBalance);
        assert!(user_balance.usdc_balance >= usdc_amount, EInsufficientBalance);
        
        let sui_reserve = balance::value(&pool.sui_reserve);
        let usdc_reserve = pool.usdc_reserve;
        
        let fee = (usdc_amount * pool.fee_rate) / 10000;
        let usdc_after_fee = usdc_amount - fee;
        let sui_out = (sui_reserve * usdc_after_fee) / (usdc_reserve + usdc_after_fee);
        
        assert!(sui_out >= min_sui_out, ESlippageTooHigh);
        assert!(sui_out < sui_reserve, EInsufficientLiquidity);
        
        // Remove SUI from pool, burn user's USDC
        let sui_balance = balance::split(&mut pool.sui_reserve, sui_out);
        pool.usdc_reserve = usdc_reserve + usdc_amount;
        user_balance.usdc_balance = user_balance.usdc_balance - usdc_amount;
        
        event::emit(SwapEvent {
            trader: sui::tx_context::sender(ctx),
            token_in: b"USDC",
            token_out: b"SUI",
            amount_in: usdc_amount,
            amount_out: sui_out,
            fee,
        });
        
        // Convert balance back to coin and return to user
        coin::from_balance(sui_balance, ctx)
    }

    // Get pool reserves
    public fun get_reserves(pool: &Pool): (u64, u64) {
        (balance::value(&pool.sui_reserve), pool.usdc_reserve)
    }

    // Get user USDC balance
    public fun get_usdc_balance(user_balance: &UserBalance): u64 {
        user_balance.usdc_balance
    }

    // Get pool price (USDC per SUI)
    public fun get_price(pool: &Pool): (u64, u64) {
        (pool.usdc_reserve, balance::value(&pool.sui_reserve))
    }
}
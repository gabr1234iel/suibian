module real_dex::dex {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::event;
    use real_dex::mock_usdc::MOCK_USDC;

    /// One-time witness for module
    public struct DEX has drop {}

    /// Errors
    const EInsufficientLiquidity: u64 = 1;
    const ESlippageTooHigh: u64 = 2;
    const EZeroAmount: u64 = 3;

    /// Pool with real SUI and MOCK_USDC balances
    public struct Pool has key {
        id: UID,
        sui_reserve: Balance<SUI>,
        usdc_reserve: Balance<MOCK_USDC>,
        fee_rate: u64, // Fee in basis points (30 = 0.3%)
        total_lp_supply: u64,
    }

    /// LP Token for liquidity providers
    public struct LPToken has key, store {
        id: UID,
        pool_id: ID,
        amount: u64,
    }

    /// DEX Admin Cap for minting test tokens
    public struct AdminCap has key {
        id: UID,
    }

    /// Events
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
        token: vector<u8>,
        amount: u64,
    }

    /// Initialize module - creates empty pool and admin cap
    fun init(_witness: DEX, ctx: &mut TxContext) {
        let pool = Pool {
            id: object::new(ctx),
            sui_reserve: balance::zero<SUI>(),
            usdc_reserve: balance::zero<MOCK_USDC>(),
            fee_rate: 30, // 0.3%
            total_lp_supply: 0,
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(pool);
        transfer::transfer(admin_cap, sui::tx_context::sender(ctx));

        event::emit(LiquidityEvent {
            provider: sui::tx_context::sender(ctx),
            action: b"init",
            sui_amount: 0,
            usdc_amount: 0,
            lp_tokens: 0,
        });
    }

    /// Mint MOCK_USDC tokens for testing (admin only)
    public fun mint_usdc_for_testing(
        _admin_cap: &AdminCap,
        treasury_cap: &mut TreasuryCap<MOCK_USDC>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let usdc_coin = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(usdc_coin, recipient);
        
        event::emit(MintEvent {
            recipient,
            token: b"MOCK_USDC",
            amount,
        });
    }

    /// Add liquidity to the pool
    public fun add_liquidity(
        pool: &mut Pool,
        sui_coin: Coin<SUI>,
        usdc_coin: Coin<MOCK_USDC>,
        min_lp_tokens: u64,
        ctx: &mut TxContext
    ): LPToken {
        let sui_amount = coin::value(&sui_coin);
        let usdc_amount = coin::value(&usdc_coin);
        
        assert!(sui_amount > 0 && usdc_amount > 0, EZeroAmount);
        
        let sui_reserve = balance::value(&pool.sui_reserve);
        let usdc_reserve = balance::value(&pool.usdc_reserve);
        let total_supply = pool.total_lp_supply;
        
        let lp_tokens = if (total_supply == 0) {
            // First liquidity provision - use geometric mean
            let lp_amount = sui_amount * usdc_amount / 1000000; // Simple calculation
            assert!(lp_amount >= min_lp_tokens, ESlippageTooHigh);
            lp_amount
        } else {
            // Subsequent liquidity - maintain ratio
            let sui_lp = (sui_amount * total_supply) / sui_reserve;
            let usdc_lp = (usdc_amount * total_supply) / usdc_reserve;
            let lp_amount = if (sui_lp < usdc_lp) { sui_lp } else { usdc_lp };
            assert!(lp_amount >= min_lp_tokens, ESlippageTooHigh);
            lp_amount
        };

        // Add coins to pool reserves
        balance::join(&mut pool.sui_reserve, coin::into_balance(sui_coin));
        balance::join(&mut pool.usdc_reserve, coin::into_balance(usdc_coin));
        pool.total_lp_supply = total_supply + lp_tokens;

        // Create LP token
        let lp_token = LPToken {
            id: object::new(ctx),
            pool_id: object::id(pool),
            amount: lp_tokens,
        };

        event::emit(LiquidityEvent {
            provider: sui::tx_context::sender(ctx),
            action: b"add",
            sui_amount,
            usdc_amount,
            lp_tokens,
        });

        lp_token
    }

    /// Remove liquidity from the pool
    public fun remove_liquidity(
        pool: &mut Pool,
        lp_token: LPToken,
        min_sui_out: u64,
        min_usdc_out: u64,
        ctx: &mut TxContext
    ): (Coin<SUI>, Coin<MOCK_USDC>) {
        let LPToken { id: lp_id, pool_id: _, amount: lp_amount } = lp_token;
        object::delete(lp_id);

        let sui_reserve = balance::value(&pool.sui_reserve);
        let usdc_reserve = balance::value(&pool.usdc_reserve);
        let total_supply = pool.total_lp_supply;

        assert!(lp_amount > 0, EZeroAmount);
        assert!(total_supply > 0, EInsufficientLiquidity);

        // Calculate withdrawal amounts proportionally
        let sui_out = (sui_reserve * lp_amount) / total_supply;
        let usdc_out = (usdc_reserve * lp_amount) / total_supply;

        assert!(sui_out >= min_sui_out, ESlippageTooHigh);
        assert!(usdc_out >= min_usdc_out, ESlippageTooHigh);

        // Remove from reserves
        let sui_balance = balance::split(&mut pool.sui_reserve, sui_out);
        let usdc_balance = balance::split(&mut pool.usdc_reserve, usdc_out);
        pool.total_lp_supply = total_supply - lp_amount;

        event::emit(LiquidityEvent {
            provider: sui::tx_context::sender(ctx),
            action: b"remove",
            sui_amount: sui_out,
            usdc_amount: usdc_out,
            lp_tokens: lp_amount,
        });

        (coin::from_balance(sui_balance, ctx), coin::from_balance(usdc_balance, ctx))
    }

    /// Swap SUI for USDC
    public fun swap_sui_to_usdc(
        pool: &mut Pool,
        sui_coin: Coin<SUI>,
        min_usdc_out: u64,
        ctx: &mut TxContext
    ): Coin<MOCK_USDC> {
        let sui_amount = coin::value(&sui_coin);
        assert!(sui_amount > 0, EZeroAmount);
        
        let sui_reserve = balance::value(&pool.sui_reserve);
        let usdc_reserve = balance::value(&pool.usdc_reserve);
        
        assert!(sui_reserve > 0 && usdc_reserve > 0, EInsufficientLiquidity);
        
        // Calculate fee and output using constant product formula
        let fee = (sui_amount * pool.fee_rate) / 10000;
        let sui_after_fee = sui_amount - fee;
        let usdc_out = (usdc_reserve * sui_after_fee) / (sui_reserve + sui_after_fee);
        
        assert!(usdc_out >= min_usdc_out, ESlippageTooHigh);
        assert!(usdc_out < usdc_reserve, EInsufficientLiquidity);
        
        // Execute swap
        balance::join(&mut pool.sui_reserve, coin::into_balance(sui_coin));
        let usdc_balance = balance::split(&mut pool.usdc_reserve, usdc_out);
        
        event::emit(SwapEvent {
            trader: sui::tx_context::sender(ctx),
            token_in: b"SUI",
            token_out: b"MOCK_USDC",
            amount_in: sui_amount,
            amount_out: usdc_out,
            fee,
        });
        
        coin::from_balance(usdc_balance, ctx)
    }

    /// Swap USDC for SUI
    public fun swap_usdc_to_sui(
        pool: &mut Pool,
        usdc_coin: Coin<MOCK_USDC>,
        min_sui_out: u64,
        ctx: &mut TxContext
    ): Coin<SUI> {
        let usdc_amount = coin::value(&usdc_coin);
        assert!(usdc_amount > 0, EZeroAmount);
        
        let sui_reserve = balance::value(&pool.sui_reserve);
        let usdc_reserve = balance::value(&pool.usdc_reserve);
        
        assert!(sui_reserve > 0 && usdc_reserve > 0, EInsufficientLiquidity);
        
        // Calculate fee and output using constant product formula
        let fee = (usdc_amount * pool.fee_rate) / 10000;
        let usdc_after_fee = usdc_amount - fee;
        let sui_out = (sui_reserve * usdc_after_fee) / (usdc_reserve + usdc_after_fee);
        
        assert!(sui_out >= min_sui_out, ESlippageTooHigh);
        assert!(sui_out < sui_reserve, EInsufficientLiquidity);
        
        // Execute swap
        balance::join(&mut pool.usdc_reserve, coin::into_balance(usdc_coin));
        let sui_balance = balance::split(&mut pool.sui_reserve, sui_out);
        
        event::emit(SwapEvent {
            trader: sui::tx_context::sender(ctx),
            token_in: b"MOCK_USDC",
            token_out: b"SUI",
            amount_in: usdc_amount,
            amount_out: sui_out,
            fee,
        });
        
        coin::from_balance(sui_balance, ctx)
    }

    /// View functions
    public fun get_reserves(pool: &Pool): (u64, u64) {
        (balance::value(&pool.sui_reserve), balance::value(&pool.usdc_reserve))
    }

    public fun get_lp_token_amount(lp_token: &LPToken): u64 {
        lp_token.amount
    }

    public fun get_total_lp_supply(pool: &Pool): u64 {
        pool.total_lp_supply
    }

    /// Get current price (USDC per SUI in 6 decimal format)
    public fun get_price_usdc_per_sui(pool: &Pool): u64 {
        let (sui_reserve, usdc_reserve) = get_reserves(pool);
        if (sui_reserve == 0) {
            0
        } else {
            (usdc_reserve * 1000000) / sui_reserve
        }
    }

    /// Calculate swap output (for frontend preview)
    public fun calculate_swap_output(
        pool: &Pool,
        amount_in: u64,
        is_sui_to_usdc: bool
    ): u64 {
        let (sui_reserve, usdc_reserve) = get_reserves(pool);
        
        if (is_sui_to_usdc) {
            let fee = (amount_in * pool.fee_rate) / 10000;
            let amount_after_fee = amount_in - fee;
            (usdc_reserve * amount_after_fee) / (sui_reserve + amount_after_fee)
        } else {
            let fee = (amount_in * pool.fee_rate) / 10000;
            let amount_after_fee = amount_in - fee;
            (sui_reserve * amount_after_fee) / (usdc_reserve + amount_after_fee)
        }
    }
}
// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module app::trading_agent;

use enclave::enclave::{Self, Enclave};
use std::string::String;
use sui::event;

// Intent constants (matching Rust)
const TRADING_INTENT: u8 = 0;  // ProcessData intent from common.rs

// Error codes
const EInvalidSignature: u64 = 1;
const EUnauthorized: u64 = 2;
const EInvalidWallet: u64 = 3;

// One-time witness
public struct TRADING_AGENT has drop {}

// Agent configuration
public struct AgentConfig has key {
    id: UID,
    owner: address,
    enclave_wallet: String,  // The wallet address in enclave
    total_trades: u64,
    total_volume: u64,
}

// Trade record for verification
public struct TradeRecord has key, store {
    id: UID,
    tx_digest: String,
    action: String,
    amount_in: u64,
    amount_out: u64,
    timestamp_ms: u64,
    verified: bool,
}

// Response structs matching Rust
public struct InitWalletResponse has copy, drop {
    wallet_address: String,
    owner: String,
    message: String,
}

public struct TradeResponse has copy, drop {
    tx_digest: String,
    action: String,
    amount_in: u64,
    amount_out: u64,
}

public struct WithdrawResponse has copy, drop {
    tx_digest: String,
    amount: u64,
    recipient: String,
}

// Events
public struct WalletInitialized has copy, drop {
    wallet_address: String,
    owner: address,
    timestamp: u64,
}

public struct TradeExecuted has copy, drop {
    tx_digest: String,
    action: String,
    amount_in: u64,
    amount_out: u64,
    timestamp: u64,
}

public struct FundsWithdrawn has copy, drop {
    amount: u64,
    recipient: address,
    timestamp: u64,
}

// Initialize the module
fun init(otw: TRADING_AGENT, ctx: &mut TxContext) {
    let cap = enclave::new_cap(otw, ctx);
    
    // Create enclave config with initial PCRs (will be updated after deployment)
    cap.create_enclave_config(
        b"trading agent enclave".to_string(),
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", // pcr0
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", // pcr1
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", // pcr2
        ctx,
    );
    
    transfer::public_transfer(cap, ctx.sender());
}

// Initialize agent configuration after wallet creation
public fun init_agent_config(
    wallet_address: String,
    owner: address,
    ctx: &mut TxContext
) {
    let config = AgentConfig {
        id: object::new(ctx),
        owner,
        enclave_wallet: wallet_address,
        total_trades: 0,
        total_volume: 0,
    };
    
    event::emit(WalletInitialized {
        wallet_address,
        owner,
        timestamp: 0, // Would use Clock in production
    });
    
    transfer::share_object(config);
}

// Verify wallet initialization
public fun verify_wallet_init<T>(
    enclave: &Enclave<T>,
    wallet_address: String,
    owner: String,
    message: String,
    timestamp_ms: u64,
    signature: &vector<u8>,
    ctx: &mut TxContext
): bool {
    let response = InitWalletResponse {
        wallet_address,
        owner,
        message,
    };
    
    let verified = enclave.verify_signature(
        TRADING_INTENT,
        timestamp_ms,
        response,
        signature,
    );
    
    if (verified) {
        init_agent_config(wallet_address, ctx.sender(), ctx);
    };
    
    verified
}

// Verify and record trade execution
public fun verify_trade<T>(
    config: &mut AgentConfig,
    enclave: &Enclave<T>,
    tx_digest: String,
    action: String,
    amount_in: u64,
    amount_out: u64,
    timestamp_ms: u64,
    signature: &vector<u8>,
    ctx: &mut TxContext
): TradeRecord {
    let response = TradeResponse {
        tx_digest,
        action,
        amount_in,
        amount_out,
    };
    
    let verified = enclave.verify_signature(
        TRADING_INTENT,
        timestamp_ms,
        response,
        signature,
    );
    
    assert!(verified, EInvalidSignature);
    
    // Update statistics
    config.total_trades = config.total_trades + 1;
    config.total_volume = config.total_volume + amount_in;
    
    event::emit(TradeExecuted {
        tx_digest,
        action,
        amount_in,
        amount_out,
        timestamp: timestamp_ms,
    });
    
    TradeRecord {
        id: object::new(ctx),
        tx_digest,
        action,
        amount_in,
        amount_out,
        timestamp_ms,
        verified: true,
    }
}

// Verify withdrawal (owner only)
public fun verify_withdrawal<T>(
    config: &AgentConfig,
    enclave: &Enclave<T>,
    tx_digest: String,
    amount: u64,
    recipient: String,
    timestamp_ms: u64,
    signature: &vector<u8>,
    ctx: &TxContext
): bool {
    assert!(ctx.sender() == config.owner, EUnauthorized);
    
    let response = WithdrawResponse {
        tx_digest,
        amount,
        recipient,
    };
    
    let verified = enclave.verify_signature(
        TRADING_INTENT,
        timestamp_ms,
        response,
        signature,
    );
    
    if (verified) {
        event::emit(FundsWithdrawn {
            amount,
            recipient: config.owner,
            timestamp: timestamp_ms,
        });
    };
    
    verified
}

// View functions
public fun get_config_info(config: &AgentConfig): (address, String, u64, u64) {
    (config.owner, config.enclave_wallet, config.total_trades, config.total_volume)
}

public fun get_trade_info(record: &TradeRecord): (String, String, u64, u64, bool) {
    (record.tx_digest, record.action, record.amount_in, record.amount_out, record.verified)
}

#[test]
fun test_trading_agent() {
    use sui::test_scenario::{Self, ctx};
    use sui::test_utils::destroy;
    
    let mut scenario = test_scenario::begin(@0x1);
    
    // Initialize
    init(TRADING_AGENT {}, ctx(&mut scenario));
    
    scenario.next_tx(@0x1);
    
    // Create config
    init_agent_config(
        b"0xwallet123".to_string(),
        @0x1,
        ctx(&mut scenario)
    );
    
    scenario.next_tx(@0x1);
    
    let config = scenario.take_shared<AgentConfig>();
    let (owner, wallet, trades, volume) = get_config_info(&config);
    
    assert!(owner == @0x1, 0);
    assert!(wallet == b"0xwallet123".to_string(), 0);
    assert!(trades == 0, 0);
    assert!(volume == 0, 0);
    
    test_scenario::return_shared(config);
    scenario.end();
}
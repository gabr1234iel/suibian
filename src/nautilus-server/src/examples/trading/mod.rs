// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use crate::common::{IntentMessage, IntentScope, ProcessDataRequest, ProcessedDataResponse, to_signed_response};
use crate::{AppState, EnclaveError};
use fastcrypto::ed25519::Ed25519KeyPair;
use fastcrypto::encoding::{Encoding, Hex};
use fastcrypto::traits::{KeyPair, Signer, ToFromBytes};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use lazy_static::lazy_static;
use tracing::info;

// Sui SDK imports
#[cfg(feature = "trading")]
use sui_sdk::{SuiClient, SuiClientBuilder};
#[cfg(feature = "trading")]
use sui_types::{
    base_types::{ObjectID, SuiAddress}, 
    coin::CoinMetadata,
    transaction::{Transaction, TransactionData}
};
#[cfg(feature = "trading")]
use sui_json_rpc_types::{SuiObjectResponse, SuiObjectDataOptions, SuiTransactionBlockResponse};

// Constants - Your DEX configuration
#[allow(dead_code)]
const DEX_PACKAGE_ID: &str = "0xf6c779446cf6a60ecf2f158006130a047066583e98caa9fa7ad038cac3a32f82";
#[allow(dead_code)]
const POOL_ID: &str = "0xdb0eb25e57a67e8e606f3b42dd68be6fabafb193c0d90dfd1b47e88982ed321c";
#[allow(dead_code)]
const SUI_RPC_URL: &str = "https://fullnode.devnet.sui.io:443";

// Lazy static for wallet state (ephemeral - exists only in memory)
lazy_static! {
    static ref TRADING_WALLET: Arc<RwLock<Option<WalletState>>> = Arc::new(RwLock::new(None));
}

struct WalletState {
    keypair: Arc<Ed25519KeyPair>,
    address: String,
    owner: String,
}

// ====== Request/Response Types (matching sentinel pattern) ======

#[derive(Debug, Serialize, Deserialize)]
pub struct InitWalletRequest {
    pub owner_address: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InitWalletResponse {
    pub wallet_address: String,
    pub owner: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmptyRequest {
    // Empty request for operations that don't need parameters
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TradeRequest {
    pub action: String,  // "buy_sui" or "sell_sui"
    pub amount: u64,
    pub min_output: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TradeResponse {
    pub tx_digest: String,
    pub action: String,
    pub amount: u64,
    pub min_output: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletStatusRequest {
    // Empty request
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WalletStatusResponse {
    pub initialized: bool,
    pub wallet_address: Option<String>,
    pub owner: Option<String>,
    pub sui_balance: u64,
    pub usdc_balance: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WithdrawRequest {
    pub recipient: String,
    pub amount: Option<u64>, // None = withdraw all
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WithdrawResponse {
    pub tx_digest: String,
    pub amount: u64,
    pub recipient: String,
}

// ====== Core Functions ======

// ====== Helper Functions ======

fn derive_sui_address(keypair: &Ed25519KeyPair) -> String {
    use fastcrypto::hash::{Blake2b256, HashFunction};
    
    let public_key = keypair.public();
    let public_key_bytes = public_key.as_bytes();
    
    let mut hasher = Blake2b256::default();
    hasher.update(&[0x00]); // Ed25519 flag
    hasher.update(public_key_bytes);
    hasher.update(&[0x00]); // 1 byte padding
    
    let hash = hasher.finalize();
    let address_bytes = &hash.as_ref()[..32];
    
    format!("0x{}", Hex::encode(address_bytes))
}

fn get_current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

// Mock implementations - replace with actual sui-sdk calls

async fn build_and_execute_swap_sui_to_usdc(
    keypair: &Ed25519KeyPair,
    _wallet_address: &str,
    _amount: u64,
    _min_output: u64,
) -> Result<String, EnclaveError> {
    let mock_signature: fastcrypto::ed25519::Ed25519Signature = keypair.sign(b"swap_sui_to_usdc");
    Ok(format!("0x{}", Hex::encode(&mock_signature.as_bytes()[..8])))
}

async fn build_and_execute_swap_usdc_to_sui(
    keypair: &Ed25519KeyPair,
    _wallet_address: &str,
    _amount: u64,
    _min_output: u64,
) -> Result<String, EnclaveError> {
    let mock_signature: fastcrypto::ed25519::Ed25519Signature = keypair.sign(b"swap_usdc_to_sui");
    Ok(format!("0x{}", Hex::encode(&mock_signature.as_bytes()[..8])))
}

async fn build_and_execute_withdrawal(
    keypair: &Ed25519KeyPair,
    _recipient: &str,
    amount: Option<u64>,
) -> Result<(String, u64), EnclaveError> {
    let mock_signature: fastcrypto::ed25519::Ed25519Signature = keypair.sign(b"withdraw");
    let actual_amount = amount.unwrap_or(1000000000); // Mock 1 SUI
    Ok((format!("0x{}", Hex::encode(&mock_signature.as_bytes()[..8])), actual_amount))
}

async fn fetch_balances(address: &str) -> Result<(u64, u64), EnclaveError> {
    #[cfg(feature = "trading")]
    {
        // Create Sui client
        let client = SuiClientBuilder::default()
            .build(SUI_RPC_URL)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to create Sui client: {}", e)))?;

        // Parse the address
        let sui_address: SuiAddress = address.parse()
            .map_err(|e| EnclaveError::GenericError(format!("Invalid address format: {}", e)))?;

        // Get all coin objects for this address
        let coins = client
            .coin_read_api()
            .get_all_coins(sui_address, None, None)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to fetch coins: {}", e)))?;

        let mut sui_balance = 0u64;
        let mut usdc_balance = 0u64;

        // USDC coin type on devnet (this is an example, you may need to update with actual USDC type)
        const USDC_COIN_TYPE: &str = "0x2::coin::Coin<0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN>";

        for coin in coins.data {
            match coin.coin_type.as_str() {
                "0x2::sui::SUI" => {
                    sui_balance += coin.balance;
                }
                coin_type if coin_type == USDC_COIN_TYPE => {
                    usdc_balance += coin.balance;
                }
                _ => {
                    // Other coin types, ignore for now
                }
            }
        }

        info!("Fetched balances for {}: SUI={}, USDC={}", address, sui_balance, usdc_balance);
        Ok((sui_balance, usdc_balance))
    }
    
    #[cfg(not(feature = "trading"))]
    {
        // Fallback for when trading feature is not enabled
        Ok((0, 0))
    }
}

// ====== Warp Wrapper Functions ======

pub async fn init_wallet_wrapper(
    request: ProcessDataRequest<InitWalletRequest>,
    state: Arc<AppState>,
) -> Result<Box<dyn warp::Reply>, warp::Rejection> {
    match init_wallet_internal(state, request).await {
        Ok(response) => Ok(Box::new(warp::reply::json(&response))),
        Err(e) => Ok(Box::new(warp::reply::with_status(
            warp::reply::json(&serde_json::json!({ "error": e.to_string() })),
            warp::http::StatusCode::BAD_REQUEST,
        ))),
    }
}


pub async fn execute_trade_wrapper(
    request: ProcessDataRequest<TradeRequest>,
    state: Arc<AppState>,
) -> Result<Box<dyn warp::Reply>, warp::Rejection> {
    match execute_trade_internal(state, request).await {
        Ok(response) => Ok(Box::new(warp::reply::json(&response))),
        Err(e) => Ok(Box::new(warp::reply::with_status(
            warp::reply::json(&serde_json::json!({ "error": e.to_string() })),
            warp::http::StatusCode::BAD_REQUEST,
        ))),
    }
}

pub async fn wallet_status_wrapper(
    request: ProcessDataRequest<EmptyRequest>,
    state: Arc<AppState>,
) -> Result<Box<dyn warp::Reply>, warp::Rejection> {
    match wallet_status_internal(state, request).await {
        Ok(response) => Ok(Box::new(warp::reply::json(&response))),
        Err(e) => Ok(Box::new(warp::reply::with_status(
            warp::reply::json(&serde_json::json!({ "error": e.to_string() })),
            warp::http::StatusCode::BAD_REQUEST,
        ))),
    }
}

pub async fn withdraw_wrapper(
    request: ProcessDataRequest<WithdrawRequest>,
    state: Arc<AppState>,
) -> Result<Box<dyn warp::Reply>, warp::Rejection> {
    match withdraw_internal(state, request).await {
        Ok(response) => Ok(Box::new(warp::reply::json(&response))),
        Err(e) => Ok(Box::new(warp::reply::with_status(
            warp::reply::json(&serde_json::json!({ "error": e.to_string() })),
            warp::http::StatusCode::BAD_REQUEST,
        ))),
    }
}

// Internal functions that don't depend on axum
async fn init_wallet_internal(
    state: Arc<AppState>,
    request: ProcessDataRequest<InitWalletRequest>,
) -> Result<ProcessedDataResponse<IntentMessage<InitWalletResponse>>, EnclaveError> {
    info!("Initializing trading wallet for owner: {}", request.payload.owner_address);
    
    let mut wallet_guard = TRADING_WALLET.write().await;
    
    // Check if already initialized
    if wallet_guard.is_some() {
        return Err(EnclaveError::GenericError("Wallet already initialized".to_string()));
    }
    
    // Generate new Ed25519 keypair
    let keypair = Ed25519KeyPair::generate(&mut rand::thread_rng());
    let address = derive_sui_address(&keypair);
    
    let wallet_state = WalletState {
        keypair: Arc::new(keypair),
        address: address.clone(),
        owner: request.payload.owner_address.clone(),
    };
    
    *wallet_guard = Some(wallet_state);
    
    let timestamp_ms = get_current_timestamp();
    
    let response = InitWalletResponse {
        wallet_address: address.clone(),
        owner: request.payload.owner_address,
        message: format!("Wallet initialized. Fund this address with SUI: {}", address),
    };
    
    Ok(to_signed_response(
        &state.eph_kp,
        response,
        timestamp_ms,
        IntentScope::ProcessData,
    ))
}


async fn execute_trade_internal(
    state: Arc<AppState>,
    request: ProcessDataRequest<TradeRequest>,
) -> Result<ProcessedDataResponse<IntentMessage<TradeResponse>>, EnclaveError> {
    info!("Executing trade: {} {}", request.payload.action, request.payload.amount);
    
    let wallet_guard = TRADING_WALLET.read().await;
    let wallet_state = wallet_guard.as_ref()
        .ok_or_else(|| EnclaveError::GenericError("Wallet not initialized".to_string()))?;
    
    // Execute trade based on action
    let tx_digest = match request.payload.action.as_str() {
        "buy_sui" => {
            build_and_execute_swap_usdc_to_sui(
                &*wallet_state.keypair,
                &wallet_state.address,
                request.payload.amount,
                request.payload.min_output,
            ).await?
        },
        "sell_sui" => {
            build_and_execute_swap_sui_to_usdc(
                &*wallet_state.keypair,
                &wallet_state.address,
                request.payload.amount,
                request.payload.min_output,
            ).await?
        },
        _ => return Err(EnclaveError::GenericError("Invalid trade action".to_string())),
    };
    
    let timestamp_ms = get_current_timestamp();
    
    let response = TradeResponse {
        tx_digest,
        action: request.payload.action,
        amount: request.payload.amount,
        min_output: request.payload.min_output,
    };
    
    Ok(to_signed_response(
        &state.eph_kp,
        response,
        timestamp_ms,
        IntentScope::ProcessData,
    ))
}

async fn wallet_status_internal(
    state: Arc<AppState>,
    _request: ProcessDataRequest<EmptyRequest>,
) -> Result<ProcessedDataResponse<IntentMessage<WalletStatusResponse>>, EnclaveError> {
    info!("Getting wallet status");
    
    let wallet_guard = TRADING_WALLET.read().await;
    
    let (initialized, wallet_address, owner) = if let Some(wallet) = wallet_guard.as_ref() {
        (true, Some(wallet.address.clone()), Some(wallet.owner.clone()))
    } else {
        (false, None, None)
    };
    
    // Fetch actual balances from blockchain
    let (sui_balance, usdc_balance) = if initialized && wallet_address.is_some() {
        match fetch_balances(wallet_address.as_ref().unwrap()).await {
            Ok((sui, usdc)) => (sui, usdc),
            Err(e) => {
                info!("Failed to fetch balances: {}", e);
                (0, 0) // Fallback to zero if fetch fails
            }
        }
    } else {
        (0, 0)
    };
    
    let timestamp_ms = get_current_timestamp();
    
    let response = WalletStatusResponse {
        initialized,
        wallet_address,
        owner,
        sui_balance,
        usdc_balance,
    };
    
    Ok(to_signed_response(
        &state.eph_kp,
        response,
        timestamp_ms,
        IntentScope::ProcessData,
    ))
}

async fn withdraw_internal(
    state: Arc<AppState>,
    request: ProcessDataRequest<WithdrawRequest>,
) -> Result<ProcessedDataResponse<IntentMessage<WithdrawResponse>>, EnclaveError> {
    info!("Processing withdrawal to: {}", request.payload.recipient);
    
    let wallet_guard = TRADING_WALLET.read().await;
    let wallet_state = wallet_guard.as_ref()
        .ok_or_else(|| EnclaveError::GenericError("Wallet not initialized".to_string()))?;
    
    // Owner-only check (example - implement proper auth)
    // In production, implement proper signature-based authentication
    // For now, we'll check if the recipient is the owner (simplified)
    if request.payload.recipient != wallet_state.owner {
        return Err(EnclaveError::GenericError("Unauthorized: recipient must be owner".to_string()));
    }
    
    // Execute withdrawal
    let (tx_digest, amount) = build_and_execute_withdrawal(
        &*wallet_state.keypair,
        &request.payload.recipient,
        request.payload.amount,
    ).await?;
    
    let timestamp_ms = get_current_timestamp();
    
    let response = WithdrawResponse {
        tx_digest,
        amount,
        recipient: request.payload.recipient,
    };
    
    Ok(to_signed_response(
        &state.eph_kp,
        response,
        timestamp_ms,
        IntentScope::ProcessData,
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_address_derivation() {
        let keypair = Ed25519KeyPair::generate(&mut rand::thread_rng());
        let address = derive_sui_address(&keypair);
        assert!(address.starts_with("0x"));
        assert_eq!(address.len(), 66); // "0x" + 64 hex chars
    }
}
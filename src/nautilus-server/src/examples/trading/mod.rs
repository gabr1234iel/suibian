// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use crate::common::{IntentMessage, IntentScope, ProcessDataRequest, ProcessedDataResponse, to_signed_response};
use crate::{AppState, EnclaveError};
use axum::{extract::State, Json};
use fastcrypto::ed25519::Ed25519KeyPair;
use fastcrypto::encoding::{Encoding, Hex, Base64};
use fastcrypto::traits::{KeyPair, Signer};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use lazy_static::lazy_static;
use tracing::info;

// Constants - Your DEX configuration
const DEX_PACKAGE_ID: &str = "0xf6c779446cf6a60ecf2f158006130a047066583e98caa9fa7ad038cac3a32f82";
const POOL_ID: &str = "0xdb0eb25e57a67e8e606f3b42dd68be6fabafb193c0d90dfd1b47e88982ed321c";
const SUI_RPC_URL: &str = "https://fullnode.devnet.sui.io:443";

// Lazy static for wallet state (ephemeral - exists only in memory)
lazy_static! {
    static ref TRADING_WALLET: Arc<RwLock<Option<WalletState>>> = Arc::new(RwLock::new(None));
}

#[derive(Clone)]
struct WalletState {
    keypair: Ed25519KeyPair,
    address: String,
    owner: String,
    user_balance_id: Option<String>,
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
pub struct CreateBalanceRequest {
    // Empty, just triggers creation
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateBalanceResponse {
    pub user_balance_id: String,
    pub tx_digest: String,
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
    pub amount_in: u64,
    pub amount_out: u64,
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
    pub user_balance_id: Option<String>,
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

/// Initialize wallet - generates new keypair in enclave memory
pub async fn init_wallet(
    State(state): State<Arc<AppState>>,
    Json(request): Json<ProcessDataRequest<InitWalletRequest>>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<InitWalletResponse>>>, EnclaveError> {
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
        keypair: keypair.clone(),
        address: address.clone(),
        owner: request.payload.owner_address.clone(),
        user_balance_id: None,
    };
    
    *wallet_guard = Some(wallet_state);
    
    let timestamp_ms = get_current_timestamp();
    
    let response = InitWalletResponse {
        wallet_address: address.clone(),
        owner: request.payload.owner_address,
        message: format!("Wallet initialized. Fund this address with SUI: {}", address),
    };
    
    Ok(Json(to_signed_response(
        &state.eph_kp,
        response,
        timestamp_ms,
        IntentScope::ProcessData, // Using existing intent scope
    )))
}

/// Create UserBalance object on DEX
pub async fn create_user_balance(
    State(state): State<Arc<AppState>>,
    Json(_request): Json<ProcessDataRequest<CreateBalanceRequest>>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<CreateBalanceResponse>>>, EnclaveError> {
    info!("Creating UserBalance on DEX");
    
    let mut wallet_guard = TRADING_WALLET.write().await;
    let wallet_state = wallet_guard.as_mut()
        .ok_or_else(|| EnclaveError::GenericError("Wallet not initialized".to_string()))?;
    
    // Mock transaction - in production, use sui-sdk to build and submit
    let tx_digest = build_and_execute_create_balance(&wallet_state.keypair).await?;
    
    // Store the created UserBalance ID
    let user_balance_id = format!("0x{}", Hex::encode(&rand::random::<[u8; 32]>()));
    wallet_state.user_balance_id = Some(user_balance_id.clone());
    
    let timestamp_ms = get_current_timestamp();
    
    let response = CreateBalanceResponse {
        user_balance_id,
        tx_digest,
    };
    
    Ok(Json(to_signed_response(
        &state.eph_kp,
        response,
        timestamp_ms,
        IntentScope::ProcessData,
    )))
}

/// Execute trade on DEX
pub async fn process_data(
    State(state): State<Arc<AppState>>,
    Json(request): Json<ProcessDataRequest<TradeRequest>>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<TradeResponse>>>, EnclaveError> {
    info!("Executing trade: {} {} units", request.payload.action, request.payload.amount);
    
    let wallet_guard = TRADING_WALLET.read().await;
    let wallet_state = wallet_guard.as_ref()
        .ok_or_else(|| EnclaveError::GenericError("Wallet not initialized".to_string()))?;
    
    if wallet_state.user_balance_id.is_none() {
        return Err(EnclaveError::GenericError("UserBalance not created".to_string()));
    }
    
    // Execute trade based on action
    let tx_digest = match request.payload.action.as_str() {
        "buy_sui" => {
            build_and_execute_swap_usdc_to_sui(
                &wallet_state.keypair,
                wallet_state.user_balance_id.as_ref().unwrap(),
                request.payload.amount,
                request.payload.min_output,
            ).await?
        },
        "sell_sui" => {
            build_and_execute_swap_sui_to_usdc(
                &wallet_state.keypair,
                wallet_state.user_balance_id.as_ref().unwrap(),
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
        amount_in: request.payload.amount,
        amount_out: request.payload.min_output, // In production, get actual output from tx
    };
    
    Ok(Json(to_signed_response(
        &state.eph_kp,
        response,
        timestamp_ms,
        IntentScope::ProcessData,
    )))
}

/// Get wallet status
pub async fn get_wallet_status(
    State(state): State<Arc<AppState>>,
    Json(_request): Json<ProcessDataRequest<WalletStatusRequest>>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<WalletStatusResponse>>>, EnclaveError> {
    let wallet_guard = TRADING_WALLET.read().await;
    
    let (initialized, wallet_address, owner, user_balance_id) = match wallet_guard.as_ref() {
        Some(wallet) => (
            true,
            Some(wallet.address.clone()),
            Some(wallet.owner.clone()),
            wallet.user_balance_id.clone(),
        ),
        None => (false, None, None, None),
    };
    
    // In production, fetch actual balances from chain
    let (sui_balance, usdc_balance) = if initialized {
        fetch_balances(&wallet_address.clone().unwrap()).await?
    } else {
        (0, 0)
    };
    
    let timestamp_ms = get_current_timestamp();
    
    let response = WalletStatusResponse {
        initialized,
        wallet_address,
        owner,
        user_balance_id,
        sui_balance,
        usdc_balance,
    };
    
    Ok(Json(to_signed_response(
        &state.eph_kp,
        response,
        timestamp_ms,
        IntentScope::ProcessData,
    )))
}

/// Withdraw funds (owner only)
pub async fn withdraw_funds(
    State(state): State<Arc<AppState>>,
    Json(request): Json<ProcessDataRequest<WithdrawRequest>>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<WithdrawResponse>>>, EnclaveError> {
    info!("Processing withdrawal to: {}", request.payload.recipient);
    
    let wallet_guard = TRADING_WALLET.read().await;
    let wallet_state = wallet_guard.as_ref()
        .ok_or_else(|| EnclaveError::GenericError("Wallet not initialized".to_string()))?;
    
    // Verify owner
    if request.payload.recipient != wallet_state.owner {
        return Err(EnclaveError::GenericError("Unauthorized: not owner".to_string()));
    }
    
    // Execute withdrawal
    let (tx_digest, amount) = build_and_execute_withdrawal(
        &wallet_state.keypair,
        &request.payload.recipient,
        request.payload.amount,
    ).await?;
    
    let timestamp_ms = get_current_timestamp();
    
    let response = WithdrawResponse {
        tx_digest,
        amount,
        recipient: request.payload.recipient,
    };
    
    Ok(Json(to_signed_response(
        &state.eph_kp,
        response,
        timestamp_ms,
        IntentScope::ProcessData,
    )))
}

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
async fn build_and_execute_create_balance(keypair: &Ed25519KeyPair) -> Result<String, EnclaveError> {
    // In production: use sui-sdk to build and submit transaction
    let mock_signature = keypair.sign(b"create_balance");
    Ok(format!("0x{}", Hex::encode(&mock_signature.as_bytes()[..8])))
}

async fn build_and_execute_swap_sui_to_usdc(
    keypair: &Ed25519KeyPair,
    _user_balance_id: &str,
    _amount: u64,
    _min_output: u64,
) -> Result<String, EnclaveError> {
    let mock_signature = keypair.sign(b"swap_sui_to_usdc");
    Ok(format!("0x{}", Hex::encode(&mock_signature.as_bytes()[..8])))
}

async fn build_and_execute_swap_usdc_to_sui(
    keypair: &Ed25519KeyPair,
    _user_balance_id: &str,
    _amount: u64,
    _min_output: u64,
) -> Result<String, EnclaveError> {
    let mock_signature = keypair.sign(b"swap_usdc_to_sui");
    Ok(format!("0x{}", Hex::encode(&mock_signature.as_bytes()[..8])))
}

async fn build_and_execute_withdrawal(
    keypair: &Ed25519KeyPair,
    _recipient: &str,
    amount: Option<u64>,
) -> Result<(String, u64), EnclaveError> {
    let mock_signature = keypair.sign(b"withdraw");
    let actual_amount = amount.unwrap_or(1000000000); // Mock 1 SUI
    Ok((format!("0x{}", Hex::encode(&mock_signature.as_bytes()[..8])), actual_amount))
}

async fn fetch_balances(_address: &str) -> Result<(u64, u64), EnclaveError> {
    // In production: query chain for actual balances
    Ok((1000000000, 100000000)) // Mock: 1 SUI, 100 USDC
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
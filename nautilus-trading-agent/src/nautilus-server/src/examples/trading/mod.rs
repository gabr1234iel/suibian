// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use crate::common::{IntentMessage as CommonIntentMessage, IntentScope, ProcessDataRequest, ProcessedDataResponse, to_signed_response};
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
use sui_sdk::SuiClientBuilder;
#[cfg(feature = "trading")]
use sui_types::base_types::{ObjectID, SuiAddress};
#[cfg(feature = "trading")]
use sui_types::crypto::{SuiKeyPair, PublicKey};
#[cfg(feature = "trading")]
use shared_crypto::intent::{Intent, IntentMessage};

// Constants - Your DEX configuration
#[allow(dead_code)]
const DEX_PACKAGE_ID: &str = "0x58148fa87d972dd4f2c6110dce24d2320486d7cf56143024c3fae7e3c968961f";
#[allow(dead_code)]
const POOL_ID: &str = "0xa6a1b60fe6d3c94dcd7533002c46ed122140ade275e8fca1be835a7bdb525aa0";
#[allow(dead_code)]
const ADMIN_CAP_ID: &str = "0x6f0d09a193b2ecc8a873f753aa56fce4629e72eb66ae0c47df553767ff788f18";
#[allow(dead_code)]
const TREASURY_CAP_ID: &str = "0xd058176e995cd09c255a07ef0b6a63ba812f1eb72eeb8eabd991e885d2e9cf0e";
#[allow(dead_code)]
const SUI_RPC_URL: &str = "https://fullnode.devnet.sui.io:443";

// Subscription Manager Constants
const SUBSCRIPTION_MANAGER_PACKAGE_ID: &str = "0xfd6a00339d853aae2473bab92a11d2db322604e33339bad08e8e52f97470fa9d";
const SUBSCRIPTION_MANAGER_ID: &str = "0x83e0dd1f1df2c174f353a3b0cd0fc03141690f3f2ebd7bfbbea409f8db409454";

// Lazy static for wallet state (ephemeral - exists only in memory)
lazy_static! {
    static ref TRADING_WALLET: Arc<RwLock<Option<WalletState>>> = Arc::new(RwLock::new(None));
}

struct WalletState {
    keypair: Arc<SuiKeyPair>,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct SubscriptionWithdrawRequest {
    pub agent_id: String,
    pub amount: u64,
    pub recipient: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SubscriptionWithdrawResponse {
    pub tx_digest: String,
    pub agent_id: String,
    pub amount: u64,
    pub recipient: String,
}

// ====== Core Functions ======

// ====== Helper Functions ======

fn derive_sui_address(keypair: &SuiKeyPair) -> String {
    let public_key = keypair.public();
    let address = SuiAddress::from(&public_key);
    address.to_string()
}

fn get_current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

// Mock implementations - replace with actual sui-sdk calls

async fn build_and_execute_swap_sui_to_usdc(
    keypair: &SuiKeyPair,
    _wallet_address: &str,
    amount: u64,
    min_output: u64,
) -> Result<String, EnclaveError> {
    info!("Starting build_and_execute_swap_sui_to_usdc: amount={}, min_output={}", amount, min_output);
    
    #[cfg(feature = "trading")]
    {
        info!("Creating Sui client...");
        // Create Sui client
        let client = SuiClientBuilder::default()
            .build(SUI_RPC_URL)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to create Sui client: {}", e)))?;
        info!("Sui client created successfully");

        let sender = derive_sui_address(keypair).parse::<SuiAddress>()
            .map_err(|e| EnclaveError::GenericError(format!("Invalid sender address: {}", e)))?;
        
        let pool_object_id = POOL_ID.parse::<ObjectID>()
            .map_err(|e| EnclaveError::GenericError(format!("Invalid pool ID: {}", e)))?;
        
        // Get SUI coins for the swap
        let coins = client
            .coin_read_api()
            .get_coins(sender, Some("0x2::sui::SUI".to_string()), None, None)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to get SUI coins: {}", e)))?;

        if coins.data.is_empty() {
            return Err(EnclaveError::GenericError("No SUI coins available".to_string()));
        }

        // Get gas coin following SDK examples (function_move_call.rs:46, sign_tx_guide.rs:104-111)
        let gas_budget = 50000000; // 0.05 SUI for DEX operations
        let total_needed = amount + gas_budget;
        
        let gas_coin = coins.data.into_iter()
            .find(|coin| coin.balance >= total_needed)
            .ok_or_else(|| EnclaveError::GenericError(format!("Need at least {} SUI for swap + gas", total_needed)))?;

        // Build programmable transaction following SDK examples
        let mut ptb = sui_types::programmable_transaction_builder::ProgrammableTransactionBuilder::new();
        
        // Add pool as shared object input first (this will be Input(0))
        ptb.input(sui_types::transaction::CallArg::Object(
            sui_types::transaction::ObjectArg::SharedObject {
                id: pool_object_id,
                initial_shared_version: sui_types::base_types::SequenceNumber::from_u64(175),
                mutable: true,
            }
        )).unwrap();
        
        // Split SUI from gas coin for the exact swap amount
        let amount_arg = ptb.pure(amount).unwrap();
        let split_coin = ptb.command(sui_types::transaction::Command::SplitCoins(
            sui_types::transaction::Argument::GasCoin, // Use GasCoin for splitting
            vec![amount_arg],
        ));
        
        let min_output_arg = ptb.pure(min_output).unwrap();
        
        // Call the DEX swap function and capture the returned USDC coin
        let usdc_coin = ptb.command(sui_types::transaction::Command::MoveCall(Box::new(
            sui_types::transaction::ProgrammableMoveCall {
                package: DEX_PACKAGE_ID.parse().unwrap(),
                module: "dex".parse().unwrap(),
                function: "swap_sui_to_usdc".parse().unwrap(),
                type_arguments: vec![],
                arguments: vec![
                    sui_types::transaction::Argument::Input(0), // pool (shared object)
                    split_coin,                                  // coin to swap
                    min_output_arg                               // min output
                ],
            }
        )));
        
        // Transfer the received USDC back to sender
        let sender_arg = ptb.pure(sender).unwrap();
        ptb.command(sui_types::transaction::Command::TransferObjects(
            vec![usdc_coin],
            sender_arg,
        ));
        
        let pt = ptb.finish();
        
        // Get gas price
        let gas_price = client.read_api().get_reference_gas_price().await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to get gas price: {}", e)))?;

        // Create transaction data with proper gas coin (following SDK examples)
        let tx_data = sui_types::transaction::TransactionData::new_programmable(
            sender,
            vec![gas_coin.object_ref()], // Provide actual gas coin reference
            pt,
            gas_budget,
            gas_price,
        );

        // Sign transaction
        let intent_msg = IntentMessage::new(Intent::sui_transaction(), tx_data);
        
        use fastcrypto::hash::HashFunction;
        let mut hasher = sui_types::crypto::DefaultHash::default();
        hasher.update(bcs::to_bytes(&intent_msg).unwrap());
        let digest = hasher.finalize().digest;
        let signature = keypair.sign(&digest);

        let transaction = sui_types::transaction::Transaction::from_data(intent_msg.value, vec![signature]);

        // Execute transaction
        info!("Submitting swap SUI to USDC transaction...");
        let tx_response = client
            .quorum_driver_api()
            .execute_transaction_block(
                transaction,
                sui_json_rpc_types::SuiTransactionBlockResponseOptions::full_content(),
                None,
            )
            .await
            .map_err(|e| {
                let error_msg = format!("Transaction execution failed: {}", e);
                info!("Swap SUI to USDC error: {}", error_msg);
                EnclaveError::GenericError(error_msg)
            })?;

        info!("Swap SUI to USDC successful: {}", tx_response.digest);
        Ok(tx_response.digest.to_string())
    }
    
    #[cfg(not(feature = "trading"))]
    {
        // Mock implementation for non-trading builds
        use fastcrypto::hash::{Blake2b256, HashFunction};
        let mut hasher = Blake2b256::default();
        hasher.update(b"swap_sui_to_usdc");
        let hash = hasher.finalize();
        Ok(format!("0x{}", Hex::encode(&hash.as_ref()[..8])))
    }
}

async fn build_and_execute_swap_usdc_to_sui(
    keypair: &SuiKeyPair,
    _wallet_address: &str,
    amount: u64,
    min_output: u64,
) -> Result<String, EnclaveError> {
    #[cfg(feature = "trading")]
    {
        // Create Sui client
        let client = SuiClientBuilder::default()
            .build(SUI_RPC_URL)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to create Sui client: {}", e)))?;

        let sender = derive_sui_address(keypair).parse::<SuiAddress>()
            .map_err(|e| EnclaveError::GenericError(format!("Invalid sender address: {}", e)))?;
        
        let pool_object_id = POOL_ID.parse::<ObjectID>()
            .map_err(|e| EnclaveError::GenericError(format!("Invalid pool ID: {}", e)))?;
        
        // Get USDC coins for the swap
        let usdc_coin_type = format!("{}::mock_usdc::MOCK_USDC", DEX_PACKAGE_ID);
        let coins = client
            .coin_read_api()
            .get_coins(sender, Some(usdc_coin_type), None, None)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to get USDC coins: {}", e)))?;

        if coins.data.is_empty() {
            return Err(EnclaveError::GenericError("No USDC coins available".to_string()));
        }

        // Find suitable USDC coins for the swap
        let mut selected_usdc_coins = Vec::new();
        let mut total_usdc_balance = 0u64;
        
        for coin in coins.data {
            total_usdc_balance += coin.balance;
            selected_usdc_coins.push((coin.coin_object_id, coin.version, coin.digest));
            if total_usdc_balance >= amount {
                break;
            }
        }
        
        if total_usdc_balance < amount {
            return Err(EnclaveError::GenericError("Insufficient USDC balance for swap".to_string()));
        }
        
        // Get SUI coins for gas
        let sui_coins = client
            .coin_read_api()
            .get_coins(sender, Some("0x2::sui::SUI".to_string()), None, None)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to get SUI coins for gas: {}", e)))?;

        if sui_coins.data.is_empty() {
            return Err(EnclaveError::GenericError("No SUI coins available for gas".to_string()));
        }
        
        let gas_budget = 50000000; // 0.05 SUI for DEX operations
        let gas_coin = sui_coins.data.into_iter()
            .find(|coin| coin.balance >= gas_budget)
            .ok_or_else(|| EnclaveError::GenericError("Insufficient SUI for gas".to_string()))?;

        // Build programmable transaction
        let mut ptb = sui_types::programmable_transaction_builder::ProgrammableTransactionBuilder::new();
        
        // Add pool as the first input (Input(0))
        ptb.input(sui_types::transaction::CallArg::Object(
            sui_types::transaction::ObjectArg::SharedObject {
                id: pool_object_id,
                initial_shared_version: sui_types::base_types::SequenceNumber::from_u64(175),
                mutable: true,
            }
        )).unwrap();
        
        // Add USDC coins as inputs starting from index 1
        for coin in &selected_usdc_coins {
            ptb.input(sui_types::transaction::CallArg::Object(
                sui_types::transaction::ObjectArg::ImmOrOwnedObject(*coin)
            )).unwrap();
        }
        
        // If we have multiple coins, merge them first
        let swap_coin = if selected_usdc_coins.len() > 1 {
            // Coin args start from index 1 (pool is 0)
            let coin_args: Vec<_> = (1..=selected_usdc_coins.len())
                .map(|i| sui_types::transaction::Argument::Input(i as u16))
                .collect();
            
            ptb.command(sui_types::transaction::Command::MergeCoins(
                coin_args[0],
                coin_args[1..].to_vec(),
            ));
            coin_args[0]
        } else {
            sui_types::transaction::Argument::Input(1)
        };
        
        // Split USDC coins for exact swap amount
        let amount_arg = ptb.pure(amount).unwrap();
        let split_coin = ptb.command(sui_types::transaction::Command::SplitCoins(
            swap_coin,
            vec![amount_arg],
        ));
        
        let min_output_arg = ptb.pure(min_output).unwrap();
        
        // Call the DEX swap function and capture the returned SUI coin
        let sui_coin = ptb.command(sui_types::transaction::Command::MoveCall(Box::new(
            sui_types::transaction::ProgrammableMoveCall {
                package: DEX_PACKAGE_ID.parse().unwrap(),
                module: "dex".parse().unwrap(),
                function: "swap_usdc_to_sui".parse().unwrap(),
                type_arguments: vec![],
                arguments: vec![
                    sui_types::transaction::Argument::Input(0), // pool
                    split_coin,                                  // coin to swap
                    min_output_arg                               // min output
                ],
            }
        )));
        
        // Transfer the received SUI back to sender
        let sender_arg = ptb.pure(sender).unwrap();
        ptb.command(sui_types::transaction::Command::TransferObjects(
            vec![sui_coin],
            sender_arg,
        ));
        
        let pt = ptb.finish();
        
        // Get gas price
        let gas_price = client.read_api().get_reference_gas_price().await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to get gas price: {}", e)))?;

        // Use gas coin for transaction
        let gas_object = (gas_coin.coin_object_id, gas_coin.version, gas_coin.digest);

        // Create transaction data
        let tx_data = sui_types::transaction::TransactionData::new_programmable(
            sender,
            vec![gas_object],
            pt,
            gas_budget,
            gas_price,
        );

        // Sign transaction
        let intent_msg = IntentMessage::new(Intent::sui_transaction(), tx_data);
        
        use fastcrypto::hash::HashFunction;
        let mut hasher = sui_types::crypto::DefaultHash::default();
        hasher.update(bcs::to_bytes(&intent_msg).unwrap());
        let digest = hasher.finalize().digest;
        let signature = keypair.sign(&digest);

        let transaction = sui_types::transaction::Transaction::from_data(intent_msg.value, vec![signature]);

        // Execute transaction
        info!("Submitting swap USDC to SUI transaction...");
        let tx_response = client
            .quorum_driver_api()
            .execute_transaction_block(
                transaction,
                sui_json_rpc_types::SuiTransactionBlockResponseOptions::full_content(),
                None,
            )
            .await
            .map_err(|e| {
                let error_msg = format!("Transaction execution failed: {}", e);
                info!("Swap USDC to SUI error: {}", error_msg);
                EnclaveError::GenericError(error_msg)
            })?;

        info!("Swap USDC to SUI successful: {}", tx_response.digest);
        Ok(tx_response.digest.to_string())
    }
    
    #[cfg(not(feature = "trading"))]
    {
        // Mock implementation for non-trading builds
        use fastcrypto::hash::{Blake2b256, HashFunction};
        let mut hasher = Blake2b256::default();
        hasher.update(b"swap_usdc_to_sui");
        let hash = hasher.finalize();
        Ok(format!("0x{}", Hex::encode(&hash.as_ref()[..8])))
    }
}

async fn build_and_execute_withdrawal(
    keypair: &SuiKeyPair,
    _recipient: &str,
    amount: Option<u64>,
) -> Result<(String, u64), EnclaveError> {
    // For mock, just return a hash based on the operation
    use fastcrypto::hash::{Blake2b256, HashFunction};
    let mut hasher = Blake2b256::default();
    hasher.update(b"withdraw");
    let hash = hasher.finalize();
    let actual_amount = amount.unwrap_or(1000000000); // Mock 1 SUI
    Ok((format!("0x{}", Hex::encode(&hash.as_ref()[..8])), actual_amount))
}

async fn withdraw_from_subscription_manager(
    keypair: &SuiKeyPair,
    agent_id: &str,
    amount: u64,
    recipient: &str,
) -> Result<String, EnclaveError> {
    #[cfg(feature = "trading")]
    {
        // Create Sui client
        let client = SuiClientBuilder::default()
            .build(SUI_RPC_URL)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to create Sui client: {}", e)))?;

        let sender = derive_sui_address(keypair).parse::<SuiAddress>()
            .map_err(|e| EnclaveError::GenericError(format!("Invalid sender address: {}", e)))?;
        let recipient_addr = recipient.parse::<SuiAddress>()
            .map_err(|e| EnclaveError::GenericError(format!("Invalid recipient address: {}", e)))?;
        let agent_object_id = agent_id.parse::<ObjectID>()
            .map_err(|e| EnclaveError::GenericError(format!("Invalid agent ID: {}", e)))?;

        // Use simple Move call to check subscription status
        // This is a simplified approach - just check if user has deposited funds
        // In production, you might want to add more validation

        // Step 1: Get coins for transfer
        let coins = client
            .coin_read_api()
            .get_coins(sender, Some("0x2::sui::SUI".to_string()), None, None)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to get coins: {}", e)))?;

        if coins.data.is_empty() {
            return Err(EnclaveError::GenericError("No SUI coins available".to_string()));
        }

        // Find a coin with sufficient balance for both transfer and gas
        let gas_coin = coins.data.into_iter()
            .find(|coin| coin.balance >= amount + 10000000) // amount + gas (0.01 SUI)
            .ok_or_else(|| EnclaveError::GenericError("Insufficient balance for withdrawal + gas".to_string()))?;

        // Build simple transfer transaction using GasCoin argument
        let mut ptb = sui_types::programmable_transaction_builder::ProgrammableTransactionBuilder::new();
        
        // Create pure arguments first to avoid borrow conflicts
        let amount_arg = ptb.pure(amount).unwrap();
        let recipient_arg = ptb.pure(recipient_addr).unwrap();

        // Use Argument::GasCoin to reference the gas coin
        let split_coin = ptb.command(sui_types::transaction::Command::SplitCoins(
            sui_types::transaction::Argument::GasCoin,
            vec![amount_arg],
        ));

        // Transfer the split coin to recipient
        ptb.command(sui_types::transaction::Command::TransferObjects(
            vec![split_coin],
            recipient_arg,
        ));

        let pt = ptb.finish();
        
        // Get gas budget and price
        let gas_budget = 10000000; // 0.01 SUI for simple transfer
        let gas_price = client.read_api().get_reference_gas_price().await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to get gas price: {}", e)))?;

        // Create transaction data
        let tx_data = sui_types::transaction::TransactionData::new_programmable(
            sender,
            vec![(
                gas_coin.coin_object_id,
                gas_coin.version,
                gas_coin.digest,
            )],
            pt,
            gas_budget,
            gas_price,
        );

        // Sign transaction
        let intent_msg = IntentMessage::new(
            Intent::sui_transaction(),
            tx_data,
        );
        
        // Sign using the SuiKeyPair - following the sample code pattern
        use fastcrypto::hash::HashFunction;
        let mut hasher = sui_types::crypto::DefaultHash::default();
        hasher.update(bcs::to_bytes(&intent_msg).unwrap());
        let digest = hasher.finalize().digest;
        let signature = keypair.sign(&digest);

        let transaction = sui_types::transaction::Transaction::from_data(intent_msg.value, vec![signature]);

        // Execute transaction
        let tx_response = client
            .quorum_driver_api()
            .execute_transaction_block(
                transaction,
                sui_json_rpc_types::SuiTransactionBlockResponseOptions::full_content(),
                None,
            )
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Transaction execution failed: {}", e)))?;

        Ok(tx_response.digest.to_string())
    }
    
    #[cfg(not(feature = "trading"))]
    {
        // Mock implementation for non-trading builds
        // For mock, just return a hash based on the operation
        use fastcrypto::hash::{Blake2b256, HashFunction};
        let mut hasher = Blake2b256::default();
        hasher.update(format!("withdraw_{}_{}_{}", agent_id, amount, recipient).as_bytes());
        let hash = hasher.finalize();
        Ok(format!("0x{}", Hex::encode(&hash.as_ref()[..8])))
    }
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

        // MOCK_USDC coin type from the DEX contract
        let usdc_coin_type = format!("{}::mock_usdc::MOCK_USDC", DEX_PACKAGE_ID);

        for coin in coins.data {
            match coin.coin_type.as_str() {
                "0x2::sui::SUI" => {
                    sui_balance += coin.balance;
                }
                coin_type if coin_type == &usdc_coin_type => {
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

pub async fn subscription_withdraw_wrapper(
    request: ProcessDataRequest<SubscriptionWithdrawRequest>,
    state: Arc<AppState>,
) -> Result<Box<dyn warp::Reply>, warp::Rejection> {
    match subscription_withdraw_internal(state, request).await {
        Ok(response) => Ok(Box::new(warp::reply::json(&response))),
        Err(e) => Ok(Box::new(warp::reply::with_status(
            warp::reply::json(&serde_json::json!({ "error": e.to_string() })),
            warp::http::StatusCode::BAD_REQUEST,
        ))),
    }
}

pub async fn simple_transfer_wrapper(
    request: ProcessDataRequest<WithdrawRequest>,
    state: Arc<AppState>,
) -> Result<Box<dyn warp::Reply>, warp::Rejection> {
    match simple_transfer_internal(state, request).await {
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
) -> Result<ProcessedDataResponse<CommonIntentMessage<InitWalletResponse>>, EnclaveError> {
    info!("Initializing trading wallet for owner: {}", request.payload.owner_address);
    
    let mut wallet_guard = TRADING_WALLET.write().await;
    
    // Check if already initialized
    if wallet_guard.is_some() {
        return Err(EnclaveError::GenericError("Wallet already initialized".to_string()));
    }
    
    // Generate new SuiKeyPair
    let ed25519_keypair = Ed25519KeyPair::generate(&mut rand::thread_rng());
    let keypair = SuiKeyPair::Ed25519(ed25519_keypair);
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
) -> Result<ProcessedDataResponse<CommonIntentMessage<TradeResponse>>, EnclaveError> {
    info!("Executing trade: {} {} MIST with min_output: {}", request.payload.action, request.payload.amount, request.payload.min_output);
    
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
) -> Result<ProcessedDataResponse<CommonIntentMessage<WalletStatusResponse>>, EnclaveError> {
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
) -> Result<ProcessedDataResponse<CommonIntentMessage<WithdrawResponse>>, EnclaveError> {
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

async fn simple_transfer_internal(
    state: Arc<AppState>,
    request: ProcessDataRequest<WithdrawRequest>,
) -> Result<ProcessedDataResponse<CommonIntentMessage<WithdrawResponse>>, EnclaveError> {
    info!("Processing simple transfer to: {} amount: {:?}", request.payload.recipient, request.payload.amount);
    
    let wallet_guard = TRADING_WALLET.read().await;
    let wallet_state = wallet_guard.as_ref()
        .ok_or_else(|| EnclaveError::GenericError("Wallet not initialized".to_string()))?;
    
    #[cfg(feature = "trading")]
    let tx_digest = {
        use sui_types::programmable_transaction_builder::ProgrammableTransactionBuilder;
        
        let client = SuiClientBuilder::default()
            .build(SUI_RPC_URL)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to create Sui client: {}", e)))?;

        let sender = derive_sui_address(&wallet_state.keypair).parse::<SuiAddress>()
            .map_err(|e| EnclaveError::GenericError(format!("Invalid sender address: {}", e)))?;
        let recipient_addr = request.payload.recipient.parse::<SuiAddress>()
            .map_err(|e| EnclaveError::GenericError(format!("Invalid recipient address: {}", e)))?;
        
        let amount = request.payload.amount.unwrap_or(1000000000); // Default 1 SUI

        // Get coins
        let coins = client
            .coin_read_api()
            .get_coins(sender, Some("0x2::sui::SUI".to_string()), None, None)
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to get coins: {}", e)))?;

        if coins.data.is_empty() {
            return Err(EnclaveError::GenericError("No SUI coins available".to_string()));
        }

        let gas_coin = coins.data.into_iter()
            .find(|coin| coin.balance >= amount + 10000000) // amount + gas (0.01 SUI)
            .ok_or_else(|| EnclaveError::GenericError("Insufficient balance".to_string()))?;

        // Build simple transfer using GasCoin argument (avoids double usage)
        let mut ptb = ProgrammableTransactionBuilder::new();
        
        let amount_arg = ptb.pure(amount).unwrap();
        let recipient_arg = ptb.pure(recipient_addr).unwrap();

        // Use Argument::GasCoin to reference the gas coin instead of adding it as a separate object
        let split_coin = ptb.command(sui_types::transaction::Command::SplitCoins(
            sui_types::transaction::Argument::GasCoin,
            vec![amount_arg],
        ));

        ptb.command(sui_types::transaction::Command::TransferObjects(
            vec![split_coin],
            recipient_arg,
        ));

        let pt = ptb.finish();
        
        let gas_budget = 10000000; // 0.01 SUI for simple transfer
        let gas_price = client.read_api().get_reference_gas_price().await
            .map_err(|e| EnclaveError::GenericError(format!("Failed to get gas price: {}", e)))?;

        let tx_data = sui_types::transaction::TransactionData::new_programmable(
            sender,
            vec![(gas_coin.coin_object_id, gas_coin.version, gas_coin.digest)],
            pt,
            gas_budget,
            gas_price,
        );

        let intent_msg = IntentMessage::new(Intent::sui_transaction(), tx_data);
        // Sign using the SuiKeyPair - following the sample code pattern
        use fastcrypto::hash::HashFunction;
        let mut hasher = sui_types::crypto::DefaultHash::default();
        hasher.update(bcs::to_bytes(&intent_msg).unwrap());
        let digest = hasher.finalize().digest;
        let signature = wallet_state.keypair.sign(&digest);

        let transaction = sui_types::transaction::Transaction::from_data(intent_msg.value, vec![signature]);

        let tx_response = client
            .quorum_driver_api()
            .execute_transaction_block(
                transaction,
                sui_json_rpc_types::SuiTransactionBlockResponseOptions::full_content(),
                None,
            )
            .await
            .map_err(|e| EnclaveError::GenericError(format!("Transaction execution failed: {}", e)))?;

        tx_response.digest.to_string()
    };
    
    #[cfg(not(feature = "trading"))]
    let tx_digest = {
        // For mock, just return a hash based on the operation
        use fastcrypto::hash::{Blake2b256, HashFunction};
        let mut hasher = Blake2b256::default();
        hasher.update(b"simple_transfer");
        let hash = hasher.finalize();
        format!("0x{}", Hex::encode(&hash.as_ref()[..8]))
    };
    
    let timestamp_ms = get_current_timestamp();
    
    let response = WithdrawResponse {
        tx_digest,
        amount: request.payload.amount.unwrap_or(1000000000),
        recipient: request.payload.recipient,
    };
    
    Ok(to_signed_response(
        &state.eph_kp,
        response,
        timestamp_ms,
        IntentScope::ProcessData,
    ))
}

async fn subscription_withdraw_internal(
    state: Arc<AppState>,
    request: ProcessDataRequest<SubscriptionWithdrawRequest>,
) -> Result<ProcessedDataResponse<CommonIntentMessage<SubscriptionWithdrawResponse>>, EnclaveError> {
    info!("Processing subscription withdrawal from agent: {} to: {} amount: {}", 
          request.payload.agent_id, request.payload.recipient, request.payload.amount);
    
    let wallet_guard = TRADING_WALLET.read().await;
    let wallet_state = wallet_guard.as_ref()
        .ok_or_else(|| EnclaveError::GenericError("Wallet not initialized".to_string()))?;
    
    // This function validates subscription and executes withdrawal
    let tx_digest = withdraw_from_subscription_manager(
        &*wallet_state.keypair,
        &request.payload.agent_id,
        request.payload.amount,
        &request.payload.recipient,
    ).await?;
    
    let timestamp_ms = get_current_timestamp();
    
    let response = SubscriptionWithdrawResponse {
        tx_digest,
        agent_id: request.payload.agent_id,
        amount: request.payload.amount,
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
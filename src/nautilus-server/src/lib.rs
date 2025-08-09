// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use fastcrypto::ed25519::Ed25519KeyPair;
use std::fmt;

pub mod examples {
    #[cfg(feature = "trading")]
    pub mod trading;
}

pub mod app {
    #[cfg(feature = "trading")]
    pub use crate::examples::trading::{
        InitWalletRequest, InitWalletResponse,
        TradeRequest, TradeResponse, WalletStatusRequest, WalletStatusResponse,
        WithdrawRequest, WithdrawResponse,
    };
}

pub mod common;

/// App state, at minimum needs to maintain the ephemeral keypair
pub struct AppState {
    /// Ephemeral keypair on boot
    pub eph_kp: Ed25519KeyPair,
    /// API key for external services (optional)
    pub api_key: String,
}


/// Enclave errors enum
#[derive(Debug)]
pub enum EnclaveError {
    GenericError(String),
}

impl fmt::Display for EnclaveError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EnclaveError::GenericError(e) => write!(f, "{}", e),
        }
    }
}

impl std::error::Error for EnclaveError {}
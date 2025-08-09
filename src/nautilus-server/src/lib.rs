// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use fastcrypto::ed25519::Ed25519KeyPair;
use std::fmt;

pub mod examples {
    #[cfg(feature = "twitter")]
    pub mod twitter;

    #[cfg(feature = "weather")]
    pub mod weather;

    #[cfg(feature = "trading")]
    pub mod trading;

    #[cfg(feature = "seal-example")]
    pub mod seal_example;
}

pub mod app {
    #[cfg(feature = "twitter")]
    pub use crate::examples::twitter::*;

    #[cfg(feature = "weather")]
    pub use crate::examples::weather::{process_data, WeatherRequest, WeatherResponse};

    #[cfg(feature = "trading")]
    pub use crate::examples::trading::{
        InitWalletRequest, InitWalletResponse, CreateBalanceResponse,
        TradeRequest, TradeResponse, WalletStatusRequest, WalletStatusResponse,
        WithdrawRequest, WithdrawResponse,
    };

    #[cfg(feature = "seal-example")]
    pub use crate::examples::seal_example::{
        complete_parameter_load, init_parameter_load, ping, process_data, spawn_host_init_server,
        types, PingResponse,
    };
}

pub mod common;

/// App state, at minimum needs to maintain the ephemeral keypair
pub struct AppState {
    /// Ephemeral keypair on boot
    pub eph_kp: Ed25519KeyPair,
    /// API key when needed (for weather/twitter APIs)
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
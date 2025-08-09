// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use anyhow::Result;
use axum::{routing::get, routing::post, Router};
use fastcrypto::{ed25519::Ed25519KeyPair, traits::KeyPair};
use nautilus_server::AppState;
use nautilus_server::common::{get_attestation, health_check};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

#[tokio::main]
async fn main() -> Result<()> {
    let eph_kp = Ed25519KeyPair::generate(&mut rand::thread_rng());

    // API key for external services (weather API, Twitter API, etc.)
    // Not needed for trading but kept for compatibility
    let api_key = std::env::var("API_KEY").unwrap_or_else(|_| String::new());

    let state = Arc::new(AppState { eph_kp, api_key });

    // Feature-specific startup messages
    #[cfg(feature = "trading")]
    {
        println!("🚀 Starting Nautilus Trading Agent...");
        println!("📍 Trading endpoints available:");
        println!("   POST /init_wallet         - Initialize trading wallet");
        println!("   POST /create_user_balance - Create DEX UserBalance");
        println!("   POST /execute_trade       - Execute swap on DEX");
        println!("   POST /wallet_status       - Get wallet status");
        println!("   POST /withdraw            - Withdraw funds (owner only)");
    }

    #[cfg(feature = "weather")]
    {
        println!("🌤️ Starting Nautilus Weather Service...");
        println!("   POST /process_data        - Get weather data");
    }

    #[cfg(feature = "twitter")]
    {
        println!("🐦 Starting Nautilus Twitter Service...");
        println!("   POST /process_data        - Process Twitter data");
    }

    #[cfg(feature = "seal-example")]
    {
        println!("🔒 Spawning host-only init server for Seal...");
        nautilus_server::app::spawn_host_init_server(state.clone()).await?;
    }

    // Common endpoints always available
    println!("\n📡 Common endpoints:");
    println!("   GET  /                    - Health check");
    println!("   GET  /get_attestation     - Get enclave attestation");
    println!("   GET  /health_check        - Check endpoint connectivity");

    // Define CORS policy
    let cors = CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_origin(Any);

    // Build router with conditional routes based on features
    let mut app = Router::new()
        .route("/", get(ping))
        .route("/get_attestation", get(get_attestation))
        .route("/health_check", get(health_check));

    // Add trading-specific routes
    #[cfg(feature = "trading")]
    {
        use nautilus_server::app::{
            init_wallet, create_user_balance, process_data,
            get_wallet_status, withdraw_funds
        };
        
        app = app
            .route("/init_wallet", post(init_wallet))
            .route("/create_user_balance", post(create_user_balance))
            .route("/execute_trade", post(process_data))
            .route("/wallet_status", post(get_wallet_status))
            .route("/withdraw", post(withdraw_funds));
    }

    // Add weather route
    #[cfg(feature = "weather")]
    {
        use nautilus_server::app::process_data;
        app = app.route("/process_data", post(process_data));
    }

    // Add twitter route
    #[cfg(feature = "twitter")]
    {
        use nautilus_server::app::process_data;
        app = app.route("/process_data", post(process_data));
    }

    app = app.with_state(state).layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    info!("Server listening on {}", listener.local_addr().unwrap());
    
    axum::serve(listener, app.into_make_service())
        .await
        .map_err(|e| anyhow::anyhow!("Server error: {}", e))
}

async fn ping() -> &'static str {
    #[cfg(feature = "trading")]
    return "Trading Agent TEE v1.0 - Ready!";
    
    #[cfg(feature = "weather")]
    return "Weather Service - Pong!";
    
    #[cfg(feature = "twitter")]
    return "Twitter Service - Pong!";
    
    #[cfg(not(any(feature = "trading", feature = "weather", feature = "twitter")))]
    return "Nautilus Server - Pong!";
}
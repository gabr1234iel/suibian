// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use anyhow::Result;
use fastcrypto::{ed25519::Ed25519KeyPair, traits::KeyPair};
use nautilus_server::AppState;
use nautilus_server::common::{get_attestation, health_check};
use std::sync::Arc;
use tracing::info;
use warp::Filter;

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

    let cors = warp::cors()
        .allow_any_origin()
        .allow_methods(vec!["GET", "POST"])
        .allow_headers(vec!["content-type"]);

    // Routes
    let ping = warp::path("ping")
        .and(warp::get())
        .map(|| warp::reply::html(ping_response()));

    let health = warp::path("health")
        .and(warp::get())
        .map(|| warp::reply::json(&health_check()));

    let attestation = warp::path("attestation")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(attestation_handler);


    #[cfg(feature = "trading")]
    let trading_routes = {
        let init_wallet = warp::path("init_wallet")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_state(state.clone()))
            .and_then(nautilus_server::examples::trading::init_wallet_wrapper);

        let create_balance = warp::path("create_user_balance")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_state(state.clone()))
            .and_then(nautilus_server::examples::trading::create_user_balance_wrapper);

        let execute_trade = warp::path("execute_trade")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_state(state.clone()))
            .and_then(nautilus_server::examples::trading::execute_trade_wrapper);

        let wallet_status = warp::path("wallet_status")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_state(state.clone()))
            .and_then(nautilus_server::examples::trading::wallet_status_wrapper);

        let withdraw = warp::path("withdraw")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_state(state.clone()))
            .and_then(nautilus_server::examples::trading::withdraw_wrapper);

        init_wallet.or(create_balance).or(execute_trade).or(wallet_status).or(withdraw)
    };

    let routes = ping.or(health).or(attestation);

    #[cfg(feature = "trading")]
    let routes = routes.or(trading_routes);

    let routes = routes.with(cors);

    info!("Server listening on 0.0.0.0:3000");
    warp::serve(routes)
        .run(([0, 0, 0, 0], 3000))
        .await;

    Ok(())
}

fn ping_response() -> &'static str {
    #[cfg(feature = "trading")]
    return "Trading Agent TEE v1.0 - Ready!";
    
    #[cfg(feature = "weather")]
    return "Weather Service - Pong!";
    
    #[cfg(feature = "twitter")]
    return "Twitter Service - Pong!";
    
    #[cfg(not(any(feature = "trading", feature = "weather", feature = "twitter")))]
    return "Pong!";
}

fn with_state(state: Arc<AppState>) -> impl Filter<Extract = (Arc<AppState>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || state.clone())
}

async fn attestation_handler(state: Arc<AppState>) -> Result<impl warp::Reply, warp::Rejection> {
    match get_attestation(&state).await {
        Ok(att) => Ok(warp::reply::json(&att)),
        Err(_) => Err(warp::reject::custom(ServerError)),
    }
}

#[derive(Debug)]
struct ServerError;

impl warp::reject::Reject for ServerError {}
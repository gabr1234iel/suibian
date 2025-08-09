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

    // API key for external services - kept for compatibility
    let api_key = std::env::var("API_KEY").unwrap_or_else(|_| String::new());

    let state = Arc::new(AppState { eph_kp, api_key });

    // Trading Agent startup
    #[cfg(feature = "trading")]
    {
        println!("🚀 Starting Nautilus Trading Agent...");
        println!("📍 Trading endpoints available:");
        println!("   POST /init_wallet         - Initialize trading wallet & get address for deposits");
        println!("   POST /wallet_status       - Get wallet address and current balances");
        println!("   POST /execute_trade       - Execute swap on DEX");
        println!("   POST /withdraw            - Withdraw funds (owner only)");
        println!("   POST /simple_transfer     - Simple SUI transfer (test signature)");
        println!("   POST /subscription_withdraw - Withdraw funds through subscription manager (subscribers only)");
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

        let simple_transfer = warp::path("simple_transfer")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_state(state.clone()))
            .and_then(nautilus_server::examples::trading::simple_transfer_wrapper);

        let subscription_withdraw = warp::path("subscription_withdraw")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_state(state.clone()))
            .and_then(nautilus_server::examples::trading::subscription_withdraw_wrapper);

        init_wallet.or(execute_trade).or(wallet_status).or(withdraw).or(simple_transfer).or(subscription_withdraw)
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
    
    #[cfg(not(feature = "trading"))]
    return "Nautilus TEE - Ready!";
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
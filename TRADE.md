# Trading Agent TEE Setup Guide

## Prerequisites
- Rust and Cargo installed
- Sui CLI installed (`cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui`)
- AWS account with Nitro Enclaves enabled (for production deployment)
- Sui wallet with devnet funds for testing

## 1. Local Development & Testing Setup

### Build and Run Locally (Recommended for Development)

```bash
# Navigate to the nautilus server directory
cd src/nautilus-server

# Build with trading feature only
cargo build --no-default-features --features trading

# Run the server locally for testing
RUST_LOG=debug cargo run --bin nautilus-server --no-default-features --features trading
```

The server will start and show:
```
🚀 Starting Nautilus Trading Agent...
📍 Trading endpoints available:
   POST /init_wallet         - Initialize trading wallet & get address for deposits
   POST /wallet_status       - Get wallet address and current balances
   POST /execute_trade       - Execute swap on DEX
   POST /withdraw            - Withdraw funds (owner only)
```

### Test Basic Functionality

```bash
# Test server is running
curl http://localhost:3000/ping
# Should return: "Trading Agent TEE v1.0 - Ready!"

```

### Initialize a Trading Wallet

```bash
# Initialize wallet and get address for deposits
curl -X POST http://localhost:3000/init_wallet \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "owner_address": "0x742d35cc6ba1c4bf0bb4d8c7d3c4b0ce15c4c51eb8b6e7e1a1d4b5c3b4f6a7b8"
    }
  }'
```

Example response:
```json
{
  "response": {
    "data": {
      "wallet_address": "0x123abc...",
      "owner": "0x742d35cc...",
      "message": "Wallet initialized. Fund this address with SUI: 0x123abc..."
    },
    "timestamp_ms": 1703001234567,
    "intent": "ProcessData"
  },
  "signature": "0xabc123..."
}
```

### Fund the Wallet (Devnet)

```bash
# Get devnet SUI from faucet
curl -X POST https://faucet.devnet.sui.io/gas \
  -H "Content-Type: application/json" \
  -d '{
    "FixedAmountRequest": {
      "recipient": "0x123abc..."
    }
  }'

# Or if you have Sui CLI configured with devnet
sui client transfer-sui \
  --to 0x123abc... \
  --amount 1000000000 \
  --gas-budget 10000000
```

### Check Wallet Status (Real Devnet Balances)

```bash
curl -X POST http://localhost:3000/wallet_status \
  -H "Content-Type: application/json" \
  -d '{"payload": {}}'
```

This will return real SUI balance from the devnet blockchain:
```json
{
  "response": {
    "data": {
      "initialized": true,
      "wallet_address": "0x123abc...",
      "owner": "0x742d35cc...",
      "sui_balance": 1000000000,
      "usdc_balance": 0
    },
    "timestamp_ms": 1703001234567,
    "intent": "ProcessData"
  },
  "signature": "0xdef456..."
}
```

### Execute Real DEX Trades

**Important**: Set realistic `min_output` values based on current pool liquidity to avoid slippage errors.

Current DEX Pool Status:
- **Package ID**: `0x58148fa87d972dd4f2c6110dce24d2320486d7cf56143024c3fae7e3c968961f`
- **Pool ID**: `0xa6a1b60fe6d3c94dcd7533002c46ed122140ade275e8fca1be835a7bdb525aa0`
- **SUI Reserve**: ~6.978 SUI
- **USDC Reserve**: ~43.17 USDC
- **Fee**: 0.3%

```bash
# Sell 0.09 SUI for USDC (expect ~0.55 USDC output)
curl -X POST http://localhost:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "action": "sell_sui",
      "amount": 90000000,
      "min_output": 500000
    }
  }'

# Buy SUI with 10 USDC (expect ~2.94 SUI output)
curl -X POST http://localhost:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "action": "buy_sui", 
      "amount": 10000000,
      "min_output": 2900000000
    }
  }'
```

**Calculate Expected Output**:
```bash
# Check expected swap output before trading
sui client call --package 0x58148fa87d972dd4f2c6110dce24d2320486d7cf56143024c3fae7e3c968961f \
  --module dex --function calculate_swap_output \
  --args 0xa6a1b60fe6d3c94dcd7533002c46ed122140ade275e8fca1be835a7bdb525aa0 90000000 true \
  --gas-budget 10000000
```

### Other Available Endpoints

```bash
# Simple SUI transfer
curl -X POST http://localhost:3000/simple_transfer \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "recipient": "0x05509732114820e9dec0c2a7405690af986400cf2ac50792fb84430be1a2ec87",
      "amount": 100000000
    }
  }'

# Withdraw funds
curl -X POST http://localhost:3000/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "recipient": "0x742d35cc6ba1c4bf0bb4d8c7d3c4b0ce15c4c51eb8b6e7e1a1d4b5c3b4f6a7b8",
      "amount": null
    }
  }'

# Subscription withdraw 
curl -X POST http://localhost:3000/subscription_withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "agent_id": "0x83e0dd1f1df2c174f353a3b0cd0fc03141690f3f2ebd7bfbbea409f8db409454",
      "amount": 100000000,
      "recipient": "0x05509732114820e9dec0c2a7405690af986400cf2ac50792fb84430be1a2ec87"
    }
  }'
```

## 2. Production AWS Enclave Setup

### Configure AWS Enclave for Trading
```bash
# This updates run.sh and expose_enclave.sh to allow Sui RPC access
export KEY_PAIR=<your-key-pair-name>
export AWS_ACCESS_KEY_ID=<your-access-key>
export AWS_SECRET_ACCESS_KEY=<your-secret-key>
export AWS_SESSION_TOKEN=<your-session-token>

# Run configuration for trading example
sh configure_enclave.sh trading
```

When prompted:
```
Enter EC2 instance base name: trading-agent
Do you want to use a secret? (y/n): n  # Trading doesn't need external API keys
```

This will:
- ✅ Update `src/nautilus-server/run.sh` with Sui RPC endpoints
- ✅ Update `expose_enclave.sh` with proper network configuration
- ✅ Configure traffic forwarding for `fullnode.devnet.sui.io`

### Build Enclave Image
```bash
# From project root
# Commit the changes from configure_enclave.sh first!
git add -A && git commit -m "Configure trading agent"

# Build enclave image with trading feature
make EXAMPLE=trading

# Check generated PCRs
cat out/nitro.pcrs
```

### Deploy to AWS
```bash
ssh ec2-user@<PUBLIC_IP>

# Clone your repository with the committed changes
git clone <your-repo-url>
cd nautilus-trading-agent

# Build and run enclave
make EXAMPLE=trading
make run  # or make run-debug for debugging

# Expose enclave endpoints
sh expose_enclave.sh
```

## 3. Current Implementation Status

### ✅ Working Features
1. **Wallet Initialization**: Generates Ed25519 keypair in enclave memory
2. **Real Balance Fetching**: Uses Sui SDK to fetch actual SUI/USDC balances from devnet
3. **Wallet Status**: Returns real-time blockchain balances and wallet info
4. **Basic API Structure**: All endpoints are functional with proper error handling
5. **Devnet Integration**: Connected to `https://fullnode.devnet.sui.io:443`
6. **Real DEX Trading**: Executes actual swaps on deployed DEX contract
7. **Simple Transfers**: Real SUI transfers between addresses

## 5. Development Workflow

### Local Development
1. Make changes in `src/nautilus-server/src/examples/trading/mod.rs`
2. Test locally: `cargo run --bin nautilus-server --no-default-features --features trading`
3. Test API endpoints with curl or Postman
4. Commit changes when ready

### Enclave Testing
1. Run `configure_enclave.sh trading` to update network configuration
2. Commit the configuration changes
3. Build with `make EXAMPLE=trading`
4. Deploy to AWS and test in enclave environment

### Move Contract Updates
1. Update contracts in `move/trading/sources/`
2. Test with `sui move test`
3. Deploy to devnet: `sui client publish`
4. Update package IDs in Rust code

## 6. Important Notes

1. **Ephemeral Wallet**: The wallet private key exists only in enclave memory. If the enclave restarts, a new wallet is generated

2. **Owner Control**: Only the address specified during `init_wallet` can withdraw funds

3. **Devnet Testing**: All testing should be done on Sui devnet first before mainnet

4. **Gas Costs**: Remember to account for Sui gas costs in all transaction building

5. **Network Dependencies**: Enclave needs network access to Sui RPC endpoints (`fullnode.devnet.sui.io:443`)

This setup provides a solid foundation for a Sui-based trading agent running in AWS Nitro Enclaves, with real blockchain integration for balance checking and a clear path forward for implementing full trading functionality.
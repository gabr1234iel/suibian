# Trading Agent TEE Setup Guide

## Prerequisites
- AWS account with Nitro Enclaves enabled
- Sui wallet with funds for testing
- Deployed mock DEX on Sui (package: `0xf6c779446cf6a60ecf2f158006130a047066583e98caa9fa7ad038cac3a32f82`)

## 1. Initial Setup

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

### Verify Generated Files
Check that these lines were added to `src/nautilus-server/run.sh`:
```bash
echo "127.0.0.64   fullnode.devnet.sui.io" >> /etc/hosts
echo "127.0.0.65   fullnode.testnet.sui.io" >> /etc/hosts
```

And traffic forwarders:
```bash
python3 /traffic_forwarder.py 127.0.0.64 443 3 8101 &
python3 /traffic_forwarder.py 127.0.0.65 443 3 8102 &
```

## 2. Build Trading Agent

### Local Testing (Outside Enclave)
```bash
# Build with trading feature
cd src/nautilus-server
cargo build --no-default-features --features trading

# Run locally for testing
RUST_LOG=debug cargo run --no-default-features --features trading

# Test endpoints
curl http://localhost:3000/
# Should return: "Trading Agent TEE v1.0 - Ready!"
```

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

## 3. Deploy to AWS

### SSH into EC2 Instance
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

## 4. Deploy Move Contracts

### Deploy Trading Agent Contract
```bash
cd move/trading
sui move build
sui client publish --gas-budget 100000000

# Record the package ID
TRADING_PACKAGE_ID=0x...

# Deploy enclave package if not already deployed
cd ../enclave
sui move build
sui client publish --gas-budget 100000000

# Record the enclave package ID
ENCLAVE_PACKAGE_ID=0x...
```

### Update PCRs in Contract
```bash
# Get PCRs from the built enclave
cat out/nitro.pcrs

# Update PCRs on-chain
sui client call \
  --function update_pcrs \
  --module enclave \
  --package $ENCLAVE_PACKAGE_ID \
  --type-args "$TRADING_PACKAGE_ID::trading_agent::TRADING_AGENT" \
  --args $ENCLAVE_CONFIG_ID $CAP_ID "0x$PCR0" "0x$PCR1" "0x$PCR2" \
  --gas-budget 10000000
```

### Register Enclave
```bash
# Get attestation from enclave
ENCLAVE_URL=http://<PUBLIC_IP>:3000

# Register enclave on-chain
sh register_enclave.sh \
  $ENCLAVE_PACKAGE_ID \
  $TRADING_PACKAGE_ID \
  $ENCLAVE_CONFIG_ID \
  $ENCLAVE_URL \
  trading_agent \
  TRADING_AGENT

# Record the created ENCLAVE_OBJECT_ID
ENCLAVE_OBJECT_ID=0x...
```

## 5. Using the Trading Agent

### Initialize Wallet
```bash
# Initialize trading wallet in enclave
curl -X POST $ENCLAVE_URL/init_wallet \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "owner_address": "0x<YOUR_SUI_ADDRESS>"
    }
  }'

# Response will include wallet address to fund
# Example: {"response":{"wallet_address":"0x123...","owner":"0x..."},"signature":"..."}
```

### Fund Wallet
```bash
# Send SUI to the wallet address from response
sui client transfer-sui \
  --to <WALLET_ADDRESS_FROM_RESPONSE> \
  --amount 1000000000 \
  --gas-budget 10000000
```

### Create UserBalance on DEX
```bash
curl -X POST $ENCLAVE_URL/create_user_balance \
  -H "Content-Type: application/json" \
  -d '{"payload": {}}'

# This creates a UserBalance object on the DEX for USDC tracking
```

### Execute Trades
```bash
# Sell SUI for USDC
curl -X POST $ENCLAVE_URL/execute_trade \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "action": "sell_sui",
      "amount": 500000000,
      "min_output": 900000
    }
  }'

# Buy SUI with USDC
curl -X POST $ENCLAVE_URL/execute_trade \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "action": "buy_sui",
      "amount": 1000000,
      "min_output": 450000000
    }
  }'
```

### Check Wallet Status
```bash
curl -X POST $ENCLAVE_URL/wallet_status \
  -H "Content-Type: application/json" \
  -d '{"payload": {}}'
```

### Withdraw Funds (Owner Only)
```bash
curl -X POST $ENCLAVE_URL/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "recipient": "0x<OWNER_ADDRESS>",
      "amount": null
    }
  }'
```

## 6. Verify Trades On-Chain

```bash
# Use the update_trading.sh script (create this similar to update_weather.sh)
sh update_trading.sh \
  $TRADING_PACKAGE_ID \
  trading_agent \
  TRADING_AGENT \
  $ENCLAVE_OBJECT_ID \
  "<SIGNATURE_FROM_TRADE_RESPONSE>" \
  <TIMESTAMP> \
  "sell_sui" \
  500000000
```

## Troubleshooting

### Connection Issues
```bash
# Check enclave is running
sudo nitro-cli describe-enclaves

# Check connectivity to Sui RPC
curl -X POST $ENCLAVE_URL/health_check
# Should show: {"endpoints_status":{"fullnode.devnet.sui.io":true}}
```

### Reset Enclave
```bash
sh reset_enclave.sh
make run
sh expose_enclave.sh
```

### Debug Mode
```bash
# Run in debug mode to see logs
make run-debug
```

## Important Notes

1. **Ephemeral Wallet**: The wallet private key exists only in enclave memory. If the enclave restarts, a new wallet is generated and funds must be withdrawn first.

2. **Owner Control**: Only the address specified during `init_wallet` can withdraw funds.

3. **Double Verification**: 
   - Wallet signs transactions for blockchain execution
   - Enclave signs proofs for on-chain verification

4. **Network Configuration**: The `configure_enclave.sh` script MUST be run to set up network access to Sui RPC endpoints.

## Security Considerations

- Private keys never leave the enclave
- All operations are signed by the enclave for verification
- PCRs ensure only verified code is running
- Owner-only withdrawal prevents unauthorized fund access

## Production TODOs

1. Implement actual Sui SDK calls in `mod.rs` (currently using mocks)
2. Add proper error handling and retry logic
3. Implement price fetching before trades
4. Add trading strategies/conditions
5. Parse actual transaction effects for accurate outputs
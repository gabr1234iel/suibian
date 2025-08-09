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

# Test health check
curl http://localhost:3000/health
# Should return: {"pk":"mock_public_key","endpoints_status":{"system":true}}
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

### Execute Mock Trades

```bash
# Mock sell SUI for USDC
curl -X POST http://localhost:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "action": "sell_sui",
      "amount": 500000000,
      "min_output": 900000
    }
  }'

# Mock buy SUI with USDC
curl -X POST http://localhost:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "action": "buy_sui", 
      "amount": 1000000,
      "min_output": 450000000
    }
  }'
```

### Withdraw Funds

```bash
curl -X POST http://localhost:3000/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "recipient": "0x742d35cc6ba1c4bf0bb4d8c7d3c4b0ce15c4c51eb8b6e7e1a1d4b5c3b4f6a7b8",
      "amount": null
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

### 🔄 Mock Implementations (Need Real Implementation)
1. **Trade Execution**: Currently returns mock transaction digests
2. **Withdrawal**: Currently returns mock transaction digests
3. **Move Contract Integration**: No actual DEX contract calls yet

## 4. Comprehensive TODO List for Production

### Priority 1: Core Trading Functionality

#### A. Real Transaction Building
- [ ] **Implement `build_and_execute_swap_usdc_to_sui()`**
  - Use `sui-sdk` to build actual Move call transactions
  - Integrate with a real DEX (e.g., Cetus, Turbos, or custom DEX)
  - Sign transactions with enclave keypair
  - Submit to network and return real transaction digest
  
- [ ] **Implement `build_and_execute_swap_sui_to_usdc()`**
  - Mirror above for opposite direction
  - Handle coin selection and merging logic
  - Implement proper slippage protection

- [ ] **Implement `build_and_execute_withdrawal()`**
  - Build transfer/pay transactions using Sui SDK
  - Support partial and full withdrawals
  - Handle gas payment logic

#### B. DEX Integration
- [ ] **Choose and Deploy DEX Contracts**
  - Deploy on Sui devnet (recommend Cetus or Turbos protocol)
  - Or implement custom AMM contracts in `move/trading/`
  - Update `DEX_PACKAGE_ID` and `POOL_ID` constants

- [ ] **Pool Discovery and Management**
  - Implement pool discovery for SUI/USDC pairs
  - Handle multiple liquidity pools
  - Pool health checks and selection logic

- [ ] **Price and Liquidity Checks**
  - Fetch current pool prices before trades
  - Implement minimum liquidity checks
  - Calculate expected output amounts

#### C. Enhanced Wallet Management
- [ ] **Multi-Coin Support**
  - Support for more token types beyond SUI/USDC
  - Dynamic coin type discovery
  - Proper coin metadata handling

- [ ] **Gas Management**
  - Implement intelligent gas estimation
  - Reserve SUI for gas fees
  - Handle gas payment edge cases

### Priority 2: Trading Logic and Safety

#### A. Trading Strategies
- [ ] **Price Oracle Integration**
  - Integrate with Pyth or Switchboard price feeds
  - Implement price deviation checks
  - Market making strategies

- [ ] **Order Management**
  - Support for limit orders (if DEX supports)
  - Order book integration
  - Position sizing logic

- [ ] **Risk Management**
  - Maximum trade size limits
  - Daily volume limits per wallet
  - Slippage protection mechanisms

#### B. Advanced Features
- [ ] **Multi-Signature Support**
  - Support for multi-sig wallet ownership
  - Threshold signature schemes
  - Approval workflows

- [ ] **Batch Operations**
  - Batch multiple trades in single transaction
  - Gas optimization for multiple operations
  - Atomic swap guarantees

### Priority 3: Production Operations

#### A. Monitoring and Logging
- [ ] **Trade Monitoring**
  - Real-time trade execution monitoring
  - Failed transaction analysis
  - Performance metrics collection

- [ ] **Health Monitoring**
  - RPC endpoint health checks
  - Balance monitoring and alerts
  - Enclave health diagnostics

#### B. Error Handling and Recovery
- [ ] **Robust Error Handling**
  - Retry logic for failed RPC calls
  - Transaction failure recovery
  - Network partition handling

- [ ] **State Recovery**
  - Wallet state persistence (encrypted)
  - Recovery from enclave restarts
  - Backup and restore procedures

### Priority 4: Security and Compliance

#### A. Enhanced Security
- [ ] **Signature Verification**
  - Implement proper message signing
  - Verify all incoming requests
  - Nonce-based replay protection

- [ ] **Access Control**
  - Owner-only operations enforcement
  - Role-based access control
  - API key management (if needed)

#### B. Audit and Compliance
- [ ] **Transaction Logging**
  - Immutable trade logs
  - Compliance reporting
  - Audit trail generation

- [ ] **Security Audits**
  - Code review and security audit
  - Penetration testing
  - Formal verification (for Move contracts)

### Priority 5: User Experience

#### A. API Improvements
- [ ] **Better Error Messages**
  - User-friendly error descriptions
  - Detailed failure reasons
  - Suggested corrective actions

- [ ] **API Documentation**
  - Complete OpenAPI/Swagger spec
  - Example requests/responses
  - SDK generation for clients

#### B. Integration Support
- [ ] **Webhook Support**
  - Trade completion notifications
  - Balance change alerts
  - System status updates

- [ ] **GraphQL API**
  - Flexible querying interface
  - Real-time subscriptions
  - Historical data access

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

1. **Real vs Mock**: Currently balance fetching is REAL (connects to Sui devnet), but trade execution is MOCK (returns fake transaction digests)

2. **Ephemeral Wallet**: The wallet private key exists only in enclave memory. If the enclave restarts, a new wallet is generated

3. **Owner Control**: Only the address specified during `init_wallet` can withdraw funds

4. **Devnet Testing**: All testing should be done on Sui devnet first before mainnet

5. **Gas Costs**: Remember to account for Sui gas costs in all transaction building

6. **Network Dependencies**: Enclave needs network access to Sui RPC endpoints (`fullnode.devnet.sui.io:443`)

This setup provides a solid foundation for a Sui-based trading agent running in AWS Nitro Enclaves, with real blockchain integration for balance checking and a clear path forward for implementing full trading functionality.
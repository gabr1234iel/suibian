# Nautilus Trading Agent: Verifiable DEX Trading on Sui

A **secure and verifiable trading agent** built on the [Nautilus framework](https://docs.sui.io/concepts/cryptography/nautilus) for **off-chain computation on Sui**. This trading agent runs inside AWS Nitro Enclaves and executes real DEX swaps on the Sui blockchain with cryptographic proof of integrity.

## 🚀 Quick Start

### Local Development
```bash
# Clone and navigate
git clone <this-repo>
cd nautilus-trading-agent/src/nautilus-server

# Build and run trading server locally
cargo build --no-default-features --features trading
RUST_LOG=debug cargo run --bin nautilus-server --no-default-features --features trading
```

The server starts on `localhost:3000` with trading endpoints ready for testing.

## 📊 Live DEX Integration

**Currently integrated with working DEX on Sui Devnet:**
- **DEX Package**: `0x58148fa87d972dd4f2c6110dce24d2320486d7cf56143024c3fae7e3c968961f`
- **Pool ID**: `0xa6a1b60fe6d3c94dcd7533002c46ed122140ade275e8fca1be835a7bdb525aa0`
- **Liquidity**: ~6.978 SUI / ~43.17 USDC
- **Real swaps**: Executes actual blockchain transactions

## 🛠 Trading Endpoints

| Endpoint | Description | Status |
|----------|-------------|--------|
| `POST /init_wallet` | Initialize secure trading wallet | ✅ Working |
| `POST /wallet_status` | Get real-time balances | ✅ Working |
| `POST /execute_trade` | Execute DEX swaps | ✅ Working |
| `POST /simple_transfer` | Transfer SUI | ✅ Working |
| `POST /withdraw` | Withdraw funds | 🔄 Mock |
| `POST /subscription_withdraw` | Subscription manager | 🔄 Mock |

## 💡 Example Usage

```bash
# 1. Initialize wallet
curl -X POST http://localhost:3000/init_wallet \
  -H "Content-Type: application/json" \
  -d '{"payload": {"owner_address": "0x..."}}'

# 2. Check balances  
curl -X POST http://localhost:3000/wallet_status \
  -H "Content-Type: application/json" \
  -d '{"payload": {}}'

# 3. Execute real DEX swap
curl -X POST http://localhost:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{"payload": {"action": "sell_sui", "amount": 90000000, "min_output": 500000}}'
```

## 📖 Documentation

- **[TRADE.md](TRADE.md)**: Complete setup guide, API documentation, and deployment instructions
- **[DEX Integration](dex/)**: Smart contract sources and testing scripts
- **[Nautilus Docs](https://docs.sui.io/concepts/cryptography/nautilus)**: Framework documentation

## ⚡ Key Features

### ✅ Production Ready
- **Real Blockchain Integration**: Executes actual Sui transactions
- **Live Balance Tracking**: Real-time SUI/USDC balances from devnet
- **DEX Integration**: Working swap functionality with slippage protection
- **Secure Key Management**: Ed25519 keypairs generated in enclave memory
- **Error Handling**: Robust transaction failure recovery

### 🔐 Enclave Security  
- **Verifiable Execution**: All trades run inside AWS Nitro Enclaves
- **Attestation Support**: Cryptographic proof of code integrity
- **Private Key Isolation**: Keys never leave secure enclave environment
- **Owner Controls**: Multi-signature and access control ready

### 🌊 Sui Native
- **Sui SDK Integration**: Uses official Sui Rust SDK
- **Move Contract Integration**: Direct interaction with Move smart contracts
- **Gas Management**: Intelligent gas estimation and payment
- **Devnet Testing**: Full devnet integration for safe testing

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Nitro Enclave                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Trading Agent                          │    │
│  │  • Wallet Management (Ed25519)                     │    │
│  │  • DEX Integration (Sui SDK)                       │    │
│  │  • Balance Tracking                                │    │  
│  │  • Transaction Signing                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Attestation Document                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Sui Blockchain                         │
│  • DEX Smart Contracts                                     │
│  • SUI/USDC Liquidity Pools                               │  
│  • Transaction Execution                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Production Deployment

For AWS Nitro Enclave deployment:

```bash
# Configure enclave for trading
sh configure_enclave.sh trading

# Build enclave image  
make EXAMPLE=trading

# Deploy to AWS
make run
```

See [TRADE.md](TRADE.md) for complete deployment instructions.

---

> [!IMPORTANT]
> This trading agent template is provided for educational and development purposes. It has not undergone a security audit and should be thoroughly tested before any production use. THE SOFTWARE IS PROVIDED AS IS WITHOUT WARRANTY OF ANY KIND.

## Contact Us
For questions about Nautilus trading integration, use case discussions, or technical support, contact the Nautilus team on [Sui Discord](https://discord.com/channels/916379725201563759/1361500579603546223).

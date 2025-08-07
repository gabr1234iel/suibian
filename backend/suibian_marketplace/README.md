# SuiBian Marketplace

A decentralized marketplace for AI trading agents on the Sui blockchain, featuring TEE (Trusted Execution Environment) integration for secure automated trading.

## 📋 Table of Contents

- [Overview](#overview)
- [Contract Architecture](#contract-architecture)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [API Reference](#api-reference)
- [Security Features](#security-features)

## 🔍 Overview

SuiBian Marketplace allows users to:

- **Create AI Trading Agents** with configurable parameters
- **Subscribe to agents** with monthly fees
- **Deposit trading funds** to TEE wallets for automated trading
- **Manage subscriptions** and withdrawals securely

### Key Features

- 🤖 **AI Agent Registry** - Create and manage trading agents
- 💳 **Subscription Management** - Pay-per-use subscription model
- 🔒 **TEE Integration** - Secure fund management with Trusted Execution Environment
- 🛡️ **Access Control** - Only subscribed users can deposit funds
- 💰 **Flexible Pricing** - Configurable subscription fees and deposit limits

## 🏗️ Contract Architecture

### 1. AgentRegistry.move

**Purpose**: Manages trading agent creation and metadata

**Key Structs**:

```move
public struct TradingAgent has key, store {
    id: sui::object::UID,
    name: String,
    description: String,
    subscription_fee_per_month: u64,
    min_deposit: u64,
    max_deposit: u64,
    tee_public_key: vector<u8>,
    tee_wallet_address: address,
    creator: address,
    is_active: bool,
    created_at: u64,
    total_subscribers: u64,
}
```

**Main Functions**:

- `create_agent()` - Register a new trading agent
- `update_agent_status()` - Activate/deactivate agent
- `update_agent_metadata()` - Update agent details (creator only)

### 2. SubscriptionManager.move

**Purpose**: Handles user subscriptions and fund deposits

**Key Structs**:

```move
public struct UserSubscription has key, store {
    id: sui::object::UID,
    agent_id: sui::object::ID,
    subscriber: address,
    subscription_end: u64,
    total_deposited: u64,
    is_active: bool,
    subscribed_at: u64,
}

public struct WithdrawalRequest has key, store {
    id: sui::object::UID,
    agent_id: sui::object::ID,
    subscriber: address,
    amount: u64,
    requested_at: u64,
    status: u8, // 0=PENDING, 1=COMPLETED, 2=REJECTED
}
```

**Main Functions**:

- `subscribe_to_agent()` - Subscribe to a trading agent
- `deposit_trading_funds()` - Deposit funds to TEE wallet (subscribers only)
- `request_withdrawal()` - Request withdrawal from TEE
- `mark_withdrawal_completed()` - Mark withdrawal as completed (TEE only)

## 🚀 Getting Started

### Prerequisites

- Sui CLI installed
- Testnet SUI tokens
- Node.js and npm (for testing)

### Deployment

```bash
# Deploy the contracts
sui client publish --gas-budget 100000000

# Note the Package ID and SubscriptionManager ID from deployment output
```

### Configuration

Update the test script with your deployed contract IDs:

```typescript
const PACKAGE_ID = "YOUR_PACKAGE_ID_HERE";
const SUBSCRIPTION_MANAGER_ID = "YOUR_SUBSCRIPTION_MANAGER_ID_HERE";
```

## 🧪 Testing

### Test Script Overview

The comprehensive test script (`create_subscribe_test.ts`) demonstrates the full user flow:

1. **Agent Creation** - Creator registers a new trading agent
2. **User Subscription** - User subscribes with payment
3. **Fund Deposit** - Subscribed user deposits trading funds
4. **Access Control Test** - Unauthorized user fails to deposit (security validation)

### Running Tests

```bash
cd script
npm install
npm start
```

### Test Configuration

The script uses economical amounts for testing:

- **Subscription Fee**: 0.01 SUI
- **Minimum Deposit**: 0.05 SUI
- **Test Deposit Amount**: 0.05 SUI

### Expected Test Output

```
🚀 Starting contract interaction tests...

💰 Initial Balances:
Creator: 1.2147 SUI
User: 1.0503 SUI
Unauthorized User: 2.2286 SUI
TEE Wallet: 0.0000 SUI

📝 Test 1: Creator registering agent...
✅ Agent created successfully with ID: 0x...

👤 Test 2: User subscribing to agent...
✅ User subscribed successfully with ID: 0x...

💰 Test 3: User depositing trading funds...
✅ Trading funds deposited successfully!

🚫 Test 4: Unauthorized user attempting to deposit (should fail)...
✅ SUCCESS: Unauthorized deposit correctly failed!
🔒 Transaction aborted: Move abort (access control working)
```

## 📚 API Reference

### AgentRegistry Functions

#### `create_agent`

Creates a new trading agent.

```move
public entry fun create_agent(
    name: vector<u8>,
    description: vector<u8>,
    subscription_fee_per_month: u64,
    min_deposit: u64,
    max_deposit: u64,
    tee_public_key: vector<u8>,
    tee_wallet_address: address,
    ctx: &mut sui::tx_context::TxContext
)
```

#### `update_agent_metadata`

Updates agent metadata (creator only).

```move
public entry fun update_agent_metadata(
    agent: &mut TradingAgent,
    mut name: std::option::Option<vector<u8>>,
    mut description: std::option::Option<vector<u8>>,
    mut subscription_fee: std::option::Option<u64>,
    ctx: &mut sui::tx_context::TxContext
)
```

### SubscriptionManager Functions

#### `subscribe_to_agent`

Subscribe to a trading agent with payment.

```move
public entry fun subscribe_to_agent(
    agent: &mut TradingAgent,
    manager: &mut SubscriptionManager,
    payment: Coin<SUI>,
    subscription_duration_days: u64,
    ctx: &mut sui::tx_context::TxContext
)
```

#### `deposit_trading_funds`

Deposit funds to TEE wallet (subscribers only).

```move
public entry fun deposit_trading_funds(
    agent: &TradingAgent,
    manager: &SubscriptionManager,
    subscription: &mut UserSubscription,
    deposit: Coin<SUI>,
    ctx: &mut sui::tx_context::TxContext
)
```

## 🛡️ Security Features

### Access Control

- **Agent Updates**: Only creators can modify their agents
- **Fund Deposits**: Only subscribed users can deposit trading funds
- **Subscription Validation**: Checks subscriber address, agent ID, and active status
- **TEE Signature Verification**: Withdrawals require valid TEE signatures

### Error Codes

```move
const ENotCreator: u64 = 1;        // Not the agent creator
const EAgentNotActive: u64 = 2;    // Agent is inactive
const EInvalidTEEKey: u64 = 3;     // Invalid TEE public key
const ENotSubscribed: u64 = 1;     // User not subscribed
const EInsufficientPayment: u64 = 2; // Payment too low
const EDepositTooLow: u64 = 4;     // Deposit below minimum
const EDepositTooHigh: u64 = 5;    // Deposit above maximum
const ENotSubscriber: u64 = 6;     // Wrong subscriber address
```

### TEE Integration

- **Secure Fund Storage**: Funds are transferred to TEE-controlled wallets
- **Signature Verification**: Withdrawal completions require TEE signatures
- **Transparent Operations**: All fund movements are tracked via events

## 🔧 Development

### Building

```bash
sui move build
```

### Testing Locally

```bash
sui move test
```

### Publishing

```bash
sui client publish --gas-budget 100000000
```

## 📄 License

This project is licensed under the MIT License.

# SuiBian

SuiBian is a decentralised platform for creating, deploying, and subscribing to autonomous trading agents on the Sui blockchain. It features a modern Next.js frontend, robust backend services, and secure on-chain smart contracts with TEE (Trusted Execution Environment) integration.

---

## Table of Contents

- [SuiBian](#suibian)
  - [Table of Contents](#table-of-contents)
  - [Project Structure](#project-structure)
  - [Frontend](#frontend)
    - [zkLogin Integration](#zklogin-integration)
    - [Walrus Integration](#walrus-integration)
    - [Setup](#setup)
      - [Prerequisites](#prerequisites)
      - [Installation](#installation)
      - [Running Locally](#running-locally)
      - [Environment Variables](#environment-variables)
  - [Backend \& Smart Contracts](#backend--smart-contracts)
    - [Architecture](#architecture)
    - [Key Modules](#key-modules)
      - [Agent Registry](#agent-registry)
      - [Subscription Management](#subscription-management)
      - [Slashing \& Insurance](#slashing--insurance)
      - [Validation Tasks](#validation-tasks)
  - [Devnet Deployment Information](#devnet-deployment-information)
    - [Marketplace](#marketplace)
    - [Dex](#dex)

---

## Project Structure

```
.
├── avs/                  # On-chain Move smart contracts and scripts
│   └── avs_on_chain/
├── backend/              # Off-chain backend services and marketplace logic
├── frontend/             # Next.js frontend (React, TailwindCSS)
├── nautilus-trading-agent/ # TEE-based trading agent with AWS Nitro Enclave
│   ├── move/             # Move smart contracts for enclave verification
│   ├── src/              # Rust enclave implementation
│   └── dex/              # DEX integration contracts
```

---

## Frontend

### zkLogin Integration

- Integrates Sui zkLogin for passwordless, privacy-preserving user authentication.
- Users can sign in with supported OAuth providers (e.g., Google) without exposing private keys.
- Authentication state is managed globally and used for secure agent interactions.
- See implementation in `frontend/components/auth/` and related hooks.

### Walrus Integration

- Integrates Walrus for storing user's salt to generate their zkLogin proof for their login
- Because of the nature of zkLogin, the SUI address generated will always be different if a different salt value is used. Thus, the user's salt value is stored in Walrus to ensure the same salt value used for every login.
- This allows the user to always have the same SUI address while using the same OAuth login.

### Setup

#### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

#### Installation

```sh
cd frontend
npm install
# or
yarn install
```

#### Running Locally

```sh
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

#### Environment Variables

- Copy `.env.example` to `.env` and fill in required values (see `frontend/.env`) for Firebase

## Backend & Smart Contracts

### Architecture

- **Smart Contracts**: Written in Move, deployed on Sui. Located in [`avs/avs_on_chain`](avs/avs_on_chain).
- **Backend Services**: Off-chain services for agent management, TEE communication, and marketplace logic. Located in [`backend/`](backend/).
- **TEE Integration**: Integrates with Trusted Execution Environments for secure, verifiable computation via AWS Nitro Enclaves.

### Key Modules

#### Agent Registry

- Manages agent creation, metadata, and ownership.
- Supports agent subscription and fee logic.

#### Subscription Management

- Allows users to subscribe to agents, enforcing fee payments and access control.
- Tracks subscriber lists and agent performance.

#### Slashing & Insurance

- Implements validator slashing for misbehavior.
- Maintains an insurance fund to reward correct validators and compensate for slashing events.
- See [`slashing.move`](avs/avs_on_chain/sources/slashing.move) for logic:
  - `reward_validator`: Rewards correct votes.
  - `slash_validator_with_insurance`: Slashes incorrect validators, adds to insurance fund.
  - Getters for insurance fund balance, slash rate, rewards, etc.

#### Validation Tasks

- Assigns and tracks validation tasks for agents and validators.
- Handles consensus and voting logic.

---

## Nautilus Trading Agent

The Nautilus Trading Agent represents a production-ready implementation of a TEE-based autonomous trading system running in AWS Nitro Enclaves with full blockchain integration.

### AWS Nitro Enclave Deployment

#### Infrastructure
- **AWS EC2 Instance**: `47.129.86.96` (m5.xlarge with Nitro Enclaves enabled)
- **Enclave CID**: 18
- **Memory Allocation**: 512 MiB
- **CPU Allocation**: 2 cores (CPU IDs: 1, 3)
- **Port Exposure**: 3000 (globally accessible)

#### Security Features
- **Reproducible Builds**: Identical PCR values across different build environments
- **Isolated Execution**: Private keys never leave the secure enclave
- **VSOCK Communication**: Secure host-enclave communication protocol
- **Attestation Document**: Cryptographic proof of enclave integrity

### Smart Contract Integration

#### Core Packages

**Enclave Framework Package**
- **Package ID**: `0x9a9061d46c3fd8a08df5f31c09ef32867d8f4f51dac7cf23b36381fcecdcef82`
- **Module**: `enclave::enclave`
- **Purpose**: Core enclave verification infrastructure, PCR management, signature validation

**Trading Agent Package**
- **Package ID**: `0xb66ee07ed5037f71b209a9d068a84d73520bd92837924e065f9d02b537950eab`
- **Module**: `app::trading_agent`  
- **Purpose**: Trading logic, wallet management, DEX integration, onchain verification

#### Key Objects

**Administrative Objects**
- **Cap Object**: `0xfb58b7ea48ac298c3669116a49f692dd0d482bbdad4485518af065c601363b6e` (Admin control capability)
- **Enclave Config**: `0x7afdb87c0421b3e44b18300c64ee322349705ca9815461f41fc06933c536ae5d` (PCR storage & verification)
- **Enclave Instance**: `0x2287e4a6fa3bd8b33ca734dc78ced5a5a2958e127b1bc4b0816b9bee1b8d5a97` (Public key verification)

### PCR Values & Security

#### Platform Configuration Registers (PCRs)
PCRs provide cryptographic measurement of the enclave's integrity:

```bash
PCR0: 33bd0d71ef8fa2a1308f5f2f26004f3b045316de37f30c62da9d8faf0a5a9bda7056622b5dc23332699e4ef0c7974926
PCR1: 33bd0d71ef8fa2a1308f5f2f26004f3b045316de37f30c62da9d8faf0a5a9bda7056622b5dc23332699e4ef0c7974926  
PCR2: 21b9efbc184807662e966d34f390821309eeac6802309798826296bf3e8bec7c10edb30948c90ba67310f7b964fc500a
```

**What Each PCR Represents:**
- **PCR0**: Enclave image file hash (varies by build environment)
- **PCR1**: Enclave kernel hash (varies by build environment)  
- **PCR2**: Application code hash (identical across builds = reproducible)

**Security Guarantees:**
- **Code Integrity**: PCR2 matching confirms identical application logic
- **Attestation Chain**: AWS root certificate validates enclave authenticity  
- **Signature Verification**: All trading responses cryptographically signed by enclave
- **Owner Authorization**: Only designated owner can withdraw funds

#### Verification Process
1. **Deployment**: PCR values registered onchain during deployment
2. **Attestation**: Enclave provides cryptographic attestation document
3. **Registration**: Public key extracted and verified against PCRs
4. **Operation**: All trading signatures verified against registered public key

### Live Endpoints

#### Base URL
```
http://47.129.86.96:3000
```

#### GET Endpoints
```bash
# Health check
curl http://47.129.86.96:3000/ping
# Response: "Trading Agent TEE v1.0 - Ready!"

# System status
curl http://47.129.86.96:3000/health

# Cryptographic attestation document
curl http://47.129.86.96:3000/attestation
```

#### POST Endpoints (Cryptographically Signed)
```bash
# Initialize trading wallet
curl -X POST http://47.129.86.96:3000/init_wallet \
  -H "Content-Type: application/json" \
  -d '{"payload": {"owner_address": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5"}}'

# Check wallet status and balances
curl -X POST http://47.129.86.96:3000/wallet_status \
  -H "Content-Type: application/json" \
  -d '{"payload": {}}'

# Execute DEX trades
curl -X POST http://47.129.86.96:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{"payload": {"action": "sell_sui", "amount": 90000000, "min_output": 500000}}'

# Withdraw funds (owner only)
curl -X POST http://47.129.86.96:3000/withdraw \
  -H "Content-Type: application/json" \
  -d '{"payload": {"recipient": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5", "amount": 500000000, "coin_type": "sui"}}'

# Simple SUI transfer
curl -X POST http://47.129.86.96:3000/simple_transfer \
  -H "Content-Type: application/json" \
  -d '{"payload": {"recipient": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5", "amount": 100000000}}'

# Subscription-based withdrawal
curl -X POST http://47.129.86.96:3000/subscription_withdraw \
  -H "Content-Type: application/json" \
  -d '{"payload": {"recipient": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5", "amount": 100000000, "coin_type": "sui"}}'
```

#### Response Format
All trading endpoints return cryptographically signed responses:
```json
{
  "response": {
    "data": {
      "transaction_digest": "0x...",
      "action": "sell_sui",
      "input_amount": 90000000,
      "output_amount": 550000
    },
    "timestamp_ms": 1703001234567,
    "intent": "ProcessData"
  },
  "signature": "0xabc123..." // Ed25519 signature verifiable onchain
}
```

### DEX Integration

**Sui DEX Constants:**
- **Pool ID**: `0xc5f6cc6b19acbfab90f17b1e5b0c2a7bd18e0b0a1a5a3b3c5d5e7f8a9b0c1d2e`
- **DEX Package**: `0x742d35cc6ba1c4bf0bb4d8c7d3c4b0ce15c4c51eb8b6e7e1a1d4b5c3b4f6a7b8`
- **USDC Token**: `0x742d35cc6ba1c4bf0bb4d8c7d3c4b0ce15c4c51eb8b6e7e1a1d4b5c3b4f6a7b8::usdc::USDC`

**Amount Units:**
- **SUI**: 1 SUI = 1,000,000,000 MIST (9 decimals)
- **USDC**: 1 USDC = 1,000,000 µUSDC (6 decimals)

---

## Devnet Deployment Information

### Marketplace

- **Package ID:** `0x705da1cf5e87858f32787d79745381f2f523c8006794ef209169c7472afb09fa`
- **Subscription Manager ID:** `0xc212a5ecf3febcc7e534e2f4cbcb722388bd7dd5974c78c12142612b63cae12a`

- **Package ID:** `0xfd6a00339d853aae2473bab92a11d2db322604e33339bad08e8e52f97470fa9d`
- **Subscription Manager ID:** `0x83e0dd1f1df2c174f353a3b0cd0fc03141690f3f2ebd7bfbbea409f8db409454`
- **DEPLOYER_CAP:** `0x5bbdc2609e23cd3e82f07d9a0c0be2191e1343728d8234d3f55da4d8d09e679a`

### Nautilus Trading Agent (TEE)

**Enclave Framework:**
- **Package ID:** `0x9a9061d46c3fd8a08df5f31c09ef32867d8f4f51dac7cf23b36381fcecdcef82`
- **Module:** `enclave::enclave`

**Trading Agent:**
- **Package ID:** `0xb66ee07ed5037f71b209a9d068a84d73520bd92837924e065f9d02b537950eab`  
- **Module:** `app::trading_agent`
- **Cap Object:** `0xfb58b7ea48ac298c3669116a49f692dd0d482bbdad4485518af065c601363b6e`
- **Enclave Config:** `0x7afdb87c0421b3e44b18300c64ee322349705ca9815461f41fc06933c536ae5d`
- **Enclave Instance:** `0x2287e4a6fa3bd8b33ca734dc78ced5a5a2958e127b1bc4b0816b9bee1b8d5a97`

**Live Endpoints:**
- **Base URL:** `http://47.129.86.96:3000`
- **Status:** ✅ Active (24/7 global access)

### Dex

- **PACKAGE_ID:** `0x58148fa87d972dd4f2c6110dce24d2320486d7cf56143024c3fae7e3c968961f`
- **POOL_ID:** `0xa6a1b60fe6d3c94dcd7533002c46ed122140ade275e8fca1be835a7bdb525aa0`
- **ADMIN_CAP_ID:** `0x6f0d09a193b2ecc8a873f753aa56fce4629e72eb66ae0c47df553767ff788f18`
- **TREASURY_CAP_ID:** `0xd058176e995cd09c255a07ef0b6a63ba812f1eb72eeb8eabd991e885d2e9cf0e`

---


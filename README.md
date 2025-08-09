# SuiBian

SuiBian is a decentralised platform for creating, deploying, and subscribing to autonomous trading agents on the Sui blockchain. It features a modern Next.js frontend, robust backend services, and secure on-chain smart contracts with TEE (Trusted Execution Environment) integration.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Frontend](#frontend)
  - [zkLogin Integration](#zklogin-integration)
  - [Walrus Integration](#walrus-integration)
  - [Setup](#setup)
- [Backend & Smart Contracts](#backend--smart-contracts)
  - [Architecture](#architecture)
  - [Key Modules](#key-modules)
  - [TEE Integration](#tee-integration)
- [Testing & Development](#testing--development)
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
- See [`validation_task.move`](avs

## Devnet Deployment Information

### Marketplace

- **Package ID:** `0x705da1cf5e87858f32787d79745381f2f523c8006794ef209169c7472afb09fa`
- **Subscription Manager ID:** `0xc212a5ecf3febcc7e534e2f4cbcb722388bd7dd5974c78c12142612b63cae12a`

- **Package ID:** `0xfd6a00339d853aae2473bab92a11d2db322604e33339bad08e8e52f97470fa9d`
- **Subscription Manager ID:** `0x83e0dd1f1df2c174f353a3b0cd0fc03141690f3f2ebd7bfbbea409f8db409454`
- **DEPLOYER_CAP:** `0x5bbdc2609e23cd3e82f07d9a0c0be2191e1343728d8234d3f55da4d8d09e679a`

---

### Dex

- **PACKAGE_ID:** `0x58148fa87d972dd4f2c6110dce24d2320486d7cf56143024c3fae7e3c968961f`
- **POOL_ID:** `0xa6a1b60fe6d3c94dcd7533002c46ed122140ade275e8fca1be835a7bdb525aa0`
- **ADMIN_CAP_ID:** `0x6f0d09a193b2ecc8a873f753aa56fce4629e72eb66ae0c47df553767ff788f18`
- **TREASURY_CAP_ID:** `0xd058176e995cd09c255a07ef0b6a63ba812f1eb72eeb8eabd991e885d2e9cf0e`

---

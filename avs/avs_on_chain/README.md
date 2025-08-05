# AVS (Autonomous Validation System) on Sui

A simplified on-chain AVS (Autonomous Validation System) built on Sui Move, enabling decentralized validation of arbitrary tasks through a network of validators.

## Current Implementation vs EigenLayer Standard

### Current MVP Features
- **Staking**: Simple direct staking with SUI tokens (min 0.01 SUI)
- **Consensus**: Basic majority voting with configurable thresholds
- **Validation**: Task-specific validator assignment with approve/reject voting
- **Economics**: Fixed rewards (0.01 SUI) and basic slashing (5-25%)
- **Reputation**: Simple scoring system (0-100) based on performance

### Key Differences from EigenLayer
- No delegation pools (vs EigenLayer's dual-layer staking)
- Single-chain focused (vs cross-chain operations)
- Fixed validator set per task (vs universal participation)
- Simple fixed rewards (vs dynamic incentives)

## Architecture

### On-Chain Components (Sui Move)
Located in `sources/` directory:

- **`validator_registry.move`** - Core validator management
  - Validator registration/deactivation with stake requirements
  - Stake withdrawal and slashing mechanisms
  - Reputation tracking and validator state management
  
- **`validation_task.move`** - Task lifecycle management
  - Task creation with assigned validators
  - Vote submission with transaction proof validation
  - Task completion and status tracking
  
- **`slashing.move`** - Economic incentives and penalties
  - Insurance fund management for rewards/slashing
  - Automated reward distribution to correct validators
  - Slashing execution with insurance fund integration
  
- **`consensus.move`** - Voting consensus algorithms
  - Simple majority voting with configurable thresholds
  - Consensus result determination and finalization
  
- **`types.move`** - Shared data structures
  - TradeData struct for transfer validation
  - Common constants and utility functions

### Off-Chain Components (TypeScript)
Located in `script/` directory:

- **`interact.ts`** - Main interaction script and SDK
  - Complete AVS simulation with multiple validators
  - Transaction proof validation (off-chain verification)
  - Automated validator registration and task execution
  - Real-world scenario simulation (including slashing)

## Usage

### Deploy Contract
```bash
# Build the contract
sui move build

# Deploy to network
sui client publish --gas-budget 100000000
```

### Export Private Key
```bash
# Export your private key for use in scripts
sui keytool export --key-identity YOUR_ADDRESS
```

### Send Sui to another address
```bash
sui client pay-sui \
  --recipients 0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be \
  --amounts 100000000 \
  --input-coins 0x8f943cb4cd7d53769a293a9834f3e068b7e1440d3074908bf8eeca244dc4e2f2 \
  --gas-budget 10000000
```

### Directory Structure
```
avs_on_chain/
├── sources/             # Sui Move smart contracts (on-chain)
│   ├── validator_registry.move    # Validator management
│   ├── validation_task.move       # Task lifecycle
│   ├── slashing.move              # Economic incentives
│   ├── consensus.move             # Voting algorithms
│   └── types.move                 # Shared data structures
├── script/              # TypeScript interaction layer (off-chain)
│   ├── interact.ts                # Main SDK and simulation
│   ├── package.json               # Node.js dependencies
│   └── node_modules/              # Dependencies
```


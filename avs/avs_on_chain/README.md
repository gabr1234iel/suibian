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

## Priority Improvements
1. **Validation**
   - Fair task distribution algorithm
   - Quorum-based consensus
   - Timeout mechanisms

2. **Economics**
   - Dynamic rewards based on task complexity
   - Graduated slashing based on violations
   - Delegation pools for smaller holders

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

### Validator Operations
1. Register as validator with minimum stake
2. Participate in validation tasks
3. Submit votes on assigned tasks
4. Receive rewards for correct validations
5. Monitor reputation score

### Task Creation & Management
1. Create validation tasks with specific parameters
2. Assign validators to tasks
3. Monitor voting progress
4. Check consensus results
5. View slashing/reward outcomes

### Directory Structure
```
avs/
├── avs_on_chain/
│   ├── sources/         # Move smart contracts
│   ├── tests/           # Move test files
│   └── script/          # TypeScript interaction scripts
```


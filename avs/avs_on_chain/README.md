# AVS (Autonomous Validation System) on Sui

This is an on-chain validation system built on Sui Move that enables decentralized validation of arbitrary tasks through a network of validators. The system includes staking, consensus, and slashing mechanisms to ensure validator honesty.

## Core Components

### Validator Registry
- Validators must stake SUI tokens to participate (minimum 0.01 SUI)
- Each validator maintains a reputation score (0-100) based on validation performance
- Validators can be slashed for incorrect validations

### Consensus Mechanism
- Simple majority voting system
- Alternative threshold-based consensus available (e.g., requiring 67% approval)
- All assigned validators must vote before consensus can be reached
- Consensus results trigger automatic rewards/slashing

### Slashing & Rewards
- Base reward: 0.01 SUI for correct validations
- Slash rate: 5% of stake for incorrect validations (configurable up to 25%)
- Insurance fund for validator rewards
- Automatic execution of rewards/slashing after consensus

### Validation Tasks
- Support for arbitrary validation tasks
- Each task assigned to specific validators
- Validators vote approve/reject with confidence scores
- Task status tracking (pending → active → completed)

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

## Configuration

Key parameters in the system:
- Minimum stake: 0.01 SUI
- Base reward: 0.01 SUI per correct validation
- Default slash rate: 5% of stake
- Maximum slash rate: 25% of stake
- Reputation score range: 0-100

## Development

The project includes:
- Smart contracts in Move
- TypeScript interaction scripts
- Test suite for all components

### Directory Structure
```
avs/
├── avs_on_chain/
│   ├── sources/         # Move smart contracts
│   ├── tests/           # Move test files
│   └── script/          # TypeScript interaction scripts
```

## Typescript interaction script result
```
Loaded address: 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5
Current address: 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5
Balance: 849534184
Registering validator with stake: 10000000
✅ Registered as validator!
Transaction: FVqv8pzScjynzB1ht6wHJttzxi27MQa2UsTjaabod7TV
Events: [
  {
    id: {
      txDigest: 'FVqv8pzScjynzB1ht6wHJttzxi27MQa2UsTjaabod7TV',
      eventSeq: '0'
    },
    packageId: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27',
    transactionModule: 'validator_registry',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27::validator_registry::ValidatorRegistered',
    parsedJson: {
      stake_amount: '10000000',
      timestamp: '1754256101699',
      validator: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5'
    },
    bcsEncoding: 'base64',
    bcs: 'kdbeatQ2PsaUe9Yhrt0uDe13y9G4YHpG4jfr/Qgml/WAlpgAAAAAAEPRz3GYAQAA'
  }
]
Creating validation task for agent: agent_123
✅ Created validation task!
Transaction: DevhfcJ9agYJBSZSZsbCtZitsuxMUWreiBEXc86UtkE3
Looking for task ID in result...
Object change: {
  type: 'mutated',
  sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
  owner: {
    AddressOwner: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5'
  },
  objectType: '0x2::coin::Coin<0x2::sui::SUI>',
  objectId: '0x8f943cb4cd7d53769a293a9834f3e068b7e1440d3074908bf8eeca244dc4e2f2',
  version: '349180318',
  previousVersion: '349180317',
  digest: 'j3PyvPxJ8F8RV7SYiqWRMydGYKTC8v8m83SdX9da1rX'
}
Object change: {
  type: 'created',
  sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
  owner: { Shared: { initial_shared_version: 349180318 } },
  objectType: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27::validation_task::ValidationTask',
  objectId: '0x6c067be98bf5dbb1f2fc0619240bcefc9a3dd09cf90742138e5b73a7b413eae0',
  version: '349180318',
  digest: 'CNxbsTS2hwiwCEnFjy3v5QvmjtY8i98Z8C3vJTJXhUG6'
}
Found ValidationTask object: 0x6c067be98bf5dbb1f2fc0619240bcefc9a3dd09cf90742138e5b73a7b413eae0
Task ID: 0x6c067be98bf5dbb1f2fc0619240bcefc9a3dd09cf90742138e5b73a7b413eae0
🕐 Waiting 3 seconds for object to be available...
Voting APPROVE on task: 0x6c067be98bf5dbb1f2fc0619240bcefc9a3dd09cf90742138e5b73a7b413eae0
✅ Vote submitted!
Transaction: Bp3hAXVagN9V9Pkr5zHU6wxZ48BsTHDzbgBhmqtBmCMe
Checking consensus for task: 0x6c067be98bf5dbb1f2fc0619240bcefc9a3dd09cf90742138e5b73a7b413eae0
✅ Consensus checked!
Transaction: PmYhvGxvnkwiz5fLAcpq6sFZ1gBbA7kM4K5fpzynosc
Events: [
  {
    id: {
      txDigest: 'PmYhvGxvnkwiz5fLAcpq6sFZ1gBbA7kM4K5fpzynosc',
      eventSeq: '0'
    },
    packageId: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27',
    transactionModule: 'consensus',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27::validation_task::TaskCompleted',
    parsedJson: {
      approve_votes: '1',
      consensus_result: true,
      task_id: '0x6c067be98bf5dbb1f2fc0619240bcefc9a3dd09cf90742138e5b73a7b413eae0',
      total_votes: '1'
    },
    bcsEncoding: 'base64',
    bcsEncoding: 'base64',
    bcs: 'bAZ76Yv127Hy/AYZJAvO/Jo90Jz5B0ITjltzp7QT6uABAQAAAAAAAAABAAAAAAAAAA=='
  },
  {
    id: {
      txDigest: 'PmYhvGxvnkwiz5fLAcpq6sFZ1gBbA7kM4K5fpzynosc',
      eventSeq: '1'
    },
    packageId: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27',
    transactionModule: 'consensus',
    bcs: 'bAZ76Yv127Hy/AYZJAvO/Jo90Jz5B0ITjltzp7QT6uABAQAAAAAAAAABAAAAAAAAAA=='
  },
  {
    id: {
      txDigest: 'PmYhvGxvnkwiz5fLAcpq6sFZ1gBbA7kM4K5fpzynosc',
      eventSeq: '1'
    },
    packageId: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27',
    transactionModule: 'consensus',
      eventSeq: '1'
    },
    packageId: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27',
    transactionModule: 'consensus',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27::consensus::ConsensusReached',
    parsedJson: {
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27::consensus::ConsensusReached',
    parsedJson: {
    type: '0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27::consensus::ConsensusReached',
    parsedJson: {
    parsedJson: {
      approve_votes: '1',
      reject_votes: '0',
      result: true,
      task_id: '0x6c067be98bf5dbb1f2fc0619240bcefc9a3dd09cf90742138e5b73a7b413eae0',
      total_votes: '1'
    },
    bcsEncoding: 'base64',
    bcs: 'bAZ76Yv127Hy/AYZJAvO/Jo90Jz5B0ITjltzp7QT6uABAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAA'
  }
]
```
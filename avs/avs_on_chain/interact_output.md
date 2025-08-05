```bash
jiayi@LAPTOP-SESSTBMF:/mnt/c/Users/User/Documents/buidl/suibian/avs/avs_on_chain/script$ node interact.ts
(node:1066) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Loaded address: 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5
Loaded address: 0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be
Loaded address: 0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf

--- Validator Addresses ---
Validator 1 (admin): 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5
Validator 2: 0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be
Validator 3: 0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf

Validator 1 balance: 2.182378368 SUI

Validator 2 balance: 0.183448932 SUI

Validator 3 balance: 0.161492692 SUI

--- Registering Validators ---
Attempting to register Validator 1...
Registering validator with stake: 20000000
✅ Registered as validator!
Transaction: CVJ7aLATvJWjoHSbxCYnSqQmyFauanyjH2orvFA91BgT
Events: [
  {
    id: {
      txDigest: 'CVJ7aLATvJWjoHSbxCYnSqQmyFauanyjH2orvFA91BgT',
      eventSeq: '0'
    },
    packageId: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981',
    transactionModule: 'validator_registry',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981::validator_registry::ValidatorRegistered',
    parsedJson: {
      stake_amount: '20000000',
      timestamp: '1754342502476',
      validator: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5'
    },
    bcsEncoding: 'base64',
    bcs: 'kdbeatQ2PsaUe9Yhrt0uDe13y9G4YHpG4jfr/Qgml/UALTEBAAAAAEww9naYAQAA'
  }
]
✅ Validator 1 registered with 0.02 SUI
Attempting to register Validator 2...
Registering validator with stake: 20000000
✅ Registered as validator!
Transaction: 4A2TpTXveYnuDfw37KDC71xAJ7TH2QKJ87DswieCyZ9A
Events: [
  {
    id: {
      txDigest: '4A2TpTXveYnuDfw37KDC71xAJ7TH2QKJ87DswieCyZ9A',
      eventSeq: '0'
    },
    packageId: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981',
    transactionModule: 'validator_registry',
    sender: '0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be',
    type: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981::validator_registry::ValidatorRegistered',
    parsedJson: {
      stake_amount: '20000000',
      timestamp: '1754342502476',
      validator: '0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be'
    },
    bcsEncoding: 'base64',
    bcs: 'OaNrbbxgNVgUej51IN5uCnbmv/KPN6bV/dG3AV8B8r4ALTEBAAAAAEww9naYAQAA'
  }
]
✅ Validator 2 registered with 0.02 SUI
Attempting to register Validator 3...
Registering validator with stake: 20000000
✅ Registered as validator!
Transaction: F7P6QEa6nDoUqv2SAkgcwZL6WrkZcCuF2pd5qfSEoH2d
Events: [
  {
    id: {
      txDigest: 'F7P6QEa6nDoUqv2SAkgcwZL6WrkZcCuF2pd5qfSEoH2d',
      eventSeq: '0'
    },
    packageId: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981',
    transactionModule: 'validator_registry',
    sender: '0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf',
    type: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981::validator_registry::ValidatorRegistered',
    parsedJson: {
      stake_amount: '20000000',
      timestamp: '1754342502476',
      validator: '0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf'
    },
    bcsEncoding: 'base64',
    bcs: 'yYoZZ10peipzKY1jkgFV9F5s7gmexiVWCd/PLy7NOM8ALTEBAAAAAEww9naYAQAA'
  }
]
✅ Validator 3 registered with 0.02 SUI

--- Creating Validation Task ---
Creating validation task for agent: agent_123
✅ Created validation task!
Transaction: 7HbqMYYFyqm4g8ZmRes5QjfB8fCRpKWipSeG7w2Jsgmq
Looking for task ID in result...
Object change: {
  type: 'mutated',
  sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
  owner: {
    AddressOwner: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5'
  },
  objectType: '0x2::coin::Coin<0x2::sui::SUI>',
  objectId: '0xa99c44b3d13d39ef026252f2dafa1280c289826d7a8d874499e3515a9e892ed9',
  version: '349180429',
  previousVersion: '349180428',
  digest: 'DaKXWG23XGV5vnMJDpz6KFCtRJrmHYAf52XDHrvRCVzo'
}
Object change: {
  type: 'created',
  sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
  owner: { Shared: { initial_shared_version: 349180429 } },
  objectType: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981::validation_task::ValidationTask',
  objectId: '0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d',
  version: '349180429',
  digest: 'EFfF9ndMaE38wNeba1rJfrDEwsNppvwzAZkbYL7rJP4m'
}
Found ValidationTask object: 0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d
Task ID: 0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d
Task created: 0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d

--- Validators Voting ---
Validating and voting APPROVE on task: 0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d
🔍 Validating transaction proof for: CfpHS6YXPAv8usJaKU68YUp12VMWWNpziSeQov66txtz
✅ Transaction proof validation successful
✅ Transaction validation passed
✅ Vote with proof submitted!
Transaction: 8d4g2VQKGLHZ2a1jp6nLzPmp1jmowL17jve6DM7t7atk
Validator 1 voted: APPROVE
Validating and voting APPROVE on task: 0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d
🔍 Validating transaction proof for: CfpHS6YXPAv8usJaKU68YUp12VMWWNpziSeQov66txtz
✅ Transaction proof validation successful
✅ Transaction validation passed
✅ Vote with proof submitted!
Transaction: 6n8VueinfGm8q1Vx2jfuoGodrxMBp1wztNcWrwLMbb1U
Validator 2 voted: APPROVE
Validating and voting REJECT on task: 0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d
🔍 Validating transaction proof for: CfpHS6YXPAv8usJaKU68YUp12VMWWNpziSeQov66txtz
✅ Transaction proof validation successful
✅ Transaction validation passed
✅ Vote with proof submitted!
Transaction: BptYtxD6Ei7AGAFd2ceuuo2TT1L6W76uRGH9KW17A6jS
Validator 3 voted: REJECT (incorrect)
⏳ Waiting for all votes to be fully processed...
🔍 Checking task state before consensus...
Task object content: {
  data: {
    objectId: '0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d',
    version: '349180432',
    digest: 'ALta1qiSVrUaBi1KvXSb1HrV6AdKX9AdE6Ti41DWLi3z',
    content: {
      dataType: 'moveObject',
      type: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981::validation_task::ValidationTask',
      hasPublicTransfer: false,
      fields: [Object]
    }
  }
}

--- Checking Consensus ---
Checking consensus for task: 0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d
✅ Consensus checked!
Transaction: 2W5CFYmzJvVBQRRzksUKRKP6TQmqL4iH9UouEFsyipU5
Events: [
  {
    id: {
      txDigest: '2W5CFYmzJvVBQRRzksUKRKP6TQmqL4iH9UouEFsyipU5',
      eventSeq: '0'
    },
    packageId: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981',
    transactionModule: 'consensus',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981::validation_task::TaskCompleted',
    parsedJson: {
      approve_votes: '2',
      consensus_result: true,
      task_id: '0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d',
      total_votes: '3'
    },
    bcsEncoding: 'base64',
    bcs: 'JnA1f6SyWOi8LM+D4s8K1Zg5SPyJvOPXO9yU07YUQQ0BAwAAAAAAAAACAAAAAAAAAA=='
  },
  {
    id: {
      txDigest: '2W5CFYmzJvVBQRRzksUKRKP6TQmqL4iH9UouEFsyipU5',
      eventSeq: '1'
    },
    packageId: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981',
    transactionModule: 'consensus',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981::consensus::ConsensusReached',
    parsedJson: {
      approve_votes: '2',
      reject_votes: '1',
      result: true,
      task_id: '0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d',
      total_votes: '3'
    },
    bcsEncoding: 'base64',
    bcs: 'JnA1f6SyWOi8LM+D4s8K1Zg5SPyJvOPXO9yU07YUQQ0BAgAAAAAAAAABAAAAAAAAAAMAAAAAAAAA'
  }
]

--- Debugging Validators Before Slashing ---

Checking Validator 1:
Validator 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5 is registered: true
Validator info: {
  stake_amount: 20000000,
  reputation: 100,
  total_validations: 0,
  correct_validations: 0,
  is_active: true
}

Checking Validator 2:
Validator 0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be is registered: true
Validator info: {
  stake_amount: 20000000,
  reputation: 100,
  total_validations: 0,
  correct_validations: 0,
  is_active: true
}

Checking Validator 3:
Validator 0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf is registered: true
Validator info: {
  stake_amount: 20000000,
  reputation: 100,
  total_validations: 0,
  correct_validations: 0,
  is_active: true
}

--- Executing Slashing ---
Executing slashing for task: 0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d
✅ Slashing executed!
Transaction: DK3oitnKNgFuBeMxr2deujjefvVXG1rGjdzRTzguMeWX
Events: [
  {
    id: {
      txDigest: 'DK3oitnKNgFuBeMxr2deujjefvVXG1rGjdzRTzguMeWX',
      eventSeq: '0'
    },
    packageId: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981',
    transactionModule: 'slashing',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981::validator_registry::ValidatorSlashed',
    parsedJson: {
      new_stake: '19000000',
      slash_amount: '1000000',
      validator: '0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf'
    },
    bcsEncoding: 'base64',
    bcs: 'yYoZZ10peipzKY1jkgFV9F5s7gmexiVWCd/PLy7NOM9AQg8AAAAAAMDqIQEAAAAA'
  },
  {
    id: {
      txDigest: 'DK3oitnKNgFuBeMxr2deujjefvVXG1rGjdzRTzguMeWX',
      eventSeq: '1'
    },
    packageId: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981',
    transactionModule: 'slashing',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981::slashing::ValidatorSlashedEvent',
    parsedJson: {
      slash_amount: '1000000',
      task_id: '0x2670357fa4b258e8bc2ccf83e2cf0ad5983948fc89bce3d73bdc94d3b614410d',
      validator: '0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf'
    },
    bcsEncoding: 'base64',
    bcs: 'yYoZZ10peipzKY1jkgFV9F5s7gmexiVWCd/PLy7NOM9AQg8AAAAAACZwNX+ksljovCzPg+LPCtWYOUj8ibzj1zvclNO2FEEN'
  },
  {
    id: {
      txDigest: 'DK3oitnKNgFuBeMxr2deujjefvVXG1rGjdzRTzguMeWX',
      eventSeq: '2'
    },
    packageId: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981',
    transactionModule: 'slashing',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0xc61c053b1df7e80fd60e04896609d5631f93616d894411d22f5ee37cba50e981::slashing::InsuranceFundUpdated',
    parsedJson: { added_amount: '1000000', new_total: '1000000' },
    bcsEncoding: 'base64',
    bcs: 'QEIPAAAAAABAQg8AAAAAAA=='
  }
]

--- Final Validator Status ---

Validator 1:
  Address: 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5
  Stake: 0.02 SUI
  Reputation: 100
  Active: true
  Balance: 2.148195136 SUI

Validator 2:
  Address: 0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be
  Stake: 0.02 SUI
  Reputation: 100
  Active: true
  Balance: 0.15593384 SUI

Validator 3:
  Address: 0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf
  Stake: 0.019 SUI
  Reputation: 0
  Active: true
  Balance: 0.1339776 SUI

Insurance Fund Balance: 0.001 SUI
```bash
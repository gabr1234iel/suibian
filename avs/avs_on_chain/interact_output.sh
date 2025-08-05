jiayi@LAPTOP-SESSTBMF:/mnt/c/Users/User/Documents/buidl/suibian/avs/avs_on_chain/script$ node interact.ts 
(node:4451) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Loaded address: 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5
Loaded address: 0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be
Loaded address: 0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf

--- Validator Addresses ---
Validator 1 (admin): 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5
Validator 2: 0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be
Validator 3: 0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf

Validator 1 balance: 1.569808816 SUI

Validator 2 balance: 0.25328028 SUI

Validator 3 balance: 0.25328028 SUI

--- Registering Validators ---
Registering validator with stake: 20000000
✅ Registered as validator!
Transaction: BWGJcM8qkZk6UvDUp3jkZy2oNCKTJU5FyUuc6fqZPgLH
Events: [
  {
    id: {
      txDigest: 'BWGJcM8qkZk6UvDUp3jkZy2oNCKTJU5FyUuc6fqZPgLH',
      eventSeq: '0'
    },
    packageId: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9',
    transactionModule: 'validator_registry',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::validator_registry::ValidatorRegistered',
    parsedJson: {
      stake_amount: '20000000',
      timestamp: '1754342502476',
      validator: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5'
    },
    bcsEncoding: 'base64',
    bcs: 'kdbeatQ2PsaUe9Yhrt0uDe13y9G4YHpG4jfr/Qgml/UALTEBAAAAAEww9naYAQAA'
  }
]
Validator 1 registered with 0.02 SUI
Registering validator with stake: 20000000
✅ Registered as validator!
Transaction: 3MeBwPwPN79aqok3mLpdh8qLSSJZkB2dpJKuVaBt7JxJ
Events: [
  {
    id: {
      txDigest: '3MeBwPwPN79aqok3mLpdh8qLSSJZkB2dpJKuVaBt7JxJ',
      eventSeq: '0'
    },
    packageId: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9',
    transactionModule: 'validator_registry',
    sender: '0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::validator_registry::ValidatorRegistered',
    parsedJson: {
      stake_amount: '20000000',
      timestamp: '1754342502476',
      validator: '0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be'
    },
    bcsEncoding: 'base64',
    bcs: 'OaNrbbxgNVgUej51IN5uCnbmv/KPN6bV/dG3AV8B8r4ALTEBAAAAAEww9naYAQAA'
  }
]
Validator 2 registered with 0.02 SUI
Registering validator with stake: 20000000
✅ Registered as validator!
Transaction: HUAsLwX1AvtUwLL7ZnbwFarUxMDfnDSUQYhfuE1fyQvL
Events: [
  {
    id: {
      txDigest: 'HUAsLwX1AvtUwLL7ZnbwFarUxMDfnDSUQYhfuE1fyQvL',
      eventSeq: '0'
    },
    packageId: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9',
    transactionModule: 'validator_registry',
    sender: '0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::validator_registry::ValidatorRegistered',
    parsedJson: {
      stake_amount: '20000000',
      timestamp: '1754342502476',
      validator: '0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf'
    },
    bcsEncoding: 'base64',
    bcs: 'yYoZZ10peipzKY1jkgFV9F5s7gmexiVWCd/PLy7NOM8ALTEBAAAAAEww9naYAQAA'
  }
]
Validator 3 registered with 0.02 SUI

--- Creating Validation Task ---
Creating validation task for agent: agent_123
✅ Created validation task!
Transaction: C631bJDyJaWxaP7YSrsNowLKggmVVDMnWadFvGhSTXG9
Looking for task ID in result...
Object change: {
  type: 'mutated',
  sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
  owner: {
    AddressOwner: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5'
  },
  objectType: '0x2::coin::Coin<0x2::sui::SUI>',
  objectId: '0xa99c44b3d13d39ef026252f2dafa1280c289826d7a8d874499e3515a9e892ed9',
  version: '349180363',
  previousVersion: '349180362',
  digest: '4eXvCMqjLLx5mxmmNi8pjyQvxp97CiEkUhzEFuS17NZS'
}
Object change: {
  type: 'created',
  sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
  owner: { Shared: { initial_shared_version: 349180363 } },
  objectType: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::validation_task::ValidationTask',
  objectId: '0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f',
  version: '349180363',
  digest: 'ERSvrPJUUQ3fJajR7sfucrWsSsMVhqQiDDjP3cukWf1R'
}
Found ValidationTask object: 0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f
Task ID: 0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f
Task created: 0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f

--- Validators Voting ---
Validating and voting APPROVE on task: 0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f
🔍 Validating transaction proof for: CfpHS6YXPAv8usJaKU68YUp12VMWWNpziSeQov66txtz
✅ Transaction proof validation successful
✅ Transaction validation passed
✅ Vote with proof submitted!
Transaction: B8Xdu6x6UwnQAb3bvFawuttt4bza4iiqKKLZEY6HZFGv
Validator 1 voted: APPROVE
Validating and voting APPROVE on task: 0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f
🔍 Validating transaction proof for: CfpHS6YXPAv8usJaKU68YUp12VMWWNpziSeQov66txtz
✅ Transaction proof validation successful
✅ Transaction validation passed
✅ Vote with proof submitted!
Transaction: 5FDyBKpvXgoaw614WmJUxdbLifAtnud2AZ2Yc5wn4kVp
Validator 2 voted: APPROVE
Validating and voting REJECT on task: 0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f
🔍 Validating transaction proof for: CfpHS6YXPAv8usJaKU68YUp12VMWWNpziSeQov66txtz
✅ Transaction proof validation successful
✅ Transaction validation passed
✅ Vote with proof submitted!
Transaction: 6Xki3q2s67VoJhbXWkkKSu63Am1DmBbmmvLTv7PZdPbp
Validator 3 voted: REJECT (incorrect)
⏳ Waiting for all votes to be fully processed...
🔍 Checking task state before consensus...
Task object content: {
  data: {
    objectId: '0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f',
    version: '349180366',
    digest: 'BFDw9JKrqYLuYXiRbqNyX62UouWbTHp1ZGhy1gjEptMa',
    content: {
      dataType: 'moveObject',
      type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::validation_task::ValidationTask',
      hasPublicTransfer: false,
      fields: [Object]
    }
  }
}

--- Checking Consensus ---
Checking consensus for task: 0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f
✅ Consensus checked!
Transaction: 9YqhkT4jKPmZDBKgTS5f5HbgTCBxxjE8NU5yGWTAEsEc
Events: [
  {
    id: {
      txDigest: '9YqhkT4jKPmZDBKgTS5f5HbgTCBxxjE8NU5yGWTAEsEc',
      eventSeq: '0'
    },
    packageId: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9',
    transactionModule: 'consensus',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::validation_task::TaskCompleted',
    parsedJson: {
      approve_votes: '2',
      consensus_result: true,
      task_id: '0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f',
      total_votes: '3'
    },
    bcsEncoding: 'base64',
    bcs: 'ZVttSA76Beik/kfKUNAJi7CWTfFpir51lNgVvmBK0p8BAwAAAAAAAAACAAAAAAAAAA=='
  },
  {
    id: {
      txDigest: '9YqhkT4jKPmZDBKgTS5f5HbgTCBxxjE8NU5yGWTAEsEc',
      eventSeq: '1'
    },
    packageId: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9',
    transactionModule: 'consensus',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::consensus::ConsensusReached',
    parsedJson: {
      approve_votes: '2',
      reject_votes: '1',
      result: true,
      task_id: '0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f',
      total_votes: '3'
    },
    bcsEncoding: 'base64',
    bcs: 'ZVttSA76Beik/kfKUNAJi7CWTfFpir51lNgVvmBK0p8BAgAAAAAAAAABAAAAAAAAAAMAAAAAAAAA'
  }
]

--- Debugging Validators Before Slashing ---

Checking Validator 1:
Validator 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5 is registered: false

Checking Validator 2:
Validator 0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be is registered: false

Checking Validator 3:
Validator 0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf is registered: false

--- Executing Slashing ---
Executing slashing for task: 0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f
✅ Slashing executed!
Transaction: BFEWwRSZyphitNo2thbUjTT5KjBfSKsCS272AHHC9m3m
Events: [
  {
    id: {
      txDigest: 'BFEWwRSZyphitNo2thbUjTT5KjBfSKsCS272AHHC9m3m',
      eventSeq: '0'
    },
    packageId: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9',
    transactionModule: 'slashing',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::slashing::ValidatorRewarded',
    parsedJson: {
      reward_amount: '10000000',
      task_id: '0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f',
      validator: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5'
    },
    bcsEncoding: 'base64',
    bcs: 'kdbeatQ2PsaUe9Yhrt0uDe13y9G4YHpG4jfr/Qgml/WAlpgAAAAAAGVbbUgO+gXopP5HylDQCYuwlk3xaYq+dZTYFb5gStKf'
  },
  {
    id: {
      txDigest: 'BFEWwRSZyphitNo2thbUjTT5KjBfSKsCS272AHHC9m3m',
      eventSeq: '1'
    },
    packageId: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9',
    transactionModule: 'slashing',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::slashing::ValidatorRewarded',
    parsedJson: {
      reward_amount: '10000000',
      task_id: '0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f',
      validator: '0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be'
    },
    bcsEncoding: 'base64',
    bcs: 'OaNrbbxgNVgUej51IN5uCnbmv/KPN6bV/dG3AV8B8r6AlpgAAAAAAGVbbUgO+gXopP5HylDQCYuwlk3xaYq+dZTYFb5gStKf'
  },
  {
    id: {
      txDigest: 'BFEWwRSZyphitNo2thbUjTT5KjBfSKsCS272AHHC9m3m',
      eventSeq: '2'
    },
    packageId: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9',
    transactionModule: 'slashing',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::validator_registry::ValidatorSlashed',
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
      txDigest: 'BFEWwRSZyphitNo2thbUjTT5KjBfSKsCS272AHHC9m3m',
      eventSeq: '3'
    },
    packageId: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9',
    transactionModule: 'slashing',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::slashing::ValidatorSlashedEvent',
    parsedJson: {
      slash_amount: '1000000',
      task_id: '0x655b6d480efa05e8a4fe47ca50d0098bb0964df1698abe7594d815be604ad29f',
      validator: '0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf'
    },
    bcsEncoding: 'base64',
    bcs: 'yYoZZ10peipzKY1jkgFV9F5s7gmexiVWCd/PLy7NOM9AQg8AAAAAAGVbbUgO+gXopP5HylDQCYuwlk3xaYq+dZTYFb5gStKf'
  },
  {
    id: {
      txDigest: 'BFEWwRSZyphitNo2thbUjTT5KjBfSKsCS272AHHC9m3m',
      eventSeq: '4'
    },
    packageId: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9',
    transactionModule: 'slashing',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::slashing::InsuranceFundUpdated',
    parsedJson: { added_amount: '1000000', new_total: '131000000' },
    bcsEncoding: 'base64',
    bcs: 'QEIPAAAAAADA5s4HAAAAAA=='
  }
]

--- Final Validator Status ---

Validator 1:
  Address: 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5
  Stake: NaN SUI
  Reputation: NaN
    transactionModule: 'slashing',
    sender: '0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5',
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::slashing::InsuranceFundUpdated',
    parsedJson: { added_amount: '1000000', new_total: '131000000' },
    bcsEncoding: 'base64',
    bcs: 'QEIPAAAAAADA5s4HAAAAAA=='
  }
]

--- Final Validator Status ---

Validator 1:
  Address: 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5
  Stake: NaN SUI
  Reputation: NaN
    type: '0x50dee63f75adb173a8428a5b456237438be8f3b01b01b3beb0d5abbe3eaad4e9::slashing::InsuranceFundUpdated',
    parsedJson: { added_amount: '1000000', new_total: '131000000' },
    bcsEncoding: 'base64',
    bcs: 'QEIPAAAAAADA5s4HAAAAAA=='
  }
]

--- Final Validator Status ---

Validator 1:
  Address: 0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5
  Stake: NaN SUI
  Active: false
  Balance: 1.543649584 SUI

Validator 2:
  Address: 0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be
  Stake: NaN SUI
  Reputation: NaN
  Active: false
  Balance: 0.235765188 SUI

Validator 3:
  Address: 0xc98a19675d297a2a73298d63920155f45e6cee099ec6255609dfcf2f2ecd38cf
  Stake: NaN SUI
  Reputation: NaN
  Active: false
  Balance: 0.225765188 SUI

Insurance Fund Balance: NaN SUI
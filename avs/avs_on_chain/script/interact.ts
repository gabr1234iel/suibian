import { SuiClient } from '@mysten/sui.js/client';
import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';
import { requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { fromB64 } from '@mysten/sui.js/utils';

// Configuration
const PACKAGE_ID = "0xbfa230cd6c7790d7f28f46ba6fd5dba730eef31c56f28a4cef494e4807e57686";
const REGISTRY_ID = "0x60c2c70b956e8c47d683cc8ab229043c21337a9f0261ce839e3742abc45b32b5";
const SLASHING_MANAGER_ID = "0x34b5e87a6f6852a5ba07a36a3e1d55f2efc0fb97b582bcff81640b125a6dda4e";
const PRIVATE_KEY_1 = "suiprivkey1qqedr5y058s9z2qy53kf9nql77c4a73h4mnxygl8hrqlf4f904amg6wzvh9";
const PRIVATE_KEY_2 = "suiprivkey1qrs7dm44uc7lvnff69wd8zfc6p3az2g07zm4e6zjqjaxc7n6fqyac9nhuzy";
const PRIVATE_KEY_3 = "suiprivkey1qq669pg0f36kp6axxu8cp9rlrg87matt75qec7vkragmkrmkda572t9fcdj";
const RPC_URL = "https://fullnode.testnet.sui.io:443";

class AVSInteraction {
    private client: SuiClient;
    private keypair: Ed25519Keypair;

    constructor(privateKey?: string) {
        this.client = new SuiClient({ url: RPC_URL });

        if (privateKey) {
            // Use provided private key
            this.loadKeypair(privateKey);
        } else {
            // Generate new keypair if no private key provided
            this.keypair = Ed25519Keypair.generate();
            console.log("Generated new address:", this.keypair.getPublicKey().toSuiAddress());
        }
    }

    loadKeypair(privateKey: string) {
        try {
            if (privateKey.startsWith('suiprivkey1q')) {
                const decoded = decodeSuiPrivateKey(privateKey);
                this.keypair = Ed25519Keypair.fromSecretKey(decoded.secretKey);
            } else {
                this.keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey));
            }
            console.log("Loaded address:", this.keypair.getPublicKey().toSuiAddress());
        } catch (error) {
            console.error("Failed to load keypair, generating new one:", error);
            this.keypair = Ed25519Keypair.generate();
            console.log("New address:", this.keypair.getPublicKey().toSuiAddress());
        }
    }

    // Initialize insurance fund during deployment
    async initializeInsuranceFund(slashingManagerId: string, amount: number = 100000000) {
        console.log("Initializing insurance fund with:", amount);

        const txb = new TransactionBlock();
        const [fundCoin] = txb.splitCoins(txb.gas, [amount]); // 

        txb.moveCall({
            target: `${PACKAGE_ID}::slashing::initialize_insurance_fund`,
            arguments: [
                txb.object(slashingManagerId),
                fundCoin,
            ],
        });

        try {
            const result = await this.client.signAndExecuteTransactionBlock({
                transactionBlock: txb,
                signer: this.keypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Insurance fund initialized!");
            console.log("Transaction:", result.digest);
            return result;
        } catch (error) {
            console.error("❌ Failed to initialize insurance fund:", error);
            throw error;
        }
    }

    // Register as Validator
    async registerValidator(registryId: string, stakeAmount: number = 10000000) {
        console.log("Registering validator with stake:", stakeAmount);

        const txb = new TransactionBlock();
        const [stakeCoin] = txb.splitCoins(txb.gas, [stakeAmount]);

        txb.moveCall({
            target: `${PACKAGE_ID}::validator_registry::register_validator`,
            arguments: [
                txb.object(registryId),
                stakeCoin,
            ],
        });

        try {
            const result = await this.client.signAndExecuteTransactionBlock({
                transactionBlock: txb,
                signer: this.keypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                },
            });

            console.log("✅ Registered as validator!");
            console.log("Transaction:", result.digest);
            console.log("Events:", result.events);
            return result;
        } catch (error) {
            console.error("❌ Failed to register validator:", error);
            throw error;
        }
    }

    // NEW: Deactivate validator
    async deactivateValidator(registryId: string) {
        console.log("Deactivating validator");

        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${PACKAGE_ID}::validator_registry::deactivate_validator`,
            arguments: [
                txb.object(registryId),
            ],
        });

        try {
            const result = await this.client.signAndExecuteTransactionBlock({
                transactionBlock: txb,
                signer: this.keypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Validator deactivated!");
            console.log("Transaction:", result.digest);
            return result;
        } catch (error) {
            console.error("❌ Failed to deactivate validator:", error);
            throw error;
        }
    }

    // NEW: Withdraw stake
    async withdrawStake(registryId: string, withdrawalAmount: number) {
        console.log("Withdrawing stake:", withdrawalAmount);

        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${PACKAGE_ID}::validator_registry::withdraw_stake`,
            arguments: [
                txb.object(registryId),
                txb.pure(withdrawalAmount),
            ],
        });

        try {
            const result = await this.client.signAndExecuteTransactionBlock({
                transactionBlock: txb,
                signer: this.keypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Stake withdrawn!");
            console.log("Transaction:", result.digest);
            return result;
        } catch (error) {
            console.error("❌ Failed to withdraw stake:", error);
            throw error;
        }
    }

    // Create Validation Task (updated for transfer validation)
    async createValidationTask(
        agentId: string,
        transferData: {
            action: string;
            amount: number;
            recipient: string;
            sender: string;
            timestamp: number;
        },
        validators: string[]
    ) {
        console.log("Creating validation task for agent:", agentId);

        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${PACKAGE_ID}::validation_task::create_validation_task`,
            arguments: [
                txb.pure(agentId),
                txb.pure(transferData.action),
                txb.pure(transferData.amount),
                txb.pure(transferData.recipient),
                txb.pure(transferData.sender),
                txb.pure(transferData.timestamp),
                txb.pure(validators),
            ],
        });

        try {
            const result = await this.client.signAndExecuteTransactionBlock({
                transactionBlock: txb,
                signer: this.keypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                },
            });

            console.log("✅ Created validation task!");
            console.log("Transaction:", result.digest);

            const taskId = this.extractTaskIdFromResult(result);
            console.log("Task ID:", taskId);

            return { result, taskId };
        } catch (error) {
            console.error("❌ Failed to create validation task:", error);
            throw error;
        }
    }

    // NEW: Submit vote with proof validation (updated for transfer)
    async submitVoteWithProof(
        taskId: string,
        vote: boolean,
        confidence: number,
        proofData: {
            txHash: string;
            amount: number;
            blockNumber: number;
        }
    ) {
        console.log(`Validating and voting ${vote ? "APPROVE" : "REJECT"} on task:`, taskId);

        // Step 1: Validate the transaction proof off-chain
        const validationResult = await this.validateTransactionProof(proofData);

        if (!validationResult.isValid) {
            console.log("❌ Transaction validation failed:", validationResult.reason);
            vote = false; // Override to reject if proof is invalid
        } else {
            console.log("✅ Transaction validation passed");
        }

        // Step 2: Submit vote with proof on-chain
        const txb = new TransactionBlock();

        // Convert hex string to bytes for tx hash
        const txHashBytes = Array.from(
            new TextEncoder().encode(proofData.txHash)
        );

        txb.moveCall({
            target: `${PACKAGE_ID}::validation_task::submit_vote_with_proof`,
            arguments: [
                txb.object(taskId),
                txb.pure(vote),
                txb.pure(confidence),
                txb.pure(txHashBytes),
                txb.pure(proofData.amount),     // amount_in
                txb.pure(0),                    // amount_out (set to 0 for transfers)
                txb.pure(proofData.blockNumber),
            ],
        });

        try {
            const result = await this.client.signAndExecuteTransactionBlock({
                transactionBlock: txb,
                signer: this.keypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Vote with proof submitted!");
            console.log("Transaction:", result.digest);
            return result;
        } catch (error) {
            console.error("❌ Failed to submit vote with proof:", error);
            throw error;
        }
    }

    // NEW: Off-chain transaction proof validation (updated for transfer)
    async validateTransactionProof(proofData: {
        txHash: string;
        amount: number;
        blockNumber: number;
    }): Promise<{ isValid: boolean; reason: string }> {
        try {
            console.log("🔍 Validating transaction proof for:", proofData.txHash);

            // Fetch the actual transaction
            const tx = await this.client.getTransactionBlock({
                digest: proofData.txHash,
                options: {
                    showEvents: true,
                    showEffects: true,
                    showInput: true,
                    showBalanceChanges: true,
                }
            });

            if (!tx) {
                return { isValid: false, reason: "Transaction not found" };
            }

            // Check block number matches
            if (tx.checkpoint && parseInt(tx.checkpoint) !== proofData.blockNumber) {
                return {
                    isValid: false,
                    reason: `Block number mismatch: expected ${proofData.blockNumber}, got ${tx.checkpoint}`
                };
            }

            // Look for SUI transfer in balance changes
            const balanceChanges = tx.balanceChanges || [];
            const suiTransfer = balanceChanges.find(change =>
                change.coinType === '0x2::sui::SUI' &&
                Math.abs(parseInt(change.amount)) === proofData.amount
            );

            if (!suiTransfer) {
                return { isValid: false, reason: "No SUI transfer found with matching amount" };
            }

            console.log("✅ Transaction proof validation successful");
            return { isValid: true, reason: "Valid transfer transaction proof" };

        } catch (error) {
            console.error("Error during transaction validation:", error);
            return { isValid: false, reason: `Validation error: ${error}` };
        }
    }

    // Check Consensus (unchanged)
    async checkConsensus(taskId: string) {
        console.log("Checking consensus for task:", taskId);

        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${PACKAGE_ID}::consensus::check_consensus`,
            arguments: [
                txb.object(taskId),
            ],
        });

        try {
            const result = await this.client.signAndExecuteTransactionBlock({
                transactionBlock: txb,
                signer: this.keypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Consensus checked!");
            console.log("Transaction:", result.digest);
            console.log("Events:", result.events);
            return result;
        } catch (error) {
            console.error("❌ Failed to check consensus:", error);
            throw error;
        }
    }

    // Execute Slashing with improved insurance fund integration
    async executeSlashing(
        slashingManagerId: string,
        registryId: string,
        taskId: string,
        consensusResult: boolean
    ) {
        console.log("Executing slashing for task:", taskId);

        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${PACKAGE_ID}::slashing::execute_slashing`,
            arguments: [
                txb.object(slashingManagerId),
                txb.object(registryId),
                txb.object(taskId),
                txb.pure(consensusResult),
            ],
        });

        try {
            const result = await this.client.signAndExecuteTransactionBlock({
                transactionBlock: txb,
                signer: this.keypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Slashing executed!");
            console.log("Transaction:", result.digest);
            console.log("Events:", result.events);
            return result;
        } catch (error) {
            console.error("❌ Failed to execute slashing:", error);
            throw error;
        }
    }

    // Helper: Extract task ID from transaction result (unchanged)
    private extractTaskIdFromResult(result: any): string | null {
        console.log("Looking for task ID in result...");

        if (result.objectChanges) {
            for (const change of result.objectChanges) {
                console.log("Object change:", change);
                if (change.type === 'created' &&
                    change.objectType &&
                    change.objectType.includes('ValidationTask')) {
                    console.log("Found ValidationTask object:", change.objectId);
                    return change.objectId;
                }
            }
        }

        if (result.events) {
            for (const event of result.events) {
                console.log("Event:", event);
                if (event.type.includes("TaskCreated")) {
                    const taskId = event.parsedJson?.task_id;
                    if (taskId) {
                        console.log("Found task ID in event:", taskId);
                        return taskId;
                    }
                }
            }
        }

        console.log("All object changes:", JSON.stringify(result.objectChanges, null, 2));
        console.log("All events:", JSON.stringify(result.events, null, 2));

        return null;
    }

    // Get address
    getAddress(): string {
        return this.keypair.getPublicKey().toSuiAddress();
    }

    // Get client
    getClient(): SuiClient {
        return this.client;
    }

    // Get balance
    async getBalance(): Promise<number> {
        const balance = await this.client.getBalance({
            owner: this.keypair.getPublicKey().toSuiAddress(),
        });
        return parseInt(balance.totalBalance);
    }

    // Request faucet (testnet only)
    async requestFaucet() {
        try {
            await requestSuiFromFaucetV0({
                host: RPC_URL,
                recipient: this.keypair.getPublicKey().toSuiAddress()
            });
            console.log("✅ Requested SUI from faucet");
        } catch (error) {
            console.error("❌ Faucet request failed:", error);
        }
    }

    async getValidatorInfo(registryId: string, address: string) {
        const txb = new TransactionBlock();
        txb.moveCall({
            target: `${PACKAGE_ID}::validator_registry::get_validator_info`,
            arguments: [txb.object(registryId), txb.pure(address)],
        });
        const result = await this.client.devInspectTransactionBlock({
            transactionBlock: txb,
            sender: this.getAddress()
        });

        // Parse return values from byte arrays (little-endian u64)
        const returnValues = result?.results?.[0]?.returnValues;
        
        const parseU64 = (bytes?: number[]): number => {
            if (!bytes || bytes.length !== 8) return 0;
            let result = 0;
            for (let i = 0; i < 8; i++) {
                result += bytes[i] * Math.pow(256, i);
            }
            return result;
        };
        
        const parseBool = (bytes?: number[]): boolean => {
            return !!(bytes && bytes[0] === 1);
        };

        return {
            stake_amount: parseU64(returnValues?.[0]?.[0]),
            reputation: parseU64(returnValues?.[1]?.[0]),
            total_validations: parseU64(returnValues?.[2]?.[0]),
            correct_validations: parseU64(returnValues?.[3]?.[0]),
            is_active: parseBool(returnValues?.[4]?.[0])
        };
    }

    async getInsuranceFundBalance(slashingManagerId: string): Promise<number> {
        const txb = new TransactionBlock();
        txb.moveCall({
            target: `${PACKAGE_ID}::slashing::get_insurance_fund_balance`,
            arguments: [txb.object(slashingManagerId)],
        });
        const result = await this.client.devInspectTransactionBlock({
            transactionBlock: txb,
            sender: this.getAddress()
        });
        
        // Parse return value from byte array (little-endian u64)
        const returnValue = result?.results?.[0]?.returnValues?.[0]?.[0];
        
        const parseU64 = (bytes?: number[]): number => {
            if (!bytes || bytes.length !== 8) return 0;
            let result = 0;
            for (let i = 0; i < 8; i++) {
                result += bytes[i] * Math.pow(256, i);
            }
            return result;
        };
        
        return parseU64(returnValue);
    }

    async isValidatorRegistered(registryId: string, address?: string): Promise<boolean> {
        try {
            const addr = address || this.getAddress();
            const txb = new TransactionBlock();
            txb.moveCall({
                target: `${PACKAGE_ID}::validator_registry::validator_exists`,
                arguments: [txb.object(registryId), txb.pure(addr)],
            });
            const result = await this.client.devInspectTransactionBlock({
                transactionBlock: txb,
                sender: this.getAddress()
            });
            return Boolean(result?.results?.[0]?.returnValues?.[0]?.[0] ?? false);
        } catch (error) {
            return false;
        }
    }

    // In your AVSInteraction class
    async debugTaskState(taskId: string) {
        try {
            const task = await this.client.getObject({
                id: taskId,
                options: { showContent: true }
            });
            console.log("Task object content:", task);
        } catch (error) {
            console.error("Failed to get task object:", error);
        }
    }

    async debugValidatorExists(registryId: string, address: string) {
        try {
            const isRegistered = await this.isValidatorRegistered(registryId, address);
            console.log(`Validator ${address} is registered: ${isRegistered}`);

            if (isRegistered) {
                const info = await this.getValidatorInfo(registryId, address);
                console.log(`Validator info:`, info);
            }
        } catch (error) {
            console.error(`Error checking validator ${address}:`, error);
        }
    }
}

async function main() {
    // Validator 1 uses existing private key
    const validator1 = new AVSInteraction(PRIVATE_KEY_1);
    const validator2 = new AVSInteraction(PRIVATE_KEY_2);
    const validator3 = new AVSInteraction(PRIVATE_KEY_3);

    console.log("\n--- Validator Addresses ---");
    console.log("Validator 1 (admin):", validator1.getAddress());
    console.log("Validator 2:", validator2.getAddress());
    console.log("Validator 3:", validator3.getAddress());

    // Make sure all validators have funds
    for (const [i, validator] of [validator1, validator2, validator3].entries()) {
        const balance = await validator.getBalance();
        console.log(`\nValidator ${i + 1} balance:`, balance / 1000000000, "SUI");

        if (balance < 50000000) { // Less than 0.05 SUI
            console.log(`Requesting funds for validator ${i + 1}...`);
            await validator.requestFaucet();
            // Wait for faucet transaction
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Check new balance
            const newBalance = await validator.getBalance();
            console.log(`New balance: ${newBalance / 1000000000} SUI`);
        }
    }

    try {


        // Initialize insurance fund using validator1 (admin)
        // await validator1.initializeInsuranceFund(SLASHING_MANAGER_ID, 50000000); // 0.05 SUI

        // Each validator needs to register themselves
        console.log("\n--- Registering Validators ---");
        for (const [i, validator] of [validator1, validator2, validator3].entries()) {
            // Check balance before registration
            const balance = await validator.getBalance();
            if (balance < 30000000) { // Need at least 0.03 SUI (0.02 for stake + gas)
                console.log(`Validator ${i + 1} needs more SUI. Current balance: ${balance / 1000000000} SUI`);
                continue;
            }

            try {
                console.log(`Attempting to register Validator ${i + 1}...`);
                await validator.registerValidator(REGISTRY_ID, 20000000); // 0.02 SUI stake each
                console.log(`✅ Validator ${i + 1} registered with ${20000000 / 1000000000} SUI`);
            } catch (error: any) {
                console.log(`✅ Validator ${i + 1} already registered (skipping)`);

            }
        }

        // Create task (can be done by any validator, using validator1 here)
        const mockTransferData = {
            action: "TRANSFER",
            amount: 100000000,  // 0.1 SUI
            recipient: "0x39a36b6dbc603558147a3e7520de6e0a76e6bff28f37a6d5fdd1b7015f01f2be",
            sender: "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5",
            timestamp: Date.now(),
        };

        const validators = [
            validator1.getAddress(),
            validator2.getAddress(),
            validator3.getAddress()
        ];

        console.log("\n--- Creating Validation Task ---");
        const { taskId } = await validator1.createValidationTask("agent_123", mockTransferData, validators);
        console.log("Task created:", taskId);

        await new Promise(resolve => setTimeout(resolve, 3000));

        if (taskId) {
            console.log("\n--- Validators Voting ---");

            // Validator 1 votes APPROVE
            await validator1.submitVoteWithProof(taskId, true, 95, {
                txHash: "CfpHS6YXPAv8usJaKU68YUp12VMWWNpziSeQov66txtz",
                amount: mockTransferData.amount,
                blockNumber: 226486139
            });
            console.log("Validator 1 voted: APPROVE");

            // Validator 2 votes APPROVE
            await validator2.submitVoteWithProof(taskId, true, 90, {
                txHash: "CfpHS6YXPAv8usJaKU68YUp12VMWWNpziSeQov66txtz",
                amount: mockTransferData.amount,
                blockNumber: 226486139
            });
            console.log("Validator 2 voted: APPROVE");

            // Validator 3 votes REJECT (incorrect vote)
            await validator3.submitVoteWithProof(taskId, false, 85, {
                txHash: "CfpHS6YXPAv8usJaKU68YUp12VMWWNpziSeQov66txtz",
                amount: mockTransferData.amount,
                blockNumber: 226486139
            });
            console.log("Validator 3 voted: REJECT (incorrect)");

            console.log("⏳ Waiting for all votes to be fully processed...");
            await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds

            console.log("🔍 Checking task state before consensus...");
            await validator1.debugTaskState(taskId);

            console.log("\n--- Checking Consensus ---");
            const consensusResult = await validator1.checkConsensus(taskId);

            console.log("\n--- Debugging Validators Before Slashing ---");
            for (const [i, validator] of [validator1, validator2, validator3].entries()) {
                console.log(`\nChecking Validator ${i + 1}:`);
                await validator1.debugValidatorExists(REGISTRY_ID, validator.getAddress());
            }

            console.log("\n--- Executing Slashing ---");
            await validator1.executeSlashing(SLASHING_MANAGER_ID, REGISTRY_ID, taskId, true);

            // Show final status of all validators
            console.log("\n--- Final Validator Status ---");
            for (const [i, validator] of [validator1, validator2, validator3].entries()) {
                const info = await validator.getValidatorInfo(REGISTRY_ID, validator.getAddress());
                console.log(`\nValidator ${i + 1}:`);
                console.log(`  Address: ${validator.getAddress()}`);
                console.log(`  Stake: ${info.stake_amount / 1000000000} SUI`);
                console.log(`  Reputation: ${info.reputation}`);
                console.log(`  Active: ${info.is_active}`);
                console.log(`  Balance: ${(await validator.getBalance()) / 1000000000} SUI`);
            }

            // Check insurance fund balance
            const fundBalance = await validator1.getInsuranceFundBalance(SLASHING_MANAGER_ID);
            console.log("\nInsurance Fund Balance:", fundBalance / 1000000000, "SUI");
        }

    } catch (error) {
        console.error("Error in main flow:", error);
    }
}

// Run the example
main().catch(console.error);

export { AVSInteraction };
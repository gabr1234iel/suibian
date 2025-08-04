import { SuiClient } from '@mysten/sui.js/client';
import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';
import { requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { fromB64 } from '@mysten/sui.js/utils';

// Configuration
const PACKAGE_ID = "0x09186c4cd464d39bfd3a10252854eced3e730609bf9b5ab3843dde34b1ec5f27"; // Replace with your deployed package ID
const RPC_URL = "https://fullnode.testnet.sui.io:443";

class AVSInteraction {
    private client: SuiClient;
    private keypair: Ed25519Keypair;
    
    constructor() {
        this.client = new SuiClient({ url: RPC_URL });
        
        const privateKey = "suiprivkey1qqedr5y058s9z2qy53kf9nql77c4a73h4mnxygl8hrqlf4f904amg6wzvh9";
        this.loadKeypair(privateKey);
    }

    loadKeypair(privateKey: string) {
        try {
            if (privateKey.startsWith('suiprivkey1q')) {
                // Use Sui's built-in decoder
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

    // 1. Get ValidatorRegistry object ID
    async findValidatorRegistry(): Promise<string> {
        const objects = await this.client.getOwnedObjects({
            owner: this.keypair.getPublicKey().toSuiAddress(),
        });

        // Look for ValidatorRegistry in shared objects
        // In practice, you'd save this ID after deployment
        console.log("Looking for ValidatorRegistry in objects...");
        console.log("Objects:", objects.data);
        
        // For now, return a placeholder - you'll need to find the actual object ID
        return "0x924a44659bc69a3eb7d818562d56b7520897a957ae1aa428d641fbe6ce021fe4"; // Replace with actual ValidatorRegistry object ID
    }

    // 2. Register as Validator
    async registerValidator(registryId: string, stakeAmount: number = 1000000000) { 
        console.log("Registering validator with stake:", stakeAmount);

        const txb = new TransactionBlock();

        // Split coins for staking (1 SUI = 1000000000 MIST)
        const [stakeCoin] = txb.splitCoins(txb.gas, [stakeAmount]);

        // Call register_validator
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

    // 3. Check if address is validator
    async isActiveValidator(registryId: string, validatorAddress?: string): Promise<boolean> {
        const address = validatorAddress || this.keypair.getPublicKey().toSuiAddress();
        
        try {
            const txb = new TransactionBlock();
            
            const [result] = txb.moveCall({
                target: `${PACKAGE_ID}::validator_registry::is_active_validator`,
                arguments: [
                    txb.object(registryId),
                    txb.pure(address),
                ],
            });

            // This is a view function - in practice you'd need to execute and parse results
            console.log("Checking validator status for:", address);
            return true; // Placeholder
        } catch (error) {
            console.error("Error checking validator status:", error);
            return false;
        }
    }

    // 4. Create Validation Task
    async createValidationTask(
        agentId: string,
        tradeData: {
            action: string;
            amountIn: number;
            amountOut: number;
            assetPair: string;
            price: number;
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
                txb.pure(tradeData.action),
                txb.pure(tradeData.amountIn),
                txb.pure(tradeData.amountOut),
                txb.pure(tradeData.assetPair),
                txb.pure(tradeData.price),
                txb.pure(tradeData.timestamp),
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
            
            // Extract task ID from events or object changes
            const taskId = this.extractTaskIdFromResult(result);
            console.log("Task ID:", taskId);
            
            return { result, taskId };
        } catch (error) {
            console.error("❌ Failed to create validation task:", error);
            throw error;
        }
    }

    // 5. Submit Vote on Validation Task
    async submitVote(taskId: string, vote: boolean, confidence: number = 85) {
        console.log(`Voting ${vote ? "APPROVE" : "REJECT"} on task:`, taskId);

        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${PACKAGE_ID}::validation_task::submit_vote`,
            arguments: [
                txb.object(taskId),
                txb.pure(vote),
                txb.pure(confidence),
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

            console.log("✅ Vote submitted!");
            console.log("Transaction:", result.digest);
            return result;
        } catch (error) {
            console.error("❌ Failed to submit vote:", error);
            throw error;
        }
    }

    // 6. Check Consensus and Finalize
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

    // 7. Execute Slashing/Rewards
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
            return result;
        } catch (error) {
            console.error("❌ Failed to execute slashing:", error);
            throw error;
        }
    }

    // Helper: Extract task ID from transaction result
    private extractTaskIdFromResult(result: any): string | null {
        console.log("Looking for task ID in result...");
        
        // First, look in object changes for created ValidationTask
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
        
        // Then look in events
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
        
        // Log all object changes to debug
        console.log("All object changes:", JSON.stringify(result.objectChanges, null, 2));
        console.log("All events:", JSON.stringify(result.events, null, 2));
        
        return null;
    }

    async findValidationTaskObjects(): Promise<string[]> {
        try {
            // Get all objects owned by this address
            const objects = await this.client.getOwnedObjects({
                owner: this.getAddress(),
                options: {
                    showType: true,
                    showContent: true,
                }
            });
            
            const validationTasks: string[] = [];
            
            for (const obj of objects.data) {
                if (obj.data?.type?.includes('ValidationTask')) {
                    validationTasks.push(obj.data.objectId);
                    console.log("Found ValidationTask:", obj.data.objectId);
                }
            }
            
            return validationTasks;
        } catch (error) {
            console.error("Error finding ValidationTask objects:", error);
            return [];
        }
    }

    // Get address
    getAddress(): string {
        return this.keypair.getPublicKey().toSuiAddress();
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
}

// Usage Example
async function main() {
    const avs = new AVSInteraction();
    
    console.log("Current address:", avs.getAddress());
    console.log("Balance:", await avs.getBalance());
    
    // If balance is 0, get SUI first
    const balance = await avs.getBalance();
    if (balance === 0) {
        console.log("❌ No SUI balance. Please:");
        console.log("1. Use your existing wallet (update private key in code)");
        console.log("2. Or get SUI from web faucet for address:", avs.getAddress());
        return;
    }
    
    const registryId = "0x924a44659bc69a3eb7d818562d56b7520897a957ae1aa428d641fbe6ce021fe4";
    
    try {
        // Register as validator
        await avs.registerValidator(registryId, 10000000); // 0.01 SUI stake
        
        // Create a validation task
        const tradeData = {
            action: "BUY",
            amountIn: 100000000,
            amountOut: 200000000,
            assetPair: "SUI/USDC",
            price: 2000000,
            timestamp: Date.now(),
        };
        
        const validators = [avs.getAddress()];
        
        const { taskId } = await avs.createValidationTask("agent_123", tradeData, validators);
        
        console.log("🕐 Waiting 3 seconds for object to be available...");
        await new Promise(resolve => setTimeout(resolve, 3000));

        if (taskId) {
            await avs.submitVote(taskId, true, 95);
            await avs.checkConsensus(taskId);
        }
        
    } catch (error) {
        console.error("Error in main flow:", error);
    }
}

// Run the example
main().catch(console.error);

export { AVSInteraction };
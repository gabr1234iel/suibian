import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';

// Configuration
const NETWORK = 'testnet'; // or 'devnet', 'mainnet'
const PACKAGE_ID = '0x57443c6e8e396f4d99f5c6aa152e9e6ecbbf91cbc2cd14c04741130ab7106001'; // Your deployed package ID
const SUBSCRIPTION_MANAGER_ID = '0x8c637cccc86c28b2c0aac50f839e397dbdd15576977a8d52c9387183eea71219';

// Initialize Sui client
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

// Test wallets (you'll need to fund these with testnet SUI)
const CREATOR_PRIVATE_KEY = "suiprivkey1qq669pg0f36kp6axxu8cp9rlrg87matt75qec7vkragmkrmkda572t9fcdj";
const creatorDecoded = decodeSuiPrivateKey(CREATOR_PRIVATE_KEY);
const creatorKeypair = Ed25519Keypair.fromSecretKey(creatorDecoded.secretKey);

// User wallet with existing SUI funds
const USER_PRIVATE_KEY = "suiprivkey1qrs7dm44uc7lvnff69wd8zfc6p3az2g07zm4e6zjqjaxc7n6fqyac9nhuzy";
const userDecoded = decodeSuiPrivateKey(USER_PRIVATE_KEY);
const userKeypair = Ed25519Keypair.fromSecretKey(userDecoded.secretKey);

// Mock TEE data (since TEE is not set up yet)
const MOCK_TEE_PUBLIC_KEY = new Uint8Array(32).fill(1); // 32-byte mock public key
const MOCK_TEE_WALLET_ADDRESS = '0xa125b591b0feb5f6f1843b54422831c61a9427531c7c8aab91d6053048a5b092'; // Mock TEE wallet

async function main() {
    console.log('🚀 Starting contract interaction tests...\n');

    // Initial balance check
    console.log('💰 Initial Balances:');
    await checkBalances();
    console.log();

    // Test 1: Creator registers an agent
    console.log('📝 Test 1: Creator registering agent...');
    const agentId = await createAgent();
    
    if (agentId) {
        console.log(`✅ Agent created successfully with ID: ${agentId}`);
        console.log('💰 Balances after agent creation:');

        // Wait for balance updates to propagate
        console.log('⏳ Waiting for balance updates to propagate...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        await checkBalances();
        console.log();
        
        // Test 2: User subscribes to agent
        console.log('👤 Test 2: User subscribing to agent...');
        const subscriptionId = await subscribeToAgent(agentId);
        
        if (subscriptionId) {
            console.log(`✅ User subscribed successfully with ID: ${subscriptionId}`);
            console.log('💰 Balances after subscription:');

            // Wait for balance updates to propagate
            console.log('⏳ Waiting for balance updates to propagate...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            await checkBalances();
            console.log();
            
            // Test 3: User deposits trading funds
            console.log('💰 Test 3: User depositing trading funds...');
            await depositTradingFunds(agentId, subscriptionId);
            
            // Wait for balance updates to propagate
            console.log('⏳ Waiting for balance updates to propagate...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('💰 Final balances:');
            await checkBalances();
        }
    }
}

async function createAgent(): Promise<string | null> {
    try {
        const creatorAddress = creatorKeypair.getPublicKey().toSuiAddress();
        console.log(`Creator address: ${creatorAddress}`);

        // Check creator balance
        const balance = await client.getBalance({ owner: creatorAddress });
        console.log(`Creator balance before creating agent: ${formatSuiAmount(balance.totalBalance)} SUI`);

        if (BigInt(balance.totalBalance) < 100000000n) { // Less than 0.1 SUI
            console.log('⚠️ Creator needs more SUI for gas fees');
            return null;
        }

        // Create transaction block
        const txb = new TransactionBlock();

        // Agent metadata
        const agentName = Array.from(new TextEncoder().encode("AI Arbitrage Master"));
        const agentDescription = Array.from(new TextEncoder().encode("Advanced DEX arbitrage trading bot using machine learning"));
        const subscriptionFeePerMonth = 10_000_000; // 0.01 SUI per month
        const minDeposit = 50_000_000; // 0.05 SUI minimum
        const maxDeposit = 100_000_000_000; // 100 SUI maximum
        const teePublicKey = Array.from(MOCK_TEE_PUBLIC_KEY);
        const teeWalletAddress = MOCK_TEE_WALLET_ADDRESS;

        // Call create_agent function
        txb.moveCall({
            target: `${PACKAGE_ID}::agent_registry::create_agent`,
            arguments: [
                txb.pure(agentName),
                txb.pure(agentDescription),
                txb.pure(subscriptionFeePerMonth),
                txb.pure(minDeposit),
                txb.pure(maxDeposit),
                txb.pure(teePublicKey),
                txb.pure(teeWalletAddress),
            ],
        });

        // Set gas budget
        txb.setGasBudget(10000000); // 0.01 SUI

        // Sign and execute transaction
        console.log('Signing and executing transaction...');
        const result = await client.signAndExecuteTransactionBlock({
            signer: creatorKeypair,
            transactionBlock: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
        });

        console.log(`Transaction digest: ${result.digest}`);

        // Extract agent ID from created objects
        if (result.objectChanges) {
            console.log('🔍 All object changes:');
            result.objectChanges.forEach(change => {
                if (change.type === 'created' || change.type === 'mutated' || change.type === 'deleted') {
                    console.log(`  - ${change.type}: ${change.objectId} (${change.objectType})`);
                } else {
                    console.log(`  - ${change.type}: ${JSON.stringify(change)}`);
                }
            });
            
            for (const change of result.objectChanges) {
                if (change.type === 'created' && 'objectType' in change && change.objectType.includes('TradingAgent')) {
                    console.log(`✅ Agent object created: ${change.objectId}`);
                    console.log(`📋 Agent object type: ${change.objectType}`);
                    return change.objectId;
                }
            }
        }

        // Also check events for AgentCreated
        if (result.events) {
            for (const event of result.events) {
                if (event.type.includes('AgentCreated')) {
                    console.log('📧 AgentCreated event:', event.parsedJson);
                    // Try to get agent_id from event as fallback
                    if (event.parsedJson && typeof event.parsedJson === 'object' && 'agent_id' in event.parsedJson) {
                        const agentIdFromEvent = (event.parsedJson as any).agent_id;
                        console.log(`🔄 Fallback: Using agent ID from event: ${agentIdFromEvent}`);
                        return agentIdFromEvent;
                    }
                }
            }
        }

        console.error('❌ Could not find agent ID in object changes or events');
        return null;

    } catch (error) {
        console.error('❌ Error creating agent:', error);
        return null;
    }
}

async function subscribeToAgent(agentId: string): Promise<string | null> {
    try {
        const userAddress = userKeypair.getPublicKey().toSuiAddress();
        console.log(`User address: ${userAddress}`);
        console.log(`🎯 Attempting to subscribe to agent: ${agentId}`);

        // Verify the agent object exists and is accessible (with retry for network delay)
        console.log(`⏳ Waiting for agent object to be available...`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        
        let agentObject;
        let retries = 3;
        
        while (retries > 0) {
            try {
                agentObject = await client.getObject({ 
                    id: agentId, 
                    options: { showContent: true, showType: true } 
                });
                
                if (agentObject.data) {
                    console.log(`✅ Agent object verified: ${agentObject.data.objectId}`);
                    console.log(`📋 Agent object type: ${agentObject.data.type}`);
                    break;
                } else {
                    console.log(`⏳ Agent object not ready yet, retrying... (${retries} attempts left)`);
                    retries--;
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 more seconds
                    }
                }
            } catch (error) {
                console.log(`⏳ Retry ${4 - retries}: Agent object not available yet...`);
                retries--;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    console.error(`❌ Failed to verify agent object ${agentId} after retries:`, error);
                    return null;
                }
            }
        }
        
        if (!agentObject?.data) {
            console.error(`❌ Agent object ${agentId} still not found after retries`);
            return null;
        }

        // Check user balance
        const balance = await client.getBalance({ owner: userAddress });
        console.log(`User balance before subscription: ${formatSuiAmount(balance.totalBalance)} SUI`);

        if (BigInt(balance.totalBalance) < 30000000n) { // Less than 0.03 SUI
            console.log('⚠️ User needs more SUI for subscription fee + gas');
            return null;
        }

        // Get a SUI coin for payment
        const coins = await client.getCoins({ owner: userAddress, coinType: '0x2::sui::SUI' });
        if (coins.data.length === 0) {
            console.log('❌ No SUI coins found');
            return null;
        }

        // Find SubscriptionManager object (you might need to query this)
        const subscriptionManagerId = SUBSCRIPTION_MANAGER_ID;
        if (!subscriptionManagerId) {
            console.log('❌ SubscriptionManager not found');
            return null;
        }

        // Create transaction block
        const txb = new TransactionBlock();

        // Split coin for payment (0.01 SUI for subscription)
        const paymentCoin = txb.splitCoins(txb.gas, [txb.pure(10_000_000)]);

        console.log(`🔧 Transaction details:`);
        console.log(`  - Agent ID: ${agentId}`);
        console.log(`  - SubscriptionManager ID: ${subscriptionManagerId}`);
        console.log(`  - Payment amount: 0.01 SUI (10_000_000 MIST)`);

        // Call subscribe_to_agent function
        txb.moveCall({
            target: `${PACKAGE_ID}::subscription_manager::subscribe_to_agent`,
            arguments: [
                txb.object(agentId), // agent
                txb.object(subscriptionManagerId), // manager
                paymentCoin, // payment
                txb.pure(30), // subscription_duration_days (30 days)
            ],
        });

        // Set gas budget
        txb.setGasBudget(15000000); // 0.015 SUI

        // Sign and execute transaction
        console.log('Signing and executing subscription transaction...');
        const result = await client.signAndExecuteTransactionBlock({
            signer: userKeypair,
            transactionBlock: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
        });

        console.log(`Transaction digest: ${result.digest}`);

        // Extract subscription ID from created objects
        if (result.objectChanges) {
            for (const change of result.objectChanges) {
                if (change.type === 'created' && change.objectType.includes('UserSubscription')) {
                    console.log(`Subscription object created: ${change.objectId}`);
                    return change.objectId;
                }
            }
        }

        // Check events for UserSubscribed
        if (result.events) {
            for (const event of result.events) {
                if (event.type.includes('UserSubscribed')) {
                    console.log('UserSubscribed event:', event.parsedJson);
                }
            }
        }

        return null;

    } catch (error) {
        console.error('❌ Error subscribing to agent:', error);
        return null;
    }
}

async function depositTradingFunds(agentId: string, subscriptionId: string): Promise<void> {
    try {
        const userAddress = userKeypair.getPublicKey().toSuiAddress();
        console.log(`User depositing trading funds...`);

        // Check balance again
        const balance = await client.getBalance({ owner: userAddress });
        console.log(`User balance before deposit: ${formatSuiAmount(balance.totalBalance)} SUI`);

        if (BigInt(balance.totalBalance) < 70000000n) { // Less than 0.07 SUI
            console.log('⚠️ User needs more SUI for trading deposit + gas');
            return;
        }

        // Find SubscriptionManager object
        const subscriptionManagerId = SUBSCRIPTION_MANAGER_ID;
        if (!subscriptionManagerId) {
            console.log('❌ SubscriptionManager not found');
            return;
        }

        // Create transaction block
        const txb = new TransactionBlock();

        // Split coin for trading deposit (0.05 SUI)
        const depositCoin = txb.splitCoins(txb.gas, [txb.pure(50_000_000)]);

        // Call deposit_trading_funds function
        txb.moveCall({
            target: `${PACKAGE_ID}::subscription_manager::deposit_trading_funds`,
            arguments: [
                txb.object(agentId), // agent
                txb.object(subscriptionManagerId), // manager
                txb.object(subscriptionId), // subscription
                depositCoin, // deposit
            ],
        });

        // Set gas budget
        txb.setGasBudget(15000000); // 0.015 SUI

        // Sign and execute transaction
        console.log('Signing and executing deposit transaction...');
        const result = await client.signAndExecuteTransactionBlock({
            signer: userKeypair,
            transactionBlock: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showBalanceChanges: true,
            },
        });

        console.log(`Transaction digest: ${result.digest}`);

        // Check events for FundsDeposited
        if (result.events) {
            for (const event of result.events) {
                if (event.type.includes('FundsDeposited')) {
                    console.log('✅ FundsDeposited event:', event.parsedJson);
                }
            }
        }

        // Check balance changes
        if (result.balanceChanges) {
            console.log('Balance changes:', result.balanceChanges);
        }

        console.log('✅ Trading funds deposited successfully!');

    } catch (error) {
        console.error('❌ Error depositing trading funds:', error);
    }
}

// Utility function to check balances
async function checkBalances() {
    const creatorAddress = creatorKeypair.getPublicKey().toSuiAddress();
    const userAddress = userKeypair.getPublicKey().toSuiAddress();

    const creatorBalance = await client.getBalance({ owner: creatorAddress });
    const userBalance = await client.getBalance({ owner: userAddress });
    
    let teeBalance;
    try {
        teeBalance = await client.getBalance({ owner: MOCK_TEE_WALLET_ADDRESS });
    } catch (error) {
        console.log(`⚠️ Could not fetch TEE wallet balance: ${error}`);
        teeBalance = { totalBalance: "0" };
    }

    console.log(`Creator (${creatorAddress}): ${formatSuiAmount(creatorBalance.totalBalance)} SUI`);
    console.log(`User (${userAddress}): ${formatSuiAmount(userBalance.totalBalance)} SUI`);
    console.log(`TEE Wallet (${MOCK_TEE_WALLET_ADDRESS}): ${formatSuiAmount(teeBalance.totalBalance)} SUI`);
}

// Helper function to format SUI amounts
function formatSuiAmount(mist: string): string {
    const sui = Number(mist) / 1_000_000_000;
    return `${sui.toFixed(4)}`;
}

// Run the tests
main().catch(console.error);

// Export for potential use in other scripts
export { createAgent, subscribeToAgent, depositTradingFunds, checkBalances };
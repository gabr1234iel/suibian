const { SuiClient, getFullnodeUrl } = require('@mysten/sui.js/client');
const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { TransactionBlock } = require('@mysten/sui.js/transactions');
const { decodeSuiPrivateKey } = require('@mysten/sui.js/cryptography');

// Configuration - UPDATE THESE WITH YOUR DEPLOYED CONTRACT INFO
const NETWORK = 'devnet';
const PACKAGE_ID = '0xf6c779446cf6a60ecf2f158006130a047066583e98caa9fa7ad038cac3a32f82'; // Your package ID
const POOL_ID = '0xdb0eb25e57a67e8e606f3b42dd68be6fabafb193c0d90dfd1b47e88982ed321c';   // Your pool ID

// Initialize client
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

// User wallet - replace with your private key
const USER_PRIVATE_KEY = "suiprivkey1qrs7dm44uc7lvnff69wd8zfc6p3az2g07zm4e6zjqjaxc7n6fqyac9nhuzy"; // Replace with your key
const userDecoded = decodeSuiPrivateKey(USER_PRIVATE_KEY);
const userKeypair = Ed25519Keypair.fromSecretKey(userDecoded.secretKey);
const userAddress = userKeypair.getPublicKey().toSuiAddress();

console.log(`User address: ${userAddress}`);

class DEXInteraction {
    constructor(client, keypair, packageId, poolId) {
        this.client = client;
        this.keypair = keypair;
        this.packageId = packageId;
        this.poolId = poolId;
        this.userBalanceId = null;
    }

    // Create user balance object (needed for USDC tracking)
    async createUserBalance() {
        try {
            console.log('\n👤 Creating user balance object...');
            
            const tx = new TransactionBlock();
            
            tx.moveCall({
                target: `${this.packageId}::dex::create_user_balance`,
                arguments: []
            });

            const result = await this.client.signAndExecuteTransactionBlock({
                signer: this.keypair,
                transactionBlock: tx,
                options: { showEvents: true, showEffects: true, showObjectChanges: true }
            });

            console.log(`✅ User balance created`);
            console.log(`Transaction: ${result.digest}`);

            // Find the created UserBalance object from object changes
            if (result.objectChanges) {
                for (const change of result.objectChanges) {
                    if (change.type === 'created' && change.objectType.includes('UserBalance')) {
                        this.userBalanceId = change.objectId;
                        console.log(`📝 UserBalance ID: ${this.userBalanceId}`);
                        break;
                    }
                }
            }

            return result;
        } catch (error) {
            console.error('Error creating user balance:', error);
        }
    }

    // Get wallet balances and user USDC balance
    async getWalletBalance() {
        try {
            const coins = await this.client.getAllCoins({ owner: userAddress });
            
            let suiBalance = 0;

            for (const coin of coins.data) {
                if (coin.coinType.includes('::sui::SUI')) {
                    suiBalance += Number(coin.balance);
                }
            }

            console.log('\n💰 Wallet Balances:');
            console.log(`SUI: ${(suiBalance / 1e9).toFixed(4)} SUI`);

            // Get USDC balance from UserBalance object
            if (this.userBalanceId) {
                try {
                    const userBalanceObject = await this.client.getObject({
                        id: this.userBalanceId,
                        options: { showContent: true }
                    });

                    if (userBalanceObject.data?.content && 'fields' in userBalanceObject.data.content) {
                        const fields = userBalanceObject.data.content.fields;
                        const usdcBalance = Number(fields.usdc_balance) / 1e6;
                        console.log(`USDC: ${usdcBalance.toFixed(2)} USDC (in UserBalance)`);
                    }
                } catch (error) {
                    console.log('USDC: 0.00 USDC (UserBalance not found)');
                }
            }

            return { suiBalance: suiBalance / 1e9 };
        } catch (error) {
            console.error('Error getting wallet balance:', error);
            return { suiBalance: 0 };
        }
    }

    // Get pool price and reserves
    async getPrice() {
        try {
            const poolObject = await this.client.getObject({
                id: this.poolId,
                options: { showContent: true }
            });

            if (poolObject.data?.content && 'fields' in poolObject.data.content) {
                const fields = poolObject.data.content.fields;
                const suiReserve = Number(fields.sui_reserve) / 1e9;
                const usdcReserve = Number(fields.usdc_reserve) / 1e6;
                const price = suiReserve > 0 ? usdcReserve / suiReserve : 0;
                
                console.log('\n📊 Pool Info:');
                console.log(`SUI Reserve: ${suiReserve.toFixed(2)} SUI`);
                console.log(`USDC Reserve: ${usdcReserve.toFixed(2)} USDC`);
                console.log(`Price: $${price.toFixed(4)} USDC per SUI`);
                
                return { suiReserve, usdcReserve, price };
            }
        } catch (error) {
            console.error('Error getting price:', error);
        }
        return null;
    }

    // Mint USDC to user balance
    async mintUSDC(amount) {
        if (!this.userBalanceId) {
            console.log('❌ No user balance found. Create one first.');
            return;
        }

        try {
            console.log(`\n🏦 Minting ${amount} USDC to user balance...`);
            
            const tx = new TransactionBlock();
            
            tx.moveCall({
                target: `${this.packageId}::dex::mint_usdc_to_user`,
                arguments: [
                    tx.object(this.userBalanceId),
                    tx.pure((amount * 1e6).toString()) // Convert to micro-USDC
                ]
            });

            const result = await this.client.signAndExecuteTransactionBlock({
                signer: this.keypair,
                transactionBlock: tx,
                options: { showEvents: true, showEffects: true }
            });

            console.log(`✅ Successfully minted ${amount} USDC`);
            console.log(`Transaction: ${result.digest}`);
            return result;
        } catch (error) {
            console.error('Error minting USDC:', error);
        }
    }

    // Swap SUI for USDC
    async swapSuiToUSDC(suiAmount) {
        if (!this.userBalanceId) {
            console.log('❌ No user balance found. Create one first.');
            return;
        }

        try {
            console.log(`\n🔄 Swapping ${suiAmount} SUI for USDC...`);
            
            const tx = new TransactionBlock();
            
            // Split SUI from gas coin
            const [suiCoin] = tx.splitCoins(tx.gas, [tx.pure((suiAmount * 1e9).toString())]);
            
            tx.moveCall({
                target: `${this.packageId}::dex::swap_sui_to_usdc`,
                arguments: [
                    tx.object(this.poolId),
                    tx.object(this.userBalanceId),
                    suiCoin,
                    tx.pure('0') // Minimum USDC out (0 for demo)
                ]
            });

            const txResult = await this.client.signAndExecuteTransactionBlock({
                signer: this.keypair,
                transactionBlock: tx,
                options: { showEvents: true, showEffects: true }
            });

            console.log(`✅ Swap completed`);
            console.log(`Transaction: ${txResult.digest}`);
            
            // Parse swap event to show received amount
            if (txResult.events) {
                for (const event of txResult.events) {
                    if (event.type.includes('SwapEvent')) {
                        const eventData = event.parsedJson;
                        const usdcReceived = Number(eventData.amount_out) / 1e6;
                        const fee = Number(eventData.fee) / 1e9;
                        console.log(`📈 Received: ${usdcReceived.toFixed(4)} USDC`);
                        console.log(`💸 Fee: ${fee.toFixed(6)} SUI`);
                    }
                }
            }
            
            return txResult;
        } catch (error) {
            console.error('Error swapping SUI to USDC:', error);
        }
    }

    // Swap USDC for SUI
    async swapUSDCToSui(usdcAmount) {
        if (!this.userBalanceId) {
            console.log('❌ No user balance found. Create one first.');
            return;
        }

        try {
            console.log(`\n🔄 Swapping ${usdcAmount} USDC for SUI...`);

            const tx = new TransactionBlock();
            
            const result = tx.moveCall({
                target: `${this.packageId}::dex::swap_usdc_to_sui`,
                arguments: [
                    tx.object(this.poolId),
                    tx.object(this.userBalanceId),
                    tx.pure((usdcAmount * 1e6).toString()),
                    tx.pure('0') // Minimum SUI out (0 for demo)
                ]
            });

            // Transfer received SUI to user
            tx.transferObjects([result], tx.pure(userAddress));

            const txResult = await this.client.signAndExecuteTransactionBlock({
                signer: this.keypair,
                transactionBlock: tx,
                options: { showEvents: true, showEffects: true }
            });

            console.log(`✅ Swap completed`);
            console.log(`Transaction: ${txResult.digest}`);
            
            // Parse swap event to show received amount
            if (txResult.events) {
                for (const event of txResult.events) {
                    if (event.type.includes('SwapEvent')) {
                        const eventData = event.parsedJson;
                        const suiReceived = Number(eventData.amount_out) / 1e9;
                        const fee = Number(eventData.fee) / 1e6;
                        console.log(`📈 Received: ${suiReceived.toFixed(6)} SUI`);
                        console.log(`💸 Fee: ${fee.toFixed(4)} USDC`);
                    }
                }
            }
            
            return txResult;
        } catch (error) {
            console.error('Error swapping USDC to SUI:', error);
        }
    }
}

// Main function
async function main() {
    console.log('🌊 DEX Interaction Demo Starting...\n');
    console.log('📋 Make sure pool is bootstrapped first!');
    console.log('');
    
    // Create DEX interaction instance
    const dex = new DEXInteraction(
        client,
        userKeypair,
        PACKAGE_ID,
        POOL_ID
    );

    try {
        // 1. Create user balance object
        await dex.createUserBalance();

        // 2. Check initial state
        console.log('\n📊 Initial State:');
        await dex.getWalletBalance();
        const poolInfo = await dex.getPrice();
        
        if (!poolInfo || poolInfo.suiReserve === 0) {
            console.log('❌ Pool not bootstrapped yet! Please run bootstrap_pool first.');
            return;
        }

        // 3. Mint some USDC for testing
        await dex.mintUSDC(100); // Mint only 100 USDC

        // 4. Check balance after minting
        await dex.getWalletBalance();

        // 5. Swap SUI to USDC (minimized amounts)
        await dex.swapSuiToUSDC(0.5); // Swap only 0.5 SUI
        await dex.getPrice(); // Check new price
        await dex.getWalletBalance();

        // 6. Swap USDC to SUI
        await dex.swapUSDCToSui(50); // Swap 50 USDC (smaller amount)
        await dex.getPrice(); // Check new price
        await dex.getWalletBalance();

        // 7. Another small SUI to USDC swap
        await dex.swapSuiToUSDC(0.3); // Swap only 0.3 SUI
        await dex.getPrice(); // Check final price
        await dex.getWalletBalance();

        console.log('\n🎉 Demo completed successfully!');
        
    } catch (error) {
        console.error('Demo failed:', error);
    }
}

// Run the demo
main().catch(console.error);
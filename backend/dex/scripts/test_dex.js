const { SuiClient, getFullnodeUrl } = require('@mysten/sui.js/client');
const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { TransactionBlock } = require('@mysten/sui.js/transactions');
const { decodeSuiPrivateKey } = require('@mysten/sui.js/cryptography');

// Configuration - UPDATE THESE WITH YOUR DEPLOYED CONTRACT INFO
const NETWORK = 'devnet';
const PACKAGE_ID = '0xYOUR_PACKAGE_ID'; // Replace with your deployed package ID
const POOL_ID = '0xYOUR_POOL_ID';       // Replace with your pool ID after deployment
const ADMIN_CAP_ID = '0xYOUR_ADMIN_CAP_ID'; // Replace with admin cap ID
const TREASURY_CAP_ID = '0xYOUR_TREASURY_CAP_ID'; // Replace with USDC treasury cap ID

// Initialize client
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

// User wallet - replace with your private key
const USER_PRIVATE_KEY = "suiprivkey1qrs7dm44uc7lvnff69wd8zfc6p3az2g07zm4e6zjqjaxc7n6fqyac9nhuzy";
const userDecoded = decodeSuiPrivateKey(USER_PRIVATE_KEY);
const userKeypair = Ed25519Keypair.fromSecretKey(userDecoded.secretKey);
const userAddress = userKeypair.getPublicKey().toSuiAddress();

console.log(`User address: ${userAddress}`);

class DEXTester {
    constructor(client, keypair, packageId, poolId, adminCapId, treasuryCapId) {
        this.client = client;
        this.keypair = keypair;
        this.packageId = packageId;
        this.poolId = poolId;
        this.adminCapId = adminCapId;
        this.treasuryCapId = treasuryCapId;
    }

    // Format SUI amount for display
    formatSUI(amount) {
        return (Number(amount) / 1e9).toFixed(4);
    }

    // Format USDC amount for display  
    formatUSDC(amount) {
        return (Number(amount) / 1e6).toFixed(2);
    }

    // Get wallet balances
    async getWalletBalance() {
        try {
            const coins = await this.client.getAllCoins({ owner: userAddress });
            
            let suiBalance = 0;
            let usdcBalance = 0;

            for (const coin of coins.data) {
                if (coin.coinType.includes('::sui::SUI')) {
                    suiBalance += Number(coin.balance);
                } else if (coin.coinType.includes('MOCK_USDC')) {
                    usdcBalance += Number(coin.balance);
                }
            }

            console.log('\n💰 Wallet Balances:');
            console.log(`SUI: ${this.formatSUI(suiBalance)} SUI`);
            console.log(`MOCK_USDC: ${this.formatUSDC(usdcBalance)} USDC`);

            return { suiBalance, usdcBalance };
        } catch (error) {
            console.error('Error getting wallet balance:', error);
            return { suiBalance: 0, usdcBalance: 0 };
        }
    }

    // Get pool reserves and price
    async getPoolInfo() {
        try {
            const poolObject = await this.client.getObject({
                id: this.poolId,
                options: { showContent: true }
            });

            if (poolObject.data?.content && 'fields' in poolObject.data.content) {
                const fields = poolObject.data.content.fields;
                const suiReserve = Number(fields.sui_reserve);
                const usdcReserve = Number(fields.usdc_reserve);
                const totalLpSupply = Number(fields.total_lp_supply);
                const price = suiReserve > 0 ? usdcReserve / suiReserve : 0;
                
                console.log('\n📊 Pool Info:');
                console.log(`SUI Reserve: ${this.formatSUI(suiReserve)} SUI`);
                console.log(`USDC Reserve: ${this.formatUSDC(usdcReserve)} USDC`);
                console.log(`Total LP Supply: ${totalLpSupply}`);
                console.log(`Price: $${(price / 1e3).toFixed(4)} USDC per SUI`); // Adjust for decimal difference
                
                return { suiReserve, usdcReserve, totalLpSupply, price };
            }
        } catch (error) {
            console.error('Error getting pool info:', error);
        }
        return null;
    }

    // Mint MOCK_USDC tokens for testing
    async mintUSDC(amount) {
        try {
            console.log(`\n🏦 Minting ${amount} MOCK_USDC...`);
            
            const tx = new TransactionBlock();
            
            tx.moveCall({
                target: `${this.packageId}::dex::mint_usdc_for_testing`,
                arguments: [
                    tx.object(this.adminCapId),
                    tx.object(this.treasuryCapId),
                    tx.pure((amount * 1e6).toString()), // Convert to micro-USDC
                    tx.pure(userAddress)
                ]
            });

            const result = await this.client.signAndExecuteTransactionBlock({
                signer: this.keypair,
                transactionBlock: tx,
                options: { showEvents: true, showEffects: true, showObjectChanges: true }
            });

            console.log(`✅ Successfully minted ${amount} MOCK_USDC`);
            console.log(`Transaction: ${result.digest}`);
            return result;
        } catch (error) {
            console.error('Error minting USDC:', error);
        }
    }

    // Add liquidity to the pool
    async addLiquidity(suiAmount, usdcAmount) {
        try {
            console.log(`\n💧 Adding liquidity: ${suiAmount} SUI + ${usdcAmount} USDC...`);
            
            // Get user's coins
            const coins = await this.client.getAllCoins({ owner: userAddress });
            
            // Find SUI and USDC coins
            const suiCoin = coins.data.find(coin => coin.coinType.includes('::sui::SUI'));
            const usdcCoin = coins.data.find(coin => coin.coinType.includes('MOCK_USDC'));
            
            if (!suiCoin || !usdcCoin) {
                console.error('❌ Insufficient coins. Need both SUI and MOCK_USDC.');
                return;
            }

            const tx = new TransactionBlock();
            
            // Split exact amounts from existing coins
            const [splitSui] = tx.splitCoins(tx.gas, [tx.pure((suiAmount * 1e9).toString())]);
            const [splitUsdc] = tx.splitCoins(tx.object(usdcCoin.coinObjectId), [tx.pure((usdcAmount * 1e6).toString())]);
            
            const lpToken = tx.moveCall({
                target: `${this.packageId}::dex::add_liquidity`,
                arguments: [
                    tx.object(this.poolId),
                    splitSui,
                    splitUsdc,
                    tx.pure('0') // min_lp_tokens (0 for demo)
                ]
            });

            // Transfer LP token to user
            tx.transferObjects([lpToken], tx.pure(userAddress));

            const result = await this.client.signAndExecuteTransactionBlock({
                signer: this.keypair,
                transactionBlock: tx,
                options: { showEvents: true, showEffects: true, showObjectChanges: true }
            });

            console.log(`✅ Liquidity added successfully`);
            console.log(`Transaction: ${result.digest}`);
            
            // Find created LP token
            if (result.objectChanges) {
                for (const change of result.objectChanges) {
                    if (change.type === 'created' && change.objectType.includes('LPToken')) {
                        console.log(`🎫 LP Token created: ${change.objectId}`);
                        break;
                    }
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error adding liquidity:', error);
        }
    }

    // Swap SUI for USDC
    async swapSuiToUSDC(suiAmount) {
        try {
            console.log(`\n🔄 Swapping ${suiAmount} SUI for USDC...`);
            
            const tx = new TransactionBlock();
            
            // Split SUI from gas coin
            const [suiCoin] = tx.splitCoins(tx.gas, [tx.pure((suiAmount * 1e9).toString())]);
            
            const usdcCoin = tx.moveCall({
                target: `${this.packageId}::dex::swap_sui_to_usdc`,
                arguments: [
                    tx.object(this.poolId),
                    suiCoin,
                    tx.pure('0') // min_usdc_out (0 for demo)
                ]
            });

            // Transfer received USDC to user
            tx.transferObjects([usdcCoin], tx.pure(userAddress));

            const result = await this.client.signAndExecuteTransactionBlock({
                signer: this.keypair,
                transactionBlock: tx,
                options: { showEvents: true, showEffects: true }
            });

            console.log(`✅ Swap completed`);
            console.log(`Transaction: ${result.digest}`);
            
            // Parse swap event
            if (result.events) {
                for (const event of result.events) {
                    if (event.type.includes('SwapEvent')) {
                        const eventData = event.parsedJson;
                        const usdcReceived = this.formatUSDC(eventData.amount_out);
                        const fee = this.formatSUI(eventData.fee);
                        console.log(`📈 Received: ${usdcReceived} USDC`);
                        console.log(`💸 Fee: ${fee} SUI`);
                    }
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error swapping SUI to USDC:', error);
        }
    }

    // Swap USDC for SUI
    async swapUSDCToSui(usdcAmount) {
        try {
            console.log(`\n🔄 Swapping ${usdcAmount} USDC for SUI...`);

            // Get user's USDC coin
            const coins = await this.client.getAllCoins({ owner: userAddress });
            const usdcCoin = coins.data.find(coin => coin.coinType.includes('MOCK_USDC'));
            
            if (!usdcCoin) {
                console.error('❌ No MOCK_USDC found in wallet');
                return;
            }

            const tx = new TransactionBlock();
            
            // Split USDC amount
            const [splitUsdc] = tx.splitCoins(tx.object(usdcCoin.coinObjectId), [tx.pure((usdcAmount * 1e6).toString())]);
            
            const suiCoin = tx.moveCall({
                target: `${this.packageId}::dex::swap_usdc_to_sui`,
                arguments: [
                    tx.object(this.poolId),
                    splitUsdc,
                    tx.pure('0') // min_sui_out (0 for demo)
                ]
            });

            // Transfer received SUI to user
            tx.transferObjects([suiCoin], tx.pure(userAddress));

            const result = await this.client.signAndExecuteTransactionBlock({
                signer: this.keypair,
                transactionBlock: tx,
                options: { showEvents: true, showEffects: true }
            });

            console.log(`✅ Swap completed`);
            console.log(`Transaction: ${result.digest}`);
            
            // Parse swap event
            if (result.events) {
                for (const event of result.events) {
                    if (event.type.includes('SwapEvent')) {
                        const eventData = event.parsedJson;
                        const suiReceived = this.formatSUI(eventData.amount_out);
                        const fee = this.formatUSDC(eventData.fee);
                        console.log(`📈 Received: ${suiReceived} SUI`);
                        console.log(`💸 Fee: ${fee} USDC`);
                    }
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error swapping USDC to SUI:', error);
        }
    }

    // Get price preview for swap
    async getSwapPreview(amountIn, isSuiToUsdc) {
        try {
            const poolInfo = await this.getPoolInfo();
            if (!poolInfo) return null;

            const { suiReserve, usdcReserve } = poolInfo;
            const feeRate = 30; // 0.3% fee
            
            let amountOut;
            if (isSuiToUsdc) {
                const suiAmountIn = amountIn * 1e9;
                const fee = (suiAmountIn * feeRate) / 10000;
                const suiAfterFee = suiAmountIn - fee;
                amountOut = (usdcReserve * suiAfterFee) / (suiReserve + suiAfterFee);
                console.log(`\n🔮 Swap Preview: ${amountIn} SUI → ${this.formatUSDC(amountOut)} USDC`);
            } else {
                const usdcAmountIn = amountIn * 1e6;
                const fee = (usdcAmountIn * feeRate) / 10000;
                const usdcAfterFee = usdcAmountIn - fee;
                amountOut = (suiReserve * usdcAfterFee) / (usdcReserve + usdcAfterFee);
                console.log(`\n🔮 Swap Preview: ${amountIn} USDC → ${this.formatSUI(amountOut)} SUI`);
            }
            
            return amountOut;
        } catch (error) {
            console.error('Error getting swap preview:', error);
            return null;
        }
    }
}

// Main testing function
async function main() {
    console.log('🌊 DEX Testing Demo Starting...\n');
    
    // Create DEX tester instance
    const dex = new DEXTester(
        client,
        userKeypair,
        PACKAGE_ID,
        POOL_ID,
        ADMIN_CAP_ID,
        TREASURY_CAP_ID
    );

    try {
        // 1. Check initial state
        console.log('📊 Initial State:');
        await dex.getWalletBalance();
        const poolInfo = await dex.getPoolInfo();
        
        // 2. Mint MOCK_USDC for testing
        console.log('\n=== MINTING USDC ===');
        await dex.mintUSDC(1000); // Mint 1000 USDC
        await dex.getWalletBalance();

        // 3. Add liquidity to the pool
        console.log('\n=== ADDING LIQUIDITY ===');
        await dex.addLiquidity(10, 18000); // Add 10 SUI + 18000 USDC (assuming 1 SUI = ~1800 USDC)
        await dex.getPoolInfo();
        await dex.getWalletBalance();

        // 4. Test swaps
        console.log('\n=== TESTING SWAPS ===');
        
        // Get swap preview
        await dex.getSwapPreview(1, true); // Preview: 1 SUI → USDC
        
        // Swap SUI to USDC
        await dex.swapSuiToUSDC(1); // Swap 1 SUI
        await dex.getPoolInfo();
        await dex.getWalletBalance();

        // Get swap preview
        await dex.getSwapPreview(500, false); // Preview: 500 USDC → SUI
        
        // Swap USDC to SUI
        await dex.swapUSDCToSui(500); // Swap 500 USDC
        await dex.getPoolInfo();
        await dex.getWalletBalance();

        // Another swap to see price impact
        await dex.swapSuiToUSDC(2); // Swap 2 more SUI
        await dex.getPoolInfo();
        await dex.getWalletBalance();

        console.log('\n🎉 Testing completed successfully!');
        
    } catch (error) {
        console.error('Testing failed:', error);
    }
}

// Instructions for setup
console.log('📋 SETUP INSTRUCTIONS:');
console.log('1. Deploy your contracts using: sui client publish --gas-budget 100000000');
console.log('2. Update the constants above with your deployed package ID, pool ID, admin cap ID, and treasury cap ID');
console.log('3. Make sure you have enough SUI in your wallet for gas fees');
console.log('4. Run this script with: node dex_test.js\n');

// Uncomment the line below to run the test
// main().catch(console.error);
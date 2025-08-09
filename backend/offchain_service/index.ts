// In offchain_service/index.ts

import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as fs from 'fs';
import path from 'path';

// --- CONFIGURATION - IMPORTANT: FILL THESE IN AFTER YOU DEPLOY! ---
const SUI_CLIENT = new SuiClient({ url: getFullnodeUrl('localnet') });
const PACKAGE_ID = "0xYOUR_PACKAGE_ID";
const TRUSTED_SIGNER_OBJECT_ID = "0xYOUR_TRUSTED_SIGNER_OBJECT_ID";
const PAYMENT_VAULT_COIN_ID = "0xYOUR_GAS_COIN_ID";

/**
 * Loads a keypair from your default sui.keystore file.
 * The index determines which key to load (0 = first key, 1 = second key, etc.)
 */
function getKeypair(keyIndex: number = 0): Ed25519Keypair {
    const keystorePath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.sui', 'sui_config', 'sui.keystore');
    const keystore = JSON.parse(fs.readFileSync(keystorePath, 'utf8'));
    if (keystore.length <= keyIndex) {
        throw new Error(`Key at index ${keyIndex} not found. Use 'sui client new-address ed25519' to create more keys.`);
    }
    const privateKeyBytes = Buffer.from(keystore[keyIndex], 'base64').slice(1);
    return Ed25519Keypair.fromSecretKey(privateKeyBytes);
}

// The service's own keypair for signing transactions (uses your default address)
const SERVICE_KEYPAIR = getKeypair(0);
// The "Mock HSM" keypair (uses your second address)
const MOCK_HSM_KEYPAIR = getKeypair(1);


/**
 * This function simulates the TEE computation.
 */
async function processJobInMockTee(jobData: number[]): Promise<{ proof: Uint8Array; signature: Uint8Array }> {
    console.log(`[Mock TEE] Processing job data: ${jobData}`);
    const result = jobData.reduce((a, b) => a + b, 0);
    const proof = new TextEncoder().encode(`Job result is ${result}`);

    const signature = await MOCK_HSM_KEYPAIR.sign(proof);
    console.log(`[Mock TEE] Computation complete. Proof and signature generated.`);
    return { proof, signature };
}

// --- MAIN SERVICE LOOP ---
async function main() {
    console.log(`Off-chain service starting...`);
    console.log(`Service Wallet Address: ${SERVICE_KEYPAIR.getPublicKey().toSuiAddress()}`);
    console.log(`Mock HSM Address: ${MOCK_HSM_KEYPAIR.getPublicKey().toSuiAddress()}`);
    console.log("Watching for pending jobs...");
    
    setInterval(async () => {
        try {
            const ownedObjects = await SUI_CLIENT.getOwnedObjects({ owner: SERVICE_KEYPAIR.getPublicKey().toSuiAddress() });
            const jobObjectIds = ownedObjects.data
                .filter(obj => obj.data?.type?.startsWith(`${PACKAGE_ID}::logic::JobRequest`))
                .map(obj => obj.data?.objectId || '');

            for (const objectId of jobObjectIds) {
                if (!objectId) continue;
                const jobObject = await SUI_CLIENT.getObject({ id: objectId, options: { showContent: true } });
                const fields = jobObject.data?.content?.fields as any;

                if (fields && fields.status === 0) { // Status 0 is 'Pending'
                    console.log(`Found pending job: ${objectId}`);
                    
                    const { proof, signature } = await processJobInMockTee(fields.input_data.map((s: string) => Number(s)));

                    const txb = new TransactionBlock();
                    txb.moveCall({
                        target: `${PACKAGE_ID}::logic::fulfill_job_and_pay`,
                        arguments: [
                            txb.object(TRUSTED_SIGNER_OBJECT_ID),
                            txb.object(objectId),
                            txb.object(PAYMENT_VAULT_COIN_ID),
                            txb.pure(proof),
                            txb.pure(signature)
                        ]
                    });

                    const result = await SUI_CLIENT.signAndExecuteTransactionBlock({ signer: SERVICE_KEYPAIR, transactionBlock: txb, options: {showEffects: true}});
                    console.log(`Job fulfillment transaction submitted! Status: ${result.effects?.status.status}, Digest: ${result.digest}`);
                }
            }
        } catch (error) {
            console.error("An error occurred during job check:", error);
        }
    }, 10000); // Check every 10 seconds
}

main();
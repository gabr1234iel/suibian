import { WalrusClient, WalrusFile } from "@mysten/walrus";
import { SealClient, getAllowlistedKeyServers } from "@mysten/seal";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromHex, toHex } from "@mysten/sui/utils";

// Configuration
const SUI_RPC_URL = getFullnodeUrl("testnet");

// Hardcoded policy ID (object ID) for testing purposes
const HARDCODED_POLICY_ID =
  "0xd6bf94d79547c1a98d7f0b7cd81f8c535bd2fb41f54dd1229e0414b1bfdbfb34";

// Production configuration
const STORAGE_EPOCHS = 5; // How long to store data in Walrus (in epochs)
const SEAL_THRESHOLD = 2; // Threshold for Seal encryption

// Package ID for Seal operations - this should be your actual deployed package
// For now, we'll use a placeholder that won't cause Seal operations to fail immediately
let packageId: string | null =
  "0x1ebf90154ed053abc7cd9f8418e7a896ff9aa888581ca7755a12eb29bde59f52"; // Will be set during initialization

// Initialize clients
let walrusClient: WalrusClient | null = null;
let sealClient: SealClient | null = null;
let suiClient: SuiClient | null = null;

// In-memory blob ID mapping for development/testing
// In production, you'd use a proper database
const blobIdMapping = new Map<string, string>();

// Your wallet address with WAL tokens
const WALLET_ADDRESS =
  "0x0c92849ffc05b564fd93b5046ff294f5191972f065ceb802207d72621bfc5b98";

// Add your wallet's private key (keep this secure!)
const FUNDED_WALLET_PRIVATE_KEY =
  "suiprivkey1qpme620v2mt7zpztgt79zqq5yj5as5sggqdfpzx5vl8tkxdmx55quv5uctf"; // Your actual private key here
// OR use environment variable for security:
// const FUNDED_WALLET_PRIVATE_KEY = process.env.FUNDED_WALLET_PRIVATE_KEY;

// Create funded keypair
let fundedKeypair: Ed25519Keypair | null = null;

function getFundedKeypair(): Ed25519Keypair {
  if (!fundedKeypair) {
    if (!FUNDED_WALLET_PRIVATE_KEY) {
      throw new Error("Funded wallet private key not configured");
    }

    try {
      // Handle Sui private key format (suiprivkey1...)
      if (FUNDED_WALLET_PRIVATE_KEY.startsWith("suiprivkey1")) {
        // Use fromSecretKey with the bech32 string directly
        fundedKeypair = Ed25519Keypair.fromSecretKey(FUNDED_WALLET_PRIVATE_KEY);
      } else if (FUNDED_WALLET_PRIVATE_KEY.startsWith("0x")) {
        // Handle hex format
        fundedKeypair = Ed25519Keypair.fromSecretKey(
          fromHex(FUNDED_WALLET_PRIVATE_KEY)
        );
      } else {
        // Try as base64
        fundedKeypair = Ed25519Keypair.fromSecretKey(FUNDED_WALLET_PRIVATE_KEY);
      }

      // Verify the address matches
      const derivedAddress = fundedKeypair.getPublicKey().toSuiAddress();
      console.log(`🔑 Funded keypair address: ${derivedAddress}`);
      console.log(`🔑 Expected address: ${WALLET_ADDRESS}`);

      if (derivedAddress !== WALLET_ADDRESS) {
        console.warn(
          "⚠️  Derived address doesn't match expected wallet address!"
        );
      }
    } catch (error) {
      console.error("Error creating funded keypair:", error);
      throw new Error(
        `Failed to create funded keypair: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
  return fundedKeypair;
}

/**
 * Initialize the Walrus and Seal clients
 */
async function initializeClients() {
  if (!suiClient) {
    suiClient = new SuiClient({ url: SUI_RPC_URL });
  }

  if (!walrusClient) {
    walrusClient = new WalrusClient({
      suiClient,
      network: "testnet",
    });

    // Set package ID from environment variable or leave null
    packageId =
      process.env.SEAL_PACKAGE_ID ||
      "0x1ebf90154ed053abc7cd9f8418e7a896ff9aa888581ca7755a12eb29bde59f52";

    if (packageId) {
      console.log(`✅ Seal package ID configured: ${packageId}`);
    } else {
      console.log(
        "⚠️  Seal package ID not configured - Seal operations will be disabled"
      );
    }
  }

  if (!sealClient && packageId) {
    try {
      sealClient = new SealClient({
        suiClient,
        serverConfigs: getAllowlistedKeyServers("testnet").map((id) => ({
          objectId: id,
          weight: 1,
        })),
        verifyKeyServers: false,
      });
      console.log("✅ Seal client initialized");
    } catch (error) {
      console.log("⚠️  Failed to initialize Seal client:", error);
    }
  } else if (!packageId) {
    console.log("⚠️  Seal client not initialized - no package ID configured");
  }
}

/**
 * Generate a cryptographically secure 16-byte salt
 */
function generateSalt(): string {
  // Use Web Crypto API instead of Node.js crypto
  const randomBytes = globalThis.crypto.getRandomValues(new Uint8Array(16));

  // Convert to hex string first
  const hexString = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Convert to BigInt decimal string (what zkLogin prover expects)
  const bigIntValue = BigInt("0x" + hexString);

  console.log(`🧂 Generated salt: ${hexString} -> ${bigIntValue.toString()}`);

  // Return as decimal string for zkLogin compatibility
  return bigIntValue.toString();
}

/**
 * Create a unique storage key for Google ID data
 */
async function createStorageKey(googleId: string): Promise<string> {
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(googleId);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `google_id_${hashHex}`;
}

/**
 * Simple in-memory storage for development/testing
 * In production, you would use a proper database or persistent storage
 */
const memoryStorage = new Map<string, string>();

/**
 * Store data in memory (fallback when Walrus is not available)
 */
function storeInMemory(key: string, data: string): void {
  memoryStorage.set(key, data);
}

/**
 * Retrieve data from memory
 */
function retrieveFromMemory(key: string): string | null {
  return memoryStorage.get(key) || null;
}

/**
 * Production function: Encrypt data using Seal
 */
async function encryptWithSeal(
  data: string,
  policyId: string,
  packageIdParam?: string
): Promise<Uint8Array> {
  const usePackageId = packageIdParam || packageId;

  if (!sealClient || !usePackageId) {
    throw new Error("Seal client not initialized or package ID not provided");
  }

  try {
    // Use Web Crypto API instead of Node.js crypto
    const nonce = globalThis.crypto.getRandomValues(new Uint8Array(5));
    const policyObjectBytes = fromHex(policyId);

    // Combine arrays without spreading for better compatibility
    const combinedBytes = new Uint8Array(
      policyObjectBytes.length + nonce.length
    );
    combinedBytes.set(policyObjectBytes, 0);
    combinedBytes.set(nonce, policyObjectBytes.length);
    const id = toHex(combinedBytes);

    const { encryptedObject } = await sealClient.encrypt({
      threshold: SEAL_THRESHOLD,
      packageId: usePackageId,
      id,
      data: new TextEncoder().encode(data),
    });

    console.log(`Data encrypted with Seal using policy ID: ${policyId}`);
    return encryptedObject;
  } catch (error) {
    console.error("Seal encryption error:", error);
    throw new Error(
      `Failed to encrypt data with Seal: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Production function: Decrypt data using Seal
 */
async function decryptWithSeal(
  encryptedData: Uint8Array,
  sessionKey: any
): Promise<string> {
  if (!sealClient) {
    throw new Error("Seal client not initialized");
  }

  try {
    const decrypted = await sealClient.decrypt({
      data: encryptedData,
      sessionKey,
      txBytes: new Uint8Array(), // This may need to be populated based on your Seal setup
    });

    console.log("Data decrypted with Seal successfully");
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Seal decryption error:", error);
    throw new Error(
      `Failed to decrypt data with Seal: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Production function: Store encrypted data in Walrus
 */
async function storeInWalrus(
  encryptedData: Uint8Array,
  identifier: string,
  signer: Ed25519Keypair
): Promise<string> {
  if (!walrusClient) {
    throw new Error("Walrus client not initialized");
  }

  try {
    // Create a WalrusFile from the encrypted data
    const file = WalrusFile.from({
      contents: encryptedData,
      identifier,
    });

    console.log(
      `Storing encrypted data in Walrus for identifier: ${identifier}`
    );

    // // Write the file to Walrus
    // const results = await walrusClient.writeFiles({
    //   files: [file],
    //   epochs: STORAGE_EPOCHS,
    //   deletable: true, // Allow deletion if needed
    //   signer,
    // });

    // Use YOUR funded wallet for payment instead of user's ephemeral key
    const paymentSigner = getFundedKeypair();
    console.log(`💰 Using funded wallet for payment: ${WALLET_ADDRESS}`);

    // Write the file to Walrus using YOUR funded wallet
    const results = await walrusClient.writeFiles({
      files: [file],
      epochs: STORAGE_EPOCHS,
      deletable: true,
      signer: paymentSigner, // ← Your funded wallet pays WAL tokens
    });

    if (results.length === 0) {
      throw new Error("No results returned from Walrus storage");
    }

    const result = results[0];
    console.log(`Data stored in Walrus with blob ID: ${result.blobId}`);

    return result.blobId;
  } catch (error) {
    console.error("Walrus storage error:", error);
    throw new Error(
      `Failed to store data in Walrus: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Production function: Retrieve encrypted data from Walrus
 */
async function retrieveFromWalrus(blobId: string): Promise<Uint8Array | null> {
  if (!walrusClient) {
    throw new Error("Walrus client not initialized");
  }

  try {
    console.log(`Retrieving data from Walrus with blob ID: ${blobId}`);

    // Get the file from Walrus
    const [file] = await walrusClient.getFiles({ ids: [blobId] });

    if (!file) {
      console.log(`No file found for blob ID: ${blobId}`);
      return null;
    }

    // Get the raw bytes
    const bytes = await file.bytes();
    console.log(`Retrieved ${bytes.length} bytes from Walrus`);

    return bytes;
  } catch (error) {
    console.error("Walrus retrieval error:", error);
    console.log(`Failed to retrieve data from Walrus for blob ID: ${blobId}`);
    return null;
  }
}

/**
 * Main function: Get or create salt for a Google ID (Production version with Seal + Walrus)
 * @param googleId - The Google ID to process
 * @param signer - Ed25519 keypair for signing Walrus transactions (optional, falls back to memory storage)
 * @param policyId - Seal policy ID for encryption (optional, falls back to memory storage)
 * @returns The salt associated with the Google ID
 */
export async function getOrCreateSaltForGoogleId(
  googleId: string,
  signer?: Ed25519Keypair
): Promise<string> {
  if (!googleId || typeof googleId !== "string") {
    throw new Error("Invalid Google ID provided");
  }

  try {
    await initializeClients();

    const storageKey = createStorageKey(googleId);
    console.log(`Processing Google ID: ${googleId.substring(0, 10)}...`);
    console.log(`Generated storage key: ${storageKey}`);

    // Try production storage first if signer and policyId are provided
    if (signer && packageId) {
      console.log("Using production storage (Walrus + Seal)");

      // Check if we have a blob ID mapping for this Google ID
      const existingBlobId = blobIdMapping.get(await storageKey);

      if (existingBlobId) {
        console.log(`Found existing blob ID: ${existingBlobId}`);

        try {
          // Retrieve encrypted data from Walrus
          const encryptedData = await retrieveFromWalrus(existingBlobId);

          if (encryptedData) {
            // For now, we'll store the session key in memory (not ideal for production)
            // In a real app, you'd have a proper session key management system
            console.log("Found existing encrypted data in Walrus");

            // Since we don't have a proper session key management system yet,
            // let's fall back to checking memory storage
            const memoryData = retrieveFromMemory(await storageKey);
            if (memoryData) {
              const parsedData = JSON.parse(memoryData);
              if (parsedData.googleId === googleId && parsedData.salt) {
                console.log("Returning existing salt from memory backup");
                return parsedData.salt;
              }
            }
          }
        } catch (error) {
          console.error("Error retrieving from Walrus, falling back:", error);
        }
      }
    } else if (signer && HARDCODED_POLICY_ID) {
      console.log(
        "⚠️  Seal package ID not configured, using memory storage only"
      );
    } // Try to retrieve existing data from memory (fallback or development)
    let existingData = retrieveFromMemory(await storageKey);

    if (existingData) {
      console.log("Found existing data in memory");
      const parsedData = JSON.parse(existingData);

      if (parsedData.googleId === googleId && parsedData.salt) {
        console.log("Returning existing salt from memory");
        return parsedData.salt;
      }
    }

    // Generate new salt if no existing data found
    console.log("No existing data found, generating new salt");
    const newSalt = generateSalt();

    // Validate the salt is 16 bytes
    if (!validateSalt(newSalt)) {
      throw new Error("Generated salt is not 16 bytes");
    }

    // Create the data object to store
    const dataToStore = {
      googleId,
      salt: newSalt,
      createdAt: new Date().toISOString(),
    };

    // Store in memory (always as backup)
    storeInMemory(await storageKey, JSON.stringify(dataToStore));
    console.log(`Data stored in memory for key: ${storageKey}`);

    // Try production storage if available
    if (signer && HARDCODED_POLICY_ID && packageId) {
      try {
        console.log("Attempting to store in production (Walrus + Seal)");

        // Encrypt the data with Seal
        const encryptedData = await encryptWithSeal(
          JSON.stringify(dataToStore),
          HARDCODED_POLICY_ID,
          packageId
        );

        // Store encrypted data in Walrus
        const blobId = await storeInWalrus(
          encryptedData,
          await storageKey,
          signer
        );

        // Save the blob ID mapping
        blobIdMapping.set(await storageKey, blobId);

        console.log(
          `Data successfully stored in production with blob ID: ${blobId}`
        );
      } catch (error) {
        console.error(
          "Production storage failed, data saved in memory only:",
          error
        );
      }
    } else if (signer && HARDCODED_POLICY_ID) {
      console.log(
        "⚠️  Seal package ID not configured, using memory storage only"
      );
    } else {
      console.log("No signer/policyId provided, using memory storage only");
    }

    return newSalt;
  } catch (error) {
    console.error("Error in getOrCreateSaltForGoogleId:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Failed to get or create salt for Google ID: ${errorMessage}`
    );
  }
}

/**
 * Utility function to validate that a salt is 16 bytes
 */
export function validateSalt(salt: string): boolean {
  try {
    // Check for empty or invalid input first
    if (!salt || salt.trim() === "") {
      return false;
    }

    // OLD CODE - expects hex format:
    // const buffer = Buffer.from(salt, "hex");
    // return buffer.length === 16;

    // NEW CODE - handle decimal BigInt format:
    const bigIntValue = BigInt(salt);

    // Convert back to hex to check byte length
    const hexValue = bigIntValue.toString(16);

    // Pad with leading zero if odd length
    const paddedHex = hexValue.length % 2 === 0 ? hexValue : "0" + hexValue;

    // Check if it represents 16 bytes (32 hex characters max)
    return paddedHex.length <= 32;
  } catch (error) {
    console.error("Salt validation error:", error);
    return false;
  }
}
/**
 * Utility function to check if a Google ID exists in storage
 */
export async function checkGoogleIdExists(googleId: string): Promise<boolean> {
  if (!googleId || typeof googleId !== "string") {
    return false;
  }

  try {
    const storageKey = createStorageKey(googleId);

    // Check memory storage
    const existingData = retrieveFromMemory(await storageKey);
    if (existingData) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking Google ID existence:", error);
    return false;
  }
}

/**
 * Utility function to get salt for an existing Google ID (without creating new one)
 */
export async function getSaltForGoogleId(
  googleId: string
): Promise<string | null> {
  if (!googleId || typeof googleId !== "string") {
    throw new Error("Invalid Google ID provided");
  }

  try {
    const storageKey = createStorageKey(googleId);

    // Check memory storage
    const existingData = retrieveFromMemory(await storageKey);
    if (existingData) {
      const parsedData = JSON.parse(existingData);
      if (parsedData.googleId === googleId && parsedData.salt) {
        return parsedData.salt;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting salt for Google ID:", error);
    return null;
  }
}

/**
 * Development utility to list all stored Google IDs and their salts
 */
export function listStoredData(): Array<{
  googleId: string;
  salt: string;
  createdAt: string;
}> {
  const results: Array<{ googleId: string; salt: string; createdAt: string }> =
    [];

  // Convert map to array for compatibility
  const entries = Array.from(memoryStorage.entries());

  for (const [key, value] of entries) {
    try {
      const parsedData = JSON.parse(value);
      results.push({
        googleId: parsedData.googleId,
        salt: parsedData.salt,
        createdAt: parsedData.createdAt,
      });
    } catch (error) {
      console.error(`Error parsing data for key ${key}:`, error);
    }
  }

  return results;
}

/**
 * Development utility to clear all stored data
 */
export function clearStoredData(): void {
  memoryStorage.clear();
  console.log("All stored data cleared from memory");
}

/**
 * Advanced function: Store data with encryption using Seal (placeholder)
 * Note: This is a simplified version - actual Seal API usage may differ
 */
export async function storeEncryptedSalt(
  googleId: string,
  salt: string
): Promise<boolean> {
  try {
    // This would use Seal for encryption in production
    const dataToEncrypt = JSON.stringify({
      googleId,
      salt,
      timestamp: Date.now(),
    });

    // For now, just store in memory with base64 encoding as a placeholder for encryption
    const encodedData = Buffer.from(dataToEncrypt).toString("base64");
    const storageKey = createStorageKey(googleId);
    storeInMemory(`encrypted_${storageKey}`, encodedData);

    console.log("Data stored with placeholder encryption");
    return true;
  } catch (error) {
    console.error("Error storing encrypted salt:", error);
    return false;
  }
}

/**
 * Advanced function: Retrieve and decrypt data using Seal (placeholder)
 */
export async function getEncryptedSalt(
  googleId: string
): Promise<string | null> {
  try {
    const storageKey = createStorageKey(googleId);
    const encodedData = retrieveFromMemory(`encrypted_${storageKey}`);

    if (!encodedData) {
      return null;
    }

    // Decode the base64 data (placeholder for decryption)
    const decodedData = Buffer.from(encodedData, "base64").toString("utf8");
    const parsedData = JSON.parse(decodedData);

    if (parsedData.googleId === googleId && parsedData.salt) {
      return parsedData.salt;
    }

    return null;
  } catch (error) {
    console.error("Error retrieving encrypted salt:", error);
    return null;
  }
}
/**
 * Production function: Create a Seal policy for encrypting salts
 * @param signer - Ed25519 keypair for signing the transaction
 * @returns The policy ID that can be used for encryption, or null if Seal is not available
 */
export async function createSealPolicy(
  signer: Ed25519Keypair
): Promise<string | null> {
  if (!sealClient || !packageId || !suiClient) {
    console.log(
      "⚠️  Seal client, package ID, or SUI client not available - cannot create policy"
    );
    return null;
  }

  try {
    console.log("🔐 Creating Seal policy...");

    // Create a new transaction block
    const txb = new Transaction();

    // Create a Seal policy using your deployed Seal package
    // This creates a policy that defines who can decrypt the data
    const policyResult = txb.moveCall({
      target: `${packageId}::seal::create_policy`,
      arguments: [
        // Add policy parameters based on your Seal package implementation
        // This might include threshold, key servers, etc.
        txb.pure.u8(SEAL_THRESHOLD), // threshold
        // Add other required arguments based on your Seal package
      ],
    });

    // Execute the transaction
    const result = await suiClient.signAndExecuteTransaction({
      transaction: txb,
      signer,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    console.log("🔐 Policy creation transaction:", result.digest);

    // Extract the policy ID from the created objects
    const createdObjects = result.objectChanges?.filter(
      (change) => change.type === "created"
    );

    if (!createdObjects || createdObjects.length === 0) {
      throw new Error("No objects were created in the policy transaction");
    }

    // Find the policy object (this depends on your Seal package structure)
    const policyObject = createdObjects.find(
      (obj) => obj.type === "created" && obj.objectType?.includes("Policy")
    );

    if (!policyObject || policyObject.type !== "created") {
      throw new Error("Policy object not found in transaction results");
    }

    const policyId = policyObject.objectId;
    console.log(`✅ Seal policy created with ID: ${policyId}`);

    return policyId;
  } catch (error) {
    console.error("❌ Error creating Seal policy:", error);
    throw new Error(
      `Failed to create Seal policy: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Utility function: Check if Seal package is properly deployed and accessible
 */
export async function validateSealPackage(): Promise<boolean> {
  if (!suiClient || !packageId) {
    console.log("⚠️  SUI client or package ID not available");
    return false;
  }

  try {
    console.log(`🔍 Validating Seal package: ${packageId}`);

    // Get package info
    const packageInfo = await suiClient.getObject({
      id: packageId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (!packageInfo.data) {
      console.log("❌ Package not found");
      return false;
    }

    console.log("✅ Seal package found and accessible");
    console.log("Package details:", packageInfo.data);

    return true;
  } catch (error) {
    console.error("❌ Error validating Seal package:", error);
    return false;
  }
}

/**
 * Production function: Get blob ID mapping for debugging
 */
export function getBlobIdMapping(): Map<string, string> {
  return blobIdMapping;
}

/**
 * Production function: Clear blob ID mappings
 */
export function clearBlobIdMapping(): void {
  blobIdMapping.clear();
  console.log("Blob ID mappings cleared");
}

/**
 * Production function: Check if production storage is available
 */
export async function isProductionStorageAvailable(): Promise<boolean> {
  try {
    await initializeClients();

    if (!walrusClient || !sealClient) {
      return false;
    }

    // Test Walrus connectivity
    await walrusClient.systemState();

    return true;
  } catch (error) {
    console.error("Production storage check failed:", error);
    return false;
  }
}

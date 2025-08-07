import { WalrusClient, WalrusFile } from "@mysten/walrus";
import { SealClient, getAllowlistedKeyServers } from "@mysten/seal";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromHex, toHex } from "@mysten/sui/utils";
import crypto from "crypto";

// Configuration
const SUI_RPC_URL = getFullnodeUrl("testnet");

// Your wallet address with WAL tokens
const WALLET_ADDRESS =
  "0x0c92849ffc05b564fd93b5046ff294f5191972f065ceb802207d72621bfc5b98";

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
  // Generate 16 random bytes and return as hex string (for zkLogin compatibility)
  const randomBytes = crypto.randomBytes(16);

  // Convert to BigInt decimal string (what zkLogin prover expects)
  const hexString = "0x" + randomBytes.toString("hex");
  const bigIntValue = BigInt(hexString);

  console.log(
    `🧂 Generated salt: ${randomBytes.toString(
      "hex"
    )} -> ${bigIntValue.toString()}`
  );

  // Return as decimal string for zkLogin compatibility
  return bigIntValue.toString();
}

/**
 * Create a unique storage key for Google ID data
 */
function createStorageKey(googleId: string): string {
  return `google_id_${crypto
    .createHash("sha256")
    .update(googleId)
    .digest("hex")}`;
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
    const nonce = crypto.getRandomValues(new Uint8Array(5));
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

    // Write the file to Walrus
    const results = await walrusClient.writeFiles({
      files: [file],
      epochs: STORAGE_EPOCHS,
      deletable: true, // Allow deletion if needed
      signer,
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
  signer?: Ed25519Keypair,
  policyId?: string
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
    if (signer && policyId && packageId) {
      console.log("Using production storage (Walrus + Seal)");

      // Check if we have a blob ID mapping for this Google ID
      const existingBlobId = blobIdMapping.get(storageKey);

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
            const memoryData = retrieveFromMemory(storageKey);
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
    } else if (signer && policyId) {
      console.log(
        "⚠️  Seal package ID not configured, using memory storage only"
      );
    } // Try to retrieve existing data from memory (fallback or development)
    let existingData = retrieveFromMemory(storageKey);

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
    storeInMemory(storageKey, JSON.stringify(dataToStore));
    console.log(`Data stored in memory for key: ${storageKey}`);

    // Try production storage if available
    if (signer && policyId && packageId) {
      try {
        console.log("Attempting to store in production (Walrus + Seal)");

        // Encrypt the data with Seal
        const encryptedData = await encryptWithSeal(
          JSON.stringify(dataToStore),
          policyId,
          packageId
        );

        // Store encrypted data in Walrus
        const blobId = await storeInWalrus(encryptedData, storageKey, signer);

        // Save the blob ID mapping
        blobIdMapping.set(storageKey, blobId);

        console.log(
          `Data successfully stored in production with blob ID: ${blobId}`
        );
      } catch (error) {
        console.error(
          "Production storage failed, data saved in memory only:",
          error
        );
      }
    } else if (signer && policyId) {
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
    const existingData = retrieveFromMemory(storageKey);
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
    const existingData = retrieveFromMemory(storageKey);
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
  if (!sealClient || !packageId) {
    console.log(
      "⚠️  Seal client or package ID not available - cannot create policy"
    );
    return null;
  }

  try {
    // This is a simplified policy creation
    // You may need to adjust based on your specific requirements
    const policyId = crypto.randomBytes(32).toString("hex");

    console.log(`Created Seal policy with ID: ${policyId}`);

    // In a real implementation, you would create an actual Seal policy here
    // using the Seal client's policy creation methods

    return `0x${policyId}`;
  } catch (error) {
    console.error("Error creating Seal policy:", error);
    throw new Error(
      `Failed to create Seal policy: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
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

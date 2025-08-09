import { WalrusClient, WalrusFile } from "@mysten/walrus";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromHex, toHex } from "@mysten/sui/utils";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";

// Configuration
const SUI_RPC_URL = getFullnodeUrl("testnet");

// Hardcoded policy ID (object ID) for testing purposes
const HARDCODED_POLICY_ID =
  "0xd6bf94d79547c1a98d7f0b7cd81f8c535bd2fb41f54dd1229e0414b1bfdbfb34";

// Production configuration
const STORAGE_EPOCHS = 5; // How long to store data in Walrus (in epochs)

// Package ID for Seal operations - this should be your actual deployed package
// For now, we'll use a placeholder that won't cause Seal operations to fail immediately
let packageId: string | null =
  "0x1ebf90154ed053abc7cd9f8418e7a896ff9aa888581ca7755a12eb29bde59f52"; // Will be set during initialization

// Initialize clients
let walrusClient: WalrusClient | null = null;
let suiClient: SuiClient | null = null;

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
 * Get the Firestore document ID from the 'blobIdMapping' collection where 'storageId' matches the parameter.
 * @param storageId - The storage ID to search for.
 * @returns The Firestore document ID if found, otherwise null.
 */
export async function getBlobIdByStorageId(
  storageId: string
): Promise<string | null> {
  const db = getFirestore();
  const docSnap = await getDocs(
    query(collection(db, "blobIdMapping"), where("__name__", "==", storageId))
  );

  if (docSnap.empty) {
    return null;
  }

  // Get the first matching document and return its blobId field
  const docData = docSnap.docs[0].data();
  return docData && docData.blobId ? docData.blobId : null;
}

export async function storeBlobIdMapping(
  storageId: string,
  blobId: string
): Promise<void> {
  // Use storageId as the document ID
  const docRef = doc(db, "blobIdMapping", storageId);

  // Set or update the document with storageId as the document ID
  await updateDoc(docRef, { blobId }).catch(async (error) => {
    // If the document does not exist, create it
    if (error.code === "not-found") {
      await setDoc(docRef, { storageId, blobId });
    } else {
      throw error;
    }
  });
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
 * Production function: Store data in Walrus as a direct blob (not a Quilt)
 * This ensures we store simple JSON data that can be easily retrieved
 */
async function storeInWalrus(
  data: any, // Accept the actual data object
  identifier: string,
  signer: Ed25519Keypair
): Promise<string> {
  if (!walrusClient) {
    throw new Error("Walrus client not initialized");
  }

  try {
    // Convert data to JSON string, then to UTF-8 bytes
    const jsonString = JSON.stringify(data);
    const encodedData = new TextEncoder().encode(jsonString);

    console.log(
      `Storing data in Walrus as direct blob for identifier: ${identifier}`
    );
    console.log(`JSON string: ${jsonString}`);
    console.log(`Encoded data length: ${encodedData.length} bytes`);

    // Use YOUR funded wallet for payment instead of user's ephemeral key
    const paymentSigner = getFundedKeypair();
    console.log(`💰 Using funded wallet for payment: ${WALLET_ADDRESS}`);

    // Store as a direct blob (not a file/quilt) for simpler retrieval
    const result = await walrusClient.writeBlob({
      blob: encodedData,
      epochs: STORAGE_EPOCHS,
      deletable: true,
      signer: paymentSigner, // ← Your funded wallet pays WAL tokens
    });

    console.log(
      `Data stored in Walrus as direct blob with ID: ${result.blobId}`
    );
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
 * Production function: Retrieve data from Walrus and parse as JSON
 * Handles both direct blobs and Quilts properly
 */
async function retrieveFromWalrus(blobId: string): Promise<any | null> {
  if (!walrusClient) {
    throw new Error("Walrus client not initialized");
  }

  try {
    console.log(`Retrieving data from Walrus with blob ID: ${blobId}`);

    // First, try to get it as a WalrusBlob to check if it's a Quilt
    try {
      const blob = await walrusClient.getBlob({ blobId });
      console.log("Successfully retrieved blob, checking if it's a Quilt...");

      // If it's a Quilt, get the files inside it
      const files = await blob.files();
      console.log(`Found ${files.length} files in the blob/quilt`);

      if (files.length > 0) {
        // Try to find our JSON data in the quilt files
        for (const file of files) {
          try {
            const identifier = await file.getIdentifier();
            const tags = await file.getTags();
            console.log(`File identifier: ${identifier}, tags:`, tags);

            // Try to parse each file as JSON
            const jsonData = await file.json();
            console.log(`✅ Successfully parsed JSON data from quilt file`);
            return jsonData;
          } catch (fileError) {
            // Try next file or fallback methods
            console.log("Failed to parse file as JSON, trying next...");
          }
        }

        // If no file worked as JSON, try text parsing on first file
        const firstFile = files[0];
        try {
          const textData = await firstFile.text();
          console.log(
            `Retrieved text data from first file, length: ${textData.length}`
          );
          if (
            textData.trim().startsWith("{") ||
            textData.trim().startsWith("[")
          ) {
            const parsedData = JSON.parse(textData);
            console.log(`✅ Successfully parsed JSON from text data`);
            return parsedData;
          }
        } catch (textError) {
          console.warn("Failed to parse first file as text/JSON");
        }
      }
    } catch (blobError) {
      console.log("Failed to get as blob, trying as direct file...");
    }

    // Fallback: Try the original method (direct file access)
    try {
      const [file] = await walrusClient.getFiles({ ids: [blobId] });

      if (!file) {
        console.log(`No file found for blob ID: ${blobId}`);
        return null;
      }

      // Try direct JSON parsing
      try {
        const jsonData = await file.json();
        console.log(
          `✅ Successfully parsed JSON data using direct file access`
        );
        return jsonData;
      } catch (jsonError) {
        // Try text then JSON
        const textData = await file.text();
        if (
          textData.trim().startsWith("{") ||
          textData.trim().startsWith("[")
        ) {
          const parsedData = JSON.parse(textData);
          console.log(`✅ Successfully parsed JSON from direct text data`);
          return parsedData;
        }
      }
    } catch (directError) {
      console.log("Direct file access also failed");
    }

    // Last resort: Use readBlob API for raw data
    try {
      console.log("Trying raw blob read as last resort...");
      const rawBlob = await walrusClient.readBlob({ blobId });
      console.log(`Retrieved raw blob: ${rawBlob.length} bytes`);
      console.log("First 20 bytes:", Array.from(rawBlob.slice(0, 20)));

      // Try to decode as UTF-8 and parse as JSON
      const textData = new TextDecoder().decode(rawBlob);
      if (textData.trim().startsWith("{") || textData.trim().startsWith("[")) {
        const parsedData = JSON.parse(textData);
        console.log(`✅ Successfully parsed JSON from raw blob data`);
        return parsedData;
      }
    } catch (rawError) {
      console.error("Raw blob read failed:", rawError);
    }

    // If we get here, the data is truly corrupted or in an unknown format
    console.warn(
      "🔄 Could not parse data in any known format. This blob needs to be recreated."
    );
    return null;
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
    const existingBlobId = await getBlobIdByStorageId(await storageKey);
    if (signer && packageId) {
      console.log("Using production storage (Walrus + Seal)");

      // Check if we have a blob ID mapping for this Google ID
      const userData = await retrieveFromWalrus(existingBlobId!);

      if (existingBlobId) {
        console.log(`Found existing blob ID in Firestore: ${existingBlobId}`);
        if (userData && userData.salt) {
          console.log("✅ Successfully retrieved existing salt from Walrus");
          return userData.salt;
        } else {
          console.warn(
            "⚠️ Retrieved data but no salt found or data is corrupted"
          );
          console.log("🔄 Creating new salt and updating storage...");

          // Clear the old, corrupted blob reference
          console.log(`Clearing corrupted blob reference: ${existingBlobId}`);
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
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      migrated: existingBlobId ? true : false, // Track if this was a migration
    };

    // Store in memory (always as backup)
    storeInMemory(await storageKey, JSON.stringify(dataToStore));
    console.log(`Data stored in memory for key: ${storageKey}`);

    // Try production storage if available
    if (signer && HARDCODED_POLICY_ID && packageId) {
      try {
        console.log("Attempting to store in production (Walrus + Seal)");

        const blobId = await storeInWalrus(
          dataToStore,
          await storageKey,
          signer
        );

        // Save the blob ID mapping
        await storeBlobIdMapping(await storageKey, blobId);

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
 * Production function: Check if production storage is available
 */
export async function isProductionStorageAvailable(): Promise<boolean> {
  try {
    await initializeClients();

    if (!walrusClient) {
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

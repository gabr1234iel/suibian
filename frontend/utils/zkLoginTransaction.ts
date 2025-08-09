// utils/zkLoginTransaction.ts
import {
  SuiClient,
  getFullnodeUrl
} from '@mysten/sui/client';
import {
  Ed25519Keypair
} from '@mysten/sui/keypairs/ed25519';
import {
  Transaction
} from '@mysten/sui/transactions';
import {
  fromB64,
  toB64
} from '@mysten/sui/utils';
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
  getZkLoginSignature,
  genAddressSeed
} from '@mysten/zklogin';
import { jwtDecode } from 'jwt-decode';

export interface ZkLoginState {
  ephemeralKeyPair: Ed25519Keypair;
  userAddress: string;
  jwt: string;
  salt: string;
  randomness: string;
  maxEpoch: number;
}

export interface ZkProof {
  proofPoints: {
    a: string[];
    b: string[][];
    c: string[];
  };
  issBase64Details: {
    value: string;
    indexMod4: number;
  };
  headerBase64: string;
}

export class ZkLoginTransactionManager {
  private client: SuiClient;
  private zkLoginState: ZkLoginState | null = null;

  constructor(network: 'devnet' | 'testnet' | 'mainnet' = 'devnet') {
    this.client = new SuiClient({ url: getFullnodeUrl(network) });
  }

  // Initialize zkLogin state after successful authentication
  async initializeZkLogin(jwt: string, ephemeralKeyPair: Ed25519Keypair, salt: string, randomness: string, maxEpoch: number): Promise<string> {
    try {
      // Decode JWT to get user info
      const decodedJWT = jwtDecode(jwt);

      // Generate user address from JWT
      const userAddress = jwtToAddress(jwt, salt);

      // Store zkLogin state
      this.zkLoginState = {
        ephemeralKeyPair,
        userAddress,
        jwt,
        salt,
        randomness,
        maxEpoch
      };

      console.log('zkLogin initialized:', {
        userAddress,
        ephemeralPublicKey: ephemeralKeyPair.getPublicKey().toSuiAddress(),
        salt,
        randomness,
        maxEpoch
      });

      return userAddress;
    } catch (error) {
      console.error('Failed to initialize zkLogin:', error);
      throw new Error('zkLogin initialization failed');
    }
  }

  // Note: zkProof generation moved to AppContext 
  // This class no longer stores or generates zkProof

  // Sign and execute a transaction using zkLogin (zkProof passed as parameter)
  async signAndExecuteTransaction(transaction: Transaction, zkProof: ZkProof): Promise<any> {
    if (!this.zkLoginState) {
      throw new Error('zkLogin not initialized');
    }

    if (!zkProof) {
      throw new Error('zkProof is required for transaction signing');
    }

    try {
      // Set sender address and gas budget (match test script)
      transaction.setSender(this.zkLoginState.userAddress);
      
      // Use the same gas budget as the test script
      transaction.setGasBudget(15000000); // 0.015 SUI (exactly like test script)
      
      console.log('Transaction sender set to:', this.zkLoginState.userAddress);
      console.log('Gas budget set to: 0.015 SUI (matching test script)');

      // Build the transaction
      console.log('Building transaction...');
      const txBytes = await transaction.build({ client: this.client });
      console.log('Transaction built successfully, size:', txBytes.length);

      // Sign with ephemeral key pair
      const ephemeralSignature = await this.zkLoginState.ephemeralKeyPair.signTransaction(txBytes);
      console.log('Ephemeral signature created:', {
        signature: ephemeralSignature.signature,
        signatureLength: ephemeralSignature.signature.length
      });

      // Create zkLogin signature using provided zkProof
      console.log('Creating zkLogin signature with:', {
        salt: this.zkLoginState.salt,
        saltAsBigInt: BigInt(this.zkLoginState.salt),
        maxEpoch: this.zkLoginState.maxEpoch,
        hasZkProof: !!zkProof,
        zkProofStructure: Object.keys(zkProof || {}),
        zkProofSample: zkProof ? {
          proofPoints: zkProof.proofPoints ? 'present' : 'missing',
          issBase64Details: zkProof.issBase64Details ? 'present' : 'missing'
        } : 'no zkProof'
      });

      console.log('🔍 About to create zkLogin signature with inputs:', {
        zkProofKeys: Object.keys(zkProof),
        addressSeed: this.zkLoginState.salt,
        addressSeedAsBigInt: BigInt(this.zkLoginState.salt),
        maxEpoch: this.zkLoginState.maxEpoch,
        maxEpochType: typeof this.zkLoginState.maxEpoch,
        userSignature: ephemeralSignature.signature.substring(0, 20) + '...',
        userSignatureLength: ephemeralSignature.signature.length
      });

      // Generate addressSeed using the official zkLogin method
      const decodedJwt = jwtDecode(this.zkLoginState.jwt) as any;
      const addressSeed = genAddressSeed(
        BigInt(this.zkLoginState.salt),
        "sub",
        decodedJwt.sub,
        decodedJwt.aud
      ).toString();

      console.log('Generated addressSeed using genAddressSeed:', {
        userSalt: this.zkLoginState.salt,
        sub: decodedJwt.sub,
        aud: decodedJwt.aud,
        addressSeed
      });

      const zkLoginSignature = getZkLoginSignature({
        inputs: {
          ...zkProof,
          addressSeed: addressSeed,
        },
        maxEpoch: this.zkLoginState.maxEpoch,
        userSignature: ephemeralSignature.signature,
      });

      console.log('✅ zkLogin signature created successfully');

      // Execute the transaction
      console.log('🚀 About to execute transaction with:', {
        transactionSize: txBytes.length,
        signatureLength: zkLoginSignature.length,
        userAddress: this.zkLoginState.userAddress
      });

      const result = await this.client.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: zkLoginSignature,
        options: {
          showRawEffects: true,
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      console.log('✅ Transaction executed successfully!');

      return result;
    } catch (error) {
      console.error('❌ Failed to sign and execute transaction:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      
      // If it's an execution error, log the abort code
      if (error instanceof Error && error.message) {
        console.error('❌ Full error message:', error.message);
        if (error.message.includes('abort') || error.message.includes('ABORT')) {
          console.error('🚨 Move abort detected! This indicates a smart contract assertion failed.');
          console.error('🔍 Possible causes:');
          console.error('  - Agent not active (EAgentNotActive)');
          console.error('  - Insufficient payment (EInsufficientPayment)');
          console.error('  - User already subscribed');
          console.error('  - Invalid agent or subscription manager ID');
        }
      }
      
      throw error;
    }
  }

  // Generic method to sign and execute any transaction (requires zkProof parameter)
  async executeTransaction(transaction: Transaction, zkProof: ZkProof): Promise<any> {
    return this.signAndExecuteTransaction(transaction, zkProof);
  }

  // Get current user address
  getUserAddress(): string | null {
    return this.zkLoginState?.userAddress || null;
  }

  // Check if zkLogin is initialized
  isInitialized(): boolean {
    return this.zkLoginState !== null;
  }

  // Get the SuiClient instance
  getClient(): SuiClient {
    return this.client;
  }

  // Clear zkLogin state (for logout)
  clearState(): void {
    this.zkLoginState = null;
  }
}
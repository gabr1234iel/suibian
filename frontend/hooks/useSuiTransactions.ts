// hooks/useSuiTransactions.ts
import { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { ZkLoginTransactionManager } from '../utils/zkLoginTransaction';
import { Transaction } from '@mysten/sui/transactions';

// Contract constants
const PACKAGE_ID = "0x705da1cf5e87858f32787d79745381f2f523c8006794ef209169c7472afb09fa";
const AGENT_REGISTRY_MODULE = "agent_registry";
const SUBSCRIPTION_MANAGER_MODULE = "subscription_manager";

// Mock TEE data (replace with actual TEE public key and wallet in production)
const MOCK_TEE_PUBLIC_KEY = new Array(32).fill(1); // 32-byte mock public key
const MOCK_TEE_WALLET_ADDRESS = '0xa125b591b0feb5f6f1843b54422831c61a9427531c7c8aab91d6053048a5b092';

interface CreateAgentParams {
  name: string;
  description: string;
  fee: number; // percentage
}

interface TransactionResult {
  success: boolean;
  agentId?: string;
  transactionDigest?: string;
  result?: any;
  error?: string;
}

export const useSuiTransactions = () => {
  const { jwt, userSalt, maxEpoch, userGoogleId, isLoggedIn, ephemeralKeypair, zkProof, randomness, refreshBalance } = useAppContext();
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionManager, setTransactionManager] = useState<ZkLoginTransactionManager | null>(null);

  // Initialize transaction manager when needed (using cached session data)
  const initializeTransactionManager = useCallback(async (): Promise<ZkLoginTransactionManager> => {
    if (!isLoggedIn || !jwt || !userSalt || !maxEpoch || !userGoogleId || !ephemeralKeypair || !zkProof || !randomness) {
      throw new Error('User not properly logged in or missing cached zkLogin session data');
    }

    if (transactionManager?.isInitialized()) {
      return transactionManager;
    }

    console.log('Initializing transaction manager with cached session data...');
    console.log('Using ephemeral keypair with public key:', ephemeralKeypair.getPublicKey().toSuiAddress());
    
    const manager = new ZkLoginTransactionManager('devnet');
    
    // Use cached ephemeral keypair and other session data
    await manager.initializeZkLogin(jwt, ephemeralKeypair, userSalt, randomness, maxEpoch);
    
    setTransactionManager(manager);
    console.log('✅ Transaction manager initialized with cached zkProof');
    return manager;
  }, [jwt, userSalt, maxEpoch, userGoogleId, isLoggedIn, ephemeralKeypair, zkProof, randomness, transactionManager]);

  // Create a register agent transaction
  const createRegisterAgentTransaction = useCallback((params: CreateAgentParams): Transaction => {
    const transaction = new Transaction();

    // Convert form data to contract parameters
    const subscriptionFeePerMonth = Math.floor(params.fee * 10_000_000); // Convert percentage to MIST (0.01 SUI per 1%)
    const minDeposit = 50_000_000; // 0.05 SUI minimum
    const maxDeposit = 100_000_000_000; // 100 SUI maximum

    // Convert name and description to byte arrays
    const agentNameBytes = Array.from(new TextEncoder().encode(params.name));
    const agentDescriptionBytes = Array.from(new TextEncoder().encode(params.description));

    transaction.moveCall({
      target: `${PACKAGE_ID}::${AGENT_REGISTRY_MODULE}::create_agent`,
      arguments: [
        transaction.pure.vector("u8", agentNameBytes),
        transaction.pure.vector("u8", agentDescriptionBytes),
        transaction.pure.u64(subscriptionFeePerMonth),
        transaction.pure.u64(minDeposit),
        transaction.pure.u64(maxDeposit),
        transaction.pure.vector("u8", MOCK_TEE_PUBLIC_KEY),
        transaction.pure.address(MOCK_TEE_WALLET_ADDRESS),
      ],
    });

    return transaction;
  }, []);

  // Create agent on blockchain
  const createAgent = useCallback(async (params: CreateAgentParams): Promise<TransactionResult> => {
    setIsTransacting(true);
    try {
      console.log('🚀 Creating agent on blockchain...', params);
      
      const manager = await initializeTransactionManager();
      const transaction = createRegisterAgentTransaction(params);
      const result = await manager.executeTransaction(transaction, zkProof);
      
      console.log('✅ Agent created successfully:', result);
      
      // Extract agent ID from created objects
      let agentId: string | undefined;
      if (result.objectChanges) {
        for (const change of result.objectChanges) {
          if (change.type === 'created' && change.objectType?.includes('TradingAgent')) {
            agentId = change.objectId;
            console.log(`Agent created with ID: ${agentId}`);
            break;
          }
        }
      }
      
      // Refresh balance to reflect gas fees paid for the transaction
      console.log('🔄 Refreshing balance after transaction...');
      await refreshBalance();
      
      return {
        success: true,
        agentId,
        transactionDigest: result.digest,
        result
      };
    } catch (error) {
      console.error('❌ Failed to create agent:', error);
      console.error('❌ Full error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsTransacting(false);
    }
  }, [initializeTransactionManager, createRegisterAgentTransaction, refreshBalance]);

  // Subscribe to agent (future function)
  const subscribeToAgent = useCallback(async (agentId: string): Promise<TransactionResult> => {
    setIsTransacting(true);
    try {
      // TODO: Implement subscription logic
      throw new Error('Subscription functionality not yet implemented');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsTransacting(false);
    }
  }, []);

  // Deposit trading funds (future function)
  const depositTradingFunds = useCallback(async (agentId: string, amount: number): Promise<TransactionResult> => {
    setIsTransacting(true);
    try {
      // TODO: Implement deposit logic
      throw new Error('Deposit functionality not yet implemented');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsTransacting(false);
    }
  }, []);

  // Check if ready for transactions (now includes cached session data)
  const isReady = useCallback((): boolean => {
    return !!(isLoggedIn && jwt && userSalt && maxEpoch && userGoogleId && ephemeralKeypair && zkProof && randomness);
  }, [isLoggedIn, jwt, userSalt, maxEpoch, userGoogleId, ephemeralKeypair, zkProof, randomness]);

  // Get current user address
  const getUserAddress = useCallback((): string | null => {
    return transactionManager?.getUserAddress() || null;
  }, [transactionManager]);

  return {
    // State
    isTransacting,
    isReady: isReady(),
    
    // Functions
    createAgent,
    subscribeToAgent,
    depositTradingFunds,
    getUserAddress,
    
    // Utility
    initializeTransactionManager
  };
};
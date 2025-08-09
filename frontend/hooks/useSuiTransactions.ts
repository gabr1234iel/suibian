// hooks/useSuiTransactions.ts
import { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { ZkLoginTransactionManager } from '../utils/zkLoginTransaction';
import { Transaction } from '@mysten/sui/transactions';

// Contract constants
const PACKAGE_ID = "0xfd6a00339d853aae2473bab92a11d2db322604e33339bad08e8e52f97470fa9d";
const AGENT_REGISTRY_MODULE = "agent_registry";
const SUBSCRIPTION_MANAGER_MODULE = "subscription_manager";
const SUBSCRIPTION_MANAGER_ID = "0x83e0dd1f1df2c174f353a3b0cd0fc03141690f3f2ebd7bfbbea409f8db409454";

// Mock TEE data (replace with actual TEE public key and wallet in production)
const MOCK_TEE_PUBLIC_KEY = new Array(32).fill(1); // 32-byte mock public key
const MOCK_TEE_WALLET_ADDRESS = '0xa125b591b0feb5f6f1843b54422831c61a9427531c7c8aab91d6053048a5b092';

interface CreateAgentParams {
  name: string;
  description: string;
  fee: number; // percentage
}

interface SubscribeToAgentParams {
  agentId: string;
  subscriptionDurationDays?: number; // defaults to 30 days
}

interface TransactionResult {
  success: boolean;
  agentId?: string;
  subscriptionId?: string;
  transactionDigest?: string;
  result?: any;
  error?: string;
}

interface DepositTradingFundsParams {
  agentId: string;
  amount: number; // in SUI
}

interface DepositResult extends TransactionResult {
  depositAmount?: number;
  agentWalletAddress?: string;
  userTotalDeposited?: number;
  agentTotalDeposited?: number;
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

  // Create a subscribe to agent transaction
  const createSubscribeToAgentTransaction = useCallback((params: SubscribeToAgentParams): Transaction => {
    const transaction = new Transaction();

    // Split coin for payment (0.02 SUI)
    const subscriptionFee = 20_000_000; // 0.02 SUI in MIST
    
    // Follow test script pattern exactly - no array destructuring, but use correct API
    const paymentCoin = transaction.splitCoins(transaction.gas, [transaction.pure.u64(subscriptionFee)]);

    transaction.moveCall({
      target: `${PACKAGE_ID}::${SUBSCRIPTION_MANAGER_MODULE}::subscribe_to_agent`,
      arguments: [
        transaction.object(params.agentId), // agent
        transaction.object(SUBSCRIPTION_MANAGER_ID), // manager
        paymentCoin, // payment
        transaction.pure.u64(params.subscriptionDurationDays || 30), // subscription_duration_days
      ],
    });

    // Set gas budget exactly like test script
    transaction.setGasBudget(15000000); // 0.015 SUI (same as test script)

    return transaction;
  }, []);

  // Subscribe to agent
  const subscribeToAgent = useCallback(async (params: SubscribeToAgentParams): Promise<TransactionResult> => {
    setIsTransacting(true);
    try {
      console.log('🚀 Subscribing to agent...', params);
      
      const manager = await initializeTransactionManager();
      const transaction = createSubscribeToAgentTransaction(params);
      
      // Debug: Check transaction details before execution
      console.log('🔍 Transaction details before execution:', {
        agentId: params.agentId,
        subscriptionManagerId: SUBSCRIPTION_MANAGER_ID,
        subscriptionFee: '0.01 SUI (10000000 MIST)',
        duration: params.subscriptionDurationDays || 30,
        gasBudget: '0.015 SUI',
      });
      
      // Try to get agent info to verify it exists and is active
      try {
        const agentInfo = await getAgentInfo(params.agentId);
        console.log('🔍 Agent info before subscription:', {
          name: agentInfo.name,
          isActive: agentInfo.isActive,
          subscriptionFee: agentInfo.subscriptionFee,
          totalSubscribers: agentInfo.totalSubscribers,
          creator: agentInfo.creator,
        });
        
        if (!agentInfo.isActive) {
          console.error('❌ Agent is not active! This will cause EAgentNotActive abort.');
          throw new Error('Agent is not active');
        }
        
        if (20_000_000 < agentInfo.subscriptionFee) {
          console.error('❌ Payment insufficient! Paying 0.01 SUI but agent requires', agentInfo.subscriptionFee / 1_000_000_000, 'SUI');
          throw new Error('Insufficient payment amount');
        }
        
      } catch (agentError) {
        console.error('❌ Could not get agent info:', agentError);
        console.error('❌ This might indicate the agent ID is invalid');
      }
      
      const result = await manager.executeTransaction(transaction, zkProof);
      
      console.log('✅ Subscription successful:', result);
      
      // Check events first
      if (result.events) {
        for (const event of result.events) {
          if (event.type.includes('UserSubscribed')) {
            console.log('✅ UserSubscribed event found:', event.parsedJson);
          }
        }
      } else {
        console.log('⚠️ No events in result');
      }
      
      // Extract subscription ID from created objects
      let subscriptionId: string | undefined;
      if (result.objectChanges) {
        console.log('🔍 All object changes:', result.objectChanges);
        for (const change of result.objectChanges) {
          console.log(`🔍 Object change: type=${change.type}, objectType=${change.objectType}, objectId=${change.objectId}`);
          if (change.type === 'created' && change.objectType?.includes('UserSubscription')) {
            subscriptionId = change.objectId;
            console.log(`✅ Subscription created with ID: ${subscriptionId}`);
            break;
          }
        }
        
        if (!subscriptionId) {
          console.log('⚠️ No UserSubscription object found in created objects');
          // Try to find any created object that might be the subscription
          for (const change of result.objectChanges) {
            if (change.type === 'created') {
              console.log(`🔍 Found created object: ${change.objectId} of type: ${change.objectType}`);
            }
          }
        }
      }
      
      // Refresh balance to reflect subscription fee payment
      console.log('🔄 Refreshing balance after subscription...');
      await refreshBalance();
      
      return {
        success: true,
        agentId: params.agentId,
        subscriptionId,
        transactionDigest: result.digest,
        result
      };
    } catch (error) {
      console.error('❌ Failed to subscribe to agent:', error);
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
  }, [initializeTransactionManager, createSubscribeToAgentTransaction, refreshBalance, zkProof]);

  // Check if ready for transactions (now includes cached session data)
  const isReady = useCallback((): boolean => {
    return !!(isLoggedIn && jwt && userSalt && maxEpoch && userGoogleId && ephemeralKeypair && zkProof && randomness);
  }, [isLoggedIn, jwt, userSalt, maxEpoch, userGoogleId, ephemeralKeypair, zkProof, randomness]);

  // Get current user address
  const getUserAddress = useCallback((): string | null => {
    return transactionManager?.getUserAddress() || null;
  }, [transactionManager]);

  // Get agent information including subscriber count
  const getAgentInfo = useCallback(async (agentId: string): Promise<any> => {
    try {
      const manager = await initializeTransactionManager();
      const client = manager.getClient();
      
      // Get the agent object and its fields
      const agentObject = await client.getObject({
        id: agentId,
        options: {
          showContent: true,
          showType: true,
        }
      });

      if (!agentObject.data?.content || agentObject.data.content.dataType !== 'moveObject') {
        throw new Error('Agent object not found or invalid');
      }

      const fields = agentObject.data.content.fields as any;
      
      return {
        name: fields.name,
        description: fields.description,
        subscriptionFee: parseInt(fields.subscription_fee_per_month),
        minDeposit: parseInt(fields.min_deposit),
        maxDeposit: parseInt(fields.max_deposit),
        creator: fields.creator,
        isActive: fields.is_active,
        createdAt: parseInt(fields.created_at),
        totalSubscribers: parseInt(fields.total_subscribers),
        teeWalletAddress: fields.tee_wallet_address,
      };
    } catch (error) {
      console.error('❌ Failed to get agent info:', error);
      throw error;
    }
  }, [initializeTransactionManager]);
const isUserSubscribed = useCallback(async (agentId: string, userAddress: string): Promise<boolean> => {
    try {
      const manager = await initializeTransactionManager();
      const client = manager.getClient();
      
      const result = await client.devInspectTransactionBlock({
        transactionBlock: (() => {
          const tx = new Transaction();
          tx.moveCall({
            target: `${PACKAGE_ID}::${SUBSCRIPTION_MANAGER_MODULE}::is_subscribed`,
            arguments: [
              tx.object(SUBSCRIPTION_MANAGER_ID),
              tx.pure.id(agentId),
              tx.pure.address(userAddress),
            ],
          });
          return tx;
        })(),
        sender: manager.getUserAddress()!,
      });

      if (result.results?.[0]?.returnValues?.[0]) {
        const [isSubscribed] = result.results[0].returnValues[0];
        return isSubscribed[0] === 1;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to check subscription status:', error);
      return false;
    }
  }, [initializeTransactionManager]);

  // Get user's current deposit amount for an agent
  const getUserDepositAmount = useCallback(async (agentId: string, userAddress: string): Promise<number> => {
    try {
      const manager = await initializeTransactionManager();
      const client = manager.getClient();
      
      const result = await client.devInspectTransactionBlock({
        transactionBlock: (() => {
          const tx = new Transaction();
          tx.moveCall({
            target: `${PACKAGE_ID}::${SUBSCRIPTION_MANAGER_MODULE}::get_user_deposit`,
            arguments: [
              tx.object(SUBSCRIPTION_MANAGER_ID),
              tx.pure.id(agentId),
              tx.pure.address(userAddress),
            ],
          });
          return tx;
        })(),
        sender: manager.getUserAddress()!,
      });

      if (result.results?.[0]?.returnValues?.[0]) {
        const [amount] = result.results[0].returnValues[0];
        const depositMist = parseInt(amount.toString());
        return depositMist;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Failed to get user deposit amount:', error);
      return 0;
    }
  }, [initializeTransactionManager]);

  // Get agent's total deposited amount
  const getAgentTotalDeposited = useCallback(async (agentId: string): Promise<number> => {
    try {
      const manager = await initializeTransactionManager();
      const client = manager.getClient();
      
      const result = await client.devInspectTransactionBlock({
        transactionBlock: (() => {
          const tx = new Transaction();
          tx.moveCall({
            target: `${PACKAGE_ID}::${SUBSCRIPTION_MANAGER_MODULE}::get_agent_total_deposited`,
            arguments: [
              tx.object(SUBSCRIPTION_MANAGER_ID),
              tx.pure.id(agentId),
            ],
          });
          return tx;
        })(),
        sender: manager.getUserAddress()!,
      });

      if (result.results?.[0]?.returnValues?.[0]) {
        const [amount] = result.results[0].returnValues[0];
        return parseInt(amount.toString());
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Failed to get agent total deposited:', error);
      return 0;
    }
  }, [initializeTransactionManager]);

  // Create a simple transfer transaction to TEE wallet
  const createDepositTransaction = useCallback((params: DepositTradingFundsParams & { teeWalletAddress: string }): Transaction => {
    const transaction = new Transaction();

    // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
    const depositAmountMist = Math.floor(params.amount * 1_000_000_000);
    
    // Split coin for transfer
    const transferCoin = transaction.splitCoins(transaction.gas, [transaction.pure.u64(depositAmountMist)]);

    // Transfer directly to the agent's TEE wallet
    transaction.transferObjects([transferCoin], transaction.pure.address(params.teeWalletAddress));

    // Set gas budget
    transaction.setGasBudget(15000000); // 0.015 SUI

    return transaction;
  }, []);

  // Deposit trading funds - simplified version
  const depositTradingFunds = useCallback(async (agentId: string, amount: number, agentData: any): Promise<DepositResult> => {
    setIsTransacting(true);
    try {
      console.log('🚀 Depositing trading funds...', { agentId, amount, teeWallet: agentData.wallet_address });
      
      // Validation checks
      const minDepositSui = 0.2;
      if (amount < minDepositSui) {
        throw new Error(`Minimum deposit amount is ${minDepositSui} SUI`);
      }

      // Check if TEE wallet address is available
      if (!agentData.wallet_address) {
        throw new Error('Agent TEE wallet address not found. Please contact the agent creator.');
      }

      const manager = await initializeTransactionManager();
      const userAddress = manager.getUserAddress();
      
      // Check if user is subscribed
      console.log('🔍 Checking subscription status...');
      const isSubscribed = await isUserSubscribed(agentId, userAddress!);
      if (!isSubscribed) {
        throw new Error('You must be subscribed to this agent before depositing funds');
      }
      console.log('✅ User is subscribed');

      // Get current balances before deposit (optional for tracking)
      const userCurrentDeposit = await getUserDepositAmount(agentId, userAddress!);
      const agentCurrentTotal = await getAgentTotalDeposited(agentId);
      
      console.log('📊 Current deposit status:', {
        userCurrentDepositSui: userCurrentDeposit / 1_000_000_000,
        agentTotalDepositedSui: agentCurrentTotal / 1_000_000_000,
        teeWalletAddress: agentData.wallet_address,
      });

      // Create and execute transfer transaction
      const transaction = createDepositTransaction({ 
        agentId, 
        amount, 
        teeWalletAddress: agentData.wallet_address 
      });
      
      const result = await manager.executeTransaction(transaction, zkProof);
      
      console.log('✅ Deposit transaction successful:', result);
      
      // Get updated balances after deposit (optional)
      const userNewDeposit = await getUserDepositAmount(agentId, userAddress!);
      const agentNewTotal = await getAgentTotalDeposited(agentId);
      
      // Refresh user balance to reflect deposit and gas fees
      console.log('🔄 Refreshing balance after deposit...');
      await refreshBalance();
      
      return {
        success: true,
        agentId,
        transactionDigest: result.digest,
        result,
        depositAmount: amount,
        agentWalletAddress: agentData.tee_wallet_address,
        userTotalDeposited: userNewDeposit / 1_000_000_000, // Convert back to SUI
        agentTotalDeposited: agentNewTotal / 1_000_000_000, // Convert back to SUI
      };
    } catch (error) {
      console.error('❌ Failed to deposit trading funds:', error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.message.includes('ENotSubscribed')) {
          errorMessage = 'You must be subscribed to this agent before depositing funds';
        } else if (error.message.includes('insufficient')) {
          errorMessage = 'Insufficient funds for this deposit';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsTransacting(false);
    }
  }, [initializeTransactionManager, isUserSubscribed, getUserDepositAmount, getAgentTotalDeposited, createDepositTransaction, zkProof, refreshBalance]);

  return {
    // State
    isTransacting,
    isReady: isReady(),
    
    // Functions
    createAgent,
    subscribeToAgent,
    depositTradingFunds,
    getUserAddress,
    getAgentInfo,
    
    // Helper functions
    isUserSubscribed,
    getUserDepositAmount,
    getAgentTotalDeposited,
    
    // Utility
    initializeTransactionManager
  };
};
import { useState, useEffect, useCallback } from "react";
import {
  TradingAgent,
  getAllTradingAgents,
  getTradingAgentByAgentId,
  getTradingAgentsByCreator,
  getActiveTradingAgents,
  getPopularTradingAgents,
  getRecentTradingAgents,
  searchTradingAgentsByName,
  UserSubscription,
  getUserSubscriptions,
} from "../api/marketplaceApi";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

interface UseTradingAgentsOptions {
  autoFetch?: boolean;
  isActive?: boolean;
  limitCount?: number;
}

interface UseTradingAgentsReturn {
  agents: TradingAgent[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  fetchAgents: () => Promise<void>;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
  searchAgents: (searchTerm: string) => Promise<void>;
  clearSearch: () => void;
}

/**
 * Hook for managing trading agents state
 */
export const useTradingAgents = (
  options: UseTradingAgentsOptions = {}
): UseTradingAgentsReturn => {
  const { autoFetch = true, isActive, limitCount = 20 } = options;

  const [agents, setAgents] = useState<TradingAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllTradingAgents(isActive, limitCount);
      setAgents(result.agents);
      setLastDoc(result.lastDoc);
      setHasMore(result.agents.length === limitCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  }, [isActive, limitCount]);

  const fetchMore = useCallback(async () => {
    if (!hasMore || loading || !lastDoc) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getAllTradingAgents(isActive, limitCount, lastDoc);
      setAgents((prev) => [...prev, ...result.agents]);
      setLastDoc(result.lastDoc);
      setHasMore(result.agents.length === limitCount);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch more agents"
      );
    } finally {
      setLoading(false);
    }
  }, [isActive, limitCount, lastDoc, hasMore, loading]);

  const refresh = useCallback(async () => {
    setLastDoc(null);
    setHasMore(true);
    await fetchAgents();
  }, [fetchAgents]);

  const searchAgents = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      clearSearch();
      return;
    }

    setLoading(true);
    setError(null);
    setIsSearching(true);

    try {
      const results = await searchTradingAgentsByName(searchTerm.trim());
      setAgents(results);
      setHasMore(false); // Search results don't support pagination
      setLastDoc(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search agents");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setIsSearching(false);
    setHasMore(true);
    setLastDoc(null);
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (autoFetch && !isSearching) {
      fetchAgents();
    }
  }, [autoFetch, fetchAgents, isSearching]);

  return {
    agents,
    loading,
    error,
    hasMore,
    lastDoc,
    fetchAgents,
    fetchMore,
    refresh,
    searchAgents,
    clearSearch,
  };
};

/**
 * Hook for fetching a specific trading agent
 */
export const useTradingAgent = (agentId: string | null) => {
  const [agent, setAgent] = useState<TradingAgent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgent = useCallback(async () => {
    if (!agentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getTradingAgentByAgentId(agentId);
      setAgent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch agent");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  return { agent, loading, error, refetch: fetchAgent };
};

/**
 * Hook for fetching user's trading agents
 */
export const useUserTradingAgents = (creatorAddress: string | null) => {
  const [agents, setAgents] = useState<TradingAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAgents = useCallback(async () => {
    if (!creatorAddress) {
      setAgents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get localStorage agents created by the user
      const localAgents: TradingAgent[] = [];
      const storedAgents = JSON.parse(localStorage.getItem('localAgents') || '[]');
      
      storedAgents.forEach((agent: any) => {
        if (agent.creator === creatorAddress) {
          // Convert localStorage agent to TradingAgent format
          localAgents.push({
            agent_id: agent.agent_id,
            name: agent.name,
            creator: agent.creator,
            subscription_fee: agent.subscription_fee,
            is_active: agent.is_active,
            total_subscribers: agent.total_subscribers,
            created_at: agent.created_at,
            tee_wallet_address: agent.tee_wallet_address,
            event_seq: "", // Required by interface
            tx_digest: "", // Required by interface
          });
        }
      });

      console.log(`📱 Found ${localAgents.length} localStorage agents created by user`);

      // 2. Get Firebase agents created by the user
      let firebaseAgents: TradingAgent[] = [];
      try {
        firebaseAgents = await getTradingAgentsByCreator(creatorAddress);
        console.log(`🔥 Found ${firebaseAgents.length} Firebase agents created by user`);
      } catch (firebaseError) {
        console.error("Firebase agents fetch failed:", firebaseError);
        // Continue with localStorage-only data
      }

      // 3. Combine localStorage and Firebase agents, prioritizing localStorage and avoiding duplicates
      const allAgents = [...localAgents];
      firebaseAgents.forEach(fbAgent => {
        // Only add if not already in localStorage agents
        if (!allAgents.some(localAgent => localAgent.agent_id === fbAgent.agent_id)) {
          allAgents.push(fbAgent);
        }
      });

      console.log(`✅ Total created agents: ${allAgents.length} (${localAgents.length} local + ${firebaseAgents.length - localAgents.length} Firebase)`);
      setAgents(allAgents);

    } catch (err) {
      console.error("Error fetching user agents:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch user agents"
      );
    } finally {
      setLoading(false);
    }
  }, [creatorAddress]);

  useEffect(() => {
    fetchUserAgents();
  }, [fetchUserAgents]);

  return { agents, loading, error, refetch: fetchUserAgents };
};

/**
 * Hook for fetching popular trading agents
 */
export const usePopularTradingAgents = (minSubscribers: number = 1) => {
  const [agents, setAgents] = useState<TradingAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPopularTradingAgents(minSubscribers);
      setAgents(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch popular agents"
      );
    } finally {
      setLoading(false);
    }
  }, [minSubscribers]);

  useEffect(() => {
    fetchPopularAgents();
  }, [fetchPopularAgents]);

  return { agents, loading, error, refetch: fetchPopularAgents };
};

/**
 * Hook for fetching recent trading agents
 */
export const useRecentTradingAgents = (limitCount: number = 10) => {
  const [agents, setAgents] = useState<TradingAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getRecentTradingAgents(limitCount);
      setAgents(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch recent agents"
      );
    } finally {
      setLoading(false);
    }
  }, [limitCount]);

  useEffect(() => {
    fetchRecentAgents();
  }, [fetchRecentAgents]);

  return { agents, loading, error, refetch: fetchRecentAgents };
};

/**
 * Hook for fetching trading agents a user is subscribed to.
 * It first fetches the user's subscription records and then retrieves
 * the full details for each subscribed agent.
 *
 * @param userAddress The wallet address of the user.
 * @returns An object containing the subscribed agents, loading state, error, and a refetch function.
 */
export const useUserSubscribedAgents = (userAddress: string | null) => {
  // State for storing the final list of agent objects
  const [agents, setAgents] = useState<TradingAgent[]>([]);
  // State for loading status
  const [loading, setLoading] = useState(false);
  // State for any potential errors
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the user's subscriptions from both localStorage and Firebase, then resolves the agent details for each.
   */
  const fetchSubscribedAgents = useCallback(async () => {
    // Exit if no user address is provided, and clear previous results
    if (!userAddress) {
      setAgents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get subscription data from localStorage
      const localSubscriptions = localStorage.getItem("userSubscriptions");
      const localAgentIds = new Set<string>();
      
      if (localSubscriptions) {
        try {
          const subscriptions = JSON.parse(localSubscriptions);
          // Extract agent IDs from localStorage subscription keys (format: "userAddress_agentId")
          Object.keys(subscriptions).forEach(key => {
            if (subscriptions[key] && key.startsWith(`${userAddress}_`)) {
              const agentId = key.replace(`${userAddress}_`, '');
              localAgentIds.add(agentId);
            }
          });
          console.log(`📱 Found ${localAgentIds.size} localStorage subscriptions for user`);
        } catch (error) {
          console.error("Error parsing localStorage subscriptions:", error);
        }
      }

      // 2. Get localStorage agents that match subscription IDs
      const localAgents: TradingAgent[] = [];
      if (localAgentIds.size > 0) {
        const storedAgents = JSON.parse(localStorage.getItem('localAgents') || '[]');
        storedAgents.forEach((agent: any) => {
          if (localAgentIds.has(agent.agent_id)) {
            // Convert localStorage agent to TradingAgent format
            localAgents.push({
              agent_id: agent.agent_id,
              name: agent.name,
              creator: agent.creator,
              subscription_fee: agent.subscription_fee,
              is_active: agent.is_active,
              total_subscribers: agent.total_subscribers,
              created_at: agent.created_at,
              tee_wallet_address: agent.tee_wallet_address,
              event_seq: "", // Required by interface
              tx_digest: "", // Required by interface
            });
          }
        });
        console.log(`📱 Found ${localAgents.length} matching localStorage agents`);
      }

      // 3. Fetch Firebase subscriptions
      let firebaseAgents: TradingAgent[] = [];
      try {
        const firebaseSubscriptions: UserSubscription[] = await getUserSubscriptions(userAddress);
        
        if (firebaseSubscriptions.length > 0) {
          const firebaseAgentIds = firebaseSubscriptions.map((sub) => sub.agent_id);
          console.log(`🔥 Found ${firebaseAgentIds.length} Firebase subscriptions`);

          // Fetch the full TradingAgent object for each agent_id concurrently
          const agentPromises = firebaseAgentIds.map((id) =>
            getTradingAgentByAgentId(id)
          );
          const resolvedAgents = await Promise.all(agentPromises);

          // Filter out any null results
          firebaseAgents = resolvedAgents.filter(
            (agent): agent is TradingAgent => agent !== null
          );
        }
      } catch (firebaseError) {
        console.error("Firebase subscription fetch failed:", firebaseError);
        // Continue with localStorage-only data
      }

      // 4. Combine localStorage and Firebase agents, prioritizing localStorage and avoiding duplicates
      const allAgents = [...localAgents];
      firebaseAgents.forEach(fbAgent => {
        // Only add if not already in localStorage agents
        if (!allAgents.some(localAgent => localAgent.agent_id === fbAgent.agent_id)) {
          allAgents.push(fbAgent);
        }
      });

      console.log(`✅ Total subscribed agents: ${allAgents.length} (${localAgents.length} local + ${firebaseAgents.length - localAgents.length} Firebase)`);
      setAgents(allAgents);

    } catch (err) {
      console.error("Error fetching subscribed agents:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch subscribed agents"
      );
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  // Effect to automatically trigger the fetch when the component mounts or userAddress changes
  useEffect(() => {
    fetchSubscribedAgents();
  }, [fetchSubscribedAgents]);

  // Return the state and a manual refetch function
  return { agents, loading, error, refetch: fetchSubscribedAgents };
};

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
    if (!creatorAddress) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getTradingAgentsByCreator(creatorAddress);
      setAgents(result);
    } catch (err) {
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

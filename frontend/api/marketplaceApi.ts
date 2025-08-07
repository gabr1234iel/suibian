import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

// Types for Trading Agent
export interface TradingAgent {
  agent_id: string;
  created_at: Date | Timestamp;
  creator: string;
  event_seq: string;
  is_active: boolean;
  name: string;
  subscription_fee: string;
  tee_wallet_address: string;
  total_subscribers: number;
  tx_digest: string;
}

// Collection reference
const TRADING_AGENTS_COLLECTION = "trading_agents";

/**
 * Get all trading agents with optional filtering and pagination
 */
export const getAllTradingAgents = async (
  isActive?: boolean,
  limitCount?: number,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  agents: TradingAgent[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  try {
    let q = query(collection(db, TRADING_AGENTS_COLLECTION));

    // Filter by active status if specified
    if (isActive !== undefined) {
      q = query(q, where("is_active", "==", isActive));
    }

    // Order by created_at descending (newest first)
    q = query(q, orderBy("created_at", "desc"));

    // Add pagination
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const agents: TradingAgent[] = [];
    let newLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

    querySnapshot.forEach((doc) => {
      agents.push({
        ...doc.data(),
        created_at: doc.data().created_at,
      } as TradingAgent);
      newLastDoc = doc;
    });

    return { agents, lastDoc: newLastDoc };
  } catch (error) {
    console.error("Error fetching trading agents:", error);
    throw new Error("Failed to fetch trading agents");
  }
};

/**
 * Get a specific trading agent by document ID
 */
export const getTradingAgentById = async (
  docId: string
): Promise<TradingAgent | null> => {
  try {
    const docRef = doc(db, TRADING_AGENTS_COLLECTION, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ...docSnap.data(),
        created_at: docSnap.data().created_at,
      } as TradingAgent;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching trading agent by ID:", error);
    throw new Error("Failed to fetch trading agent");
  }
};

/**
 * Get a trading agent by agent_id field
 */
export const getTradingAgentByAgentId = async (
  agentId: string
): Promise<TradingAgent | null> => {
  try {
    const q = query(
      collection(db, TRADING_AGENTS_COLLECTION),
      where("agent_id", "==", agentId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        ...doc.data(),
        created_at: doc.data().created_at,
      } as TradingAgent;
    }

    return null;
  } catch (error) {
    console.error("Error fetching trading agent by agent_id:", error);
    throw new Error("Failed to fetch trading agent");
  }
};

/**
 * Get trading agents by creator address
 */
export const getTradingAgentsByCreator = async (
  creator: string
): Promise<TradingAgent[]> => {
  try {
    const q = query(
      collection(db, TRADING_AGENTS_COLLECTION),
      where("creator", "==", creator),
      orderBy("created_at", "desc")
    );

    const querySnapshot = await getDocs(q);
    const agents: TradingAgent[] = [];

    querySnapshot.forEach((doc) => {
      agents.push({
        ...doc.data(),
        created_at: doc.data().created_at,
      } as TradingAgent);
    });

    return agents;
  } catch (error) {
    console.error("Error fetching trading agents by creator:", error);
    throw new Error("Failed to fetch trading agents by creator");
  }
};

/**
 * Get active trading agents
 */
export const getActiveTradingAgents = async (): Promise<TradingAgent[]> => {
  try {
    const { agents } = await getAllTradingAgents(true);
    return agents;
  } catch (error) {
    console.error("Error fetching active trading agents:", error);
    throw new Error("Failed to fetch active trading agents");
  }
};

/**
 * Search trading agents by name
 */
export const searchTradingAgentsByName = async (
  searchTerm: string
): Promise<TradingAgent[]> => {
  try {
    // Note: This is a simple search. For more advanced full-text search,
    // consider using Algolia or similar service
    const q = query(
      collection(db, TRADING_AGENTS_COLLECTION),
      where("name", ">=", searchTerm),
      where("name", "<=", searchTerm + "\uf8ff"),
      orderBy("name")
    );

    const querySnapshot = await getDocs(q);
    const agents: TradingAgent[] = [];

    querySnapshot.forEach((doc) => {
      agents.push({
        ...doc.data(),
        created_at: doc.data().created_at,
      } as TradingAgent);
    });

    return agents;
  } catch (error) {
    console.error("Error searching trading agents by name:", error);
    throw new Error("Failed to search trading agents");
  }
};

/**
 * Get trading agents with high subscriber counts
 */
export const getPopularTradingAgents = async (
  minSubscribers: number = 10
): Promise<TradingAgent[]> => {
  try {
    const q = query(
      collection(db, TRADING_AGENTS_COLLECTION),
      where("total_subscribers", ">=", minSubscribers),
      where("is_active", "==", true),
      orderBy("total_subscribers", "desc")
    );

    const querySnapshot = await getDocs(q);
    const agents: TradingAgent[] = [];

    querySnapshot.forEach((doc) => {
      agents.push({
        ...doc.data(),
        created_at: doc.data().created_at,
      } as TradingAgent);
    });

    return agents;
  } catch (error) {
    console.error("Error fetching popular trading agents:", error);
    throw new Error("Failed to fetch popular trading agents");
  }
};

/**
 * Get recently created trading agents
 */
export const getRecentTradingAgents = async (
  limitCount: number = 10
): Promise<TradingAgent[]> => {
  try {
    const { agents } = await getAllTradingAgents(undefined, limitCount);
    return agents;
  } catch (error) {
    console.error("Error fetching recent trading agents:", error);
    throw new Error("Failed to fetch recent trading agents");
  }
};

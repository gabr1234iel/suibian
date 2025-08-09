export interface Agent {
  id: string;
  name: string;
  creator: string;
  strategy: string;
  riskLevel: "Low" | "Medium" | "High";
  description: string;
  performanceMetrics: {
    totalReturn: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  fee: number;
  image?: string;
  tags: string[];
  createdAt: string;
  subscribers: number;
}

export type Theme = "light" | "dark";

export interface DecodedJwt {
  iss: string;
  aud: string;
  sub: string;
  nonce: string;
}

export interface UserData {
  google_id: string;
  sui_address: string;
  salt: string; // Fallback salt stored locally
  saltWalrusBlob?: string; // Optional - Walrus blob ID for encrypted salt
  created_at: string;
  last_login: string;
}

export interface AppContextType {
  isLoggedIn: boolean;
  userAddress: string | null;
  userGoogleId: string | null;
  isFirstTimeUser: boolean;
  balance: number | null;
  isBalanceLoading: boolean;
  isLoadingUser: boolean;
  mounted: boolean; // Track hydration state
  nonce: string | null;
  // zkLogin parameters needed for blockchain transactions
  jwt: string | null;
  randomness: string | null;
  maxEpoch: number | null;
  userSalt: string | null;
  ephemeralKeypair: any | null; // Ed25519Keypair
  zkProof: any | null;
  isZkLoginReady: boolean;
  initializeZkLoginSession: () => Promise<{ nonce: string } | null>;
  login: (credentialResponse: any) => Promise<void>;
  logout: () => void;
  refreshBalance: () => Promise<void>;
  theme: Theme;
  toggleTheme: () => void;
}

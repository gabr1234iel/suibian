"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { AppContextType, Theme, DecodedJwt, UserData } from "../types";
import { jwtDecode } from "jwt-decode";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
  generateRandomness,
  generateNonce,
  computeZkLoginAddress,
} from "@mysten/sui/zklogin";
import {
  createSealPolicy,
  getOrCreateSaltForGoogleId,
  validateSealPackage,
} from "@/api/nonceApi";

const SUI_DEVNET_RPC_URL = "https://fullnode.devnet.sui.io";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

interface AppContextProviderProps {
  children: React.ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [randomness, setRandomness] = useState<string | null>(null);
  const [maxEpoch, setMaxEpoch] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userGoogleId, setUserGoogleId] = useState<string | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  // Track if component has mounted to prevent hydration mismatches
  const [mounted, setMounted] = useState(false);
  // zkLogin states for blockchain transactions
  const [jwt, setJwt] = useState<string | null>(null);
  const [userSalt, setUserSalt] = useState<string | null>(null);
  const [ephemeralKeypair, setEphemeralKeypair] =
    useState<Ed25519Keypair | null>(null);
  const [zkProof, setZkProof] = useState<any>(null);

  // Ref to prevent multiple zkLogin setups
  const zkLoginSetupCompleted = useRef<boolean>(false);

  // Helper to check if zkLogin session is fully initialized and ready
  const isZkLoginReady = !!(
    ephemeralKeypair &&
    nonce &&
    randomness &&
    maxEpoch
  );

  // Track when component has mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Load theme from localStorage on component mount - only on client side
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme to document root - only on client side
    if (typeof window !== 'undefined') {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      // Save theme to localStorage
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // Initialize zkLogin session (generate ephemeral keypair) - called when user wants to login
  const initializeZkLoginSession = async (): Promise<{
    nonce: string;
  } | null> => {
    try {
      // Prevent multiple initializations
      if (zkLoginSetupCompleted.current && ephemeralKeypair && nonce) {
        console.log(
          "🔑 zkLogin session already ready, using existing nonce:",
          nonce
        );
        return { nonce };
      }

      console.log("🔑 Initializing fresh zkLogin session for login...");

      // Clear any existing session data first
      setIsLoggedIn(false);
      setUserGoogleId(null);
      setUserAddress(null);
      setJwt(null);
      setUserSalt(null);
      setZkProof(null);

      // Generate fresh ephemeral keypair ONLY when user wants to login
      console.log(
        "🔑 Generating fresh ephemeral keypair for this login session..."
      );
      const keyPair = new Ed25519Keypair();

      const suiClient = new SuiClient({ url: SUI_DEVNET_RPC_URL });
      const { epoch } = await suiClient.getLatestSuiSystemState();
      const maxEpochValue = Number(epoch) + 2;

      const randomnessValue = generateRandomness();

      const publicKey = keyPair.getPublicKey() as any;
      const nonceValue = generateNonce(
        publicKey,
        maxEpochValue,
        randomnessValue
      );

      // Set all critical session data atomically
      setEphemeralKeypair(keyPair);
      setMaxEpoch(maxEpochValue);
      setRandomness(randomnessValue.toString());
      setNonce(nonceValue);

      // Mark setup as completed to prevent re-runs
      zkLoginSetupCompleted.current = true;

      console.log("✅ zkLogin session initialized with nonce:", nonceValue);
      console.log("🔒 This nonce is LOCKED for Google OAuth - will not change");

      return { nonce: nonceValue };
    } catch (error) {
      console.error("Error initializing zkLogin session:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!userAddress) return;

    const getBalance = async () => {
      setIsBalanceLoading(true);
      try {
        const suiClient = new SuiClient({ url: SUI_DEVNET_RPC_URL });
        const suiBalance = await suiClient.getBalance({ owner: userAddress });
        const balanceInSui = Number(suiBalance.totalBalance) / 1_000_000_000;
        setBalance(balanceInSui);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(null);
      } finally {
        setIsBalanceLoading(false);
      }
    };

    getBalance();
  }, [userAddress]);

  // Simplified user data management (removed Firebase dependency)
  const saveUserToLocalStorage = async (userData: UserData): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        console.log("Saving user data to localStorage:", userData.google_id);
        localStorage.setItem(
          `user_${userData.google_id}`,
          JSON.stringify(userData)
        );
        console.log("User data saved to localStorage successfully");
      }
    } catch (error: any) {
      console.error("Error saving user data to localStorage:", error);
    }
  };

  const getUserFromLocalStorage = async (
    googleId: string
  ): Promise<UserData | null> => {
    try {
      if (typeof window !== 'undefined') {
        console.log("Getting user from localStorage with Google ID:", googleId);
        const userData = localStorage.getItem(`user_${googleId}`);
        if (userData) {
          console.log("User data found in localStorage");
          return JSON.parse(userData) as UserData;
        }
      }
      console.log("No user data found in localStorage");
      return null;
    } catch (error: any) {
      console.error("Error getting user data from localStorage:", error);
      return null;
    }
  };

  // Generate zkProof ONCE per session and cache it
  const generateAndCacheZkProof = async (
    saltValue?: string,
    jwtValue?: string
  ): Promise<void> => {
    const currentSalt = saltValue || userSalt;
    const currentJwt = jwtValue || jwt;

    // Debug: Log all parameters to see what's missing
    console.log("zkLogin parameters check:", {
      jwt: !!currentJwt,
      ephemeralKeypair: !!ephemeralKeypair,
      randomness: !!randomness,
      currentSalt: !!currentSalt,
      maxEpoch: !!maxEpoch,
    });

    if (
      !currentJwt ||
      !ephemeralKeypair ||
      !randomness ||
      !currentSalt ||
      !maxEpoch
    ) {
      console.error("Missing zkLogin parameters:", {
        jwt: !currentJwt ? "MISSING" : "OK",
        ephemeralKeypair: !ephemeralKeypair ? "MISSING" : "OK",
        randomness: !randomness ? "MISSING" : "OK",
        currentSalt: !currentSalt ? "MISSING" : "OK",
        maxEpoch: !maxEpoch ? "MISSING" : "OK",
      });
      throw new Error(
        "Missing required zkLogin parameters for proof generation"
      );
    }

    try {
      console.log(
        "🔄 Generating zkProof for session (this may take a few seconds)..."
      );

      // Verify JWT nonce matches current nonce before proceeding
      const decodedJwt = jwtDecode<DecodedJwt>(currentJwt);
      if (decodedJwt.nonce !== nonce) {
        console.warn("🚨 JWT nonce mismatch detected - session expired!", {
          jwtNonce: decodedJwt.nonce,
          currentNonce: nonce,
        });

        // Clear all session data and force re-login
        console.log("🔄 Clearing session data and forcing re-login...");
        setIsLoggedIn(false);
        setUserGoogleId(null);
        setUserAddress(null);
        setJwt(null);
        setUserSalt(null);
        setZkProof(null);
        setEphemeralKeypair(null);

        alert("Your session has expired. Please login again.");
        throw new Error(
          "Session expired - nonce mismatch detected. User has been logged out."
        );
      }

      const { getExtendedEphemeralPublicKey } = await import("@mysten/zklogin");
      console.log(
        "zkProof generation using ephemeral key:",
        ephemeralKeypair.getPublicKey().toSuiAddress()
      );

      const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
        ephemeralKeypair.getPublicKey()
      );

      // Call Mysten Labs proving service
      const response = await fetch("https://prover-dev.mystenlabs.com/v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jwt: currentJwt,
          extendedEphemeralPublicKey: extendedEphemeralPublicKey.toString(),
          maxEpoch: maxEpoch.toString(),
          jwtRandomness: randomness,
          salt: currentSalt,
          keyClaimName: "sub",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Prover service failed: ${response.status} - ${errorText}`
        );
      }

      const proof = await response.json();
      console.log("🔍 zkProof structure received:", {
        keys: Object.keys(proof),
        hasProofPoints: !!proof.proofPoints,
        hasIssBase64Details: !!proof.issBase64Details,
        proofPointsKeys: proof.proofPoints
          ? Object.keys(proof.proofPoints)
          : "none",
        issBase64DetailsKeys: proof.issBase64Details
          ? Object.keys(proof.issBase64Details)
          : "none",
      });
      console.log("🔍 Full zkProof object:", JSON.stringify(proof, null, 2));

      setZkProof(proof);

      console.log("✅ zkProof generated and cached for session!");
    } catch (error) {
      console.error("❌ Failed to generate zkProof:", error);
      throw new Error(
        `zkLogin proof generation failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const createAndStoreSealPolicy = async (): Promise<string | null> => {
    try {
      if (!ephemeralKeypair) {
        console.log("No ephemeral keypair available for policy creation");
        return null;
      }

      // Check if we already have a stored policy ID
      const existingPolicyId = localStorage.getItem("seal_policy_id");
      if (existingPolicyId) {
        console.log("Using existing Seal policy:", existingPolicyId);
        return existingPolicyId;
      }

      // Validate that the Seal package is deployed correctly
      const isValidPackage = await validateSealPackage();
      if (!isValidPackage) {
        console.log(
          "Seal package validation failed - falling back to memory storage"
        );
        return null;
      }

      // Create a new policy
      console.log("Creating new Seal policy...");
      const policyId = await createSealPolicy(ephemeralKeypair);

      if (policyId) {
        // Store the policy ID for future use
        localStorage.setItem("seal_policy_id", policyId);
        console.log("Seal policy created and stored:", policyId);
      }

      return policyId;
    } catch (error) {
      console.error("Error creating/storing Seal policy:", error);
      return null;
    }
  };

  const login = async (credentialResponse: any): Promise<void> => {
    console.log("🔑 Login attempt started with current nonce:", nonce);

    if (!credentialResponse.credential || !nonce) {
      console.error("Login failed: No credential or nonce available.");
      return;
    }

    // Critical: Check if zkLogin session is fully ready
    if (!ephemeralKeypair || !randomness || !maxEpoch) {
      console.error(
        "Login failed: zkLogin session not ready yet. Please wait a moment and try again."
      );
      alert(
        "Please wait a moment for the session to initialize, then try logging in again."
      );
      return;
    }

    setIsLoadingUser(true);

    try {
      const decodedJwt = jwtDecode<DecodedJwt>(credentialResponse.credential);
      const googleId = decodedJwt.sub;

      // CRITICAL: Check nonce immediately before proceeding
      console.log("🔍 JWT received with embedded nonce:", decodedJwt.nonce);
      console.log("🔍 Current app nonce:", nonce);

      if (decodedJwt.nonce !== nonce) {
        console.error("🚨 IMMEDIATE NONCE MISMATCH DETECTED!");
        console.error(
          "This means Google OAuth was initiated with a different nonce than current session"
        );
        console.error("JWT nonce:", decodedJwt.nonce);
        console.error("App nonce:", nonce);
        setIsLoadingUser(false);
        alert(
          "Session mismatch detected. Please refresh the page and try logging in again."
        );
        return;
      }

      console.log("✅ Nonce validation passed - proceeding with login");

      setUserGoogleId(googleId);

      // Store JWT for blockchain transactions
      setJwt(credentialResponse.credential);

      console.log("Google ID:", googleId);
      console.log("JWT stored for blockchain transactions");

      // Check if user exists in local storage
      const existingUser = await getUserFromLocalStorage(googleId);

      if (existingUser) {
        // Returning user - use existing data
        console.log("Returning user found:", existingUser);
        setIsFirstTimeUser(false);

        // Salt is now stored directly (no encryption needed)
        const userSalt = existingUser.salt;
        setUserSalt(userSalt); // Store for blockchain transactions

        const zkLoginUserAddress = computeZkLoginAddress({
          claimName: "sub",
          claimValue: googleId,
          userSalt: BigInt(userSalt),
          iss: decodedJwt.iss,
          aud: decodedJwt.aud,
        });

        console.log("🏠 Computed zkLogin address with:", {
          claimName: "sub",
          claimValue: googleId,
          userSalt: userSalt,
          iss: decodedJwt.iss,
          aud: decodedJwt.aud,
          computedAddress: zkLoginUserAddress,
        });

        setUserAddress(zkLoginUserAddress);

        // Generate zkProof ONCE per session (expensive operation)
        await generateAndCacheZkProof(userSalt, credentialResponse.credential);

        setIsLoggedIn(true);

        // Update last login time in localStorage
        existingUser.last_login = new Date().toISOString();
        await saveUserToLocalStorage(existingUser);

        console.log(
          "Welcome back! Using existing Sui address:",
          zkLoginUserAddress
        );
      } else {
        // First-time user - get salt for zkLogin address computation
        console.log("New user detected, creating account...");
        setIsFirstTimeUser(true);

        const policyId = await createAndStoreSealPolicy();

        // Get consistent salt for zkLogin (not nonce!)
        const salt = await getOrCreateSaltForGoogleId(
          googleId,
          ephemeralKeypair!
        );
        setUserSalt(salt); // Store for blockchain transactions

        const zkLoginUserAddress = computeZkLoginAddress({
          claimName: "sub",
          claimValue: googleId,
          userSalt: BigInt(salt),
          iss: decodedJwt.iss,
          aud: decodedJwt.aud,
        });

        setUserAddress(zkLoginUserAddress);

        // Generate zkProof ONCE per session
        await generateAndCacheZkProof(salt, credentialResponse.credential);

        setIsLoggedIn(true);

        // Save new user to localStorage
        const userData: UserData = {
          google_id: googleId,
          sui_address: zkLoginUserAddress,
          salt: salt, // Store salt directly (no encryption needed for localStorage)
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        };

        await saveUserToLocalStorage(userData);

        console.log("New user created with Sui address:", zkLoginUserAddress);
      }
    } catch (error: any) {
      console.error("Error during login process:", error);

      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        // Handle nonce mismatch specifically
        if (error.message.includes("JWT nonce mismatch")) {
          alert(
            `🔄 Authentication session expired. Please logout and login again to refresh your session.
            
This happens when the app generates new security keys but you're using an old login token.`
          );
          return;
        }
      }

      alert(
        `Error during login: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please try again.`
      );
    } finally {
      setIsLoadingUser(false);
    }
  };

  const logout = (): void => {
    setIsLoggedIn(false);
    setUserAddress(null);
    setBalance(null);
    setUserGoogleId(null);
    setIsFirstTimeUser(false);
    // Clear zkLogin session data
    setJwt(null);
    setUserSalt(null);
    setZkProof(null);
    setEphemeralKeypair(null);
    setNonce(null);
    setRandomness(null);
    setMaxEpoch(null);

    // Reset the setup flag to allow fresh initialization on next login
    zkLoginSetupCompleted.current = false;

    console.log("🚪 User logged out - zkLogin session cleared");
    console.log(
      "💡 New ephemeral keypair will be generated when user clicks login"
    );
  };

  const toggleTheme = (): void => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value: AppContextType = {
    isLoggedIn,
    userAddress,
    userGoogleId,
    isFirstTimeUser,
    balance,
    isBalanceLoading,
    isLoadingUser,
    mounted,
    nonce,
    jwt,
    randomness,
    maxEpoch,
    userSalt,
    ephemeralKeypair,
    zkProof,
    isZkLoginReady,
    initializeZkLoginSession,
    login,
    logout,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

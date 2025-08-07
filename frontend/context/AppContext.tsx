"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AppContextType, Theme, DecodedJwt, UserData } from "../types";
import { jwtDecode } from "jwt-decode";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
  generateRandomness,
  generateNonce,
  computeZkLoginAddress,
} from "@mysten/sui/zklogin";
import { getOrCreateSaltForGoogleId } from "@/api/nonceApi";

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
  // zkLogin states for blockchain transactions
  const [jwt, setJwt] = useState<string | null>(null);
  const [userSalt, setUserSalt] = useState<string | null>(null);
  const [ephemeralKeypair, setEphemeralKeypair] =
    useState<Ed25519Keypair | null>(null);
  const [zkProof, setZkProof] = useState<any>(null);

  useEffect(() => {
    // Load theme from localStorage on component mount
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document root
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save theme to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const setupZkLogin = async () => {
      try {
        // Only run setup if we don't already have an ephemeral keypair
        // This prevents overwriting existing keypairs that were used for zkProof generation
        if (ephemeralKeypair) {
          console.log("🔑 Ephemeral keypair already exists, skipping setup");
          return;
        }

        console.log("🔑 Generating new ephemeral keypair for session...");
        const keyPair = new Ed25519Keypair();
        setEphemeralKeypair(keyPair);

        const suiClient = new SuiClient({ url: SUI_DEVNET_RPC_URL });
        const { epoch } = await suiClient.getLatestSuiSystemState();
        const maxEpochValue = Number(epoch) + 2;
        setMaxEpoch(maxEpochValue);

        const randomnessValue = generateRandomness();
        setRandomness(randomnessValue.toString());

        const publicKey = keyPair.getPublicKey() as any;
        const nonceValue = generateNonce(
          publicKey,
          maxEpochValue,
          randomnessValue
        );
        setNonce(nonceValue);
      } catch (error) {
        console.error("Error setting up zkLogin:", error);
      }
    };

    setupZkLogin();
  }, []); // Empty dependency array - only run once on mount

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
      console.log("Saving user data to localStorage:", userData.google_id);
      localStorage.setItem(
        `user_${userData.google_id}`,
        JSON.stringify(userData)
      );
      console.log("User data saved to localStorage successfully");
    } catch (error: any) {
      console.error("Error saving user data to localStorage:", error);
    }
  };

  const getUserFromLocalStorage = async (
    googleId: string
  ): Promise<UserData | null> => {
    try {
      console.log("Getting user from localStorage with Google ID:", googleId);
      const userData = localStorage.getItem(`user_${googleId}`);
      if (userData) {
        console.log("User data found in localStorage");
        return JSON.parse(userData) as UserData;
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
        console.warn("JWT nonce mismatch detected:", {
          jwtNonce: decodedJwt.nonce,
          currentNonce: nonce,
        });
        throw new Error(
          "JWT nonce mismatch - please login again with fresh authentication"
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

  const login = async (credentialResponse: any): Promise<void> => {
    if (!credentialResponse.credential || !nonce) {
      console.error("Login failed: No credential or nonce available.");
      return;
    }

    setIsLoadingUser(true);

    try {
      const decodedJwt = jwtDecode<DecodedJwt>(credentialResponse.credential);
      const googleId = decodedJwt.sub;
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

    // Regenerate randomness/nonce for the next session
    const setupNextLogin = async () => {
      console.log(
        "🔑 Logout: Generating new ephemeral keypair for next session..."
      );
      const keyPair = new Ed25519Keypair();
      setEphemeralKeypair(keyPair);

      const suiClient = new SuiClient({ url: SUI_DEVNET_RPC_URL });
      const { epoch } = await suiClient.getLatestSuiSystemState();
      const maxEpochValue = Number(epoch) + 2;
      setMaxEpoch(maxEpochValue);
      const randomnessValue = generateRandomness();
      setRandomness(randomnessValue.toString());
      const publicKey = keyPair.getPublicKey() as any;
      const nonceValue = generateNonce(
        publicKey,
        maxEpochValue,
        randomnessValue
      );
      setNonce(nonceValue);
    };
    setupNextLogin();
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
    nonce,
    jwt,
    randomness,
    maxEpoch,
    userSalt,
    ephemeralKeypair,
    zkProof,
    login,
    logout,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, Theme, DecodedJwt, UserData } from '../types';
import { jwtDecode } from 'jwt-decode';
import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/sui.js/utils';
import {
  generateRandomness,
  generateNonce,
  computeZkLoginAddress,
} from '@mysten/zklogin';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const SUI_TESTNET_RPC_URL = "https://fullnode.testnet.sui.io";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8c_E4rla257hus8hHL2ha7Er2X1F3FIw",
  authDomain: "suibian-marketplace.firebaseapp.com",
  projectId: "suibian-marketplace",
  storageBucket: "suibian-marketplace.firebasestorage.app",
  messagingSenderId: "787011604748",
  appId: "1:787011604748:web:1de5a9dcae78875857f929",
  measurementId: "G-14MNJK555L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test Firebase connection
const testFirebaseConnection = async () => {
  try {
    // Try to access a dummy document to test connection
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    console.log("Firebase connection successful");
    return true;
  } catch (error) {
    console.error("Firebase connection failed:", error);
    return false;
  }
};

// Simple encryption functions (in production, use proper encryption)
const encryptSalt = (salt: string): string => {
  return btoa(salt);
};

const decryptSalt = (encryptedSalt: string): string => {
  return atob(encryptedSalt);
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

interface AppContextProviderProps {
  children: React.ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [randomness, setRandomness] = useState<string | null>(null);
  const [maxEpoch, setMaxEpoch] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userGoogleId, setUserGoogleId] = useState<string | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    // Load theme from localStorage on component mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const setupZkLogin = async () => {
      try {
        const keyPair = new Ed25519Keypair();
        const suiClient = new SuiClient({ url: SUI_TESTNET_RPC_URL });
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
  }, []);

  useEffect(() => {
    if (!userAddress) return;

    const getBalance = async () => {
      setIsBalanceLoading(true);
      try {
        const suiClient = new SuiClient({ url: SUI_TESTNET_RPC_URL });
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

  // Function to save user data to Firebase
  const saveUserToFirebase = async (userData: UserData): Promise<void> => {
    try {
      console.log("Attempting to save user to Firebase:", userData.google_id);
      await setDoc(doc(db, "users", userData.google_id), userData);
      console.log("User data saved to Firebase successfully");
    } catch (error: any) {
      console.error("Error saving user data to Firebase:", error);
      
      if (error.code === 'permission-denied') {
        console.error("Firebase permission denied. This is likely due to Firestore security rules.");
        console.error("Please update your Firestore rules to allow read/write access.");
        // Don't throw - allow the app to continue without Firebase storage
        return;
      }
      
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      
      // Don't throw the error for now to allow graceful degradation
      console.warn("Continuing without Firebase storage...");
    }
  };

  // Function to get user data from Firebase
  const getUserFromFirebase = async (
    googleId: string
  ): Promise<UserData | null> => {
    try {
      console.log("Attempting to get user from Firebase with Google ID:", googleId);
      const userDoc = await getDoc(doc(db, "users", googleId));
      if (userDoc.exists()) {
        console.log("User document found in Firebase");
        return userDoc.data() as UserData;
      }
      console.log("No user document found in Firebase");
      return null;
    } catch (error: any) {
      console.error("Error getting user data from Firebase:", error);
      
      if (error.code === 'permission-denied') {
        console.error("Firebase permission denied. This is likely due to Firestore security rules.");
        console.error("Please update your Firestore rules to allow read/write access.");
        // For now, return null to allow the app to continue
        return null;
      }
      
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      
      // Don't throw the error, just return null to allow graceful degradation
      return null;
    }
  };

  // Function to update last login time
  const updateLastLogin = async (googleId: string): Promise<void> => {
    try {
      const userRef = doc(db, "users", googleId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await setDoc(userRef, {
          ...userDoc.data(),
          last_login: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error("Error updating last login:", error);
      if (error.code === 'permission-denied') {
        console.warn("Cannot update last login due to Firebase permissions");
      }
      // Don't throw - this is not critical
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

      console.log("Google ID:", googleId);

      // Check if user exists in Firebase
      const existingUser = await getUserFromFirebase(googleId);

      if (existingUser) {
        // Returning user - use existing data
        console.log("Returning user found:", existingUser);
        setIsFirstTimeUser(false);

        const decryptedSalt = decryptSalt(existingUser.salt);

        const zkLoginUserAddress = computeZkLoginAddress({
          claimName: "sub",
          claimValue: googleId,
          userSalt: BigInt(decryptedSalt),
          iss: decodedJwt.iss,
          aud: decodedJwt.aud,
        });

        setUserAddress(zkLoginUserAddress);
        setIsLoggedIn(true);

        // Update last login time
        await updateLastLogin(googleId);

        console.log(
          "Welcome back! Using existing Sui address:",
          zkLoginUserAddress
        );
      } else {
        // First-time user - create new data
        console.log("New user detected, creating account...");
        setIsFirstTimeUser(true);

        const newSalt = generateRandomness().toString();

        const zkLoginUserAddress = computeZkLoginAddress({
          claimName: "sub",
          claimValue: googleId,
          userSalt: BigInt(newSalt),
          iss: decodedJwt.iss,
          aud: decodedJwt.aud,
        });

        setUserAddress(zkLoginUserAddress);
        setIsLoggedIn(true);

        // Save new user to Firebase
        const userData: UserData = {
          google_id: googleId,
          sui_address: zkLoginUserAddress,
          salt: encryptSalt(newSalt), // Encrypt salt before storing
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        };

        await saveUserToFirebase(userData);

        console.log("New user created with Sui address:", zkLoginUserAddress);
      }
    } catch (error: any) {
      console.error("Error during login process:", error);
      
      if (error.code === 'permission-denied') {
        console.error("Firebase permission denied - continuing with local-only mode");
        console.warn("User data will not be persisted. Please check Firestore security rules.");
        // Still allow login to succeed, just without Firebase persistence
      } else {
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        alert(`Error during login: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        return; // Exit if non-Firebase error
      }
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

    // Regenerate randomness/nonce for the next session
    const setupNextLogin = async () => {
      const keyPair = new Ed25519Keypair();
      const suiClient = new SuiClient({ url: SUI_TESTNET_RPC_URL });
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
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
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
    login,
    logout,
    theme,
    toggleTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

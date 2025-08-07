import { db } from "@/lib/firebaseSetup";
import { UserData } from "@/types";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Function to save user data to Firebase
export const saveUserToFirebase = async (userData: UserData): Promise<void> => {
  try {
    console.log("Attempting to save user to Firebase:", userData.google_id);
    await setDoc(doc(db, "users", userData.google_id), userData);
    console.log("User data saved to Firebase successfully");
  } catch (error: any) {
    console.error("Error saving user data to Firebase:", error);

    if (error.code === "permission-denied") {
      console.error(
        "Firebase permission denied. This is likely due to Firestore security rules."
      );
      console.error(
        "Please update your Firestore rules to allow read/write access."
      );
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
export const getUserFromFirebase = async (
  googleId: string
): Promise<UserData | null> => {
  try {
    console.log(
      "Attempting to get user from Firebase with Google ID:",
      googleId
    );
    const userDoc = await getDoc(doc(db, "users", googleId));
    if (userDoc.exists()) {
      console.log("User document found in Firebase");
      return userDoc.data() as UserData;
    }
    console.log("No user document found in Firebase");
    return null;
  } catch (error: any) {
    console.error("Error getting user data from Firebase:", error);

    if (error.code === "permission-denied") {
      console.error(
        "Firebase permission denied. This is likely due to Firestore security rules."
      );
      console.error(
        "Please update your Firestore rules to allow read/write access."
      );
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

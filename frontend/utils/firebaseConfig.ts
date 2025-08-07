// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

export { app, db };

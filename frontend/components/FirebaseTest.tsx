import React, { useState } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyA8c_E4rla257hus8hHL2ha7Er2X1F3FIw",
  authDomain: "suibian-marketplace.firebaseapp.com",
  projectId: "suibian-marketplace",
  storageBucket: "suibian-marketplace.firebasestorage.app",
  messagingSenderId: "787011604748",
  appId: "1:787011604748:web:1de5a9dcae78875857f929",
  measurementId: "G-14MNJK555L",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const FirebaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('');

    try {
      // Test 1: Try to read a document
      console.log('Testing Firebase read...');
      const testDoc = doc(db, 'test', 'connection');
      const docSnap = await getDoc(testDoc);
      
      if (docSnap.exists()) {
        console.log('Document exists:', docSnap.data());
        setTestResult(prev => prev + 'Read test: Document found\n');
      } else {
        console.log('Document does not exist');
        setTestResult(prev => prev + 'Read test: Document not found (this is normal)\n');
      }

      // Test 2: Try to write a document
      console.log('Testing Firebase write...');
      const writeTestDoc = doc(db, 'test', 'write-test');
      await setDoc(writeTestDoc, {
        timestamp: new Date().toISOString(),
        message: 'Firebase write test successful'
      });
      setTestResult(prev => prev + 'Write test: Success\n');

      setTestResult(prev => prev + '\n✅ Firebase connection working!');
      
    } catch (error: any) {
      console.error('Firebase test failed:', error);
      setTestResult(prev => prev + `\n❌ Firebase test failed: ${error.code || error.message}`);
      
      if (error.code === 'permission-denied') {
        setTestResult(prev => prev + '\n\nThis is likely a Firestore security rules issue. You may need to update your Firestore rules to allow read/write access.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Firebase Connection'}
      </button>

      {testResult && (
        <pre className="mt-4 p-4 bg-gray-800 rounded text-sm whitespace-pre-wrap">
          {testResult}
        </pre>
      )}
    </div>
  );
};

export default FirebaseTest;

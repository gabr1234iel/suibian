# Firebase Configuration and Issues

## Current Issue

The SuiBian app is experiencing Firebase Firestore permission errors that prevent user data from being saved and retrieved. The errors you're seeing are:

```
Error getting user data from Firebase: (permission-denied)
Error during login process: (permission-denied)
```

## Root Cause

This is happening because the default Firestore security rules are restrictive and don't allow read/write access to the `users` collection.

## Solution

### Option 1: Update Firestore Security Rules (Recommended for Development)

1. Go to your Firebase Console: https://console.firebase.google.com/
2. Navigate to your project: `suibian-marketplace`
3. Go to **Firestore Database** → **Rules**
4. Replace the current rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // For development, you can temporarily use this (less secure):
    // match /{document=**} {
    //   allow read, write: if true;
    // }
  }
}
```

### Option 2: More Secure Rules (Recommended for Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.token.sub == userId;
    }
    
    // Allow test documents for connection testing
    match /test/{document} {
      allow read, write: if true;
    }
  }
}
```

## Current App Behavior

The app has been updated to handle Firebase errors gracefully:

1. **Login still works**: Even if Firebase fails, users can still authenticate and get their Sui addresses
2. **Local-only mode**: When Firebase is unavailable, the app continues to function but user data won't persist between sessions
3. **Error logging**: Detailed error messages are logged to help with debugging
4. **User notification**: A subtle warning is shown on the login page about potential data persistence issues

## Firebase Configuration

The current Firebase configuration in `AppContext.tsx`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA8c_E4rla257hus8hHL2ha7Er2X1F3FIw",
  authDomain: "suibian-marketplace.firebaseapp.com",
  projectId: "suibian-marketplace",
  storageBucket: "suibian-marketplace.firebasestorage.app",
  messagingSenderId: "787011604748",
  appId: "1:787011604748:web:1de5a9dcae78875857f929",
  measurementId: "G-14MNJK555L",
};
```

## Testing Firebase Connection

You can test the Firebase connection by visiting: http://localhost:3001/test

This page includes a Firebase test component that will:
1. Attempt to read from Firestore
2. Attempt to write to Firestore 
3. Show detailed error messages if permissions are denied

## Next Steps

1. **Update Firestore rules** using one of the options above
2. **Test the connection** using the test page
3. **Try logging in** again - user data should now persist properly
4. **Monitor the console** for any remaining errors

## Security Considerations

- Option 1 (authenticated users) requires users to be authenticated through Firebase Auth
- Option 2 (user-specific) is more secure as users can only access their own data
- The temporary "allow all" rule should only be used for development and testing

Once you update the Firestore rules, the Firebase errors should disappear and user data will persist properly between sessions.

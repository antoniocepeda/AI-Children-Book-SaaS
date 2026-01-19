import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

/**
 * Firebase configuration from environment variables
 * All values are prefixed with NEXT_PUBLIC_ for client-side access
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase app (singleton pattern)
 * Returns existing app if already initialized, otherwise creates new one
 */
function initializeFirebaseApp(): FirebaseApp {
    if (getApps().length > 0) {
        return getApp();
    }

    // Validate required config values
    const requiredFields = ['apiKey', 'authDomain', 'projectId'] as const;
    for (const field of requiredFields) {
        if (!firebaseConfig[field]) {
            throw new Error(
                `Missing required Firebase config: NEXT_PUBLIC_FIREBASE_${field.toUpperCase()}. ` +
                `Please check your .env.local file.`
            );
        }
    }

    return initializeApp(firebaseConfig);
}

/**
 * Firebase app instance
 * Use this to initialize other Firebase services (Auth, Firestore, Storage)
 */
export const firebaseApp = initializeFirebaseApp();

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
// This expects GOOGLE_APPLICATION_CREDENTIALS to be set, 
// or FIREBASE_CONFIG env var, or explicit credential in initializeApp.
// For local dev, generic initializeApp() works if 'gcloud auth application-default login' was used.
// If deployment is Vercel, we typically need environment variables for the service account.

if (!admin.apps.length) {
    try {
        admin.initializeApp();
    } catch (error) {
        console.error('Firebase Admin initialization failed:', error);
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

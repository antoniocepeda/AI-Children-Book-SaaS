import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Requires service account credentials for:
// - Verifying ID tokens
// - Writing to Firestore
// - Uploading to Storage

if (!admin.apps.length) {
    try {
        // Check for service account credentials
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (serviceAccountKey) {
            // Parse the service account JSON from environment variable
            const serviceAccount = JSON.parse(serviceAccountKey);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
            console.log('[Firebase Admin] Initialized with service account credentials');
        } else {
            // Fallback: Try default application credentials
            // Works if GOOGLE_APPLICATION_CREDENTIALS is set or running on GCP
            admin.initializeApp({
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
            console.log('[Firebase Admin] Initialized with default credentials');
        }
    } catch (error) {
        console.error('[Firebase Admin] Initialization failed:', error);
        throw error;
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

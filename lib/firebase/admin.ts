import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Requires service account credentials for:
// - Verifying ID tokens
// - Writing to Firestore
// - Uploading to Storage

if (!admin.apps.length) {
    try {
        const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        // Option 1: Use GOOGLE_APPLICATION_CREDENTIALS (GCP environment / App Hosting)
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE) {
            // Running on GCP (Cloud Run, App Hosting, etc.) - use default credentials
            admin.initializeApp({
                storageBucket,
            });
            console.log('[Firebase Admin] Initialized with default GCP credentials');
        }
        // Option 2: Parse service account JSON from environment variable (local dev)
        else if (serviceAccountKey) {
            try {
                // Handle potential escaped newlines in private key
                const cleanedKey = serviceAccountKey.replace(/\\n/g, '\n');
                const serviceAccount = JSON.parse(cleanedKey);

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    storageBucket,
                });
                console.log('[Firebase Admin] Initialized with service account credentials');
            } catch (parseError) {
                console.error('[Firebase Admin] Failed to parse service account JSON:', parseError);
                // Fall back to default credentials
                admin.initializeApp({ storageBucket });
                console.log('[Firebase Admin] Falling back to default credentials');
            }
        }
        // Option 3: No credentials provided - try default  
        else {
            admin.initializeApp({ storageBucket });
            console.log('[Firebase Admin] Initialized with default credentials (no service account)');
        }
    } catch (error) {
        console.error('[Firebase Admin] Initialization failed:', error);
        throw error;
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();


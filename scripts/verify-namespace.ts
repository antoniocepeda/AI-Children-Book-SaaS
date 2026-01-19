/**
 * Namespace Verification Script
 * 
 * This script verifies that all Firestore documents and Storage files
 * are correctly stored under the demos/{demoId}/... namespace.
 * 
 * Run this script AFTER:
 * 1. Setting up Firebase credentials in .env.local
 * 2. Deploying firestore.rules and storage.rules to Firebase
 * 
 * Usage: npx ts-node scripts/verify-namespace.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const DEMO_ID = process.env.DEMO_ID;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!DEMO_ID) {
    console.error('❌ DEMO_ID is not set in .env.local');
    process.exit(1);
}

if (!PROJECT_ID) {
    console.error('❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in .env.local');
    process.exit(1);
}

console.log(`\n🔍 Namespace Verification Script`);
console.log(`================================`);
console.log(`Project ID: ${PROJECT_ID}`);
console.log(`Demo ID: ${DEMO_ID}`);
console.log(`Expected namespace: demos/${DEMO_ID}/...`);
console.log(`\n`);

// Initialize Firebase Admin (requires service account or Application Default Credentials)
if (getApps().length === 0) {
    try {
        // Try to use application default credentials
        initializeApp({
            projectId: PROJECT_ID,
            storageBucket: STORAGE_BUCKET,
        });
        console.log('✅ Firebase Admin initialized with default credentials\n');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin.');
        console.error('   Make sure you have set up Application Default Credentials:');
        console.error('   Run: gcloud auth application-default login');
        console.error('   Or set GOOGLE_APPLICATION_CREDENTIALS to your service account key.\n');
        process.exit(1);
    }
}

const db = getFirestore();
const storage = getStorage();

async function verifyFirestoreNamespace(): Promise<boolean> {
    console.log('📦 Checking Firestore namespace...\n');

    let hasErrors = false;

    // Check for documents at root level (should be empty or only have 'demos')
    const rootCollections = await db.listCollections();
    const invalidRootCollections = rootCollections.filter(col => col.id !== 'demos');

    if (invalidRootCollections.length > 0) {
        console.error('❌ Found collections outside namespace:');
        invalidRootCollections.forEach(col => {
            console.error(`   - /${col.id}`);
        });
        hasErrors = true;
    } else {
        console.log('✅ No invalid root-level collections found');
    }

    // Check that demos/{demoId} exists
    const demoRef = db.collection('demos').doc(DEMO_ID!);
    const demoCollections = await demoRef.listCollections();

    if (demoCollections.length === 0) {
        console.log(`⚠️  No collections found under demos/${DEMO_ID}/ (this is OK if no data exists yet)`);
    } else {
        console.log(`✅ Found ${demoCollections.length} collection(s) under demos/${DEMO_ID}/:`);
        demoCollections.forEach(col => {
            console.log(`   - demos/${DEMO_ID}/${col.id}`);
        });
    }

    // Check books collection structure
    const booksRef = db.collection(`demos/${DEMO_ID}/books`);
    const booksSnapshot = await booksRef.limit(5).get();

    if (!booksSnapshot.empty) {
        console.log(`\n📚 Sample books (first ${booksSnapshot.size}):`);
        for (const doc of booksSnapshot.docs) {
            const data = doc.data();
            console.log(`   - ${doc.id}: "${data.title || 'Untitled'}" (owner: ${data.ownerId || 'unknown'})`);

            // Verify ownerId exists
            if (!data.ownerId) {
                console.error(`     ❌ Missing ownerId field!`);
                hasErrors = true;
            }
        }
    }

    return !hasErrors;
}

async function verifyStorageNamespace(): Promise<boolean> {
    console.log('\n📁 Checking Storage namespace...\n');

    let hasErrors = false;

    try {
        const bucket = storage.bucket();

        // List files at root level
        const [rootFiles] = await bucket.getFiles({ prefix: '', delimiter: '/' });
        const invalidRootFiles = rootFiles.filter(file => !file.name.startsWith('demos/'));

        if (invalidRootFiles.length > 0) {
            console.error('❌ Found files outside namespace:');
            invalidRootFiles.forEach(file => {
                console.error(`   - ${file.name}`);
            });
            hasErrors = true;
        } else {
            console.log('✅ No invalid root-level files found');
        }

        // List files under demos/{demoId}/
        const [demoFiles] = await bucket.getFiles({
            prefix: `demos/${DEMO_ID}/`,
            maxResults: 10
        });

        if (demoFiles.length === 0) {
            console.log(`⚠️  No files found under demos/${DEMO_ID}/ (this is OK if no files uploaded yet)`);
        } else {
            console.log(`✅ Found ${demoFiles.length} file(s) under demos/${DEMO_ID}/:`);
            demoFiles.slice(0, 5).forEach(file => {
                console.log(`   - ${file.name}`);
            });
            if (demoFiles.length > 5) {
                console.log(`   ... and ${demoFiles.length - 5} more`);
            }
        }
    } catch (error) {
        console.error('❌ Failed to check Storage:', error);
        hasErrors = true;
    }

    return !hasErrors;
}

async function createTestData(): Promise<void> {
    console.log('\n🧪 Creating test data to verify namespace...\n');

    const testBookId = `test-book-${Date.now()}`;
    const testUserId = 'test-user-verification';

    // Create a test book
    const bookRef = db.doc(`demos/${DEMO_ID}/books/${testBookId}`);
    await bookRef.set({
        title: 'Test Book - Namespace Verification',
        ownerId: testUserId,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        inputs: {
            childName: 'Test Child',
            ageRange: '4-6',
            theme: 'adventure',
            setting: 'forest',
            tone: 'playful',
            characterCount: 2,
        },
    });
    console.log(`✅ Created test book: demos/${DEMO_ID}/books/${testBookId}`);

    // Create a test character subcollection
    const characterRef = db.doc(`demos/${DEMO_ID}/books/${testBookId}/characters/char-1`);
    await characterRef.set({
        name: 'Test Character',
        description: 'A brave little fox',
        visualSignature: 'orange fur, green eyes, red scarf',
        role: 'protagonist',
    });
    console.log(`✅ Created test character: demos/${DEMO_ID}/books/${testBookId}/characters/char-1`);

    // Create a test page subcollection
    const pageRef = db.doc(`demos/${DEMO_ID}/books/${testBookId}/pages/page-1`);
    await pageRef.set({
        pageNumber: 1,
        text: 'Once upon a time...',
        sceneDescription: 'A sunny morning in the forest',
        characterIds: ['char-1'],
        imageStatus: 'pending',
    });
    console.log(`✅ Created test page: demos/${DEMO_ID}/books/${testBookId}/pages/page-1`);

    console.log(`\n✅ Test data created successfully!`);
    console.log(`   You can view it in Firebase Console under:`);
    console.log(`   Firestore > demos > ${DEMO_ID} > books > ${testBookId}\n`);

    // Clean up option
    console.log(`🧹 To clean up test data, delete the document:`);
    console.log(`   demos/${DEMO_ID}/books/${testBookId}`);
}

async function main() {
    const args = process.argv.slice(2);
    const shouldCreateTestData = args.includes('--create-test');

    if (shouldCreateTestData) {
        await createTestData();
    }

    const firestoreOk = await verifyFirestoreNamespace();
    const storageOk = await verifyStorageNamespace();

    console.log('\n================================');
    if (firestoreOk && storageOk) {
        console.log('✅ Namespace verification PASSED');
        console.log('   All data is correctly scoped under demos/{demoId}/...');
    } else {
        console.log('❌ Namespace verification FAILED');
        console.log('   Some data exists outside the expected namespace.');
        process.exit(1);
    }
    console.log('================================\n');
}

main().catch(console.error);

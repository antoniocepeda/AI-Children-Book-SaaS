/**
 * Script to assign the demo book to a real user
 * 
 * Usage: npx ts-node scripts/assign-demo-book.ts <email>
 * Example: npx ts-node scripts/assign-demo-book.ts antonio@htxwebworks.com
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DEMO_ID = process.env.NEXT_PUBLIC_DEMO_ID || 'childrens-book-saas';
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!PROJECT_ID) {
    console.error('❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
    process.exit(1);
}

// Initialize Firebase Admin
if (getApps().length === 0) {
    initializeApp({ projectId: PROJECT_ID });
}

const db = getFirestore();
const auth = getAuth();

async function main() {
    const email = process.argv[2];
    
    if (!email) {
        console.error('❌ Please provide an email address');
        console.error('   Usage: npx ts-node scripts/assign-demo-book.ts <email>');
        process.exit(1);
    }

    console.log(`\n🔍 Looking up user: ${email}`);
    
    // Get user by email
    let user;
    try {
        user = await auth.getUserByEmail(email);
        console.log(`✅ Found user: ${user.uid}`);
    } catch (error) {
        console.error(`❌ User not found: ${email}`);
        process.exit(1);
    }

    // Find the demo book
    console.log(`\n📚 Looking for demo books...`);
    const booksRef = db.collection(`demos/${DEMO_ID}/books`);
    const snapshot = await booksRef.where('ownerId', '==', 'test-user-verification').get();

    if (snapshot.empty) {
        console.log('⚠️  No demo books found. Creating one...');
        
        // Create a new demo book
        const newBookRef = booksRef.doc();
        await newBookRef.set({
            title: "Luna's Magical Forest Adventure",
            ownerId: user.uid,
            demoId: DEMO_ID,
            status: 'complete',
            createdAt: new Date(),
            updatedAt: new Date(),
            generationVersion: 1,
            inputs: {
                childName: 'Luna',
                ageRange: '4-6',
                theme: 'adventure',
                setting: 'Enchanted Forest',
                tone: 'warm',
                characterCount: 3,
                specialDetail: 'Loves butterflies and rainbows',
            },
            summary: 'Join Luna on a magical journey through the Enchanted Forest where she meets talking animals and discovers the power of friendship.',
        });
        
        console.log(`✅ Created demo book: ${newBookRef.id}`);
    } else {
        // Update existing demo books
        console.log(`📝 Found ${snapshot.size} demo book(s). Updating owner to ${user.uid}...`);
        
        for (const doc of snapshot.docs) {
            await doc.ref.update({ 
                ownerId: user.uid,
                updatedAt: new Date(),
            });
            console.log(`✅ Updated: ${doc.id} - "${doc.data().title || 'Untitled'}"`);
        }
    }

    console.log(`\n🎉 Done! Refresh your dashboard to see the book(s).`);
}

main().catch(console.error);

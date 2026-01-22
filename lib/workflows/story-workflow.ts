import { BookInputs } from '@/types/book';
import { generateBookPlan } from '@/lib/gemini/generate-book-plan';
import { STORY_MODEL } from '@/lib/gemini/client';
import { adminDb } from '@/lib/firebase/admin';
import { demoId } from '@/lib/config';
import { FieldValue } from 'firebase-admin/firestore';
import { BookPlan } from '@/lib/validators/book-plan';

/**
 * Story generation workflow
 * Orchestrates the creation of the book plan (story, characters, pages)
 * 
 * Flow:
 * 1. Update progress.story to 'generating'
 * 2. Generate Book Plan via Gemini
 * 3. Write title, characters, and pages to Firestore
 * 4. Update status to 'generating_images' on success
 * 5. On failure: set status to 'failed' with error metadata
 */
export async function runStoryGeneration(bookId: string, inputs: BookInputs): Promise<void> {
    console.log(`[Story Workflow] Starting generation for book ${bookId}`);

    const bookRef = adminDb.doc(`demos/${demoId}/books/${bookId}`);

    try {
        // 1. Verify book exists and is under correct namespace
        const bookSnapshot = await bookRef.get();
        if (!bookSnapshot.exists) {
            throw new Error(`Book ${bookId} not found under demos/${demoId}/books`);
        }

        const bookData = bookSnapshot.data();
        if (bookData?.demoId !== demoId) {
            throw new Error(`Book ${bookId} has mismatched demoId. Expected ${demoId}, got ${bookData?.demoId}`);
        }

        // 2. Update progress to 'generating'
        await bookRef.update({
            'progress.story': 'generating',
            updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(`[Story Workflow] Calling Gemini for book ${bookId}...`);

        // 3. Generate Book Plan via Gemini
        const bookPlan: BookPlan = await generateBookPlan(inputs);

        console.log(`[Story Workflow] Book plan generated: "${bookPlan.title}" with ${bookPlan.characters.length} characters and ${bookPlan.pages.length} pages`);

        // 4. Write to Firestore using a batch for atomicity
        const batch = adminDb.batch();

        // 4a. Update book document with title and summary
        batch.update(bookRef, {
            title: bookPlan.title,
            'progress.story': 'complete',
            'progress.characterRefs': 'pending',
            status: 'generating_character_refs',
            storyModel: STORY_MODEL,
            updatedAt: FieldValue.serverTimestamp(),
        });

        // 4b. Write characters to subcollection
        const charactersCollection = bookRef.collection('characters');
        bookPlan.characters.forEach((character, index) => {
            const charId = `char_${index + 1}`;
            const charRef = charactersCollection.doc(charId);
            batch.set(charRef, {
                id: charId,
                name: character.name,
                description: character.description,
                visualSignature: character.visualSignature,
                role: character.role || 'supporting',
                createdAt: FieldValue.serverTimestamp(),
            });
        });

        // 4c. Write pages to subcollection
        const pagesCollection = bookRef.collection('pages');
        bookPlan.pages.forEach((page) => {
            const pageId = `page_${page.pageNumber}`;
            const pageRef = pagesCollection.doc(pageId);

            // Map character names to character IDs
            const characterNameToId = new Map(
                bookPlan.characters.map((c, i) => [c.name, `char_${i + 1}`])
            );
            const characterIds = page.charactersOnPage
                .map(name => characterNameToId.get(name))
                .filter((id): id is string => id !== undefined);

            batch.set(pageRef, {
                id: pageId,
                pageNumber: page.pageNumber,
                text: page.pageText,
                sceneDescription: page.sceneDescription,
                characterIds,
                imageStatus: 'pending',
                createdAt: FieldValue.serverTimestamp(),
            });
        });

        // 5. Commit the batch
        await batch.commit();

        console.log(`[Story Workflow] Successfully wrote book plan to Firestore for book ${bookId}`);
        console.log(`[Story Workflow] Status updated to 'generating_character_refs'`);

        // 6. Trigger character reference generation workflow
        // Import dynamically to avoid circular dependencies
        const { runCharacterRefGeneration } = await import('./character-ref-workflow');

        // Fire and forget - don't block on character ref generation
        runCharacterRefGeneration(bookId).catch(err => {
            console.error(`[Story Workflow] Character ref generation failed for book ${bookId}:`, err);
        });


    } catch (error) {
        console.error(`[Story Workflow] Error generating story for book ${bookId}:`, error);

        // Update book status to failed with error details
        try {
            await bookRef.update({
                status: 'failed',
                'progress.story': 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error during story generation',
                errorStage: 'story_generation',
                updatedAt: FieldValue.serverTimestamp(),
            });
        } catch (updateError) {
            console.error(`[Story Workflow] Failed to update book status to failed:`, updateError);
        }

        // Re-throw to propagate error
        throw error;
    }
}

import { adminDb } from '@/lib/firebase/admin';
import { demoId } from '@/lib/config';
import { FieldValue } from 'firebase-admin/firestore';
import { generatePageImage, PageImageInput } from '@/lib/replicate/generate-page-image';
import { uploadImageFromUrl } from '@/lib/utils/image-upload';

interface Character {
    id: string;
    name: string;
    visualSignature: string;
}

interface Page {
    id: string;
    pageNumber: number;
    sceneDescription: string;
    characterIds: string[];
}

/**
 * Image generation workflow
 * Orchestrates the generation and upload of all book page images
 * 
 * Flow:
 * 1. Update progress.images to 'generating'
 * 2. Fetch characters and pages from Firestore
 * 3. Generate images for each page (sequentially for consistency)
 * 4. Upload each image to Firebase Storage
 * 5. Update page documents with imageUrl
 * 6. Update book status to 'generating_pdf' on success
 * 7. On failure: set status to 'failed' with error metadata
 */
export async function runImageGeneration(bookId: string): Promise<void> {
    console.log(`[Image Workflow] Starting image generation for book ${bookId}`);

    const bookRef = adminDb.doc(`demos/${demoId}/books/${bookId}`);

    try {
        // 1. Verify book and update progress
        const bookSnapshot = await bookRef.get();
        if (!bookSnapshot.exists) {
            throw new Error(`Book ${bookId} not found`);
        }

        const bookData = bookSnapshot.data();
        if (bookData?.status !== 'generating_images') {
            console.log(`[Image Workflow] Book ${bookId} is not in generating_images status, skipping`);
            return;
        }

        await bookRef.update({
            'progress.images': 'generating',
            updatedAt: FieldValue.serverTimestamp(),
        });

        // 2. Fetch characters
        const charactersSnapshot = await bookRef.collection('characters').get();
        const characters: Character[] = charactersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Character[];

        console.log(`[Image Workflow] Found ${characters.length} characters`);

        // Build character lookup for visual signatures
        const characterById = new Map(characters.map(c => [c.id, c]));

        // 3. Fetch pages (ordered by pageNumber)
        const pagesSnapshot = await bookRef.collection('pages').orderBy('pageNumber').get();
        const pages: Page[] = pagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Page[];

        console.log(`[Image Workflow] Found ${pages.length} pages to generate`);

        // 4. Generate and upload images for each page
        let coverImageUrl: string | null = null;

        for (const page of pages) {
            try {
                // Update page status to generating
                await bookRef.collection('pages').doc(page.id).update({
                    imageStatus: 'generating',
                });

                // Get visual signatures for characters on this page
                const characterSignatures = page.characterIds
                    .map(id => characterById.get(id)?.visualSignature)
                    .filter((sig): sig is string => !!sig);

                // Build input for image generation
                const imageInput: PageImageInput = {
                    pageNumber: page.pageNumber,
                    sceneDescription: page.sceneDescription,
                    characterVisualSignatures: characterSignatures,
                };

                // Generate image
                const result = await generatePageImage(imageInput);

                // Upload to Firebase Storage
                const uploadResult = await uploadImageFromUrl(
                    result.imageUrl,
                    bookId,
                    page.pageNumber
                );

                // Update page document with imageUrl
                await bookRef.collection('pages').doc(page.id).update({
                    imageUrl: uploadResult.publicUrl,
                    imageStatus: 'complete',
                    updatedAt: FieldValue.serverTimestamp(),
                });

                // Track cover image
                if (page.pageNumber === 0) {
                    coverImageUrl = uploadResult.publicUrl;
                }

                console.log(`[Image Workflow] Page ${page.pageNumber} complete`);

            } catch (pageError) {
                console.error(`[Image Workflow] Failed to generate page ${page.pageNumber}:`, pageError);

                // Update page status to failed
                await bookRef.collection('pages').doc(page.id).update({
                    imageStatus: 'failed',
                    errorMessage: pageError instanceof Error ? pageError.message : 'Unknown error',
                });

                // Re-throw to fail the whole workflow
                throw pageError;
            }
        }

        // 5. Update book with cover image and status
        await bookRef.update({
            coverImageUrl: coverImageUrl,
            'progress.images': 'complete',
            status: 'generating_pdf',
            updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(`[Image Workflow] All images generated successfully for book ${bookId}`);

        // 6. Trigger PDF generation workflow
        const { runPdfGeneration } = await import('./pdf-workflow');

        runPdfGeneration(bookId).catch(err => {
            console.error(`[Image Workflow] PDF generation failed for book ${bookId}:`, err);
        });

    } catch (error) {
        console.error(`[Image Workflow] Error generating images for book ${bookId}:`, error);

        // Update book status to failed
        try {
            await bookRef.update({
                status: 'failed',
                'progress.images': 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error during image generation',
                errorStage: 'image_generation',
                updatedAt: FieldValue.serverTimestamp(),
            });
        } catch (updateError) {
            console.error(`[Image Workflow] Failed to update book status to failed:`, updateError);
        }

        throw error;
    }
}

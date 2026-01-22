import { adminDb } from '@/lib/firebase/admin';
import { demoId } from '@/lib/config';
import { FieldValue } from 'firebase-admin/firestore';
import { generateKontextImage, CHARACTER_REF_CONFIG } from '@/lib/replicate/kontext-client';
import { uploadCharacterRefImage } from '@/lib/utils/image-upload';

interface Character {
    id: string;
    name: string;
    visualSignature: string;
    role: 'protagonist' | 'supporting' | 'antagonist';
}

/**
 * Character reference generation workflow
 * Generates canonical reference images for each character to enable consistency
 * 
 * Flow:
 * 1. Update progress.characterRefs to 'generating'
 * 2. Fetch all characters from Firestore
 * 3. For each character, generate 2 reference images:
 *    - ref-0: Front-facing portrait, neutral expression
 *    - ref-1: 3/4 view action pose
 * 4. Upload each ref image to Firebase Storage
 * 5. Update character documents with refImageUrls and refStatus
 * 6. Update book progress.characterRefs to 'complete'
 * 7. Trigger image generation workflow
 * 8. On failure: set status to 'failed' with error metadata
 */
export async function runCharacterRefGeneration(bookId: string): Promise<void> {
    console.log(`[CharRef Workflow] Starting character reference generation for book ${bookId}`);

    const bookRef = adminDb.doc(`demos/${demoId}/books/${bookId}`);

    try {
        // 1. Verify book and update progress
        const bookSnapshot = await bookRef.get();
        if (!bookSnapshot.exists) {
            throw new Error(`Book ${bookId} not found`);
        }

        const bookData = bookSnapshot.data();
        if (bookData?.status !== 'generating_character_refs') {
            console.log(`[CharRef Workflow] Book ${bookId} is not in generating_character_refs status, skipping`);
            return;
        }

        await bookRef.update({
            'progress.characterRefs': 'generating',
            updatedAt: FieldValue.serverTimestamp(),
        });

        // 2. Fetch characters (ordered by role: protagonist first)
        const charactersSnapshot = await bookRef.collection('characters').get();
        const characters: Character[] = charactersSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            }) as Character)
            .sort((a, b) => {
                // Protagonist first, then supporting, then antagonist
                const roleOrder = { protagonist: 0, supporting: 1, antagonist: 2 };
                return (roleOrder[a.role] || 1) - (roleOrder[b.role] || 1);
            });

        console.log(`[CharRef Workflow] Found ${characters.length} characters to generate refs for`);

        // 3. Generate ref images for each character
        for (const character of characters) {
            try {
                // Update character status to generating
                await bookRef.collection('characters').doc(character.id).update({
                    refStatus: 'generating',
                });

                const refImageUrls: string[] = [];

                // Generate each reference image type
                for (let refIndex = 0; refIndex < CHARACTER_REF_CONFIG.refsPerCharacter; refIndex++) {
                    const refType = CHARACTER_REF_CONFIG.refTypes[refIndex];
                    if (!refType) continue; // Skip if refType is undefined

                    const prompt = buildRefPrompt(character, refType);

                    console.log(`[CharRef Workflow] Generating ${refType} for ${character.name}...`);

                    // Generate image using Kontext
                    const imageUrl = await generateKontextImage(prompt);

                    // Upload to Firebase Storage
                    const uploadResult = await uploadCharacterRefImage(
                        imageUrl,
                        bookId,
                        character.id,
                        refIndex
                    );

                    refImageUrls.push(uploadResult.publicUrl);
                    console.log(`[CharRef Workflow] ${character.name} ref-${refIndex} uploaded`);
                }

                // Update character with ref URLs
                await bookRef.collection('characters').doc(character.id).update({
                    refImageUrls,
                    refStatus: 'complete',
                    updatedAt: FieldValue.serverTimestamp(),
                });

                console.log(`[CharRef Workflow] ${character.name} refs complete`);

            } catch (charError) {
                console.error(`[CharRef Workflow] Failed to generate refs for ${character.name}:`, charError);

                // Update character status to failed
                await bookRef.collection('characters').doc(character.id).update({
                    refStatus: 'failed',
                    errorMessage: charError instanceof Error ? charError.message : 'Unknown error',
                });

                // Re-throw to fail the whole workflow
                throw charError;
            }
        }

        // 4. Update book progress and trigger image generation
        await bookRef.update({
            'progress.characterRefs': 'complete',
            status: 'generating_images',
            updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(`[CharRef Workflow] All character refs generated for book ${bookId}`);

        // 5. Trigger image generation workflow
        const { runImageGeneration } = await import('./image-workflow');

        runImageGeneration(bookId).catch(err => {
            console.error(`[CharRef Workflow] Image generation failed for book ${bookId}:`, err);
        });

    } catch (error) {
        console.error(`[CharRef Workflow] Error generating character refs for book ${bookId}:`, error);

        // Update book status to failed
        try {
            await bookRef.update({
                status: 'failed',
                'progress.characterRefs': 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error during character ref generation',
                errorStage: 'character_ref_generation',
                updatedAt: FieldValue.serverTimestamp(),
            });
        } catch (updateError) {
            console.error(`[CharRef Workflow] Failed to update book status to failed:`, updateError);
        }

        throw error;
    }
}

/**
 * Build a prompt for generating a character reference image
 */
function buildRefPrompt(
    character: Character,
    refType: typeof CHARACTER_REF_CONFIG.refTypes[number]
): string {
    const baseStyle = `children's book illustration style, soft watercolor textures, warm and inviting colors, gentle lighting, rounded shapes, friendly and approachable, high quality, detailed, professional children's book art`;

    const poseDirections: Record<typeof CHARACTER_REF_CONFIG.refTypes[number], string> = {
        front_portrait: 'front-facing portrait, neutral standing pose, looking directly at viewer, full body visible, centered composition, simple solid color background',
        action_pose: 'three-quarter view, dynamic action pose, expressive, showing personality, full body visible, simple solid color background',
    };

    const pose = poseDirections[refType];

    return `${character.visualSignature}. ${pose}. ${baseStyle}`;
}

import { getReplicateClient, KONTEXT_MODEL } from './client';
import { KONTEXT_IMAGE_CONFIG } from './kontext-client';
import { buildStructuredPrompt, CharacterWithRefs } from './prompts-v2';

export interface PageImageInput {
    pageNumber: number;
    sceneDescription: string;
    /** Characters appearing on this page (for structured prompt) */
    pageCharacters: CharacterWithRefs[];
    /** Optional reference image URL for character consistency (Kontext model) */
    imageUrl?: string;
}

export interface PageImageResult {
    pageNumber: number;
    imageUrl: string;
}

/**
 * Generate an image for a single page using FLUX Kontext Dev
 * 
 * @param input - Page details including scene, characters, and optional reference image
 * @returns Generated image URL
 */
export async function generatePageImage(input: PageImageInput): Promise<PageImageResult> {
    const { pageNumber, sceneDescription, pageCharacters, imageUrl } = input;
    const isCover = pageNumber === 0;

    console.log(`[Kontext] Generating page ${pageNumber} image${imageUrl ? ' with reference' : ''} (${pageCharacters.length} characters)...`);

    // Build structured prompt with deterministic character ordering
    const prompt = buildStructuredPrompt(sceneDescription, pageCharacters, isCover);

    try {
        const replicate = getReplicateClient();

        // Build input parameters for Kontext model
        const inputParams: Record<string, unknown> = {
            prompt,
            ...KONTEXT_IMAGE_CONFIG,
        };

        // Add reference image if provided (for character consistency)
        if (imageUrl) {
            inputParams.image_url = imageUrl;
        }

        // Use predictions.create and wait for the result
        // This handles both streaming and non-streaming models
        const prediction = await replicate.predictions.create({
            model: KONTEXT_MODEL,
            input: inputParams,
        });

        console.log(`[Kontext] Prediction created: ${prediction.id}, status: ${prediction.status}`);

        // Wait for the prediction to complete
        let result = prediction;
        while (result.status !== 'succeeded' && result.status !== 'failed') {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
            result = await replicate.predictions.get(prediction.id);
            console.log(`[Kontext] Prediction ${prediction.id} status: ${result.status}`);
        }

        if (result.status === 'failed') {
            throw new Error(`Prediction failed: ${result.error || 'Unknown error'}`);
        }

        console.log(`[Kontext] Prediction output:`, JSON.stringify(result.output, null, 2));

        // Extract image URL from output
        let generatedUrl: string;
        const output = result.output;

        if (typeof output === 'string') {
            generatedUrl = output;
        } else if (Array.isArray(output) && output.length > 0) {
            const firstItem = output[0];
            if (typeof firstItem === 'string') {
                generatedUrl = firstItem;
            } else if (firstItem && typeof firstItem === 'object' && 'url' in firstItem) {
                generatedUrl = (firstItem as { url: string }).url;
            } else {
                throw new Error(`Unexpected array item format: ${JSON.stringify(firstItem)}`);
            }
        } else if (output && typeof output === 'object' && 'url' in output) {
            generatedUrl = (output as { url: string }).url;
        } else {
            throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
        }

        if (!generatedUrl || typeof generatedUrl !== 'string') {
            throw new Error('No valid image URL in response');
        }

        console.log(`[Kontext] Page ${pageNumber} image generated: ${generatedUrl.substring(0, 80)}...`);

        return {
            pageNumber,
            imageUrl: generatedUrl,
        };
    } catch (error) {
        console.error(`[Kontext] Failed to generate image for page ${pageNumber}:`, error);
        throw error;
    }
}

/**
 * Generate images for multiple pages sequentially
 * Sequential to avoid rate limits and ensure consistency
 */
export async function generateAllPageImages(
    pages: PageImageInput[]
): Promise<PageImageResult[]> {
    const results: PageImageResult[] = [];

    for (const page of pages) {
        const result = await generatePageImage(page);
        results.push(result);
    }

    return results;
}

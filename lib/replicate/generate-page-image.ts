import { getReplicateClient, FLUX_MODEL, IMAGE_CONFIG } from './client';
import { buildPagePrompt } from './prompts';

export interface PageImageInput {
    pageNumber: number;
    sceneDescription: string;
    characterVisualSignatures: string[];
}

export interface PageImageResult {
    pageNumber: number;
    imageUrl: string;
}

/**
 * Generate an image for a single page using Replicate FLUX
 * 
 * @param input - Page details including scene and characters
 * @returns Generated image URL
 */
export async function generatePageImage(input: PageImageInput): Promise<PageImageResult> {
    const { pageNumber, sceneDescription, characterVisualSignatures } = input;
    const isCover = pageNumber === 0;

    console.log(`[Image Gen] Generating image for page ${pageNumber}...`);

    const prompt = buildPagePrompt(sceneDescription, characterVisualSignatures, isCover);

    try {
        const replicate = getReplicateClient();

        // Use predictions.create and wait for the result
        // This handles both streaming and non-streaming models
        const prediction = await replicate.predictions.create({
            model: FLUX_MODEL,
            input: {
                prompt,
                ...IMAGE_CONFIG,
            },
        });

        console.log(`[Image Gen] Prediction created: ${prediction.id}, status: ${prediction.status}`);

        // Wait for the prediction to complete
        let result = prediction;
        while (result.status !== 'succeeded' && result.status !== 'failed') {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
            result = await replicate.predictions.get(prediction.id);
            console.log(`[Image Gen] Prediction ${prediction.id} status: ${result.status}`);
        }

        if (result.status === 'failed') {
            throw new Error(`Prediction failed: ${result.error || 'Unknown error'}`);
        }

        console.log(`[Image Gen] Prediction output:`, JSON.stringify(result.output, null, 2));

        // Extract image URL from output
        let imageUrl: string;
        const output = result.output;

        if (typeof output === 'string') {
            imageUrl = output;
        } else if (Array.isArray(output) && output.length > 0) {
            const firstItem = output[0];
            if (typeof firstItem === 'string') {
                imageUrl = firstItem;
            } else if (firstItem && typeof firstItem === 'object' && 'url' in firstItem) {
                imageUrl = (firstItem as { url: string }).url;
            } else {
                throw new Error(`Unexpected array item format: ${JSON.stringify(firstItem)}`);
            }
        } else if (output && typeof output === 'object' && 'url' in output) {
            imageUrl = (output as { url: string }).url;
        } else {
            throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
        }

        if (!imageUrl || typeof imageUrl !== 'string') {
            throw new Error('No valid image URL in response');
        }

        console.log(`[Image Gen] Page ${pageNumber} image generated: ${imageUrl.substring(0, 80)}...`);

        return {
            pageNumber,
            imageUrl,
        };
    } catch (error) {
        console.error(`[Image Gen] Failed to generate image for page ${pageNumber}:`, error);
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

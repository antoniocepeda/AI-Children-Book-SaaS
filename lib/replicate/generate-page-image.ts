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

        const output = await replicate.run(FLUX_MODEL, {
            input: {
                prompt,
                ...IMAGE_CONFIG,
            },
        });

        // FLUX returns an array of image URLs
        const results = output as string[];

        if (!results || results.length === 0) {
            throw new Error('No image generated');
        }

        const imageUrl = results[0];
        if (!imageUrl) {
            throw new Error('No image URL in response');
        }

        console.log(`[Image Gen] Page ${pageNumber} image generated: ${imageUrl.substring(0, 50)}...`);

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

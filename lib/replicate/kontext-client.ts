import { getReplicateClient } from './client';

/**
 * FLUX Kontext Dev model for character-consistent image generation
 * 
 * Key features:
 * - Accepts image_url parameter for reference-based generation
 * - Maintains character consistency across multiple generations
 * - Cost: $0.025/image (vs $0.05 for FLUX 2 Pro)
 * 
 * @see https://replicate.com/black-forest-labs/flux-kontext-dev
 */
export const KONTEXT_MODEL = 'black-forest-labs/flux-kontext-dev';

/**
 * Image configuration for Kontext Dev
 * Same dimensions as FLUX 2 Pro for consistency
 */
export const KONTEXT_IMAGE_CONFIG = {
    aspect_ratio: '1:1',
    output_format: 'webp',
    output_quality: 90,
    safety_tolerance: 2,  // 1-5, lower = stricter (children's content)
} as const;

/**
 * Configuration for character reference images
 */
export const CHARACTER_REF_CONFIG = {
    /** Number of reference images to generate per character */
    refsPerCharacter: 2,
    /** Ref image types */
    refTypes: ['front_portrait', 'action_pose'] as const,
} as const;

/**
 * Generate an image using FLUX Kontext Dev with optional reference
 * 
 * @param prompt - Text prompt describing the image
 * @param imageUrl - Optional reference image URL for character consistency
 * @returns Generated image URL
 */
export async function generateKontextImage(
    prompt: string,
    imageUrl?: string
): Promise<string> {
    const replicate = getReplicateClient();

    console.log(`[Kontext] Generating image${imageUrl ? ' with reference' : ''}...`);

    const input: Record<string, unknown> = {
        prompt,
        ...KONTEXT_IMAGE_CONFIG,
    };

    // Add reference image if provided
    if (imageUrl) {
        input.image_url = imageUrl;
    }

    const prediction = await replicate.predictions.create({
        model: KONTEXT_MODEL,
        input,
    });

    console.log(`[Kontext] Prediction created: ${prediction.id}, status: ${prediction.status}`);

    // Wait for completion
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        result = await replicate.predictions.get(prediction.id);
        console.log(`[Kontext] Prediction ${prediction.id} status: ${result.status}`);
    }

    if (result.status === 'failed') {
        throw new Error(`Kontext prediction failed: ${result.error || 'Unknown error'}`);
    }

    // Extract image URL from output
    const output = result.output;
    let generatedUrl: string;

    if (typeof output === 'string') {
        generatedUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
        const firstItem = output[0];
        if (typeof firstItem === 'string') {
            generatedUrl = firstItem;
        } else if (firstItem && typeof firstItem === 'object' && 'url' in firstItem) {
            generatedUrl = (firstItem as { url: string }).url;
        } else {
            throw new Error(`Unexpected Kontext array output format: ${JSON.stringify(firstItem)}`);
        }
    } else if (output && typeof output === 'object' && 'url' in output) {
        generatedUrl = (output as { url: string }).url;
    } else {
        throw new Error(`Unexpected Kontext output format: ${JSON.stringify(output)}`);
    }

    console.log(`[Kontext] Image generated: ${generatedUrl.substring(0, 80)}...`);

    return generatedUrl;
}

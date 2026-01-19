import Replicate from 'replicate';

// Lazy initialization to avoid build-time errors
let _replicate: Replicate | null = null;

/**
 * Get the Replicate client (lazy initialization)
 * Throws error at runtime if API token is missing
 */
export function getReplicateClient(): Replicate {
    if (_replicate) return _replicate;

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
        throw new Error('Missing REPLICATE_API_TOKEN environment variable');
    }

    _replicate = new Replicate({
        auth: apiToken,
    });

    return _replicate;
}

/**
 * FLUX model for image generation
 * Using FLUX Schnell for fast generation (good for children's book illustrations)
 */
export const FLUX_MODEL = 'black-forest-labs/flux-schnell';

/**
 * Image dimensions for children's book pages
 * Using 1:1 aspect ratio for simplicity, can be adjusted
 */
export const IMAGE_CONFIG = {
    width: 1024,
    height: 1024,
    num_outputs: 1,
    output_format: 'webp',
    output_quality: 90,
} as const;

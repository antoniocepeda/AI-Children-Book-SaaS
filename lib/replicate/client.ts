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
 * Using FLUX 2 Pro for highest quality children's book illustrations
 */
export const FLUX_MODEL = 'black-forest-labs/flux-2-pro';

/**
 * Image dimensions for children's book pages
 * FLUX 2 Pro supports various aspect ratios
 */
export const IMAGE_CONFIG = {
    width: 1024,
    height: 1024,
    num_outputs: 1,
    output_format: 'webp',
    output_quality: 90,
} as const;


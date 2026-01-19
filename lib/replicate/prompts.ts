/**
 * Prompt templates for children's book illustration generation
 * 
 * Design Philosophy:
 * - Consistent art style across all pages
 * - Child-friendly, colorful, inviting imagery
 * - Clear character depiction with visual signatures
 */

/**
 * Base style prompt that applies to ALL images
 * Ensures visual consistency across the book
 */
export const BASE_STYLE_PROMPT = `
children's book illustration style, 
soft watercolor textures, 
warm and inviting colors, 
gentle lighting, 
rounded shapes, 
friendly and approachable characters, 
high quality, detailed, 
professional children's book art,
storybook illustration
`.trim().replace(/\n/g, ' ');

/**
 * Build a complete image prompt for a page
 * Combines scene description with character visual signatures and base style
 */
export function buildPagePrompt(
    sceneDescription: string,
    characterVisualSignatures: string[],
    isCover: boolean = false
): string {
    const characterContext = characterVisualSignatures.length > 0
        ? `Characters in scene: ${characterVisualSignatures.join('. ')}.`
        : '';

    const coverPrefix = isCover
        ? 'Book cover illustration, title page style, centered composition, '
        : '';

    return `${coverPrefix}${sceneDescription}. ${characterContext} ${BASE_STYLE_PROMPT}`;
}

/**
 * Negative prompt to avoid unwanted elements
 */
export const NEGATIVE_PROMPT = `
scary, dark, violent, blood, gore, 
realistic, photorealistic, 
ugly, deformed, distorted,
low quality, blurry,
adult content, nsfw,
text, watermark, signature
`.trim().replace(/\n/g, ' ');

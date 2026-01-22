/**
 * Structured Prompt Builder for FLUX Kontext Dev
 * 
 * Design Philosophy:
 * - Deterministic character ordering (protagonist first, then by array order)
 * - Structured character blocks with visual signatures
 * - Optimized for Kontext image-to-image consistency
 */

/**
 * Base style prompt for consistent children's book illustration style
 */
export const BASE_STYLE_PROMPT_V2 = `children's book illustration style, soft watercolor textures, warm and inviting colors, gentle lighting, rounded shapes, friendly and approachable characters, high quality, detailed, professional children's book art, storybook illustration`;

/**
 * Negative prompt to avoid unwanted elements
 */
export const NEGATIVE_PROMPT_V2 = `scary, dark, violent, blood, gore, realistic, photorealistic, ugly, deformed, distorted, low quality, blurry, adult content, nsfw, text, watermark, signature`;

/**
 * Character with reference images for structured prompts
 * Note: Intentionally defined here to avoid circular dependencies
 */
export interface CharacterWithRefs {
    name: string;
    visualSignature: string;
    description: string;
    role?: 'protagonist' | 'supporting' | 'antagonist';
    refImageUrls?: string[];
    refStatus?: 'pending' | 'generating' | 'complete' | 'failed';
}

/**
 * Page data for filtering characters
 */
export interface PageData {
    pageNumber: number;
    pageText: string;
    sceneDescription: string;
    charactersOnPage: string[];
}

/**
 * Sort characters deterministically: protagonist first, then by array order
 * This ensures consistent character ordering in prompts
 */
export function sortCharactersDeterministic(characters: CharacterWithRefs[]): CharacterWithRefs[] {
    return [...characters].sort((a, b) => {
        // Protagonist always comes first
        if (a.role === 'protagonist' && b.role !== 'protagonist') return -1;
        if (b.role === 'protagonist' && a.role !== 'protagonist') return 1;
        // Keep original array order for non-protagonist characters
        return 0;
    });
}

/**
 * Build a structured character block for a single character
 * Format: "[NAME]: [visual signature]"
 */
function buildCharacterBlock(character: CharacterWithRefs): string {
    return `[${character.name.toUpperCase()}]: ${character.visualSignature}`;
}

/**
 * Build a structured prompt for page image generation with Kontext
 * 
 * Structure:
 * 1. Cover prefix (if applicable)
 * 2. Scene description
 * 3. Character blocks (protagonist first, deterministic order)
 * 4. Base style prompt
 * 
 * @param sceneDescription - Description of the scene from the page
 * @param pageCharacters - Characters appearing on this page (will be sorted deterministically)
 * @param isCover - Whether this is the book cover (page 0)
 * @returns Structured prompt string
 */
export function buildStructuredPrompt(
    sceneDescription: string,
    pageCharacters: CharacterWithRefs[],
    isCover: boolean = false
): string {
    const parts: string[] = [];

    // 1. Cover prefix if applicable
    if (isCover) {
        parts.push('Book cover illustration, title page style, centered composition.');
    }

    // 2. Scene description
    parts.push(sceneDescription.trim());

    // 3. Character blocks (sorted deterministically)
    if (pageCharacters.length > 0) {
        const sortedCharacters = sortCharactersDeterministic(pageCharacters);
        const characterBlocks = sortedCharacters.map(buildCharacterBlock);
        parts.push(`Characters in scene: ${characterBlocks.join('. ')}.`);
    }

    // 4. Base style
    parts.push(BASE_STYLE_PROMPT_V2);

    return parts.join(' ');
}

/**
 * Filter characters that appear on a specific page
 * Uses the charactersOnPage array from the page data
 */
export function getPageCharacters(
    page: PageData,
    allCharacters: CharacterWithRefs[]
): CharacterWithRefs[] {
    const pageCharacterNames = new Set(
        page.charactersOnPage.map(name => name.toLowerCase())
    );

    return allCharacters.filter(char =>
        pageCharacterNames.has(char.name.toLowerCase())
    );
}

/**
 * Get the protagonist's first reference image URL (for Kontext image_url param)
 * Returns undefined if no protagonist or no ref images available
 */
export function getProtagonistRefUrl(characters: CharacterWithRefs[]): string | undefined {
    const protagonist = characters.find(c => c.role === 'protagonist');

    if (!protagonist?.refImageUrls?.length) {
        return undefined;
    }

    return protagonist.refImageUrls[0];
}

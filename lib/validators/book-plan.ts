import { z } from 'zod';

/**
 * Valid age ranges for book personalization
 */
export const AgeRangeSchema = z.enum(['3-5', '6-8', '9-12']);

/**
 * Valid book themes
 */
export const ThemeSchema = z.string().min(1, 'Theme is required');

/**
 * Valid book tones
 */
export const ToneSchema = z.enum(['silly', 'warm', 'adventurous']);

/**
 * Input validation for book creation
 */
export const BookInputsSchema = z.object({
    childName: z.string().min(1, 'Child name is required').max(50),
    ageRange: AgeRangeSchema,
    theme: ThemeSchema,
    setting: z.string().min(1, 'Setting is required'),
    tone: ToneSchema,
    characterCount: z.union([z.literal(3), z.literal(4), z.literal(5)]),
    specialDetail: z.string().max(200).optional(),
});

/**
 * Character schema for book plan
 */
export const CharacterSchema = z.object({
    name: z.string(),
    visualSignature: z.string(), // Description for image generation consistency
    description: z.string(),
    role: z.enum(['protagonist', 'supporting', 'antagonist']).optional().default('supporting'),
    // Reference images for character consistency (added by ref generation workflow)
    refImageUrls: z.array(z.string()).optional(),
    refStatus: z.enum(['pending', 'generating', 'complete', 'failed']).optional(),
});

/**
 * Page schema for book plan
 * Enforces cover (page 0) vs content pages (1-10)
 */
export const PageSchema = z.object({
    pageNumber: z.number().min(0).max(10),
    pageText: z.string(),
    sceneDescription: z.string(), // Used for image generation
    charactersOnPage: z.array(z.string()), // Names of characters in this scene
});

/**
 * Book Plan schema (the structured output from OpenAI)
 * Enforces strict structure: cover + 10 pages
 */
export const BookPlanSchema = z.object({
    title: z.string(),
    characters: z.array(CharacterSchema).min(3).max(5),
    pages: z.array(PageSchema).length(11).refine((pages) => {
        // Validation: Ensure we have exactly one page 0 (cover) and pages 1-10
        const hasCover = pages.some(p => p.pageNumber === 0);
        const hasAllPages = Array.from({ length: 10 }, (_, i) => i + 1).every(
            num => pages.some(p => p.pageNumber === num)
        );
        return hasCover && hasAllPages;
    }, "Book must have a cover (page 0) and pages 1-10"),
});

// Type inference
export type BookInputs = z.infer<typeof BookInputsSchema>;
export type BookPlan = z.infer<typeof BookPlanSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Page = z.infer<typeof PageSchema>;

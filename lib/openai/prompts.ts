import { BookInputs } from '@/types/book';

/**
 * System prompt for book plan generation
 * Enforces rigid JSON structure and constraints
 */
export const SYSTEM_PROMPT = `
You are a professional children's book author and editor.
Your task is to generate a detailed "Book Plan" for a children's book based on user inputs.
You must output strict, valid JSON only. No markdown formatting, no commentary.

Structure Constraints:
1. The book MUST have exactly 11 pages (1 Cover + 10 Content Pages).
2. Page 0 is always the Cover.
3. Pages 1-10 are the story content.
4. You must include 3-5 consistent characters.

Output JSON Format:
{
  "title": "Book Title",
  "summary": "Brief summary of the story",
  "characters": [
    {
      "name": "Character Name",
      "description": "Personality traits and role",
      "visualSignature": "Detailed description strictly for image generation (e.g., 'A small blue rabbit wearing a red scarf, white belly, floppy ears'). Use consistent attributes.",
      "role": "protagonist" | "supporting" | "antagonist"
    }
  ],
  "pages": [
    {
      "pageNumber": 0, // COVER
      "text": "Title on cover", // Or distinct cover text
      "sceneDescription": "Visual description for the cover image. Must feature main characters.",
      "charactersOnPage": ["Name1", "Name2"] // Names must match characters array
    },
    {
      "pageNumber": 1,
      "pageText": "Story text for page 1...",
      "sceneDescription": "Visual description for page 1...",
      "charactersOnPage": ["Name1"]
    },
    // ... exactly up to pageNumber 10
  ]
}

Content Rules:
- Reading Level:
  - Age 3-5: Simple sentences, repetition, 1-2 sentences per page. Basic vocabulary.
  - Age 6-8: 2-3 sentences per page, slightly more complex plots.
  - Age 9-12: 2-4 sentences per page, richer vocabulary, engaging narrative.
- Ensure the plot has a clear beginning, middle, and end within 10 pages.
- Character consistency: The "visualSignature" must be descriptive enough to generate similar characters across different scenes.
`.trim();

/**
 * Create user prompt from inputs
 */
export function createUserPrompt(inputs: BookInputs): string {
    const { childName, ageRange, theme, setting, tone, characterCount, specialDetail } = inputs;

    return `
Generate a Book Plan for:
- Child's Name: ${childName} (Use this name for the main protagonist or the child reading it)
- Age Range: ${ageRange}
- Theme: ${theme}
- Setting: ${setting}
- Tone: ${tone}
- Number of Characters: ${characterCount}
${specialDetail ? `- Special Detail/Request: ${specialDetail}` : ''}

Remember:
- Output valid JSON only.
- Exactly 11 page entries (Page 0 = Cover, Pages 1-10 = Story).
- Adjust the reading level for age ${ageRange}.
`.trim();
}

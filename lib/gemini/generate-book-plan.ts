import { getModel, STORY_MODEL } from './client';
import { SYSTEM_PROMPT, createUserPrompt } from './prompts';
import { BookPlanSchema, BookPlan } from '@/lib/validators/book-plan';
import { BookInputs } from '@/types/book';

/**
 * Generate a Book Plan using Google Gemini
 * Enforces strict JSON output and Schema validation
 */
export async function generateBookPlan(inputs: BookInputs): Promise<BookPlan> {
    try {
        const model = getModel(STORY_MODEL);
        const userPrompt = createUserPrompt(inputs);

        // Combine system and user prompts
        const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json', // Force JSON output
            },
        });

        const response = result.response;
        const content = response.text();

        if (!content) {
            throw new Error('Gemini returned empty content');
        }

        // Parse JSON - Gemini with responseMimeType should return clean JSON
        let rawJson;
        try {
            // Try to extract JSON if wrapped in code blocks (fallback)
            let jsonStr = content.trim();
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }
            rawJson = JSON.parse(jsonStr);
        } catch (jsonError) {
            console.error('Failed to parse Gemini JSON:', content);
            throw new Error('Gemini did not return valid JSON');
        }

        // Validate with Zod
        const validation = BookPlanSchema.safeParse(rawJson);
        if (!validation.success) {
            console.error('Book Plan validation failed:', validation.error);
            throw new Error('Generated book plan failed validation: ' + validation.error.message);
        }

        return validation.data;

    } catch (error) {
        console.error('generateBookPlan Error:', error);
        throw error;
    }
}

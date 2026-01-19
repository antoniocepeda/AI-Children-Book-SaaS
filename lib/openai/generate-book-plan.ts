import { openai } from './client';
import { SYSTEM_PROMPT, createUserPrompt } from './prompts';
import { BookPlanSchema, BookPlan } from '@/lib/validators/book-plan';
import { BookInputs } from '@/types/book';

/**
 * Generate a Book Plan using OpenAI
 * Enforces strict JSON output and Schema validation
 */
export async function generateBookPlan(inputs: BookInputs): Promise<BookPlan> {
    try {
        const userPrompt = createUserPrompt(inputs);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // Or 'gpt-4-turbo' / 'gpt-3.5-turbo' based on budget. gpt-4o is recommended for quality.
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' }, // Force JSON mode
            temperature: 0.7, // Creative but structured
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('OpenAI returned empty content');
        }

        // Parse JSON
        let rawJson;
        try {
            rawJson = JSON.parse(content);
        } catch (jsonError) {
            console.error('Failed to parse OpenAI JSON:', content);
            throw new Error('OpenAI did not return valid JSON');
        }

        // Validate Validation with Zod
        const validation = BookPlanSchema.safeParse(rawJson);
        if (!validation.success) {
            console.error('Book Plan validation failed:', validation.error);
            // In a real app, we might retry or try to fix the JSON. 
            // For MVP, we fail.
            throw new Error('Generated book plan failed validation: ' + validation.error.message);
        }

        return validation.data;

    } catch (error) {
        console.error('generateBookPlan Error:', error);
        throw error; // Re-throw to be handled by the caller
    }
}

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Default model for story generation
// gemini-1.5-flash is fast and cost-effective
// gemini-1.5-pro is more capable for complex tasks
export const STORY_MODEL = 'gemini-1.5-flash';

// Lazy initialization to avoid build-time errors
let _genAI: GoogleGenerativeAI | null = null;

/**
 * Get the Gemini AI client (lazy initialization)
 * Throws error at runtime if API key is missing
 */
function getGenAI(): GoogleGenerativeAI {
    if (_genAI) return _genAI;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Missing GEMINI_API_KEY environment variable. Get your key from https://aistudio.google.com/apikey');
    }

    _genAI = new GoogleGenerativeAI(apiKey);
    return _genAI;
}

/**
 * Get a generative model instance
 */
export function getModel(modelName: string = STORY_MODEL): GenerativeModel {
    return getGenAI().getGenerativeModel({ model: modelName });
}

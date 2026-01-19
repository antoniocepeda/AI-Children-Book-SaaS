import OpenAI from 'openai';


// Initialize OpenAI client
// Note: apiKey is strictly server-side. Next.js will not bundle generic env vars to client unless prefixed with NEXT_PUBLIC_.
// We access generated env types if generic, but here we use getRequiredEnvVar if we assume it's set.
// However `lib/config.ts` exports `demoId`. I should check if it exports a generic helper or if I should use process.env directly.
// In `lib/config.ts` I saw `getRequiredEnvVar` but it wasn't exported.
// I'll recheck `lib/config.ts` or just use process.env to avoid circular deps or private var issues.
// Safer to check process.env directly here for server-side key.

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
    apiKey: apiKey,
});

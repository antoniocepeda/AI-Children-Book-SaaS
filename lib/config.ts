/**
 * Application configuration
 * Validates and exports required environment variables
 */

/**
 * Demo namespace ID - used to isolate data in shared Firebase project
 * All Firestore documents and Storage files are stored under demos/{demoId}/...
 * 
 * Uses the NEXT_PUBLIC_ prefix so it's available on both client and server.
 * Falls back to a default in development to prevent build errors.
 */
export const demoId: string = process.env.NEXT_PUBLIC_DEMO_ID || (() => {
    // In development, provide helpful error. In production build, this would fail earlier.
    if (typeof window === 'undefined') {
        console.error(
            'Warning: NEXT_PUBLIC_DEMO_ID environment variable is not set. ' +
            'Please add it to your .env.local file.'
        );
    }
    return 'childrens-book-saas'; // Fallback default
})();

/**
 * Get a required environment variable (for server-side only vars)
 */
export function getRequiredEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(
            `Missing required environment variable: ${key}. ` +
            `Please check your .env.local file and ensure ${key} is set.`
        );
    }
    return value;
}

/**
 * App configuration object
 */
export const config = {
    demoId,
} as const;

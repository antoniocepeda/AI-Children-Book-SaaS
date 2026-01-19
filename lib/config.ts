/**
 * Application configuration
 * Validates and exports required environment variables
 */

function getRequiredEnvVar(key: string): string {
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
 * Demo namespace ID - used to isolate data in shared Firebase project
 * All Firestore documents and Storage files are stored under demos/{demoId}/...
 */
export const demoId = getRequiredEnvVar('DEMO_ID');

/**
 * App configuration object
 */
export const config = {
    demoId,
} as const;

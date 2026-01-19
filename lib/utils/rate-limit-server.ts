import { adminDb } from '../firebase/admin';
import { demoId } from '../config';

const DAILY_LIMIT = 3;

/**
 * Server-side check for daily book creation limit
 * Uses Firebase Admin SDK
 */
export async function hasReachedDailyLimitServer(ownerId: string): Promise<boolean> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
        const booksRef = adminDb.collection(`demos/${demoId}/books`);
        const snapshot = await booksRef
            .where('ownerId', '==', ownerId)
            .where('createdAt', '>=', twentyFourHoursAgo) // Admin SDK supports Date objects directly
            .get();

        const count = snapshot.size;
        return count >= DAILY_LIMIT;
    } catch (error) {
        console.error('Error checking daily limit (server):', error);
        return false; // Fail open
    }
}

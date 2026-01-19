import { query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getBooksCollection } from '../firebase/firestore';

const DAILY_LIMIT = 3;

/**
 * Check if a user has reached their daily book creation limit
 * @param ownerId The user's ID
 * @returns {Promise<boolean>} true if limit reached (>= 3 books in last 24h), false otherwise
 */
export async function hasReachedDailyLimit(ownerId: string): Promise<boolean> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const timestampThreshold = Timestamp.fromDate(twentyFourHoursAgo);

    try {
        const booksRef = getBooksCollection();
        const q = query(
            booksRef,
            where('ownerId', '==', ownerId),
            where('createdAt', '>=', timestampThreshold)
        );

        const snapshot = await getDocs(q);

        // Count documents
        const count = snapshot.size;

        return count >= DAILY_LIMIT;
    } catch (error) {
        console.error('Error checking daily limit:', error);
        // Default to allowing creation if check fails (fail open) vs blocking (fail closed)
        // For a prototype, fail open is often friendlier, but fail closed protects resources.
        // Given it's a free demo, fail closed might be better to prevent abuse, 
        // but simple error logging and returning false (allow) prevents blocking legit users due to transient query errors.
        // However, if the query fails, it's likely a permissions or network issue which would block creation anyway.
        // I'll return false here but log the error.
        return false;
    }
}

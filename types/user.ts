/**
 * Type definitions for Users
 */

/**
 * User document stored in Firestore
 */
export interface User {
    id: string;
    email: string;
    displayName?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * User creation data (for sign-up)
 */
export interface CreateUserData {
    email: string;
    displayName?: string;
}

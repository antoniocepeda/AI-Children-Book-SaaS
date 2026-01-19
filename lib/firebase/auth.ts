import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    Auth,
    User,
    UserCredential,
    NextOrObserver,
    Unsubscribe,
} from 'firebase/auth';
import { firebaseApp } from './config';

/**
 * Firebase Auth instance (singleton)
 */
export const auth: Auth = getAuth(firebaseApp);

/**
 * Sign up a new user with email and password
 * @param email - User's email address
 * @param password - User's password (min 6 characters for Firebase)
 * @returns Promise resolving to UserCredential on success
 * @throws FirebaseError on failure (e.g., email already in use, weak password)
 */
export async function signUp(
    email: string,
    password: string
): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in an existing user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to UserCredential on success
 * @throws FirebaseError on failure (e.g., wrong password, user not found)
 */
export async function signIn(
    email: string,
    password: string
): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user
 * @returns Promise resolving when sign out is complete
 */
export async function signOut(): Promise<void> {
    return firebaseSignOut(auth);
}

/**
 * Subscribe to authentication state changes
 * @param callback - Function called when auth state changes, receives User or null
 * @returns Unsubscribe function to stop listening
 * 
 * @example
 * const unsubscribe = onAuthStateChanged((user) => {
 *   if (user) {
 *     console.log('User is signed in:', user.uid);
 *   } else {
 *     console.log('User is signed out');
 *   }
 * });
 * 
 * // Later, to stop listening:
 * unsubscribe();
 */
export function onAuthStateChanged(
    callback: NextOrObserver<User | null>
): Unsubscribe {
    return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Get the currently signed-in user (synchronous, may be null if not yet determined)
 * Note: For reliable auth state, use onAuthStateChanged instead
 * @returns Current User or null if not signed in
 */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

/**
 * Get the ID token for the currently signed-in user
 * Used for authenticating API requests
 * @returns Promise resolving to ID token string, or null if not signed in
 */
export async function getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
}

// Re-export User type for convenience
export type { User, UserCredential };

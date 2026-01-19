'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from '../firebase/auth';

/**
 * Auth state returned by useAuth hook
 */
export interface AuthState {
    /** Current authenticated user, or null if not signed in */
    user: User | null;
    /** True while auth state is being determined */
    loading: boolean;
    /** Error message if auth state check failed */
    error: string | null;
}

/**
 * React hook for Firebase authentication state
 * 
 * Subscribes to auth state changes and provides:
 * - `user`: The current Firebase User object (or null)
 * - `loading`: Whether auth state is still being determined
 * - `error`: Any error that occurred during auth state resolution
 * 
 * @example
 * function MyComponent() {
 *   const { user, loading, error } = useAuth();
 * 
 *   if (loading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage message={error} />;
 *   if (!user) return <LoginPrompt />;
 * 
 *   return <div>Welcome, {user.email}!</div>;
 * }
 */
export function useAuth(): AuthState {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Subscribe to auth state changes
            const unsubscribe = onAuthStateChanged((firebaseUser) => {
                setUser(firebaseUser);
                setLoading(false);
                setError(null);
            });

            // Cleanup subscription on unmount
            return () => unsubscribe();
        } catch (authError) {
            // Handle subscription setup errors
            const errorMessage = authError instanceof Error
                ? authError.message
                : 'Authentication error occurred';
            console.error('Auth state error:', authError);
            setError(errorMessage);
            setLoading(false);
        }
    }, []);

    return { user, loading, error };
}

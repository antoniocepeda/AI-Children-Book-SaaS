'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthState } from '../hooks/useAuth';
import { signIn, signUp, signOut, User } from '../firebase/auth';
import { setDoc, serverTimestamp } from 'firebase/firestore';
import { getUserDoc } from '../firebase/firestore';

/**
 * Extended auth context value including auth actions
 */
export interface AuthContextValue extends AuthState {
    /** Sign in with email and password */
    signIn: (email: string, password: string) => Promise<void>;
    /** Sign up with email and password */
    signUp: (email: string, password: string) => Promise<void>;
    /** Sign out current user */
    signOut: () => Promise<void>;
}

/**
 * Auth context - provides auth state and actions to the app
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth provider props
 */
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Auth context provider component
 * Wraps the app to provide auth state and actions via context
 * 
 * @example
 * // In root layout:
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 * 
 * // In any component:
 * const { user, loading, signIn, signOut } = useAuthContext();
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const authState = useAuth();

    /**
     * Sign in handler - wraps Firebase signIn and handles errors
     */
    const handleSignIn = async (email: string, password: string): Promise<void> => {
        await signIn(email, password);
    };

    /**
     * Sign up handler - wraps Firebase signUp and handles errors
     */
    const handleSignUp = async (email: string, password: string): Promise<void> => {
        const credential = await signUp(email, password);

        // Create user document in Firestore
        if (credential.user) {
            const userRef = getUserDoc(credential.user.uid);
            await setDoc(userRef, {
                email: credential.user.email,
                createdAt: serverTimestamp(),
            });
        }
    };

    /**
     * Sign out handler - wraps Firebase signOut
     */
    const handleSignOut = async (): Promise<void> => {
        await signOut();
    };

    const value: AuthContextValue = {
        ...authState,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context
 * Must be used within an AuthProvider
 * 
 * @returns Auth context value with user state and actions
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * function ProfileButton() {
 *   const { user, signOut } = useAuthContext();
 *   
 *   if (!user) return null;
 *   
 *   return (
 *     <button onClick={signOut}>
 *       Sign out {user.email}
 *     </button>
 *   );
 * }
 */
export function useAuthContext(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuthContext must be used within an AuthProvider. ' +
            'Wrap your app with <AuthProvider> in the root layout.'
        );
    }

    return context;
}

// Re-export User type for convenience
export type { User };

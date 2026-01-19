'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/context/AuthContext';

/**
 * Props for the Providers component
 */
interface ProvidersProps {
    children: ReactNode;
}

/**
 * Providers wrapper component
 * Combines all context providers for the app
 * Must be a client component since it uses contexts
 * 
 * Currently includes:
 * - AuthProvider: Firebase authentication state and actions
 * 
 * @example
 * // In root layout:
 * <body>
 *   <Providers>{children}</Providers>
 * </body>
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}

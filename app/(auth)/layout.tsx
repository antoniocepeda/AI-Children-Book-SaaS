'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';

/**
 * Auth layout for login/signup pages
 * Redirects authenticated users to dashboard
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, loading } = useAuthContext();

    useEffect(() => {
        // If user is logged in, redirect to dashboard
        if (!loading && user) {
            router.replace('/dashboard');
        }
    }, [user, loading, router]);

    // Show loading spinner while checking auth state
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // If user is logged in, don't render children (redirect is happening)
    if (user) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Render auth pages for unauthenticated users
    return <>{children}</>;
}

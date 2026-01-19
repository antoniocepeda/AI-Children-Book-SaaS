'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';
import { Header } from '@/components/layout/Header';

/**
 * Protected layout for authenticated routes
 * Redirects unauthenticated users to login page
 */
export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, loading } = useAuthContext();

    useEffect(() => {
        // If user is not logged in, redirect to login
        if (!loading && !user) {
            router.replace('/login');
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

    // If user is not logged in, don't render children (redirect is happening)
    if (!user) {
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

    // Render protected pages for authenticated users
    return (
        <>
            <Header />
            <main>{children}</main>
        </>
    );
}

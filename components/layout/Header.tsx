'use client';

import Link from 'next/link';
import { useAuthContext } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui';
import styles from './Header.module.css';

/**
 * Header component for protected pages
 * Displays logo/title and user actions (logout)
 */
export function Header() {
    const { user, signOut } = useAuthContext();

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/dashboard" className={styles.logo}>
                    Storybook Magic
                </Link>

                <div className={styles.actions}>
                    {user && (
                        <span className={styles.userEmail}>
                            {user.email}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                    >
                        Sign out
                    </Button>
                </div>
            </div>
        </header>
    );
}

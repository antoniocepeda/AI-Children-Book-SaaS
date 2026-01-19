'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/lib/context/AuthContext';
import { Button, Input, ErrorMessage } from '@/components/ui';
import styles from './LoginForm.module.css';

/**
 * Login form component
 * Handles existing user authentication with email and password
 */
export function LoginForm() {
    const router = useRouter();
    const { signIn } = useAuthContext();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Map Firebase error codes to user-friendly messages
     */
    const getErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/user-not-found':
                return 'No account found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/invalid-credential':
                return 'Invalid email or password. Please check and try again.';
            default:
                return 'An error occurred during sign in. Please try again.';
        }
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await signIn(email, password);
            // Redirect to dashboard on success
            router.push('/dashboard');
        } catch (err) {
            const firebaseError = err as { code?: string };
            setError(getErrorMessage(firebaseError.code || ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.header}>
                <h1 className={styles.title}>Welcome back</h1>
                <p className={styles.subtitle}>
                    Sign in to continue creating magical stories
                </p>
            </div>

            {error && <ErrorMessage message={error} />}

            <div className={styles.fields}>
                <Input
                    type="email"
                    label="Email address"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                />

                <Input
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                />
            </div>

            <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
            >
                Sign in
            </Button>

            <p className={styles.footer}>
                Don&apos;t have an account?{' '}
                <Link href="/signup" className={styles.link}>
                    Create one
                </Link>
            </p>
        </form>
    );
}

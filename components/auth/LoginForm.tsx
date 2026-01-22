'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/lib/context/AuthContext';
import { Button, Input, ErrorMessage } from '@/components/ui';
import styles from './LoginForm.module.css';

/**
 * Login form component
 * Handles existing user authentication with email/username and password
 * Supports demo login with username "demo"
 */
export function LoginForm() {
    const router = useRouter();
    const { signIn } = useAuthContext();

    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Demo credentials - "demo" username maps to this email
    const DEMO_USERNAME = 'demo';
    const DEMO_EMAIL = 'demo@storybook.demo';

    /**
     * Convert username to email format if needed
     * If user types "demo", convert to demo@storybook.demo
     * Otherwise, assume it's already an email
     */
    const normalizeToEmail = (input: string): string => {
        const trimmed = input.trim().toLowerCase();
        if (trimmed === DEMO_USERNAME) {
            return DEMO_EMAIL;
        }
        // If no @ symbol, could be a username - append demo domain
        if (!trimmed.includes('@')) {
            return `${trimmed}@storybook.demo`;
        }
        return trimmed;
    };

    /**
     * Map Firebase error codes to user-friendly messages
     */
    const getErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Please enter a valid email or username.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/user-not-found':
                return 'No account found with this email or username.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/invalid-credential':
                return 'Invalid email/username or password. Please check and try again.';
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
            const email = normalizeToEmail(emailOrUsername);
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
                    type="text"
                    label="Email or username"
                    value={emailOrUsername}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmailOrUsername(e.target.value)}
                    placeholder="you@example.com or demo"
                    required
                    autoComplete="username"
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


'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/lib/context/AuthContext';
import { Button, Input, ErrorMessage } from '@/components/ui';
import styles from './SignupForm.module.css';

/**
 * Sign-up form component
 * Handles new user registration with email and password
 */
export function SignupForm() {
    const router = useRouter();
    const { signUp } = useAuthContext();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Map Firebase error codes to user-friendly messages
     */
    const getErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/operation-not-allowed':
                return 'Email/password sign up is not enabled.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            default:
                return 'An error occurred during sign up. Please try again.';
        }
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);

        try {
            await signUp(email, password);
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
                <h1 className={styles.title}>Create your account</h1>
                <p className={styles.subtitle}>
                    Start creating magical stories for your children
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
                    placeholder="At least 6 characters"
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                />

                <Input
                    type="password"
                    label="Confirm password"
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                />
            </div>

            <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
            >
                Create account
            </Button>

            <p className={styles.footer}>
                Already have an account?{' '}
                <Link href="/login" className={styles.link}>
                    Sign in
                </Link>
            </p>
        </form>
    );
}

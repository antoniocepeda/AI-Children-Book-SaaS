import { SignupForm } from '@/components/auth/SignupForm';
import styles from '../auth.module.css';

/**
 * Sign-up page
 * Allows new users to create an account
 */
export default function SignupPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <SignupForm />
            </div>
        </div>
    );
}

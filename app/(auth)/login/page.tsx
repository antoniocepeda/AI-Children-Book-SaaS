import { LoginForm } from '@/components/auth/LoginForm';
import styles from '../auth.module.css';

/**
 * Login page
 * Allows existing users to sign in to their account
 */
export default function LoginPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <LoginForm />
            </div>
        </div>
    );
}

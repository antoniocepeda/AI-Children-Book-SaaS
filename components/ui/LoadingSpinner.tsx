import styles from './LoadingSpinner.module.css';

export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    return (
        <div
            className={`${styles.spinner} ${styles[size]} ${className}`}
            role="status"
            aria-label="Loading"
        >
            <span className={styles.srOnly}>Loading...</span>
        </div>
    );
}

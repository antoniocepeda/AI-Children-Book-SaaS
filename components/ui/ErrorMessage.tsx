import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorMessage({
    title = 'Something went wrong',
    message,
    onRetry,
    className = '',
}: ErrorMessageProps) {
    return (
        <div className={`${styles.container} ${className}`} role="alert">
            <div className={styles.iconWrapper}>
                <svg
                    className={styles.icon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                {onRetry && (
                    <button onClick={onRetry} className={styles.retryButton}>
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
}

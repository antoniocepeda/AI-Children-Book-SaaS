'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            fullWidth = false,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        const classNames = [
            styles.button,
            styles[variant],
            styles[size],
            fullWidth ? styles.fullWidth : '',
            isLoading ? styles.loading : '',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <button
                ref={ref}
                className={classNames}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <span className={styles.spinner} aria-hidden="true" />}
                <span className={isLoading ? styles.hiddenText : ''}>{children}</span>
            </button>
        );
    }
);

Button.displayName = 'Button';

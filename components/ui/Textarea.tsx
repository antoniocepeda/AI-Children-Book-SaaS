'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css'; // Reuse Input styles for consistency

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, id, className = '', ...props }, ref) => {
        const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={styles.wrapper}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''} ${className}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${inputId}-error`} className={styles.error} role="alert">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${inputId}-helper`} className={styles.helperText}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

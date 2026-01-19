'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, helperText, options, placeholder, id, className = '', ...props }, ref) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={styles.wrapper}>
                {label && (
                    <label htmlFor={selectId} className={styles.label}>
                        {label}
                    </label>
                )}
                <div className={styles.selectWrapper}>
                    <select
                        ref={ref}
                        id={selectId}
                        className={`${styles.select} ${error ? styles.selectError : ''} ${className}`}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <span className={styles.arrow} aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </div>
                {error && (
                    <p id={`${selectId}-error`} className={styles.error} role="alert">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${selectId}-helper`} className={styles.helperText}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

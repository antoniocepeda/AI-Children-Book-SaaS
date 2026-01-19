'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Textarea, ErrorMessage } from '@/components/ui';
import { BookInputsSchema, BookInputs, AgeRangeSchema, ToneSchema } from '@/lib/validators/book-plan';
import styles from './BookForm.module.css';

export function BookForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BookInputs>({
        resolver: zodResolver(BookInputsSchema),
        defaultValues: {
            characterCount: 3,
            tone: 'adventurous',
            ageRange: '3-5',
        },
    });

    const onSubmit = async (data: BookInputs) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                // Try to parse detailed error message
                let errorMessage = 'Failed to create book';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // unexpected error format
                }

                if (response.status === 429) {
                    errorMessage = 'You have reached the daily limit of 3 books. Please try again tomorrow.';
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();

            // Redirect to book preview/progress page
            if (result.bookId) {
                router.push(`/books/${result.bookId}`);
            } else {
                throw new Error('No book ID returned from server');
            }
        } catch (error) {
            console.error('Error creating book:', error);
            setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.sectionTitle}>Book Details</div>

            <div className={styles.fieldGroup}>
                <Input
                    label="Child's Name"
                    placeholder="e.g. Leo"
                    error={errors.childName?.message}
                    {...register('childName')}
                />

                <Select
                    label="Age Range"
                    options={[
                        { value: '3-5', label: '3-5 years' },
                        { value: '6-8', label: '6-8 years' },
                        { value: '9-12', label: '9-12 years' },
                    ]}
                    error={errors.ageRange?.message}
                    {...register('ageRange')}
                />
            </div>

            <div className={styles.fieldGroup}>
                <Select
                    label="Theme"
                    options={[
                        { value: 'adventure', label: 'Adventure' },
                        { value: 'friendship', label: 'Friendship' },
                        { value: 'learning', label: 'Learning' },
                        { value: 'fantasy', label: 'Fantasy' },
                        { value: 'animals', label: 'Animals' },
                        { value: 'family', label: 'Family' },
                        { value: 'nature', label: 'Nature' },
                        { value: 'space', label: 'Space' },
                    ]}
                    error={errors.theme?.message}
                    {...register('theme')}
                />

                <Select
                    label="Tone"
                    options={[
                        { value: 'silly', label: 'Silly & Fun' },
                        { value: 'warm', label: 'Warm & Cozy' },
                        { value: 'adventurous', label: 'Adventurous' },
                    ]}
                    error={errors.tone?.message}
                    {...register('tone')}
                />
            </div>

            <Input
                label="Setting"
                placeholder="e.g. A magical forest, outer space, a busy city"
                error={errors.setting?.message}
                {...register('setting')}
            />

            <div className={styles.fieldGroup}>
                <Select
                    label="Number of Characters"
                    options={[
                        { value: '3', label: '3 Characters' },
                        { value: '4', label: '4 Characters' },
                        { value: '5', label: '5 Characters' },
                    ]}
                    // Convert value to number for Zod validation logic if needed, 
                    // but standard Select returns string. Zod schema for characterCount expects number (3|4|5).
                    // We need to use valueAsNumber or handle manually.
                    {...register('characterCount', { valueAsNumber: true })}
                    error={errors.characterCount?.message}
                />
            </div>

            <Textarea
                label="Special Detail (Optional)"
                placeholder="e.g. Loves dinosaurs, has a blue hat, favorite color is red"
                error={errors.specialDetail?.message}
                {...register('specialDetail')}
                className={styles.fullWidth}
            />

            {submitError && <ErrorMessage message={submitError} />}

            <div className={styles.actions}>
                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    fullWidth
                    size="lg"
                >
                    Create Story
                </Button>
            </div>
        </form>
    );
}

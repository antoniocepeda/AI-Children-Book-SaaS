'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firestore';
import { demoId } from '@/lib/config';
import Link from 'next/link';
import styles from './ProgressTracker.module.css';

interface ProgressTrackerProps {
    bookId: string;
}

interface BookProgress {
    story: 'pending' | 'generating' | 'complete' | 'failed';
    images: 'pending' | 'generating' | 'complete' | 'failed';
    pdf: 'pending' | 'generating' | 'complete' | 'failed';
}

interface BookData {
    title?: string;
    status: string;
    progress?: BookProgress;
    errorMessage?: string;
}

const STEP_INFO = {
    story: {
        title: 'Writing Your Story',
        description: 'Creating characters, plot, and pages...',
        icon: '✍️',
    },
    images: {
        title: 'Illustrating Pages',
        description: 'Generating beautiful artwork for each page...',
        icon: '🎨',
    },
    pdf: {
        title: 'Creating Your Book',
        description: 'Assembling the final PDF...',
        icon: '📚',
    },
};

type StepKey = 'story' | 'images' | 'pdf';

export default function ProgressTracker({ bookId }: ProgressTrackerProps) {
    const [bookData, setBookData] = useState<BookData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to book document changes
        const bookRef = doc(db, `demos/${demoId}/books/${bookId}`);

        const unsubscribe = onSnapshot(bookRef, (snapshot) => {
            if (snapshot.exists()) {
                setBookData(snapshot.data() as BookData);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error listening to book:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [bookId]);

    if (loading) {
        return (
            <div className={styles.progressTracker}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Loading...</h2>
                </div>
            </div>
        );
    }

    if (!bookData) {
        return (
            <div className={styles.progressTracker}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Book Not Found</h2>
                    <p className={styles.subtitle}>We couldn&apos;t find this book.</p>
                </div>
            </div>
        );
    }

    const progress = bookData.progress || {
        story: 'pending',
        images: 'pending',
        pdf: 'pending',
    };

    const isComplete = bookData.status === 'complete';
    const isFailed = bookData.status === 'failed';

    const getStepClass = (step: StepKey): string => {
        const status = progress[step];
        return `${styles.step} ${styles[status]}`;
    };

    const renderStepIcon = (step: StepKey) => {
        const status = progress[step];
        const info = STEP_INFO[step];

        if (status === 'generating') {
            return <div className={styles.spinner} />;
        }
        if (status === 'complete') {
            return '✓';
        }
        if (status === 'failed') {
            return '✕';
        }
        return info.icon;
    };

    return (
        <div className={styles.progressTracker}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    {isComplete ? '🎉 Book Complete!' : isFailed ? '❌ Generation Failed' : 'Creating Your Book...'}
                </h2>
                {bookData.title && (
                    <p className={styles.subtitle}>&quot;{bookData.title}&quot;</p>
                )}
            </div>

            <div className={styles.steps}>
                {(['story', 'images', 'pdf'] as StepKey[]).map((step) => (
                    <div key={step} className={getStepClass(step)}>
                        <div className={styles.iconWrapper}>
                            {renderStepIcon(step)}
                        </div>
                        <div className={styles.stepContent}>
                            <div className={styles.stepTitle}>{STEP_INFO[step].title}</div>
                            <div className={styles.stepDescription}>
                                {progress[step] === 'complete'
                                    ? 'Complete!'
                                    : progress[step] === 'failed'
                                        ? 'Failed'
                                        : STEP_INFO[step].description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isFailed && bookData.errorMessage && (
                <div className={styles.errorMessage}>
                    {bookData.errorMessage}
                </div>
            )}

            {isComplete && (
                <div className={styles.completeActions}>
                    <Link href={`/books/${bookId}`} className={styles.viewButton}>
                        View Your Book
                    </Link>
                </div>
            )}
        </div>
    );
}

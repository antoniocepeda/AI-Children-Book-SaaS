'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firestore';
import { useAuthContext } from '@/lib/context/AuthContext';
import { Button, LoadingSpinner } from '@/components/ui';
import BookViewer from '@/components/preview/BookViewer';
import { Book, BookStatus } from '@/types/book';
import { demoId } from '@/lib/config';
import styles from './page.module.css';

/**
 * Get status info for display
 */
function getStatusInfo(status: BookStatus): { label: string; description: string; icon: string } {
    switch (status) {
        case 'draft':
            return { label: 'Draft', description: 'Book creation started', icon: '📝' };
        case 'generating_story':
            return { label: 'Writing Story', description: 'AI is crafting your unique story...', icon: '✍️' };
        case 'generating_images':
            return { label: 'Creating Art', description: 'Generating beautiful illustrations...', icon: '🎨' };
        case 'generating_pdf':
            return { label: 'Building PDF', description: 'Assembling your book for download...', icon: '📄' };
        case 'complete':
            return { label: 'Complete', description: 'Your book is ready!', icon: '✅' };
        case 'failed':
            return { label: 'Failed', description: 'Something went wrong', icon: '❌' };
        default:
            return { label: status, description: '', icon: '⏳' };
    }
}

/**
 * Book preview/progress page
 */
export default function BookPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthContext();
    const bookId = params.bookId as string;

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !bookId) return;

        // Real-time listener for book updates
        const bookRef = doc(db, `demos/${demoId}/books/${bookId}`);

        const unsubscribe = onSnapshot(bookRef, (snapshot) => {
            if (!snapshot.exists()) {
                setError('Book not found');
                setLoading(false);
                return;
            }

            const data = snapshot.data() as Omit<Book, 'id'>;

            // Verify ownership
            if (data.ownerId !== user.uid) {
                setError('You do not have permission to view this book');
                setLoading(false);
                return;
            }

            setBook({ id: snapshot.id, ...data });
            setLoading(false);
        }, (err) => {
            console.error('Error fetching book:', err);
            setError('Failed to load book');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, bookId]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorIcon}>😕</div>
                <h1>{error || 'Book not found'}</h1>
                <Link href="/dashboard">
                    <Button>Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const statusInfo = getStatusInfo(book.status);
    const isGenerating = ['generating_story', 'generating_images', 'generating_pdf'].includes(book.status);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/dashboard" className={styles.backLink}>
                    ← Back to My Books
                </Link>
            </div>

            {/* Book Info */}
            <div className={styles.bookHeader}>
                <div className={styles.coverPreview}>
                    {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt={book.title} className={styles.coverImage} />
                    ) : (
                        <div className={styles.placeholderCover}>
                            <span>📖</span>
                        </div>
                    )}
                </div>
                <div className={styles.bookInfo}>
                    <h1 className={styles.title}>{book.title || `${book.inputs.childName}'s Story`}</h1>
                    <p className={styles.meta}>
                        Theme: {book.inputs.theme} • Age: {book.inputs.ageRange} • Setting: {book.inputs.setting}
                    </p>
                    {book.summary && (
                        <p className={styles.summary}>{book.summary}</p>
                    )}
                </div>
            </div>

            {/* Status Card */}
            <div className={`${styles.statusCard} ${isGenerating ? styles.generating : ''}`}>
                <div className={styles.statusIcon}>{statusInfo.icon}</div>
                <div className={styles.statusInfo}>
                    <h2 className={styles.statusLabel}>{statusInfo.label}</h2>
                    <p className={styles.statusDescription}>{statusInfo.description}</p>
                </div>
                {isGenerating && (
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} />
                    </div>
                )}
            </div>

            {/* Error Message */}
            {book.status === 'failed' && book.errorMessage && (
                <div className={styles.errorCard}>
                    <strong>Error:</strong> {book.errorMessage}
                </div>
            )}

            {/* Book Viewer - Show when images are complete */}
            {(book.status === 'complete' || book.status === 'generating_pdf') && (
                <BookViewer bookId={bookId} bookTitle={book.title} />
            )}

            {/* Actions */}
            <div className={styles.actions}>
                {book.status === 'complete' && book.pdfUrl && (
                    <a href={book.pdfUrl} download>
                        <Button size="lg">📥 Download PDF</Button>
                    </a>
                )}
                <Link href="/create">
                    <Button variant="secondary" size="lg">Create Another Book</Button>
                </Link>
            </div>

            {/* Book Details */}
            <div className={styles.details}>
                <h3>Book Details</h3>
                <dl className={styles.detailsList}>
                    <div>
                        <dt>Child&apos;s Name</dt>
                        <dd>{book.inputs.childName}</dd>
                    </div>
                    <div>
                        <dt>Age Range</dt>
                        <dd>{book.inputs.ageRange}</dd>
                    </div>
                    <div>
                        <dt>Theme</dt>
                        <dd>{book.inputs.theme}</dd>
                    </div>
                    <div>
                        <dt>Setting</dt>
                        <dd>{book.inputs.setting}</dd>
                    </div>
                    <div>
                        <dt>Tone</dt>
                        <dd>{book.inputs.tone}</dd>
                    </div>
                    {book.inputs.specialDetail && (
                        <div>
                            <dt>Special Detail</dt>
                            <dd>{book.inputs.specialDetail}</dd>
                        </div>
                    )}
                </dl>
            </div>
        </div>
    );
}

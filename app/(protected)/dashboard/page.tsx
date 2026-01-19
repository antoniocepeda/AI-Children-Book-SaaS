'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/lib/context/AuthContext';
import { getBooksCollection } from '@/lib/firebase/firestore';
import { query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Button, LoadingSpinner } from '@/components/ui';
import { Book, BookStatus } from '@/types/book';
import styles from './page.module.css';

/**
 * Get a human-readable status label
 */
function getStatusLabel(status: BookStatus): string {
    switch (status) {
        case 'draft':
            return 'Draft';
        case 'generating_story':
            return 'Writing Story...';
        case 'generating_images':
            return 'Creating Art...';
        case 'generating_pdf':
            return 'Building PDF...';
        case 'complete':
            return 'Complete';
        case 'failed':
            return 'Failed';
        default:
            return status;
    }
}

/**
 * Get status badge color class
 */
function getStatusClass(status: BookStatus): string {
    switch (status) {
        case 'complete':
            return styles.statusComplete ?? '';
        case 'failed':
            return styles.statusFailed ?? '';
        case 'draft':
            return styles.statusDraft ?? '';
        default:
            return styles.statusGenerating ?? '';
    }
}

/**
 * Dashboard page - My Books
 * Shows user's created books and allows creating new ones
 */
export default function DashboardPage() {
    const { user } = useAuthContext();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Query books owned by this user
        const booksRef = getBooksCollection();
        const q = query(
            booksRef,
            where('ownerId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        // Real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const booksData: Book[] = snapshot.docs.map((doc) => {
                const data = doc.data() as Omit<Book, 'id'>;
                return {
                    id: doc.id,
                    ...data,
                };
            });
            setBooks(booksData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching books:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>My Books</h1>
                    <p className={styles.subtitle}>
                        Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
                    </p>
                </div>
                <Link href="/create">
                    <Button>+ Create New Book</Button>
                </Link>
            </header>

            {books.length === 0 ? (
                /* Empty state - no books yet */
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📚</div>
                    <h2 className={styles.emptyTitle}>No books yet</h2>
                    <p className={styles.emptyText}>
                        Create your first personalized children&apos;s book and watch the magic happen!
                    </p>
                    <Link href="/create">
                        <Button size="lg">Create Your First Book</Button>
                    </Link>
                </div>
            ) : (
                /* Book grid */
                <div className={styles.bookGrid}>
                    {books.map((book) => (
                        <div key={book.id} className={styles.bookCard}>
                            <div className={styles.bookCover}>
                                {book.coverImageUrl ? (
                                    <img 
                                        src={book.coverImageUrl} 
                                        alt={book.title} 
                                        className={styles.coverImage}
                                    />
                                ) : (
                                    <div className={styles.placeholderCover}>
                                        📖
                                    </div>
                                )}
                                <span className={`${styles.statusBadge} ${getStatusClass(book.status)}`}>
                                    {getStatusLabel(book.status)}
                                </span>
                            </div>
                            <div className={styles.bookInfo}>
                                <h3 className={styles.bookTitle}>
                                    {book.title || `${book.inputs.childName}'s Story`}
                                </h3>
                                <p className={styles.bookMeta}>
                                    {book.inputs.theme} • {book.inputs.ageRange}
                                </p>
                                <div className={styles.bookActions}>
                                    {book.status === 'complete' ? (
                                        <>
                                            <Link href={`/books/${book.id}`}>
                                                <Button size="sm" variant="secondary">View</Button>
                                            </Link>
                                            {book.pdfUrl && (
                                                <a href={book.pdfUrl} download>
                                                    <Button size="sm">Download</Button>
                                                </a>
                                            )}
                                        </>
                                    ) : book.status === 'failed' ? (
                                        <span className={styles.errorText}>
                                            {book.errorMessage || 'Generation failed'}
                                        </span>
                                    ) : (
                                        <Link href={`/books/${book.id}`}>
                                            <Button size="sm" variant="secondary">View Progress</Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

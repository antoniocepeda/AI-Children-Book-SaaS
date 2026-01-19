'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firestore';
import { demoId } from '@/lib/config';
import PageCard from './PageCard';
import styles from './BookViewer.module.css';

interface Page {
    id: string;
    pageNumber: number;
    text: string;
    imageUrl?: string;
    imageStatus: string;
}

interface BookViewerProps {
    bookId: string;
    bookTitle: string;
}

/**
 * BookViewer - Flipbook-style page viewer
 * Displays cover first, then pages 1-10 with navigation
 */
export default function BookViewer({ bookId, bookTitle }: BookViewerProps) {
    const [pages, setPages] = useState<Page[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to pages subcollection
        const pagesRef = collection(db, `demos/${demoId}/books/${bookId}/pages`);
        const q = query(pagesRef, orderBy('pageNumber', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const pagesData: Page[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Page[];

            setPages(pagesData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching pages:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [bookId]);

    if (loading) {
        return (
            <div className={styles.loading}>
                Loading book pages...
            </div>
        );
    }

    if (pages.length === 0) {
        return (
            <div className={styles.loading}>
                No pages found. The book may still be generating.
            </div>
        );
    }

    const currentPageData = pages[currentPage];
    const totalPages = pages.length;

    // Guard against undefined currentPageData
    if (!currentPageData) {
        return (
            <div className={styles.loading}>
                Page not found.
            </div>
        );
    }

    const goToPrevious = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className={styles.bookViewer}>
            {/* Main Page Display */}
            <div className={styles.pageContainer}>
                <PageCard
                    pageNumber={currentPageData.pageNumber}
                    imageUrl={currentPageData.imageUrl}
                    text={currentPageData.text}
                    isLoading={currentPageData.imageStatus === 'generating'}
                />
            </div>

            {/* Navigation Controls */}
            <div className={styles.navigation}>
                <button
                    className={styles.navButton}
                    onClick={goToPrevious}
                    disabled={currentPage === 0}
                    aria-label="Previous page"
                >
                    ←
                </button>

                <span className={styles.pageIndicator}>
                    {currentPageData.pageNumber === 0
                        ? 'Cover'
                        : `Page ${currentPageData.pageNumber} of 10`}
                </span>

                <button
                    className={styles.navButton}
                    onClick={goToNext}
                    disabled={currentPage === totalPages - 1}
                    aria-label="Next page"
                >
                    →
                </button>
            </div>

            {/* Thumbnail Strip */}
            <div className={styles.thumbnails}>
                {pages.map((page, index) => (
                    <button
                        key={page.id}
                        className={`${styles.thumbnail} ${index === currentPage ? styles.active : ''}`}
                        onClick={() => setCurrentPage(index)}
                        aria-label={page.pageNumber === 0 ? 'Go to cover' : `Go to page ${page.pageNumber}`}
                    >
                        {page.imageUrl ? (
                            <img src={page.imageUrl} alt="" />
                        ) : (
                            <div className={styles.thumbnailPlaceholder}>
                                {page.pageNumber === 0 ? '📖' : page.pageNumber}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

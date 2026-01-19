'use client';

import styles from './PageCard.module.css';

interface PageCardProps {
    pageNumber: number;
    imageUrl?: string;
    text: string;
    isLoading?: boolean;
}

/**
 * PageCard component - displays a single book page with image and text
 */
export default function PageCard({ pageNumber, imageUrl, text, isLoading }: PageCardProps) {
    const isCover = pageNumber === 0;

    return (
        <div className={`${styles.pageCard} ${isCover ? styles.cover : ''} ${isLoading ? styles.loading : ''}`}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={isCover ? 'Book Cover' : `Page ${pageNumber}`}
                    className={styles.pageImage}
                />
            ) : (
                <div className={styles.placeholderImage}>
                    {isLoading ? '⏳' : '📖'}
                </div>
            )}

            <div className={styles.textOverlay}>
                <div className={styles.pageNumber}>
                    {isCover ? 'Cover' : `Page ${pageNumber}`}
                </div>
                <p className={styles.pageText}>{text}</p>
            </div>
        </div>
    );
}

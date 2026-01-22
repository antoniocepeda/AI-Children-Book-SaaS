/**
 * Type definitions for Books
 */

/**
 * Book status during generation pipeline
 */
export type BookStatus =
    | 'draft'
    | 'generating_story'
    | 'generating_images'
    | 'generating_pdf'
    | 'complete'
    | 'failed';

/**
 * Age range options for children's books
 */
export type AgeRange = '3-5' | '6-8' | '9-12';

/**
 * Book theme options
 */
export type BookTheme =
    | 'adventure'
    | 'friendship'
    | 'learning'
    | 'fantasy'
    | 'animals'
    | 'family'
    | 'nature'
    | 'space';

/**
 * Character in a book
 */
export interface Character {
    id: string;
    name: string;
    description: string;
    visualSignature: string; // Detailed visual description for image consistency
    role: 'protagonist' | 'supporting' | 'antagonist';
    imageUrl?: string; // Reference image URL (legacy)
    refImageUrls?: string[]; // Canonical reference images for character consistency
    refStatus?: 'pending' | 'generating' | 'complete' | 'failed';
}

/**
 * A single page in a book
 */
export interface Page {
    id: string;
    pageNumber: number; // 0 for cover, 1-10 for content
    text: string;
    sceneDescription: string;
    characterIds: string[]; // Characters appearing on this page
    imageUrl?: string;
    imageStatus: 'pending' | 'generating' | 'complete' | 'failed';
}

/**
 * The generated book plan from OpenAI
 */
export interface BookPlan {
    title: string;
    summary: string;
    characters: Omit<Character, 'id' | 'imageUrl'>[];
    pages: Omit<Page, 'id' | 'imageUrl' | 'imageStatus'>[];
}

/**
 * User inputs for creating a book
 */
export interface BookInputs {
    childName: string;
    ageRange: AgeRange;
    theme: string; // Allow flexible theme or use BookTheme
    setting: string;
    tone: 'silly' | 'warm' | 'adventurous';
    characterCount: 3 | 4 | 5;
    specialDetail?: string; // Optional special element to include
}

/**
 * Complete book document stored in Firestore
 */
export interface Book {
    id: string;
    demoId: string;
    ownerId: string;
    inputs: BookInputs;
    title: string;
    summary?: string;
    coverImageUrl?: string;
    pdfUrl?: string;
    status: BookStatus;
    errorMessage?: string;
    createdAt: Date | any; // Timestamp
    updatedAt: Date | any; // Timestamp
    generationVersion: number;
    progress?: {
        story: 'pending' | 'generating' | 'complete' | 'failed';
        characterRefs: 'pending' | 'generating' | 'complete' | 'failed';
        images: 'pending' | 'generating' | 'complete' | 'failed';
        pdf: 'pending' | 'generating' | 'complete' | 'failed';
    };
    storyModel?: string;
    storyRequestId?: string;
}

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
export type AgeRange = '2-4' | '4-6' | '6-8' | '8-10';

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
}

/**
 * A single page in a book
 */
export interface Page {
    id: string;
    pageNumber: number; // 1-10
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
    characters: Omit<Character, 'id'>[];
    pages: Omit<Page, 'id' | 'imageUrl' | 'imageStatus'>[];
}

/**
 * User inputs for creating a book
 */
export interface BookInputs {
    childName: string;
    ageRange: AgeRange;
    theme: BookTheme;
    setting: string;
    tone: 'playful' | 'educational' | 'adventurous' | 'calm';
    characterCount: 1 | 2 | 3;
    specialDetail?: string; // Optional special element to include
}

/**
 * Complete book document stored in Firestore
 */
export interface Book {
    id: string;
    ownerId: string;
    inputs: BookInputs;
    title: string;
    summary?: string;
    coverImageUrl?: string;
    pdfUrl?: string;
    status: BookStatus;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

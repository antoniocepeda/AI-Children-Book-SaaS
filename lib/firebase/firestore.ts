import {
    getFirestore,
    collection,
    doc,
    CollectionReference,
    DocumentReference,
    Firestore,
} from 'firebase/firestore';
import { firebaseApp } from './config';
import { demoId } from '../config';

/**
 * Firestore instance
 */
export const db: Firestore = getFirestore(firebaseApp);

/**
 * Base path for all namespaced collections
 * All data lives under demos/{demoId}/...
 */
const basePath = `demos/${demoId}`;

/**
 * Collection names within the demo namespace
 */
export const COLLECTIONS = {
    BOOKS: 'books',
    CHARACTERS: 'characters',
    PAGES: 'pages',
    JOBS: 'jobs',
    USERS: 'users',
} as const;

/**
 * Get a reference to a namespaced collection
 * All collections are stored under demos/{demoId}/...
 */
export function getCollection<T = unknown>(collectionName: string): CollectionReference<T> {
    return collection(db, basePath, collectionName) as CollectionReference<T>;
}

/**
 * Get a reference to a document in a namespaced collection
 */
export function getDoc<T = unknown>(collectionName: string, docId: string): DocumentReference<T> {
    return doc(db, basePath, collectionName, docId) as DocumentReference<T>;
}

/**
 * Get a reference to a subcollection within a document
 * Path: demos/{demoId}/{parentCollection}/{parentDocId}/{subcollectionName}
 */
export function getSubcollection<T = unknown>(
    parentCollection: string,
    parentDocId: string,
    subcollectionName: string
): CollectionReference<T> {
    return collection(
        db,
        basePath,
        parentCollection,
        parentDocId,
        subcollectionName
    ) as CollectionReference<T>;
}

/**
 * Get a reference to a document in a subcollection
 */
export function getSubdoc<T = unknown>(
    parentCollection: string,
    parentDocId: string,
    subcollectionName: string,
    docId: string
): DocumentReference<T> {
    return doc(
        db,
        basePath,
        parentCollection,
        parentDocId,
        subcollectionName,
        docId
    ) as DocumentReference<T>;
}

// ============================================
// Typed collection helpers for specific entities
// ============================================

/**
 * Books collection reference
 */
export function getBooksCollection() {
    return getCollection(COLLECTIONS.BOOKS);
}

/**
 * Single book document reference
 */
export function getBookDoc(bookId: string) {
    return getDoc(COLLECTIONS.BOOKS, bookId);
}

/**
 * Characters subcollection for a book
 */
export function getCharactersCollection(bookId: string) {
    return getSubcollection(COLLECTIONS.BOOKS, bookId, COLLECTIONS.CHARACTERS);
}

/**
 * Pages subcollection for a book
 */
export function getPagesCollection(bookId: string) {
    return getSubcollection(COLLECTIONS.BOOKS, bookId, COLLECTIONS.PAGES);
}

/**
 * Users collection reference
 */
export function getUsersCollection() {
    return getCollection(COLLECTIONS.USERS);
}

/**
 * Single user document reference
 */
export function getUserDoc(userId: string) {
    return getDoc(COLLECTIONS.USERS, userId);
}

/**
 * Jobs collection reference (for background processing)
 */
export function getJobsCollection() {
    return getCollection(COLLECTIONS.JOBS);
}

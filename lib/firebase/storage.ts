import {
    getStorage,
    ref,
    uploadBytes,
    uploadString,
    getDownloadURL,
    StorageReference,
    UploadResult,
} from 'firebase/storage';
import { firebaseApp } from './config';
import { demoId } from '../config';

/**
 * Firebase Storage instance
 */
export const storage = getStorage(firebaseApp);

/**
 * Base path for all namespaced storage
 * All files live under demos/{demoId}/...
 */
const basePath = `demos/${demoId}`;

/**
 * Get a storage reference for a path within the namespace
 */
export function getStorageRef(path: string): StorageReference {
    return ref(storage, `${basePath}/${path}`);
}

/**
 * Get a storage reference for a book's assets
 * Path: demos/{demoId}/books/{bookId}/{filename}
 */
export function getBookStorageRef(bookId: string, filename: string): StorageReference {
    return ref(storage, `${basePath}/books/${bookId}/${filename}`);
}

/**
 * Get a storage reference for a book's page image
 * Path: demos/{demoId}/books/{bookId}/pages/{pageNumber}.webp
 */
export function getPageImageRef(bookId: string, pageNumber: number): StorageReference {
    return ref(storage, `${basePath}/books/${bookId}/pages/${pageNumber}.webp`);
}

/**
 * Get a storage reference for a book's cover image
 * Path: demos/{demoId}/books/{bookId}/cover.webp
 */
export function getCoverImageRef(bookId: string): StorageReference {
    return ref(storage, `${basePath}/books/${bookId}/cover.webp`);
}

/**
 * Get a storage reference for a book's PDF
 * Path: demos/{demoId}/books/{bookId}/{bookId}.pdf
 */
export function getPdfRef(bookId: string): StorageReference {
    return ref(storage, `${basePath}/books/${bookId}/${bookId}.pdf`);
}

/**
 * Upload a file (Blob/File) to storage
 * Returns the download URL
 */
export async function uploadFile(
    storageRef: StorageReference,
    file: Blob | Uint8Array | ArrayBuffer
): Promise<string> {
    const result: UploadResult = await uploadBytes(storageRef, file);
    return getDownloadURL(result.ref);
}

/**
 * Upload a base64 string to storage
 * Returns the download URL
 */
export async function uploadBase64(
    storageRef: StorageReference,
    base64String: string,
    contentType: string = 'image/webp'
): Promise<string> {
    const result: UploadResult = await uploadString(storageRef, base64String, 'base64', {
        contentType,
    });
    return getDownloadURL(result.ref);
}

/**
 * Upload a data URL to storage
 * Returns the download URL
 */
export async function uploadDataUrl(
    storageRef: StorageReference,
    dataUrl: string
): Promise<string> {
    const result: UploadResult = await uploadString(storageRef, dataUrl, 'data_url');
    return getDownloadURL(result.ref);
}

/**
 * Get the download URL for a storage reference
 */
export async function getFileUrl(storageRef: StorageReference): Promise<string> {
    return getDownloadURL(storageRef);
}

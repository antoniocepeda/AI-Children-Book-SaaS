import * as admin from 'firebase-admin';
import { demoId } from '@/lib/config';

// Get the storage bucket from Firebase Admin
function getStorageBucket() {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
        throw new Error('Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable');
    }
    return admin.storage().bucket(bucketName);
}

export interface UploadImageResult {
    storagePath: string;
    publicUrl: string;
}

/**
 * Download image from URL and upload to Firebase Storage
 * 
 * @param imageUrl - Source image URL (from Replicate)
 * @param bookId - Book ID for path organization
 * @param pageNumber - Page number for filename
 * @returns Storage path and public URL
 */
export async function uploadImageFromUrl(
    imageUrl: string,
    bookId: string,
    pageNumber: number
): Promise<UploadImageResult> {
    console.log(`[Upload] Downloading and uploading image for page ${pageNumber}...`);

    try {
        // Download image from Replicate
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Determine content type from response or default to webp
        const contentType = response.headers.get('content-type') || 'image/webp';
        const extension = contentType.includes('png') ? 'png' :
            contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'webp';

        // Build storage path under namespace
        const filename = pageNumber === 0 ? `cover.${extension}` : `page_${pageNumber}.${extension}`;
        const storagePath = `demos/${demoId}/books/${bookId}/pages/${filename}`;

        // Upload to Firebase Storage
        const bucket = getStorageBucket();
        const file = bucket.file(storagePath);

        await file.save(buffer, {
            metadata: {
                contentType,
                metadata: {
                    bookId,
                    pageNumber: String(pageNumber),
                    uploadedAt: new Date().toISOString(),
                },
            },
        });

        // Make the file publicly accessible
        await file.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

        console.log(`[Upload] Page ${pageNumber} uploaded to: ${storagePath}`);

        return {
            storagePath,
            publicUrl,
        };
    } catch (error) {
        console.error(`[Upload] Failed to upload image for page ${pageNumber}:`, error);
        throw error;
    }
}

/**
 * Upload cover image to Firebase Storage
 */
export async function uploadCoverImage(
    imageUrl: string,
    bookId: string
): Promise<UploadImageResult> {
    return uploadImageFromUrl(imageUrl, bookId, 0);
}

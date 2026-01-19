import { adminDb } from '@/lib/firebase/admin';
import { demoId } from '@/lib/config';
import { FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { jsPDF } from 'jspdf';

interface Page {
    id: string;
    pageNumber: number;
    text: string;
    imageUrl?: string;
}

/**
 * Fetch image and convert to base64 data URL
 */
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/webp';

    return `data:${contentType};base64,${base64}`;
}

/**
 * PDF generation workflow
 * Generates PDF from book pages and uploads to Firebase Storage
 * 
 * Flow:
 * 1. Update progress.pdf to 'generating'
 * 2. Fetch all pages from Firestore
 * 3. Generate PDF with images and text
 * 4. Upload PDF to Firebase Storage
 * 5. Update book with pdfUrl and status 'complete'
 */
export async function runPdfGeneration(bookId: string): Promise<void> {
    console.log(`[PDF Workflow] Starting PDF generation for book ${bookId}`);

    const bookRef = adminDb.doc(`demos/${demoId}/books/${bookId}`);

    try {
        // 1. Verify book and update progress
        const bookSnapshot = await bookRef.get();
        if (!bookSnapshot.exists) {
            throw new Error(`Book ${bookId} not found`);
        }

        const bookData = bookSnapshot.data();
        if (bookData?.status !== 'generating_pdf') {
            console.log(`[PDF Workflow] Book ${bookId} is not in generating_pdf status, skipping`);
            return;
        }

        await bookRef.update({
            'progress.pdf': 'generating',
            updatedAt: FieldValue.serverTimestamp(),
        });

        const title = bookData.title || 'My Story Book';

        // 2. Fetch all pages
        const pagesSnapshot = await bookRef.collection('pages').orderBy('pageNumber').get();
        const pages: Page[] = pagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Page[];

        console.log(`[PDF Workflow] Found ${pages.length} pages`);

        // 3. Generate PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const imageMaxWidth = pageWidth - (margin * 2);
        const imageMaxHeight = pageHeight - 60;

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            if (!page) continue; // Skip if undefined

            if (i > 0) {
                pdf.addPage();
            }

            // Add image if available
            if (page.imageUrl) {
                try {
                    console.log(`[PDF Workflow] Fetching image for page ${page.pageNumber}...`);
                    const imageData = await fetchImageAsBase64(page.imageUrl);

                    pdf.addImage(
                        imageData,
                        'WEBP',
                        margin,
                        margin,
                        imageMaxWidth,
                        imageMaxHeight,
                        undefined,
                        'MEDIUM'
                    );
                } catch (error) {
                    console.error(`[PDF Workflow] Failed to add image for page ${page.pageNumber}:`, error);
                }
            }

            // Add text
            const textY = pageHeight - 25;

            if (page.pageNumber > 0) {
                pdf.setFontSize(10);
                pdf.setTextColor(128);
                pdf.text(`Page ${page.pageNumber}`, pageWidth / 2, textY - 10, { align: 'center' });
            }

            pdf.setFontSize(page.pageNumber === 0 ? 16 : 12);
            pdf.setTextColor(0);
            const textLines = pdf.splitTextToSize(page.text, pageWidth - (margin * 2));
            pdf.text(textLines, pageWidth / 2, textY, { align: 'center' });
        }

        // 4. Upload to Firebase Storage
        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            throw new Error('Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
        }

        const bucket = admin.storage().bucket(bucketName);
        const pdfPath = `demos/${demoId}/books/${bookId}/${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        const file = bucket.file(pdfPath);

        await file.save(pdfBuffer, {
            metadata: {
                contentType: 'application/pdf',
                metadata: {
                    bookId,
                    title,
                    generatedAt: new Date().toISOString(),
                },
            },
        });

        await file.makePublic();
        const pdfUrl = `https://storage.googleapis.com/${bucket.name}/${pdfPath}`;

        console.log(`[PDF Workflow] PDF uploaded to: ${pdfUrl}`);

        // 5. Update book with pdfUrl and complete status
        await bookRef.update({
            pdfUrl,
            'progress.pdf': 'complete',
            status: 'complete',
            updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(`[PDF Workflow] Book ${bookId} is now complete!`);

    } catch (error) {
        console.error(`[PDF Workflow] Error generating PDF for book ${bookId}:`, error);

        try {
            await bookRef.update({
                status: 'failed',
                'progress.pdf': 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error during PDF generation',
                errorStage: 'pdf_generation',
                updatedAt: FieldValue.serverTimestamp(),
            });
        } catch (updateError) {
            console.error(`[PDF Workflow] Failed to update book status:`, updateError);
        }

        throw error;
    }
}

import { jsPDF } from 'jspdf';

interface PageData {
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

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert image to base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Generate a PDF from book pages
 * 
 * @param title - Book title
 * @param pages - Array of page data (cover + 10 pages)
 * @returns PDF as Blob
 */
export async function generatePdf(title: string, pages: PageData[]): Promise<Blob> {
    console.log(`[PDF Gen] Starting PDF generation for "${title}" with ${pages.length} pages`);

    // Create A4 PDF in portrait
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const imageMaxWidth = pageWidth - (margin * 2);
    const imageMaxHeight = pageHeight - 60; // Leave room for text

    // Sort pages by pageNumber
    const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);

    for (let i = 0; i < sortedPages.length; i++) {
        const page = sortedPages[i];
        if (!page) continue; // Skip if undefined

        // Add new page for all pages after the first
        if (i > 0) {
            pdf.addPage();
        }

        // Add image if available
        if (page.imageUrl) {
            try {
                const imageData = await fetchImageAsBase64(page.imageUrl);

                // Add image centered at top
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
                console.error(`[PDF Gen] Failed to add image for page ${page.pageNumber}:`, error);
                // Continue without image
            }
        }

        // Add text at bottom
        const textY = pageHeight - 25;

        // Page number label
        const pageLabel = page.pageNumber === 0 ? '' : `Page ${page.pageNumber}`;
        if (pageLabel) {
            pdf.setFontSize(10);
            pdf.setTextColor(128); // Gray
            pdf.text(pageLabel, pageWidth / 2, textY - 10, { align: 'center' });
        }

        // Page text
        pdf.setFontSize(page.pageNumber === 0 ? 16 : 12);
        pdf.setTextColor(0); // Black

        // Split text to fit page width
        const textLines = pdf.splitTextToSize(page.text, pageWidth - (margin * 2));
        pdf.text(textLines, pageWidth / 2, textY, { align: 'center' });
    }

    console.log(`[PDF Gen] PDF generation complete`);

    // Return as blob
    return pdf.output('blob');
}

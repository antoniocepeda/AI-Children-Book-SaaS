import { NextRequest, NextResponse } from 'next/server';
import { BookInputsSchema } from '@/lib/validators/book-plan';
import { hasReachedDailyLimitServer } from '@/lib/utils/rate-limit-server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { demoId } from '@/lib/config';
import { runStoryGeneration } from '@/lib/workflows/story-workflow';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Auth
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];
        if (!idToken) {
            return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
        }
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (authError) {
            console.error('Auth verification failed:', authError);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const ownerId = decodedToken.uid;

        // 2. Validate Inputs
        const body = await request.json();
        const validation = BookInputsSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid inputs', details: validation.error }, { status: 400 });
        }
        const inputs = validation.data;

        // 3. Check Rate Limit
        const limitReached = await hasReachedDailyLimitServer(ownerId);
        if (limitReached) {
            return NextResponse.json(
                { error: 'Daily limit reached. You can create up to 3 books per day.' },
                { status: 429 }
            );
        }

        // 4. Create Book Document
        // Path: demos/{demoId}/books/{bookId}
        const booksCollection = adminDb.collection(`demos/${demoId}/books`);
        const newBookRef = booksCollection.doc();
        const bookId = newBookRef.id;

        const initialBookData = {
            id: bookId,
            demoId,
            ownerId,
            inputs,
            title: inputs.theme ? `A ${inputs.theme} Story` : 'Untitled Story', // Temporary title
            status: 'generating_story',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            generationVersion: 1,
            progress: {
                story: 'pending',
                images: 'pending',
                pdf: 'pending',
            },
            // Schema fields
            errorMessage: null,
            storyModel: null,
            storyRequestId: null,
        };

        await newBookRef.set(initialBookData);

        // 5. Trigger Story Generation (Async)
        // We don't await this to keep the response fast? 
        // Vercel serverless functions might terminate if we return early.
        // But "Option A" said "return bookId immediately (don't wait context... or call internal function)".
        // If we await, it's safer on Vercel. 10s timeout is usually enough for a quick OpenAI call, but story generation might take longer.
        // Best practice on Vercel: use Inngest or background jobs.
        // For MVP: We accept that it might timeout if user closes? No, serverless runs until response or timeout. 
        // If we return, execution might freeze.
        // Recommendation: Use `waitUntil` if available (Next.js 15+ / Vercel specific).
        // Or just await the *start* or delegate to a separate route/function.
        // Task description said: "worker completes it. But if you're okay waiting a bit, generating story inline is fine."
        // I will trigger it without await, but note the risk. Or await it if it's fast logic (currently just stub).
        // The stub is instant.
        // When implemented, OpenAI call takes ~10-30s.
        // I'll call it without await but wrap in a try/catch to log errors if it runs. 
        // Note: On Vercel, "fire and forget" is unreliable without `waitUntil`.
        // I'll leave it as fire-and-forget for now (stub), but in production might need `waitUntil`.

        // Actually, runStoryGeneration is just a function.
        // I'll Execute it.
        runStoryGeneration(bookId, inputs).catch(err => console.error('Background generation failed:', err));

        return NextResponse.json({ bookId });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

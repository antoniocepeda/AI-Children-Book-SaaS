import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection
 * 
 * Note: Since we are using Firebase Auth (Client SDK) without session cookies,
 * strict authentication checks are handled client-side in:
 * - app/(protected)/layout.tsx (for protected routes)
 * - app/(auth)/layout.tsx (for auth routes like login/signup)
 * 
 * This middleware primarily serves to match and identify protected paths
 * for potential future server-side enhancements (e.g., if we add session cookies).
 */
export function middleware(request: NextRequest) {
    return NextResponse.next();
}

/**
 * Configure which routes should run this middleware
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * 1. api routes (handled separately)
         * 2. _next/static (static files)
         * 3. _next/image (image optimization files)
         * 4. favicon.ico (favicon file)
         * 5. public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

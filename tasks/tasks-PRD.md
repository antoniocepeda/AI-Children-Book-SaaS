# Tasks for AI Children's Book SaaS MVP

> Generated from `docs/PRD.md`

---

## Relevant Files

### Project Setup & Config
- `package.json` – Project dependencies and scripts
- `tsconfig.json` – TypeScript strict configuration
- `.eslintrc.json` – ESLint configuration
- `.prettierrc` – Prettier configuration
- `.env.local.example` – Environment variables template (Firebase, OpenAI, Replicate, DEMO_ID)
- `next.config.js` – Next.js configuration
- `lib/config.ts` – App configuration including demoId from env

### Firebase
- `lib/firebase/config.ts` – Firebase app initialization and config
- `lib/firebase/auth.ts` – Firebase Auth helper functions
- `lib/firebase/firestore.ts` – Firestore helper functions with namespaced collection refs under `demos/{demoId}/...`
- `lib/firebase/storage.ts` – Firebase Storage helper functions with namespaced paths under `demos/{demoId}/...`
- `firestore.rules` – Firestore security rules enforcing auth and namespace boundary
- `storage.rules` – Storage security rules enforcing auth and namespace boundary

### Types
- `types/book.ts` – Book, Character, Page, BookPlan types
- `types/user.ts` – User-related types

### Authentication
- `app/(auth)/login/page.tsx` – Login page
- `app/(auth)/signup/page.tsx` – Sign-up page
- `app/(auth)/layout.tsx` – Auth pages layout (redirect if logged in)
- `components/auth/LoginForm.tsx` – Login form component
- `components/auth/SignupForm.tsx` – Sign-up form component
- `lib/hooks/useAuth.ts` – Auth state hook with Firestore listener
- `middleware.ts` – Route protection middleware

### Book Creation
- `app/(protected)/create/page.tsx` – Create Book form page
- `components/create/BookForm.tsx` – Book creation form with all inputs
- `components/create/ProgressTracker.tsx` – Generation progress UI
- `app/api/books/route.ts` – POST endpoint to create book record
- `app/api/books/[bookId]/generate-story/route.ts` – Trigger story generation
- `lib/openai/client.ts` – OpenAI client configuration
- `lib/openai/prompts.ts` – Prompt templates for story/Book Plan generation
- `lib/openai/generate-book-plan.ts` – Book Plan generation logic

### Image Generation
- `app/api/books/[bookId]/generate-images/route.ts` – Trigger image generation
- `lib/replicate/client.ts` – Replicate client configuration
- `lib/replicate/generate-character-pack.ts` – Character pack/reference generation
- `lib/replicate/generate-page-image.ts` – Page image generation with character consistency
- `lib/utils/image-upload.ts` – Upload images to Firebase Storage

### Book Preview & PDF
- `app/(protected)/books/[bookId]/page.tsx` – Book preview page
- `components/preview/BookViewer.tsx` – Flipbook-style page viewer
- `components/preview/PageCard.tsx` – Individual page display (image + text)
- `lib/pdf/generate-pdf.ts` – PDF generation logic (cover + 10 pages)
- `app/api/books/[bookId]/pdf/route.ts` – PDF generation endpoint

### Dashboard
- `app/(protected)/dashboard/page.tsx` – My Books dashboard
- `components/dashboard/BookList.tsx` – List of user's books
- `components/dashboard/BookCard.tsx` – Book card with status, view, download actions

### Layout & Shared
- `app/layout.tsx` – Root layout with providers
- `app/(protected)/layout.tsx` – Protected routes layout (auth gate)
- `components/ui/Button.tsx` – Shared button component
- `components/ui/Input.tsx` – Shared input component
- `components/ui/Select.tsx` – Shared select component
- `components/ui/LoadingSpinner.tsx` – Loading indicator
- `components/ui/ErrorMessage.tsx` – Error display component

---

## Notes

- **No tests for v1** — focus on shipping. Tests can be added in a future iteration.
- **TypeScript strict mode** — all files should be fully typed; avoid `any`.
- **Server Components by default** — use `"use client"` only for interactive components (forms, listeners, click handlers).
- **Firestore listeners** — use `onSnapshot` in client components to watch generation progress in real-time.
- **API routes for secrets** — OpenAI and Replicate API keys must only be used server-side (API routes or Cloud Functions).
- **Rate limiting** — implement a simple per-user book creation cap to prevent cost spikes (e.g., max 3 books/day).
- **Error handling** — all provider calls (OpenAI, Replicate) should catch errors, update Firestore status to `failed`, and log details server-side.
- **Demo namespace** — this app runs in a shared Firebase project. All Firestore docs and Storage files MUST be under `demos/{demoId}/...` where `demoId` is configured via `DEMO_ID` env var (e.g., `childrens-book-saas`). Never write to root collections.
- **Security rules** — `firestore.rules` and `storage.rules` must enforce namespace boundaries. Users can only read/write under `demos/{demoId}/...` and only access their own books (`ownerId == request.auth.uid`).

---

## Tasks

- [x] 1.0 Project Setup & Infrastructure
  - [x] 1.1 Initialize Next.js 14+ project with App Router (`npx create-next-app@latest --typescript --app --eslint`)
  - [x] 1.2 Configure TypeScript strict mode in `tsconfig.json` (`"strict": true`, `"noUncheckedIndexedAccess": true`)
  - [x] 1.3 Set up Prettier and integrate with ESLint (install `prettier`, `eslint-config-prettier`)
  - [x] 1.4 Create `.env.local.example` with placeholders for Firebase, OpenAI, Replicate keys, and `DEMO_ID` (e.g., `childrens-book-saas`)
  - [x] 1.5 Create `lib/config.ts` exporting `demoId` from `DEMO_ID` env var with validation (throw if missing)
  - [x] 1.6 Install Firebase SDK (`firebase`) and configure in `lib/firebase/config.ts`
  - [x] 1.7 Create typed Firestore helper in `lib/firebase/firestore.ts` with namespaced collection references under `demos/{demoId}/...` for `books`, `characters`, `pages`, `jobs` (demoId from env config)
  - [x] 1.8 Create Firebase Storage helper in `lib/firebase/storage.ts` for image/PDF uploads under namespaced paths `demos/{demoId}/books/{bookId}/...`
  - [x] 1.9 Set up folder structure: `app/`, `lib/`, `components/`, `types/`
  - [x] 1.10 Create shared UI components: `Button`, `Input`, `Select`, `LoadingSpinner`, `ErrorMessage`
  - [x] 1.11 Create root layout (`app/layout.tsx`) with base HTML, fonts, and global styles
  - [x] 1.12 Create `firestore.rules` requiring auth and restricting reads/writes to `demos/{demoId}/...` paths (users can only access their own books via `ownerId == request.auth.uid`)
  - [x] 1.13 Create `storage.rules` requiring auth and restricting reads/writes to `demos/{demoId}/...` paths
  - [x] 1.14 Verify namespace enforcement: create a test book and confirm all Firestore docs exist under `demos/{demoId}/...` and all Storage files exist under `demos/{demoId}/...` — nothing at root

- [x] 2.0 Authentication System
  - [x] 2.1 Create Firebase Auth helpers in `lib/firebase/auth.ts` (signUp, signIn, signOut, onAuthStateChanged)
  - [x] 2.2 Create `useAuth` hook in `lib/hooks/useAuth.ts` that provides `user`, `loading`, `error` state
  - [x] 2.3 Create auth context provider and wrap app in root layout
  - [x] 2.4 Build sign-up page at `app/(auth)/signup/page.tsx` with `SignupForm` component
  - [x] 2.5 Build login page at `app/(auth)/login/page.tsx` with `LoginForm` component
  - [x] 2.6 Create auth layout `app/(auth)/layout.tsx` that redirects to dashboard if already logged in
  - [x] 2.7 Create protected layout `app/(protected)/layout.tsx` that redirects to login if not authenticated
  - [x] 2.8 Add middleware in `middleware.ts` for route protection (redirect unauthenticated users from `/dashboard`, `/create`, `/books/*`)
  - [x] 2.9 Create user document in Firestore on first sign-up (`users/{uid}` with email, createdAt)
  - [x] 2.10 Add logout button to protected layout header

- [x] 3.0 Book Creation Flow & Story Generation
  - [x] 3.0.1 Create demo config constant in `lib/config.ts` (expose `DEMO_ID` to shared client/server code)
  - [x] 3.0.2 Add Zod schemas in `lib/validators/book-plan.ts`: `BookInputsSchema`, `CharacterSchema`, `PageSchema` (enforce 11 pages), `BookPlanSchema`
  - [x] 3.0.3 Add daily creation limit (3/day) logic helper (count books created by ownerId in last 24h)
  - [x] 3.1 Define TypeScript types in `types/book.ts`: include `BookStatus` (draft, generating_story, generating_images, generating_pdf, complete, failed), `Book` (with demoId, ownerId, metadata) and path builder helpers
  - [x] 3.2 Build Create Book form page at `app/(protected)/create/page.tsx`
  - [x] 3.3 Create `BookForm` component with all PRD inputs: child name, age range, theme, setting, tone, character count, special detail (optional)
  - [x] 3.4 Create POST `/api/books` route (one-click creation + auto story generation):
    - [x] Validate request body with `BookInputsSchema` (Zod)
    - [x] Enforce daily creation cap (3/day)
    - [x] Create book doc at `demos/{DEMO_ID}/books/{bookId}` with status `generating_story`, metadata, and `generationVersion: 1`
    - [x] Auto-trigger story generation server-side (call internal `runStoryGeneration`)
    - [x] Return `{ bookId }` immediately
  - [x] 3.5 Install OpenAI SDK (`openai`) and create client in `lib/openai/client.ts`
  - [x] 3.6 Create prompt templates in `lib/openai/prompts.ts`:
    - [x] Enforce output as strict JSON
    - [x] Enforce exactly 11 pages (cover + 10)
    - [x] Enforce reading level rules (sentence count/vocab based on age)
  - [x] 3.7 Create `generateBookPlan` function in `lib/openai/generate-book-plan.ts` (strict JSON + Zod validation):
    - [x] Call OpenAI with strict requirements
    - [x] Parse and validate with `BookPlanSchema.safeParse()`
    - [x] Enforce logical constraints (cover exists, pages continuous)
    - [x] Throw structured error on failure
  - [x] 3.8 Update `runStoryGeneration` (or internal logic) to:
    - [x] Verify book is under `demos/{DEMO_ID}`
    - [x] Generate + validate plan
    - [x] Write title, `characters` subcollection, `pages` subcollection
    - [x] Update status to `generating_images` on success
  - [x] 3.9 Update book status workflow to match new enum: `generating_story` → `generating_images` → `generating_pdf` → `complete` (or `failed`)
  - [x] 3.10 Build `ProgressTracker` component that subscribes to `demos/{DEMO_ID}/books/{bookId}` and maps simplified statuses to UI
  - [x] 3.11 After form submit, redirect to `/books/[bookId]` and show progress tracker until complete
  - [x] 3.12 Handle OpenAI errors: catch failures, set status to `failed`, write error metadata `{ message, stage }` to doc, log raw prompt/response server-side only

- [x] 4.0 Image Generation Pipeline
  - [x] 4.1 Install Replicate SDK (`replicate`) and create client in `lib/replicate/client.ts`
  - [x] 4.2 Design character consistency approach: generate a "visual signature" prompt segment for each character (species, hair color, outfit, distinguishing features) and store in Firestore
  - [x] 4.3 Create `generateCharacterPack` function in `lib/replicate/generate-character-pack.ts` that generates reference descriptors for each character
  - [x] 4.4 Create `generatePageImage` function in `lib/replicate/generate-page-image.ts` that takes scene description + character visual signatures and calls Replicate FLUX
  - [x] 4.5 Create POST `/api/books/[bookId]/generate-images` route that orchestrates: (a) generate character packs, (b) generate cover image, (c) generate 10 page images sequentially or in controlled parallel
  - [x] 4.6 Create `uploadImage` utility in `lib/utils/image-upload.ts` to upload generated images to Firebase Storage under `demos/{demoId}/books/{bookId}/pages/`
  - [x] 4.7 Update each page document in Firestore with `imageUrl` after successful upload
  - [x] 4.8 Update book status to `generating_pdf` after all 11 images are complete
  - [x] 4.9 Handle Replicate errors: catch failures, set page status to `failed`, set book status to `failed`, log error details server-side
  - [x] 4.10 Implement per-character prompt injection to maintain consistency (include visual signature in every image prompt where that character appears)

- [x] 5.0 Book Preview, PDF Export & My Books Dashboard
  - [x] 5.1 Build book preview page at `app/(protected)/books/[bookId]/page.tsx` that fetches book, characters, and pages from Firestore
  - [x] 5.2 Create `BookViewer` component with flipbook-style navigation (cover first, then pages 1–10)
  - [x] 5.3 Create `PageCard` component displaying page image and text overlay/caption
  - [x] 5.4 Show generation progress if book status is not `complete`; show preview + download button when complete
  - [x] 5.5 Install PDF library (`jspdf` or `@react-pdf/renderer`) and create `generatePdf` function in `lib/pdf/generate-pdf.ts`
  - [x] 5.6 PDF generation: fetch all images, compose cover + 10 pages with text, output as PDF blob
  - [x] 5.7 Create POST `/api/books/[bookId]/pdf` route that generates PDF, uploads to Firebase Storage, updates book record with `pdfUrl`, sets status to `complete`
  - [x] 5.8 Add "Download PDF" button to preview page that fetches `pdfUrl` and triggers download
  - [x] 5.9 Build My Books dashboard at `app/(protected)/dashboard/page.tsx` that queries user's books from Firestore
  - [x] 5.10 Create `BookList` component displaying books with status badges (generating, complete, failed)
  - [x] 5.11 Create `BookCard` component with book title, cover thumbnail, status, "View" link, and "Download PDF" button (if complete)
  - [x] 5.12 Handle empty state: show friendly message + CTA to create first book if user has no books
  - [x] 5.13 Implement simple rate limiting: check book count created today before allowing new creation (e.g., max 3/day); return 429 if exceeded

---

## Definition of Done

- [ ] All parent tasks completed
- [ ] User can sign up, log in, and log out
- [ ] User can create a book by filling out the form
- [ ] System generates story (Book Plan) via OpenAI and persists to Firestore
- [ ] System generates 11 images (cover + 10 pages) via Replicate with character consistency
- [ ] User can preview the complete book (images + text)
- [ ] User can download a PDF of the book
- [ ] User can view all their books in the dashboard and re-download PDFs
- [ ] Errors are handled gracefully with user-friendly messages
- [ ] No regeneration actions exist (v1 constraint enforced)
- [ ] All Firestore docs and Storage files exist under `demos/{demoId}/...` — no data written outside namespace

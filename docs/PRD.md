Here’s the PRD in the exact structure you gave. Filename should be:

`/tasks/0001-prd-ai-childrens-book-saas-mvp.md`

---

# AI Children’s Book SaaS MVP

## Overview

Parents/caregivers want a fast, low-friction way to create a personalized children’s picture book without writing the story themselves or learning prompt engineering/layout tools. This MVP is a **one-click** web app: the parent enters a few details, the system generates a complete book with **3–5 consistent characters** across **cover + 10 pages**, and the parent downloads a **PDF**. The MVP is **free** (no Stripe yet) and intentionally avoids scope that slows shipping.

## Goals

* Generate a complete children’s book (cover + 10 pages) from a short input form in a single flow.
* Maintain recognizable character consistency across all pages for 3–5 characters (within the limits of the chosen image approach).
* Provide a reliable PDF download output for each generated book.
* Store generated books so a logged-in user can revisit and re-download later.
* Keep infra simple and shippable by a junior dev using the agreed stack.

## User stories

* As a **parent**, I want to enter my child’s name and a theme so that the book feels personalized.
* As a **parent**, I want the app to generate the whole book automatically so that I don’t have to edit or manage pages.
* As a **parent**, I want the characters to look the same from page to page so that the book feels coherent.
* As a **parent**, I want to preview the generated pages so that I can see what the book looks like.
* As a **parent**, I want to download a PDF so that I can share it or print it later.
* As a **parent**, I want to see my previously generated books so that I can re-download them later.

## Functional requirements

1. The system must provide email/password authentication using Firebase Auth.
2. The system must provide a “Create Book” flow that collects minimum inputs (see Data & UI notes).
3. The system must generate a structured **Book Plan** (JSON) containing: `title`, `characters[]`, and `pages[]` (cover + 10 pages), where each page includes `pageText`, `sceneDescription`, and `charactersOnPage[]`.
4. The system must generate story content using OpenAI and persist the full Book Plan to Firestore.
5. The system must generate images using Replicate (FLUX) and persist image outputs to Firebase Storage, linked from Firestore.
6. The system must implement a **character consistency approach** for 3–5 characters by generating and storing a per-character “Character Pack” (reference images and/or locked descriptors) and using it during page image generation.
7. The system must generate exactly **1 cover image** and **10 page images** per book (11 images total).
8. The system must not allow regenerations in v1 (no “re-roll page/book” actions).
9. The system must display generation progress states (queued/running/succeeded/failed) and show a user-friendly error state if generation fails.
10. The system must allow the user to preview the book pages (text + images) after generation completes.
11. The system must produce a downloadable PDF that includes the cover + 10 pages with the corresponding text and images.
12. The system must provide a “My Books” dashboard where the user can view previously generated books and re-download their PDFs.

## Non-Goals (Out of scope)

* Payments, subscriptions, credits, or Stripe integration.
* Print-on-demand ordering or any print vendor integration.
* Regenerations (per page or per book), “try again” buttons, or iterative editing loops.
* Manual editing of story text, characters, or scenes.
* Admin panel, moderation console, or back-office content tools.
* Multi-language support.
* Advanced art style selection marketplace (keep presets minimal for MVP).
* LoRA training / custom fine-tuning pipelines (can be phase 2+).

## Data & UI notes (optional)

### Input fields (Create Book)

Minimum recommended inputs for MVP:

* Child name (string)
* Child age range (A) 3–5 B) 6–8 C) 9–12 (pick one)
* Theme (string; e.g., “friendship”, “bravery”, “sharing”)
* Setting (A) space B) forest C) ocean D) city E) custom text
* Tone (A) silly B) warm C) adventurous
* Character count (fixed to 3–5 in v1; user selects 3, 4, or 5)
* Optional: one “special detail” (favorite animal/toy/color)

### Demo namespace

* `demoId`: a fixed string like `"childrens-book-saas"` configured via environment/config (NOT user input). All Firestore and Storage paths are namespaced under `demos/{demoId}/...`.

### Firestore entities (suggested, namespaced)

* `users/{uid}` — user profile (shared across demos, not namespaced)
* `demos/{demoId}/books/{bookId}`: ownerId, status, inputs, title, createdAt, pdfUrl, error
* `demos/{demoId}/books/{bookId}/characters/{characterId}`: name, visualSignature, refImageUrls[]
* `demos/{demoId}/books/{bookId}/pages/{pageId}`: pageNumber, pageText, sceneDescription, charactersOnPage[], imageUrl, status, error
* `demos/{demoId}/jobs/{jobId}` (or embedded under book): type (story/images/pdf), status, provider ids, timestamps, error

### Storage paths (namespaced)

* `demos/{demoId}/books/{bookId}/pages/{pageNumber}.png` — page images
* `demos/{demoId}/books/{bookId}/exports/book.pdf` — generated PDF
* `demos/{demoId}/books/{bookId}/characters/{characterId}/ref-{n}.png` — character pack reference images (if stored)

### UI states

* Empty (no books yet)
* Creating (form)
* Generating (progress UI per stage: story → characters → images → pdf)
* Success (preview + download)
* Error (clear retry guidance; for MVP this can be “create a new book”)

### Preview UX

Keep it simple:

* Page list or basic flipbook-style viewer
* Show cover first, then pages 1–10
* “Download PDF” button

## Technical considerations (optional)

* Stack: Next.js + Firebase (Auth/Firestore/Storage/Functions) + OpenAI (story generation) + Replicate (image generation).
* Long-running tasks should be asynchronous (Functions kick off jobs; client watches Firestore status).
* Store provider request metadata (model name, request id, timestamps) to debug failures.
* Protect API keys using server-side environment variables (never expose in client).
* Basic rate limiting: per-user creation cap (even without regenerations) to avoid runaway costs in a free MVP (e.g., max X books/day).
* Demo namespace: This app runs inside a shared Firebase project. All Firestore documents and Storage objects created by this demo must be stored under a single `demoId` namespace (a fixed slug configured via env/config), to prevent collisions with other demos.

## Acceptance criteria

* Given a new visitor, when they sign up with email/password, then they can access the Create Book screen.
* Given a logged-in user on Create Book, when they submit the form, then a new book record is created in Firestore with status `generating`.
* Given a submitted book, when story generation completes, then Firestore contains a Book Plan with `characters[]` (3–5) and `pages[]` (11 entries: cover + 10).
* Given a completed Book Plan, when image generation completes, then there are 11 stored images in Firebase Storage and each page record links to an image URL.
* Given a generated book, when the user opens the book preview, then they can view cover + 10 pages, each showing text and its corresponding image.
* Given a generated book, when PDF generation completes, then a PDF file exists in Firebase Storage and is downloadable from the UI.
* Given a user with at least one generated book, when they open “My Books,” then all their books are listed and each has a working “View” and “Download PDF” action.
* Given any provider failure (OpenAI or Replicate), when the job fails, then the UI shows a non-technical error message and the book status is marked `failed` with an error logged server-side.
* Given a book is generated, when checking the page records, then no page offers a regeneration action (v1 no-regens enforced).
* Given a multi-character book, when reviewing pages where multiple characters appear, then characters maintain consistent core traits (e.g., hair/outfit/colors/species cues) across pages at a "recognizably same character" level.
* Given a generated book, when inspecting Firestore and Storage paths, then all records/files created by the demo exist under `demos/{demoId}/...` and no records/files are written outside that namespace.

## Success metrics

* Time-to-book: median time from form submit to PDF ready ≤ 5 minutes (provisional target; depends on model speed).
* Completion rate: ≥ 70% of started generations reach “PDF ready” without failing.
* User satisfaction (lightweight): ≥ 60% of users who generate a book download the PDF.
* Cost guardrail: average compute cost per book stays under an internal target (define once model params are chosen).

## Open questions

* What are the required PDF specs for “print later”? (page size, margins, bleed) Even if POD is out of scope, PDF format matters.
* What art style presets are included in v1 (1 preset vs 2–3)?
* What’s the minimum acceptable standard for “character consistency” for the client (visual identity, outfit lock, facial features)?
* Do we need content safety filtering for children’s content in v1 (disallowed themes/words)?
* What’s the per-user free usage cap (books/day or books total) to prevent cost spikes?
* Do we need guest mode (no auth) or is auth required before generation?

---
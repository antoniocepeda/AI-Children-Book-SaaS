# Character Consistency Upgrade PRD

## Overview

This upgrade replaces the current text-only character consistency approach (FLUX 2 Pro) with an **image-reference-based system** using **FLUX.1 Kontext Dev**. Characters will have canonical reference images generated upfront, which are then passed to every page generation call to ensure visual consistency across the book.

### Key Outcome
- **Before**: Same character looks different on each page (drift)
- **After**: Same character looks consistent across all 11 pages

---

## Goals

1. **Eliminate character drift** — Characters maintain recognizable identity (face, outfit, colors) across all pages
2. **Reduce cost** — Switch from FLUX 2 Pro ($0.05/image) to Kontext Dev ($0.025/image) = ~15% savings per book
3. **Enable future features** — Reference images unlock regeneration, correction, and editing in future phases
4. **Maintain performance** — Keep total generation time under 5 minutes

---

## User Stories

- As a **parent**, I want the main character to look the same on page 1 and page 10 so the book feels like a real story
- As a **parent**, I want supporting characters (sidekick, pet, friend) to be recognizable throughout
- As a **parent**, I want multi-character scenes to show the correct characters together

---

## Functional Requirements

### 1. Character Reference Generation (NEW)

After story generation, before page generation:

1. System generates **2 canonical reference images per character**:
   - **ref-0**: Front-facing portrait, neutral expression
   - **ref-1**: 3/4 view action pose
2. Reference images stored to Firebase Storage: `characters/{characterId}/ref-{n}.webp`
3. Reference URLs saved to character document: `refImageUrls: string[]`

### 2. Model Migration

| Component | Before | After |
|-----------|--------|-------|
| Image model | `black-forest-labs/flux-2-pro` | `black-forest-labs/flux-kontext-dev` |
| Cost/image | $0.05 | $0.025 |
| Input type | Text prompt only | Text prompt + image reference |

### 3. Page Generation with References

For each page:

1. Fetch characters appearing on this page
2. Retrieve reference image URLs for each character
3. Pass primary reference image via `image_url` parameter
4. Include all character signatures in deterministic order in prompt

### 4. Deterministic Multi-Character Handling

Prompts must be structured consistently:

```
[STYLE]
Children's book illustration, soft watercolor, warm colors...

[CHARACTER_1: MAYA - protagonist]
Reference provided. 7-year-old girl, curly brown hair, purple dress with stars.

[CHARACTER_2: WHISKERS - supporting]  
Orange tabby cat, blue collar with bell, white paws.

[SCENE]
Maya and Whiskers playing in the sunny meadow with butterflies.
```

**Rules:**
- Characters sorted by: protagonist first, then supporting by creation order
- Same order used for every page featuring those characters
- Visual signatures included as text backup

### 5. Progress UI Update

Add new status to generation progress:

```
story → characters → [character_refs] → images → pdf
```

---

## Data Model Changes

### Character Document (Updated)

```typescript
// demos/{demoId}/books/{bookId}/characters/{characterId}
interface Character {
  name: string;
  visualSignature: string;
  description: string;
  role: 'protagonist' | 'supporting' | 'antagonist';
  // NEW FIELDS:
  refImageUrls: string[];     // ["https://...ref-0.webp", "https://...ref-1.webp"]
  refStatus: 'pending' | 'generating' | 'complete' | 'failed';
}
```

### Book Document (Updated)

```typescript
// demos/{demoId}/books/{bookId}
interface Book {
  // ... existing fields
  progress: {
    story: 'pending' | 'generating' | 'complete' | 'failed';
    characterRefs: 'pending' | 'generating' | 'complete' | 'failed';  // NEW
    images: 'pending' | 'generating' | 'complete' | 'failed';
    pdf: 'pending' | 'generating' | 'complete' | 'failed';
  };
}
```

### Storage Paths

```
demos/{demoId}/books/{bookId}/
├── characters/
│   ├── char-0/
│   │   ├── ref-0.webp    ← Front portrait
│   │   └── ref-1.webp    ← Action pose
│   └── char-1/
│       ├── ref-0.webp
│       └── ref-1.webp
└── pages/
    ├── 0.webp            ← Cover
    ├── 1.webp
    └── ...
```

---

## Technical Implementation

### New Files

| File | Purpose |
|------|---------|
| `lib/replicate/kontext-client.ts` | FLUX Kontext Dev model config |
| `lib/workflows/character-ref-workflow.ts` | Generate character reference images |
| `lib/replicate/prompts-v2.ts` | Structured prompt builder with character blocks |

### Modified Files

| File | Changes |
|------|---------|
| `lib/replicate/client.ts` | Add Kontext model constant |
| `lib/replicate/generate-page-image.ts` | Accept `image_url` param, use Kontext |
| `lib/workflows/image-workflow.ts` | Fetch refs before generating pages |
| `lib/workflows/story-workflow.ts` | Trigger ref generation after story |
| `lib/validators/book-plan.ts` | Add `refImageUrls`, `refStatus` to schema |
| `components/create/ProgressTracker.tsx` | Show "Generating character refs" step |

---

## Non-Goals (Out of Scope)

- Manual regeneration of individual pages (future phase)
- User-facing character sheet preview
- Drift detection / auto-correction (future phase)
- Alternative art styles via different models

---

## Acceptance Criteria

1. **Character refs generated**: Given a book with 4 characters, when story generation completes, then 8 reference images exist in Storage (2 per character)

2. **Refs used in page generation**: Given a page featuring Maya and Whiskers, when the page image is generated, then the API call includes Maya's ref-0 image URL

3. **Deterministic ordering**: Given pages 3 and 7 both feature Maya and Whiskers, when comparing the prompts, then character blocks appear in the same order

4. **Visual consistency**: Given a generated book, when comparing the protagonist on page 1 vs page 10, then core traits (hair color, outfit, face shape) are recognizably consistent

5. **Cost reduction**: Given 100 books generated, when averaging costs, then per-book cost is ≤ $0.50 (vs current ~$0.55)

6. **Progress UI**: Given a book in generation, when viewing progress, then "Generating character references" step is visible between story and images

---

## Cost Analysis

| Phase | Images | Cost @ $0.025 |
|-------|--------|--------------|
| Character refs | 8 (4 chars × 2 refs) | $0.20 |
| Page images | 11 | $0.275 |
| **Total per book** | **19** | **$0.475** |

**Savings**: $0.55 → $0.475 = **13.6% reduction**

---

## Verification Plan

### Automated Testing
- Unit tests for new prompt builder (`prompts-v2.test.ts`)
- Integration test: mock Replicate calls, verify ref URLs passed correctly

### Manual Testing
1. Create a new book with 4 characters
2. Verify Storage contains `/characters/{id}/ref-0.webp` and `ref-1.webp`
3. Verify page images show consistent characters
4. Compare protagonist on cover vs page 5 vs page 10

### Metrics to Track
- API call success rate
- Average generation time (should stay under 5 min)
- Visual consistency (qualitative review of 10 sample books)

---

## Open Questions

1. **Number of refs**: Is 2 per character enough, or should we generate 3-4 for better coverage?
2. **Reference poses**: Should we include a back view for characters shown from behind?
3. **Fallback behavior**: If ref generation fails, should we fall back to text-only prompting or fail the whole book?

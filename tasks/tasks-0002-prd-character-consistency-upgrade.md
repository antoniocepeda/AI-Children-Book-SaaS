# Tasks: Character Consistency Upgrade

> **PRD**: [0002-prd-character-consistency-upgrade.md](../docs/0002-prd-character-consistency-upgrade.md)
> **Constraints**: No tests for v1, additive changes only (no auth/schema-breaking/story-workflow changes)

---

## Relevant Files

### New Files
- `lib/replicate/kontext-client.ts` – FLUX Kontext Dev model configuration and constants
- `lib/workflows/character-ref-workflow.ts` – Orchestrates reference image generation for all characters
- `lib/replicate/prompts-v2.ts` – Structured prompt builder with deterministic character blocks

### Modified Files
- `lib/validators/book-plan.ts` – Add `refImageUrls` and `refStatus` fields to CharacterSchema
- `lib/replicate/client.ts` – Add KONTEXT_MODEL constant alongside existing FLUX_MODEL
- `lib/replicate/generate-page-image.ts` – Accept `image_url` param, switch to Kontext model
- `lib/workflows/story-workflow.ts` – Trigger character ref workflow after story generation
- `lib/workflows/image-workflow.ts` – Fetch character refs before generating pages, pass to Kontext
- `components/create/ProgressTracker.tsx` – Add "Generating character references" step to UI

---

## Notes

- Reference images use the same `uploadImageFromUrl` utility as page images
- Storage path follows existing pattern: `demos/{demoId}/books/{bookId}/characters/{charId}/ref-{n}.webp`
- Kontext Dev model ID: `black-forest-labs/flux-kontext-dev`
- Fallback: If ref generation fails, fail the book (no text-only fallback for v1)

---

## Tasks

- [x] 1.0 Add FLUX Kontext Dev Model Configuration
  - [x] 1.1 Create `lib/replicate/kontext-client.ts` with Kontext Dev model constant and image config
  - [x] 1.2 Add `KONTEXT_MODEL` export to `lib/replicate/client.ts` for backward compatibility
  - [x] 1.3 Verify Replicate API token works with Kontext Dev by checking model access

- [x] 2.0 Extend Character Schema with Reference Image Fields
  - [x] 2.1 Add `refImageUrls: z.array(z.string()).optional()` to `CharacterSchema` in `book-plan.ts`
  - [x] 2.2 Add `refStatus: z.enum(['pending', 'generating', 'complete', 'failed']).optional()` to `CharacterSchema`
  - [x] 2.3 Update `Character` type export to include new fields
  - [x] 2.4 Add `characterRefs` field to book progress type (if typed separately)

- [x] 3.0 Create Character Reference Generation Workflow
  - [x] 3.1 Create `lib/workflows/character-ref-workflow.ts` with `runCharacterRefGeneration(bookId)` function
  - [x] 3.2 Implement fetching all characters from Firestore for the given book
  - [x] 3.3 For each character, generate 2 reference images (front portrait, 3/4 action pose)
  - [x] 3.4 Upload each ref image to Storage: `characters/{charId}/ref-0.webp`, `ref-1.webp`
  - [x] 3.5 Update character document with `refImageUrls` array and `refStatus: 'complete'`
  - [x] 3.6 Update book `progress.characterRefs` to 'complete' when all characters done
  - [x] 3.7 Handle errors: set `refStatus: 'failed'` on character, `progress.characterRefs: 'failed'` on book

- [ ] 4.0 Update Image Workflow to Use References
  - [x] 4.1 Create `lib/replicate/prompts-v2.ts` with `buildStructuredPrompt()` function
  - [x] 4.2 Implement deterministic character ordering (protagonist first, then by creation order)
  - [x] 4.3 Update `generatePageImage()` to accept optional `image_url` parameter
  - [x] 4.4 Switch `generatePageImage()` from FLUX_MODEL to KONTEXT_MODEL
  - [x] 4.5 Update `image-workflow.ts` to fetch character refs before generating pages
  - [x] 4.6 Pass protagonist's `refImageUrls[0]` as `image_url` to each page generation
  - [x] 4.7 Include all page characters' visual signatures in structured prompt format
  - [x] 4.8 Update `story-workflow.ts` to trigger `runCharacterRefGeneration()` after story completes, before image workflow

- [ ] 5.0 Update Progress UI for Character Ref Step
  - [ ] 5.1 Update `ProgressTracker.tsx` to show "Generating character references" step between story and images
  - [ ] 5.2 Add progress state listener for `progress.characterRefs` from Firestore
  - [ ] 5.3 Update progress bar/steps to reflect 4-stage flow: story → refs → images → pdf

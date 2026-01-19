# Task List Management (Process Rules)

Guidelines for executing task lists in Markdown while implementing a PRD.

## Why this exists

Keep implementation tidy, auditable, and junior‑dev friendly. Zero thrash, no surprise yaks.

---

## Interaction model (matches PRD cadence)

* **Clarifying cadence:** When clarification is needed, the assistant asks **up to 2 questions in a single round**, then proceeds once answered.
* **Execution cadence:** Implement **one sub‑task at a time**. Do **not** begin the next sub‑task until you get explicit approval: reply must be `yes` or `y`.

---

## Output & file hygiene

* **Primary file:** the active task list lives at `/tasks/tasks-[prd-file-name].md` (e.g., `tasks-0001-prd-user-profile-editing.md`).
* **Edits:** always update the same task file as work progresses. Only create a new tasks file if the PRD file name changes.

---

## Task implementation protocol

1. **Pick the next sub‑task**

   * Read the task list top‑down. Choose the first unchecked sub‑task under the earliest parent task.
   * If ambiguous, ask up to **2** clarifying questions and wait for answers.

2. **Request permission**

   * Post the exact sub‑task you intend to complete.
   * Proceed **only** after the user replies `yes` or `y`.

3. **Do the work**

   * Follow repo patterns, respect the PRD acceptance criteria, write/update tests as indicated by the task list.

4. **Update the task list**

   * Immediately mark the finished sub‑task `[x]` in the Markdown file.
   * Add any newly discovered sub‑tasks below the current parent task.

5. **Parent task completion gate**
   When **all** sub‑tasks under a parent are `[x]`:

   * **Run tests:** execute the full suite (e.g., `npm test`, `pytest`, `bin/rails test`).
   * **If and only if tests pass:** stage changes (`git add .`).
   * **Clean up:** remove temporary code/files, dead comments, debug statements.
   * **Commit:** use a descriptive, conventional message as a single command with multiple `-m` flags:

     ```
     git commit -m "feat: add payment validation logic" -m "- Validates card type and expiry" -m "- Adds unit tests for edge cases" -m "Related to 2.0 in 0001-prd-user-profile-editing"
     ```
   * Mark the **parent task** `[x]` in the task list.

6. **Stop and wait**

   * After every completed sub‑task, stop and wait for explicit approval to start the next one.

---

## Task list maintenance

1. **Keep state fresh**

   * Mark tasks/sub‑tasks `[x]` immediately after completion.
   * Insert new tasks discovered during work (label them clearly, e.g., “Follow‑up: …”).

2. **Maintain the `Relevant Files` section**

   * List each created/modified file with a one‑line purpose.
   * Include corresponding test files.

3. **Notes section**

   * Record oddities, test setup, feature flags, or environment quirks.

---

## Minimal template (for the task file)

```markdown
## Relevant Files
- `path/to/file.ts` – Brief reason.
- `path/to/file.test.ts` – Tests for `file.ts`.

### Notes
- Unit tests live next to the code they test.
- Use the project’s test runner (e.g., `npm test`).

## Tasks
- [ ] 1.0 Parent Task Title
  - [ ] 1.1 [Sub‑task]
  - [ ] 1.2 [Sub‑task]
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 [Sub‑task]
- [ ] 3.0 Parent Task Title (may not require sub‑tasks if structural)
```

---

## Definition of done (for each parent task)

* [ ] All child sub‑tasks are `[x]`
* [ ] Full test suite passes locally
* [ ] Changes staged and committed with a conventional multi‑`-m` message referencing the task and PRD
* [ ] Parent task marked `[x]` in the tasks file
* [ ] Relevant Files and Notes updated

---

## Reminders

* Ask **at most 2** clarifying questions in any round, to match PRD cadence.
* Never start the next sub‑task without explicit `yes`/`y` approval.
* Keep everything inside the single `/tasks/tasks-[prd-file-name].md` file unless the PRD file changes.
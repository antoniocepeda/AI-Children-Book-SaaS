---
description: Commit and push changes with proper logging and validation
---

# Rule: Commit and Push Operations

## Trigger
When the user says "push" or requests to commit and push changes.

## Process

### 1. Git Branch Check
- **ALWAYS start by checking the current git branch** using `git rev-parse --abbrev-ref HEAD`.
- This determines the logging strategy.

### 2. Git Status Check
- Run `git status` to see current repository state.
- Identify all modified, added, and deleted files.
- Check for untracked files that might need to be included.

### 3. Change Analysis
- Group related files by logical purpose/feature.
- Identify the scope of changes (bug fix, feature addition, refactor, etc.).
- Look for patterns in file modifications.
- **Special Check:** Identify if changes include `.next/` directory files (should be gitignored).

### 4. Single Change Validation
- **✅ PROCEED** if all changes are part of one logical unit.
- **❌ STOP** if multiple unrelated changes are detected.

### 5. Generate and Document Task (Branch-Specific Logic)

#### AI Task: Generate Commit Details
- **Analyze `git status` output** to identify all modified, added, and deleted files.
- **Infer the `Type` and `Scope`:**
  - `Type`: Default to `feat` for new functionality. Use `fix` for bug fixes, `refactor` for code restructuring, and `docs` for documentation-only changes.
  - `Scope`: Determine the primary feature area from the file paths (e.g., `auth`, `books`, `api`, `ui`, `firebase`).
- **Generate `Summary` and `Task Title`:** Create a concise summary of the work based on the modified components.
- **Generate a `Commit Message`:** Construct a conventional commit message from the inferred type, scope, and summary.
- **Pre-fill `Details`:** List the modified files. Summarize the "Problem" and "Solution" based on the conversation history.

#### User Confirmation
- **Present the generated log information and commit message to the user.**
- **Ask for confirmation before proceeding.** (e.g., "I've generated the commit details. Shall I proceed?")

#### If on `main` branch:
- **Log to Master Log:**
  - Get the current date/time.
  - Prepend a new entry to `docs/task-log/master-log.md` using the high-level template.
  - This log should summarize a completed and merged feature.

#### If on a `feature/*` or other development branch:
- **Log to a Branch-Specific File:**
  - Get the current date/time.
  - Sanitize the branch name to create a filename (e.g., `feature/auth-system` becomes `feature-auth-system.md`).
  - Create or append to a log file at `docs/task-log/<sanitized-branch-name>.md`.
  - Use the same detailed template for this log. This captures the work-in-progress history.

### 6. Action Based on Analysis

**If Single Coherent Change:**
1. Generate the log entry based on the branch logic above.
2. **Build Validation (on main branch only):** If on `main` branch:
   - Run `npm run build` to ensure no build errors.
   - If build fails, stop and report the error.
   - If build passes, proceed to commit.
3. Stage appropriate files with `git add .` (including the new/updated log file).
4. Commit with the generated message.
5. Push to the current branch.

**If Multiple Changes Detected:**
1. **STOP the process immediately.**
2. Inform the user and ask which group of changes to commit first.

## Commit Message Format
Follow conventional commit format: `type(scope): description`

### Common Types for this Project
- `feat`: New feature (book creation, image generation, PDF export)
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation only
- `style`: CSS/styling changes
- `chore`: Build config, dependencies
- `test`: Adding tests

### Common Scopes for this Project
- `auth`: Authentication (login, signup, session)
- `books`: Book creation and management
- `api`: API routes
- `firebase`: Firestore, Storage, rules
- `ui`: UI components
- `create`: Book creation flow
- `preview`: Book preview/viewer
- `dashboard`: My Books dashboard
- `pdf`: PDF generation
- `images`: Image generation pipeline
- `openai`: OpenAI integration
- `replicate`: Replicate integration

## Merging Feature Logs
- When a feature branch is ready to be merged into `main`, create one final, high-level summary entry in `master-log.md`.
- After merging, the branch-specific log in `docs/task-log/` can be deleted as part of the cleanup process.

## Key Principles
- **One logical change per commit.**
- **High-level summaries in `master-log.md`** for production changes.
- **Detailed, granular history in `docs/task-log/`** for feature development.
- **Always run git status first** to understand the current state.
- **Never commit `.next/` or `node_modules/`** - these should be gitignored.
- **Never commit `.env.local`** - only `.env.local.example` should be tracked.

## Template Format (For Both Logs)
```md
## [YYYY-MM-DD HH:MM] Task Title

**Type:** feat|fix|docs|refactor|chore|test|perf|style  
**Scope:** auth|books|api|firebase|ui|create|preview|dashboard|pdf|images|openai|replicate  
**Status:** ✅ Completed

### Summary
Brief description of what changed and why.

### Details
- **Problem:** What issue prompted this work?
- **Solution:** How was it fixed?
- **Files:** Key files modified
- **Testing:** Verification steps performed
- **Notes:** Any deployment considerations or gotchas

### Commit
`git commit -m "type(scope): description"`
```

## Example Commit Messages
```
feat(auth): add Firebase authentication with email/password
feat(books): implement book creation form with validation
feat(api): add OpenAI story generation endpoint
fix(firebase): correct namespace path in Firestore helpers
refactor(ui): extract shared Button component
docs(readme): add Firebase setup instructions
chore(deps): update Next.js to latest version
```

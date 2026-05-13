# AI Development Rules

Use this file as the working agreement for AI-assisted edits in this project.

## Priorities

1. Preserve SEO and existing user-facing behavior.
2. Prefer small, reversible patches over broad rewrites.
3. Keep the UI premium, calm, editorial, modern, and consistent.
4. Reuse existing components, classes, tokens, and patterns before adding new ones.
5. Avoid unnecessary dependencies, generated complexity, and redesign drift.

## How To Work

- Inspect the relevant files before editing.
- Make the smallest change that solves the task.
- Keep unrelated files untouched.
- Preserve existing copy unless the task asks for copy changes.
- Preserve heading hierarchy, metadata, links, alt text, and schema unless the task is SEO-related.
- Match existing naming, layout, spacing, and component conventions.
- Add comments only where they clarify non-obvious logic.
- Do not introduce new packages without a clear reason.
- Verify the result with the lightest useful check: build, lint, browser check, or responsive review.

## Patch vs Refactor

Patch when:

- The issue is isolated.
- The current structure is stable enough.
- The change can be made in one or two files.
- The deadline or risk level favors a safe fix.

Refactor when:

- The same fix is needed in three or more places.
- Repetition is causing real maintenance risk.
- A component has unclear responsibilities.
- Small edits keep causing regressions.

If unsure, patch first and propose a refactor separately.

## Drift Prevention

Avoid:

- Full-page redesigns unless explicitly requested.
- New visual systems for one-off sections.
- Loud gradients, decorative blobs, huge radii, and generic SaaS styling.
- Renaming components or classes without a maintenance reason.
- Mixing unrelated SEO, design, and architecture changes in one task.

## Definition Of Done

Before finishing, check:

- The requested task is complete.
- The edit is scoped and reversible.
- The site still builds or runs if applicable.
- Mobile and desktop layouts are not broken.
- No obvious console errors were introduced.
- SEO-sensitive elements were preserved unless intentionally changed.
- Changed files and verification are summarized clearly.


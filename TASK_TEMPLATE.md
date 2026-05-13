# AI Task Template

Use one focused task per prompt. Smaller tasks produce safer, faster changes.

```md
TASK:
Describe the specific change.

GOAL:
Explain the user-facing outcome and why it matters.

FILES TO FOCUS ON:
- path/to/file
- path/to/another-file

CONTEXT:
- What changed recently?
- What should the assistant know before editing?
- Is this static HTML/CSS/JS, React, Next.js, or another setup?

CONSTRAINTS:
- Keep edits small and reversible.
- Preserve existing behavior unless explicitly changing it.
- Preserve SEO-sensitive elements.
- Match existing design and naming conventions.
- Do not add dependencies unless approved.

DESIGN DIRECTION:
- Premium
- Calm
- Editorial
- Modern
- Minimal but not sterile

AVOID:
- Full-page redesigns
- Generic SaaS blobs
- Loud gradients
- Huge radii
- Inconsistent spacing
- Random redesign drift
- Unrelated refactors

ACCEPTANCE CHECKS:
- Build or run check passes if applicable.
- Desktop and mobile layouts still work.
- No obvious console errors.
- SEO-sensitive elements are preserved.
- Changed files and verification are summarized.
```

## Debugging Prompt

```md
BUG:
Describe the broken behavior.

EXPECTED:
What should happen?

ACTUAL:
What happens instead?

ERROR OUTPUT:
Paste the exact error, stack trace, or deploy log.

RECENT CHANGES:
List likely related edits.

FILES TO FOCUS ON:
- path/to/file

CONSTRAINTS:
- Find the root cause first.
- Make the smallest safe fix.
- Do not redesign unrelated UI.
```

## Design Polish Prompt

```md
TASK:
Polish [section/page/component].

GOAL:
Make it feel more premium and consistent without changing the product direction.

KEEP:
- Existing copy
- Existing SEO structure
- Existing layout intent

ALLOWED:
- Spacing refinements
- Typography tuning
- Minor class or component cleanup
- Responsive fixes

NOT ALLOWED:
- Full redesign
- New dependencies
- New brand colors without approval
- Rewriting unrelated sections
```

## Lightweight Git Workflow

Use small branches and focused commits.

```txt
main
feature/component-name
fix/mobile-nav-close
design/pricing-polish
seo/homepage-metadata
```

Recommended flow:

```txt
1. Pull latest main.
2. Create a focused branch.
3. Make one coherent change.
4. Run the lightest useful verification.
5. Commit with a clear message.
6. Push and review the deploy preview.
7. Merge after visual and functional checks.
```

Commit examples:

```txt
fix: close mobile nav after link click
style: polish hero spacing
seo: update homepage metadata
refactor: extract shared feature card
docs: add AI workflow guardrails
```

## Suggested Folder Structures

Static HTML/CSS/JS:

```txt
assets/
  images/
  fonts/
css/
  tokens.css
  base.css
  layout.css
  components.css
  pages.css
js/
  main.js
index.html
```

React or Next.js:

```txt
public/
src/
  app/ or pages/
  components/
    ui/
    layout/
    sections/
  styles/
    globals.css
    tokens.css
  lib/
  data/
```


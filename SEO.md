# SEO Guardrails

Use this file to keep SEO stable during fast iteration.

## Baseline Rules

- Keep one clear primary `h1` per page unless there is a deliberate exception.
- Preserve page titles, meta descriptions, canonicals, Open Graph tags, and schema unless the task asks to change them.
- Keep headings semantic: do not choose heading levels only for visual size.
- Use descriptive links and buttons.
- Add useful alt text for meaningful images.
- Do not hide important text inside images.
- Keep pages crawlable and avoid unnecessary client-only rendering for core content.

## Page Checklist

Each important page should have:

- Unique title.
- Unique meta description.
- Canonical URL if the site uses canonical tags.
- One primary `h1`.
- Logical `h2` and `h3` structure.
- Descriptive internal links.
- Useful image alt text.
- Fast-loading images with appropriate dimensions.
- Structured data where it genuinely helps.

## Before SEO-Sensitive Edits

Check:

- What page or template is affected?
- Are metadata, headings, URLs, or internal links changing?
- Is the change visible to crawlers?
- Could this affect snippets, indexing, local SEO, or social previews?

## After Edits

Verify:

- No title or meta description was removed accidentally.
- Heading order still makes sense.
- Important copy still exists in HTML.
- Links still point to valid destinations.
- Images still have meaningful alt text.
- Any schema remains valid if touched.

## Safe AI Instructions

Use this in SEO-related prompts:

```md
SEO GUARDRAILS:
- Preserve existing metadata unless explicitly changing it.
- Keep semantic heading hierarchy.
- Do not remove alt text, canonicals, Open Graph tags, or schema.
- Avoid hiding important text in images.
- Summarize any SEO-sensitive changes made.
```


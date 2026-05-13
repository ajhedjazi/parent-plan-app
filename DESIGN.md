# Design Guardrails

The project style should feel premium, calm, editorial, modern, and minimal without becoming sterile.

## Visual Direction

- Use restraint: clear hierarchy, generous spacing, confident typography, and quiet details.
- Prefer useful layout improvements over decoration.
- Let content, spacing, and alignment create the premium feel.
- Keep surfaces simple, readable, and consistent.

## Avoid

- Generic SaaS blobs or decorative orbs.
- Loud gradients or one-note color palettes.
- Huge border radii.
- Inconsistent spacing between similar sections.
- Oversized cards used as page sections.
- Random redesigns that do not connect to the existing brand.
- New colors, fonts, or effects without a system-level reason.

## Layout Defaults

- Use a shared page width container.
- Use consistent section padding across pages.
- Keep content readable on mobile before adding visual flourishes.
- Give fixed-format UI elements stable dimensions so hover states and dynamic text do not shift layout.
- Avoid nesting cards inside cards.

Suggested spacing scale:

```txt
4, 8, 12, 16, 24, 32, 48, 64, 80
```

Suggested radii:

```txt
Buttons: 6px
Inputs: 6px
Cards: 8px
Modals: 8px
Pills/badges: 999px only when the shape is intentional
```

## Typography

- Use one clear type system.
- Keep headings purposeful and proportionate to their container.
- Do not scale font sizes directly with viewport width.
- Avoid negative letter spacing.
- Keep line lengths comfortable, especially for editorial copy.

## Components

Prefer reusable patterns over page-specific one-offs.

Recommended naming:

```txt
Layout:
SiteHeader
SiteFooter
MainNav
PageShell
Section
Container

UI:
Button
IconButton
Card
Badge
Input
Select
Modal
Tabs

Sections:
HeroSection
FeatureSection
TestimonialSection
PricingSection
FaqSection
ContactSection
```

For static HTML/CSS, use class names that mirror component intent:

```txt
.site-header
.site-footer
.section
.section-inner
.section-header
.button
.button-primary
.button-secondary
.card
.feature-card
```

Avoid names like:

```txt
.box1
.new-section
.homepage-card-final
.big-wrapper
```

## CSS Organization

For static projects:

```txt
assets/
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

For React or Next.js:

```txt
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
public/
```

Keep page-specific styles small. When a pattern appears more than twice, promote it to a reusable component or utility.


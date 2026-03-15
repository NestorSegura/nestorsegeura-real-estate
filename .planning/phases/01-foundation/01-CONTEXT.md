# Phase 1: Foundation - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Working Next.js 15 + next-intl + Sanity skeleton with correct i18n routing, dev environment, and documented env variables. Three locales (de, en, es) with as-needed prefix routing. Sanity Studio at /studio without locale interference.

</domain>

<decisions>
## Implementation Decisions

### Theme & color tokens
- Light + dark mode, both supported from the start
- Default color mode follows system preference (OS setting)
- Primary accent: purple extracted from jibemates.de during research
- Light mode: off-white #EFEEEC backgrounds, dark #131313 text
- Dark mode: near-black #131313 backgrounds, light text
- shadcn/ui theme configured with CSS custom properties for both modes

### Directory layout
- By layer (standard Next.js convention): src/components/, src/lib/, src/sanity/, src/types/
- Block components (hero, features, FAQ, etc.) in top-level src/blocks/ — first-class concept separate from reusable UI components
- Component file naming: kebab-case (hero-block.tsx, feature-card.tsx) — matches shadcn/ui convention

### Translation file scope
- Full structure with placeholder text in Phase 1 — all section keys present (hero, nav, features, FAQ, etc.)
- Nested by section: `{ "hero": { "title": "..." }, "nav": { "home": "..." } }`
- German (de.json) is the source language — en/es are translations from German, matching the primary market focus

### Claude's Discretion
- Sanity schema location (src/sanity/schemas/ vs project root) — pick standard approach for embedded Studio
- CMS vs i18n separation of concerns — pick cleanest boundary for what lives in JSON files vs Sanity
- Exact purple shade extraction methodology
- Dark mode text color and secondary palette values

</decisions>

<specifics>
## Specific Ideas

- Purple brand color must match jibemates.de for LinkedIn branding consistency
- Design references for token decisions: caide.io (dark-light contrast), letusibiza.com (minimalist), paisana.studio (typography)
- CSS transitions only — no motion libraries (constraint from design direction)
- Must feel professional enough for German real estate agency owners

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-15*

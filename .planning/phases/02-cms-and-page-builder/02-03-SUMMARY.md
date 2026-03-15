---
phase: 02-cms-and-page-builder
plan: 03
subsystem: ui
tags: [react, sanity, next-sanity, intersection-observer, css-animations, page-builder, tailwind]

# Dependency graph
requires:
  - phase: 02-02
    provides: "Block schemas registered in schemaTypes, TypeGen types at src/types/sanity.types.ts, PAGE_BY_SLUG_QUERY with coalesce()"
  - phase: 02-04
    provides: "sanityFetch + SanityLive from @/sanity/lib/live"
provides:
  - "PageBuilder.tsx — block dispatcher with switch/case on _type, console.warn fallback, enabled filter"
  - "GradientDivider.tsx — 80px gradient between color scheme transitions"
  - "useRevealOnScroll.ts — Intersection Observer hook for staggered CSS reveal"
  - "CSS reveal classes in globals.css with prefers-reduced-motion support"
  - "HeroSection.tsx — dark purple hero with SVG path draw animation variant"
  - "FeatureStrip.tsx — icon/title/description grid, staggered reveal"
  - "TestimonialsBlock.tsx — quote card grid, staggered reveal"
  - "CtaBlock.tsx — primary/secondary CTA section, section reveal"
  - "ProblemSolutionBlock.tsx — numbered problem list, staggered reveal"
  - "ServicesBlock.tsx — service card grid with feature bullets, staggered reveal"
  - "FaqBlock.tsx — accordion FAQ, one-open-at-a-time, staggered reveal"
  - "ReferencesBlock.tsx — reference card grid, staggered reveal"
  - "Homepage route fetches Sanity page and renders through PageBuilder"
affects:
  - "02-04 (SanityLive already in layout — homepage uses it)"
  - "Phase 3 (lead capture, website analysis — page.tsx pattern established)"
  - "Phase 5 (all frontend pages use PageBuilder pattern)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PageBuilder dispatcher: switch on _type, console.warn (not throw) for unknowns"
    - "Block components: use client, useRevealOnScroll ref + .reveal CSS class per item"
    - "Staggered reveal: style={{ '--reveal-delay': `${index * 100}ms` }} on each .reveal item"
    - "Color scheme: data-color-scheme attribute + inline style for background/color"
    - "CSS accordion: max-height 0 → 600px transition (no JS height measurement)"
    - "SVG path animation: getTotalLength() → stroke-dasharray/dashoffset → transition"

key-files:
  created:
    - src/blocks/PageBuilder.tsx
    - src/blocks/GradientDivider.tsx
    - src/blocks/HeroSection.tsx
    - src/blocks/FeatureStrip.tsx
    - src/blocks/TestimonialsBlock.tsx
    - src/blocks/CtaBlock.tsx
    - src/blocks/ProblemSolutionBlock.tsx
    - src/blocks/ServicesBlock.tsx
    - src/blocks/FaqBlock.tsx
    - src/blocks/ReferencesBlock.tsx
    - src/hooks/useRevealOnScroll.ts
  modified:
    - src/app/globals.css
    - src/app/[locale]/page.tsx

key-decisions:
  - "CSS-only animations enforced: Intersection Observer + CSS transitions, no framer-motion/GSAP/@motionone"
  - "Block components use inline styles for color scheme rather than Tailwind dark: variants (data-color-scheme attribute kept for future CSS hooks)"
  - "Hero is always dark — no colorScheme toggle, always rendered with oklch(0.25 0.08 290) background"
  - "FAQ accordion uses max-height trick (0 → 600px) for smooth CSS-only expand/collapse"
  - "pageBuilder uses PageSection local type (not TypeGen union) to avoid inference issues when spreading block props"

patterns-established:
  - "Block pattern: 'use client', containerRef + useRevealOnScroll, items with reveal className and --reveal-delay CSS var"
  - "Color styling: isDark boolean from colorScheme prop, inline style with OKLCH values matching globals.css brand tokens"
  - "GradientDivider insertion: PageBuilder tracks prevScheme vs currScheme, inserts divider on transition"

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 02 Plan 03: PageBuilder and Block Components Summary

**PageBuilder dispatcher + 8 CSS-only animated block components + Intersection Observer reveal hook, with homepage route fetching Sanity page data and rendering through the block pipeline**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T18:35:01Z
- **Completed:** 2026-03-15T18:39:06Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Full rendering pipeline from Sanity CMS to visible page — editors create blocks, visitors see them
- 8 block components with CSS-only animations (no motion library), Intersection Observer staggered reveals
- FAQ accordion with max-height CSS transition and one-open-at-a-time behavior
- Hero SVG path animation (stroke-dasharray/dashoffset, draws on mount) with word-by-word headline reveal
- GradientDivider renders smooth color transitions between dark/light sections
- Homepage route now fetches Sanity page by slug and locale, renders through PageBuilder

## Task Commits

Each task was committed atomically:

1. **Task 1: PageBuilder, GradientDivider, useRevealOnScroll, all 8 blocks, CSS reveal classes** - `b41bcea` (feat)
2. **Task 2: Wire homepage route to Sanity via PageBuilder** - `7608544` (feat)

## Files Created/Modified

- `src/blocks/PageBuilder.tsx` — Block dispatcher with switch on _type, GradientDivider insertion, enabled filter
- `src/blocks/GradientDivider.tsx` — Server component, 80px linear-gradient between dark/light schemes
- `src/blocks/HeroSection.tsx` — Dark purple hero, 3 variants, SVG path draw animation, word-by-word reveal
- `src/blocks/FeatureStrip.tsx` — Icon/title/description grid (1/2/3 cols), staggered scroll reveal
- `src/blocks/TestimonialsBlock.tsx` — Quote cards with initials avatar fallback, staggered scroll reveal
- `src/blocks/CtaBlock.tsx` — Primary (purple bg) / secondary (outline) CTA variants, section reveal
- `src/blocks/ProblemSolutionBlock.tsx` — Numbered list with large accent numbers, staggered reveal
- `src/blocks/ServicesBlock.tsx` — Service cards with feature bullet list and optional CTA link, staggered reveal
- `src/blocks/FaqBlock.tsx` — Accordion with max-height transition, one open at a time, staggered reveal
- `src/blocks/ReferencesBlock.tsx` — Reference cards with image placeholder, staggered reveal
- `src/hooks/useRevealOnScroll.ts` — Intersection Observer hook, adds is-visible to .reveal elements on entry
- `src/app/globals.css` — Added .reveal / .reveal.is-visible CSS classes + prefers-reduced-motion override
- `src/app/[locale]/page.tsx` — Async server component fetching PAGE_BY_SLUG_QUERY, renders PageBuilder

## Decisions Made

- **CSS-only animation locked:** All animations via CSS transitions + Intersection Observer. No framer-motion, GSAP, or @motionone imports anywhere. This was a user decision established during planning.
- **PageSection local type for PageBuilder props:** Using a manually typed `PageSection` interface rather than the TypeGen `PAGE_BY_SLUG_QUERYResult` union to avoid complex discriminated union spreading issues. The TypeGen type is used at the call site (homepage) and cast to `PageSection[]`.
- **Hero always dark:** Hero colorScheme is effectively fixed at dark — background is always the deep purple. The `colorScheme` prop is respected for data attribute but overridden visually.
- **Inline OKLCH styles for block colors:** Rather than Tailwind dark: variants (which require .dark class on body), blocks use inline styles with OKLCH values that match the brand tokens. Keeps dark/light scoping per-block.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript union type cast error in CtaBlock**
- **Found during:** TypeScript check after Task 1
- **Issue:** Spreading union object literal `{ '--reveal-delay': string } | { background: string; ... } | { border: string; ... }` couldn't be cast to `React.CSSProperties` due to TypeScript's union narrowing
- **Fix:** Built style as `Record<string, string>` imperatively, then cast to `React.CSSProperties`
- **Files modified:** src/blocks/CtaBlock.tsx
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** b41bcea (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial type fix. No scope change.

## Issues Encountered

None beyond the TypeScript union type fix documented above.

## User Setup Required

None — no external service configuration required for this plan.

## Next Phase Readiness

- PageBuilder pipeline complete and ready for Phase 3 (lead capture, website analysis tool)
- Block components use the established color scheme / reveal pattern — future blocks should follow the same pattern
- Hero SVG path needs real content from Sanity when editors create the homepage document
- Image rendering for TestimonialsBlock avatars and ReferencesBlock images uses placeholder — Phase needs Sanity image URL builder (next-sanity image helpers) when real images are added

---
*Phase: 02-cms-and-page-builder*
*Completed: 2026-03-15*

## Self-Check: PASSED

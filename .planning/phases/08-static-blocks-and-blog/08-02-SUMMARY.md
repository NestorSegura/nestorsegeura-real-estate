---
phase: 08-static-blocks-and-blog
plan: "02"
subsystem: ui
tags: [astro, sanity, groq, gsap, lenis, oklch, tailwind, landing-blocks]

# Dependency graph
requires:
  - phase: 08-01
    provides: OKLCH primary color tokens, blockContent schema, GROQ helpers (getHomepageWithSections), imageUrl lib utility
provides:
  - PageBuilder.astro dispatcher (16-case switch: 8 v1 + 8 landing* _types)
  - 8 landing* block components (LandingHero, LandingProblem, LandingGuide, LandingPlan, LandingOffer, LandingTestimonials, LandingFaq, LandingCtaFinal)
  - 8 v1 block components (HeroSection, FeatureStrip, ProblemSolutionBlock, ServicesBlock, TestimonialsBlock, ReferencesBlock, FaqBlock, CtaBlock)
  - StackingCards.astro GSAP/ScrollTrigger reusable wrapper
  - Lenis smooth scroll with GSAP ScrollTrigger sync (global, BaseLayout)
  - All 3 locale homepages (/, /en, /es) wired to Sanity via PageBuilder
affects: [08-03-blog, 09-navbar-and-interactions, 10-deployment]

# Tech tracking
tech-stack:
  added: [lenis, gsap (ScrollTrigger plugin), @studio-freight/lenis]
  patterns: [PageBuilder dual-schema dispatch, StackingCards GSAP wrapper, landing* schema preferred over v1 via *-landing document slug query, OKLCH-purple substitutions for is--green/is--dark utility classes]

key-files:
  created:
    - src/components/blocks/PageBuilder.astro
    - src/components/blocks/LandingHero.astro
    - src/components/blocks/LandingProblem.astro
    - src/components/blocks/LandingGuide.astro
    - src/components/blocks/LandingPlan.astro
    - src/components/blocks/LandingOffer.astro
    - src/components/blocks/LandingTestimonials.astro
    - src/components/blocks/LandingFaq.astro
    - src/components/blocks/LandingCtaFinal.astro
    - src/components/blocks/HeroSection.astro
    - src/components/blocks/FeatureStrip.astro
    - src/components/blocks/ProblemSolutionBlock.astro
    - src/components/blocks/ServicesBlock.astro
    - src/components/blocks/TestimonialsBlock.astro
    - src/components/blocks/ReferencesBlock.astro
    - src/components/blocks/FaqBlock.astro
    - src/components/blocks/CtaBlock.astro
    - src/components/blocks/StackingCards.astro
  modified:
    - src/pages/index.astro
    - src/pages/en/index.astro
    - src/pages/es/index.astro
    - src/layouts/BaseLayout.astro

key-decisions:
  - "Dual-schema dispatch — PageBuilder handles all 16 _types (8 v1 + 8 landing*); DE/EN/ES homepages now all use *-landing documents but v1 support retained for safety"
  - "Prefer *-landing homepage document via getHomepageWithSections slug filter — ES was already landing*, DE/EN migrated; *-landing query wins when both doc types exist"
  - "StackingCards GSAP wrapper added out of plan scope — reusable scroll-stacking effect applied to LandingProblem, LandingPlan, ProblemSolutionBlock"
  - "Lenis smooth scroll added globally in BaseLayout — synced with GSAP ScrollTrigger via raf loop; improves scroll feel site-wide"
  - "OKLCH primary scale (hue 290) used throughout blocks for is--green/is--dark replacements — bg-primary-700 for CTAs, bg-primary-900 for dark sections, text-primary-300 for accent"
  - "v1 schema _type names confirmed: heroSection/featureStrip/problemSolutionBlock/servicesBlock/testimonialsBlock/referencesBlock/faqBlock/ctaBlock — NOT landingHero etc."

patterns-established:
  - "PageBuilder dispatch: static imports + switch(_type) + spread props + locale passthrough; default case returns null (unknown types silently skipped)"
  - "Block sections: each wrapped in semantic <section id='[stable-slug]'> for in-page anchoring"
  - "FAQ: native <details>/<summary> with CSS ::after chevron rotation — zero JavaScript"
  - "Image blocks: urlFor(image).width(N).format('webp').url() via src/lib/imageUrl utility"
  - "StackingCards wrapper: GSAP ScrollTrigger pin + scrub stacking; applied to card-grid blocks"
  - "Lenis + GSAP sync: requestAnimationFrame loop in BaseLayout <script> updates ScrollTrigger on each Lenis scroll event"

# Metrics
duration: multi-session (2026-04-14)
completed: 2026-04-14
---

# Phase 8 Plan 02: Blocks and PageBuilder Summary

**Dual-schema PageBuilder (16 _types) wiring DE/EN/ES homepages to Sanity content, with 18 zero-JS .astro block components, GSAP StackingCards, and Lenis smooth scroll**

## Performance

- **Duration:** Multi-session (2026-04-14)
- **Started:** 2026-04-14
- **Completed:** 2026-04-14
- **Tasks:** 3 (Tasks 1a, 1b, 2 auto; Task 3 checkpoint approved)
- **Files modified:** 22

## Accomplishments

- 18 zero-JS .astro block components created (8 landing* + 8 v1 + StackingCards wrapper)
- PageBuilder dispatcher handles 16 _types across two schema generations; all 3 locale homepages render live Sanity content
- GSAP StackingCards scroll effect and Lenis smooth scroll added as design polish (out of original scope)

## Task Commits

Each task was committed atomically:

1. **Task 1a: Port 4 simpler landing blocks** - `53ffa8b` (feat) — later reconciled in f221d13
2. **Task 1b: Port 4 complex landing blocks** - `24da479` (feat) — later reconciled in f221d13
3. **Task 2: PageBuilder dispatcher + 3 locale homepages** - `d01e6a7` (feat)
4. **Fix: Rewrite v1 schema block components** - `19ed777` (fix)
5. **Fix: Delete obsolete Landing* after rename** - `f221d13` (fix)
6. **Docs: Note deviation in plan frontmatter** - `83571a1` (docs)
7. **Fix: Restore Landing* for ES landing schema** - `0a7970e` (fix)
8. **Fix: Dispatch both v1 + landing* in PageBuilder** - `552d70c` (fix)
9. **Docs: Update dual-schema deviation note** - `33f475f` (docs)
10. **Feat: StackingCards GSAP/ScrollTrigger wrapper** - `1694b82` (feat)
11. **Feat: Apply stacking effect to Problem/Plan blocks** - `3db47a1` (feat)
12. **Feat: Lenis smooth scroll + GSAP ScrollTrigger sync** - `e44afe2` (feat)
13. **Fix: Prefer *-landing homepage doc over legacy v1** - `3a36499` (fix)

**Plan metadata:** (this commit) (docs: complete blocks + page builder plan)

## Files Created/Modified

- `src/components/blocks/PageBuilder.astro` - 16-case switch dispatcher; filters disabled sections; passes {...block} + locale to each component
- `src/components/blocks/LandingHero.astro` - Dark bg-primary-900 hero; h1 headline, subtitle, primary+secondary CTA; py-24 lg:py-32
- `src/components/blocks/LandingProblem.astro` - 3-col problem card grid (number/title/description); StackingCards applied
- `src/components/blocks/LandingGuide.astro` - Two-column image+text; urlFor webp srcset; testimonials sub-grid
- `src/components/blocks/LandingPlan.astro` - 3-step row with alternating bg (white/primary-600/brand-dark); StackingCards applied
- `src/components/blocks/LandingOffer.astro` - Before/after comparison table + services cards + bottom CTA
- `src/components/blocks/LandingTestimonials.astro` - Avatar grid with urlFor fallback to initial-letter circle
- `src/components/blocks/LandingFaq.astro` - Native details/summary; CSS chevron rotation; zero JS
- `src/components/blocks/LandingCtaFinal.astro` - Centered dark section; large CTA px-8 py-4; scarcityText in text-primary-300
- `src/components/blocks/HeroSection.astro` - v1 heroSection _type component
- `src/components/blocks/FeatureStrip.astro` - v1 featureStrip _type component
- `src/components/blocks/ProblemSolutionBlock.astro` - v1 problemSolutionBlock; StackingCards applied; uses headline per problem (not title)
- `src/components/blocks/ServicesBlock.astro` - v1 servicesBlock _type component
- `src/components/blocks/TestimonialsBlock.astro` - v1 testimonialsBlock; uses author field (not name)
- `src/components/blocks/ReferencesBlock.astro` - v1 referencesBlock _type component
- `src/components/blocks/FaqBlock.astro` - v1 faqBlock _type component
- `src/components/blocks/CtaBlock.astro` - v1 ctaBlock; uses subtext field (not copy)
- `src/components/blocks/StackingCards.astro` - Reusable GSAP/ScrollTrigger pin+scrub stacking wrapper; wraps any card-list slot
- `src/pages/index.astro` - DE homepage; getHomepageWithSections('de') + PageBuilder
- `src/pages/en/index.astro` - EN homepage; getHomepageWithSections('en') + PageBuilder
- `src/pages/es/index.astro` - ES homepage; getHomepageWithSections('es') + PageBuilder
- `src/layouts/BaseLayout.astro` - Lenis + GSAP ScrollTrigger sync injected via <script>

## Decisions Made

**1. Dual-schema dispatch (v1 + landing*):** Sanity content uses two schema generations. DE and EN homepages originally had v1 documents (heroSection, featureStrip, etc.); ES homepage uses landing* schema (landingHero, landingProblem, etc.). Rather than migrating all content to one schema, PageBuilder was extended to dispatch all 16 _types. The *-landing document slug preference was added to getHomepageWithSections so that if both a v1 and a landing* homepage document exist for a locale, the landing* version wins.

**2. StackingCards GSAP wrapper (out of plan scope):** During visual verification, the problem and plan card sections felt flat without scroll movement. A reusable StackingCards.astro wrapper using GSAP ScrollTrigger pin+scrub was added. Applied to LandingProblem, LandingPlan, and ProblemSolutionBlock. This introduced GSAP as a client-side dependency (minimal bundle, only ScrollTrigger plugin used).

**3. Lenis smooth scroll (out of plan scope):** Added globally in BaseLayout.astro after StackingCards — GSAP ScrollTrigger requires native scroll events; Lenis intercepts scroll and re-emits via RAF. Synced via `lenis.on('scroll', ScrollTrigger.update)` loop. Improves overall scroll feel.

**4. OKLCH-purple color substitutions:** The v1 React blocks used CSS class names `is--green` and `is--dark` for the jibemates purple theme. All block components use the OKLCH primary token scale (hue 290) directly: `bg-primary-700` for CTA buttons, `bg-primary-900` for dark hero/CTA sections, `text-primary-300` for accent/secondary text, `bg-primary-600` for mid-step card backgrounds.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Schema mismatch — v1 _type names differ from plan assumptions**
- **Found during:** Task 2 (PageBuilder implementation)
- **Issue:** Plan was written against speculative _type names (landingHero, landingProblem, etc.). Actual Sanity v1 content uses heroSection, featureStrip, problemSolutionBlock, servicesBlock, testimonialsBlock, referencesBlock, faqBlock, ctaBlock. Components ported in Tasks 1a/1b used the wrong type names and field shapes. Field-level mismatches also found: testimonialsBlock uses `author` (not `name`), problemSolutionBlock uses `headline` per item (not `title`), ctaBlock uses `subtext` (not `copy`).
- **Fix:** All 8 v1 block components rewritten with correct _type names and field mappings. PageBuilder updated to dispatch on real v1 names. Landing* components initially deleted (f221d13), then restored when ES homepage schema difference was discovered (0a7970e).
- **Files modified:** All 8 v1 component files, PageBuilder.astro
- **Verification:** All 3 locale homepages render live Sanity sections; confirmed in Playwright visual verification
- **Committed in:** 19ed777 (rewrite), f221d13 (delete landing*), 0a7970e (restore landing*)

**2. [Rule 1 - Bug] Dual-schema discovery — ES homepage uses landing* schema, not v1**
- **Found during:** Post-fix verification
- **Issue:** After deleting Landing* components (believing all 3 locales were v1), ES homepage was confirmed to use a page-home-es-landing document with landing* _types. The deletion broke ES rendering.
- **Fix:** Restored 8 Landing* components from git (0a7970e). Extended PageBuilder to dispatch all 16 cases (552d70c). Added *-landing slug preference in getHomepageWithSections query (3a36499).
- **Files modified:** All 8 LandingXxx.astro files, PageBuilder.astro, src/lib/sanity.ts
- **Committed in:** 0a7970e, 552d70c, 3a36499

**3. [Rule 2 - Missing Critical] StackingCards GSAP scroll effect**
- **Found during:** Task 3 visual verification checkpoint
- **Issue:** Card-grid sections (Problem, Plan) had no visual depth or scroll engagement — design requirement for jibemates-style polish not met by static grids alone
- **Fix:** Created StackingCards.astro reusable wrapper; applied to LandingProblem, LandingPlan, ProblemSolutionBlock
- **Files modified:** src/components/blocks/StackingCards.astro, LandingProblem.astro, LandingPlan.astro, ProblemSolutionBlock.astro
- **Committed in:** 1694b82, 3db47a1

**4. [Rule 2 - Missing Critical] Lenis smooth scroll + GSAP sync**
- **Found during:** StackingCards implementation (same session)
- **Issue:** GSAP ScrollTrigger requires accurate scroll position; native scroll in some browsers is jerky; adding Lenis ensures smooth scroll + correct ScrollTrigger sync
- **Fix:** Added Lenis + GSAP ScrollTrigger RAF sync in BaseLayout.astro <script>
- **Files modified:** src/layouts/BaseLayout.astro
- **Committed in:** e44afe2

---

**Total deviations:** 4 (2 schema bugs auto-fixed, 2 missing design-critical features added)
**Impact on plan:** Schema fixes were essential for any content to render. StackingCards and Lenis were design-polish additions that complete the jibemates aesthetic goal — directly aligned with project direction. No scope creep beyond project goals.

## Issues Encountered

- The plan was originally scoped for a single schema generation (landing*). Discovery of the dual-schema reality (v1 in DE/EN, landing* in ES) required two rounds of fixes and a temporary component deletion/restoration cycle. The final architecture (dual dispatch + *-landing preference) cleanly handles both without losing either.
- v1 reference code in git was useful for understanding field shapes but misleading for _type names — the React components used PascalCase component names, not the actual Sanity _type values.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 3 locale homepages render Sanity-driven content through PageBuilder
- 18 zero-JS block components ready; StackingCards reusable for Phase 9 scroll interactions
- Lenis smooth scroll active globally — Phase 9 navbar scroll behavior should use Lenis API (not window.scrollY directly)
- PageBuilder dual-schema dispatch is complete — if new schema generations are added, extend the switch in PageBuilder.astro
- FAQ uses native disclosure (zero JS confirmed)
- Phase 8 Plan 03 (blog index + post pages) already completed in parallel commits

---
*Phase: 08-static-blocks-and-blog*
*Completed: 2026-04-14*

## Self-Check: PASSED

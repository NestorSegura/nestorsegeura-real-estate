---
phase: 09-interactive-islands
plan: 05
type: execute
wave: 2
depends_on: []
files_modified:
  - src/scripts/scroll-reveal.ts
  - src/styles/global.css
  - src/layouts/BaseLayout.astro
  - src/components/blocks/HeroSection.astro
  - src/components/blocks/FeatureStrip.astro
  - src/components/blocks/ProblemSolutionBlock.astro
  - src/components/blocks/ServicesBlock.astro
  - src/components/blocks/TestimonialsBlock.astro
  - src/components/blocks/ReferencesBlock.astro
  - src/components/blocks/FaqBlock.astro
  - src/components/blocks/CtaBlock.astro
autonomous: false

must_haves:
  truths:
    - "Scrolling down the page causes block sections to fade-up into view as they enter the viewport"
    - "Implementation uses the native Intersection Observer API — NO GSAP, NO third-party animation library"
    - "Animations respect prefers-reduced-motion: reduce (no transform/opacity transition applied)"
    - "Once revealed, elements stay visible (observer.unobserve fires once)"
    - "All 8 block components opt in via a [data-reveal] attribute on their root section"
  artifacts:
    - path: "src/scripts/scroll-reveal.ts"
      provides: "Vanilla TS module: instantiates IntersectionObserver, observes [data-reveal], adds .is-visible class, unobserves after first reveal"
    - path: "src/styles/global.css"
      provides: "[data-reveal] base styles (opacity:0, translateY) + .is-visible (reset) + reduced-motion override"
    - path: "src/layouts/BaseLayout.astro"
      provides: "Imports/loads scroll-reveal.ts via <script> tag (Astro hoists & bundles)"
  key_links:
    - from: "src/scripts/scroll-reveal.ts"
      to: "[data-reveal] elements"
      via: "document.querySelectorAll subscription on DOMContentLoaded"
      pattern: "data-reveal"
---

<objective>
Implement INTR-04: scroll-triggered reveal animations using pure Intersection Observer + CSS transitions. Honor the roadmap success criterion ("no third-party animation library") and the GSAP-not-global reality from 09-RESEARCH.md. Mark the 8 block components with `data-reveal` so existing pages light up.

Purpose: Adds polish and forward-momentum feel to scrolling without inflating JS footprint. Lenis (already loaded) handles smooth scrolling; IO callbacks fire correctly during Lenis-driven scroll.
Output: One small TS module + global CSS rules + per-block opt-in.
</objective>

<execution_context>
@/Users/nestorsegura/.claude/get-shit-done/workflows/execute-plan.md
@/Users/nestorsegura/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/phases/09-interactive-islands/09-CONTEXT.md
@.planning/phases/09-interactive-islands/09-RESEARCH.md
@src/layouts/BaseLayout.astro
@src/styles/global.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create scroll-reveal script + global CSS rules + BaseLayout wiring</name>
  <files>
src/scripts/scroll-reveal.ts
src/styles/global.css
src/layouts/BaseLayout.astro
  </files>
  <action>
1. Create `src/scripts/scroll-reveal.ts`:
```ts
function init() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Reveal everything immediately — no animation
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => el.classList.add('is-visible'));
    return;
  }
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => observer.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

2. Append to `src/styles/global.css`:
```css
[data-reveal] {
  opacity: 0;
  transform: translateY(1.5rem);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  will-change: opacity, transform;
}
[data-reveal].is-visible {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal],
  [data-reveal].is-visible {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

3. In `src/layouts/BaseLayout.astro` — add at the end of `<body>` (after `<slot />` and after Lenis init):
```astro
<script>
  import '../scripts/scroll-reveal';
</script>
```
(Use module `<script>` so Astro bundles it. Do NOT use `is:inline` here — we want bundling and per-page deduplication.)
  </action>
  <verify>
`npm run build` succeeds. Inspect dist output: scroll-reveal script is present and small (<1KB minified).
  </verify>
  <done>
Module created, CSS rules in place, BaseLayout loads it on every page.
  </done>
</task>

<task type="auto">
  <name>Task 2: Sprinkle data-reveal on all 8 block component root sections</name>
  <files>
src/components/blocks/HeroSection.astro
src/components/blocks/FeatureStrip.astro
src/components/blocks/ProblemSolutionBlock.astro
src/components/blocks/ServicesBlock.astro
src/components/blocks/TestimonialsBlock.astro
src/components/blocks/ReferencesBlock.astro
src/components/blocks/FaqBlock.astro
src/components/blocks/CtaBlock.astro
  </files>
  <action>
For each of the 8 block components, add the `data-reveal` attribute to the OUTER `<section>` (or root element) of the component.

**EXCEPTION:** HeroSection — add `data-reveal` only to a sub-element (e.g., the inner content wrapper), NOT the outer section. The hero is above the fold so its outer container would never trigger the IO. Better: hero gets a small entrance animation on its inner content via `data-reveal` on heading/subheading wrappers, OR skip hero entirely if it already has a CSS entrance animation. Use judgment — if hero has existing entrance, leave alone.

For blocks already using StackingCards (LandingProblem, LandingPlan, ProblemSolutionBlock per [08-02]), the GSAP pin/scrub continues to handle their internal animations. Adding `data-reveal` to the outer wrapper provides a fade-in BEFORE the StackingCards animation begins — these compose without conflict (IO fires once, then GSAP scrub takes over).

Do NOT modify any other markup or styles. Pure attribute addition.
  </action>
  <verify>
`grep -rE "data-reveal" src/components/blocks/` shows 8 (or 7 if hero excluded) hits. `npm run build` passes. `npm run dev`, visit `/`, scroll: each block fades up as it enters viewport.
  </verify>
  <done>
All 8 blocks opt-in; visible scroll-reveal effect on the homepage.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Pure-IO scroll reveal: scroll-reveal.ts module, CSS transitions, data-reveal on 8 block components.</what-built>
  <how-to-verify>
1. `npm run dev`, open `/` in a fresh tab.
2. Slowly scroll down: each section (Feature Strip, Problem/Solution, Services, Testimonials, References, FAQ, CTA) fades up from translateY(1.5rem) to 0 as it enters viewport.
3. Scroll back up: revealed sections stay visible (no re-fade — IO unobserves after first reveal).
4. DevTools → Rendering → Emulate CSS prefers-reduced-motion: enable. Reload. All sections appear instantly, no transitions.
5. DevTools Network tab: scroll-reveal bundle is tiny (<1KB). NO GSAP loaded for scroll reveal (only Lenis from BaseLayout, and GSAP only on pages that have StackingCards).
6. Visit /blog and /analyse: scroll-reveal also active there (BaseLayout-wide).
7. Confirm no console errors.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- Build passes
- IO triggers reveal on scroll, once per element
- prefers-reduced-motion respected (instant reveal, no transition)
- No third-party animation library added (no GSAP for reveals)
- All 8 block components carry data-reveal
</verification>

<success_criteria>
INTR-04 satisfied. Phase 9 success criterion #4 met (sections animate via Intersection Observer, no third-party animation library).
</success_criteria>

<output>
After completion, create `.planning/phases/09-interactive-islands/09-05-SUMMARY.md`
</output>

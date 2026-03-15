---
phase: 03-landing-page
verified: 2026-03-15T20:30:00Z
status: gaps_found
score: 4/6 success criteria verified
gaps:
  - truth: "Every screen section contains exactly one appointment CTA that links to the external calendar"
    status: failed
    reason: "ServicesBlock renders service CTA links without target='_blank' or rel='noopener noreferrer'. All three service CTAs in the DE/EN/ES seed data link to https://cal.com/nestorsegura/erstgespraech (external URL), but the <a> tag in ServicesBlock has no external detection — they open in the same tab."
    artifacts:
      - path: "src/blocks/ServicesBlock.tsx"
        issue: "Lines 113-122: service.ctaHref renders as <a href={service.ctaHref}> with no target or rel attributes. HeroSection and CtaBlock both have ctaHref.startsWith('http') detection but ServicesBlock does not."
    missing:
      - "Add external link detection to the service CTA <a> tag: {...(service.ctaHref.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}"
  - truth: "Website analysis form CTA after scores links to external calendar in a new tab"
    status: failed
    reason: "AnalysePageClient.tsx renders a CTA link after score results are displayed using href={ctaHref} where ctaHref will be the cal.com URL from Sanity siteSettings. The <a> tag has no target='_blank' or external detection, so it opens in the same tab."
    artifacts:
      - path: "src/app/[locale]/analyse/AnalysePageClient.tsx"
        issue: "Lines 289-309: CTA <a href={ctaHref}> has no target attribute. When ctaHref is https://cal.com/nestorsegura/erstgespraech it should open in a new tab."
    missing:
      - "Add external link detection to the post-score CTA: {...(ctaHref.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}"
human_verification:
  - test: "Visit / (German homepage) and verify all 8 block sections render with German content from Sanity"
    expected: "Hero, FeatureStrip, ProblemSolutionBlock, ServicesBlock, TestimonialsBlock, ReferencesBlock, FaqBlock, CtaBlock all render with German copy (requires seed script to have been run with SANITY_API_TOKEN)"
    why_human: "Depends on Sanity data being populated — cannot verify CMS content programmatically without a live API connection"
  - test: "Visit /en and /es and verify translated content renders for English and Spanish"
    expected: "/en shows English copy (Book Free Consultation CTA), /es shows Spanish copy (Agendar consulta gratuita CTA). With localePrefix: as-needed, / is DE, /en is EN, /es is ES."
    why_human: "Same dependency on populated Sanity content"
  - test: "Resize browser to 375px width and verify no horizontal overflow on any page"
    expected: "All sections stack vertically with no horizontal scroll bar. NavbarClient desktop links hidden (md: breakpoint), hamburger visible. ScoreGauge grid wraps to 4 columns (auto-fit minmax 90px). ServicesBlock grid goes to 1 column (grid-cols-1)."
    why_human: "Responsive layout can only be confirmed visually or with browser dev tools"
  - test: "On mobile width (375px), tap hamburger button and verify drawer slides in from the right"
    expected: "Drawer.Root from @base-ui/react opens a w-72 panel from right side, overlaying page content. All nav links visible inside drawer."
    why_human: "Animation and z-index stacking require visual confirmation"
---

# Phase 3: Landing Page Verification Report

**Phase Goal:** A visitor reaching `/de` immediately sees the full German conversion page — hero through FAQ — with working appointment CTAs, a functional website analysis form returning mock scores, and a fully responsive layout.
**Verified:** 2026-03-15T20:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visiting `/de` renders all 8 block sections with German content from Sanity | ? HUMAN | PageBuilder handles all 8 `_type` values; seed script creates DE content — but Sanity population requires seed script execution with write token (human step) |
| 2 | Visiting `/` and `/es` renders corresponding locale pages with translated content | ? HUMAN | localePrefix: as-needed routes `/` to DE, `/en` to EN, `/es` to ES; PAGE_BY_SLUG_QUERY filters by `language` param; EN/ES seed documents exist in script — same Sanity dependency |
| 3 | Every screen section contains exactly one appointment CTA that links to the external calendar | FAILED | HeroSection and CtaBlock have `ctaHref.startsWith('http')` detection and add `target="_blank"`. ServicesBlock service CTAs (3 per locale × 3 locales = 9 CTAs) link to `https://cal.com/…` but lack `target="_blank"` — they open in the same tab |
| 4 | Submitting a URL to the website analysis form returns a JSON response with mock scores (performance, seo, mobile, conversion) within 2 seconds | VERIFIED | `src/app/api/analyze/route.ts` implements Zod validation, mock score generation (randomInt ranges), and `NextResponse.json()` return. No async work — response time will be sub-100ms. `AnalysePageClient.tsx` calls `fetch('/api/analyze', {method:'POST',...})` and stores `data.scores` in state |
| 5 | The layout is usable on a 375px viewport without horizontal overflow or broken components | ? HUMAN | All block sections use `px-6`, `max-w-*`, `grid-cols-1` at mobile breakpoints; Navbar hides desktop links below `md:`; no fixed-width elements found wider than 375px. Visual confirmation still required |
| 6 | The navigation bar renders with logo, menu items, and a CTA button on all locales | VERIFIED | `Navbar.tsx` is imported and rendered in `src/app/[locale]/layout.tsx` (line 44). It fetches siteSettings and passes navLinks/ctaHref/siteName to `NavbarClient`. NavbarClient renders logo (Link to /), nav links map, locale switcher (DE|EN|ES), and CTA button. Mobile: `Drawer.Root` hamburger with slide-in panel |

**Score:** 4/6 criteria fully verifiable programmatically (2 verified, 2 failed, 2 require human)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/Navbar.tsx` | Server component fetching siteSettings → NavbarClient | VERIFIED | 23 lines; imports `sanityFetch` and `SITE_SETTINGS_QUERY`; returns `<NavbarClient navLinks ctaHref siteName />` |
| `src/components/NavbarClient.tsx` | Client interactive navbar with drawer, scroll state, locale switcher | VERIFIED | 271 lines; `'use client'`; IntersectionObserver sentinel; `@base-ui/react/drawer` Drawer.Root; `useRouter` from `@/i18n/navigation` for locale switching; `DE|EN|ES` buttons |
| `src/app/[locale]/layout.tsx` | Locale layout importing and rendering Navbar above children | VERIFIED | Imports `Navbar` from `@/components/Navbar`; renders `<Navbar />` above `<main>{children}</main>` |
| `src/app/globals.css` | `section[id] { scroll-margin-top: 80px }` rule | VERIFIED | Line 134 confirmed |
| `src/app/api/analyze/route.ts` | POST endpoint with Zod validation and mock scores | VERIFIED | 52 lines; `z.object({url:z.string().url()})` validation; 5 mock score categories; 400 on bad JSON; 422 on invalid URL; OPTIONS handler |
| `src/app/[locale]/analyse/page.tsx` | Server wrapper fetching ctaHref → AnalysePageClient | VERIFIED | 28 lines; fetches `SITE_SETTINGS_QUERY`; passes `ctaHref` (falls back to `#kontakt`) |
| `src/app/[locale]/analyse/AnalysePageClient.tsx` | Client component with URL form and SVG score gauges | VERIFIED | 315 lines; form → `fetch('/api/analyze')` → `setScores`; `ScoreGauge` SVG with `strokeDashoffset` animation; `useEffect` timeout triggers animate state; locale-aware labels |
| `scripts/seed-content.ts` | Idempotent Sanity seed script for all 3 locales + siteSettings | VERIFIED | 898 lines; `createOrReplace` for `siteSettings`, `page-home-de`, `page-home-en`, `page-home-es`; all 8 block sections per locale |
| `src/blocks/FeatureStrip.tsx` | `id="features"` on section | VERIFIED | Line 35: `id={sectionId ?? 'features'}` |
| `src/blocks/ProblemSolutionBlock.tsx` | `id="problem"` on section | VERIFIED | `id={sectionId ?? 'problem'}` |
| `src/blocks/ServicesBlock.tsx` | `id="leistungen"` on section | VERIFIED | Line 36: `id={sectionId ?? 'leistungen'}` |
| `src/blocks/TestimonialsBlock.tsx` | `id="referenzen"` on section | VERIFIED | `id={sectionId ?? 'referenzen'}` |
| `src/blocks/ReferencesBlock.tsx` | `id="projekte"` on section | VERIFIED | `id={sectionId ?? 'projekte'}` |
| `src/blocks/FaqBlock.tsx` | `id="faq"` on section | VERIFIED | Line 43: `id={sectionId ?? 'faq'}` |
| `src/blocks/CtaBlock.tsx` | `id="kontakt"` on section; external CTA link | VERIFIED | Line 40: `id={sectionId ?? 'kontakt'}`; line 89: `ctaHref.startsWith('http')` detection with `target="_blank"` |
| `src/blocks/HeroSection.tsx` | External CTA link detection | VERIFIED | Line 156: `ctaHref.startsWith('http')` detection with `target="_blank" rel="noopener noreferrer"` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `Navbar.tsx` | `@/sanity/lib/live` | `sanityFetch({query: SITE_SETTINGS_QUERY})` | WIRED | Line 10 confirmed |
| `NavbarClient.tsx` | `@base-ui/react/drawer` | `Drawer.Root` / `Drawer.Trigger` / `Drawer.Portal` | WIRED | Line 8 import; lines 147-224 usage |
| `NavbarClient.tsx` | `@/i18n/navigation` | `router.replace({pathname,params},{locale})` | WIRED | Line 6 import; lines 61-66 usage |
| `layout.tsx` | `Navbar.tsx` | `<Navbar />` above `<main>` | WIRED | Lines 9+44 confirmed |
| `AnalysePageClient.tsx` | `/api/analyze` | `fetch('/api/analyze', {method:'POST',...})` | WIRED | Line 134 confirmed; response stored at line 147 |
| `route.ts` | `zod` | `z.object({url:z.string().url()})` | WIRED | Lines 4-6 confirmed |
| `page.tsx` ([locale]) | `PageBuilder` | `<PageBuilder sections={page.sections} />` | WIRED | Line 40 confirmed |
| `page.tsx` ([locale]) | Sanity | `sanityFetch({query:PAGE_BY_SLUG_QUERY, params:{slug:'home',language:locale}})` | WIRED | Lines 23-26 confirmed |
| `ServicesBlock.tsx` | external calendar | `service.ctaHref` link | PARTIAL | CTA link renders but lacks `target="_blank"` for external URLs |
| `AnalysePageClient.tsx` | external calendar | `ctaHref` post-score CTA | PARTIAL | CTA link renders but lacks `target="_blank"` for external URLs |

---

### Requirements Coverage

| Requirement | Status | Notes |
|------------|--------|-------|
| LAND-01: 8 block sections render on `/de` | ? HUMAN | Code path exists; depends on Sanity content |
| LAND-02: EN and ES locale pages with translated content | ? HUMAN | Code path exists; depends on Sanity content |
| LAND-03: Website analysis form → mock scores within 2s | SATISFIED | API route verified; client fetch wired |
| LAND-04: Every section CTA links to external calendar (new tab) | BLOCKED | ServicesBlock service CTAs missing `target="_blank"` |
| LAND-05: 375px responsive layout | ? HUMAN | Code reviewed — no obvious overflow; visual verification needed |
| LAND-06: Navbar on all locales with logo, links, CTA | SATISFIED | Navbar in locale layout; wired to Sanity siteSettings |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/api/analyze/route.ts` | 30-31 | `TODO: Replace mock scores with PageSpeed Insights API call` | Info | Intentional — mock scores are the specified behavior for this phase |
| `src/blocks/ReferencesBlock.tsx` | 66 | `{/* Image placeholder or image */}` comment | Info | Non-blocking — comment describes intentional fallback rendering (colored div with icon), not a stub implementation |

No blocker anti-patterns found. The TODO comments are intentional and documented; the "placeholder" comment in ReferencesBlock labels a designed UI fallback (an image slot), not missing functionality.

---

### Human Verification Required

#### 1. All 8 sections render on `/de` with German content

**Test:** After running `npx tsx scripts/seed-content.ts` (with SANITY_API_TOKEN set), visit http://localhost:3000/de (or `/` since DE is default locale with `localePrefix: as-needed`). Scroll through the full page.
**Expected:** 8 distinct sections visible in order: Hero (dark purple, SVG path animation), FeatureStrip (3 cards), ProblemSolutionBlock (3 numbered problems), ServicesBlock (3 service cards), TestimonialsBlock (3 quotes), ReferencesBlock (3 project cards), FaqBlock (accordion), CtaBlock (purple CTA). All German copy.
**Why human:** Depends on Sanity database content populated by seed script execution.

#### 2. EN and ES locale pages render with translated content

**Test:** Visit `/en` and `/es` after seed script has run.
**Expected:** `/en` shows English copy ("Your website is not working for you?", "Book Free Consultation"). `/es` shows Spanish copy ("¿Tu página web no está trabajando para ti?", "Agendar consulta gratuita").
**Why human:** Same Sanity data dependency.

#### 3. Layout is usable at 375px viewport

**Test:** Open browser DevTools, set viewport to 375px width. Navigate through `/de`, scroll all sections, visit `/de/analyse`.
**Expected:** No horizontal scrollbar on any section. Navbar shows hamburger (Menu icon), desktop links hidden. ServicesBlock shows 1-column grid. All text readable without zooming.
**Why human:** Responsive layout requires visual verification; CSS-level overflow can only be confirmed in a browser.

#### 4. Mobile drawer slides in from right

**Test:** At 375px viewport, click the hamburger button in the navbar.
**Expected:** Dark panel (w-72, dark background) slides in from the right with transition animation. Contains: site name, nav links list, DE|EN|ES locale switcher, CTA button. X close button dismisses drawer.
**Why human:** Animation and z-index stacking (drawer z-[70] over page content) require visual confirmation.

---

### Gaps Summary

Two code-level gaps were found, both affecting success criterion 3 ("every section CTA links to external calendar in a new tab"):

**Gap 1 — ServicesBlock missing external link detection:** `src/blocks/ServicesBlock.tsx` renders service CTA links without checking if the URL is external. `HeroSection` and `CtaBlock` both have the `ctaHref.startsWith('http')` pattern, but `ServicesBlock` was not updated consistently. The fix is a one-line spread on the `<a>` tag (same pattern as the other blocks).

**Gap 2 — AnalysePageClient post-score CTA missing external link detection:** The CTA button displayed after score results in `AnalysePageClient.tsx` uses `href={ctaHref}` but has no `target="_blank"` for external URLs. The `ctaHref` prop will be `https://cal.com/nestorsegura/erstgespraech` from Sanity siteSettings. Same fix pattern needed.

Both gaps are minor (single-line fix each) and have no structural dependency. They do not affect rendering, form functionality, or content delivery — only the tab behavior of two specific CTA link types.

---

*Verified: 2026-03-15T20:30:00Z*
*Verifier: Claude (gsd-verifier)*

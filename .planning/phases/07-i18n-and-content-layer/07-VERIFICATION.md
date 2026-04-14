---
phase: 07-i18n-and-content-layer
verified: 2026-04-13T22:41:00Z
status: passed
score: 9/9 must-haves verified
gaps: []
human_verification:
  - test: "Visit / in a browser and confirm Clash Display renders for h1, Chivo for body text"
    expected: "Headings visually distinct from body — variable-weight sans-serif for headings, different weight/style for body"
    why_human: "Font rendering is visual; @font-face rules and preloads are confirmed wired, but actual glyph substitution can't be verified without rendering"
  - test: "Set ns_locale=en cookie, visit /, and confirm redirect to /en"
    expected: "Browser redirects to /en within the same tab without a flash of German content"
    why_human: "Cookie-based JS redirect is in the built HTML but requires a real browser session to validate behavior"
  - test: "Visit /de and /de/analyse in a browser (or curl -I)"
    expected: "301 redirect to / and /analyse respectively — no content served at /de paths"
    why_human: "Cloudflare _redirects processing cannot be verified locally without wrangler dev serving the dist output"
---

# Phase 7: i18n and Content Layer Verification Report

**Phase Goal:** Astro's built-in i18n routes German content at `/` (no prefix), English at `/en`, and Spanish at `/es`, all content strings load from messages/*.json, GROQ queries return locale-correct data, and BaseLayout applies Clash Display and Chivo fonts globally.
**Verified:** 2026-04-13T22:41:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visiting `/` renders German content with no locale prefix | VERIFIED | `dist/client/index.html` has `lang="de"`, nav renders "Startseite/Leistungen/Über uns", h1 "Mehr Anfragen. Mehr Kunden. Mehr Umsatz." — no locale prefix in path |
| 2 | Visiting `/en` renders English content | VERIFIED | `dist/client/en/index.html` has `lang="en"`, nav renders "Home/Services/About", h1 "More Leads. More Clients. More Revenue." |
| 3 | Visiting `/es` renders Spanish content | VERIFIED | `dist/client/es/index.html` has `lang="es"`, nav renders "Inicio/Servicios/Nosotros", body text in Spanish; title comes from Sanity ES doc (not fallback) |
| 4 | UI strings load from messages/*.json via src/i18n/utils.ts | VERIFIED | `useTranslations()` in `src/i18n/utils.ts` imports de/en/es JSON directly; all nav labels, hero text in built HTML match messages/*.json values; 0 missing keys on both en and es |
| 5 | GROQ queries return locale-correct data with DE fallback | VERIFIED | `src/lib/sanity.ts` implements two-step parameterized fetch (exact locale then 'de' fallback); `getPageWithFallback` returns `{page, isFallback}` tuple; EN/ES pages show `isFallback`-conditional banner; build confirmed sections: 8 for all homepages (live Sanity data returned) |
| 6 | BaseLayout applies Clash Display (headings) and Chivo (body) globally | VERIFIED | `global.css` has `@font-face` for both fonts with `font-display: swap`; `body { font-family: var(--font-body) }` and `h1-h6 { font-family: var(--font-heading) }`; both are Tailwind v4 `@theme inline` tokens; CSS is in every page's linked stylesheet |
| 7 | `/de/*` 301 redirect exists | VERIFIED | `public/_redirects` contains `/de / 301` and `/de/* /:splat 301`; file is copied to `dist/client/_redirects` on build |
| 8 | Missing Sanity doc falls back to DE with locale-appropriate banner | VERIFIED | `getPageWithFallback` returns `{page: deDoc, isFallback: true}` when locale doc missing; EN page shows "This page isn't translated yet — showing the German version"; ES shows "Esta página aún no está traducida — mostrando la versión en alemán" |
| 9 | Translated route segments exist: `/analyse`, `/en/analyze`, `/es/analizar` | VERIFIED | All three pages prerendered: `dist/client/analyse/index.html` (lang="de"), `dist/client/en/analyze/index.html` (lang="en"), `dist/client/es/analizar/index.html` (lang="es"); `src/i18n/routes.ts` drives the segment mapping |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/i18n/utils.ts` | LOCALES, Locale, useTranslations, useTranslationArray with DE fallback | VERIFIED | 71 lines, exports all 4 items, dot-notation traversal, DE fallback, key-as-sentinel for missing |
| `src/i18n/routes.ts` | ROUTE_SEGMENTS map + localizeRoute() | VERIFIED | 37 lines, covers blog and analyse segments, correct prefix logic per locale |
| `messages/de.json` | Full German UI strings | VERIFIED | 147 lines, all sections (nav, hero, features, problem, solution, services, faq, cta, contact, footer, analysis, common) |
| `messages/en.json` | Full English UI strings, 0 missing keys vs DE | VERIFIED | 147 lines, identical key structure to de.json, 0 missing keys confirmed by build |
| `messages/es.json` | Full Spanish UI strings, 0 missing keys vs DE | VERIFIED | 147 lines, identical key structure to de.json, 0 missing keys confirmed by build |
| `src/lib/sanity.ts` | 5 locale-filtered GROQ helpers with fallback | VERIFIED | 151 lines; getPageForLocale, getPageWithFallback, getHomepageForLocale, getAllPostSlugsForLocale, getPostWithTranslations — all parameterized |
| `src/layouts/BaseLayout.astro` | HTML shell, lang attr, font preloads with crossorigin, slot | VERIFIED | 39 lines; lang={locale}, two crossorigin preload links for subset fonts, global.css import, slot |
| `src/styles/global.css` | @font-face rules (font-display:swap), Tailwind tokens, body/h font assignments | VERIFIED | 28 lines; both @font-face blocks with swap, @theme inline tokens, body/h selectors |
| `public/fonts/ClashDisplay-Variable-subset.woff2` | Subsetted font, Latin+Latin Extended | VERIFIED | 22,612 bytes (24% reduction from 29,432 byte source) |
| `public/fonts/Chivo-Variable-subset.woff2` | Subsetted font, Latin+Latin Extended | VERIFIED | 26,772 bytes (19% reduction from 33,220 byte source) |
| `public/_redirects` | /de and /de/* 301 redirects | VERIFIED | 3 lines; both redirect rules present; copied to dist/client/ on build |
| `scripts/check-i18n-keys.mjs` | Build-time key audit, exits 0 (warning-only) | VERIFIED | 60 lines; flattens keys, compares en/es vs de, logs missing keys, exits 0 |
| `src/pages/index.astro` | DE homepage, BaseLayout, useTranslations, getHomepageForLocale | VERIFIED | Imports all three, cookie redirect script scoped to DE root only |
| `src/pages/en/index.astro` | EN homepage at /en with isFallback banner | VERIFIED | Correct locale const, isFallback-driven banner with English text |
| `src/pages/es/index.astro` | ES homepage at /es with isFallback banner | VERIFIED | Correct locale const, isFallback-driven banner with Spanish text |
| `src/pages/analyse.astro` | DE analysis page at /analyse | VERIFIED | lang=de, translates analysis.title/subtitle from DE messages |
| `src/pages/en/analyze.astro` | EN analysis page at /en/analyze | VERIFIED | lang=en, translates analysis.title/subtitle from EN messages |
| `src/pages/es/analizar.astro` | ES analysis page at /es/analizar | VERIFIED | lang=es, translates analysis.title/subtitle from ES messages |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `index.astro` (DE/EN/ES) | `src/i18n/utils.ts` | `useTranslations(locale)` | WIRED | All 6 locale pages import and call `useTranslations`; nav labels rendered in built HTML match messages/*.json |
| `index.astro` (DE/EN/ES) | `src/lib/sanity.ts` | `getHomepageForLocale(locale)` | WIRED | All 3 index pages fetch from Sanity at build time; sections: 8 confirms live data was returned |
| `BaseLayout.astro` | `src/styles/global.css` | `import '../styles/global.css'` | WIRED | CSS present in every page's linked stylesheet in built output |
| `BaseLayout.astro` | `/fonts/*.woff2` | `<link rel="preload" ...>` | WIRED | Both subset font preloads with `crossorigin` in every page's `<head>` |
| `global.css` | `/fonts/*.woff2` | `@font-face src: url(...)` | WIRED | @font-face rules in built CSS reference correct subset paths |
| `global.css` | `h1-h6` | `font-family: var(--font-heading)` | WIRED | `h1,h2,h3,h4,h5,h6{font-family:var(--font-heading)}` confirmed in built CSS |
| `global.css` | `body` | `font-family: var(--font-body)` | WIRED | `body{font-family:var(--font-body)}` confirmed in built CSS |
| `astro.config.mjs` | Astro i18n | `i18n: { defaultLocale: 'de', prefixDefaultLocale: false }` | WIRED | Config confirms DE gets no prefix; build output confirms / (not /de/) as DE root |
| `package.json` build script | `check-i18n-keys.mjs` | `node scripts/check-i18n-keys.mjs && astro build` | WIRED | Key audit runs before every build; both locales confirmed 0 missing keys |
| EN/ES `index.astro` | Translation banner | `{isFallback && page && (<div ...>)}` | WIRED | Banner conditional on `isFallback` from `getPageWithFallback`; locale-specific text in each page |

### Anti-Patterns Found

No blockers or warnings found. The `analysis.placeholder` key in messages/*.json contains the string "placeholder" but this is legitimate form placeholder text (an `<input placeholder>` value), not a code stub pattern.

### Human Verification Required

#### 1. Font Rendering Visually Correct

**Test:** Load `dist/client/index.html` in a browser (or run `npm run preview` and visit `/`)
**Expected:** H1/H2/H3 headings render in Clash Display (geometric, variable-weight sans-serif); body paragraphs render in Chivo (different humanist sans-serif). FOUT (flash of unstyled text) may occur briefly before fonts load — this is acceptable per the `font-display: swap` decision.
**Why human:** @font-face rules, preloads, and CSS assignments are all structurally correct, but actual glyph substitution and visual distinctiveness require browser rendering.

#### 2. Cookie Locale Redirect Behavior

**Test:** In a browser, set a cookie `ns_locale=en` (via DevTools Application > Cookies), then visit `/`
**Expected:** Page briefly loads then redirects to `/en` via `window.location.replace`. The `sessionStorage` guard prevents infinite redirect loops.
**Why human:** The inline script is present in the DE homepage HTML and structurally correct, but cookie/sessionStorage interaction requires a real browser session.

#### 3. Cloudflare _redirects Processing

**Test:** Run `wrangler dev` from `dist/` (or deploy to Cloudflare Pages staging) and `curl -I https://<preview-url>/de` and `curl -I https://<preview-url>/de/analyse`
**Expected:** Both return HTTP 301 with `Location: /` and `Location: /analyse` respectively
**Why human:** `public/_redirects` is present in `dist/client/` and has the correct rules, but Cloudflare Pages redirect processing can only be validated against a real Cloudflare runtime — the local Astro preview server does not process `_redirects`.

### Gaps Summary

No gaps. All 9 observable truths are verified through three levels (existence, substantive, wired). The build completes cleanly with 0 TypeScript errors, 0 missing i18n keys, and all 6 locale pages prerendered with correct `lang` attributes, translated UI strings, font preloads, and Sanity data fetched at build time.

The three human verification items are operational concerns (font rendering aesthetics, cookie JS behavior, Cloudflare redirect processing) that cannot be verified without a browser/Cloudflare runtime, not gaps in implementation.

---

*Verified: 2026-04-13T22:41:00Z*
*Verifier: Claude (gsd-verifier)*

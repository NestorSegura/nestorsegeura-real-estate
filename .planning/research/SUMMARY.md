# Project Research Summary

**Project:** nestorsegura-real-estate
**Domain:** Multilingual B2B lead generation landing page — professional web strategy services targeting German real estate agencies (Immobilienmakler), Hamburg market
**Researched:** 2026-03-15
**Confidence:** HIGH (stack and architecture); MEDIUM (features and German market specifics)

---

## Executive Summary

This is a focused B2B conversion site, not a portfolio. Its single job is to move a German real estate agent from "first visit" to "booked appointment" through a structured three-step funnel: free website analysis tool → paid automated report (€49) → calendar booking. The site is multilingual (DE/EN/ES) with German as the canonical revenue page. The stack — Next.js 15, Sanity v3, next-intl v4, Tailwind v4, hosted on a Hostinger VPS via PM2 — is entirely user-confirmed and has no viable alternatives worth reconsidering. Research validates exact versions, integration patterns, and identifies the specific failure modes in this combination.

The recommended approach is to build the German conversion funnel end-to-end before adding any secondary language pages, CMS sophistication, or additional features. The free website analysis tool is the highest-priority differentiator: interactive lead magnets convert at 6.2% versus 3.8% for static content, and it qualifies intent before any human interaction occurs. The €49 paid report should only be built after the free tool proves demand. The architecture pattern — Sanity Page Builder blocks dispatched by a TypeScript switch component, dual i18n (Sanity for content, next-intl for UI strings), tag-based cache invalidation via webhooks — is well-documented with official sources at HIGH confidence.

The key risk cluster is infrastructure and integration correctness, not feature complexity. Five specific failure modes — middleware catching /studio and /api routes, standalone output missing public/ on VPS, Sanity CDN interfering with ISR revalidation, webhook secret mismatch, and async params not awaited in Next.js 15 — will each silently break production in ways that are hard to debug but trivially preventable if addressed at the right build phase. The second risk is product: the free analysis tool must return real data (PageSpeed/Lighthouse API), not fake scores. A "score generator" will be immediately noticed by technically-literate agency owners and destroys credibility.

---

## Key Findings

### Recommended Stack

The stack is fully validated against the npm registry and official documentation as of 2026-03-15. Use `next@15` (not v16, which just shipped and has unknown migration costs), `sanity@5` (the npm package name for Sanity Studio v3 — do not install `sanity@3`), `next-intl@4` (ESM-only, requires TypeScript 5+), and `tailwindcss@4` with `@tailwindcss/postcss` (the JS config file is gone in v4; all config lives in CSS `@theme` directives).

One clarification required: "Google Labs Stitch" referenced in planning context resolves to an AI design ideation tool at stitch.withgoogle.com, not an npm-installable component library. The referenced GitHub URL (nicholasgriffintn/stitch) returns 404. **Use shadcn/ui + Tailwind v4 as the component foundation.** This is a non-blocking clarification — shadcn/ui is superior for this use case anyway.

**Core technologies:**
- `next@15` + `react@19`: App Router framework — stable LTS-equivalent; v16 too new for greenfield
- `sanity@5` + `next-sanity@12`: Headless CMS with embedded Studio — official toolkit, VisualEditing and GROQ client included
- `next-intl@4`: i18n routing and translations — de facto standard for Next.js App Router; Pages Router alternatives don't apply
- `tailwindcss@4` + `shadcn/ui`: Utility-first styling with accessible components — CSS-native v4 is zero-config; shadcn copy-paste avoids runtime bundle
- `motion@12`: UI animations — this IS framer-motion rebranded; install `motion`, not `framer-motion`
- `react-hook-form@7` + `zod@4`: Form management and validation — RHF is the current industry standard; Formik is in maintenance mode
- `next-sitemap@4`: Multilingual SEO — better hreflang support than Next.js built-in sitemap
- `sharp@0.34`: Server-side image processing — **required** for Next.js Image Optimization in standalone mode

### Expected Features

The feature set is organized around a single conversion funnel. Every feature either supports that funnel or is deferred. The target audience (Immobilienmakler) is skeptical of generic digital agencies; domain-specific language (Exposé, Anfrage, Vermarktung, Portalprovision) signals genuine industry knowledge and is a copy-level differentiator that costs nothing to implement.

**Must have for launch (P1):**
- German-language hero with specific Immobilienmakler value proposition — establishes target audience in 3–5 seconds; without it, visitors self-select out
- Three-step funnel visualization (free tool → €49 report → appointment booking) — conversion path must be visually obvious, not buried in prose
- Free website analysis tool with DSGVO-compliant email capture — primary lead magnet; converts at 6.2% vs 3.8% for static PDFs; must use real analysis data (PageSpeed/Lighthouse)
- Appointment calendar embed (already configured) — embed directly in the page, not linked off-site; external tab drops conversion
- 2–3 testimonials with full name and agency name — minimum B2B credibility threshold; generic quotes have no effect
- Mobile-responsive layout with sub-3s load time — non-negotiable; especially damaging if the pitch is "let me improve your digital presence"
- hreflang tags for DE/EN/ES with correct self-referencing — required from day one; missing self-reference causes Google to ignore the tags entirely

**Should have after validation (P2):**
- Paid automated report (€49) with Stripe + PDF delivery — build only after free tool proves demand; do not build payment before lead validation
- One case study with quantified before/after results — even a demonstration audit of a public agency site is sufficient to launch
- Blog with first 3 DE-language articles targeting Immobilienmakler search intent — compounds into organic acquisition; content must be vertical-specific, not generic developer topics

**Defer to v2+:**
- EN/ES full-funnel pages — build DE funnel first; replicate after messaging is validated with paying clients
- Automated email nurture sequence — valuable but requires sufficient email volume to justify automation build time
- Sanity Page Builder full implementation — useful for copy iteration; defer until core funnel is stable
- Interactive ROI calculator — higher complexity; defer until simpler tool's ROI is proven

**Anti-features to avoid:**
- Portfolio/project gallery — scatters attention on a conversion page; replace with 1–2 outcome-focused case studies
- Live chat widget — operational burden for a solo practitioner; use appointment calendar as primary engagement
- Newsletter subscription — implies ongoing production commitment; use free tool as the email collection mechanism instead
- Generic "services" section listing technologies — Immobilienmakler evaluate on business outcomes, not stack

### Architecture Approach

The architecture is a standard Next.js 15 App Router pattern with Sanity as headless CMS and next-intl for i18n routing. All user-facing routes live under `app/[locale]/`; Sanity Studio embeds at `app/studio/` (outside the locale segment, to avoid middleware interference). Locale detection and rewriting is handled by a single `middleware.ts` file that must explicitly exclude `/studio` and `/api` from its matcher. Content rendering uses a Page Builder pattern: Sanity stores page sections as an array of typed block objects; `PageBuilder.tsx` dispatches to block components via a TypeScript switch on `_type`. Two i18n systems coexist and must not be conflated — Sanity handles translated *content* (body copy, page headings); next-intl handles translated *UI strings* (navigation labels, button text, form placeholders).

**Major components:**
1. `middleware.ts` — locale detection and URL rewriting; must exclude `/studio` and `/api` or both break silently
2. `app/[locale]/layout.tsx` — calls `setRequestLocale(locale)` (required for static rendering), wraps tree in `NextIntlClientProvider`
3. `components/blocks/PageBuilder.tsx` — dispatches Sanity `content[]` array to typed block components via `_type` switch
4. `sanity/lib/fetch.ts` — `sanityFetch` wrapper with `useCdn: false` for revalidation path and cache tags
5. `app/api/revalidate/route.ts` — Sanity webhook handler; verifies HMAC signature, calls `revalidateTag` to bust Next.js cache
6. `i18n/routing.ts` — single source of truth for all locales; imported by middleware, layouts, and navigation helpers

### Critical Pitfalls

1. **Middleware catches /studio and /api** — Exclude both explicitly in middleware matcher: `/((?!api|studio|_next|_vercel|.*\\..*).*)`; verify by hitting `/studio` before writing any pages
2. **Standalone output silently omits public/ and .next/static/** — Add to deploy script: `cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/static`; static assets will 404 on VPS without this
3. **Sanity CDN + ISR = stale content that never refreshes** — Use `useCdn: false` in the `sanityFetch` client (the revalidation path); `useCdn: true` only for non-revalidating reads
4. **async params not awaited in Next.js 15** — Next.js 15 made params a Promise; run `npx @next/codemod@latest next-async-request-api .` during setup; synchronous access causes TypeScript errors and will break in v16
5. **Webhook secret mismatch** — Configure secret in both `.env.production` on VPS and Sanity webhook settings; test immediately after first deploy with Sanity's "Send test notification" button

---

## Implications for Roadmap

Research points to a clear 4-phase structure driven by three dependency chains: (1) infrastructure must be correct before CMS or i18n can work reliably; (2) the free analysis tool must go live before building the paid report; (3) the German funnel must be validated before expanding to EN/ES.

### Phase 1: Foundation and Project Setup

**Rationale:** The middleware exclusion pitfall and async params issue will silently corrupt all subsequent work if not addressed first. TypeGen must run before GROQ queries or block component types can be written without using `any`. These are blocking dependencies with no workaround.
**Delivers:** Working Next.js 15 + Sanity + next-intl skeleton with correct i18n routing, Sanity Studio accessible at `/studio`, no locale interference on API routes, TypeScript strict mode clean.
**Addresses:** Project scaffold, Sanity schema foundation, i18n routing config, dev tooling
**Avoids:** Middleware catches /studio and /api (Pitfall 1); async params not awaited (Pitfall 7); `"use client"` on large trees (ongoing)
**Research flag:** Standard patterns — well-documented by official Next.js and next-intl docs; no deeper research phase needed

### Phase 2: CMS Integration and Content Layer

**Rationale:** Sanity schema design is a one-way door — changing block types after content is entered is expensive. The Page Builder schema, TypeGen output, GROQ queries with locale filtering, and the revalidation webhook must all be established together before any rendering work begins. This phase locks in the content model.
**Delivers:** Sanity Page Builder schemas (Hero, Features, Testimonials, CTA), TypeGen-generated types, typed GROQ queries with locale parameter, revalidation webhook wired and tested, dual i18n pattern established (Sanity content fields vs next-intl messages)
**Uses:** `sanity@5`, `next-sanity@12`, `@sanity/client@7`, `@sanity/image-url@2`, `@portabletext/react@6`
**Implements:** PageBuilder.tsx dispatch pattern, `sanityFetch` with `useCdn: false`, cache tag constants in shared file
**Avoids:** Sanity CDN + ISR stale content (Pitfall 3); mixed time + tag revalidation (Pitfall 4); webhook secret mismatch (Pitfall 5); mismatched cache tag strings (Anti-Pattern 5)
**Research flag:** Standard patterns — official Sanity Learn course covers all patterns; no deeper research needed

### Phase 3: German Conversion Funnel (Core Revenue Page)

**Rationale:** This is the site's primary conversion surface. The German page must be fully functional before any secondary locales are built. Contains the highest-complexity feature (free analysis tool) and the highest-priority differentiators. Build DE to completion; validate that it generates leads before expanding.
**Delivers:** German hero section with Immobilienmakler value proposition, three-step funnel visualization, free website analysis tool with real PageSpeed/Lighthouse data output, DSGVO-compliant email capture with consent checkbox and privacy policy, appointment calendar embed, 2–3 testimonials, mobile-responsive layout, hreflang tags for all three locales
**Uses:** `react-hook-form@7` + `zod@4` (forms), `motion@12` (UI transitions), `next-sitemap@4` (hreflang), `shadcn/ui` components
**Implements:** `/api/analyze` route with real external API call, DSGVO consent flow, Server Actions for form submission
**Avoids:** hreflang missing self-reference (UX Pitfall); no loading state on form submissions (UX Pitfall); Sanity data fetched in Client Components (Architecture Anti-Pattern 1)
**Research flag:** Needs research during planning — the website analysis tool's external API integration (Google PageSpeed API, Lighthouse CI) is not yet specified; requires deeper research on rate limits, auth, and response shape before implementation

### Phase 4: Deployment, CI, and Paid Report

**Rationale:** VPS deployment must be hardened before the paid report (which involves money and automated delivery) is built. The standalone output copy step, PM2 ecosystem config, and webhook secret sync are all deployment-layer concerns. The paid report (Stripe + PDF generation + email delivery) is built after the free tool confirms demand.
**Delivers:** Production VPS deploy with correct standalone output, PM2 cluster config, Nginx proxy, static assets verified, Sanity webhook tested end-to-end. Then: paid report with Stripe integration, automated PDF generation, Resend email delivery, webhook from Stripe to trigger delivery.
**Uses:** `sharp@0.34` (required for VPS image optimization), PM2 `ecosystem.config.js` with correct `cwd`, Stripe (not yet in stack — needs to be added)
**Implements:** Deploy script with static asset copy, `.env.production` with all secrets, Stripe webhook handler
**Avoids:** Standalone output missing public/ (Pitfall 2); webhook secret mismatch (Pitfall 5); Sanity API token in NEXT_PUBLIC_ env var (Security); PM2 cluster wrong cwd (Performance)
**Research flag:** Standard deployment patterns — Next.js self-hosting docs cover this; Stripe integration is well-documented. No research phase needed unless automated PDF generation approach is undecided.

### Phase 5: EN/ES Localization and Content Expansion

**Rationale:** Secondary locales and content marketing only make sense after the German funnel is validated. Blog content and EN/ES pages compound over time but do not drive immediate revenue. Defer until at least one €49 report has been purchased.
**Delivers:** EN and ES full-funnel pages (lighter on conversion elements than DE), blog with first 3 DE-language Immobilienmakler articles in Sanity, first case study with quantified results
**Uses:** Sanity localized fields, blog post schema (`postType.ts`), `@tailwindcss/typography` (blog prose rendering), `@portabletext/react`
**Implements:** `app/[locale]/blog/[slug]/page.tsx`, Sanity blog schema, hreflang refinement
**Avoids:** localePrefix as-needed redirect loop (Pitfall 6) — document cookie behavior as intentional in ADR
**Research flag:** Standard patterns — blog with Sanity and next-intl is well-documented; no deeper research needed

### Phase Ordering Rationale

- Phase 1 before all others: middleware exclusions and TypeGen are hard blockers; writing any feature code before these is done creates rework
- Phase 2 before Phase 3: Sanity schema is a content model decision that's expensive to change; lock it in before building any UI that depends on it
- Phase 3 before Phase 4: Free tool must go live on a working deployment to validate demand; no point building the paid report against an unvalidated funnel
- Phase 4 includes deployment hardening before paid product: money changes hands in Phase 4; production infrastructure must be verified before Stripe goes live
- Phase 5 last: content expansion compounds over time; starting it before the German funnel converts would be premature optimization

### Research Flags

**Needs deeper research during planning:**
- **Phase 3 (Website Analysis Tool):** The specific external API for the analysis feature — Google PageSpeed Insights API, Lighthouse CI, or a third-party scraping service — is not yet decided. Each has different rate limits, auth requirements, and response shapes that affect the `/api/analyze` route implementation. Requires a focused research spike before starting Phase 3 implementation.
- **Phase 4 (PDF Generation):** Automated PDF report generation approach is not in the current stack research. Candidates include Puppeteer, `@react-pdf/renderer`, or a third-party PDF API. This needs evaluation before Phase 4 starts.

**Standard patterns (no research phase needed):**
- **Phase 1:** Next.js 15 + next-intl + Sanity setup is covered exhaustively in official documentation at HIGH confidence
- **Phase 2:** Sanity Page Builder pattern is covered by the official Sanity Learn course; all patterns verified
- **Phase 4 (deployment):** Next.js self-hosting with PM2 is documented; pitfalls identified and preventable
- **Phase 5:** Sanity blog with next-intl is a well-trodden pattern

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm registry and official docs on 2026-03-15; compatibility matrix confirmed |
| Features | MEDIUM | B2B landing page patterns are well-documented (MEDIUM-HIGH); German real estate digital market specifics are less verified (LOW-MEDIUM); conversion benchmarks from multiple concordant sources |
| Architecture | HIGH | All major patterns verified against official Next.js, Sanity, and next-intl documentation; code examples validated |
| Pitfalls | HIGH | Majority verified through official documentation, official GitHub issues, and Vercel's engineering blog |

**Overall confidence:** HIGH — the technical foundation is solid. The main uncertainty is German market-specific conversion behavior, which is low-risk because the architecture supports rapid iteration.

### Gaps to Address

- **Google Stitch reference:** The original project context referenced a "Google Stitch" component library. The URL is dead; the product is an AI design tool. This has been resolved by choosing shadcn/ui + Tailwind v4. Confirm with project owner that this substitution is acceptable before Phase 1 begins.
- **Website analysis tool API:** No external API has been selected for the free website analysis feature. This is the highest-complexity Phase 3 feature. Options: Google PageSpeed Insights API (free, rate-limited), ScreamingFrog API (paid), Lighthouse CI (server-side). Decide before Phase 3 planning.
- **PDF generation approach:** Automated PDF delivery for the €49 report requires a library or service not yet in the stack. Evaluate Puppeteer, `@react-pdf/renderer`, or a hosted service (e.g., Doppio, PDFShift) before Phase 4 planning.
- **Stripe integration:** Not in the current stack research. Add `stripe` (npm) and handle webhooks for payment confirmation → report delivery trigger. Well-documented but not yet verified for this stack combination.
- **German market validation:** Conversion rate benchmarks and Immobilienmakler digital behavior data are sourced from MEDIUM-LOW confidence sources. The funnel design is sound, but the specific messaging and price point (€49) should be treated as hypotheses to validate, not confirmed facts.

---

## Sources

### Primary (HIGH confidence)
- npm registry (direct queries, 2026-03-15) — package versions: next@16.1.6, next-sanity@12.1.1, next-intl@4.8.3, sanity@5.16.0, tailwindcss@4.2.1, motion@12.36.0
- [next-intl official docs](https://next-intl.dev/docs) — App Router setup, middleware config, setRequestLocale, routing patterns
- [Sanity Learn — Page Building course](https://www.sanity.io/learn/course/page-building) — Page Builder schema, block rendering, TypeGen patterns
- [Sanity Learn — Controlling Cached Content](https://www.sanity.io/learn/course/controlling-cached-content-in-next-js) — tag-based revalidation patterns
- [Next.js official docs — Self Hosting](https://nextjs.org/docs/app/guides/self-hosting) — standalone output, static asset requirements
- [Next.js official docs — Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating) — revalidateTag with 'max' profile
- [Vercel Engineering Blog — Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — anti-patterns validated
- [Google Search Central — Managing Multi-Regional Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) — hreflang self-reference requirement
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — React 19 + Tailwind v4 compatibility confirmed

### Secondary (MEDIUM confidence)
- [Exposure Ninja — B2B Landing Pages 2025](https://exposureninja.com/blog/b2b-landing-pages/) — CTA placement, social proof patterns
- [Brixon Group — B2B Lead Magnets Compared](https://brixongroup.com/en/b2b-lead-magnets-compared-gated-pdf-vs-interactive-tool-which-strategy-will-deliver-better-results-in/) — interactive tool vs static PDF conversion benchmarks (6.2% vs 3.8%)
- [next-intl GitHub Issue #933](https://github.com/amannn/next-intl/issues/933) — useTranslations context error pattern
- [next-sanity GitHub Issue #639](https://github.com/sanity-io/next-sanity/issues/639) — revalidateTag issues

### Tertiary (LOW confidence — needs validation during implementation)
- [Seukos — Leadgenerierung Immobilienmakler 2025](https://seukos.de/leadgenerierung-immobilienmakler/) — German real estate digital market context
- [LeadValue — Immobilienmakler](https://www.leadvalue.de/immobilienmakler/) — competitor reference for feature comparison
- Various B2B conversion benchmark aggregates — specific numbers (6.2%, 8.3% ROI calculator) are cross-referenced but from single sources; treat as directional

---

*Research completed: 2026-03-15*
*Ready for roadmap: yes*

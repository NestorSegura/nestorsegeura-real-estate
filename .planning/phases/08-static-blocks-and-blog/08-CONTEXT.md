# Phase 8: Static Blocks and Blog - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Render the 8 landing-page blocks from Sanity as zero-JS `.astro` components, dispatched through `PageBuilder.astro`. Build blog index (with pagination) and post detail pages. Ship all SEO infrastructure: sitemap with hreflang, robots.txt, JSON-LD structured data, Open Graph tags.

**The 8 landing blocks to render** (schemas already in Sanity):
1. `landingHero`
2. `landingProblem`
3. `landingOffer`
4. `landingGuide`
5. `landingPlan`
6. `landingTestimonials`
7. `landingFaq` (uses native `<details>`/`<summary>` — zero JS)
8. `landingCtaFinal`

Out of scope: Interactive islands (navbar drawer, locale switcher UI, /analyse form — all Phase 9), production deploy + custom domain + Sanity webhook (Phase 10).

</domain>

<decisions>
## Implementation Decisions

### Block visual fidelity
- **Reference posture:** Use the design screenshots (`plan-cards.png`, `osmo-wide.png`, `problem-cards.png`, `studio.png`, `plan-section.png`, `wide-cards-*.png`, `clash-display-verify.png`, `es-verify.png`) as **loose inspiration**, not pixel-perfect spec. Match the vibe, layout intent, and key visual motifs — don't obsess over exact pixels.
- **v1 React components:** **Port structure, strip React.** Read the Phase 2/3 React block components from git history (they implemented the same schema shape) — translate JSX → `.astro`, preserve data flow and markup skeleton. Avoids re-inventing layouts that already worked. Git-archived path: `src/blocks/` or `src/components/blocks/` from pre-v2 commits.
- **Color direction:** **Jibemates purple as primary brand color.** Use purple as accent, CTA background, and key highlights. Define as Tailwind v4 `@theme` tokens (e.g. `--color-primary-500`) in `src/styles/global.css`. Claude's discretion to propose exact hex values in planning — user approves.
- **CTA style:** **Solid filled buttons, `rounded-lg`.** Dark/purple background, white text, generous padding (`px-6 py-3` or `px-8 py-4`), subtle hover shift (darken or translate-y-px). Apply consistently across all blocks with CTAs.

### Blog listing + post layout
- **Blog index layout:** **Featured hero + card grid below.** Most recent (or an editorial-flagged) post renders as a large hero card at the top; remaining posts fill a responsive 2- or 3-column card grid.
- **Pagination:** **Static pagination** via Astro's `paginate()`. URLs: `/blog`, `/blog/2`, `/blog/3`... (localized equivalents for `/en/blog`, `/es/blog`). Page size: Claude's discretion (suggest 9–12).
- **Post detail layout:** **Sticky TOC sidebar on desktop.** Right-hand column on `lg` breakpoint and up, auto-generated from h2/h3 headings in the portable text. Collapses (or hides) on mobile. Single-column article fallback.
- **Post header metadata (all four):** Author name + avatar (from Sanity author doc), published date (locale-formatted), auto-calculated reading time, category/tags (if present in Sanity post schema — check during planning).

### Portable Text rendering
- **Renderer:** **`astro-portabletext`** (npm). Minimal runtime, component-per-block-type pattern.
- **Inline images:** Claude's discretion. Recommended default: `@sanity/image-url` builder with responsive `srcset`, `loading="lazy"`, explicit `width`/`height` to preserve aspect ratio (prevents CLS). Caption from `image.alt` or `image.caption` field if present.
- **Code blocks:** **Shiki syntax highlighting.** Astro's built-in Shiki (already a transitive dep). Pick a readable theme (suggest `github-dark-dimmed` or `one-dark-pro`). Zero runtime JS — highlighting happens at build.
- **Custom marks/blocks to implement:** **Callout/alert boxes** (info/warning/tip variants) and **highlight/marker** (yellow/purple highlight for emphasized phrases). Add corresponding marks to Sanity `blockContent` schema if not already present; render as dedicated Astro components.

### SEO data sources + Open Graph
- **Title + meta description resolution:**
  1. Page/post Sanity `seo.title` / `seo.description` if set
  2. Fallback to `siteSettings` defaults (per-locale)
  3. Absolute fallback to page title / first portable-text paragraph
- **Open Graph image resolution:**
  1. Page/post `seo.ogImage` (Sanity image ref) if set
  2. Fallback to `siteSettings.defaultOgImage` (per-locale)
  3. Absolute fallback to a static `/public/og-default.png` shipped with the site
- **JSON-LD structured data:**
  - `Person` schema on homepages (all 3 locales) — built from `siteSettings` (name, jobTitle, image, sameAs[])
  - `Article` schema on every blog post (author, datePublished, dateModified, image, headline, description)
  - `Organization` schema in BaseLayout `<head>` site-wide — one-time from siteSettings
  - `BreadcrumbList` on blog post and `/analyse` pages (and their locale variants)
- **Sitemap:** **`@astrojs/sitemap` integration** configured with i18n options so each URL emits `xhtml:link rel="alternate" hreflang="..."` entries for the German, English, and Spanish variants. Respects the localized slug mapping from Sanity `document-internationalization`.
- **robots.txt:** Permissive — allow all paths. No `/studio` to block (Sanity Studio is hosted separately in v2). Include sitemap URL reference.

### Claude's Discretion
- Exact jibemates purple hex values — propose a primary scale (50–950) in planning; user approves
- Responsive breakpoints and grid column counts for blog listing
- Reading time formula (words/minute — suggest 225 for Spanish/English, 200 for German)
- Shiki theme choice
- Sanity image srcset widths
- OG image dimensions (use the 1200×630 standard unless there's reason otherwise)
- Whether Person/Organization JSON-LD lives in BaseLayout or per-page
- Exact blog index page size
- Whether featured post is the newest vs an explicit `isFeatured` boolean in Sanity (if schema supports it)
- Copy for callout/alert component variants (info, warning, tip) per locale — pull from messages/*.json
- Whether blog author avatar uses Sanity image builder or a direct URL

</decisions>

<specifics>
## Specific Ideas

- User memory (project_design_direction.md) references the jibemates purple palette — this is the canonical color direction for the rebuild.
- Design screenshots committed to the repo working tree (not git) show the target feel: large-type hero, generous whitespace, card-based sections, dark/purple CTAs, clean typography. Clash Display + Chivo (wired in Phase 7) should carry the typographic identity.
- v1 React block components handled the same Sanity schema shapes — reading them before writing the .astro equivalents will be faster than starting blank.
- Sanity documents confirmed in production: `siteSettings` (siteName, tagline). Page and post documents need to be verified during planning for presence of the v2 landing block types and all three locales.

</specifics>

<deferred>
## Deferred Ideas

- **Locale switcher UI component** — Phase 9 (NavbarClient React island). Phase 7 already defined its URL-resolution contract via Sanity translation refs.
- **/analyse form submission logic** — Phase 9 (AnalysePageClient React island + /api/analyze Worker endpoint). Phase 7 built the static shell pages.
- **Scroll-triggered animations** — Phase 9 (vanilla JS IntersectionObserver).
- **Production deploy, custom domain, Sanity webhook rebuild trigger** — Phase 10.
- **Cloudflare Images pipeline for Sanity images** — would add cost; not chosen.
- **Blog search/filter** — not in roadmap; add to backlog if desired later.
- **Comments on posts** — not in roadmap.
- **Dark mode** — not in roadmap; site is single-themed.

</deferred>

---

*Phase: 08-static-blocks-and-blog*
*Context gathered: 2026-04-14*

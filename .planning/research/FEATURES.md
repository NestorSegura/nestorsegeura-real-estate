# Feature Landscape: Next.js → Astro Migration

**Domain:** Multilingual agency/portfolio site with Sanity CMS
**Researched:** 2026-04-11
**Migration direction:** Next.js 15 App Router → Astro + Cloudflare Pages

---

## How to Read This File

Each existing feature is mapped to one of three categories:

- **Table Stakes** — direct equivalent exists in Astro, minimal friction
- **Improvements** — Astro handles this natively better than Next.js does
- **Complexity Spots** — requires special handling, a decision point, or a non-obvious workaround

---

## Table Stakes — Direct Equivalents

### 1. Static Page Rendering (Home, Blog listing, Blog post, Analyse)

| Current (Next.js) | Astro Equivalent |
|---|---|
| App Router `page.tsx` files, `generateStaticParams` | `.astro` page files in `src/pages/`, `getStaticPaths()` |
| `export async function generateMetadata()` | Frontmatter `<head>` block in layout, or per-page `<title>/<meta>` |
| `setRequestLocale(locale)` | `Astro.currentLocale` from `astro:i18n` module |

**Verdict:** Straightforward rewrite. The page-file-to-URL mapping is the same concept. All pages that are currently static in Next.js (`/`, `/blog`, `/blog/[slug]`, `/analyse`) stay prerendered in Astro with `export const prerender = true` (or as the default in `output: 'static'` mode).

**Source:** [Astro On-Demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/) — HIGH confidence.

---

### 2. Blog: Listing + Post Detail

| Current (Next.js) | Astro Equivalent |
|---|---|
| `ALL_POSTS_QUERY` → `BlogListing` component | Sanity fetch in `.astro` page frontmatter, data passed as props |
| `@portabletext/react` `PortableText` component | `astro-portabletext` — native Astro component with same customization API |
| `generateStaticParams` for `/blog/[slug]` | `getStaticPaths()` returning `{ params: { slug } }` array |
| Author card, Table of Contents sidebar | Static `.astro` components (no React needed) |

`astro-portabletext` is the officially recommended package by Sanity for Astro. It provides sensible defaults and accepts a `components` prop for custom marks/block types, matching the API of `@portabletext/react`. The npm package was updated as of late 2025.

The `TableOfContents` component currently uses `useState` and `IntersectionObserver` to highlight the active heading. In Astro this becomes a `client:idle` React island or a vanilla JS `<script>` block inside a `.astro` component. See Complexity Spots section.

**Verdict:** The blog is one of the cleanest wins of this migration. No React required for the content rendering layer itself. Interactive sidebar pieces are small, isolated islands.

**Sources:** [astro-portabletext npm](https://www.npmjs.com/package/astro-portabletext), [Netlify guide: Sanity Portable Text + Astro](https://developers.netlify.com/guides/how-to-use-sanity-portable-text-with-astro/) — MEDIUM confidence (community package, actively maintained).

---

### 3. Page Builder (Section Dispatch Pattern)

| Current (Next.js) | Astro Equivalent |
|---|---|
| `PageBuilder.tsx` switch statement dispatching to block components | `PageBuilder.astro` switch statement dispatching to `.astro` block components |
| 8 block components as React files | Same 8 blocks rewritten as `.astro` files |
| Sections filtered by `enabled === false` | Identical logic in `.astro` frontmatter |

The switch-dispatch pattern translates verbatim. The only structural difference is that `.astro` templates use `{section._type === 'heroSection' && <HeroSection {...section} />}` style conditionals or a map with dynamic imports, rather than a JSX switch.

**Exception:** `FaqBlock` currently uses `useState` for accordion open/close — this becomes a complexity spot (see below). All other blocks (`HeroSection`, `FeatureStrip`, `TestimonialsBlock`, `CtaBlock`, `ProblemSolutionBlock`, `ServicesBlock`, `ReferencesBlock`) are fully static and migrate cleanly.

**Verdict:** 7 of 8 blocks are copy-paste rewrites. `FaqBlock` requires an island or a CSS-only accordion.

---

### 4. Robots.txt

| Current (Next.js) | Astro Equivalent |
|---|---|
| `src/app/robots.ts` using Next.js `MetadataRoute` convention | Static `public/robots.txt` file, or `src/pages/robots.txt.ts` endpoint |

The simplest approach: place a static `public/robots.txt`. For dynamic content (e.g., including the sitemap URL), use `src/pages/robots.txt.ts` exporting a `GET` handler that returns a `new Response(content, { headers: { 'Content-Type': 'text/plain' } })`.

**Verdict:** Trivial.

---

### 5. JSON-LD Structured Data

| Current (Next.js) | Astro Equivalent |
|---|---|
| `<JsonLd data={...} />` component using `dangerouslySetInnerHTML` | Inline `<script type="application/ld+json" set:html={JSON.stringify(data)} />` in `.astro` |

Astro's `set:html` directive is the direct equivalent of `dangerouslySetInnerHTML`. JSON-LD needs no client JS — this becomes purely static HTML output. No additional package required.

**Verdict:** Trivial. The `JsonLd` component dissolves into two lines of Astro template syntax.

---

### 6. OG Meta / `<head>` SEO Tags

| Current (Next.js) | Astro Equivalent |
|---|---|
| `generateMetadata()` returning `Metadata` object | Explicit `<meta>` tags written directly in layout/page `.astro` `<head>` block |

Next.js abstracts `<head>` management through its `Metadata` API. Astro does not — `<head>` is written directly in the layout template. This is more verbose but equally capable and has no hidden behavior.

**Verdict:** More explicit in Astro (you write the tags yourself), but no capability gap. The layout `.astro` file accepts props like `title`, `description`, and `ogImage` and renders them.

---

### 7. API Endpoint: `POST /api/analyze`

| Current (Next.js) | Astro Equivalent |
|---|---|
| `src/app/api/analyze/route.ts` exporting `POST` and `OPTIONS` | `src/pages/api/analyze.ts` exporting `POST` and `OPTIONS` |
| `NextRequest`, `NextResponse` | Standard `Request` / `Response` Web API objects |
| `export async function POST(request: NextRequest)` | `export const POST: APIRoute = async ({ request }) => { ... }` |

Astro API endpoints use the standard Web API `Request`/`Response` directly (no Next.js wrappers). Body access is identical: `await request.json()`. The Cloudflare adapter runs these in a Worker at request time.

**Critical note on rendering mode:** In Astro's default `output: 'static'` mode, this POST endpoint requires `export const prerender = false` to run at request time. The cleanest approach for this project is `output: 'server'` globally, then mark all static content pages with `export const prerender = true`. This avoids annotating every dynamic endpoint and is more explicit about the project's hybrid nature.

The Zod validation, mock scores, and response shape are unchanged. `NextRequest`/`NextResponse` references become `Request`/`Response`.

**Verdict:** Near-identical rewrite with two import changes.

**Source:** [Astro Endpoints docs](https://docs.astro.build/en/guides/endpoints/) — HIGH confidence.

---

### 8. Sanity Webhook Revalidation (`POST /api/revalidate`)

| Current (Next.js) | Astro Equivalent |
|---|---|
| `revalidateTag(body._type)` from `next/cache` | No direct equivalent — Astro has no built-in tag-based ISR cache |
| `parseBody` from `next-sanity/webhook` | Manual HMAC verification or `@sanity/webhook` package |

This is the most significant functional gap at the infrastructure level. Next.js `revalidateTag` triggers on-demand page revalidation. Astro with Cloudflare Workers has no equivalent built-in mechanism.

**Replacement strategies (choose one):**

Option A — Cloudflare deploy hook (recommended for this project's scale): Configure Sanity to POST to a Cloudflare Pages/Workers deploy hook URL on content publish. The site rebuilds in ~30-60 seconds. For a content marketing site that publishes once or twice per week, this is entirely acceptable. No webhook endpoint needed.

Option B — Full SSR with on-demand fetch: Use `output: 'server'` and fetch Sanity data on every request for pages that change frequently (blog listing, home page). The Sanity CDN returns cached published content in under 100ms. Content is always fresh without any invalidation logic.

Option C — Cloudflare KV manual cache: Write a custom cache layer using Cloudflare KV. High complexity, low payoff for this site's traffic level.

**Verdict:** The webhook endpoint itself rewrites easily as an Astro API endpoint. The `revalidateTag` call cannot be ported — the invalidation strategy must change. Option A (deploy hook) is the pragmatic choice.

---

## Improvements — Astro Does This Better

### 9. i18n Routing (`de` default, `/en` and `/es` prefixed)

**Current approach (Next.js + next-intl):**

- `next-intl` middleware intercepts every request and handles locale detection/redirect
- `localePrefix: 'as-needed'` in `routing.ts` hides `/de`, prefixes `/en` and `/es`
- Every page component calls `setRequestLocale(locale)` (opt-in static rendering requirement)
- Client components need `NextIntlClientProvider` to access `useTranslations` at runtime
- `useRouter` from `@/i18n/navigation` used in `NavbarClient` for locale switching

**Astro approach:**

Astro 5 has first-class i18n routing built into the framework config with no additional package:

```typescript
// astro.config.mjs
export default defineConfig({
  i18n: {
    locales: ['de', 'en', 'es'],
    defaultLocale: 'de',
    routing: {
      prefixDefaultLocale: false, // de has no prefix; en/es are prefixed
    },
  },
})
```

`prefixDefaultLocale: false` is the exact functional equivalent of `localePrefix: 'as-needed'`. Astro's built-in i18n middleware handles redirect logic. In `.astro` files, `Astro.currentLocale` gives the active locale — no `setRequestLocale()` call needed.

For UI translation strings (nav labels, form copy, button text): the recommended pattern is a `src/i18n/ui.ts` file with `getLangFromUrl` and `useTranslations` helper functions — no third-party library required. This replaces `next-intl`'s `useTranslations` hook for static string lookups.

**The key paradigm shift for client components:** `next-intl`'s `useTranslations` runs inside React client components at runtime. In Astro, the `.astro` parent (which knows the locale at build/request time via `Astro.currentLocale`) looks up translated strings and passes them as props into the island. Islands receive strings as data, not via hooks.

**Verdict:** Astro's built-in i18n is simpler than the `next-intl` middleware approach for this site's needs. The `next-intl` package is eliminated entirely. The key architectural shift — locale detection belongs to the `.astro` server layer, not inside islands — is idiomatic Astro and correct.

**Source:** [Astro i18n Routing docs](https://docs.astro.build/en/guides/internationalization/), [Astro i18n Recipes](https://docs.astro.build/en/recipes/i18n/) — HIGH confidence.

---

### 10. Sitemap with hreflang

**Current approach:** Custom `src/app/sitemap.ts` (~70 lines) using `getPathname` from `next-intl/navigation` to compute locale-prefixed URLs for each static page and dynamic blog post, then manually building the `alternates.languages` object for each entry.

**Astro approach:** `@astrojs/sitemap` integration with the `i18n` config key:

```typescript
sitemap({
  i18n: {
    defaultLocale: 'de',
    locales: {
      de: 'de-DE',
      en: 'en-US',
      es: 'es-ES',
    },
  },
})
```

The integration reads all routes from the Astro build output and automatically emits `xhtml:link` alternate entries (hreflang) for each language variant. Dynamic blog post routes are included because `getStaticPaths()` generates them and the sitemap integration crawls the build output.

**Verdict:** A genuine improvement. The custom ~70-line sitemap.ts is replaced with ~10 lines of integration config. For any routes the integration cannot auto-discover, a `customPages` array can be added.

**Source:** [astrojs/sitemap docs](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — HIGH confidence.

---

### 11. Zero-JS Static Blocks

**Current situation:** Every block component (`HeroSection`, `ServicesBlock`, `TestimonialsBlock`, etc.) is a React component. Even ones with zero interactivity — no state, no effects, no event handlers — ship as React components because the whole rendering tree is React.

**Astro situation:** These blocks become `.astro` components. They render to pure HTML at build time with zero JavaScript shipped to the browser. No React runtime. No hydration cost.

This directly benefits page performance metrics (LCP, TBT, FID) and aligns with the positioning of the site (a web developer's marketing site should score well on its own performance metrics).

**Verdict:** Direct, measurable performance improvement for 7 of the 8 blocks. No behavioral change visible to users.

---

## Complexity Spots — Requires Special Handling

### 12. Interactive Components: Island Strategy

The following components currently use React state/effects and must become Astro islands or be rewritten:

| Component | Current | Interactivity | Recommended Strategy |
|---|---|---|---|
| `NavbarClient.tsx` | `'use client'` React | Scroll detection (IntersectionObserver), mobile drawer (base-ui), locale switcher | `client:load` React island — visible immediately above fold |
| `FaqBlock.tsx` | `'use client'` React | `useState` open/close accordion | Option A: CSS-only `<details>/<summary>` (no JS, no island). Option B: `client:visible` React island |
| `TableOfContents.tsx` | `'use client'` React | IntersectionObserver active heading highlight, smooth scroll | `client:idle` React island — sidebar, not critical render path |
| `AnalysePageClient.tsx` | `'use client'` React | Form state, fetch to `/api/analyze`, animated SVG gauges | `client:load` React island — this page is entirely this interaction |
| `ScrollAnimations.tsx` | `'use client'` GSAP | GSAP ScrollTrigger for body background morphing + section reveals | Rewrite as vanilla JS `<script>` in `.astro` — no island needed |

**Framework choice for islands:**

React is the current framework. Keeping React for islands is the lowest-friction migration path. Install `@astrojs/react`; existing island components migrate with minimal changes.

Preact is a viable alternative: ~3KB gzipped vs React's ~40KB. Given the low island count (5 components), the bundle saving is approximately 185KB uncompressed — meaningful for performance but not project-critical. Preact shares the React hooks API; migration is primarily changing import paths. This is an optional optimization, not a migration requirement.

**Recommendation:** Use React for islands during the initial migration (lower risk, faster iteration). Evaluate Preact on a per-island basis post-launch if Lighthouse JS payload scores are a concern.

**FaqBlock recommendation:** The `<details>/<summary>` HTML element provides open/close accordion behavior natively with zero JavaScript and correct keyboard/screen reader support. The current `FaqBlock` renders a `<dl>` with a `max-height` CSS transition — this maps directly to a CSS-animated `<details>` pattern. This is the preferred approach: eliminate the island entirely.

**Sources:** [Astro Islands docs](https://docs.astro.build/en/concepts/islands/), [Astro Framework Components](https://docs.astro.build/en/guides/framework-components/) — HIGH confidence.

---

### 13. ScrollAnimations: Island Boundary Problem

`ScrollAnimations.tsx` is a React component that wraps `children` and queries `section[data-scheme]` elements via `useRef` and GSAP's `ScrollTrigger`. The fundamental problem for Astro: **React islands cannot contain static `.astro` children as slots**. The island mounting boundary would wrap the PageBuilder output, but PageBuilder is static Astro HTML — it cannot be children of a React component in the islands model.

The cleanest migration: **rewrite as a vanilla JS `<script>` block** inside the main layout `.astro` file. The script runs after DOM parse and queries `section[data-scheme]` the same way the GSAP component does, using `document.querySelectorAll`. GSAP itself is a plain JS library with no React dependency — it can be imported and initialized in a `<script>` tag with `import gsap from 'gsap'` using Astro's module script handling.

The cleanup concern (killing tweens and triggers on navigation) is relevant only with Astro's View Transitions API enabled. If View Transitions is not used (full page navigations), cleanup is handled automatically when the page unloads.

**Verdict:** This is the most structurally different rewrite of the migration. The GSAP logic is identical; only the mounting mechanism changes from a React wrapper to a `<script>` tag.

---

### 14. Locale Switcher Inside a React Island

**Current:** `NavbarClient` uses `useRouter` from `@/i18n/navigation` (next-intl) calling `router.replace({ pathname, params }, { locale: targetLocale })` — SPA navigation to the equivalent page in the new locale.

**Astro equivalent problem:** `getRelativeLocaleUrl(locale, path)` from `astro:i18n` is only available server-side in `.astro` files, not inside React islands at browser runtime.

**Solution pattern:** Compute all locale URLs in the `.astro` parent and pass them as props into the island:

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n'
const pathname = Astro.url.pathname
const localeUrls = {
  de: getRelativeLocaleUrl('de', pathname),
  en: getRelativeLocaleUrl('en', pathname),
  es: getRelativeLocaleUrl('es', pathname),
}
---
<NavbarClient client:load localeUrls={localeUrls} {...navData} />
```

The island renders `<a href={localeUrls.de}>DE</a>` anchor links rather than calling `router.replace()`. This is a full page navigation, not a SPA transition. For a content site with no client-side state to preserve, this is correct behavior and simpler.

**Verdict:** The pattern changes from programmatic SPA navigation to plain anchor links. No functional regression for this site type.

---

### 15. AnalysePageClient: Translation String Access

**Current:** `AnalysePageClient` uses `useTranslations('analysis')` from `next-intl` and `useLocale()` to read the current locale inside the client component.

**Astro equivalent:** `next-intl` hooks are unavailable. The `.astro` page computes the locale, looks up all required translation strings using the `src/i18n/ui.ts` helper, and passes them as props to the `AnalysePageClient` island.

The `CATEGORY_LABELS` object inside the component (score label translations) can either be inlined in the island as a static object (it has no external dependencies) or passed as a prop from the parent. The inline approach is cleaner since it avoids a large props surface.

**Verdict:** The translation lookup moves from a runtime hook to a compile-time/request-time prop. The island receives `t('analysis.title')` as a resolved string prop, not a function. Minor refactor.

---

### 16. `output: 'server'` vs `output: 'static'` Decision

This is the most consequential architectural decision for the migration.

**`output: 'static'` (full prerender):**
- Fastest edge delivery — pure static assets from Cloudflare CDN
- Zero Worker cold start cost
- Cache invalidation requires a new deploy (Sanity webhook → Cloudflare deploy hook)
- `/api/analyze` POST endpoint requires `export const prerender = false`
- Draft mode / live preview not possible

**`output: 'server'` (Cloudflare Workers SSR with selective prerendering):**
- All pages render on Worker request by default; mark static pages with `export const prerender = true`
- `/api/analyze` POST endpoint works natively without annotation
- Revalidation webhook possible (though with a different invalidation strategy)
- Draft mode / live preview possible in future
- Cloudflare Workers cold start is negligible for this workload
- As of the Cloudflare adapter docs (late 2025): Cloudflare Pages deployment mode has been removed; the target is Cloudflare Workers (which still deploys through the same Cloudflare dashboard/CI)

**Recommendation:** `output: 'server'` with `export const prerender = true` on all content pages. Rationale: the site has one dynamic endpoint, all content pages are Sanity-backed and can be prerendered, and this model is cleaner to extend (adding future dynamic features does not require restructuring). The prerendered pages are served from Worker cache at CDN edge — no meaningful performance difference from pure static.

**Source:** [astrojs/cloudflare docs](https://docs.astro.build/en/guides/integrations-guide/cloudflare/), [Astro On-Demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/) — HIGH confidence for the model; MEDIUM confidence on the Pages vs Workers deployment distinction (verify current adapter README at implementation time).

---

### 17. Sanity `sanityFetch` / Live Mode

**Current:** `next-sanity`'s `sanityFetch` + `<SanityLive />` provide live content updates in the Sanity Studio Presentation tool. Editors see changes in real time without a page reload.

**Astro equivalent:** The `@sanity/astro` integration provides the Sanity client for data fetching. For standard published content queries, it works cleanly — call `createClient().fetch(query, params)` in `.astro` frontmatter.

For live preview / draft mode, SSR is required and the setup is more manual: gate a `perspective: 'previewDrafts'` Sanity client behind a draft mode cookie, and serve the preview path from a server endpoint. There is no `<SanityLive />` equivalent for Astro today.

**Verdict:** Standard data fetching migrates cleanly. Defer live preview / Presentation tool integration to a follow-up phase — it works but requires additional SSR wiring and does not affect the production visitor experience.

**Source:** [Sanity Astro plugin](https://www.sanity.io/plugins/sanity-astro) — MEDIUM confidence (community documentation).

---

## Anti-Features — Do Not Port These

| What | Why |
|---|---|
| `next-intl` package | Astro has built-in i18n routing; `next-intl` is Next.js-specific |
| `NextIntlClientProvider` wrapper | Not needed; translated strings passed as props to islands |
| `@portabletext/react` | Replace with `astro-portabletext` |
| `next-sanity` package | Replace with `@sanity/astro` |
| `framer-motion` | Present in `package.json` but not wired into any visible component; omit |
| `next-themes` | No dark mode in current UI; omit |
| `<SanityLive />` | Defer to follow-up phase |
| `shadcn` + `class-variance-authority` | No shadcn components in block code; only used in blog sidebar; evaluate at implementation |
| `lenis` | Not visible in current block code; omit unless explicitly needed |

---

## Feature Dependency Map

```
Astro i18n config
  └── All pages (locale-aware URLs)
  └── @astrojs/sitemap (hreflang auto-generation)
  └── Navbar island (locale URLs computed as props at .astro level)
  └── AnalysePageClient island (translation strings as props)

@sanity/astro (data layer)
  └── PageBuilder page (Sanity sections array → block dispatch)
  └── Blog listing (posts query by language)
  └── Blog post (post-by-slug query + astro-portabletext)
  └── Navbar data (navLinks, ctaHref, siteName from siteSettings)

output: 'server' + Cloudflare Workers adapter
  └── /api/analyze POST endpoint (runtime execution)
  └── Optional: /api/revalidate webhook endpoint
  └── All content pages get export const prerender = true

@astrojs/react (island runtime)
  └── NavbarClient (client:load)
  └── TableOfContents (client:idle)
  └── AnalysePageClient (client:load)
  └── FaqBlock — ONLY if CSS-only <details> is rejected

Vanilla JS <script> in layout
  └── ScrollAnimations (GSAP + ScrollTrigger, no React)
```

---

## MVP Build Order

Build in this order to validate the migration incrementally before tackling complexity:

1. Astro project scaffold: Cloudflare adapter + i18n config + `@sanity/astro`
2. Static home page with all 8 blocks as `.astro` components (no interactivity)
3. Blog listing + blog post with `astro-portabletext`
4. `@astrojs/sitemap` integration + `robots.txt`
5. `NavbarClient` as React island with locale URLs as props pattern
6. `FaqBlock` as CSS-only `<details>` accordion (validate before choosing island path)
7. `ScrollAnimations` rewritten as vanilla JS `<script>`
8. `/api/analyze` POST endpoint
9. `AnalysePageClient` as React island on the `/analyse` page
10. `TableOfContents` as React island
11. Sanity deploy hook for cache invalidation (replaces `revalidateTag`)

Defer post-MVP: Sanity draft mode / live preview, Preact optimization pass.

---

## Sources

- [Astro i18n Routing](https://docs.astro.build/en/guides/internationalization/) — HIGH confidence
- [Astro i18n Recipes](https://docs.astro.build/en/recipes/i18n/) — HIGH confidence
- [Astro Islands](https://docs.astro.build/en/concepts/islands/) — HIGH confidence
- [Astro Endpoints](https://docs.astro.build/en/guides/endpoints/) — HIGH confidence
- [Astro On-Demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/) — HIGH confidence
- [astrojs/cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — HIGH confidence
- [astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — HIGH confidence
- [astro-portabletext npm](https://www.npmjs.com/package/astro-portabletext) — MEDIUM confidence (community package, maintained)
- [Sanity Astro plugin](https://www.sanity.io/plugins/sanity-astro) — MEDIUM confidence
- [Netlify: Sanity Portable Text + Astro](https://developers.netlify.com/guides/how-to-use-sanity-portable-text-with-astro/) — MEDIUM confidence
- [Astro Framework Components (React/Preact)](https://docs.astro.build/en/guides/framework-components/) — HIGH confidence

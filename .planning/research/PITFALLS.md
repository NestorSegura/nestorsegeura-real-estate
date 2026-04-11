# Migration Pitfalls: Next.js 15 → Astro + Cloudflare

**Migration:** Next.js 15 (App Router + next-intl + Sanity) → Astro 5 + Cloudflare Workers
**Researched:** 2026-04-11
**Confidence:** HIGH for Cloudflare/Astro adapter topics (verified via official docs); MEDIUM for Sanity portable text rendering edge cases (GitHub issues, community)

---

## Critical Pitfalls

### 1. Cloudflare Pages Is Being Sunset — Target Workers, Not Pages

**Description:**
As of 2025, Cloudflare officially recommends Workers over Pages for new projects. The Astro Cloudflare adapter has dropped first-class Pages support in recent versions. In Astro v6, the `@astrojs/cloudflare` adapter no longer deploys to Cloudflare Pages at all — it targets Cloudflare Workers exclusively. Planning to use Cloudflare Pages and later discovering this forces a redeploy or architecture change mid-migration.

**Warning Signs:**
- Docs examples reference `wrangler pages deploy` rather than `wrangler deploy`
- Cloudflare dashboard shows a "Workers & Pages" section where Pages and Workers appear merged
- Adapter docs reference `_worker.js` (Workers pattern) not a `_routes.json` (Pages pattern)

**Prevention Strategy:**
Target Cloudflare Workers from day one. Configure `wrangler.toml` with `main = "./dist/_worker.js/index.js"`, `assets.binding = "ASSETS"`, and `compatibility_flags = ["nodejs_compat"]`. Use `wrangler deploy` not `wrangler pages deploy`. Treat Cloudflare Pages as a legacy target.

**Affected Phase:** Phase 1 (Infrastructure Setup). Wrong target here cascades into every subsequent deployment step.

**Source:** Astro Cloudflare adapter docs (official), Cloudflare Workers Astro guide (official)

---

### 2. `nodejs_compat` Flag Is Required But Easy to Forget

**Description:**
The Astro Cloudflare adapter runs in Cloudflare's `workerd` runtime, which does not support CommonJS (`require`, `module.exports`) or many Node.js built-ins by default. The `nodejs_compat` compatibility flag must be declared in `wrangler.toml`. Without it, any dependency that uses Node.js APIs (including Sanity's SDK, Zod, or similar) will throw runtime errors that only appear in production — not during `astro dev`, which defaults to Node.js.

**Warning Signs:**
- `astro dev` works correctly but `wrangler dev` throws module resolution errors
- Errors reference `require is not defined` or `node:fs is not a known module`
- Sanity client calls succeed locally but crash on the deployed Worker

**Prevention Strategy:**
Add to `wrangler.toml` immediately during project setup:
```toml
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
```
Test with `wrangler dev` (not `astro dev`) before any milestone is considered complete.

**Affected Phase:** Phase 1 (Infrastructure Setup).

**Source:** Astro Cloudflare adapter docs (official); community issue reports on GitHub

---

### 3. `astro dev` Uses Node.js but Production Uses `workerd` — Runtime Mismatch

**Description:**
Prior to recent adapter versions, `astro dev` used Node.js as its dev server even when targeting Cloudflare. Code that works in dev can silently break in production if it relies on Node.js-specific behavior. This is now partially fixed: the adapter can run `astro dev` against the actual `workerd` runtime, but this must be explicitly configured. If it is not, the development environment gives false confidence.

**Warning Signs:**
- A feature works in `astro dev` but returns 500 in production
- Date/time formatting or crypto APIs behave differently between environments
- Sanity webhook signature validation fails in production only

**Prevention Strategy:**
Verify that the development server is using the `workerd` runtime. In current versions of the Cloudflare adapter, `astro dev` uses `workerd` by default when the adapter is installed. Confirm by checking that `wrangler dev` and `astro dev` produce identical behavior. Run `wrangler dev` for all API route testing.

**Affected Phase:** Phase 1 (Infrastructure Setup). Establish the correct dev workflow before building anything else.

**Source:** Astro Cloudflare adapter docs (official, "Runtime" section)

---

### 4. Cloudflare Free Plan: 20,000 File Limit Will Be Hit

**Description:**
Cloudflare Pages (and Workers static assets) has a hard limit of 20,000 files on the free plan and 100,000 files on paid plans. A Next.js `standalone` build already carries hundreds of chunked JS files. An Astro static build with many pages, images, and fonts can exceed this limit, especially if images are not optimized or if Sanity content generates many individual pages (blog posts per locale × 3 locales).

**Warning Signs:**
- Build succeeds locally but deployment fails with an asset count error
- Blog post count × 3 locales approaches 1,000+ generated HTML files
- `dist/` contains uncompressed images or redundant font variants

**Prevention Strategy:**
Audit the `dist/` output before first deployment. Count files with `find dist -type f | wc -l`. Use Astro's built-in image optimization and serve fonts from CDN (Fontsource or Google Fonts) rather than self-hosting all variants. Consider partial prerendering (static most pages, SSR for blog index) to reduce file count if needed. If free plan is exhausted, upgrade to Workers Paid ($5/mo) which raises the limit to 100,000.

**Affected Phase:** Phase 3 (Static Build + Deployment). Check file counts before and after each batch of pages is added.

**Source:** Cloudflare Pages limits documentation (official)

---

### 5. Astro's i18n Routing Cannot Replicate next-intl's `localePrefix: 'as-needed'` Exactly

**Description:**
next-intl's `localePrefix: 'as-needed'` means: default locale (`de`) gets no prefix (`/`), non-default locales get prefixes (`/en/`, `/es/`). Astro's built-in i18n uses `prefixDefaultLocale: false` to achieve the same pattern, but the behavior is not identical. Key difference: Astro does **not** perform automatic cookie-based locale detection and redirection. There is no equivalent to next-intl's middleware that reads a `NEXT_LOCALE` cookie and redirects accordingly. Returning visitors who previously selected a locale in Next.js will not have that preference respected in Astro unless custom middleware is written.

**Warning Signs:**
- Locale switcher sets a cookie but navigation does not respect it on next visit
- `/` always serves German content regardless of previously selected locale
- Tests with `Astro.currentLocale` return unexpected values on index pages

**Prevention Strategy:**
Accept that Astro's i18n is routing-only, not middleware-driven. Configure `prefixDefaultLocale: false` (de has no prefix, en and es get prefixes). Write a simple Astro middleware that reads a locale cookie and redirects `/` to `/en/` or `/es/` if needed. Use `getRelativeLocaleUrl()` for all internal links — never string-concatenate locale prefixes. Document the behavior difference explicitly.

**Affected Phase:** Phase 2 (i18n Routing Setup). This is the single most complex architectural difference from the Next.js setup.

**Source:** Astro i18n docs (official); Astro GitHub issue #12897 (MEDIUM confidence)

---

### 6. Double-Prefix Bug in Dynamic Routes with Sanity Slugs

**Description:**
When generating blog post URLs from Sanity slugs, the slug value itself can already contain the locale prefix if Sanity's `document-internationalization` plugin is involved. For example, a Sanity document for the English version might have `slug.current = "how-to-sell"` but the generating code incorrectly prepends `/en/` twice, yielding `/en/en/how-to-sell`. This is especially likely when Sanity slugs are copied from a previous locale document.

**Warning Signs:**
- Blog post links return 404 in the browser
- `getStaticPaths` output contains paths with repeated locale segments
- Sanity's translation metadata shows `slug.current` already including a locale prefix

**Prevention Strategy:**
Audit all Sanity blog post slug values in the dataset. Ensure slugs in Sanity are locale-agnostic (just the path segment, no locale prefix). In `getStaticPaths`, derive the URL as `getRelativeLocaleUrl(locale, post.slug.current)` — never concatenate manually. Add a test that generates 2–3 known slugs across all locales and verifies the output URLs.

**Affected Phase:** Phase 4 (Blog + Portable Text). Address before implementing `getStaticPaths` for blog posts.

**Source:** Astro i18n docs (official); community discussions on double-prefix patterns

---

### 7. `getRelativeLocaleUrl` with `manual` Routing Returns Wrong URLs

**Description:**
Astro's i18n helper `getRelativeLocaleUrl()` has a documented bug when used alongside `routing: "manual"` — it returns incorrect paths (e.g., returns `/` when it should return `/en`). If any custom middleware is used that requires `routing: "manual"`, this helper becomes unreliable and the locale switcher will break silently by pointing to wrong URLs.

**Warning Signs:**
- Locale switcher navigates to `"/"` regardless of target locale
- `getRelativeLocaleUrl("en", "/about")` returns `/about` instead of `/en/about`
- Only happens after switching to `routing: "manual"` in `astro.config.ts`

**Prevention Strategy:**
Do not use `routing: "manual"` unless there is a compelling reason that cannot be solved with Astro's built-in routing strategies. If custom middleware is needed for cookie-based redirects, keep `routing: "pathname-prefix-always"` or `"pathname-prefix-except-default"` and implement the cookie logic as an Astro middleware that calls `next()` after inspection. Reserve `routing: "manual"` only as a last resort.

**Affected Phase:** Phase 2 (i18n Routing Setup).

**Source:** Astro GitHub issue #11355 (MEDIUM confidence, community-reported, confirmed in multiple threads)

---

### 8. React Components Need `client:*` Directive — Forgetting It Produces Silent Static Output

**Description:**
Every interactive React component from the current Next.js site (FaqBlock accordion, mobile nav drawer, locale switcher, AnalysePageClient gauge form) must receive a `client:load` or `client:visible` directive when used in `.astro` files. Without the directive, Astro renders the component to static HTML but **does not ship any JavaScript**. The component appears visually correct but is completely non-interactive. There is no error or warning — it silently fails.

**Warning Signs:**
- FAQ accordion renders with correct HTML structure but clicking items has no effect
- Mobile nav button is visible but does not open the drawer
- Gauge form renders the input fields but submitting does nothing

**Prevention Strategy:**
Document a rule before migration begins: every component that uses `useState`, `useEffect`, event handlers, or `useTranslations` from a client context must have an explicit client directive. Assign directives intentionally: use `client:load` for above-the-fold interactive components (nav drawer, locale switcher), `client:visible` for below-the-fold components (FAQ accordion, gauges). Never assume a component will be interactive without the directive.

**Affected Phase:** Phase 5 (Interactive Component Migration). Create a migration checklist mapping each current component to its required directive.

**Source:** Astro Islands architecture docs (official); Astro framework components docs (official)

---

### 9. Functions Cannot Be Passed as Props to Hydrated Islands

**Description:**
In Next.js, Server Components pass callback functions to Client Components via props routinely. In Astro, props passed to a hydrated island (`client:load`) must be serializable — functions cannot be serialized and will be silently dropped or throw a runtime error. This affects any pattern where a parent `.astro` file tries to pass an `onClick` or callback to a React component.

**Warning Signs:**
- A React component renders but an event callback never fires
- TypeScript errors about prop types when passing functions from `.astro` to React components
- Console errors about non-serializable props

**Prevention Strategy:**
Refactor components to be self-contained: each interactive island should manage its own event handlers and state internally. If cross-island communication is needed (e.g., locale switcher updating a nav state), use a lightweight client-side store (nanostores, which is Astro's recommended approach) rather than props.

**Affected Phase:** Phase 5 (Interactive Component Migration).

**Source:** Astro framework components docs (official, "Passing Props" section); Astro Islands architecture docs

---

### 10. Sanity Portable Text Requires a Separate Package and Has Astro-Specific Constraints

**Description:**
The Sanity `PortableText` React component does not work directly in `.astro` files without wrapping it in a React island. The package `astro-portabletext` provides a native Astro implementation that renders Portable Text to HTML without requiring React hydration. However, it has limitations: **rendering an Astro component inside a Portable Text custom block is not natively supported**. Attempts to pass Astro components as custom block renderers will fail. Only React components (in an island) or raw HTML string outputs work as custom block types.

**Warning Signs:**
- Portable Text renders body text correctly but custom block types (e.g., an image with caption, a CTA card) show nothing
- TypeScript errors when trying to pass `.astro` component as a Portable Text `components` prop
- GitHub issue threads from 2022–2024 documenting this limitation with no official resolution

**Prevention Strategy:**
Use `astro-portabletext` for the blog body. Map custom block types to React components (not Astro components) if interactivity is needed, or render them as plain HTML strings for static display. Audit the current blog's Portable Text schemas and categorize each custom block type: static-renderable (can be HTML string) vs. interactive (needs React island). For the blog, which likely has limited custom blocks (images, maybe a callout), this is manageable without React.

**Affected Phase:** Phase 4 (Blog + Portable Text). Audit custom block types before implementing the blog renderer.

**Source:** Netlify Portable Text + Astro guide (MEDIUM confidence); Astro GitHub issue #5494 (MEDIUM confidence); `astro-portabletext` npm package

---

### 11. Sanity `useCdn: false` Is Still Required for Webhook-Triggered Rebuilds

**Description:**
The current codebase already has this pattern (confirmed by inspecting the existing `revalidate` route). In Astro's static build model, the equivalent issue manifests differently: Cloudflare Pages/Workers build is triggered by a Sanity webhook. If the Astro build fetches from Sanity using `useCdn: true`, the build may receive stale cached data from Sanity's CDN. The built HTML is then stale from the moment it is deployed.

**Warning Signs:**
- Content published in Sanity Studio appears on the site 60+ seconds after the webhook-triggered build completes
- Webhook-triggered builds succeed but published content is not visible for another CDN cycle

**Prevention Strategy:**
Set `useCdn: false` in the Sanity client used during the Astro build. This is safe because the Astro build is a one-time process (not serving many concurrent requests like a live server), so CDN performance is not needed. Only enable `useCdn: true` if implementing SSR for live data routes (e.g., a preview endpoint).

**Affected Phase:** Phase 3 (Sanity + Astro Integration).

**Source:** Existing project pattern (confirmed in `/src/app/api/revalidate/route.ts`); Sanity documentation on CDN

---

### 12. `useTranslations` and `useLocale` (next-intl) Do Not Exist in Astro — `AnalysePageClient` Needs Full Rewrite

**Description:**
The `AnalysePageClient` component (the gauge form) uses `useTranslations('analysis')` and `useLocale()` from next-intl. These hooks do not exist in Astro. The entire translation mechanism must change. In Astro, locale is available from `Astro.currentLocale` in `.astro` files, but not inside a React island via hooks. The locale must be passed as a prop from the parent `.astro` file.

**Warning Signs:**
- TypeScript errors: `useTranslations` is not found after removing next-intl
- `useLocale()` returns undefined in the React component
- The translation strings for "Performance", "Conversión", etc. are not loaded

**Prevention Strategy:**
Refactor `AnalysePageClient` to accept `locale` and `labels` as props passed from the parent `.astro` file. The parent resolves `Astro.currentLocale`, looks up the label map, and passes it as serializable data. Remove all next-intl hook calls from the component. The `t()` function pattern must be replaced with a plain object lookup (which the existing `CATEGORY_LABELS` map already does for labels — reuse that pattern for all translated strings).

**Affected Phase:** Phase 5 (Interactive Component Migration). Plan this rewrite explicitly — it is not a drop-in migration.

**Source:** Code inspection of `AnalysePageClient.tsx`; Astro i18n docs (official); Astro Islands props serialization docs

---

### 13. Webhook-Based Rebuild on Cloudflare Workers (Not ISR) — No `revalidateTag`

**Description:**
The current Next.js site uses `revalidateTag(body._type)` in the `/api/revalidate` route for on-demand ISR. Astro on Cloudflare Workers does not have ISR. The equivalent is triggering a full rebuild via a Cloudflare Pages/Workers build webhook. There is no in-process cache invalidation. This means: (1) the revalidation route logic must be replaced with a Cloudflare Deploy Hook call, and (2) content latency after publish is now the full build time (typically 1–3 minutes) rather than seconds.

**Warning Signs:**
- The existing `/api/revalidate` route with `revalidateTag` has no equivalent in Astro
- Editors expect near-instant content updates but builds take 90–120 seconds
- Sanity webhook needs a different URL and payload format for Cloudflare Deploy Hooks

**Prevention Strategy:**
Replace the revalidation route with a Cloudflare Workers function that, upon receiving a valid Sanity webhook, calls the Cloudflare Deploy Hook URL. Set expectations with the client: content changes take 1–3 minutes to appear, not 5 seconds. If sub-minute freshness is required for specific content, implement those pages as SSR (on-demand) routes with direct Sanity queries rather than static pages.

**Affected Phase:** Phase 3 (Sanity + Astro Integration) and Phase 6 (Deployment Pipeline).

**Source:** Cloudflare Deploy Hooks docs; Astro on Cloudflare architecture (no ISR concept)

---

### 14. Sanity `document-internationalization` GROQ Queries Differ From Single-Document Pattern

**Description:**
The current site uses Sanity's `document-internationalization` plugin, which creates separate documents per locale linked via a `translation.metadata` document. Fetching content for a given locale requires a `references()` GROQ query, not a simple `_type == "page" && slug.current == $slug` query. If this query structure is not reproduced correctly in Astro's data-fetching layer, pages will either show no content or show all-locale content merged together.

**Warning Signs:**
- GROQ queries return empty arrays for non-default locales
- The same document appears in all locales (language filter missing)
- Build-time `getStaticPaths` generates paths for all locales but fetches only the German document

**Prevention Strategy:**
Audit all GROQ queries before migration. The correct pattern for this plugin is:
```groq
*[_type == "page" && language == $language && slug.current == $slug][0]{
  title, body, slug, language
}
```
The `language` field must be added as a filter on every query. Verify field naming: the plugin uses `language` (not `__i18n_lang` which was an older pattern). Test queries directly in Sanity Vision or the API explorer before using them in code.

**Affected Phase:** Phase 3 (Sanity + Astro Integration). Validate all queries against the live dataset before writing page components.

**Source:** Sanity `document-internationalization` plugin README (moved to sanity-io/plugins monorepo, official); code inspection of existing Sanity schema

---

## Moderate Pitfalls

### 15. Astro 404 Page Requires i18n-Aware Handling

**Description:**
Astro's `src/pages/404.astro` is a single file. With `prefixDefaultLocale: false`, the 404 page does not automatically know which locale the visitor was using. A visitor hitting a broken German URL will see the 404 page in whatever the default output language is. Crafting a locale-aware 404 requires reading the URL prefix in the 404 page logic.

**Prevention Strategy:**
In `404.astro`, parse `Astro.url.pathname` to detect the locale prefix (`/en/...` or `/es/...`), default to German if no prefix. This is a one-time implementation but must be done explicitly.

**Affected Phase:** Phase 2 (i18n Routing Setup).

---

### 16. Astro `<Image />` Component Attributes Differ From `next/image`

**Description:**
The current codebase uses `next/image`. Astro has its own `<Image />` from `astro:assets`. The required props differ: Astro requires explicit `width` and `height` (or `inferSize` for remote images), does not support `fill` prop, and handles `priority` differently. Direct copy-paste of image components will cause build errors.

**Prevention Strategy:**
When migrating image components, rewrite each one using Astro's `<Image />` API. For remote Sanity images, use `@sanity/image-url` to build URLs and pass to `<img>` or Astro's `<Image />` with explicit dimensions. Add Sanity's CDN domain to `image.domains` in `astro.config.ts`.

**Affected Phase:** Phase 4 (Blog + Portable Text) and Phase 5 (Component Migration).

---

### 17. CSS `className` Must Become `class` in Astro Files

**Description:**
JSX attribute `className` is React-specific. Astro's template syntax uses standard HTML `class`. Copied React component markup will silently not apply class names if `className` is left unchanged in `.astro` files. TypeScript will not always catch this because `.astro` files have a different type surface.

**Prevention Strategy:**
Use search-and-replace (`className=` → `class=`) as a migration step for any JSX converted to Astro template syntax. Keep React components as `.tsx` files (they retain `className`). The rule: if the file ends in `.astro`, use `class`; if it ends in `.tsx`, use `className`.

**Affected Phase:** Phase 5 (Component Migration). Build a checklist item into the migration process.

---

### 18. Cloudflare Auto Minify Setting Breaks React Hydration

**Description:**
Cloudflare's "Auto Minify" setting (available in Speed settings) strips HTML comments and whitespace. Astro hydration uses HTML comment markers to identify island boundaries. With Auto Minify enabled, hydration fails with console errors like "Hydration completed but contains mismatches." Interactive components appear to load but may behave incorrectly.

**Warning Signs:**
- Console errors: "Hydration completed but contains mismatches" only in production
- Interactive components work on `wrangler dev` but not on the deployed URL
- Cloudflare "Speed" settings show HTML Auto Minify enabled

**Prevention Strategy:**
Disable Cloudflare Auto Minify for HTML (but not CSS/JS). This is a Cloudflare dashboard setting, not a code change. Check this before debugging any mysterious hydration mismatch that only appears in production.

**Affected Phase:** Phase 6 (Production Deployment Verification). Add to the deployment checklist.

**Source:** Cloudflare community reports (MEDIUM confidence); Astro GitHub issues on hydration mismatches

---

## Minor Pitfalls

### 19. Astro Build Format and `prefixDefaultLocale: false` — Index Files for Non-Default Locales May Have Wrong `Astro.currentLocale`

**Description:**
A documented Astro bug (issue #9847): when using build format `"file"` (which generates `en.html` rather than `en/index.html`) with `prefixDefaultLocale: false`, the `Astro.currentLocale` for non-default locale index pages returns the wrong value. This only affects index pages, not content pages.

**Prevention Strategy:**
Use the default build format `"directory"` (generates `en/index.html`). Do not use `format: "file"` in `astro.config.ts`. This avoids the bug entirely.

**Affected Phase:** Phase 1 (Astro Config). Set config defaults correctly upfront.

---

### 20. `hreflang` for Default Locale Must Use Unprefixed URL

**Description:**
With `prefixDefaultLocale: false`, the German (default) locale lives at `/` not `/de/`. The `hreflang` annotation for German must point to `https://domain.com/` (no `/de/` prefix). Using `/de/` in hreflang for the default locale signals a non-existent URL to search engines, causing indexing issues.

**Prevention Strategy:**
Generate hreflang tags programmatically using `getAbsoluteLocaleUrl()` from `astro:i18n`, which respects the `prefixDefaultLocale` setting. Do not hardcode locale prefixes in SEO components.

**Affected Phase:** Phase 2 (i18n Routing) and Phase 7 (SEO Verification).

---

## Pitfall-to-Phase Mapping

| # | Pitfall | Phase | Severity |
|---|---------|-------|----------|
| 1 | Targeting Pages instead of Workers | Phase 1: Infrastructure | Critical |
| 2 | Missing `nodejs_compat` flag | Phase 1: Infrastructure | Critical |
| 3 | `astro dev` / `wrangler dev` runtime mismatch | Phase 1: Infrastructure | Critical |
| 4 | 20,000 file limit on free plan | Phase 3: Build + Deploy | High |
| 5 | Astro i18n cannot replicate next-intl `as-needed` cookie behavior | Phase 2: i18n Routing | High |
| 6 | Double-prefix in Sanity slug URLs | Phase 4: Blog | High |
| 7 | `getRelativeLocaleUrl` broken with `routing: "manual"` | Phase 2: i18n Routing | High |
| 8 | Missing `client:*` directive — silent non-interactive components | Phase 5: Components | High |
| 9 | Functions cannot be props on hydrated islands | Phase 5: Components | High |
| 10 | Portable Text / Astro component rendering limitation | Phase 4: Blog | High |
| 11 | `useCdn: false` for build-time Sanity fetches | Phase 3: Sanity Integration | High |
| 12 | `useTranslations` / `useLocale` hooks removed — AnalysePageClient full rewrite | Phase 5: Components | High |
| 13 | No `revalidateTag` ISR — full rebuild on webhook | Phase 3 + Phase 6 | High |
| 14 | GROQ queries need `language` field filter for document-i18n plugin | Phase 3: Sanity Integration | High |
| 15 | 404 page not locale-aware | Phase 2: i18n Routing | Medium |
| 16 | `next/image` → `astro:assets` API differences | Phase 4 + Phase 5 | Medium |
| 17 | `className` → `class` in `.astro` files | Phase 5: Components | Medium |
| 18 | Cloudflare Auto Minify breaks React hydration | Phase 6: Production | Medium |
| 19 | Build format `"file"` + `prefixDefaultLocale: false` index locale bug | Phase 1: Config | Low |
| 20 | hreflang must use unprefixed URL for default locale | Phase 2 + Phase 7 | Low |

---

## Sources

- [Astro Cloudflare adapter docs (official)](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — HIGH confidence
- [Cloudflare Workers Astro guide (official)](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/) — HIGH confidence
- [Cloudflare Pages limits (official)](https://developers.cloudflare.com/pages/platform/limits/) — HIGH confidence
- [Astro i18n routing docs (official)](https://docs.astro.build/en/guides/internationalization/) — HIGH confidence
- [Astro framework components docs (official)](https://docs.astro.build/en/guides/framework-components/) — HIGH confidence
- [Astro migrate from Next.js guide (official)](https://docs.astro.build/en/guides/migrate-to-astro/from-nextjs/) — HIGH confidence
- [Sanity document-internationalization plugin README (official)](https://github.com/sanity-io/plugins/blob/main/plugins/@sanity/document-internationalization/README.md) — HIGH confidence
- [Astro GitHub issue #12897 — i18n unexpected paths](https://github.com/withastro/astro/issues/12897) — MEDIUM confidence
- [Astro GitHub issue #11355 — getRelativeLocaleUrl with manual routing returns wrong URL](https://github.com/withastro/astro/issues/11355) — MEDIUM confidence
- [Astro GitHub issue #9847 — prefixDefaultLocale: false + build format "file" currentLocale bug](https://github.com/withastro/astro/issues/9847) — MEDIUM confidence
- [Astro GitHub issue #5494 — Portable Text Astro component rendering limitation](https://github.com/withastro/astro/issues/5494) — MEDIUM confidence
- [Cloudflare community — Astro CPU time limit reports](https://community.cloudflare.com/t/astro-build-deployment-script-startup-exceeded-cpu-time-limit/490531) — MEDIUM confidence
- [Netlify guide: Sanity Portable Text with Astro](https://developers.netlify.com/guides/how-to-use-sanity-portable-text-with-astro/) — MEDIUM confidence
- Existing project code inspection: `src/app/api/analyze/route.ts`, `AnalysePageClient.tsx`, `FaqBlock.tsx`, `src/i18n/routing.ts`, `src/middleware.ts`

---

*Pitfalls research for: Next.js 15 + next-intl + Sanity → Astro 5 + Cloudflare Workers migration*
*Project: nestorsegura-real-estate (Hamburg real estate agent landing page, de/en/es)*
*Researched: 2026-04-11*

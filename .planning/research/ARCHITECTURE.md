# Architecture: Astro + Cloudflare Pages Migration

**Domain:** Multilingual marketing / lead-gen site  
**Migration:** Next.js 15 App Router → Astro 5 + Cloudflare Pages  
**Researched:** 2026-04-11  
**Confidence:** HIGH — all major claims verified against official Astro docs, Cloudflare docs, and Sanity docs

---

## Context: What Changes, What Stays

| Aspect | Before (Next.js) | After (Astro) |
|--------|-----------------|---------------|
| Runtime | VPS + PM2/Nginx | Cloudflare Pages (edge CDN + Workers) |
| Rendering | Static + ISR via revalidateTag | Static SSG + one server endpoint (Worker) |
| i18n routing | next-intl middleware, `[locale]` dynamic segment | Astro built-in i18n, `prefixDefaultLocale: false` |
| UI strings | next-intl `messages/*.json` | Manual JSON files loaded in Astro frontmatter |
| Content fetch | `sanityFetch` with cache tags | `sanityClient` from `sanity:client`, build-time GROQ |
| Cache busting | `revalidateTag` via webhook | Cloudflare Pages deploy hook (full rebuild) |
| Studio | Embedded at `/studio` | Sanity-hosted (sanity.io/manage) — no route needed |
| Analyse API | `app/api/analyze/route.ts` | `src/pages/api/analyze.ts` (Cloudflare Worker) |

---

## Recommended Directory Structure

```
src/
├── pages/                        # File-based routing (Astro's only required dir)
│   │
│   ├── index.astro               # Home page → / (de, default, no prefix)
│   ├── blog/
│   │   ├── index.astro           # Blog list → /blog/
│   │   └── [slug].astro          # Blog post → /blog/[slug] (de)
│   │
│   ├── en/                       # English routes → /en/…
│   │   ├── index.astro           # Home → /en/
│   │   └── blog/
│   │       ├── index.astro       # Blog list → /en/blog/
│   │       └── [slug].astro      # Blog post → /en/blog/[slug]
│   │
│   ├── es/                       # Spanish routes → /es/…
│   │   ├── index.astro           # Home → /es/
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [slug].astro
│   │
│   └── api/
│       └── analyze.ts            # Server endpoint → /api/analyze (POST)
│                                 # export const prerender = false required
│
├── components/                   # Reusable Astro + React components
│   ├── blocks/                   # Block components (one per Sanity _type)
│   │   ├── PageBuilder.astro     # Dispatcher: sections[] → block components
│   │   ├── HeroSection.astro
│   │   ├── FeatureStrip.astro
│   │   ├── TestimonialsBlock.astro
│   │   ├── CtaBlock.astro
│   │   ├── ProblemSolutionBlock.astro
│   │   ├── ServicesBlock.astro
│   │   ├── FaqBlock.astro
│   │   └── ReferencesBlock.astro
│   ├── blog/                     # Blog-specific components
│   │   ├── PostCard.astro
│   │   └── PortableText.astro    # Wraps @portabletext/svelte or custom renderer
│   └── ui/                       # Shared primitives (buttons, cards, nav, footer)
│
├── layouts/
│   ├── BaseLayout.astro          # <html>, <head> with meta/OG tags, shared CSS
│   └── BlogLayout.astro          # Extends BaseLayout, adds blog-specific structure
│
├── i18n/
│   ├── locales.ts                # Single source of truth: LOCALES, DEFAULT_LOCALE
│   ├── messages/
│   │   ├── de.json               # UI strings for German (default)
│   │   ├── en.json               # UI strings for English
│   │   └── es.json               # UI strings for Spanish
│   └── utils.ts                  # t() helper: load messages, resolve key
│
├── sanity/
│   ├── client.ts                 # Thin re-export of sanity:client; sets useCdn: false
│   ├── queries.ts                # All GROQ queries (typed, named constants)
│   └── image.ts                  # imageUrlFor() helper using @sanity/image-url
│
├── styles/
│   └── global.css                # Tailwind base + custom properties
│
└── env.d.ts                      # /// <reference types="@sanity/astro/env" />
                                  # Cloudflare runtime types (Runtime)

astro.config.mjs                  # defineConfig: adapter, integrations, i18n
wrangler.jsonc                    # Cloudflare Pages build + compatibility config
tsconfig.json
```

### Structure Rationale

**No `[locale]` dynamic segment.** Astro i18n with `prefixDefaultLocale: false` requires the default locale's pages to live at the root of `src/pages/`. Non-default locales (`en/`, `es/`) live in matching subdirectories. This is a fundamental difference from Next.js App Router — there is no dynamic `[locale]` param at all.

**`src/pages/api/analyze.ts` with `export const prerender = false`.** The Cloudflare adapter defaults to `output: 'server'` (all pages server-rendered). For this project the better approach is to keep `output: 'static'` (all pages pre-rendered) and mark only the one dynamic endpoint explicitly. This avoids running all page renders through a Worker on every request.

**`src/i18n/` for UI strings.** Astro has no built-in `useTranslations` equivalent. A lightweight `t(key, locale)` helper loaded from JSON files in frontmatter is the idiomatic pattern — no library required. Keep it simple.

**`src/sanity/` not `src/lib/sanity/`.** Mirrors the existing project convention and keeps GROQ queries co-located with the client that runs them.

**Layouts, not nested routes.** Astro uses explicit layout imports (`<BaseLayout>`) rather than Next.js's implicit `layout.tsx` nesting. One `BaseLayout.astro` handles `<html lang="{locale}">`, meta tags, and Tailwind CSS. Blog posts use `BlogLayout.astro` which wraps `BaseLayout`.

---

## Data Fetching Pattern

### Build-Time (Static, Default for All Pages)

All marketing pages and blog posts are pre-rendered at build time. The Sanity client is called directly in Astro frontmatter — no wrapper or cache layer needed because each build is a fresh fetch.

```typescript
// src/pages/index.astro (de home, simplified)
---
import { sanityClient } from 'sanity:client'
import { PAGE_BY_SLUG_QUERY } from '../sanity/queries'

const locale = 'de'
const page = await sanityClient.fetch(PAGE_BY_SLUG_QUERY, {
  slug: 'home',
  language: locale,
})
---
<BaseLayout locale={locale} seo={page?.seo}>
  <PageBuilder sections={page?.sections ?? []} locale={locale} />
</BaseLayout>
```

```typescript
// src/pages/en/index.astro — same query, locale = 'en'
```

**For the `[slug].astro` blog route**, use `getStaticPaths()` to enumerate all slugs at build time:

```typescript
// src/pages/blog/[slug].astro (de posts)
---
import { sanityClient } from 'sanity:client'
import { ALL_POSTS_QUERY, POST_BY_SLUG_QUERY } from '../../sanity/queries'

export async function getStaticPaths() {
  const posts = await sanityClient.fetch(ALL_POSTS_QUERY, { language: 'de' })
  return posts.map((post) => ({
    params: { slug: post.slug.current },
  }))
}

const { slug } = Astro.params
const post = await sanityClient.fetch(POST_BY_SLUG_QUERY, {
  slug,
  language: 'de',
})
---
```

The same file is duplicated under `en/blog/[slug].astro` and `es/blog/[slug].astro` with `language: 'en'` and `language: 'es'` respectively. **Do not try to share `getStaticPaths` across locale pages — each locale page is its own Astro route file.**

### On-Demand (Server, Only the Analyse Endpoint)

The `src/pages/api/analyze.ts` endpoint runs inside a Cloudflare Worker on every POST request:

```typescript
// src/pages/api/analyze.ts
export const prerender = false   // opt this route out of static build

import type { APIRoute } from 'astro'
import { z } from 'zod'

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json()
  // validation + scoring logic
  return new Response(JSON.stringify({ scores }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const OPTIONS: APIRoute = async () =>
  new Response(null, { status: 204 })
```

Cloudflare environment bindings (e.g., future KV or AI binding) are accessed via `context.locals.runtime.env` when using `@astrojs/cloudflare`.

---

## Content Revalidation Strategy

**Recommended approach: Cloudflare Pages Deploy Hook (full rebuild).**

This is the correct strategy for a mostly-static Astro site. The alternatives and why to reject them are documented below.

### Option A: Deploy Hook (Recommended)

1. In Cloudflare dashboard → Pages project → Settings → Builds → **Add deploy hook**
2. Name it `sanity-publish`, set branch to `main`
3. Copy the generated hook URL
4. In Sanity project settings → API → Webhooks → add new webhook:
   - URL: the Cloudflare deploy hook URL
   - Trigger: `Create`, `Update`, `Delete`
   - Filter: `_type == "page" || _type == "post" || _type == "siteSettings"`
   - Dataset: `production`

On publish, Sanity POSTs to the hook URL. Cloudflare Pages triggers a full rebuild from the main branch. Build time for this project (small page count, fast Sanity fetches) will be under 90 seconds. Resulting pages are served from Cloudflare's global CDN — no Worker involved.

**No custom revalidate endpoint needed.** This removes an entire API route and eliminates the webhook signature verification complexity. The trade-off is a ~60–90 second propagation delay after publish, which is acceptable for a marketing site.

### Option B: On-Demand ISR via `@astrojs/cloudflare` (Rejected)

This would require switching to `output: 'server'` and implementing caching logic inside Workers (using Cache API or KV). It would:
- Route every page request through a Worker (adds latency, adds cost)
- Require Worker caching boilerplate that does not exist in Astro the way `revalidateTag` does in Next.js
- Add significant complexity for no meaningful UX benefit on a low-traffic marketing site

**Reject unless rebuild time exceeds 5 minutes or content editors need sub-minute propagation.**

### Option C: `astro:content` + Git-based CMS (Not applicable)

Not relevant — content lives in Sanity, not the repo.

---

## i18n File and Route Organization

### Astro `astro.config.mjs` i18n Block

```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    locales: ['de', 'en', 'es'],
    defaultLocale: 'de',
    routing: {
      prefixDefaultLocale: false,   // de → /, en → /en/, es → /es/
    },
  },
  // ...
})
```

This mirrors the existing `next-intl` routing behaviour exactly:
- `/` and `/blog/…` serve German (no prefix)
- `/en/` and `/en/blog/…` serve English
- `/es/` and `/es/blog/…` serve Spanish

### UI String Translation (No Library)

There is no `next-intl` equivalent in Astro. The idiomatic approach is a small helper:

```typescript
// src/i18n/utils.ts
import de from './messages/de.json'
import en from './messages/en.json'
import es from './messages/es.json'

const messages = { de, en, es } as const
type Locale = keyof typeof messages

export function t(locale: Locale, key: string): string {
  const map = messages[locale] as Record<string, string>
  return map[key] ?? key  // return key as fallback (visible in UI, easy to catch)
}
```

```astro
// in any .astro file
---
import { t } from '../../i18n/utils'
const locale = 'de'
---
<button>{t(locale, 'cta.label')}</button>
```

The locale is passed as a prop from the page down through `BaseLayout` to all components. No React context, no provider needed — Astro components are server-rendered per request.

### Locale Prop Threading

Because Astro has no equivalent of `NextIntlClientProvider`, locale must be threaded explicitly:

```
src/pages/en/index.astro
  → locale = 'en' (hardcoded, no dynamic param)
  → <BaseLayout locale="en">
      → <PageBuilder sections={…} locale="en">
          → <HeroSection locale="en" …>
```

This is explicit and type-safe. Each locale's page file sets the locale constant. There is no runtime locale detection — locale is fully determined by which file handles the route.

### Astro `currentLocale` Helper

For components that need locale at runtime, Astro provides `Astro.currentLocale` — this returns the locale Astro inferred from the URL path based on the `i18n` config. Use this as a safety fallback in shared components, but prefer the explicit prop approach to avoid ambiguity.

### Message JSON Structure

Keep the same `de.json`, `en.json`, `es.json` structure from the existing project. The only change is importing them directly instead of going through next-intl.

---

## Cloudflare Pages Build Configuration

### `astro.config.mjs` (Relevant Parts)

```javascript
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import sanity from '@sanity/astro'

export default defineConfig({
  output: 'static',              // Pre-render everything by default
  adapter: cloudflare(),         // Needed for the /api/analyze server endpoint
                                 // Even in static mode, adapter handles the one
                                 // on-demand endpoint and Worker function bundling

  integrations: [
    sanity({
      projectId: import.meta.env.SANITY_PROJECT_ID,
      dataset: import.meta.env.SANITY_DATASET,
      useCdn: false,             // false for builds — avoids CDN cache returning
                                 // stale content mid-build
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
    locales: ['de', 'en', 'es'],
    defaultLocale: 'de',
    routing: { prefixDefaultLocale: false },
  },
})
```

**Note on `output: 'static'` + `adapter: cloudflare()`.** The adapter is required even for a static-first site because one route (`/api/analyze`) has `export const prerender = false`. Without the adapter, Astro cannot produce a Worker bundle for that endpoint. The adapter's presence does not force all pages to be server-rendered.

### `wrangler.jsonc`

```jsonc
{
  "name": "nestorsegura-real-estate",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "./dist"
  }
}
```

**`nodejs_compat` flag** is required to use Node.js built-ins (e.g., `Buffer`, `crypto`) that may be needed by the Sanity client or Zod. Set `compatibility_date` to 2024-09-23 or later so `nodejs_compat_v2` (better polyfills) is also included.

**Known issue:** There is an open Astro 6 bug (`#15434`) where `nodejs_compat` + middleware + SSR pages can return `[object Object]`. Workaround is to add `"disable_nodejs_process_v2"` to `compatibility_flags` if this manifests. Monitor the issue.

### Cloudflare Pages Dashboard Build Settings

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | 20 (set in environment variables: `NODE_VERSION=20`) |
| Production branch | `main` |

---

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         SANITY                                  │
│  Sanity Studio (sanity.io/manage)                               │
│  Content Lake (GROQ API)                                        │
│  Webhooks → Cloudflare Pages Deploy Hook                        │
└──────────────────────────┬─────────────────────────────────────┘
                           │ GROQ fetch (build time, useCdn: false)
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                    ASTRO BUILD (CI / Deploy Hook)               │
│                                                                 │
│  getStaticPaths() for blog [slug].astro per locale             │
│  Frontmatter fetch for all index pages                          │
│  PageBuilder.astro dispatches block components                  │
│  UI strings loaded from i18n/messages/*.json                    │
│                                                                 │
│  Output: dist/ — fully static HTML + CSS + JS + Worker bundle  │
└──────────────────────────┬─────────────────────────────────────┘
                           │ npx wrangler deploy (or git push)
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                  CLOUDFLARE PAGES (edge CDN)                    │
│                                                                 │
│  Static assets served from Cloudflare CDN (dist/)              │
│  GET /                     → dist/index.html                   │
│  GET /en/                  → dist/en/index.html                │
│  GET /blog/[slug]          → dist/blog/[slug]/index.html       │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │  Cloudflare Worker (_worker.js)               │              │
│  │  POST /api/analyze → analyze.ts handler       │              │
│  └──────────────────────────────────────────────┘              │
└────────────────────────────────────────────────────────────────┘
```

---

## Component Responsibility Map

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `astro.config.mjs` | Adapter, integrations, i18n config | Cloudflare adapter, Sanity integration |
| `wrangler.jsonc` | Cloudflare runtime compat, asset dir | Cloudflare build system |
| `src/pages/index.astro` (× 3 locales) | Fetch home page data, render layout | `sanity:client`, `PageBuilder.astro`, `BaseLayout.astro` |
| `src/pages/blog/[slug].astro` (× 3 locales) | `getStaticPaths` → all slugs, fetch post by slug | `sanity:client`, `BlogLayout.astro` |
| `src/pages/api/analyze.ts` | Server endpoint, POST handler | Cloudflare Worker runtime |
| `src/components/blocks/PageBuilder.astro` | Switch on `_type`, render block component | All block `.astro` files |
| `src/components/blocks/*.astro` | Render one Sanity block type | `i18n/utils.ts` (for UI strings), Sanity data via props |
| `src/layouts/BaseLayout.astro` | `<html lang>`, `<head>`, meta/OG, Tailwind | `i18n/utils.ts`, all pages |
| `src/i18n/utils.ts` | `t(locale, key)` helper, message loading | `messages/*.json` |
| `src/sanity/queries.ts` | Named GROQ constants | `sanity:client` |
| `src/sanity/image.ts` | `imageUrlFor()` builder | `@sanity/image-url` |

---

## Build Order (Dependency Chain)

Items below depend on items above them. This order maps to phase structure.

```
1. Astro project scaffold
   npx create astro@latest — TypeScript, Tailwind, no framework
   npx astro add cloudflare
   npx astro add @sanity/astro
        ↓
2. wrangler.jsonc + astro.config.mjs
   adapter, i18n config, Sanity integration, useCdn: false
        ↓
3. src/i18n/ setup
   locales.ts (LOCALES constant)
   messages/{de,en,es}.json — port from existing next-intl messages
   utils.ts (t() helper)
        ↓
4. src/sanity/
   queries.ts — port existing GROQ from src/sanity/lib/queries.ts verbatim
   image.ts   — imageUrlFor helper
   (sanity:client is auto-configured by @sanity/astro integration)
        ↓
5. src/layouts/BaseLayout.astro
   <html lang={locale}>, Tailwind import, meta/OG tags
        ↓
6. src/components/blocks/ — port block components from React to Astro
   One file per _type, matching existing blocks/ directory
   (React components can stay as React if needed — Astro supports them)
        ↓
7. src/components/blocks/PageBuilder.astro
   Dispatcher switch on _type (same logic as PageBuilder.tsx)
        ↓
8. src/pages/index.astro (de) + en/index.astro + es/index.astro
   Thin wrappers: fetch data → pass to PageBuilder
        ↓
9. src/pages/blog/ — blog list + [slug].astro (× 3 locales)
   getStaticPaths per locale, post rendering
        ↓
10. src/pages/api/analyze.ts
    Port existing route handler logic; add prerender = false
        ↓
11. Cloudflare Pages project creation
    Connect repo, set build settings, add env vars
        ↓
12. Sanity webhook → Cloudflare deploy hook
    Set up in Sanity project settings
```

**Critical dependency:** Step 4 (queries.ts) can be done before step 6 (block components), but block components must not be started before the GROQ shape is confirmed — field names must match between Sanity queries and component props.

**React vs Astro components:** Block components that have heavy client-side interactivity (e.g., a carousel, accordion with animation) can remain as React components. Import them into `.astro` wrapper components with `client:load` or `client:visible`. This avoids a full rewrite of complex UI.

---

## Anti-Patterns

### Anti-Pattern 1: Using `output: 'server'` for the Entire Site

**What goes wrong:** Every page render runs through a Cloudflare Worker. Worker cold starts add latency. The site is no longer served from Cloudflare CDN cache — it runs compute on every request.

**Do instead:** Keep `output: 'static'`. Mark only `/api/analyze` with `export const prerender = false`.

### Anti-Pattern 2: Trying to Replicate `revalidateTag` Behaviour

**What goes wrong:** Developers attempt to build an on-demand invalidation endpoint similar to the existing `/api/revalidate`. In Astro+Cloudflare, there is no equivalent of Next.js's full-route revalidation cache. Worker-level caching (Cache API) exists but requires manual keying, has no tag concept, and is complex to invalidate correctly.

**Do instead:** Use Cloudflare Pages deploy hooks. Rebuild times for this site will be fast (< 90 seconds). Accept the short propagation delay.

### Anti-Pattern 3: Sharing `getStaticPaths` Across Locales via Dynamic `[locale]` Segment

**What goes wrong:** Creating `src/pages/[locale]/blog/[slug].astro` to handle all locales from one file. This works in Next.js but fights Astro's i18n system — `Astro.currentLocale` becomes unreliable, the `i18n` config no longer controls routing, and deploy-time type safety breaks.

**Do instead:** Duplicate the page file per locale (`de/`, `en/`, `es/`). The duplication is minimal (locale constant + query param), and it maps cleanly to Astro's file-based i18n.

### Anti-Pattern 4: Calling `sanityClient.fetch()` in Client Components

**What goes wrong:** JavaScript bundle includes Sanity client code and credentials. Requests go client-to-Sanity without CDN benefit. Build-time data freshness guarantees are lost.

**Do instead:** All Sanity fetches in `.astro` frontmatter (server-side at build time). Pass data down as props. React components receive only serializable data.

### Anti-Pattern 5: Embedding Studio in Astro

**What goes wrong:** `@sanity/astro` can embed Studio at a route. But this means Studio is built into the Cloudflare Pages deploy, adding bundle size and a complex route exclusion from the i18n middleware.

**Do instead:** Use Sanity-hosted Studio (`yourid.sanity.studio`). Remove all Studio-related code from the Astro project. No `app/studio/` equivalent is needed.

---

## Sources

- [Astro Cloudflare adapter — @astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — HIGH confidence, official Astro docs. Hybrid rendering, `prerender` per-route, Cloudflare bindings via `context.locals.runtime.env` verified.
- [Astro deploy to Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/) — HIGH confidence, official Astro docs. Build command `npm run build`, output dir `dist`, wrangler.jsonc structure verified.
- [Astro i18n routing](https://docs.astro.build/en/guides/internationalization/) — HIGH confidence, official Astro docs. `prefixDefaultLocale: false`, file structure, `Astro.currentLocale`, helper functions verified.
- [Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/) — HIGH confidence, official Astro docs. `export const prerender = false` per-route verified; static default confirmed.
- [Cloudflare Pages deploy hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/) — HIGH confidence, official Cloudflare docs. Sanity webhook → deploy hook pattern, dataset filtering verified.
- [Cloudflare Pages Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) — HIGH confidence, official Cloudflare docs. Build settings, Pages Functions on SSR, adapter installation verified.
- [Cloudflare nodejs_compat flag](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) — HIGH confidence, official Cloudflare docs. `nodejs_compat` + `compatibility_date >= 2024-09-23` pattern confirmed.
- [sanity-astro — @sanity/astro](https://github.com/sanity-io/sanity-astro) — HIGH confidence, official Sanity repo. `sanity:client` virtual import, `useCdn: false` for static builds confirmed.
- [Sanity Astro blog guide](https://www.sanity.io/docs/developer-guides/sanity-astro-blog) — HIGH confidence, official Sanity docs. `getStaticPaths` + GROQ pattern for slug-based routes confirmed.
- [Astro + Cloudflare deep dive (heckmann.app)](https://heckmann.app/en/blog/astro-cloudflare-deep-dive/) — MEDIUM confidence, third-party but detailed. `_routes.json` separation, `server:defer` for islands, `platformProxy` for local dev noted. Cross-referenced with official docs.
- [Astro 6 + Cloudflare + nodejs_compat [object Object] bug #15434](https://github.com/withastro/astro/issues/15434) — MEDIUM confidence, GitHub issue. Workaround: add `"disable_nodejs_process_v2"` to compatibility_flags. Monitor for resolution.

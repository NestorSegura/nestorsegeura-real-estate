# Technology Stack — v2.0 Astro Migration

**Project:** nestorsegura.com (Astro + Cloudflare Pages migration)
**Researched:** 2026-04-11
**Milestone scope:** Replace Next.js 15 + Hostinger VPS with Astro + Cloudflare Pages
**Out of scope for this research:** Sanity v3 schemas, Tailwind v4 config, Sanity TypeGen — these are validated and carry over unchanged.

---

## Core Stack (New Additions)

### Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| astro | ^6.1.5 | Site framework | Current stable release (April 8, 2026). Cloudflare acquired Astro Technology Company in Jan 2026 — Astro 6 is backed by Cloudflare and ships with workerd runtime in dev mode for exact prod parity. No compelling reason to pin to v5 for a greenfield rewrite. |
| @astrojs/cloudflare | ^13.1.8 | Cloudflare Workers/Pages adapter | Required pair with Astro 6. v13 introduced the unified workerd dev environment; v12 is Astro-5-only. |
| wrangler | ^latest (dev dep) | Local dev + deploy CLI | Required to run `wrangler types` for env binding types and to deploy via CI. Install as dev dependency only. |

### Sanity Integration (replaces next-sanity)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @sanity/astro | ^3.3.1 | Official Sanity integration for Astro | Published by Sanity-io. Provides the Sanity client via `useSanityClient()` across all Astro components. Optionally embeds Sanity Studio on a route — but we're hosting Studio externally so this feature is unused. |
| @sanity/client | ^7.x | GROQ query client | Already in the project; carries over unchanged. @sanity/astro peer-depends on it. |
| @sanity/image-url | ^2.x | Sanity CDN image URL builder | Already in the project; carries over unchanged. No next/image dependency. |
| astro-portabletext | ^0.13.0 | Render Sanity Portable Text in Astro components | Official recommendation from Sanity docs for Astro projects. Replaces `@portabletext/react` (which requires React). Zero JS shipped to browser by default. |

**Note on @sanity/astro and React:** The `npx astro add @sanity/astro` command will prompt to also install `@astrojs/react` — this is only needed if you embed Sanity Studio in the Astro site. Since Studio is external (studio.nestorsegura.com), skip the React integration. Install `@sanity/astro` manually and omit React entirely.

### i18n (replaces next-intl)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro built-in i18n | built into astro@6 | Locale routing with prefixDefaultLocale | No external package needed. Astro 4+ has native i18n routing. For de as default locale without prefix, and /en/ + /es/ prefixed: `prefixDefaultLocale: false`. Full parity with the previous next-intl `localePrefix: 'as-needed'` behavior. |

**Configuration (astro.config.mjs):**
```js
i18n: {
  locales: ["de", "en", "es"],
  defaultLocale: "de",
  routing: {
    prefixDefaultLocale: false
  }
}
```

**Translation strings:** Astro's built-in i18n handles routing only — not translation strings. You need a lightweight solution for UI strings (button labels, nav text, form labels). Options:

- **Recommended:** Write a small `src/i18n/ui.ts` translation dictionary (a plain object keyed by locale + string key) and a `useTranslations(locale)` helper function. This is the pattern in the official Astro i18n docs and is appropriate at this site's scale (one landing page, <50 UI strings).
- **Alternative:** `astro-i18next` — heavier, unnecessary overhead for this scale.
- Do NOT install next-intl — it is a Next.js-specific library.

---

## Supporting Libraries

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| @astrojs/sitemap | included with astro | Generates sitemap.xml with multilingual hreflang | Run `npx astro add sitemap`. Configure `i18n` locales to get proper hreflang tags automatically. Replaces next-sitemap. |
| motion | ^12.x | Animations for interactive islands | Carry over from current stack. Used only inside `.astro` components that opt into client-side JS via `<script>` or inside framework islands. Keep usage minimal — Astro is MPA-first. |
| clsx | ^2.x | Conditional class composition | Carry over. Pure utility, no framework dependency. |
| tailwind-merge | ^3.x | Safe Tailwind class merging | Carry over. No framework dependency. |
| zod | ^4.x | Schema validation for /api/analyse POST body | Carry over. Server-side only in Astro endpoints. |

---

## Removed Libraries (Next.js-Specific, Do Not Migrate)

| Library | Why Removed |
|---------|-------------|
| next | Replaced by astro |
| next-intl | Next.js-specific. Astro has built-in i18n routing. UI strings handled by a custom dictionary helper. |
| next-sanity | Next.js-specific bridge. Replaced by @sanity/astro. |
| @portabletext/react | React-specific renderer. Replaced by astro-portabletext. |
| next-sitemap | Next.js-specific. Replaced by @astrojs/sitemap integration. |
| react, react-dom | Not needed unless using React islands. No React islands planned for this site. Only add back if a specific interactive component genuinely requires React. |
| sharp | Required by Next.js image optimization. Astro uses the Cloudflare Images binding or passthrough for images — no server-side sharp processing on Workers. |
| PM2, ecosystem.config.js | VPS process manager. Irrelevant on Cloudflare Pages. |

---

## Cloudflare Configuration

### Adapter Config (astro.config.mjs)

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',          // All pages server-rendered by default
  adapter: cloudflare(),
  i18n: {
    locales: ["de", "en", "es"],
    defaultLocale: "de",
    routing: { prefixDefaultLocale: false }
  }
});
```

**On `output: 'server'` vs `'hybrid'`:** Use `'server'` for the initial migration — it is the well-tested mode with the Cloudflare adapter. Hybrid (mixing static + SSR pages) had a known open issue with Cloudflare Workers in early 2026 (#15237 on withastro/astro). You can add `export const prerender = true` to individual pages (like static blog list pages) once the base build is confirmed stable.

### wrangler.jsonc

```jsonc
{
  "name": "nestorsegura-real-estate",
  "compatibility_date": "2025-05-21",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

Run `npx wrangler types` after any change to this file to regenerate `worker-configuration.d.ts` for typed env bindings.

### API Routes (replaces Next.js route handlers)

Astro endpoints replace Next.js `route.ts` files. The `/api/analyse` POST endpoint:

```
src/pages/api/analyse.ts   →   /api/analyse
```

```ts
// src/pages/api/analyse.ts
import type { APIRoute } from 'astro';
import { z } from 'zod';

const bodySchema = z.object({ url: z.string().url() });

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  }
  // ... analysis logic
  return new Response(JSON.stringify({ result: '...' }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

Cloudflare environment variables and bindings are accessible via `Astro.locals.runtime.env` in endpoints and pages. There is no separate `functions/` directory — Astro compiles everything into the Worker entrypoint.

### Environment Variables

Astro distinguishes public vs secret env vars:
- `PUBLIC_SANITY_PROJECT_ID` — accessible in client-side code
- `SANITY_API_TOKEN` — server-only, never exposed to client
- Secrets set in Cloudflare Pages dashboard under "Settings > Environment variables"
- Local dev: `.dev.vars` file (wrangler convention, gitignored)

---

## Cloudflare Pages Free Tier Limits

| Resource | Free Limit | Impact on This Project |
|----------|------------|----------------------|
| Bandwidth | Unlimited | No concern |
| Requests (static assets) | Unlimited | No concern |
| Function invocations | 100,000/day (shared with Workers) | Low concern — this site is not high traffic. The /api/analyse endpoint is the only function. |
| CPU time per invocation | 10ms | The /api/analyse endpoint must complete within 10ms CPU time. If calling external APIs (PageSpeed Insights), use `waitUntil()` for async work outside request path. Stub implementation has no risk. Real implementation may need a paid tier upgrade ($5/month). |
| Builds per month | 500 | No concern for solo dev |
| Files per deployment | 20,000 | No concern — Astro builds are small |
| Max file size | 25 MiB | No concern |
| Redirects (_redirects file) | 2,100 combined | Adequate |
| Preview deployments | Unlimited | Useful for PR previews |

**Critical constraint:** The 10ms CPU time limit applies to Pages Functions on the free tier. This is real CPU time, not wall-clock time — waiting on external I/O (fetching from Sanity, calling an external API) does not count against this limit. A simple Zod validation + JSON response is well within 10ms. A complex PageSpeed Insights integration that does CPU-heavy parsing may hit this limit.

---

## Build & Deploy

```bash
# Install
npm create astro@latest  # or manually init

# Add integrations
npx astro add cloudflare
npx astro add sitemap
npm install @sanity/astro @sanity/client @sanity/image-url astro-portabletext

# Local dev (uses workerd runtime via Cloudflare Vite plugin)
npm run dev

# Build
npm run build   # outputs to ./dist

# Deploy
npx wrangler deploy
# or connect GitHub repo to Cloudflare Pages dashboard for CI/CD
```

**Cloudflare Pages CI/CD settings:**
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (or use Pages Git integration which auto-deploys on push)
- Output directory: `dist` (but with Workers deployment mode, wrangler.jsonc controls this)

---

## Version Compatibility Matrix

| Package | Version | Compatible With |
|---------|---------|-----------------|
| astro | ^6.1.5 | @astrojs/cloudflare@^13, TypeScript@5+, Tailwind@4 |
| @astrojs/cloudflare | ^13.1.8 | astro@6 only (v12 = astro@5) |
| @sanity/astro | ^3.3.1 | sanity@5.x, @sanity/client@7 |
| astro-portabletext | ^0.13.0 | Astro 4+, Sanity Portable Text |
| Tailwind v4 | (carry over) | Works in Astro via Vite plugin — no PostCSS changes needed compared to Next.js setup |
| sanity (package v5.x) | carry over | Unchanged — frontend framework is irrelevant to Sanity Studio |

---

## What NOT to Add

| Do Not Add | Why |
|------------|-----|
| @astrojs/react | Only needed for embedding Sanity Studio in the Astro site. Studio is at studio.nestorsegura.com. Adding React just for Studio would ship ~130kb React runtime unnecessarily. |
| next-intl | Next.js-only. Astro built-in i18n handles routing. A small translation dictionary handles UI strings. |
| astro-i18next | Overkill for <50 UI strings. Adds i18next's full dependency tree. The custom dictionary pattern from Astro docs is 20 lines of code. |
| react-hook-form | React-only. For any forms in Astro, use native HTML form with an Astro API endpoint or Cloudflare Function. |
| @portabletext/react | React renderer. Use astro-portabletext instead. |
| Vercel-specific packages | Any `@vercel/*` package is irrelevant on Cloudflare. |
| @astrojs/node | Node.js adapter. This project deploys to Cloudflare Workers, not Node.js. |

---

## Sources

- [GitHub withastro/astro releases](https://github.com/withastro/astro/releases) — astro@6.1.5, @astrojs/cloudflare@13.1.8 confirmed April 8, 2026 — **HIGH confidence**
- [Astro Cloudflare adapter docs](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — adapter config, wrangler.jsonc structure, API route patterns — **HIGH confidence**
- [Astro i18n routing docs](https://docs.astro.build/en/guides/internationalization/) — prefixDefaultLocale behavior confirmed — **HIGH confidence**
- [Astro deploy to Cloudflare docs](https://docs.astro.build/en/guides/deploy/cloudflare/) — build/deploy commands, output directory — **HIGH confidence**
- [@sanity/astro on npm](https://www.npmjs.com/package/@sanity/astro) — v3.3.1, last published ~25 days ago — **HIGH confidence**
- [Sanity official Astro integration page](https://www.sanity.io/plugins/sanity-astro) — docs updated March 23, 2026; confirmed @astrojs/react only needed for embedded Studio — **HIGH confidence**
- [astro-portabletext on npm](https://www.npmjs.com/package/astro-portabletext) — v0.13.0, Sanity's recommended Astro renderer — **HIGH confidence**
- [Cloudflare Pages limits docs](https://developers.cloudflare.com/pages/platform/limits/) — 500 builds/month, 20k files, 25MiB max file size — **HIGH confidence**
- [Cloudflare Workers pricing docs](https://developers.cloudflare.com/workers/platform/pricing/) — 100k requests/day free, 10ms CPU time per invocation — **HIGH confidence**
- [Cloudflare acquires Astro blog post](https://blog.cloudflare.com/astro-joins-cloudflare/) — acquisition context, Astro 6 workerd-backed dev server — **HIGH confidence**
- [withastro/astro issue #15237](https://github.com/withastro/astro/issues/15237) — hybrid mode issues with Cloudflare Workers in early Astro 6 — **MEDIUM confidence** (issue may be resolved; recommend starting with `output: 'server'` to avoid)

---

*Stack research for: nestorsegura.com v2.0 Astro Migration*
*Researched: 2026-04-11*

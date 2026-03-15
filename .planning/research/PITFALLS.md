# Pitfalls Research

**Domain:** Multilingual professional landing page / lead-gen site (Next.js 15 + Sanity.io v3 + next-intl + VPS/PM2)
**Researched:** 2026-03-15
**Confidence:** HIGH — majority of findings verified through official documentation, official GitHub issues, and Vercel's own engineering blog

---

## Critical Pitfalls

### Pitfall 1: Middleware Catches /studio and /api Routes

**What goes wrong:**
next-intl middleware intercepts every request that matches its matcher. If `/studio` and `/api` are not explicitly excluded, the middleware tries to locale-detect and redirect/rewrite those routes. Sanity Studio breaks silently (assets load from the wrong path, or Studio never initializes), and API route handlers return locale-prefixed JSON or get redirected before the handler runs.

**Why it happens:**
The default next-intl matcher pattern excludes `_next`, `_vercel`, and paths with a dot (for static files), but does NOT automatically exclude `/studio` or `/api`. Developers copy a starter template and forget to audit the matcher.

**How to avoid:**
Explicitly exclude both in the middleware `matcher` config:

```ts
// middleware.ts
export const config = {
  matcher: '/((?!api|studio|_next|_vercel|.*\\..*).*)'
}
```

Verify by hitting `/studio` before adding any other functionality — it must load cleanly with no locale prefix or redirect.

**Warning signs:**
- Sanity Studio shows a blank screen or partial load after embedding at `/studio`
- API routes return HTML instead of JSON
- `next dev` logs show middleware running on `/studio/*` paths

**Phase to address:** Foundation / project setup phase — configure the matcher before writing a single page.

---

### Pitfall 2: standalone Output Silently Omits public/ and .next/static/

**What goes wrong:**
After `next build` with `output: 'standalone'`, the generated `.next/standalone/` directory intentionally does NOT include the `public/` folder or `.next/static/`. Starting `server.js` directly works in development because those folders exist in the project root, but on the VPS after deploying only the standalone output, images, fonts, and JS chunks return 404.

**Why it happens:**
Next.js standalone mode is designed for CDN-backed deployments where static assets are served separately. For VPS deployments without a CDN, developers forget the manual copy step that Next.js documentation calls out but does not automate.

**How to avoid:**
Add this to your deploy script (runs after `next build`):

```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/static
```

Or encode it in `package.json`:
```json
"build:deploy": "next build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/static"
```

Nginx should proxy to `server.js` at port 3000; static files are then served by Node.js from the copied folders.

**Warning signs:**
- All page HTML loads but images and fonts are broken (404 in browser devtools)
- `/favicon.ico` returns 404
- `.next/standalone/` exists but is missing `public/` subdirectory after build

**Phase to address:** Deployment / CI-CD setup phase — encode in build script before first VPS deploy.

---

### Pitfall 3: Sanity CDN + ISR = Stale Content That Never Refreshes

**What goes wrong:**
`useCdn: true` is the Sanity client default. The Sanity CDN caches responses for ~60 seconds. When Next.js ISR triggers a revalidation, it fetches from the Sanity CDN and receives stale data, then re-caches that stale version. Content editors update a document in Studio, the webhook fires, Next.js revalidates — but the page still shows old content for up to another CDN TTL cycle.

**Why it happens:**
Teams copy a basic `sanityClient` config from tutorials that set `useCdn: true` (reasonable for public reads), then enable on-demand revalidation without switching `useCdn` off for the fetch that happens during revalidation.

**How to avoid:**
Use two Sanity clients: one with `useCdn: true` for non-revalidating reads (fast, cached), and one with `useCdn: false` for the `sanityFetch` function used by ISR/tag-based revalidation:

```ts
// lib/sanity.ts
export const sanityClient = createClient({ useCdn: true, ... })      // general reads
export const sanityFetch = createClient({ useCdn: false, ... })       // revalidation path
```

**Warning signs:**
- Webhook fires (confirmed in Sanity logs), but the deployed page still shows old content for minutes
- Manually hitting `/api/revalidate` triggers Next.js revalidation but content stays stale

**Phase to address:** CMS integration phase — set up clients correctly before wiring any revalidation.

---

### Pitfall 4: Mixing Time-Based and Tag-Based Revalidation

**What goes wrong:**
Sanity's official `sanityFetch` helper ignores the `revalidate` parameter when `tags` are provided. If a developer sets both `{ revalidate: 3600, tags: ['post'] }`, the time-based revalidation is silently discarded. The page never refreshes on a schedule, only on webhook trigger — or vice versa if configured backwards.

**Why it happens:**
Developers expect both strategies to compose. The mutual exclusivity is documented but easy to miss when copying examples.

**How to avoid:**
Pick one strategy project-wide. For a CMS-driven site where editors publish content, **tag-based + webhook** is strongly preferred: editors see changes reflected immediately, and you avoid unnecessary rebuilds on a timer.

```ts
// Always use tags, never combine with revalidate number
const data = await sanityFetch({ query: QUERY, tags: ['page', 'hero'] })
```

**Warning signs:**
- Pages update instantly sometimes, but other times lag by exactly N seconds (revalidate period)
- Changing a document triggers the webhook but some pages still rotate on the old timer

**Phase to address:** CMS integration phase — establish the strategy before writing any fetch calls.

---

### Pitfall 5: Webhook Revalidation Secret Mismatch

**What goes wrong:**
The revalidation API route (`/api/revalidate`) validates an incoming secret against `SANITY_REVALIDATE_SECRET`. If this env var is missing on the VPS, not set in Sanity's webhook configuration, or the values don't match exactly (trailing newline, copy-paste error), every webhook call returns 401 and no revalidation ever runs. Content editors see their changes stuck.

**Why it happens:**
The secret is configured in two places (`.env.local` and Sanity's webhook settings UI), and they diverge during deployment or when rotating secrets.

**How to avoid:**
- Generate secret once: `openssl rand -hex 32`
- Store it in `.env.production` on the VPS
- Set the identical value in Sanity → API → Webhooks as the HTTP Header value `Authorization: Bearer <secret>`
- Test the webhook immediately after first deploy with Sanity's "Send test notification" button and check PM2 logs

**Warning signs:**
- Sanity webhook delivery logs show 401 responses
- `pm2 logs` show "Invalid signature" or "Unauthorized" when content is published

**Phase to address:** Deployment / CMS wiring phase — verify immediately after first VPS deploy.

---

### Pitfall 6: next-intl localePrefix 'as-needed' Causes Redirect Loops for Default Locale

**What goes wrong:**
With `localePrefix: 'as-needed'`, the default locale (e.g., `en`) has no URL prefix (`/about` not `/en/about`). But next-intl uses a `NEXT_LOCALE` cookie to remember a user's locale. If a user previously visited `/de/about`, their cookie is set to `de`. When they later visit `/about` (no prefix), the middleware reads the cookie and redirects them to `/de/about` — even though they typed an unprefixed URL expecting English.

**Why it happens:**
The cookie persistence is intentional (remembers language preference), but it surprises developers when testing in a browser where a previous session left a stale cookie.

**How to avoid:**
- In development: clear `NEXT_LOCALE` cookie between language tests
- In production: this is expected behavior for returning users; document it as intended
- If you want prefix-less URLs to always serve the default locale regardless of cookie, use `localePrefix: 'always'` and accept `/en/` in default-locale URLs
- Ensure middleware matcher handles unprefixed paths: the matcher must not exclude `/` or short paths

**Warning signs:**
- `/about` in incognito works, but in regular browser shows German content
- Tests pass in fresh environment but fail for QA tester who previously used the German locale

**Phase to address:** i18n setup phase — document the behavior in a project ADR so it doesn't get treated as a bug.

---

### Pitfall 7: async params Not Awaited in Dynamic Route Components

**What goes wrong:**
Next.js 15 made `params` and `searchParams` asynchronous Promises. Every dynamic route component (`app/[locale]/blog/[slug]/page.tsx`) must `await params` before accessing its properties. Accessing `params.slug` directly (the Next.js 14 pattern) still works in Next.js 15 with a deprecation warning, but will break in a future release and currently causes TypeScript type errors at build time.

**Why it happens:**
Most tutorials and blog posts were written for Next.js 13/14. Copying route handlers from those sources produces code that type-checks at `strict: false` but fails in strict mode and will break in Next.js 16.

**How to avoid:**
Always destructure params asynchronously in page components:

```tsx
// app/[locale]/blog/[slug]/page.tsx
export default async function BlogPost({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  // ...
}
```

Run `npx @next/codemod@latest next-async-request-api .` during setup to catch all instances automatically.

**Warning signs:**
- TypeScript errors about `params` type being `Promise<...>` vs plain object
- Build warnings: "Route `/[locale]/...` used `params.slug` without awaiting"

**Phase to address:** Foundation phase — run the codemod before writing route-specific logic.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `"use client"` on layout or large component trees | Stops RSC errors quickly | Entire subtree ships to browser; no RSC rendering benefits; bundle grows | Never — isolate only the interactive leaf component |
| Calling Route Handlers from Server Components via `fetch('http://localhost:3000/api/...')` | Feels familiar (REST pattern) | Unnecessary network round-trip; hardcoded `localhost` breaks in production | Never — call the logic directly in the Server Component |
| `useCdn: true` on all Sanity fetches | Faster reads, lower Sanity API load | Tag-based revalidation serves stale data indefinitely | Only acceptable for content that never needs on-demand revalidation |
| Skipping Suspense boundaries on async data fetches | Less boilerplate | Entire page blocks on the slowest fetch; streaming disabled | Only in MVP prototypes, never in production pages |
| Storing all Page Builder blocks as Sanity references | Feels normalized and "correct" | Queries become deeply nested; performance degrades; Studio UX degrades | Only when content genuinely needs to be reused across many pages |
| Hardcoding `revalidate: 60` on all fetches | Simple, no webhook setup needed | Content editors see 60-second lag; unreliable freshness perception | Acceptable only for pages with no editor-controlled content |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| next-intl + Sanity Studio `/studio` | Middleware rewrites Studio routes to `/en/studio` or similar, breaking Studio entirely | Exclude `/studio` from middleware matcher regex before any other work |
| next-intl + Next.js API routes `/api/*` | Middleware intercepts API calls, adding locale redirects that corrupt JSON responses | Exclude `/api` from middleware matcher regex |
| Sanity webhook + PM2 | PM2 restarts the process during a webhook-triggered revalidation, dropping the in-flight response | Use `pm2 gracefulReload` not `pm2 restart`; configure `wait_ready: true` in ecosystem file |
| Sanity GROQ + next-intl locale | Querying Sanity without filtering by locale field, then relying on next-intl to display translated text that doesn't exist | Either store all locales in one Sanity document (with locale fields) or use separate documents per locale and filter by `locale == $locale` in every GROQ query |
| `next/image` + VPS (no Vercel) | Image optimization works, but `sharp` may not be installed or may fail on glibc-based Linux with memory errors | Run `npm install sharp` explicitly; on Linux consider adding `MALLOC_ARENA_MAX=2` env var |
| Tailwind CSS v4 + PostCSS | Missing `@tailwindcss/postcss` in `postcss.config.mjs` causes all Tailwind classes to silently output nothing | Tailwind v4 requires `@tailwindcss/postcss` plugin; `tailwind.config.js` is no longer generated by default |
| Tailwind CSS v4 + `tailwindcss-animate` (shadcn) | `@plugin 'tailwindcss-animate'` syntax causes build errors | Remove the `@plugin` line or upgrade to the v4-compatible version |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `"use client"` on parent layout wraps entire page tree | Page JS bundle is large; First Contentful Paint slow; Lighthouse JS size warning | Push `"use client"` down to the smallest interactive leaf (button, form); pass Server Component children as props | Day 1 if layout.tsx is marked client |
| No Suspense wrapping around async data components | Page white-screens until all data fetches resolve; no streaming | Wrap each independently-fetched section in `<Suspense fallback={...}>` | At any data fetch latency > 200ms |
| GROQ queries without field projection | Sanity returns entire document including unreferenced fields; bandwidth wasted; slow response | Always project only needed fields: `{ title, slug, body }` | Scales poorly; worst at 50+ documents |
| Uncached Sanity fetches in hot paths | API rate limits hit; Sanity CDN budget exhausted; pages slow on every request | Use `next-sanity`'s `sanityFetch` with tags to leverage Next.js Data Cache | At any meaningful traffic |
| `redirect()` inside `try/catch` in Server Actions | Redirect silently swallowed; user stays on same page with no feedback | Place `redirect()` outside try/catch; only catch actual errors | Every time — fails at 1 user |
| PM2 cluster mode with standalone `server.js` without verifying `.next` path | PM2 workers error "cannot find .next" on startup; only one instance actually serves | Point `cwd` to `.next/standalone/` in PM2 ecosystem config; test with `pm2 start` before going live | At first deploy |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing `SANITY_API_TOKEN` (write token) in `NEXT_PUBLIC_*` env var | Token ships in browser bundle; attacker can write/delete all Sanity content | Never prefix write tokens with `NEXT_PUBLIC_`; only read tokens can be considered, and even then prefer server-only access |
| No secret on the `/api/revalidate` webhook endpoint | Anyone can trigger cache invalidation; potential DoS via constant revalidation | Always validate `Authorization: Bearer <secret>` header; return 401 on mismatch |
| Sanity Studio at `/studio` with no authentication | Studio is publicly accessible; anyone can edit content | Configure Sanity user management (Google/GitHub SSO) in Sanity project settings; Studio auth is handled by Sanity, not Next.js |
| Environment variables not set on VPS (only in `.env.local`) | App starts with `undefined` for critical vars; crashes at runtime or exposes default fallbacks | Use `.env.production` on VPS or set vars in PM2 ecosystem file via `env_production` block; verify with `pm2 env <id>` |
| Webhook endpoint accepts any origin without CORS restriction | Not a direct risk for webhook (server-to-server) but API routes may be unintentionally open | For API routes handling mutations, verify `Origin` or require auth headers |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state on form submissions (lead capture) | User clicks submit, nothing happens visually, clicks again — duplicate submissions | Use `useFormStatus` or manage `isPending` state; disable button on submit |
| Language switcher changes locale but loses the current page path | User reads `/de/blog/my-post`, switches to English, lands on `/` not `/blog/my-post` | Use next-intl's `Link` with `locale` prop to generate locale-switched href for the current path |
| Default locale (`en`) has no `/en/` prefix but hreflang points to `/en/` | Google sees duplicate content or misses the default locale page | Configure `hreflang` annotations explicitly in metadata: `x-default` for the unprefixed URL, `en` for the same unprefixed URL |
| Page Builder blocks render synchronously without skeleton states | CMS-heavy pages flash unstyled or show blank sections during hydration | Add `loading.tsx` segments and Suspense skeletons around Page Builder block renders |
| Contact form sends to generic `info@` with no CRM routing | Leads lost in email inbox; no way to track conversion | Even in MVP, forward to a tracked inbox or use a service like Resend with tagging |

---

## "Looks Done But Isn't" Checklist

- [ ] **Middleware exclusions:** Verify `/studio` and `/api` return correct responses without locale redirect — hit them directly in browser after setup
- [ ] **Static assets on VPS:** After deploy, check that `/favicon.ico`, an image from `public/`, and a `/_next/static/` chunk all return 200
- [ ] **Revalidation pipeline:** Publish a Sanity document change, watch Sanity webhook delivery logs, confirm the deployed page updates within ~5 seconds
- [ ] **All three locales:** Navigate to `/`, `/es/`, and `/de/` — all must render with correct translations, not fall back to English silently
- [ ] **i18n cookie behavior:** In a non-incognito browser tab, switch to German, then navigate to `/` (unprefixed) — confirm behavior is intentional (redirect to `/de/`) and documented
- [ ] **PM2 restart after deploy:** Confirm `pm2 logs` show no `.next folder not found` errors; all requests return 200 after restart
- [ ] **`sharp` installed on VPS:** Hit a page with `next/image`; confirm images load without `500` errors in PM2 logs
- [ ] **Sanity Studio auth:** Open `/studio` in an incognito window — confirm it prompts for Sanity login, not just opens freely
- [ ] **TypeScript strict build:** Run `next build` with `strict: true` in `tsconfig.json`; no `params` async warnings

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Middleware caught `/studio` | LOW | Fix matcher regex, redeploy, clear browser cache |
| Public folder missing from VPS deploy | LOW | Add copy step to deploy script, redeploy |
| CDN-stale Sanity content | LOW | Switch `useCdn: false` in fetch client, redeploy |
| Mixed revalidation strategy | MEDIUM | Audit all `sanityFetch` calls, standardize to tags-only, redeploy and test each page |
| Webhook secret mismatch | LOW | Regenerate secret, update both VPS env and Sanity webhook, redeploy |
| `"use client"` on entire layout | MEDIUM | Identify what actually needs client state, extract to leaf component, test hydration |
| Broken i18n paths after adding new locale | MEDIUM | Audit all hard-coded href strings, replace with next-intl `Link`; audit GROQ queries for locale filter |
| PM2 cluster misconfig (wrong cwd) | LOW | Fix ecosystem config, `pm2 delete all && pm2 start ecosystem.config.js --env production` |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Middleware catches /studio and /api | Phase 1: Foundation & project setup | Hit `/studio` and `/api/health` before writing any pages; confirm correct response |
| standalone output missing public/ | Phase 4: Deployment & CI | Build locally, inspect `.next/standalone/`, run deploy script, verify static assets |
| Sanity CDN interferes with revalidation | Phase 2: CMS integration | Publish a test document in Studio; confirm page updates on deployed preview |
| Mixed time + tag revalidation | Phase 2: CMS integration | Code review all `sanityFetch` calls; no `revalidate` number alongside `tags` |
| Webhook secret mismatch | Phase 4: Deployment & CI | Test webhook immediately after first VPS deploy via Sanity's "Send test" button |
| localePrefix as-needed redirect loop | Phase 3: i18n setup | Test with stale `NEXT_LOCALE` cookie in browser; document behavior in ADR |
| async params not awaited | Phase 1: Foundation & project setup | Run `next-async-request-api` codemod; enforce in CI with `tsc --noEmit` |
| "use client" over-application | Phase 1 onwards (ongoing) | Bundle analyzer check before each phase completion (`@next/bundle-analyzer`) |
| Sanity Page Builder references overuse | Phase 2: CMS integration | Schema design review: use objects unless cross-page reuse is confirmed requirement |
| redirect() inside try/catch | Any phase with Server Actions | ESLint rule or code review checklist item |
| PM2 cluster wrong cwd | Phase 4: Deployment & CI | `pm2 start ecosystem.config.js` on staging VPS before production |
| hreflang missing for default locale | Phase 3: i18n setup | Validate with Google Search Console rich results test after launch |

---

## Sources

- [next-intl Middleware Docs — official, pitfall on matcher](https://next-intl.dev/docs/routing/middleware) — HIGH confidence
- [next-intl Routing Configuration — localePrefix as-needed behavior](https://next-intl.dev/docs/routing/configuration) — HIGH confidence
- [Next.js Self-Hosting Guide — standalone output, static asset copy requirement](https://nextjs.org/docs/app/guides/self-hosting) — HIGH confidence (fetched 2026-02-27)
- [Next.js Deploying Docs — Node.js server, streaming + nginx buffering](https://nextjs.org/docs/app/getting-started/deploying) — HIGH confidence
- [Vercel Engineering Blog — Common App Router mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — HIGH confidence
- [Sanity Learn — Tag-based revalidation course](https://www.sanity.io/learn/course/controlling-cached-content-in-next-js/tag-based-revalidation) — HIGH confidence
- [Sanity Learn — Scaling page builders and pitfalls](https://www.sanity.io/learn/course/page-building/scaling-page-builders-and-pitfalls) — HIGH confidence
- [Next.js Dynamic APIs Async — official docs](https://nextjs.org/docs/messages/sync-dynamic-apis) — HIGH confidence
- [next-intl GitHub Issue #933 — useTranslations context not found](https://github.com/amannn/next-intl/issues/933) — MEDIUM confidence
- [next-sanity GitHub Issue #639 — revalidateTag issues](https://github.com/sanity-io/next-sanity/issues/639) — MEDIUM confidence
- [Next.js Discussion #10675 — PM2 cluster mode support](https://github.com/vercel/next.js/discussions/10675) — MEDIUM confidence
- [Tailwind CSS v4 Next.js build issues](https://medium.com/@hardikkumarpro0005/fixing-next-js-15-and-tailwind-css-v4-build-issues-complete-solutions-guide-438b0665eabe) — MEDIUM confidence (verified against Tailwind official docs)
- [App Router pitfalls article — Feb 2026](https://imidef.com/en/2026-02-11-app-router-pitfalls) — MEDIUM confidence

---
*Pitfalls research for: Next.js 15 App Router + Sanity.io v3 + next-intl multilingual landing page on VPS/PM2*
*Researched: 2026-03-15*

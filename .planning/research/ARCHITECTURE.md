# Architecture Research

**Domain:** Multilingual landing page / lead generation site (Next.js 15 + Sanity v3 + next-intl)
**Researched:** 2026-03-15
**Confidence:** HIGH — all major claims verified against official Next.js, Sanity, and next-intl documentation

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONTENT LAYER                                 │
│  ┌──────────────────────────┐  ┌────────────────────────────────┐   │
│  │   Sanity Studio           │  │   Sanity Content Lake (API)    │   │
│  │   /studio/[[...tool]]     │  │   GROQ queries via sanityFetch │   │
│  └──────────────────────────┘  └───────────────┬────────────────┘   │
└─────────────────────────────────────────────────┼───────────────────┘
                                                  │ HTTP (GROQ / CDN API)
┌─────────────────────────────────────────────────▼───────────────────┐
│                        NEXT.JS APP LAYER                             │
│                                                                       │
│  middleware.ts ──────────────────────────────────────────────────┐   │
│  (next-intl: locale detection, prefix rewrite, cookie set)       │   │
│                                                                   │   │
│  app/[locale]/layout.tsx                                         │   │
│  (setRequestLocale, NextIntlClientProvider, shared UI shell)     │   │
│                                                                   │   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  │   │
│  │ app/[locale]/    │  │ app/[locale]/    │  │ app/studio/    │  │   │
│  │ page.tsx         │  │ blog/[slug]/     │  │ [[...tool]]/   │  │   │
│  │ (home/landing)   │  │ page.tsx (blog)  │  │ page.tsx       │  │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────────────┘  │   │
│           │                     │                                   │   │
│  ┌────────▼─────────────────────▼──────────────────────────────┐  │   │
│  │                    COMPONENT LAYER                           │  │   │
│  │  PageBuilder.tsx ──→ blocks/HeroBlock.tsx                   │  │   │
│  │                  ──→ blocks/FeaturesBlock.tsx                │  │   │
│  │                  ──→ blocks/TestimonialsBlock.tsx            │  │   │
│  │                  ──→ blocks/CtaBlock.tsx                     │  │   │
│  └─────────────────────────────────────────────────────────────┘  │   │
│                                                                   │   │
│  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │                    API ROUTES                                 │  │   │
│  │  app/api/revalidate/route.ts  (Sanity webhook handler)       │  │   │
│  │  app/api/analyze/route.ts     (website analysis stub)        │  │   │
│  └──────────────────────────────────────────────────────────────┘  │   │
└─────────────────────────────────────────────────────────────────────┘
                │                              │
         PM2 + Nginx                   Sanity webhook
         (Hostinger VPS)               POST /api/revalidate
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `middleware.ts` | Detect locale from URL / cookie / accept-language header, rewrite `[locale]` param into request, redirect superfluous prefixes | next-intl routing engine |
| `i18n/routing.ts` | Single source of truth for locales, defaultLocale, localePrefix config | middleware, request.ts, navigation helpers |
| `i18n/request.ts` | Map `requestLocale` → validated locale, load message JSON from `i18n/messages/[locale].json` | next-intl server internals |
| `app/[locale]/layout.tsx` | Call `setRequestLocale(locale)`, wrap tree in `NextIntlClientProvider`, define `<html lang>` | next-intl, all child pages |
| `app/[locale]/page.tsx` | Run GROQ query scoped to locale, pass `content[]` array to `PageBuilder` | Sanity via `sanityFetch`, PageBuilder |
| `components/blocks/PageBuilder.tsx` | Iterate `content[]`, switch on `_type`, render matching block component | All block components |
| `components/blocks/*.tsx` | Render a single Sanity block type; use `useTranslations` for UI strings | next-intl (UI strings), Sanity data via props |
| `sanity/lib/client.ts` | Configured Sanity client (projectId, dataset, token) | All GROQ fetch functions |
| `sanity/lib/fetch.ts` | Wrapper around client with caching tags for revalidation | Next.js cache layer |
| `sanity/schemaTypes/` | Sanity document + block schemas; source of truth for content shape | Sanity Studio, GROQ types |
| `app/api/revalidate/route.ts` | Verify Sanity webhook signature, call `revalidateTag` or `revalidatePath` | Sanity webhook, Next.js cache |
| `app/api/analyze/route.ts` | Website analysis feature stub (lead gen tool) | External services TBD |
| `app/studio/[[...tool]]/page.tsx` | Embed Sanity Studio as a Next.js route | Sanity Studio SDK |

---

## Recommended Project Structure

The user has specified this structure. Notes explain the architectural reasoning behind each placement.

```
src/
├── app/
│   ├── [locale]/               # All user-facing routes. Dynamic segment receives
│   │   │                       # validated locale from middleware (e.g. "en", "de")
│   │   ├── layout.tsx          # Sets locale for tree, wraps NextIntlClientProvider
│   │   ├── page.tsx            # Home/landing page — fetches page builder data
│   │   └── blog/
│   │       └── [slug]/
│   │           └── page.tsx    # Blog post page
│   ├── studio/
│   │   └── [[...tool]]/
│   │       └── page.tsx        # Sanity Studio (not under [locale] — no i18n needed)
│   └── api/
│       ├── revalidate/
│       │   └── route.ts        # Webhook endpoint for Sanity → Next.js cache busting
│       └── analyze/
│           └── route.ts        # Lead gen analysis tool stub
│
├── components/
│   ├── blocks/
│   │   ├── PageBuilder.tsx     # Dispatcher: content[] → block component map
│   │   ├── HeroBlock.tsx
│   │   ├── FeaturesBlock.tsx
│   │   ├── TestimonialsBlock.tsx
│   │   └── CtaBlock.tsx
│   └── ui/                     # Shared primitive components (buttons, cards, etc.)
│
├── sanity/
│   ├── config.ts               # defineConfig with projectId, dataset, plugins
│   ├── schemaTypes/
│   │   ├── index.ts            # Aggregates all schema types
│   │   ├── pageType.ts         # Page document: title, slug, content (page builder array)
│   │   ├── postType.ts         # Blog post document
│   │   └── blocks/
│   │       ├── heroBlock.ts
│   │       ├── featuresBlock.ts
│   │       ├── testimonialsBlock.ts
│   │       └── ctaBlock.ts
│   └── lib/
│       ├── client.ts           # createClient configuration
│       ├── fetch.ts            # sanityFetch with cache tags
│       └── queries.ts          # Typed GROQ queries (PAGE_QUERY, POST_QUERY, etc.)
│
├── i18n/
│   ├── routing.ts              # defineRouting — locales, defaultLocale, localePrefix
│   ├── request.ts              # getRequestConfig — locale resolution + message loading
│   ├── navigation.ts           # createNavigation helpers (Link, useRouter, redirect)
│   └── messages/
│       ├── en.json
│       ├── es.json
│       └── de.json
│
└── middleware.ts               # createMiddleware(routing) export
```

### Structure Rationale

- **`app/studio/` outside `[locale]/`:** Studio is an admin tool, not a user-facing page. It must be excluded from the i18n middleware matcher to avoid locale rewrites. Place it at `/studio` with no locale segment.
- **`app/api/` outside `[locale]/`:** API routes are locale-agnostic. The revalidate endpoint is called by Sanity (no locale), the analyze endpoint is called by frontend JS. Neither benefits from locale routing.
- **`sanity/schemaTypes/blocks/`:** Block schemas in a subdirectory keeps the flat `schemaTypes/` from becoming unwieldy as the page builder grows. Each block file exports one schema object.
- **`i18n/navigation.ts`:** next-intl's `createNavigation(routing)` generates locale-aware `Link`, `useRouter`, `redirect`, and `usePathname` that wrap Next.js primitives. Import from here, not directly from `next/navigation`.

---

## Architectural Patterns

### Pattern 1: Page Builder — Sanity Array → Switch Dispatcher

**What:** Sanity stores page content as `content: array of block objects`. Each block has a `_type` field. `PageBuilder.tsx` iterates the array and dispatches to a block component based on `_type`.

**When to use:** Any page whose layout is content-managed. The home page and marketing pages are the primary consumers.

**Trade-offs:** Simple to add new blocks (add schema type + React component + one case). The switch statement must stay in sync with the schema; TypeScript with Sanity TypeGen eliminates drift.

**Example:**
```typescript
// components/blocks/PageBuilder.tsx
import { HeroBlock } from './HeroBlock'
import { FeaturesBlock } from './FeaturesBlock'
import type { PageQueryResult } from '@/sanity/lib/types' // TypeGen output

type Props = {
  content: NonNullable<PageQueryResult>['content']
}

export function PageBuilder({ content }: Props) {
  if (!Array.isArray(content)) return null

  return (
    <>
      {content.map((block) => {
        const key = block._key
        switch (block._type) {
          case 'hero':
            return <HeroBlock key={key} {...block} />
          case 'features':
            return <FeaturesBlock key={key} {...block} />
          case 'testimonials':
            return <TestimonialsBlock key={key} {...block} />
          case 'cta':
            return <CtaBlock key={key} {...block} />
          default:
            return null // never show "block not found" in production
        }
      })}
    </>
  )
}
```

### Pattern 2: next-intl Static Rendering via setRequestLocale

**What:** Calling `setRequestLocale(locale)` at the top of every layout and page stores the locale in a React cache slot, making it available to `useTranslations` / `getTranslations` in Server Components without reading dynamic headers. This keeps pages statically renderable.

**When to use:** Every layout and page under `app/[locale]/`. Required — skipping it forces dynamic rendering.

**Trade-offs:** Must be called before any `next-intl` function. It is not required in leaf components (only in layouts/pages that receive `params`).

**Example:**
```typescript
// app/[locale]/layout.tsx
import { setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) notFound()

  setRequestLocale(locale) // must be called before any next-intl usage

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### Pattern 3: Sanity Webhook → revalidateTag Cache Invalidation

**What:** Sanity fires a webhook POST on document publish/unpublish. The `/api/revalidate` route handler verifies the signature and calls `revalidateTag` to bust the Next.js cache for affected content.

**When to use:** Whenever Sanity content changes and the site uses static rendering (the default for `sanityFetch` with cache tags).

**Trade-offs:** With `revalidateTag('page', 'max')` (stale-while-revalidate semantics introduced in Next.js 15), users see stale content briefly but get fresh content on the next request without blocking. Simpler than triggering a full rebuild.

**Example:**
```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook' // signature verification

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string }>(
      req,
      process.env.SANITY_WEBHOOK_SECRET
    )

    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
    }

    // Tag the affected document type; queries tagged with same value are busted
    revalidateTag(body._type, 'max')

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
```

### Pattern 4: Dual I18n — Sanity Content Fields vs next-intl UI Strings

**What:** Two separate translation systems coexist. Sanity stores translated *content* (body copy, headings from editors). next-intl stores translated *UI strings* (button labels, nav items, form placeholders that developers control). They must not be conflated.

**When to use:** Always in this stack.

**Trade-offs:** Requires discipline. Editors manage Sanity translations in Studio. Developers manage `messages/*.json` files. The GROQ query receives `$locale` as a parameter and uses `coalesce()` to fall back to a base language when a translation is missing.

**Example:**
```typescript
// sanity/lib/queries.ts — pass locale to GROQ
export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current == $slug && language == $locale][0]{
    _id,
    title,
    "content": pageBuilder[]{ ... }
  }
`

// app/[locale]/page.tsx — server component
const page = await sanityFetch({
  query: PAGE_QUERY,
  params: { slug: 'home', locale }, // locale from [locale] segment
  tags: ['page'],
})
```

---

## Data Flow

### Request Flow (Static Page, Cache Hit)

```
Browser GET /de/uber-uns
    ↓
middleware.ts
  - detects "de" prefix from URL
  - rewrites to internal [locale]="de" param
  - sets locale cookie
    ↓
app/[locale]/page.tsx (Server Component)
  - setRequestLocale("de")
  - sanityFetch({ query: PAGE_QUERY, params: { locale: "de", slug: "uber-uns" } })
    ↓
Next.js cache layer
  - cache tag: "page"
  - CACHE HIT → return cached HTML
    ↓
React renders PageBuilder with content[]
    ↓
Static HTML streamed to browser
```

### Request Flow (Cache Miss or Stale — Sanity Fetch)

```
sanityFetch({ query, params, tags: ['page'] })
    ↓
Sanity Content Lake API (GROQ over HTTPS)
  - returns JSON document with all localized fields
    ↓
Next.js stores response in cache tagged "page"
    ↓
PageBuilder.tsx receives content[]
  - maps _type to block components
  - each block receives its Sanity data as props
    ↓
Block component renders (e.g. HeroBlock)
  - Sanity data: props.title, props.image, props.body
  - UI strings: t('cta.label') from messages/de.json via useTranslations
```

### Cache Invalidation Flow (Content Published in Sanity)

```
Editor publishes document in Sanity Studio
    ↓
Sanity fires webhook POST to https://yourdomain.com/api/revalidate
  - headers: sanity-webhook-signature
  - body: { _type: "page", _id: "...", ... }
    ↓
app/api/revalidate/route.ts
  - parseBody() verifies HMAC signature
  - calls revalidateTag(body._type, 'max')
    ↓
Next.js marks all cached entries tagged "page" as stale
    ↓
Next request for any page route re-fetches from Sanity
  - stale-while-revalidate: current request serves stale, background refresh happens
```

### I18n Translation Flow

```
[locale] URL segment ("en", "es", "de")
    ↓
middleware.ts → [locale] dynamic param
    ↓
app/[locale]/layout.tsx
  - setRequestLocale(locale) → stored in React cache
    ↓
i18n/request.ts (getRequestConfig)
  - reads requestLocale
  - validates against routing.locales
  - loads messages/[locale].json
    ↓
useTranslations('namespace') in any Server or Client Component
  - Server: reads from React cache (static-safe, no dynamic header)
  - Client: reads from NextIntlClientProvider context
```

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Sanity Content Lake | `sanityFetch` in Server Components via GROQ | Use `next-sanity` package; tag all fetches for cache invalidation |
| Sanity Studio | Embedded at `/studio` via `NextStudio` component | Exclude `/studio` from next-intl middleware matcher |
| Sanity Webhooks | POST to `/api/revalidate`; signature via `parseBody` from `next-sanity/webhook` | Store `SANITY_WEBHOOK_SECRET` in env; never skip signature check |
| PM2 + Nginx (VPS) | `output: 'standalone'` in `next.config.ts`; PM2 runs `.next/standalone/server.js` | Copy `public/` and `.next/static/` into `.next/standalone/` after build — Next.js does NOT do this automatically |
| Lead gen / website analysis | `/api/analyze` Route Handler; returns JSON to client component | Stub for now; external scraping or Lighthouse API integrations go here |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Sanity schema ↔ React components | TypeGen-generated types in `sanity/lib/types.ts` | Run `npx sanity typegen generate` after schema changes to keep types in sync |
| Sanity fetch ↔ Next.js cache | Cache tags string (e.g. `'page'`, `'post'`) | Tag names must match exactly between `sanityFetch` and `revalidateTag` calls |
| next-intl routing ↔ middleware | `routing` object imported from `i18n/routing.ts` | Single source of truth — only define locales in one place |
| Block components ↔ PageBuilder | TypeScript props typed via `Extract<PageQueryResult['content'][number], { _type: 'hero' }>` | Prevents runtime mismatches between schema and component |
| Client Components ↔ next-intl | `NextIntlClientProvider` in layout; no message serialization needed manually | Provider automatically receives messages from server |

---

## Build Order

Build phases should follow these dependency chains. Items lower on the list depend on items above.

```
1. Sanity schema types (pageType, postType, block types)
      ↓
2. Sanity TypeGen (run after schema is stable to generate types.ts)
      ↓
3. sanity/lib/queries.ts (typed GROQ using generated types)
      ↓
4. i18n/routing.ts + i18n/request.ts + middleware.ts (i18n plumbing)
      ↓
5. app/[locale]/layout.tsx (locale shell, NextIntlClientProvider)
      ↓
6. Individual block components (HeroBlock, FeaturesBlock, etc.)
      ↓
7. PageBuilder.tsx (imports and dispatches to block components)
      ↓
8. app/[locale]/page.tsx (wires sanityFetch + PageBuilder together)
      ↓
9. app/api/revalidate/route.ts (cache invalidation, needs schema + cache tags)
      ↓
10. app/[locale]/blog/[slug]/page.tsx (blog route, simpler than page builder)
      ↓
11. app/api/analyze/route.ts (stub, no hard dependencies)
      ↓
12. app/studio/[[...tool]]/page.tsx (can be done anytime after schema is stable)
```

**Key dependency:** TypeGen (step 2) must run before writing GROQ queries (step 3) and block component props (step 6). If you write components before TypeGen exists, you will be writing `any` types that need retrofitting.

**Second key dependency:** `i18n/routing.ts` must be created before middleware.ts and before any layout/page that calls `setRequestLocale`. Everything in the `[locale]` tree depends on it.

---

## Anti-Patterns

### Anti-Pattern 1: Fetching Sanity Data in Client Components

**What people do:** Mark a component `'use client'` and call the Sanity client directly inside it with `useEffect`.

**Why it's wrong:** Exposes the Sanity API token in the browser bundle. Also bypasses the Next.js cache layer entirely, causing unnecessary refetches and blocking the cache invalidation webhook from working.

**Do this instead:** Fetch in Server Components (layouts/pages), pass data down as props. If a Client Component needs Sanity data, fetch it in a parent Server Component and serialize the result.

### Anti-Pattern 2: Skipping setRequestLocale in Layouts and Pages

**What people do:** Omit `setRequestLocale(locale)` and rely on dynamic headers for locale detection.

**Why it's wrong:** Forces the entire route to dynamic rendering, disabling static generation. Performance degrades and Next.js loses the ability to pre-render locale-specific pages at build time.

**Do this instead:** Call `setRequestLocale(locale)` as the first line of every layout and page that receives `params.locale`. Also export `generateStaticParams` from layouts to pre-render all locale variants.

### Anti-Pattern 3: Using Next.js `Link` / `useRouter` Directly (Instead of next-intl Navigation)

**What people do:** Import `Link` from `next/link` and `useRouter` from `next/navigation` throughout the app.

**Why it's wrong:** These primitives are not locale-aware. Internal links will not automatically include the locale prefix, breaking navigation between language variants.

**Do this instead:** Create `i18n/navigation.ts` using `createNavigation(routing)` and always import `Link`, `useRouter`, `redirect`, and `usePathname` from that module.

### Anti-Pattern 4: Putting Studio Under [locale]

**What people do:** Place `app/studio/` inside `app/[locale]/` for organizational consistency.

**Why it's wrong:** The next-intl middleware will attempt to match Studio routes and inject a locale prefix. Sanity Studio does not expect a locale segment in its URL. It also means Studio is only reachable at a locale-prefixed URL, which is unexpected.

**Do this instead:** Keep `app/studio/` as a sibling to `app/[locale]/`, and ensure the middleware `matcher` explicitly excludes `/studio/(.*)`.

### Anti-Pattern 5: Mismatched Cache Tags Between Fetch and Revalidate

**What people do:** Tag a fetch as `tags: ['pages']` (plural) and call `revalidateTag('page')` (singular) in the webhook handler.

**Why it's wrong:** The revalidation silently does nothing. Cache entries remain stale indefinitely after content changes. This is hard to debug because no error is thrown.

**Do this instead:** Define cache tag names as constants in a shared file (e.g. `sanity/lib/tags.ts`) and import them in both `sanityFetch` calls and the revalidate route. Never spell tag names inline as strings.

---

## Scaling Considerations

This is a landing page / lead gen site. Scaling is not a primary concern — correctness and fast initial load are. Noted for completeness.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10k monthly visitors | Current architecture is appropriate. Static pages served from PM2/Nginx cache. No changes needed. |
| 10k-500k monthly visitors | Add a CDN (Cloudflare) in front of Nginx. Cache static pages at edge. Sanity CDN API is already used by default. |
| 500k+ monthly visitors | Migrate to a managed platform (Vercel, Cloudflare Pages) for edge rendering. The standalone output can be containerized if staying on self-hosted infra. |

**First bottleneck:** The `/api/analyze` route if it does heavy external HTTP calls per request. Add request-level caching or a queue if usage grows.

**Second bottleneck:** The Sanity Content Lake API rate limits. Use `sanity.io/cdn` (the Sanity CDN) for read queries, which the `next-sanity` client does by default for non-draft requests.

---

## Sources

- [next-intl App Router setup (with-i18n-routing)](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) — HIGH confidence, official docs. `setRequestLocale`, `getRequestConfig`, `NextIntlClientProvider` patterns verified here.
- [next-intl routing configuration (localePrefix: as-needed)](https://next-intl.dev/docs/routing/configuration) — HIGH confidence, official docs. URL prefix behavior, cookie, and redirect behavior confirmed.
- [Sanity: Render page builder blocks](https://www.sanity.io/learn/course/page-building/rendering-page-builder-blocks) — HIGH confidence, official Sanity Learn course. `_type` switch pattern, `_key` as React key, TypeGen type extraction confirmed.
- [Sanity: Create page builder schema types](https://www.sanity.io/learn/course/page-building/create-page-builder-schema-types) — HIGH confidence, official Sanity Learn course. Array of block objects schema structure confirmed.
- [Sanity localization docs](https://www.sanity.io/docs/studio/localization) — HIGH confidence, official docs. Document-level vs field-level i18n approaches, GROQ coalesce pattern confirmed.
- [Next.js Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating) — HIGH confidence, official Next.js docs (last updated 2026-02-27). `revalidateTag` with `'max'` profile (stale-while-revalidate) confirmed. `cacheTag` directive for non-fetch caching confirmed.
- [Sanity Webhooks docs](https://www.sanity.io/docs/webhooks) — MEDIUM confidence (payload structure not fully detailed in fetched content; signature mechanism confirmed as HMAC similar to Stripe pattern).
- [next-intl middleware docs](https://next-intl.dev/docs/routing/middleware) — HIGH confidence, official docs. Matcher configuration for `localePrefix: 'as-needed'` confirmed.

---

*Architecture research for: Next.js 15 + Sanity v3 + next-intl multilingual landing page*
*Researched: 2026-03-15*

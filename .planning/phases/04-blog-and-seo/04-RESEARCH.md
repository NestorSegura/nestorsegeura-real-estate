# Phase 04: Blog and SEO - Research

**Researched:** 2026-03-15
**Domain:** Next.js App Router blog, Sanity portable text, Next.js Metadata API, JSON-LD structured data
**Confidence:** HIGH (Next.js APIs, Sanity APIs — all verified via official docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Blog listing layout**
- Featured + grid layout: latest post displayed hero-sized at top, remaining posts in a card grid below
- Cards show: featured image, title, excerpt, date, estimated reading time
- Featured post card includes a CTA or "read more" link

**Blog post page**
- Article + sidebar layout: article content in a centered column on the left, sticky sidebar on the right
- Sidebar contains: auto-generated table of contents (from headings), appointment booking CTA block, author info card
- Show estimated reading time in post header alongside date

**Blog content structure**
- Mixed content: tips/guides AND case studies, categorized separately
- Categories + tags: categories for content type (e.g., Tipps, Fallstudien), tags for topics (SEO, Webdesign, Conversion, etc.)
- Author field in CMS as a Sanity reference — supports multiple authors in the future
- Tone: professional expert — authoritative, data-driven

**SEO metadata**
- Per-page SEO fields in Sanity: each Page and Post document has its own title and description fields
- siteSettings provides global fallback defaults

**Structured data (JSON-LD)**
- Homepage: Person (Nestor Segura) + ProfessionalService (the agency)
- Blog posts: Article schema with headline, author, datePublished — enables rich results in Google

**OpenGraph images**
- Claude's Discretion: pick the best approach balancing effort vs social sharing impact

**Sitemap**
- Include all locale pages AND all published blog posts dynamically
- Hreflang self-references for all three locales (de, en, es)
- Priority/changefreq: Claude's Discretion

**Robots.txt**
- Disallow /studio and /api
- Allow all other paths
- /analyse page is indexed (it's a lead magnet)

### Claude's Discretion
- OpenGraph image generation approach
- Sitemap priority/changefreq values
- Typography and spacing details for blog reading experience
- Table of contents scroll behavior implementation
- Category/tag URL structure

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

This phase builds blog pages (listing + detail), applies SEO metadata across all pages, and adds sitemap/robots.txt/structured data. The stack is entirely within what's already installed: `@portabletext/react` v6.0.3 is already in `node_modules` (pulled as a dependency of `sanity`), `@sanity/image-url` v2.0.3 is installed, and `next-sanity` v11.6.12 provides `defineLive`/`sanityFetch`.

The existing `post` schema already exists with `title`, `slug`, `publishedAt`, `mainImage`, `excerpt`, `body`, `author` (string), and `seo`. However, the schema needs migration: `author` must change from a string to a Sanity reference (to a new `author` document type), and `category` + `tags` fields must be added. The existing `SITE_SETTINGS_QUERY` does not fetch SEO fields — that query needs extending.

For hreflang/sitemap: the routing uses `defaultLocale: 'de'` with `localePrefix: 'as-needed'`, so German serves at `/` (no prefix), English at `/en`, Spanish at `/es`. The `getPathname` function is already exported from `@/i18n/navigation` and handles this automatically. Sitemap hreflang alternates use `alternates.languages` in `MetadataRoute.Sitemap`.

**Primary recommendation:** Use `@portabletext/react` (already installed) for body rendering, extract headings from portable text blocks server-side for the TOC, use `pt::text()` in GROQ for reading time, use Sanity `mainImage` as OG image (URL via `@sanity/image-url`), and use Next.js file-based `sitemap.ts` / `robots.ts` with `MetadataRoute`.

---

## Standard Stack

### Core (all already installed — no new npm installs required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@portabletext/react` | 6.0.3 | Render Sanity portable text blocks as React JSX | Official Sanity library, installed via `sanity` package |
| `@sanity/image-url` | 2.0.3 | Build CDN image URLs from Sanity image references | Official Sanity library for image transformations |
| `next-sanity` | 11.6.12 | `sanityFetch` + `SanityLive` for data fetching | Already the project data-fetching entrypoint |
| `next` | 15.5.12 | `generateMetadata`, `MetadataRoute.Sitemap`, `MetadataRoute.Robots` | Built-in Next.js Metadata API |

### No new packages needed

All required libraries are already installed. The planner MUST NOT add new npm dependencies for:
- Portable text rendering (`@portabletext/react` already in `node_modules`)
- Image URL building (`@sanity/image-url` already installed)
- OG image generation (`ImageResponse` from `next/og` is built into Next.js 15)

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@portabletext/react` | `react-portable-text` | Older, less maintained — skip |
| `@sanity/image-url` for OG | `ImageResponse` + Satori | More effort; OG with Sanity mainImage is lower effort and still effective |
| Static `sitemap.xml` | `sitemap.ts` function | Dynamic is required (blog posts change) |

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── blog/
│   │   │   ├── page.tsx                 # Blog listing (featured + grid)
│   │   │   └── [slug]/
│   │   │       └── page.tsx             # Blog post detail (article + sidebar)
│   │   ├── layout.tsx                   # Add generateMetadata here (pull from Sanity)
│   │   └── page.tsx                     # Add generateMetadata + JSON-LD
│   ├── sitemap.ts                       # Dynamic sitemap with hreflang
│   └── robots.ts                        # robots.txt blocking /studio and /api
├── components/
│   ├── blog/
│   │   ├── BlogListing.tsx              # Featured + grid layout
│   │   ├── PostCard.tsx                 # Card component
│   │   ├── PortableTextRenderer.tsx     # @portabletext/react wrapper with custom components
│   │   ├── TableOfContents.tsx          # Auto-generated TOC from headings (client, sticky)
│   │   └── ReadingTime.tsx              # Display component for min read
│   └── seo/
│       └── JsonLd.tsx                   # Inject <script type="application/ld+json">
├── sanity/
│   ├── schemas/
│   │   └── documents/
│   │       ├── author.ts                # NEW: author document (name, bio, image)
│   │       └── post.ts                  # UPDATE: author→reference, add category/tags
│   └── lib/
│       └── queries.ts                   # Add/extend blog + SEO queries
└── lib/
    └── blog.ts                          # Utility functions: extractHeadings, estimateReadingTime
```

### Pattern 1: generateMetadata with Sanity data

**What:** Each locale page.tsx and blog post page.tsx exports `generateMetadata` that fetches SEO data from Sanity. The locale layout provides a title template. Individual pages fetch their own SEO object.

**When to use:** Every route segment that needs dynamic metadata from CMS.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// app/[locale]/page.tsx
import type { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { SITE_SETTINGS_SEO_QUERY } from '@/sanity/lib/queries'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const { data: settings } = await sanityFetch({ query: SITE_SETTINGS_SEO_QUERY })

  return {
    title: settings?.seo?.title ?? settings?.siteName ?? 'nestorsegura.com',
    description: settings?.seo?.description ?? settings?.tagline,
    openGraph: {
      images: settings?.ogImage ? [urlFor(settings.ogImage).width(1200).height(630).url()] : [],
    },
    alternates: {
      languages: {
        de: 'https://nestorsegura.com',
        en: 'https://nestorsegura.com/en',
        es: 'https://nestorsegura.com/es',
      },
    },
  }
}
```

### Pattern 2: Sitemap with hreflang using getPathname

**What:** `app/sitemap.ts` fetches all published posts from Sanity and uses `getPathname` from `@/i18n/navigation` to build locale-aware URLs. Accounts for `as-needed` prefix (German = no prefix).

**Key insight:** With `defaultLocale: 'de'` and `localePrefix: 'as-needed'`, German URLs have no locale prefix. So `getPathname({ locale: 'de', href: '/' })` returns `/`, not `/de/`.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
// https://next-intl.dev/docs/environments/actions-metadata-route-handlers
// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { getPathname } from '@/i18n/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { ALL_POSTS_FOR_SITEMAP_QUERY, ALL_PAGES_QUERY } from '@/sanity/lib/queries'

const BASE_URL = 'https://nestorsegura.com'
const LOCALES = ['de', 'en', 'es'] as const

function buildAlternates(href: string) {
  const languages: Record<string, string> = {}
  for (const locale of LOCALES) {
    languages[locale] = BASE_URL + getPathname({ locale, href })
  }
  return { languages }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: posts } = await sanityFetch({ query: ALL_POSTS_FOR_SITEMAP_QUERY })

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
      alternates: buildAlternates('/'),
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
      alternates: buildAlternates('/'),
    },
    // ... analyse, blog listing pages
  ]

  const postPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug.current}`,
    lastModified: post._updatedAt ? new Date(post._updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: buildAlternates(`/blog/${post.slug.current}`),
  }))

  return [...staticPages, ...postPages]
}
```

### Pattern 3: robots.ts

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/'],
    },
    sitemap: 'https://nestorsegura.com/sitemap.xml',
  }
}
```

### Pattern 4: JSON-LD structured data

**What:** Inject JSON-LD in page component `<head>` via `<script type="application/ld+json">`. Do NOT use a library — just serialize manually or with a thin wrapper.

```typescript
// Source: https://schema.org/Person, https://schema.org/ProfessionalService
// components/seo/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Usage in app/[locale]/page.tsx
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Nestor Segura',
  jobTitle: 'Web Designer',
  url: 'https://nestorsegura.com',
  sameAs: ['https://linkedin.com/in/nestorsegura'],
}

const agencySchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'nestorsegura.com',
  url: 'https://nestorsegura.com',
  founder: { '@type': 'Person', name: 'Nestor Segura' },
  areaServed: 'DE',
  description: 'Web design for German real estate agents',
}

// Article schema for blog posts:
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  author: { '@type': 'Person', name: post.author?.name ?? 'Nestor Segura' },
  datePublished: post.publishedAt,
  dateModified: post._updatedAt,
  image: post.mainImage ? urlFor(post.mainImage).width(1200).url() : undefined,
}
```

### Pattern 5: Portable text rendering with custom components

```typescript
// Source: https://github.com/portabletext/react-portabletext
// components/blog/PortableTextRenderer.tsx
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <figure className="my-8">
        <Image
          src={urlFor(value).width(800).url()}
          alt={value.alt ?? ''}
          width={800}
          height={450}
          className="rounded-lg"
        />
        {value.caption && <figcaption className="text-center text-sm text-muted-foreground mt-2">{value.caption}</figcaption>}
      </figure>
    ),
  },
  block: {
    h2: ({ children }) => <h2 className="text-2xl font-bold mt-10 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold mt-8 mb-3">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-6">{children}</blockquote>
    ),
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="underline">
        {children}
      </a>
    ),
  },
}

export function PortableTextRenderer({ value }: { value: unknown[] }) {
  return (
    <div className="prose prose-lg max-w-none">
      <PortableText value={value} components={components} />
    </div>
  )
}
```

### Pattern 6: Heading extraction for Table of Contents

**What:** Extract headings from portable text blocks server-side, pass the list to the sticky client-side TOC component.

```typescript
// Source: https://www.imadattif.com/how-to-build-a-table-of-contents-for-sanity-in-a-nextjs-website
// lib/blog.ts
import type { PortableTextBlock } from '@portabletext/react'

export type TocItem = { id: string; text: string; level: 'h2' | 'h3' }

export function extractHeadings(blocks: PortableTextBlock[]): TocItem[] {
  return blocks
    .filter((b) => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'))
    .map((b) => ({
      id: `${b.style}-${b._key}`,
      text: (b.children ?? [])
        .map((child) => (typeof child === 'string' ? child : (child as { text?: string }).text ?? ''))
        .join(''),
      level: b.style as 'h2' | 'h3',
    }))
}
```

The TOC component must be a Client Component for scroll tracking. The heading items are passed as a prop from the Server Component page.

### Pattern 7: Reading time estimation via GROQ

**What:** Use `pt::text(body)` in GROQ to compute character count, then derive reading time in minutes. Include this in ALL_POSTS_QUERY and POST_BY_SLUG_QUERY.

```groq
// Source: https://www.sanity.io/recipes/word-count-and-reading-time-estimation-for-groq-and-portable-text-7470eab7
"estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
```

**Important:** `pt::text()` only extracts top-level block text. Custom blocks (e.g., image blocks) are not counted. This is acceptable.

### Pattern 8: OpenGraph image recommendation (Claude's Discretion)

**Recommendation: Use Sanity mainImage URL as OG image.** This is the best approach for this project given:
- Zero extra effort — the image is already in Sanity
- The `@sanity/image-url` builder is already installed and configured
- No Satori/font complexity needed
- Every post already has a `mainImage` field

If `mainImage` is absent, fall back to a static `/og-default.png` in `/public`.

Do NOT use `ImageResponse` / Satori for blog posts — it adds complexity without benefit (per-post auto-generated cards are overkill for a personal agency site).

For the homepage, use a static `/og-default.png` or the `siteSettings` OG image if added to the schema.

### Anti-Patterns to Avoid

- **Fetching from `@/sanity/lib/fetch` (deprecated):** The project confirmed that `@/sanity/lib/fetch.ts` is deprecated. Always import `sanityFetch` from `@/sanity/lib/live`.
- **Using `groq` package for GROQ strings:** Use `defineQuery` from `next-sanity` (not `groq`) for TypeGen compatibility.
- **Using `??` operator in GROQ:** TypeGen parser does not support `??`. Always use `coalesce()`.
- **Client Component table of contents with server fetch:** Fetch post body in the Server Component page, extract headings server-side, pass the array as props to the `<TableOfContents>` Client Component.
- **Forgetting `id` attributes on headings in PortableText:** The `id` for TOC anchor links must match what the headings render — use `${style}-${_key}` as the format and set `id={...}` on the heading element in the custom block renderer.
- **Not calling `setRequestLocale(locale)` in blog pages:** Every new locale page must call `setRequestLocale(locale)` before any async operations.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Portable text rendering | Custom recursive renderer | `@portabletext/react` (already installed) | Handles marks, nested lists, custom types, missing components gracefully |
| Sanity CDN image URLs | String concatenation | `@sanity/image-url` builder (already installed) | Handles hotspot/crop, CDN transforms, format negotiation |
| OG image generation | Custom canvas/Satori setup | Sanity `mainImage` URL via `@sanity/image-url` | Zero complexity, already available per post |
| Sitemap generation | Custom XML builder | `MetadataRoute.Sitemap` in `app/sitemap.ts` | Built into Next.js 15, handles XML encoding |
| robots.txt generation | Static text file | `MetadataRoute.Robots` in `app/robots.ts` | Typed, version-controlled, no static file sync needed |
| JSON-LD injection | Third-party schema library | Plain object + `dangerouslySetInnerHTML` in a `<JsonLd>` component | No library needed — schema.org is just a JSON spec |
| Reading time | Custom word-count parser | `pt::text()` in GROQ | Already available in Sanity query, no client-side parsing needed |

**Key insight:** Almost everything in this phase can be done with either built-in Next.js APIs or libraries already installed. The only new code is wiring.

---

## Sanity Schema Changes Required

These are critical — the phase cannot complete without them.

### 1. New `author` document

The CONTEXT.md decision requires: "Author field in CMS as a Sanity reference — supports multiple authors in the future." Currently `author` is a `string` field in `post.ts`.

Create `src/sanity/schemas/documents/author.ts`:
```typescript
defineType({
  name: 'author',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'bio', type: 'text' }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
  ],
})
```

### 2. Update `post.ts`

- Change `author` from `type: 'string'` to `type: 'reference', to: [{ type: 'author' }]`
- Add `category` field: `type: 'string'`, options: `['tipps', 'fallstudien']`
- Add `tags` field: `type: 'array', of: [{ type: 'string' }]` (or a `tag` document if reuse is needed — string is simpler)
- Add image support in `body` portable text array: `{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string' }, { name: 'caption', type: 'string' }] }`

### 3. Register `author` document in `schemaTypes`

Add `authorType` to `src/sanity/schemas/index.ts` and also add to `documentInternationalization` `schemaTypes` list in `config.ts` if authors should be translatable (probably not — keep author as locale-neutral).

### 4. Add SEO fields to `siteSettings`

The current `siteSettings` schema has no `seo` object and no `ogImage`. Add:
```typescript
defineField({ name: 'seo', type: 'object', fields: [
  { name: 'title', type: 'string' },
  { name: 'description', type: 'text' },
  { name: 'ogImage', type: 'image', options: { hotspot: true } },
]})
```

### 5. Run TypeGen after schema changes

```bash
npx sanity schema extract
npx sanity typegen generate
```

---

## Sitemap Priority/changefreq Recommendation (Claude's Discretion)

| URL pattern | priority | changeFrequency | Rationale |
|-------------|----------|-----------------|-----------|
| Homepage (all locales) | 1.0 | monthly | Highest-value pages |
| /analyse (all locales) | 0.9 | monthly | Lead magnet, high conversion value |
| /blog (listing, all locales) | 0.8 | weekly | Updates as posts published |
| Blog posts | 0.7 | weekly | Content can be updated |

Note: Google's documentation states that `changefreq` and `priority` are hints only and are largely ignored by modern crawlers. The values matter less than having correct `lastModified` dates (use `_updatedAt` from Sanity for posts).

---

## Category/Tag URL Structure Recommendation (Claude's Discretion)

Use query params for filtering: `/de/blog?category=tipps`. Rationale:
- Simpler to implement — no new dynamic routes needed in this phase
- Filtering can be added as a future enhancement
- Blog listing page `/de/blog` works as the base URL without category routing

Do NOT build `/de/blog/category/[category]` dynamic routes in this phase — that is feature scope beyond the phase boundary.

---

## GROQ Queries Needed

### Extend SITE_SETTINGS_QUERY to include SEO
```typescript
export const SITE_SETTINGS_SEO_QUERY = defineQuery(`
  *[_type == "siteSettings"][0]{
    siteName,
    tagline,
    defaultCtaHref,
    seo{ title, description, ogImage }
  }
`)
```

### All posts for listing (with reading time)
```typescript
export const ALL_POSTS_QUERY = defineQuery(`
  *[_type == "post" && language == $language && defined(publishedAt)] | order(publishedAt desc){
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    mainImage,
    category,
    tags,
    "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180),
    "author": author->{ name, image }
  }
`)
```

### Post by slug (full detail)
```typescript
export const POST_BY_SLUG_QUERY = defineQuery(`
  coalesce(
    *[_type == "post" && slug.current == $slug && language == $language][0]{
      _id, _updatedAt, title, slug, language, publishedAt, mainImage, excerpt, body,
      category, tags,
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180),
      "author": author->{ name, bio, image },
      seo
    },
    *[_type == "post" && slug.current == $slug && language == "es"][0]{
      _id, _updatedAt, title, slug, language, publishedAt, mainImage, excerpt, body,
      category, tags,
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180),
      "author": author->{ name, bio, image },
      seo
    }
  )
`)
```

### All posts for sitemap
```typescript
export const ALL_POSTS_FOR_SITEMAP_QUERY = defineQuery(`
  *[_type == "post" && defined(publishedAt) && defined(slug.current)]{
    slug, _updatedAt, language
  }
`)
```

---

## Common Pitfalls

### Pitfall 1: Locale prefix mismatch in sitemap
**What goes wrong:** Generating `/de/blog` for the German blog listing, but the app serves German at `/blog` (no prefix because `defaultLocale: 'de'` + `as-needed`).
**Why it happens:** Assuming the default locale always has a prefix.
**How to avoid:** Use `getPathname({ locale: 'de', href: '/blog' })` which returns `/blog` (no prefix). Never hardcode locale prefixes.
**Warning signs:** German URLs in sitemap showing `/de/...` instead of `/...`.

### Pitfall 2: JSON-LD in layout vs page
**What goes wrong:** Putting JSON-LD in `[locale]/layout.tsx` causes it to appear on every page (blog listing, posts, analyse, etc.).
**Why it happens:** Confusing layout-level metadata with page-specific structured data.
**How to avoid:** Person + ProfessionalService JSON-LD goes only in `[locale]/page.tsx` (homepage). Article JSON-LD goes only in `[locale]/blog/[slug]/page.tsx`.

### Pitfall 3: TOC anchor IDs not matching heading IDs
**What goes wrong:** Clicking a TOC link doesn't scroll to the heading because the `id` attribute on the `<h2>` element doesn't match the `href` in the TOC link.
**Why it happens:** Using different ID generation strategies in the custom PortableText `block.h2` renderer and the `extractHeadings()` utility.
**How to avoid:** Use the same ID formula everywhere: `${block.style}-${block._key}` (e.g., `h2-abc123`). The custom block renderer must set `id={`h2-${props.value._key}`}`.

### Pitfall 4: `generateMetadata` and `sanityFetch` making duplicate requests
**What goes wrong:** Both `generateMetadata` and the page component call `sanityFetch` with the same query, making two identical Sanity API calls.
**Why it happens:** Not aware of Next.js request memoization.
**How to avoid:** Next.js automatically memoizes `fetch` requests within the same render. `sanityFetch` uses the Sanity client which also deduplicates. This is not actually a problem — don't over-optimize. If the same data is needed in both, call it in both.

### Pitfall 5: `author` field type mismatch after schema change
**What goes wrong:** Existing posts in Sanity have `author: "Nestor Segura"` (string), but the schema now expects a reference. GROQ query `author->{ name }` returns null for old documents.
**Why it happens:** Schema migration without data migration.
**How to avoid:** Add a migration step to the seed script. OR use `coalesce(author->name, author)` in GROQ temporarily. Seed new posts with proper references from the start.

### Pitfall 6: `pt::text()` not available in older Sanity API versions
**What goes wrong:** `pt::text()` function throws in GROQ query.
**Why it happens:** `pt::text()` requires Sanity API version 2022-03-07 or later.
**How to avoid:** The existing seed script uses `apiVersion: '2024-01-01'` which is fine. The `sanity/lib/client.ts` must also use a recent API version.

### Pitfall 7: `defineQuery` wrapper breaks GROQ with `coalesce()`
**What goes wrong:** Existing `POST_BY_SLUG_QUERY` wraps a `coalesce()` expression — this works fine. Keep this pattern.
**How to avoid:** The GROQ TypeGen parser accepts `coalesce()` as the outer expression. Do not change the existing query structure.

### Pitfall 8: Sanity Live vs static rendering conflict
**What goes wrong:** `sanityFetch` from `@/sanity/lib/live` causes blog pages to be dynamically rendered (no static pre-rendering).
**Why it happens:** `defineLive` integrates with Next.js cache and can introduce dynamic behavior.
**How to avoid:** For this project, dynamic rendering (SSR) is acceptable. The blog doesn't need static pre-rendering for the few posts that exist. Do not fight the Sanity Live system — it provides real-time preview capability which is valuable.

---

## Code Examples

### @sanity/image-url builder setup
```typescript
// Source: https://www.sanity.io/docs/presenting-images
// src/sanity/lib/image.ts (create this file)
import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './client'

const builder = createImageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
```

### Blog listing page structure
```typescript
// app/[locale]/blog/page.tsx
import { sanityFetch } from '@/sanity/lib/live'
import { ALL_POSTS_QUERY } from '@/sanity/lib/queries'

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const { data: posts } = await sanityFetch({
    query: ALL_POSTS_QUERY,
    params: { language: locale },
  })

  const [featuredPost, ...restPosts] = posts ?? []

  return (
    <main>
      {featuredPost && <FeaturedPostCard post={featuredPost} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restPosts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
    </main>
  )
}
```

### Blog post page structure (article + sidebar)
```typescript
// app/[locale]/blog/[slug]/page.tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const { data: post } = await sanityFetch({
    query: POST_BY_SLUG_QUERY,
    params: { slug, language: locale },
  })

  if (!post) notFound()

  const headings = extractHeadings(post.body ?? [])

  return (
    <article className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 max-w-5xl mx-auto px-4">
      <div>
        {/* Article content */}
        <PortableTextRenderer value={post.body ?? []} />
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
        <TableOfContents headings={headings} />
        {/* Appointment CTA — same Cal.com link as landing page */}
        <AppointmentCta href={post.calUrl ?? 'https://cal.com/nestorsegura/erstgespraech'} />
        {post.author && <AuthorCard author={post.author} />}
      </aside>
    </article>
  )
}
```

### generateStaticParams for blog posts
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
// app/[locale]/blog/[slug]/page.tsx
export async function generateStaticParams() {
  // Fetch all posts across all locales at build time
  const { data: posts } = await sanityFetch({
    query: ALL_POSTS_FOR_SITEMAP_QUERY,
  })

  return (posts ?? [])
    .filter((p) => p.slug?.current && p.language)
    .map((post) => ({
      locale: post.language,
      slug: post.slug.current,
    }))
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `sanityFetch` from `@/sanity/lib/fetch` | `sanityFetch` from `@/sanity/lib/live` | This project — previous phase | `fetch.ts` is deprecated; always use `live.ts` |
| `groq` template literal tag | `defineQuery` from `next-sanity` | next-sanity v9+ | Required for TypeGen to extract query result types |
| `getStaticPaths` (Pages Router) | `generateStaticParams` (App Router) | Next.js 13 | Different API, runs before layout/page render |
| Manual `<head>` tag management | `generateMetadata` / `metadata` object | Next.js 13.2 | Typed, auto-deduped, streamed for crawlers |
| `next/head` | Not needed in App Router | Next.js 13 | `next/head` is Pages Router only |
| `themeColor`/`viewport` in `metadata` | `generateViewport` export | Next.js 14 | Separate export for viewport-related meta |

**Deprecated/outdated:**
- `@/sanity/lib/fetch.ts` (project-level deprecation): Use `@/sanity/lib/live` instead
- `groq` tag template literal: Use `defineQuery` from `next-sanity`
- `??` in GROQ expressions: Use `coalesce()` function

---

## Open Questions

1. **OG image for siteSettings**
   - What we know: `siteSettings` has no `seo` or `ogImage` field currently
   - What's unclear: Should we add an `ogImage` field to siteSettings, or just use a static fallback `/public/og-default.png`?
   - Recommendation: Add `seo.ogImage` to siteSettings schema for maximum flexibility. Create a static `/public/og-default.png` (1200x630) as the fallback. This requires one TypeGen regeneration.

2. **Author document internationalization**
   - What we know: `documentInternationalization` plugin currently applies to `['page', 'post']`
   - What's unclear: Should `author` be translatable? Author bio could differ by language.
   - Recommendation: Keep `author` as locale-neutral (not in `schemaTypes` for documentInternationalization). Author name/bio is the same across languages. If needed later, can be added.

3. **generateStaticParams and sanityFetch live mode**
   - What we know: `sanityFetch` from `@/sanity/lib/live` is the correct entrypoint; `defineLive` integrates with Next.js cache
   - What's unclear: Whether `generateStaticParams` in blog post pages will work correctly with the live client
   - Recommendation: Use `sanityFetch` inside `generateStaticParams`. If static pre-rendering causes issues, add `export const dynamic = 'force-dynamic'` to the blog post page. The Sanity Live system is designed to work with ISR/SSR.

---

## Sources

### Primary (HIGH confidence)

- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap — sitemap.ts API, alternates.languages pattern
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots — robots.ts API
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata — generateMetadata, openGraph, alternates API
- https://nextjs.org/docs/app/api-reference/functions/image-response — ImageResponse / next/og API
- https://nextjs.org/docs/app/api-reference/functions/generate-static-params — generateStaticParams with multiple dynamic segments
- https://github.com/portabletext/react-portabletext — @portabletext/react component API and components prop
- https://www.sanity.io/docs/presenting-images — @sanity/image-url builder API

### Secondary (MEDIUM confidence)

- https://next-intl.dev/docs/environments/actions-metadata-route-handlers — getPathname for sitemap with locale-aware URLs (verified pattern matches official next-intl docs)
- https://www.sanity.io/recipes/word-count-and-reading-time-estimation-for-groq-and-portable-text-7470eab7 — pt::text() GROQ function for reading time (official Sanity recipe)
- https://www.imadattif.com/how-to-build-a-table-of-contents-for-sanity-in-a-nextjs-website — Heading extraction from portable text blocks

### Tertiary (LOW confidence)

- WebSearch results confirming next-intl sitemap patterns — not independently verified against full next-intl docs beyond official page content

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified as installed in node_modules with exact versions
- Next.js Metadata API: HIGH — fetched from official Next.js docs (v16.1.6, updated 2026-02-27)
- Sitemap hreflang with next-intl: HIGH — verified against next-intl official docs, getPathname already exported in project
- Portable text rendering: HIGH — @portabletext/react v6.0.3 confirmed installed
- Sanity schema changes: HIGH — direct code inspection of post.ts, schemas/index.ts
- Reading time via GROQ: MEDIUM — official Sanity recipe, but pt::text() API version dependency noted
- TOC implementation: MEDIUM — pattern from community source, algorithm is straightforward

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (Next.js and Sanity APIs are stable; next-intl routing config is stable)

# Phase 8: Static Blocks and Blog - Research

**Researched:** 2026-04-13
**Domain:** Astro 6 + Sanity portable text + Tailwind v4 + @astrojs/sitemap i18n
**Confidence:** HIGH (codebase read directly; library types extracted from npm; official docs fetched)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Visual fidelity:** Design screenshots as loose inspiration, not pixel-perfect spec. Port v1 React block components from git history (commit `b41bcea`): translate JSX to .astro, strip React hooks/state.
- **Color:** Jibemates purple as primary brand. Define as Tailwind v4 `@theme` tokens in `src/styles/global.css`. Exact hex values: Claude's discretion (propose in planning).
- **CTA style:** Solid filled, `rounded-lg`, dark/purple background, white text, `px-6 py-3` or `px-8 py-4`, subtle hover (darken or translate-y-px).
- **Blog index:** Featured hero (most recent or `isFeatured` flag) + responsive card grid below.
- **Pagination:** Astro static `paginate()`. URLs: `/blog`, `/blog/2`, `/blog/3` + locale equivalents.
- **Post detail:** Sticky TOC sidebar at `lg` breakpoint, auto-generated from h2/h3 in PT body.
- **Post metadata:** Author name + avatar, published date (locale-formatted), reading time, category/tags.
- **PT renderer:** `astro-portabletext` npm.
- **Inline images:** `@sanity/image-url` builder with responsive srcset.
- **Code blocks:** Shiki. Zero runtime JS — build-time highlighting.
- **Custom marks:** Callout/alert (info/warning/tip) + highlight/marker. Add to Sanity blockContent schema if absent; render as dedicated Astro components.
- **SEO resolution:** Page/post seo.* → siteSettings defaults → absolute fallback.
- **OG image:** Page/post seo.ogImage → siteSettings.seo.ogImage → /public/og-default.png.
- **JSON-LD:** Person on homepages, Article on posts, Organization site-wide, BreadcrumbList on post + /analyse pages.
- **Sitemap:** `@astrojs/sitemap` with i18n options for hreflang. Respects localized Sanity slugs.
- **robots.txt:** Allow all. Include sitemap URL reference. No /studio to block.
- **8 blocks to render:** landingHero, landingProblem, landingOffer, landingGuide, landingPlan, landingTestimonials, landingFaq, landingCtaFinal.
- **landingFaq:** Native `<details>`/`<summary>`. Zero JS.
- **v1 blocks referenced:** src/blocks/ in commit `b41bcea` (2026-03-15).

### Claude's Discretion
- Exact jibemates purple hex values — propose a primary scale (50–950) in planning
- Responsive breakpoints and grid column counts for blog listing
- Reading time formula (225 wpm for ES/EN, 200 for DE)
- Shiki theme choice
- Sanity image srcset widths
- OG image dimensions (1200×630 standard)
- Whether Person/Organization JSON-LD lives in BaseLayout or per-page
- Exact blog index page size
- Featured post: newest vs `isFeatured` boolean
- Callout copy per locale — pull from messages/*.json
- Blog author avatar: Sanity image builder vs direct URL

### Deferred Ideas (OUT OF SCOPE)
- Locale switcher UI component (Phase 9)
- /analyse form submission logic (Phase 9)
- Scroll-triggered animations (Phase 9)
- Production deploy + custom domain + Sanity webhook (Phase 10)
- Cloudflare Images pipeline
- Blog search/filter
- Comments on posts
- Dark mode
</user_constraints>

---

## Summary

Phase 8 converts six placeholder locale pages into fully rendered content pages backed by Sanity. All eight landing blocks dispatch through a `PageBuilder.astro` switcher, each rendered as a pure-HTML `.astro` component with zero client JavaScript. Blog pages use Astro's built-in `paginate()` for static pagination and `astro-portabletext` for post body rendering, with Shiki providing build-time code highlighting.

The v1 React block components (commit `b41bcea`, `src/blocks/`) already implemented the same Sanity schema shapes with working markup and OKLCH colors — they are the primary porting target. The mapping is direct: strip `useState`, `useRef`, `useRevealOnScroll`, `'use client'`, convert JSX to Astro template syntax, and replace inline `React.CSSProperties` with plain `style=""` attributes.

SEO infrastructure adds three layers: `BaseLayout.astro` extended with `<head>` meta tags and Organization JSON-LD, per-page Article/Person JSON-LD via `<script type="application/ld+json" set:html={...}>`, and `@astrojs/sitemap` wired with i18n locale mapping.

**Primary recommendation:** Port v1 React blocks first (they are the largest scope); wire `PageBuilder.astro`; build blog index + post pages; add SEO meta to `BaseLayout.astro`; configure sitemap last.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 6.1.5 (already installed) | Framework | Already in use |
| astro-portabletext | 0.13.0 | Render Sanity Portable Text in Astro | Officially recommended by Sanity; zero-JS build output |
| @sanity/image-url | 2.1.1 | Build srcset URLs from Sanity image refs | Official Sanity client helper |
| @astrojs/sitemap | 3.7.2 | Generate sitemap.xml with hreflang | Official Astro integration |
| astro:components Code | built-in | Shiki syntax highlighting | Already a transitive dep; zero runtime JS |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| reading-time | 1.5.0 | Word-count reading time estimate | Use for post metadata; or inline 5-line equivalent if avoiding dependency |
| @portabletext/toolkit | (peer dep via astro-portabletext) | `toPlainText()` helper | Extract plain text from PT for word count |

### NOT needed
- No `@astrojs/react` island for blocks — all pure `.astro`, zero JS
- No content collections — posts come from Sanity via GROQ, not local markdown

### Installation
```bash
npm install astro-portabletext @sanity/image-url @astrojs/sitemap
# reading-time is optional — can be inlined
npm install reading-time
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── blocks/
│   │   ├── PageBuilder.astro         # dispatcher switch on _type
│   │   ├── LandingHero.astro
│   │   ├── LandingProblem.astro
│   │   ├── LandingOffer.astro
│   │   ├── LandingGuide.astro
│   │   ├── LandingPlan.astro
│   │   ├── LandingTestimonials.astro
│   │   ├── LandingFaq.astro
│   │   └── LandingCtaFinal.astro
│   ├── portabletext/
│   │   ├── PTRenderer.astro          # PortableText + components map
│   │   ├── PTImage.astro             # custom type: image
│   │   ├── PTCode.astro              # custom type: code (Shiki)
│   │   ├── PTCallout.astro           # custom mark: callout
│   │   └── PTHighlight.astro         # custom mark: highlight
│   ├── blog/
│   │   ├── PostCard.astro            # card for grid
│   │   ├── FeaturedPost.astro        # hero-size card
│   │   ├── BlogTOC.astro             # sticky sidebar TOC
│   │   └── BlogPagination.astro      # prev/next links
│   └── seo/
│       └── JsonLd.astro              # <script type=application/ld+json>
├── pages/
│   ├── index.astro                   # DE homepage (replaces placeholder)
│   ├── blog/
│   │   ├── [page].astro              # DE paginated blog index (/blog, /blog/2...)
│   │   └── [slug].astro              # DE post detail
│   ├── en/
│   │   ├── index.astro
│   │   ├── blog/
│   │   │   ├── [page].astro
│   │   │   └── [slug].astro
│   ├── es/
│   │   ├── index.astro
│   │   ├── blog/
│   │   │   ├── [page].astro
│   │   │   └── [slug].astro
├── lib/
│   └── sanity.ts                     # extend with new GROQ helpers
├── styles/
│   └── global.css                    # add @theme color tokens here
public/
├── robots.txt                        # static file
└── og-default.png                    # fallback OG image (create placeholder)
```

### Pattern 1: PageBuilder.astro dispatcher
**What:** Switch on `_type` in frontmatter, render the matching block component. Skip blocks where `enabled === false`.
**When to use:** Single entry point for all block rendering in homepage pages.

```astro
---
// src/components/blocks/PageBuilder.astro
import LandingHero from './LandingHero.astro'
import LandingProblem from './LandingProblem.astro'
import LandingOffer from './LandingOffer.astro'
import LandingGuide from './LandingGuide.astro'
import LandingPlan from './LandingPlan.astro'
import LandingTestimonials from './LandingTestimonials.astro'
import LandingFaq from './LandingFaq.astro'
import LandingCtaFinal from './LandingCtaFinal.astro'
import type { Locale } from '../../i18n/utils'

interface Props {
  sections: Array<{ _type: string; _key: string; enabled?: boolean; [key: string]: unknown }>
  locale: Locale
}

const { sections, locale } = Astro.props
const enabled = sections.filter(s => s.enabled !== false)
---
{enabled.map(block => {
  switch (block._type) {
    case 'landingHero':        return <LandingHero {...block as any} locale={locale} />
    case 'landingProblem':     return <LandingProblem {...block as any} locale={locale} />
    case 'landingOffer':       return <LandingOffer {...block as any} locale={locale} />
    case 'landingGuide':       return <LandingGuide {...block as any} locale={locale} />
    case 'landingPlan':        return <LandingPlan {...block as any} locale={locale} />
    case 'landingTestimonials':return <LandingTestimonials {...block as any} locale={locale} />
    case 'landingFaq':         return <LandingFaq {...block as any} locale={locale} />
    case 'landingCtaFinal':    return <LandingCtaFinal {...block as any} locale={locale} />
    default: return null
  }
})}
```

**Note on Astro map + switch:** Astro JSX templating works; `{array.map(item => <Component />)}` is valid. The switch returns component nodes.

### Pattern 2: astro-portabletext custom components
**What:** Pass a `components` object to `<PortableText>` to override rendering for images, code blocks, and custom marks.

Custom mark component receives `Props<Mark<YourMarkDef>>` where `node.markType` is the mark name and `node.markDef` is the mark annotation object.

Custom type component receives `Props<YourTypedObject>` where `node` is the raw Sanity object (e.g., `{ _type: 'image', asset: { _ref: '...' }, alt: '...', caption: '...' }`).

```astro
---
// src/components/portabletext/PTRenderer.astro
import { PortableText } from 'astro-portabletext'
import PTImage from './PTImage.astro'
import PTCode from './PTCode.astro'
import PTCallout from './PTCallout.astro'
import PTHighlight from './PTHighlight.astro'

interface Props {
  value: unknown[]
}
const { value } = Astro.props

const components = {
  type: {
    image: PTImage,       // _type: 'image' block in body
    code: PTCode,         // _type: 'code' block (if using @sanity/code-input)
  },
  mark: {
    callout: PTCallout,   // custom mark type 'callout'
    highlight: PTHighlight, // custom mark type 'highlight'
  },
}
---
<PortableText value={value} components={components} onMissingComponent={false} />
```

```astro
---
// src/components/portabletext/PTCallout.astro
// Custom mark component — receives node with markDef
import type { Mark, Props as $ } from 'astro-portabletext/types'

type CalloutDef = { variant?: 'info' | 'warning' | 'tip' }
type Props = $<Mark<CalloutDef>>

const { node } = Astro.props
const variant = node.markDef?.variant ?? 'info'
const variantClass = {
  info: 'border-primary-400 bg-primary-50 text-primary-900',
  warning: 'border-yellow-400 bg-yellow-50 text-yellow-900',
  tip: 'border-green-400 bg-green-50 text-green-900',
}[variant]
---
<span class={`inline-block border-l-4 px-3 py-1 rounded ${variantClass}`}>
  <slot />
</span>
```

```astro
---
// src/components/portabletext/PTHighlight.astro
import type { Mark, Props as $ } from 'astro-portabletext/types'
type HighlightDef = { color?: 'yellow' | 'purple' }
type Props = $<Mark<HighlightDef>>
const { node } = Astro.props
const color = node.markDef?.color ?? 'yellow'
const cls = color === 'purple'
  ? 'bg-primary-200 text-primary-900'
  : 'bg-yellow-200 text-yellow-900'
---
<mark class={`rounded px-0.5 ${cls}`}><slot /></mark>
```

### Pattern 3: Shiki code highlighting via `<Code>` component
**What:** Astro's built-in `Code` component from `astro:components` — runs at build time, emits HTML with inline styles.

```astro
---
// src/components/portabletext/PTCode.astro
import { Code } from 'astro:components'
import type { Props as $ } from 'astro-portabletext/types'
import type { TypedObject } from 'astro-portabletext/types'

// When using @sanity/code-input the node shape is { _type:'code', language:'js', code:'...' }
// When defined inline in blockContent it may be { _type:'block', style:'code' } — handle both
interface CodeNode extends TypedObject {
  code?: string
  language?: string
}
type Props = $<CodeNode>
const { node } = Astro.props
---
<Code code={node.code ?? ''} lang={node.language ?? 'text'} theme="github-dark-dimmed" />
```

**Important:** The `<Code>` component from `astro:components` does NOT use `astro.config.mjs` `markdown.shikiConfig` — it accepts per-instance `theme` prop. The known Cloudflare issue (Astro issue #15284) with `<Code>` in MDX has been resolved in Astro core via PR #15565.

### Pattern 4: Paginated blog index with locale prefix
**What:** File `src/pages/blog/[page].astro` using rest param for both index and paginated pages.
**Critical:** First page must serve at `/blog` (no `/blog/1`) — use `[...page].astro` rest param.

```astro
---
// src/pages/blog/[...page].astro  (DE — default locale, no prefix)
import type { GetStaticPaths } from 'astro'
import { getAllPostsForLocale } from '../../lib/sanity'
import BaseLayout from '../../layouts/BaseLayout.astro'

export const getStaticPaths = (async ({ paginate }) => {
  const posts = await getAllPostsForLocale('de')
  return paginate(posts, { pageSize: 9 })
}) satisfies GetStaticPaths

const { page } = Astro.props
// page.data = posts for this page
// page.url.prev / page.url.next = navigation URLs
// page.currentPage / page.lastPage
---
```

This generates `/blog` (page 1), `/blog/2`, `/blog/3`, etc.

The same pattern repeats in `src/pages/en/blog/[...page].astro` (EN) and `src/pages/es/blog/[...page].astro` (ES).

### Pattern 5: Blog post `getStaticPaths`
```astro
---
// src/pages/blog/[slug].astro
import type { GetStaticPaths } from 'astro'
import { getAllPostSlugsForLocale, getPostWithTranslations, getSiteSettings } from '../../lib/sanity'

export const getStaticPaths = (async () => {
  const slugs = await getAllPostSlugsForLocale('de')
  return slugs.map(({ slug }) => ({ params: { slug } }))
}) satisfies GetStaticPaths

const { slug } = Astro.params
const post = await getPostWithTranslations(slug!, 'de')
// post.body = portable text array
// post.author = { name, image }
// post._translations = [{language, slug}] for locale switcher
---
```

`getAllPostSlugsForLocale` is already in `src/lib/sanity.ts`. `getPostWithTranslations` is also already there but only returns minimal fields — it needs to be extended to include `body`, `mainImage`, `excerpt`, `publishedAt`, `author->{ name, image }`, `category`, `tags`, `seo`.

### Pattern 6: @astrojs/sitemap with i18n
```javascript
// astro.config.mjs — add sitemap integration
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://realestatestrategy.eu', // REQUIRED for sitemap
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'de',
        locales: {
          de: 'de-DE',
          en: 'en-US',
          es: 'es-ES',
        },
      },
    }),
  ],
  // ... existing config
})
```

The integration auto-discovers all static pages Astro generates. It emits `<xhtml:link rel="alternate" hreflang="de-DE" href="..."/>` for every URL that has locale variants. The `site` config field is required — without it the sitemap generates relative URLs which is invalid.

**Localized blog slugs caveat:** Since Sanity slugs are per-language (different strings per locale), the sitemap will generate independent entries for each locale's blog posts rather than linked hreflang groups. This is correct behavior — the integration links by URL pattern, not by Sanity translation references. The `_translations` field already fetched by `getPostWithTranslations` can be used for the `<head>` hreflang `<link>` tags in post pages, but the sitemap hreflang just covers homepages and static paths.

### Pattern 7: JSON-LD injection
```astro
---
// src/components/seo/JsonLd.astro
interface Props {
  schema: Record<string, unknown>
}
const { schema } = Astro.props
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

Use `set:html` directive — this is the correct Astro pattern. Do NOT use string interpolation inside `<script>` tags (XSS risk).

Organization schema goes in `BaseLayout.astro` head (once per page). Person schema goes in homepage `.astro` files. Article + BreadcrumbList go in `[slug].astro` post pages.

### Pattern 8: `@sanity/image-url` builder
```typescript
// src/lib/imageUrl.ts
import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from 'sanity:client'

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: { asset: { _ref: string } } | null | undefined) {
  if (!source) return null
  return builder.image(source)
}

// Usage in .astro:
// const url = urlFor(image)?.width(1280).format('webp').url()
// For responsive images:
// srcset=`${urlFor(img)?.width(640).format('webp').url()} 640w,
//         ${urlFor(img)?.width(960).format('webp').url()} 960w,
//         ${urlFor(img)?.width(1280).format('webp').url()} 1280w`
```

Recommended srcset widths: 640w, 960w, 1280w, 1920w. For thumbnails (post cards): 400w, 800w.

### Pattern 9: TOC generation from Portable Text
```typescript
// src/lib/tocFromPT.ts — inline utility, no extra dependency
export interface TocItem {
  text: string
  id: string
  level: 2 | 3
}

export function extractToc(body: unknown[]): TocItem[] {
  if (!body) return []
  return body
    .filter((block: any) =>
      block._type === 'block' && (block.style === 'h2' || block.style === 'h3')
    )
    .map((block: any) => {
      const text = block.children?.map((s: any) => s.text ?? '').join('') ?? ''
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60)
      return { text, id, level: block.style === 'h2' ? 2 : 3 }
    })
}
```

Heading IDs in the rendered article are assigned via the `block` custom component override in PTRenderer (override `h2`/`h3` to add `id` attribute matching the slug).

### Pattern 10: Reading time
```typescript
// 5-line inline — no dependency
export function readingTime(body: unknown[], locale: 'de' | 'en' | 'es'): number {
  const wpm = locale === 'de' ? 200 : 225
  const text = body
    ?.filter((b: any) => b._type === 'block')
    .flatMap((b: any) => b.children?.map((s: any) => s.text ?? '') ?? [])
    .join(' ') ?? ''
  return Math.max(1, Math.ceil(text.split(/\s+/).length / wpm))
}
```

Alternative: `import readingTime from 'reading-time'` + `readingTime(toPlainText(body))` using `toPlainText` from `astro-portabletext`.

### Anti-Patterns to Avoid
- **`use client` in .astro files:** Not applicable. .astro files are always server-rendered. No React hooks.
- **Dynamic import of block components at runtime:** All imports must be static at the top of `PageBuilder.astro`. Astro cannot dynamically resolve component paths at render time.
- **Putting JSON-LD in a `<script>` without `set:html`:** Astro processes `<script>` tags — use `set:html={JSON.stringify(data)}` to emit raw JSON safely.
- **Using `<Code>` component in SSR mode:** `output: 'static'` is correct here. `<Code>` runs at build time and emits HTML with inline styles. Zero runtime JS.
- **String-interpolating GROQ:** Never do `\`*[language == "${locale}"]\`` — always use parameters: `{ locale }` as the second arg to `sanityClient.fetch()`.

---

## Block Schemas — Exact Field Shapes

All blocks are `type: 'object'` in Sanity (not references — they are inline in the `sections` array).

### landingHero
```typescript
{
  _type: 'landingHero',
  _key: string,
  headline: string,         // required
  subtitle?: string,        // text, rows:3
  ctaLabel?: string,
  ctaHref?: string,         // url type
  ctaSecondaryLabel?: string,
  ctaSecondaryHref?: string,
  enabled?: boolean,
}
```
V1 reference: `src/blocks/HeroSection.tsx` in commit `b41bcea`. Had `variant` field (svgPath/backgroundImage/textOnly), `colorScheme`, `spacing` — these are NOT in the landing variant schema. Strip them. The landing variant is always dark/purple, single CTA style.

### landingProblem
```typescript
{
  _type: 'landingProblem',
  _key: string,
  headline: string,
  intro?: string,           // text, rows:3
  problems?: Array<{
    _key: string,
    number?: string,        // display number e.g. "01"
    title: string,
    description?: string,
  }>,
  closing?: string,
  enabled?: boolean,
}
```
V1 reference: `ProblemSolutionBlock.tsx` used `problem.headline` and `problem.description`. Note: landing schema uses `title` not `headline` for items — double-check during implementation.

### landingOffer
```typescript
{
  _type: 'landingOffer',
  _key: string,
  headline: string,
  comparison?: Array<{
    _key: string,
    before: string,
    after: string,
  }>,
  services?: Array<{
    _key: string,
    title: string,
  }>,
  ctaLabel?: string,
  ctaHref?: string,         // url type
  enabled?: boolean,
}
```
No direct v1 equivalent — closest is `ServicesBlock` for card layout. `comparison` is a before/after table. `services` are simple title-only cards (not the full service card from v1).

### landingGuide
```typescript
{
  _type: 'landingGuide',
  _key: string,
  headline: string,
  paragraphs?: string[],    // array of string
  image?: SanityImageRef,   // { asset: { _ref } }, hotspot enabled
  testimonials?: Array<{
    _key: string,
    author: string,
    role?: string,
    quote: string,
  }>,
  enabled?: boolean,
}
```
This is the "guide/about" section. Has an author image. `paragraphs` is `string[]` — iterate with `{paragraphs.map(p => <p>{p}</p>)}`.

### landingPlan
```typescript
{
  _type: 'landingPlan',
  _key: string,
  headline: string,
  steps?: Array<{
    _key: string,
    number?: string,        // "01", "02", "03"
    title: string,
    description?: string,
  }>,
  enabled?: boolean,
}
```
V1 reference: `plan-section.png` shows step cards with alternating white/purple/dark backgrounds. The schema doesn't have a `variant` per step — the alternating treatment is a presentational decision (step 1 = white, step 2 = primary-600, step 3 = dark).

### landingTestimonials
```typescript
{
  _type: 'landingTestimonials',
  _key: string,
  headline: string,
  subtitle?: string,
  testimonials?: Array<{
    _key: string,
    name: string,
    role?: string,
    quote: string,
    image?: SanityImageRef,  // photo, hotspot enabled
  }>,
  enabled?: boolean,
}
```
Note: `image` field exists here — use `@sanity/image-url` for avatar. V1 `TestimonialsBlock` used an initial-letter avatar fallback; now real images are supported.

### landingFaq
```typescript
{
  _type: 'landingFaq',
  _key: string,
  headline: string,
  faqs?: Array<{
    _key: string,
    question: string,
    answer?: string,       // text, rows:3 — plain string (not portable text)
  }>,
  enabled?: boolean,
}
```
**Critical:** `answer` is a plain `string`, NOT portable text. Render directly as `<p>{faq.answer}</p>`. Use `<details>/<summary>` — no JS accordion. V1 used `useState` accordion — replace entirely with HTML native disclosure.

### landingCtaFinal
```typescript
{
  _type: 'landingCtaFinal',
  _key: string,
  headline: string,
  copy?: string,            // text, rows:3
  ctaLabel?: string,
  ctaHref?: string,         // url type
  scarcityText?: string,    // e.g. "Only 3 spots left this month"
  enabled?: boolean,
}
```
No V1 equivalent. Bottom-of-page CTA with optional scarcity line.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Portable Text rendering | Custom recursive block renderer | `astro-portabletext` | Handles nested marks, lists, custom types, TypeScript types |
| Shiki syntax highlighting | Call shiki directly | `<Code>` from `astro:components` | Zero config, zero runtime JS, already bundled |
| Sanity image URL generation | String-concat CDN URLs | `@sanity/image-url` builder | Handles hotspot, format, width, quality params correctly |
| Sitemap with hreflang | Custom XML template | `@astrojs/sitemap` with i18n | Auto-discovers all pages; correct xhtml:link format |
| Portable text plain text extraction | Walk blocks manually | `toPlainText()` from `astro-portabletext` | Handles all nested span types |

---

## Common Pitfalls

### Pitfall 1: `<Code>` component with `astro:components` import
**What goes wrong:** If importing `Code` in a file that Vite sees in Cloudflare Workers context, you may hit WebAssembly instantiation error (Astro issue #15284).
**Why it happens:** Shiki uses WASM internally. In dev mode with Cloudflare Vite plugin, WASM init was restricted.
**How to avoid:** This is resolved in Astro core (PR #15565). Current Astro 6.1.5 should be fine. If it surfaces, test in `astro build` + `astro preview` (which works) vs `astro dev`.
**Warning signs:** `ReferenceError: module is not defined` in dev server from `debug` package.

### Pitfall 2: First paginated page URL
**What goes wrong:** Using `[page].astro` generates `/blog/1`, `/blog/2` — there is no `/blog` URL.
**How to avoid:** Use `[...page].astro` (rest param). This generates `/blog` for page 1 and `/blog/2` for page 2. The `page.params` will be `undefined` for page 1 and `'2'` for page 2.

### Pitfall 3: sitemap `site` config missing
**What goes wrong:** `@astrojs/sitemap` generates a sitemap but URLs are relative or missing, and Google rejects it.
**How to avoid:** `site: 'https://realestatestrategy.eu'` must be set in `astro.config.mjs`. Use the production URL from Phase 10 decisions or a known value.

### Pitfall 4: siteSettings has no `language` field — it's a singleton
**What goes wrong:** `siteSettings` is defined as a singleton (`documentId: 'siteSettings'`) without a `language` field. Querying it with `language == $locale` returns null.
**How to avoid:** The GROQ helper for siteSettings must NOT filter by language: `*[_type == "siteSettings"][0]{ ... }`. Add a dedicated `getSiteSettings()` helper to `src/lib/sanity.ts`.

### Pitfall 5: `sections` field in page.ts includes BOTH old and new block types
**What goes wrong:** The `page` document `sections` array accepts both the old generic blocks (heroSection, featureStrip, etc.) and the new landing* blocks. PageBuilder needs to handle both or silently skip unknowns.
**How to avoid:** `PageBuilder.astro` dispatches only landing* types. For old generic types, return `null` (or log a warning). The `switch` default case handles this safely.

### Pitfall 6: `blockContent` schema is absent — no callout/highlight marks defined
**What goes wrong:** The `post.body` uses `type: 'block'` inline — there is no standalone `blockContent` schema object in `src/sanity/schemas/`. Callout and highlight marks are NOT yet defined.
**How to avoid:** Create `src/sanity/schemas/objects/blockContent.ts` with the `block` type definition including custom marks (callout, highlight), then reference it in `post.ts` as `type: 'blockContent'` instead of the inline `type: 'block'`. This requires a Sanity schema change + TypeGen re-run.

### Pitfall 7: `getPostWithTranslations` returns minimal fields
**What goes wrong:** The existing `getPostWithTranslations` only projects `_id, _type, language, title, slug, _translations`. Post detail pages need `body`, `mainImage`, `excerpt`, `publishedAt`, `author->`, `category`, `tags`, `seo`.
**How to avoid:** Add a new `getFullPostForLocale(slug, locale)` helper that includes all fields, or extend the existing function. Do not modify `getPostWithTranslations` to avoid breaking the locale-switcher contract.

### Pitfall 8: `siteSettings.seo.ogImage` field is nested
**What goes wrong:** The SEO fallback chain tries `siteSettings.seo.ogImage`, but the siteSettings GROQ projection must explicitly project this nested object: `seo { title, description, ogImage { asset->{ _ref } } }`.
**How to avoid:** Deep-project all nested image fields in GROQ queries.

### Pitfall 9: Zero-JS constraint for `landingFaq`
**What goes wrong:** Porting v1 `FaqBlock.tsx` directly leaves `useState` which requires a React island (ships JS).
**How to avoid:** Replace entirely with `<details>`/`<summary>`. Native browser disclosure element. Zero JS. CSS `details[open] summary::after` handles chevron rotation.

---

## Jibemates Purple Color Palette Recommendation

Based on the OKLCH values used throughout the v1 React components (extracted from git history, commit `b41bcea`) and confirmed by the `plan-section.png` screenshot which shows the brand purple as the step 2 card background:

The v1 used these OKLCH values:
- Dark hero background: `oklch(0.25 0.08 290)` — deep purple-dark
- Solid CTA/accent: `oklch(0.45 0.18 290)` — medium dark purple
- Light purple tint: `oklch(0.72 0.14 290)` — muted violet
- Light purple text on dark: `oklch(0.80 0.003 80)` — near-white warm

**Proposed `--color-primary` scale (OKLCH, hue 290 = blue-violet):**

```css
@theme {
  --color-primary-50:  oklch(0.97 0.02 290);   /* #f5f0ff — lightest lavender */
  --color-primary-100: oklch(0.93 0.05 290);   /* #ede5ff */
  --color-primary-200: oklch(0.87 0.08 290);   /* #ddd0ff */
  --color-primary-300: oklch(0.78 0.12 290);   /* #c4adff */
  --color-primary-400: oklch(0.68 0.16 290);   /* #a884ff */
  --color-primary-500: oklch(0.58 0.20 290);   /* #8c5ef5 — bright brand purple */
  --color-primary-600: oklch(0.50 0.20 290);   /* #7448d8 — CTA hover */
  --color-primary-700: oklch(0.42 0.18 290);   /* #5c36b2 — solid CTA bg (≈ oklch(0.45 0.18 290)) */
  --color-primary-800: oklch(0.33 0.14 290);   /* #3d2280 */
  --color-primary-900: oklch(0.25 0.10 290);   /* #241552 — dark section bg */
  --color-primary-950: oklch(0.17 0.07 290);   /* #140b30 — darkest */
}
```

**Usage mapping:**
- `bg-primary-700` → solid CTA backgrounds (replaces `oklch(0.45 0.18 290)`)
- `bg-primary-900` → dark hero/section backgrounds (replaces `oklch(0.25 0.08 290)`)
- `bg-primary-500` → accent highlights, active states
- `text-primary-300` → accent text on dark backgrounds
- `text-primary-700` → accent text on light backgrounds

Also add neutral scale for the brand darks:

```css
@theme {
  /* Brand neutrals (from jibemates.de actual CSS: #131313 and #EFEEEC) */
  --color-brand-dark:   #131313;
  --color-brand-cream:  #efeeec;
  --color-brand-warm-50: #f7f6f4;
  --color-brand-warm-100: #efeeec;
}
```

**Confidence:** MEDIUM — OKLCH hue 290 confirmed from v1 code; specific lightness/chroma values for full scale are proposed by Claude based on perceptual uniformity. User must approve in planning.

---

## GROQ Queries Needed (extend src/lib/sanity.ts)

```typescript
// New helpers to add:

// 1. Full post fetch for blog detail page
export async function getFullPostForLocale(slug: string, locale: Locale): Promise<FullPost | null> {
  const query = `*[_type == "post" && slug.current == $slug && language == $locale][0]{
    _id, _type, language,
    title,
    slug,
    publishedAt,
    mainImage { asset->{ _ref, _id }, alt },
    excerpt,
    body[]{
      ...,
      _type == "image" => { ..., asset->{ _ref, _id } }
    },
    author->{ name, image { asset->{ _ref, _id } } },
    category,
    tags,
    seo { title, description },
    "_translations": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
      language,
      "slug": value->slug.current
    }
  }`
  return sanityClient.fetch(query, { slug, locale })
}

// 2. All posts for blog listing (needs excerpt, image, author for cards)
export async function getAllPostsForLocale(locale: Locale): Promise<PostCard[]> {
  const query = `*[_type == "post" && language == $locale && defined(slug.current)] | order(publishedAt desc){
    _id, title,
    slug,
    publishedAt,
    mainImage { asset->{ _ref, _id }, alt },
    excerpt,
    author->{ name },
    category,
    tags
  }`
  return sanityClient.fetch(query, { locale })
}

// 3. Site settings (no language filter — singleton)
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const query = `*[_type == "siteSettings"][0]{
    siteName, tagline, defaultCtaHref,
    seo { title, description, ogImage { asset->{ _ref, _id } } },
    navigation[],
    footer { socialLinks[] }
  }`
  return sanityClient.fetch(query)
}

// 4. Homepage with deep section projection
export async function getHomepageWithSections(locale: Locale): Promise<PageWithSections | null> {
  // Same as getHomepageForLocale but sections array needs deep projection
  // for image assets inside blocks (landingGuide.image, landingTestimonials[].image)
  const query = `*[_type == "page" && slug.current == "home" && language == $locale][0]{
    _id, _type, language, title, slug,
    seo { title, description },
    sections[]{
      ...,
      _type == "landingGuide" => {
        ...,
        image { asset->{ _ref, _id } }
      },
      _type == "landingTestimonials" => {
        ...,
        testimonials[]{ ..., image { asset->{ _ref, _id } } }
      }
    }
  }`
  return sanityClient.fetch(query, { locale })
}
```

**Why deep projection matters:** Sanity image assets in nested objects return `asset: { _ref: 'image-...' }` by default. The `@sanity/image-url` builder only needs the `_ref` string — but it's cleaner to project `asset->{ _ref, _id }` to confirm the asset exists.

---

## Sanity Schema Changes Required

### 1. blockContent object (NEW FILE)
Post body currently uses inline `type: 'block'` in `post.ts`. For callout and highlight marks to work, we need a named `blockContent` schema type.

Create `src/sanity/schemas/objects/blockContent.ts`:
```typescript
import { defineArrayMember, defineType } from 'sanity'

export const blockContentType = defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Underline', value: 'underline' },
          { title: 'Strike', value: 'strike-through' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [{ name: 'href', type: 'url', title: 'URL' }],
          },
          {
            name: 'callout',
            type: 'object',
            title: 'Callout',
            fields: [
              {
                name: 'variant',
                type: 'string',
                options: { list: ['info', 'warning', 'tip'] },
              },
            ],
          },
          {
            name: 'highlight',
            type: 'object',
            title: 'Highlight',
            fields: [
              {
                name: 'color',
                type: 'string',
                options: { list: ['yellow', 'purple'] },
              },
            ],
          },
        ],
      },
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt Text' },
        { name: 'caption', type: 'string', title: 'Caption' },
      ],
    }),
    // Optional: code block type if using @sanity/code-input
    // Otherwise handle via a custom block style
  ],
})
```

Update `post.ts` body field to reference `blockContent`:
```typescript
defineField({ name: 'body', title: 'Body', type: 'blockContent' })
```

Register in `src/sanity/schemas/index.ts`.

**Note:** This schema change requires a TypeGen re-run (`npx sanity@latest typegen generate`) to update `src/sanity/types.ts` (if that file exists).

---

## robots.txt

Static file at `public/robots.txt` — no dynamic endpoint needed:

```
User-agent: *
Allow: /

Sitemap: https://realestatestrategy.eu/sitemap-index.xml
```

`@astrojs/sitemap` generates `sitemap-index.xml` (the index) and `sitemap-0.xml` (the URLs). Reference `sitemap-index.xml` in robots.txt.

---

## BaseLayout.astro Extension Plan

Current `BaseLayout.astro` only has `<title>` and optional `<meta description>`. Phase 8 must add:

1. `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`
2. `<meta property="og:type">` (website for pages, article for posts)
3. `<link rel="canonical" href="...">` 
4. `<link rel="alternate" hreflang="de" href="...">` for all three locale variants
5. Organization JSON-LD via `<JsonLd schema={orgSchema} />`
6. `<link rel="sitemap" href="/sitemap-index.xml">`

Extended Props interface:
```typescript
interface Props {
  title: string
  locale?: Locale
  description?: string
  ogImage?: string        // full URL
  canonical?: string      // full URL
  hreflangUrls?: Record<string, string>  // { de: '...', en: '...', es: '...' }
  jsonLd?: Record<string, unknown>[]     // additional per-page schemas
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React accordion for FAQ | Native `<details>`/`<summary>` | This phase | Zero JS for FAQ |
| `useRevealOnScroll` hook (IntersectionObserver) | Phase 9 decision — defer animations | Phase 9 scope | Strip all reveal logic from .astro ports |
| `sanityFetch` from `@sanity/astro/client` (v1) | `sanityClient` from `sanity:client` (v2) | Phase 6 | Already correct in sanity.ts |
| Inline block type definitions in post.ts | Named `blockContent` schema type | This phase | Required for custom marks |
| `sections: unknown[]` in SanityPage type | Typed discriminated union | This phase | TypeScript safety in PageBuilder |

---

## Open Questions

1. **`isFeatured` flag on post documents**
   - What we know: The `post` schema has no `isFeatured` boolean field currently.
   - What's unclear: Featured post = newest (sort by publishedAt desc, take first) or explicit editorial flag?
   - Recommendation: Default to newest post. If user wants editorial control, add `isFeatured: boolean` to `post.ts` — but this requires schema change + Studio content update.

2. **Sanity Studio hostname for siteSettings `site` config in sitemap**
   - What we know: Phase 10 sets production domain to `realestatestrategy.eu`.
   - What's unclear: Should sitemap `site` config use production URL now or use env var?
   - Recommendation: Use `PUBLIC_SITE_URL` env var with fallback to `'https://realestatestrategy.eu'`.

3. **`blockContent` type vs inline block in post.ts**
   - What we know: Current schema uses inline `type: 'block'` with no custom marks.
   - What's unclear: If callout/highlight marks are not yet added to Sanity, PT renderer just skips unknown marks (no error).
   - Recommendation: Add `blockContent` schema in this phase. Without it, callout/highlight won't appear in Sanity Studio editor. Adding it is a non-breaking change to Sanity (documents already published still render fine).

---

## Sources

### Primary (HIGH confidence)
- Codebase — read directly: `src/sanity/schemas/blocks/landing*.ts`, `src/sanity/schemas/documents/*.ts`, `src/lib/sanity.ts`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `src/i18n/routes.ts`
- Git history commit `b41bcea` — v1 React block components read directly: `src/blocks/*.tsx`
- npm packed `astro-portabletext@0.13.0` — type definitions read from `/tmp/package/lib/types.ts` and `/tmp/package/components/Mark.astro`
- Astro official docs (fetched): routing/pagination API, sitemap integration, Code component syntax highlighting

### Secondary (MEDIUM confidence)
- `@astrojs/sitemap` docs at docs.astro.build — i18n config shape and hreflang output format
- Tailwind v4 docs at tailwindcss.com — `@theme` color variable syntax
- Astro issue #15284 (GitHub) — Code component + Cloudflare resolved status

### Tertiary (LOW confidence)
- jibemates.de WebFetch — purple hex NOT found; color proposal derived from v1 OKLCH values in codebase

---

## Metadata

**Confidence breakdown:**
- Block schemas: HIGH — read directly from source files
- v1 component shapes: HIGH — read from git history
- astro-portabletext API: HIGH — types.ts extracted from npm pack
- @astrojs/sitemap i18n: HIGH — official docs fetched
- paginate() API: HIGH — official docs fetched
- Shiki Code component: HIGH — official docs fetched
- JSON-LD pattern: HIGH — Astro set:html directive confirmed
- Color palette (proposed): MEDIUM — derived from OKLCH values in codebase; user approval required
- Callout/highlight Sanity schema: MEDIUM — pattern is standard; not yet in codebase

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (stable ecosystem; Astro 6.x minor releases may fix known issues)

# Phase 2: CMS and Page Builder - Research

**Researched:** 2026-03-15
**Domain:** Sanity Studio v3 schemas, TypeGen, document-internationalization, live preview, PageBuilder pattern
**Confidence:** HIGH — all critical claims verified against official Sanity documentation and official guides

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Block visual style
- **Hybrid layout:** Dark/purple immersive hero section, then clean light sections for the rest of the page
- **Bold & high-contrast** overall feel — strong jibemates purple, large headings, commands attention
- **Gradient transitions** between sections (smooth color flows, not hard breaks)
- **Staggered scroll reveals** — items within a block appear one-by-one with slight delays (CSS transitions only, no heavy motion libraries)
- **Hero:** SVG path animation (start → goal journey concept) using osmo.supply component, adapted to React
- **Reference sites:** Somerstone.com.au (dark premium authority), thetandemco.com (clean minimalist spacing), allinnhomeofstudents.com (bold energy + staggered animations), mycommuters.com (SVG path animation concept)
- **Typography:** Clean sans-serif, generous whitespace in light sections, word-by-word or character-level reveals via CSS

#### Content editor experience
- **Solo editor** — power-user features fine, fewer guardrails needed
- **Live preview essential** — must see exactly how the page looks while editing blocks in Studio
- **Drag-and-drop block reordering** — full flexibility on section order within a page
- **Enabled/disabled toggle per block** — can turn blocks on/off without deleting them (useful for A/B testing or seasonal content)

#### i18n content strategy
- **Document-per-locale model** — separate Sanity documents for DE, EN, ES using document-internationalization plugin
- **Spanish (es) is the source language** — content written in Spanish first, then translated to DE and EN
- **Translation status badges** in Studio showing which locales need translation updates
- **Frontend fallback:** If a translation doesn't exist, fall back to Spanish version rather than 404

#### Block content fields
- **Content + style options** per block — text, images, links plus light/dark variant, background color, spacing size
- **Flexible item counts with limits** — min/max constraints per block type (e.g., 3-6 features) to keep design integrity
- **Hero variants selectable** — dropdown in Studio to pick hero style: SVG path animation, background image, text-only, etc.
- **CTA links: global default + per-block override** — one calendar URL in SiteSettings, any block can override with a custom link

### Claude's Discretion
- Exact min/max item limits per block type
- Loading skeleton design
- Error state handling
- Specific spacing values and typography scale
- Studio field grouping and organization
- Preview infrastructure implementation approach (Sanity's native preview vs custom)
- Exact gradient transition colors between sections

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 2 establishes the Sanity content model (three document types plus eight block schemas), wires TypeGen for type-safe GROQ queries, builds the PageBuilder dispatcher and eight block React components, and upgrades `sanityFetch` to support live updates and cache tag revalidation.

The standard Sanity pattern for this phase is well-documented and stable. Document schemas use `defineDocument` / `defineField` / `defineArrayMember`. The page builder is an `array` field on the `page` document, each array member being an `object` type with its own fields. TypeGen reads the schema and produces `sanity.types.ts` — it is configured entirely inside `sanity.cli.ts` as of the 2026-02 GA release. The `@sanity/document-internationalization` plugin (now maintained in the Sanity plugins monorepo) is on v3.x and implements document-per-locale by adding a hidden `language` field to each document and linking translations through `translation.metadata` documents.

Live preview uses the `defineLive` / `SanityLive` pattern from `next-sanity@11` (installed as `next-sanity@^11.6.12` in this project). The import path changed in v11: `defineLive` is now at `'next-sanity/live'` and `VisualEditing` at `'next-sanity/visual-editing'`. The Presentation tool (in-Studio live preview) is configured via `presentationTool` from `'sanity/presentation'`.

**Primary recommendation:** Build schemas, run TypeGen, build PageBuilder dispatcher with switch/warn pattern, upgrade sanityFetch with `defineLive`, add Presentation tool to Studio config. Keep all blocks as CSS-only for animations — use `data-*` attributes + CSS `transition` + Intersection Observer for staggered reveals.

---

## Standard Stack

### Core (already installed, versions confirmed from package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sanity | ^4.22.0 | Sanity Studio v3 runtime (Studio generation 3; npm package v4) | Installed in Phase 1; defines schemas, Studio UI |
| next-sanity | ^11.6.12 | Next.js + Sanity bridge | Provides `defineLive`, `SanityLive`, `NextStudio`, `createClient` |
| @sanity/document-internationalization | ^3.x | Document-per-locale translations in Studio | Official Sanity plugin; handles language field + translation metadata |

### To Install in Phase 2

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sanity/document-internationalization | ^3.x | Document-level i18n | Required for CMS-07 |

**Installation:**
```bash
npm install @sanity/document-internationalization
```

No additional npm packages are needed. TypeGen ships with the `sanity` CLI. The Presentation tool ships inside `sanity` (import from `'sanity/presentation'`).

### Alternatives NOT Considered (per locked decisions)

| Locked choice | Why not alternative |
|--------------|---------------------|
| document-per-locale | Field-level i18n (internationalized-array) excluded — user decided document-per-locale |
| CSS-only animations | GSAP, Framer Motion excluded — user decided CSS transitions only |
| defineLive / SanityLive | Manual cache tags only excluded — defineLive gives live preview for free |

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── sanity/
│   ├── config.ts              # defineConfig — add documentInternationalization + presentationTool
│   ├── schemas/
│   │   ├── index.ts           # schemaTypes array — import and register all schemas
│   │   ├── documents/
│   │   │   ├── page.ts        # Page document — title, slug, seo, sections (pageBuilder)
│   │   │   ├── post.ts        # Post document — title, slug, publishedAt, etc.
│   │   │   └── siteSettings.ts # SiteSettings singleton
│   │   └── blocks/
│   │       ├── heroSection.ts
│   │       ├── featureStrip.ts
│   │       ├── testimonialsBlock.ts
│   │       ├── ctaBlock.ts
│   │       ├── problemSolutionBlock.ts
│   │       ├── servicesBlock.ts
│   │       ├── faqBlock.ts
│   │       └── referencesBlock.ts
│   └── lib/
│       ├── client.ts          # createClient with useCdn: true
│       ├── fetch.ts           # REPLACED by live.ts
│       └── live.ts            # defineLive → exports sanityFetch + SanityLive
├── blocks/
│   ├── PageBuilder.tsx        # dispatcher — switch on _type, warn on unknown
│   ├── HeroSection.tsx
│   ├── FeatureStrip.tsx
│   ├── TestimonialsBlock.tsx
│   ├── CtaBlock.tsx
│   ├── ProblemSolutionBlock.tsx
│   ├── ServicesBlock.tsx
│   ├── FaqBlock.tsx
│   └── ReferencesBlock.tsx
└── types/
    └── sanity.types.ts        # Generated by TypeGen — DO NOT EDIT manually
```

### Pattern 1: Document Schema with i18n Support

Each document type that needs translation gets a hidden `language` field. The plugin reads this field to link translations.

```typescript
// Source: https://www.sanity.io/plugins/document-internationalization
// src/sanity/schemas/documents/page.ts
import { defineField, defineType } from 'sanity'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sections',
      type: 'array',
      of: [
        // defineArrayMember for each block type
      ],
    }),
  ],
})
```

### Pattern 2: Page Builder Array Schema

The page builder is a named `array` type registered as its own schema type, then referenced from `page.sections`.

```typescript
// Source: https://www.sanity.io/learn/course/page-building/create-page-builder-schema-types
// src/sanity/schemas/blocks/heroSection.ts
import { defineType, defineField } from 'sanity'

export const heroSectionType = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({ name: 'headline', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'subheadline', type: 'text' }),
    defineField({ name: 'ctaLabel', type: 'string' }),
    defineField({ name: 'ctaHref', type: 'url' }),
    defineField({
      name: 'variant',
      type: 'string',
      options: { list: ['svgPath', 'backgroundImage', 'textOnly'] },
    }),
    defineField({ name: 'backgroundImage', type: 'image', options: { hotspot: true } }),
    // Style options
    defineField({
      name: 'colorScheme',
      type: 'string',
      options: { list: ['dark', 'light'] },
      initialValue: 'dark',
    }),
    // enabled/disabled toggle
    defineField({ name: 'enabled', type: 'boolean', initialValue: true }),
  ],
})
```

All eight block schemas follow this `type: 'object'` pattern. The `enabled` toggle is a boolean field on every block — the PageBuilder dispatcher reads it and skips disabled blocks.

### Pattern 3: Singleton Document (SiteSettings)

Singletons use a combination of structure customization and action filtering to prevent creating multiple instances.

```typescript
// Source: https://www.sanity.io/guides/singleton-document
// src/sanity/config.ts additions
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])
const singletonTypes = new Set(['siteSettings'])

export default defineConfig({
  // ...
  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
  schema: {
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
})
```

The structure tool must list SiteSettings as a direct link with a fixed document ID:
```typescript
// In structureTool({ structure: (S) => ... })
S.listItem()
  .title('Site Settings')
  .id('siteSettings')
  .child(S.document().schemaType('siteSettings').documentId('siteSettings'))
```

**IMPORTANT:** Create the `siteSettings` document in Studio manually before adding its type to `singletonTypes`. Once in the set, the "Create" button disappears.

### Pattern 4: Document Internationalization Plugin Config

```typescript
// Source: https://www.sanity.io/plugins/document-internationalization
// src/sanity/config.ts
import { documentInternationalization } from '@sanity/document-internationalization'

export default defineConfig({
  plugins: [
    documentInternationalization({
      supportedLanguages: [
        { id: 'es', title: 'Spanish' },  // source language first
        { id: 'de', title: 'German' },
        { id: 'en', title: 'English' },
      ],
      schemaTypes: ['page', 'post'],
      // SiteSettings is NOT internationalized (singleton global settings)
    }),
    structureTool({ structure: (S) => /* ... */ }),
    presentationTool({ /* ... */ }),
  ],
})
```

The plugin adds a language selector UI to Studio and creates `translation.metadata` documents linking all locale variants of a document.

### Pattern 5: TypeGen Configuration

TypeGen is configured in `sanity.cli.ts` (as of the 2026-02 GA release — one config file only, no separate `sanity-typegen.json` needed):

```typescript
// Source: https://www.sanity.io/docs/apis-and-sdks/sanity-typegen
// sanity.cli.ts
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  typegen: {
    path: './src/**/*.{ts,tsx}',
    generates: './src/types/sanity.types.ts',
    overloadClientMethods: true,
  },
})
```

Run sequence:
```bash
npx sanity schema extract          # creates schema.json
npx sanity typegen generate        # creates src/types/sanity.types.ts
```

The generated file exports TypeScript interfaces for every schema type AND result types for every `groq\`...\`` tagged template literal found in the codebase.

### Pattern 6: defineLive / SanityLive Setup

The existing `src/sanity/lib/fetch.ts` stub is replaced by `src/sanity/lib/live.ts` which exports `sanityFetch` (live-aware) and `SanityLive` component.

```typescript
// Source: https://www.sanity.io/docs/developer-guides/live-content-guide
// src/sanity/lib/live.ts
import { defineLive } from 'next-sanity/live'  // CRITICAL: subpath import, not root
import { client } from '@/sanity/lib/client'

const token = process.env.SANITY_API_READ_TOKEN
if (!token) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,  // same token; browserToken only active in draft mode
})
```

`SanityLive` goes into the root layout (inside the `[locale]` layout or the root `app/layout.tsx`):
```tsx
import { SanityLive } from '@/sanity/lib/live'
// In layout body:
<SanityLive />
```

The existing `client.ts` `useCdn` should be set to `true` for default CDN reads. When calling `client.withConfig({ useCdn: false })` during `generateStaticParams`, you get fresh data for build.

### Pattern 7: CDN/non-CDN Split

```typescript
// Source: https://www.sanity.io/learn/course/controlling-cached-content-in-next-js
// src/sanity/lib/client.ts — update existing file
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,  // CDN by default (was false in Phase 1 stub)
})

// For static params during build — override to non-CDN for fresh data
export const clientWithoutCdn = client.withConfig({ useCdn: false })
```

Cache tags should be defined as constants:
```typescript
// src/sanity/lib/queries.ts (new file)
export const PAGE_QUERY_TAG = 'page'
export const POST_QUERY_TAG = 'post'
export const SITE_SETTINGS_QUERY_TAG = 'siteSettings'
```

### Pattern 8: PageBuilder Dispatcher

```typescript
// Source: https://www.sanity.io/learn/course/page-building/rendering-page-builder-blocks
// src/blocks/PageBuilder.tsx
import type { PageQueryResult } from '@/types/sanity.types'

type Sections = NonNullable<PageQueryResult>['sections']

interface PageBuilderProps {
  sections: Sections
}

export function PageBuilder({ sections }: PageBuilderProps) {
  return (
    <>
      {sections.map((block) => {
        // Skip disabled blocks
        if ('enabled' in block && block.enabled === false) return null

        switch (block._type) {
          case 'heroSection':
            return <HeroSection key={block._key} {...block} />
          case 'featureStrip':
            return <FeatureStrip key={block._key} {...block} />
          // ... all 8 block types
          default:
            console.warn(`[PageBuilder] Unknown block type: ${(block as any)._type}`)
            return null
        }
      })}
    </>
  )
}
```

The `default` case MUST log a warning (not throw), per success criterion 4.

### Pattern 9: Presentation Tool (Live Preview in Studio)

```typescript
// Source: https://www.sanity.io/docs/visual-editing/configuring-the-presentation-tool
// src/sanity/config.ts — add to plugins
import { presentationTool } from 'sanity/presentation'

presentationTool({
  previewUrl: {
    initial: process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:3000',
    previewMode: {
      enable: '/api/draft-mode/enable',
      disable: '/api/draft-mode/disable',
    },
  },
})
```

This requires two API routes:
- `src/app/api/draft-mode/enable/route.ts` — uses `defineEnableDraftMode` from `next-sanity/draft-mode`
- `src/app/api/draft-mode/disable/route.ts` — calls `draftMode().disable()` and redirects

### Pattern 10: GROQ Fallback Query for Translations

For the locale fallback requirement (fall back to Spanish if translation missing):

```typescript
// Source: https://www.sanity.io/plugins/document-internationalization
// Fetch a page: try requested locale, fall back to 'es'
export const PAGE_BY_SLUG_QUERY = groq`
  *[_type == "page" && slug.current == $slug && language == $language][0]
  ?? *[_type == "page" && slug.current == $slug && language == "es"][0]
`
```

The `??` null-coalescing operator in GROQ returns the right side if the left side is null.

### Pattern 11: CSS-Only Staggered Reveal (Intersection Observer + CSS transitions)

No JavaScript animation library. Use Intersection Observer to add a class, CSS transitions do the work:

```css
/* In globals.css or a block's CSS */
.reveal {
  opacity: 0;
  transform: translateY(1.5rem);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
/* Stagger via --delay CSS custom property set inline */
.reveal { transition-delay: var(--reveal-delay, 0ms); }
```

```tsx
// In a block component
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('is-visible', e.isIntersecting)),
    { threshold: 0.1 }
  )
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
  return () => observer.disconnect()
}, [])
```

Each item gets `style={{ '--reveal-delay': `${index * 100}ms` }}` for staggering. This is zero-dependency, zero-bundle-impact, and matches the CONTEXT.md requirement of CSS transitions only.

### Pattern 12: SVG Path Animation (Hero block only)

Use `stroke-dasharray` / `stroke-dashoffset` CSS animation triggered by scroll or on mount:

```css
.svg-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 2s ease forwards;
  animation-delay: 0.3s;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

The exact SVG path length must be measured via `path.getTotalLength()` on mount and set as a CSS custom property. For the osmo.supply adapted component, adapt the HTML/CSS version to React using a `useRef` on the SVG element.

### Anti-Patterns to Avoid

- **Using `fetch.ts` directly after Phase 2:** Replace the stub `sanityFetch` in `lib/fetch.ts` with `defineLive`. Keeping both creates duplicate fetch paths — keep only `live.ts`.
- **Defining block types inline in the page schema:** Each block type should be its own `defineType` in a separate file, imported into `schemaTypes`. Inline definitions break TypeGen inference.
- **Forgetting `_key` on array items:** Sanity generates `_key` on each array item automatically; always use `block._key` as the React `key` prop, never `block._id` (arrays don't have IDs).
- **Making SiteSettings translatable via document-internationalization:** SiteSettings is a singleton, not translated per-locale. Only `page` and `post` go into `schemaTypes` for the plugin.
- **Importing `defineLive` from `'next-sanity'` root:** Must import from `'next-sanity/live'` in v11+. Root import was removed in v11.
- **Importing `VisualEditing` from `'next-sanity'` root:** Must import from `'next-sanity/visual-editing'` in v11+.
- **Setting `useCdn: false` globally in client:** The Phase 1 stub has `useCdn: false`. Update to `true` for CDN reads; override to `false` only in `generateStaticParams`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript types for Sanity schemas | Manual interfaces | `npx sanity typegen generate` | Types derived from schema; manual types drift and break |
| Live preview infrastructure | Custom WebSocket polling | `defineLive` + `SanityLive` | Live Content API handles invalidation, draft switching, token auth |
| Singleton document enforcement | Custom Studio plugin | `singletonTypes` + `singletonActions` pattern in `defineConfig` | Official supported pattern; works with structure tool |
| Document translation linking | Manual reference fields | `@sanity/document-internationalization` | Plugin manages language field, metadata docs, Studio UI |
| Translation status badges | Custom plugin | Built into `@sanity/document-internationalization` | Plugin shows which locales need updates out of the box |
| Drag-and-drop block reordering | Custom DnD | Sanity array field built-in | `type: 'array'` fields are draggable by default in Studio |
| GROQ result typing | Manual `as` casts | `defineQuery` + TypeGen `overloadClientMethods: true` | With overloading enabled, `client.fetch(QUERY)` returns the correct type automatically |

---

## Common Pitfalls

### Pitfall 1: TypeGen Fails to Find GROQ Queries

**What goes wrong:** Running `npx sanity typegen generate` produces a `sanity.types.ts` with document types but no query result types.
**Why it happens:** TypeGen only generates types for queries assigned to a variable using the `groq` tagged template literal or `defineQuery`. Bare string queries are invisible to TypeGen.
**How to avoid:** Always write:
```typescript
import { groq } from 'next-sanity'
export const PAGE_QUERY = groq`*[_type == "page"]{...}`
// OR:
import { defineQuery } from 'next-sanity'
export const PAGE_QUERY = defineQuery(`*[_type == "page"]{...}`)
```
**Warning signs:** TypeGen output shows schema types but result types like `PageQueryResult` are absent.

### Pitfall 2: Presentation Tool Failing to Connect

**What goes wrong:** The Studio Presentation tool shows the frontend URL but edits don't highlight clickable regions, or the preview shows a blank page.
**Why it happens:** The draft mode enable endpoint is missing or the `SANITY_API_READ_TOKEN` env var is absent. The `SanityLive` component is not rendering in the layout.
**How to avoid:** Verify: (1) `SANITY_API_READ_TOKEN` exists in `.env.local`; (2) `/api/draft-mode/enable` route exists; (3) `<SanityLive />` is in the layout; (4) `SANITY_STUDIO_PREVIEW_ORIGIN` matches the frontend URL.
**Warning signs:** Presentation panel loads but shows "Connecting..." indefinitely.

### Pitfall 3: Singleton Created Multiple Times Before Lockdown

**What goes wrong:** Multiple `siteSettings` documents appear in Studio.
**Why it happens:** Adding `siteSettings` to `singletonTypes` hides the "Create" button but does not delete existing duplicates.
**How to avoid:** Create the single `siteSettings` document manually first, then add it to `singletonTypes`. If duplicates exist, delete them from Studio before locking.
**Warning signs:** The structure list shows multiple SiteSettings entries.

### Pitfall 4: Document-Internationalization Missing Language Field

**What goes wrong:** Creating a new Page document in Studio shows no language selector; translations cannot be linked.
**Why it happens:** The `language` field was not added to the schema, or the schema type was not included in the plugin's `schemaTypes` array.
**How to avoid:** Every schema listed in `documentInternationalization({ schemaTypes: [...] })` must have a `language` string field with `readOnly: true` and `hidden: true`.
**Warning signs:** No language badge appears on Page documents in Studio.

### Pitfall 5: Block Types Not Registering in TypeGen

**What goes wrong:** TypeGen generates the `Page` type but `Page.sections` is typed as `unknown[]`.
**Why it happens:** Block object types must be registered in `schemaTypes` in `src/sanity/schemas/index.ts`. Inline `of: [{ type: 'object', fields: [...] }]` anonymous objects are not tracked by TypeGen.
**How to avoid:** Define each block as a `defineType({ name: 'heroSection', type: 'object', ... })` export, register it in `schemaTypes`, and reference it with `defineArrayMember({ type: 'heroSection' })`.
**Warning signs:** TypeScript error on `block._type` saying it could be any string.

### Pitfall 6: useCdn: false in Client Breaks CDN Caching

**What goes wrong:** Every page request hits the Sanity API directly — slower responses, higher API quota usage.
**Why it happens:** The Phase 1 stub sets `useCdn: false`. This is fine for development but must be changed for production.
**How to avoid:** Change `useCdn: true` in `client.ts`. For `generateStaticParams`, call `client.withConfig({ useCdn: false }).fetch(...)`.
**Warning signs:** Vercel Edge Cache hit rates near 0%; Sanity API usage unexpectedly high.

### Pitfall 7: PageBuilder Crashes on Unknown Block Type

**What goes wrong:** Adding a new block in Studio that hasn't been registered in PageBuilder yet throws a runtime error and crashes the page.
**Why it happens:** A `switch` statement with no `default` case, or a `default` case that throws.
**How to avoid:** The `default` case MUST `console.warn` and `return null`. Never throw in the dispatcher. Success criterion 4 explicitly requires warning, not error.
**Warning signs:** Page renders blank; React error boundary catches the throw.

---

## Code Examples

### Block Schema with Style Fields and Enabled Toggle

```typescript
// Source: Sanity official page-building course + CONTEXT.md requirements
// src/sanity/schemas/blocks/featureStrip.ts
import { defineType, defineField, defineArrayMember } from 'sanity'

export const featureStripType = defineType({
  name: 'featureStrip',
  title: 'Feature Strip',
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'style', title: 'Style' },
  ],
  fields: [
    defineField({ name: 'enabled', type: 'boolean', initialValue: true }),
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'features',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'icon', type: 'string' }),
            defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'description', type: 'text' }),
          ],
        }),
      ],
      validation: (R) => R.min(3).max(6),  // Claude's discretion: 3-6 items
    }),
    // Style options
    defineField({
      name: 'colorScheme',
      type: 'string',
      group: 'style',
      options: { list: [{ title: 'Light', value: 'light' }, { title: 'Dark', value: 'dark' }] },
      initialValue: 'light',
    }),
    defineField({
      name: 'spacing',
      type: 'string',
      group: 'style',
      options: { list: ['compact', 'normal', 'spacious'] },
      initialValue: 'normal',
    }),
  ],
})
```

### GROQ Query with defineQuery for TypeGen

```typescript
// Source: https://www.sanity.io/docs/apis-and-sdks/sanity-typegen
// src/sanity/lib/queries.ts
import { defineQuery } from 'next-sanity'

export const PAGE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug && language == $language][0]
  ?? *[_type == "page" && slug.current == $slug && language == "es"][0]
  {
    _id,
    title,
    slug,
    language,
    sections[] {
      ...,
      _type,
      _key,
    }
  }
`)

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    siteName,
    tagline,
    navigation,
    footer,
    defaultCtaHref,
  }
`)
```

### Block Component with CSS Stagger Reveal

```tsx
// src/blocks/FeatureStrip.tsx — pattern for all array-based blocks
'use client'

import { useEffect, useRef } from 'react'
import type { FeatureStripBlockQueryResult } from '@/types/sanity.types'

type Props = NonNullable<FeatureStripBlockQueryResult>

export function FeatureStrip({ title, features = [], colorScheme = 'light', spacing = 'normal' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const items = containerRef.current.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-visible', e.isIntersecting)),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      data-color-scheme={colorScheme}
      data-spacing={spacing}
      className="feature-strip"
    >
      <h2>{title}</h2>
      <div ref={containerRef} className="features-grid">
        {features.map((feature, i) => (
          <div
            key={feature._key}
            className="feature-card reveal"
            style={{ '--reveal-delay': `${i * 100}ms` } as React.CSSProperties}
          >
            <span>{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

### Presentation Tool + Draft Mode API Routes

```typescript
// Source: https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router
// src/app/api/draft-mode/enable/route.ts
import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { client } from '@/sanity/lib/client'

export const { GET } = defineEnableDraftMode({ client })
```

```typescript
// src/app/api/draft-mode/disable/route.ts
import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const draft = await draftMode()
  draft.disable()
  return NextResponse.redirect(new URL('/', request.url))
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import { defineLive } from 'next-sanity'` | `import { defineLive } from 'next-sanity/live'` | next-sanity v11 | Breaking change — must use subpath import |
| `import { VisualEditing } from 'next-sanity'` | `import { VisualEditing } from 'next-sanity/visual-editing'` | next-sanity v11 | Breaking change — must use subpath import |
| `sanity-typegen.json` config file | TypeGen config inside `sanity.cli.ts` only | 2026-02 GA | Simpler — one config file; old `sanity-typegen.json` still works but is redundant |
| `@sanity/document-internationalization` standalone repo | Maintained in `sanity-io/plugins` monorepo | Feb 12, 2026 | Repo archived; install still from npm as before; same API |
| `__experimental_actions` on schema type | `document.actions` filter in `defineConfig` | Studio v3 | `__experimental_actions` is removed in v3; use config-level actions |
| Separate `useCdn: false` client export | `client.withConfig({ useCdn: false })` per-call | Current | No need for two client instances; `withConfig` is chainable |

**Deprecated/outdated:**
- `@sanity/preview-kit`: Superseded by `defineLive` / `SanityLive` from `next-sanity@11+`. Do not install.
- `next-sanity/preview`: Old preview pattern. Replaced by Presentation tool + draft mode endpoints.
- `sanity-plugin-internationalized-array`: This is for field-level i18n, not document-level. Do NOT use — the user chose document-per-locale.

---

## Eight Block Types Summary

From REQUIREMENTS.md:

| Block | Schema Name | Key Fields | Item Limits |
|-------|-------------|------------|-------------|
| BLCK-01 | heroSection | headline, subheadline, ctaLabel, ctaHref, backgroundImage, variant (svgPath/backgroundImage/textOnly) | N/A |
| BLCK-02 | featureStrip | title, features[]{icon, title, description} | 3–6 (Claude's discretion) |
| BLCK-03 | testimonialsBlock | title, testimonials[]{quote, author, role, avatar} | 2–6 (Claude's discretion) |
| BLCK-04 | ctaBlock | headline, subtext, ctaLabel, ctaHref, variant (primary/secondary) | N/A |
| BLCK-05 | problemSolutionBlock | title, problems[]{number, headline, description} | 3–5 (Claude's discretion) |
| BLCK-06 | servicesBlock | title, services[]{number, name, description, features[], ctaLabel, ctaHref} | 2–4 (Claude's discretion) |
| BLCK-07 | faqBlock | title, faqs[]{question, answer} | 4–10 (Claude's discretion) |
| BLCK-08 | referencesBlock | title, references[]{name, description, image, url} | 3–8 (Claude's discretion) |

All blocks also get: `enabled: boolean`, `colorScheme: 'light'|'dark'`, `spacing: 'compact'|'normal'|'spacious'`.

BLCK-09 = `PageBuilder.tsx` dispatcher component.
BLCK-10 = No heavy motion libraries (enforced by CSS-only animations).

---

## Open Questions

1. **osmo.supply SVG component adaptation**
   - What we know: User has membership access; the component is HTML/Webflow-based
   - What's unclear: Exact component structure from osmo.supply — cannot pre-verify without accessing the membership
   - Recommendation: The planner should create a task to inspect the osmo.supply hero component, identify the SVG structure and animation CSS, then adapt to a React component with `useRef` for path length measurement. The `stroke-dasharray/dashoffset` pattern is well-understood and implementation-ready.

2. **`defineLive` compatibility with next-sanity@^11.6.12 and sanity@^4.22.0**
   - What we know: The `defineLive` API is documented for next-sanity v11+; the project has `next-sanity@^11.6.12` installed
   - What's unclear: Whether `defineLive` in `next-sanity@11` requires `sanity@^5` or also supports `sanity@^4`
   - Recommendation: The Phase 1 decision locked `sanity@^4` and `next-sanity@^11` specifically because `next-sanity@12` requires Next.js 16. Verify `defineLive` works with this combination during plan execution. If it doesn't, the CDN-split `sanityFetch` helper (Pattern 7 without `defineLive`) is the fallback — live preview would be limited to manual page refresh.

3. **Gradient transition implementation between sections**
   - What we know: CSS gradients between dark hero and light sections; colors are Claude's discretion
   - What's unclear: Whether this is a wrapper/overlay on the sections or a dedicated `<GradientDivider />` component
   - Recommendation: Use a `<GradientDivider />` SVG or CSS pseudo-element component rendered by PageBuilder between consecutive blocks where `colorScheme` transitions. This keeps block components color-unaware.

---

## Sources

### Primary (HIGH confidence)
- https://www.sanity.io/docs/apis-and-sdks/sanity-typegen — TypeGen configuration, CLI commands, watch mode
- https://www.sanity.io/docs/developer-guides/live-content-guide — `defineLive`, `SanityLive`, token requirements
- https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router — Presentation tool + draft mode API routes
- https://www.sanity.io/docs/visual-editing/configuring-the-presentation-tool — `presentationTool` plugin config
- https://www.sanity.io/guides/singleton-document — `singletonTypes`, `singletonActions`, structure pattern
- https://www.sanity.io/plugins/document-internationalization — `@sanity/document-internationalization` plugin overview and GROQ patterns
- https://www.sanity.io/docs/changelog/2dd87093-666a-432f-b561-16cb3cff7751 — next-sanity v11 subpath import breaking changes
- https://www.sanity.io/learn/course/page-building/create-page-builder-schema-types — block object schema pattern
- https://www.sanity.io/learn/course/page-building/rendering-page-builder-blocks — PageBuilder dispatcher pattern
- https://www.sanity.io/learn/course/controlling-cached-content-in-next-js/combining-sanity-cdn-with-the-next-js-cache — CDN split and `useCdn` strategy

### Secondary (MEDIUM confidence)
- https://css-tricks.com/svg-line-animation-works/ — `stroke-dasharray/dashoffset` SVG animation technique (verified against multiple CSS specs)
- WebSearch: document-internationalization v6 archived Feb 12 2026 — confirmed by GitHub redirect to plugins monorepo

### Tertiary (LOW confidence)
- WebSearch: Tailwind CSS View Timeline API for scroll animations — not used (user chose Intersection Observer + CSS transitions)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all library versions confirmed from installed `package.json`; all APIs verified via official Sanity docs
- Architecture patterns: HIGH — Sanity page-builder course + official schema and TypeGen docs
- TypeGen: HIGH — official docs confirmed 2026-02 GA with single `sanity.cli.ts` config
- document-internationalization: MEDIUM — plugin moved to monorepo Feb 2026; core API (v3.x) confirmed via official plugin page and WebSearch; exact v3 changelog not verified
- defineLive + sanity@4 compatibility: LOW — combination not explicitly verified in official docs; flagged as open question
- Pitfalls: HIGH — derived from official documentation patterns and confirmed anti-patterns

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (Sanity ecosystem moves fast; verify defineLive/sanity@4 compatibility before plan execution)

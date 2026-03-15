# Phase 1: Foundation - Research

**Researched:** 2026-03-15
**Domain:** Next.js 15 + next-intl v4 + Sanity Studio + shadcn/ui + Tailwind v4 skeleton
**Confidence:** HIGH — all major claims verified against official documentation and prior project research

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Theme & color tokens
- Light + dark mode, both supported from the start
- Default color mode follows system preference (OS setting)
- Primary accent: purple extracted from jibemates.de during research
- Light mode: off-white #EFEEEC backgrounds, dark #131313 text
- Dark mode: near-black #131313 backgrounds, light text
- shadcn/ui theme configured with CSS custom properties for both modes

#### Directory layout
- By layer (standard Next.js convention): src/components/, src/lib/, src/sanity/, src/types/
- Block components (hero, features, FAQ, etc.) in top-level src/blocks/ — first-class concept separate from reusable UI components
- Component file naming: kebab-case (hero-block.tsx, feature-card.tsx) — matches shadcn/ui convention

#### Translation file scope
- Full structure with placeholder text in Phase 1 — all section keys present (hero, nav, features, FAQ, etc.)
- Nested by section: `{ "hero": { "title": "..." }, "nav": { "home": "..." } }`
- German (de.json) is the source language — en/es are translations from German, matching the primary market focus

### Claude's Discretion
- Sanity schema location (src/sanity/schemas/ vs project root) — pick standard approach for embedded Studio
- CMS vs i18n separation of concerns — pick cleanest boundary for what lives in JSON files vs Sanity
- Exact purple shade extraction methodology
- Dark mode text color and secondary palette values

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 1 builds the skeleton that every subsequent phase builds on: a working Next.js 15 App Router project with TypeScript strict mode, Tailwind v4, shadcn/ui, next-intl v4 routing for three locales (de default, en, es), Sanity Studio embedded at `/studio`, and a documented env template.

The standard approach for this exact stack is well-established and fully verified. next-intl v4 changed its file-naming convention (`middleware.ts` stays for Next.js 15; `proxy.ts` is the Next.js 16 name) and its type augmentation API. The critical integration concern is ensuring the middleware matcher explicitly excludes `/studio` and `/api` — this is the highest-risk point of the phase.

The prior project research (`.planning/research/`) covers stack versions, pitfalls, and architecture patterns in depth. This document distills that material to what Phase 1 specifically needs: scaffold commands, i18n configuration, Sanity Studio embedding, and color token setup.

**Primary recommendation:** Scaffold with `create-next-app@15`, configure next-intl v4 middleware exclusions before any other work, embed Sanity Studio with the `[[...tool]]` catch-all pattern, then wire shadcn/ui theming with OKLCH CSS custom properties for dark/light mode.

---

## Standard Stack

### Core (Phase 1 scope)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^15.2.x | Framework + App Router | Pinned to 15.x; v16 just shipped and is not validated |
| react | ^19.x | UI runtime | Required by Next.js 15+ |
| typescript | ^5.x | Type safety | next-intl v4 requires TypeScript 5 minimum |
| tailwindcss | ^4.2.x | Styling | v4 is CSS-native, no tailwind.config.js needed |
| @tailwindcss/postcss | ^4.2.x | PostCSS integration | Required for Tailwind v4 in Next.js; replaces old postcss config |
| shadcn/ui | CLI (no npm package) | UI components copied into project | Accessible, Tailwind-first, no runtime bundle |
| next-themes | latest | System-preference dark mode | shadcn/ui official recommendation for Next.js dark mode |
| next-intl | ^4.8.3 | i18n routing + translations | ESM-only; full App Router + Server Component support |
| sanity | ^5.16.0 | Sanity Studio v3 (generation 3; npm package is v5) | Current generation |
| next-sanity | ^12.x | Next.js + Sanity bridge | Provides NextStudio component for embedded Studio |
| tw-animate-css | ^1.x | CSS animations | Replaces deprecated tailwindcss-animate for Tailwind v4 |

**CRITICAL version note:** The npm package `sanity` is at v5.x. The product is called "Sanity Studio v3 (third generation)." Do NOT install `sanity@3`.

**Next.js version note:** npm `next` latest is 16.1.6 as of 2026-03-15. Use `create-next-app@15` explicitly. v16 renamed `middleware.ts` to `proxy.ts`; stay on v15 until v16 migrations are validated.

### Alternatives NOT to use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| tailwindcss-animate | Removed in Tailwind v4; causes build errors | tw-animate-css |
| tailwind.config.js | Tailwind v4 removed JS config; all via CSS @theme | @theme in globals.css |
| framer-motion (package name) | Rebranded; the `motion` package is current | motion@^12 (Phase 2+, not Phase 1) |
| next-i18next | Pages Router only | next-intl |
| `sanity@3` | Wrong version; current npm is `sanity@5` | sanity@^5 |

### Installation

```bash
# 1. Scaffold Next.js 15 with src/ directory
npx create-next-app@15 . \
  --typescript --tailwind --eslint --app --src-dir

# 2. Add i18n
npm install next-intl@^4

# 3. Add Sanity + next-sanity
npm install sanity@^5 next-sanity@^12

# 4. Add dark mode provider
npm install next-themes

# 5. Add shadcn/ui (after Tailwind is configured)
npx shadcn@latest init
# Select: TypeScript, App Router, Tailwind v4, src/ directory
# Installs: tw-animate-css, clsx, tailwind-merge, lucide-react

# 6. Add individual shadcn components needed in Phase 1
npx shadcn@latest add button
```

---

## Architecture Patterns

### Recommended Project Structure

This is the full project structure. Phase 1 creates the skeleton files; later phases populate them.

```
src/
├── app/
│   ├── [locale]/                 # All user-facing localized routes
│   │   ├── layout.tsx            # Calls setRequestLocale, wraps NextIntlClientProvider
│   │   └── page.tsx              # Home page — placeholder in Phase 1
│   ├── studio/
│   │   └── [[...tool]]/
│   │       └── page.tsx          # Embedded Sanity Studio (NOT under [locale])
│   └── api/                      # API routes (NOT under [locale])
│       └── revalidate/
│           └── route.ts          # Sanity webhook handler stub
│
├── blocks/                       # First-class page section components (user decision)
│   └── hero-block.tsx            # Placeholder in Phase 1
│
├── components/
│   └── ui/                       # shadcn/ui generated components
│       └── button.tsx
│
├── lib/                          # Shared utilities
│   └── utils.ts                  # clsx + tailwind-merge (created by shadcn init)
│
├── sanity/                       # Sanity Studio config and schemas
│   ├── config.ts                 # defineConfig (projectId, dataset, plugins, schemaTypes)
│   ├── lib/
│   │   ├── client.ts             # createClient configuration
│   │   └── fetch.ts              # sanityFetch wrapper (Phase 2 scope; stub in Phase 1)
│   └── schemas/                  # Schema types location (Claude's discretion: src/sanity/schemas/)
│       └── index.ts              # Aggregates schema types
│
├── types/                        # Shared TypeScript types
│   └── index.ts
│
└── i18n/
    ├── routing.ts                # defineRouting — single source of truth for locales
    ├── request.ts                # getRequestConfig — locale validation + message loading
    ├── navigation.ts             # createNavigation helpers (locale-aware Link, useRouter)
    └── messages/                 # Translation files (inside src/i18n/, not project root)
        ├── de.json               # Source language (German — primary market)
        ├── en.json
        └── es.json

middleware.ts                     # At src/middleware.ts — next-intl middleware (NOT proxy.ts for Next.js 15)
```

**Key structural decisions (Claude's discretion applied):**
- `src/sanity/schemas/` (not project root) — keeps Sanity code collocated with the app; cleaner for embedded Studio
- `src/i18n/messages/` (not project root `messages/`) — keeps i18n files within src/ consistent with the directory layout decision
- CMS/i18n boundary: JSON files (`de.json`, `en.json`, `es.json`) hold UI strings (nav labels, button text, form labels); Sanity holds content copy (headings, body text that editors manage)

### Pattern 1: next-intl Routing Configuration

**What:** Single source of truth in `src/i18n/routing.ts`. Middleware and navigation helpers both import from this file.

**Source:** [next-intl official docs](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) — HIGH confidence

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['de', 'en', 'es'],
  defaultLocale: 'de',          // German is default (primary market)
  localePrefix: 'as-needed',    // /about = de, /en/about = en, /es/about = es
})
```

### Pattern 2: Middleware with /studio and /api Exclusions

**What:** The middleware matcher must exclude `/studio` and `/api` before any other work. This is the highest-risk integration point.

**Source:** [next-intl middleware docs](https://next-intl.dev/docs/routing/middleware) — HIGH confidence; [pitfalls research](../../research/PITFALLS.md) — HIGH confidence

```typescript
// src/middleware.ts  (NOT proxy.ts — that's Next.js 16)
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Exclude: api, studio, _next internals, _vercel internals, static files (has dot)
  matcher: '/((?!api|studio|_next|_vercel|.*\\..*).*)',
}
```

**Verification step:** Hit `/studio` in the browser immediately after configuring middleware. If it shows Sanity Studio (or a Sanity login prompt), the exclusion works. If it redirects to `/de/studio`, the matcher is wrong.

### Pattern 3: Locale Layout with setRequestLocale

**What:** Required in every layout and page that receives `params.locale`. Enables static rendering.

**Source:** [next-intl App Router setup docs](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) — HIGH confidence

```typescript
// src/app/[locale]/layout.tsx
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
  const { locale } = await params  // params is async in Next.js 15

  if (!routing.locales.includes(locale as any)) notFound()

  setRequestLocale(locale)  // must be FIRST before any next-intl API

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### Pattern 4: next-intl v4 Type Augmentation

**What:** v4 changed type augmentation. The old global `IntlMessages` augmentation no longer works.

**Source:** [next-intl v4 migration guide](https://next-intl.dev/blog/next-intl-4-0) — HIGH confidence

```typescript
// src/types/index.ts  (or a dedicated i18n.d.ts)
import en from '@/i18n/messages/en.json'

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof en    // Uses en.json as the type reference
    Locale: 'de' | 'en' | 'es'
  }
}
```

### Pattern 5: Sanity Studio Embedded Route

**What:** Catch-all optional route that hands all `/studio/**` paths to the Sanity Studio component.

**Source:** [next-sanity GitHub](https://github.com/sanity-io/next-sanity) and community verified patterns — HIGH confidence

```typescript
// src/app/studio/[[...tool]]/page.tsx
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity/config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

```typescript
// src/sanity/config.ts
import { defineConfig } from 'sanity'
import { structuredData } from '@sanity/assist'

export default defineConfig({
  name: 'nestorsegura-real-estate',
  title: 'Nestor Segura Real Estate',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: '/studio',
  plugins: [],
  schema: {
    types: [],  // schemas added in Phase 2
  },
})
```

### Pattern 6: shadcn/ui Dark Mode with System Preference

**What:** `next-themes` with `defaultTheme="system"` and `enableSystem`. CSS custom properties in `globals.css` define both light and dark palettes using OKLCH.

**Source:** [shadcn/ui dark mode docs](https://ui.shadcn.com/docs/dark-mode/next) — HIGH confidence

```typescript
// src/components/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

In `src/app/[locale]/layout.tsx`, wrap children with:
```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  <NextIntlClientProvider>
    {children}
  </NextIntlClientProvider>
</ThemeProvider>
```

`suppressHydrationWarning` on `<html>` prevents hydration mismatch from dark mode detection script.

### Pattern 7: Translation File Structure

**What:** Nested JSON keyed by section. de.json is the source; en/es are translations. All three files must have identical key structure.

**Source:** [next-intl translations docs](https://next-intl.dev/docs/usage/translations) — HIGH confidence

```json
// src/i18n/messages/de.json  (source language)
{
  "nav": {
    "home": "Startseite",
    "services": "Leistungen",
    "about": "Über uns",
    "contact": "Kontakt",
    "blog": "Blog"
  },
  "hero": {
    "title": "Ihr digitaler Auftritt für Immobilienmakler",
    "subtitle": "Professionelle Websites für den deutschen Immobilienmarkt",
    "cta": "Jetzt Beratung anfragen"
  },
  "features": {
    "title": "Unsere Leistungen",
    "item1": { "title": "", "description": "" },
    "item2": { "title": "", "description": "" },
    "item3": { "title": "", "description": "" }
  },
  "faq": {
    "title": "Häufige Fragen",
    "item1": { "question": "", "answer": "" }
  },
  "contact": {
    "title": "Kontakt aufnehmen",
    "name": "Name",
    "email": "E-Mail",
    "message": "Nachricht",
    "submit": "Absenden"
  },
  "footer": {
    "rights": "Alle Rechte vorbehalten",
    "privacy": "Datenschutz",
    "imprint": "Impressum"
  }
}
```

### Pattern 8: CSS Custom Properties for Brand Colors (Tailwind v4)

**What:** Tailwind v4 uses CSS-first configuration. All design tokens live in `globals.css` using `:root` and `.dark` selectors with OKLCH values. The `@theme inline` directive makes them available as Tailwind utility classes.

**Source:** [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) and [theming docs](https://ui.shadcn.com/docs/theming) — HIGH confidence

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  /* Brand colors */
  --background: oklch(0.97 0.003 80);      /* #EFEEEC off-white */
  --foreground: oklch(0.12 0 0);           /* #131313 near-black */

  /* Purple accent — see Open Questions for exact value */
  --primary: oklch(0.45 0.18 290);         /* Jibemates purple (approximate) */
  --primary-foreground: oklch(0.97 0.003 80);

  --secondary: oklch(0.94 0.005 80);
  --secondary-foreground: oklch(0.12 0 0);

  --muted: oklch(0.91 0.005 80);
  --muted-foreground: oklch(0.45 0.01 0);

  --accent: oklch(0.45 0.18 290);
  --accent-foreground: oklch(0.97 0.003 80);

  --border: oklch(0.85 0.005 80);
  --input: oklch(0.85 0.005 80);
  --ring: oklch(0.45 0.18 290);

  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.12 0 0);           /* #131313 near-black */
  --foreground: oklch(0.95 0.003 80);      /* near-white */

  --primary: oklch(0.72 0.14 290);         /* Lighter purple for dark mode */
  --primary-foreground: oklch(0.12 0 0);

  --secondary: oklch(0.18 0.005 0);
  --secondary-foreground: oklch(0.95 0.003 80);

  --muted: oklch(0.20 0.005 0);
  --muted-foreground: oklch(0.60 0.01 0);

  --accent: oklch(0.72 0.14 290);
  --accent-foreground: oklch(0.12 0 0);

  --border: oklch(0.25 0.005 0);
  --input: oklch(0.25 0.005 0);
  --ring: oklch(0.72 0.14 290);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius: var(--radius);
}
```

**Note on the purple value:** The jibemates.de website uses the purple brand color in an AVIF image asset; the exact CSS hex/OKLCH value is not exposed in the page's CSS. The OKLCH values above (`oklch(0.45 0.18 290)`) are a starting approximation for the #7B5EA7-range purple common to similar brand identities. The exact value should be extracted from the jibemates.de logo/brand image using a color picker before finalization. See Open Questions.

### Pattern 9: Navigation Helpers (locale-aware)

**What:** Import `Link`, `useRouter`, `redirect`, `usePathname` from `src/i18n/navigation.ts` — NEVER from `next/navigation` or `next/link` directly in app code.

**Source:** [next-intl navigation docs](https://next-intl.dev/docs/routing/navigation) — HIGH confidence

```typescript
// src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
```

### Anti-Patterns to Avoid

- **Import from `next/link` or `next/navigation` directly:** Breaks locale-awareness. Always use `@/i18n/navigation`.
- **Place `app/studio/` inside `app/[locale]/`:** Middleware will prefix Studio URLs with locale. Studio breaks silently.
- **Skip `setRequestLocale(locale)` in layouts:** Forces dynamic rendering on every page. Performance degrades.
- **Access `params.slug` without awaiting:** Next.js 15 made params async. TypeScript strict mode will catch this, but only if `params` is typed as `Promise<{...}>`.
- **Use `tailwindcss-animate` plugin:** Does not work with Tailwind v4. Use `tw-animate-css`.
- **Define colors in `tailwind.config.js`:** File is not generated or read in Tailwind v4. All config lives in `globals.css` via `@theme`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| i18n routing | Custom middleware locale detection | next-intl `createMiddleware` | Cookie handling, redirect logic, accept-language negotiation are all handled |
| Locale-aware navigation | Custom locale-prefixing in href strings | next-intl `createNavigation` | Handles all prefix modes; locale switching to current path |
| Dark mode toggle | Manual localStorage + class manipulation | `next-themes` ThemeProvider | Handles SSR/hydration flash, system preference detection, localStorage persistence |
| UI components | Custom button/input/dialog components | shadcn/ui `npx shadcn add` | Accessible ARIA patterns; Tailwind v4 compatible; Radix UI primitives |
| CSS color variable mapping | Manual Tailwind config extension | `@theme inline` in globals.css | Tailwind v4 native; no config file needed |
| Sanity Studio route | Custom CMS admin page | `next-sanity` NextStudio component | Handles Studio routing, auth, basePath; catch-all route pattern |
| TypeScript types for messages | Manual type declarations | `AppConfig.Messages` augmentation pattern | Type-safe `t()` calls with autocomplete and compile-time key validation |

**Key insight:** In this stack, every major concern at the plumbing level has a supported library solution. Custom implementations of any of these will either break on edge cases or require maintenance as libraries evolve.

---

## Common Pitfalls

### Pitfall 1: Middleware Intercepts /studio and /api

**What goes wrong:** next-intl middleware tries to locale-detect and rewrite Studio and API routes. Sanity Studio shows a blank screen or breaks initialization. API routes return locale-redirected HTML instead of JSON.

**Why it happens:** Default next-intl matcher examples don't include `/studio` in the exclusion list.

**How to avoid:** The matcher pattern must include `studio` in the negation group before writing any other code:
```
matcher: '/((?!api|studio|_next|_vercel|.*\\..*).*)'
```

**Warning signs:** Visiting `/studio` redirects to `/de/studio` or shows a blank page.

### Pitfall 2: Middleware File Named proxy.ts Instead of middleware.ts

**What goes wrong:** The file doesn't run. next-intl routing never activates. All pages show locale-less URLs regardless of configuration.

**Why it happens:** next-intl documentation now references `proxy.ts` because Next.js 16 renamed the file. But Next.js 15 uses `middleware.ts`.

**How to avoid:** For Next.js 15, the file must be named `middleware.ts` at `src/middleware.ts`. Only rename to `proxy.ts` when upgrading to Next.js 16.

### Pitfall 3: params Not Awaited in Dynamic Route Components

**What goes wrong:** TypeScript errors or runtime errors accessing `params.locale` directly. Builds fail with strict mode enabled.

**Why it happens:** Next.js 15 made `params` and `searchParams` async. Most documentation was written for Next.js 13/14.

**How to avoid:** Always type params as `Promise<{ locale: string }>` and `await params`:
```typescript
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
```

Run the codemod to catch all instances: `npx @next/codemod@latest next-async-request-api .`

### Pitfall 4: localePrefix as-needed Cookie Redirect Surprise

**What goes wrong:** A tester who previously visited `/es/` navigates to `/` (expecting German — the default). The browser redirects them to `/es/` because of the stored `NEXT_LOCALE` cookie.

**Why it happens:** `localePrefix: 'as-needed'` intentionally uses a cookie to remember locale preference. This is by design.

**How to avoid:** Clear the `NEXT_LOCALE` cookie between locale tests in the browser. In production, document this behavior as expected — returning users see their previously selected language.

**Warning signs:** Locale routing tests pass in incognito but fail in regular browser sessions.

### Pitfall 5: Missing @tailwindcss/postcss in PostCSS Config

**What goes wrong:** All Tailwind classes silently produce no output. The page renders unstyled with no build errors.

**Why it happens:** Tailwind v4 requires `@tailwindcss/postcss` plugin in `postcss.config.mjs`. The v3 plugin name is different.

**How to avoid:** `create-next-app@15 --tailwind` sets this up correctly. If adding Tailwind manually, verify `postcss.config.mjs` contains:
```js
export default { plugins: { '@tailwindcss/postcss': {} } }
```

### Pitfall 6: Translation Keys Out of Sync Across Locales

**What goes wrong:** `de.json` has keys that `en.json` and `es.json` don't have. `useTranslations('hero').title` works in German but returns an error or empty string in other locales.

**Why it happens:** Files are edited independently; a key is added to the source language but not propagated to the other files.

**How to avoid:** Phase 1 success criterion requires all three files to have identical key structure. Add a CI check or a simple script to compare top-level and nested keys across all three files before considering the phase done.

---

## Code Examples

Verified patterns from official sources:

### request.ts — Locale Resolution and Message Loading

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
```

### Using Translations in a Server Component

```typescript
// src/app/[locale]/page.tsx
import { setRequestLocale, getTranslations } from 'next-intl/server'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('hero')  // awaitable version for Server Components

  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  )
}
```

### Using Translations in a Client Component

```typescript
// src/blocks/hero-block.tsx (example — this is a 'use client' component)
'use client'
import { useTranslations } from 'next-intl'

export function HeroBlock() {
  const t = useTranslations('hero')  // hook version for Client Components

  return <h1>{t('title')}</h1>
}
```

### hasLocale Import (next-intl v4 new API)

```typescript
// v4 adds hasLocale as a named export — used for type-safe locale narrowing
import { hasLocale } from 'next-intl'
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` (project root) | `src/middleware.ts` (when using src/) | Always was `src/`; proxy.ts is Next.js 16 only | Use `middleware.ts` in `src/` for Next.js 15 |
| `tailwind.config.js` | CSS `@theme` in globals.css | Tailwind v4 | No JS config file generated or needed |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Tailwind v4 | Single import replaces three directives |
| `tailwindcss-animate` | `tw-animate-css` | shadcn/ui Tailwind v4 update | Drop-in CSS replacement; no plugin declaration needed |
| HSL color values in shadcn/ui | OKLCH color values | March 2025 shadcn/ui update | Better color manipulation; all new shadcn components use OKLCH |
| `declare global { interface IntlMessages }` | `declare module 'next-intl' { interface AppConfig }` | next-intl v4 (March 2025) | Must use AppConfig; old augmentation removed |
| `localeDetection: false` | `localeCookie: false` | next-intl v4 | API renamed; old option no longer accepted |
| `getRequestConfig` returning `{ messages }` | Must also return `{ locale }` | next-intl v4 | `locale` is now required in return value |
| CommonJS imports in next-intl | ESM-only | next-intl v4 | next-intl v4 is ESM-only (except `next-intl/plugin`) |

---

## Open Questions

### 1. Exact Jibemates Purple OKLCH Value

**What we know:** jibemates.de uses a purple brand color. The project memory notes "purple brand accent (primary)" from the site. The actual color is embedded in an AVIF image asset; the CSS does not expose the hex/OKLCH value directly in inspectable page source.

**What's unclear:** The exact OKLCH values for `--primary` in light and dark modes.

**Recommendation:** Before finalizing `globals.css`, use a browser color picker (or Chrome DevTools eyedropper) on the jibemates.de logo/hero area to extract the exact hex, then convert to OKLCH using `oklch.com`. The approximate value is in the range `oklch(0.45–0.50 0.16–0.20 285–295)` based on typical purple brand colors of this style. The globals.css template above uses `oklch(0.45 0.18 290)` as a placeholder — this must be validated against the actual brand color.

### 2. Dark Mode Text Color (Secondary Palette)

**What we know:** Dark mode background is `#131313` (OKLCH ~`oklch(0.12 0 0)`). Light text is required.

**What's unclear:** The exact value for `--foreground` in dark mode and whether secondary text should be a warm or cool gray.

**Recommendation:** Use `oklch(0.95 0.003 80)` for primary foreground (near-white with slight warmth matching the off-white background hue) and `oklch(0.65 0.01 80)` for muted/secondary foreground. Adjust during visual QA.

### 3. Sanity Project ID for Phase 1

**What we know:** `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are required by the Sanity config.

**What's unclear:** Whether a Sanity project already exists in the account, or if it needs to be created during Phase 1.

**Recommendation:** Create the Sanity project at the start of Phase 1 (task 01-03). Use `npx sanity@latest init` or create via sanity.io/manage. The project ID goes into `.env.local` immediately. A template `.env.local.template` documents all required vars.

---

## Environment Variables Reference

Complete set of env vars needed for Phase 1. Document all in `.env.local.template`.

```bash
# .env.local.template

# Sanity (required for Phase 1 — Sanity Studio embedded at /studio)
NEXT_PUBLIC_SANITY_PROJECT_ID=   # From sanity.io/manage > Project > Project ID
NEXT_PUBLIC_SANITY_DATASET=production  # Usually "production"

# Sanity API token (read-only) — required for Phase 2 data fetching; not needed for Phase 1 Studio
SANITY_API_READ_TOKEN=           # From sanity.io/manage > API > Tokens > Add API Token (Viewer)

# Sanity webhook secret — required for Phase 2 cache revalidation; stub in Phase 1
SANITY_WEBHOOK_SECRET=           # Generate: openssl rand -hex 32

# Application URL — required for sitemap generation (Phase 3+)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Security note:** `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are not sensitive — they identify the project but do not grant write access. `SANITY_API_READ_TOKEN` must NOT have the `NEXT_PUBLIC_` prefix — it stays server-side only.

---

## Sources

### Primary (HIGH confidence)
- [next-intl App Router setup with i18n routing](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) — setup steps, file structure, setRequestLocale pattern
- [next-intl middleware docs](https://next-intl.dev/docs/routing/middleware) — matcher configuration, /studio exclusion
- [next-intl routing configuration](https://next-intl.dev/docs/routing/configuration) — localePrefix as-needed behavior
- [next-intl v4.0 release blog](https://next-intl.dev/blog/next-intl-4-0) — breaking changes: AppConfig, ESM-only, locale required in return
- [shadcn/ui Next.js installation](https://ui.shadcn.com/docs/installation/next) — CLI init command
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — OKLCH colors, @theme inline, tw-animate-css
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming) — CSS variable set, customization
- [shadcn/ui dark mode Next.js](https://ui.shadcn.com/docs/dark-mode/next) — next-themes setup, ThemeProvider
- [Next.js create-next-app CLI reference](https://nextjs.org/docs/app/api-reference/cli/create-next-app) — all flags verified (version 16.1.6 docs, 2026-02-27)
- [next-sanity GitHub](https://github.com/sanity-io/next-sanity) — NextStudio component, catch-all route pattern
- `.planning/research/STACK.md` — package versions from npm registry (2026-03-15)
- `.planning/research/PITFALLS.md` — middleware exclusion pattern, async params, localePrefix cookie behavior

### Secondary (MEDIUM confidence)
- WebSearch: next-intl middleware proxy.ts vs middleware.ts — confirmed Next.js 15 uses middleware.ts
- WebSearch: Sanity Studio catch-all route pattern `[[...tool]]` or `[[...index]]` — confirmed double-bracket optional catch-all pattern

### Tertiary (LOW confidence)
- OKLCH purple color approximation (`oklch(0.45 0.18 290)`) — estimated from visual inspection; must be validated against jibemates.de actual brand color with a color picker tool

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified from npm registry (see STACK.md)
- Architecture: HIGH — file structure and patterns verified against official next-intl and Next.js docs
- next-intl v4 changes: HIGH — verified against official v4 release blog
- Pitfalls: HIGH — verified against official docs and prior project research
- Purple brand color OKLCH value: LOW — visual approximation only; requires color picker validation

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (30 days — stack is stable; next-intl releases are frequent but non-breaking at patch level)

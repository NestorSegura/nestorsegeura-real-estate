# Phase 3: Landing Page - Research

**Researched:** 2026-03-15
**Domain:** Next.js App Router — Navbar, API route stub, Sanity content population, i18n locale pages
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Navigation bar
- Style reference: jibemates.de navigation — replicate its behavior and feel
- Slide-in drawer for mobile menu
- Language switcher: text-based labels (DE | EN | ES) in the navbar
- 5-6 section anchor links (e.g., Leistungen, Über mich, Referenzen, Analyse, FAQ, Kontakt)
- Sticky behavior and scroll animation per jibemates.de reference

#### Website analysis form
- Landing page includes a dedicated section promoting the analysis tool
- The actual analysis form lives on its own page (e.g., `/de/analyse`)
- Results display inline on the tool page with animated score gauges
- Mock scores: Performance, SEO, Mobile, Conversion, and Positioning (niche + offer definition)
- No lead gate — overview scores shown freely (paid full report is deferred)

#### CTA & booking flow
- Primary CTA copy: "Erstgespräch vereinbaren" (schedule initial consultation)
- Links to external calendar (Calendly/Cal.com) — opens in new tab
- Button style adapts to section: filled primary on dark sections, outlined on light sections
- Single CTA per section — no secondary "learn more" links, reduce decision fatigue

#### Content & copy tone
- German copy drafted by Claude, reviewed by user
- Tone: Professional but warm — Sie-form, conversational, approachable expert (modern consulting feel)
- Testimonials: full cards with photo, name, company, and quote
- FAQ: accordion pattern (click-to-expand)
- Spanish is the user's source language, but for this phase Claude drafts German directly

### Claude's Discretion
- Exact navbar animation timing and scroll threshold
- Section ordering on the analysis tool page
- Score gauge visual design (circular, bar, etc.)
- FAQ question selection and ordering
- Responsive breakpoint adaptations beyond 375px minimum
- Loading states and transitions

### Deferred Ideas (OUT OF SCOPE)
- **Stripe-gated full analysis report** — deferred, out of scope
- **Real PageSpeed API integration** — deferred, out of scope
</user_constraints>

---

## Summary

Phase 3 builds on a fully-functional Phase 2 foundation. All eight PageBuilder block components exist, the Sanity CMS schema is complete, and the `[locale]/page.tsx` route is already wired to Sanity via `PAGE_BY_SLUG_QUERY`. The codebase is in excellent shape to receive content and new components.

Three new pieces are needed: (1) a **Navbar component** with sticky scroll behavior, a mobile drawer, anchor links, and a locale switcher; (2) the **`/api/analyze` POST endpoint** returning mock scores; and (3) **Sanity content creation** for the German, English, and Spanish homepage pages with all eight blocks populated.

The project has `@base-ui/react` 1.3.0 already installed — use `Drawer` from it for the mobile menu. Zod 3.x is available as a transitive dependency and can be used for URL validation in the API route without adding a new dependency. The i18n navigation utilities are already exported from `@/i18n/navigation`.

**Primary recommendation:** Build the Navbar as a Server Component shell wrapping a `'use client'` interactive interior (drawer open/close + scroll state), fetch `siteSettings` from Sanity via `sanityFetch` for nav links and CTA URL, and use the Drawer component from `@base-ui/react` for the mobile menu.

---

## Standard Stack

All required libraries are already installed. No new `npm install` is needed.

### Core (already in package.json)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.5.12 | Route handlers (`/api/analyze`) | App Router POST handlers — official pattern |
| next-intl | 4.8.3 | Locale switcher, `useLocale`, navigation | Already wired into project, `@/i18n/navigation` exports used |
| @base-ui/react | 1.3.0 | Mobile drawer component | Already installed, headless/unstyled — full CSS control |
| lucide-react | 0.577.0 | Menu, X, Globe icons for navbar | Already installed |
| zod | 3.25.76 (transitive) | URL validation in `/api/analyze` | Available in node_modules, no new dep needed |

### Supporting (already in project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-sanity | 11.6.12 | `sanityFetch` for siteSettings | Fetch nav links and defaultCtaHref in Navbar |
| tailwind | 4 | Utility classes | Responsive layout, sticky positioning |
| clsx / tailwind-merge | current | Conditional class names | Navbar scroll state, active locale |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @base-ui/react Drawer | Custom CSS slide-in div | Don't hand-roll: accessibility (focus trap, ARIA) already handled by Base UI |
| Zod (transitive) | Manual typeof checks | Zod provides typed schema + error messages at zero cost |
| position: sticky | position: fixed | Sticky is GPU-composited, doesn't cause layout shift; preferred |

**Installation:**
No new packages required.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Navbar.tsx              # Server Component shell — fetches siteSettings
│   └── NavbarClient.tsx        # 'use client' — scroll state, drawer open/close, locale switch
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # ADD <Navbar /> here (above {children})
│   │   ├── page.tsx            # Existing — no changes needed
│   │   └── analyse/
│   │       └── page.tsx        # New — analysis tool page with form + score gauges
│   └── api/
│       └── analyze/
│           └── route.ts        # New POST endpoint
└── sanity/
    └── lib/
        └── queries.ts          # SITE_SETTINGS_QUERY already exists — use as-is
```

### Pattern 1: Server/Client Navbar Split

**What:** `Navbar.tsx` is a Server Component that fetches `siteSettings` (nav links, CTA URL) via `sanityFetch`. It passes data as props to `NavbarClient.tsx` which handles all interactivity.

**Why:** Server fetching keeps nav links in sync with Sanity. Client component is minimal — only scroll state and drawer state.

**Example:**
```typescript
// src/components/Navbar.tsx (Server Component)
import { sanityFetch } from '@/sanity/lib/live'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import { NavbarClient } from './NavbarClient'

export async function Navbar() {
  const { data: settings } = await sanityFetch({ query: SITE_SETTINGS_QUERY })
  return (
    <NavbarClient
      navLinks={settings?.navigation ?? []}
      ctaHref={settings?.defaultCtaHref ?? '#kontakt'}
    />
  )
}
```

```typescript
// src/components/NavbarClient.tsx ('use client')
'use client'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { Drawer } from '@base-ui/react'
import { Menu, X } from 'lucide-react'

// Receives navLinks and ctaHref as props from server parent
```

### Pattern 2: Sticky Scroll Effect

**What:** A sentinel `<div>` placed just below the navbar triggers an `IntersectionObserver`. When the sentinel leaves viewport, add a `scrolled` class to the nav for background/shadow changes.

**Why:** Pure CSS transitions, no scroll event listeners. Consistent with the project's established CSS-only animation pattern (no framer-motion/GSAP).

**Example:**
```typescript
// In NavbarClient.tsx
const [scrolled, setScrolled] = useState(false)
const sentinelRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const sentinel = sentinelRef.current
  if (!sentinel) return
  const observer = new IntersectionObserver(
    ([entry]) => setScrolled(!entry.isIntersecting),
    { threshold: 0, rootMargin: '0px' }
  )
  observer.observe(sentinel)
  return () => observer.disconnect()
}, [])

// In layout: <div ref={sentinelRef} className="h-px" aria-hidden="true" />
// Nav gets: style={{ backdropFilter: scrolled ? 'blur(12px)' : 'none', ... }}
```

### Pattern 3: Locale Switcher

**What:** Use `useLocale()` from `next-intl`, `usePathname()` and `useRouter()` from `@/i18n/navigation`. Render `DE | EN | ES` text labels. Click replaces current path in target locale.

**Why:** Already set up in `@/i18n/navigation.ts` via `createNavigation(routing)`. The `localePrefix: 'as-needed'` config means DE has no prefix (`/`), EN is `/en`, ES is `/es`.

**Example:**
```typescript
// Source: https://next-intl.dev/docs/routing/navigation
'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'

export function LocaleSwitcher() {
  const currentLocale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()

  const locales = [
    { code: 'de', label: 'DE' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ]

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      {locales.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => router.replace({ pathname, params }, { locale: code })}
          style={{
            color: code === currentLocale
              ? 'oklch(0.72 0.14 290)'
              : 'inherit',
            fontWeight: code === currentLocale ? '700' : '400',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

### Pattern 4: `/api/analyze` Route Handler

**What:** `app/api/analyze/route.ts` — POST endpoint that validates `{ url: string }` with Zod, returns mock scores as JSON. Same-origin restriction via CORS headers.

**Why:** Next.js App Router route handlers use standard Web API `Request`/`Response`. No `bodyParser` needed. POST handlers are not cached by default.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/route
// app/api/analyze/route.ts
import { z } from 'zod'
import { NextResponse } from 'next/server'

const BodySchema = z.object({
  url: z.string().url('URL muss eine gültige Web-Adresse sein'),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 422 }
    )
  }

  // TODO: Replace mock scores with PageSpeed Insights API call
  const mockScores = {
    performance: Math.floor(Math.random() * 30) + 55,  // 55–84
    seo: Math.floor(Math.random() * 25) + 60,           // 60–84
    mobile: Math.floor(Math.random() * 35) + 50,        // 50–84
    conversion: Math.floor(Math.random() * 40) + 40,    // 40–79
    positioning: Math.floor(Math.random() * 45) + 35,   // 35–79
  }

  return NextResponse.json(
    { url: parsed.data.url, scores: mockScores },
    {
      status: 200,
      headers: {
        // Same-origin restriction — no cross-origin requests allowed
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL ?? '',
      },
    }
  )
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL ?? '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
```

### Pattern 5: Navbar in Layout

**What:** Add `<Navbar />` to `src/app/[locale]/layout.tsx` above `{children}`. The sentinel div goes between them.

**Why:** The locale layout wraps all pages in the locale group — Navbar appears on homepage, analyse page, and any future pages automatically.

**Example:**
```typescript
// In [locale]/layout.tsx — add Navbar
import { Navbar } from '@/components/Navbar'

export default async function LocaleLayout({ children, params }) {
  // ... existing locale validation
  return (
    <NextIntlClientProvider>
      <ThemeProvider ...>
        <Navbar />
        <div id="scroll-sentinel" className="h-0" aria-hidden="true" />
        <main>{children}</main>
        <SanityLive />
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
```

### Pattern 6: `/de/analyse` Page with Score Gauges

**What:** A new page at `src/app/[locale]/analyse/page.tsx`. Contains a URL input form (client component), calls `/api/analyze`, displays scores.

**Why:** Separate from the homepage per locked decision. The homepage block section promotes/links to it; form and results live here.

**Score gauge pattern (CSS-only, circular):**
```typescript
// Circular gauge using SVG stroke-dashoffset — same CSS-only pattern as hero SVG
// score 0–100 maps to stroke-dashoffset 0–circumference
const CIRCUMFERENCE = 2 * Math.PI * 40 // r=40
const dashoffset = CIRCUMFERENCE * (1 - score / 100)

<svg viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="none"
    stroke="oklch(0.93 0.005 80)" strokeWidth="8" />
  <circle cx="50" cy="50" r="40" fill="none"
    stroke="oklch(0.45 0.18 290)" strokeWidth="8"
    strokeDasharray={CIRCUMFERENCE}
    strokeDashoffset={dashoffset}
    strokeLinecap="round"
    style={{ transition: 'stroke-dashoffset 1s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
  />
  <text x="50" y="55" textAnchor="middle" fontSize="22" fontWeight="bold"
    fill="oklch(0.12 0 0)">{score}</text>
</svg>
```

### Anti-Patterns to Avoid

- **Putting `'use client'` on the entire Navbar shell:** Only the interactive parts need client. Keep data fetching on the server.
- **Using `next/link` directly in the Navbar:** Must use `@/i18n/navigation` Link to preserve locale prefixes. Locked decision [01-02].
- **Adding GSAP/framer-motion for navbar transitions:** CSS transitions only per locked decision [02-03].
- **Fetching siteSettings inside the client component:** Can't use `sanityFetch` (server-only) in a client component. Pass as props from the Server Component parent.
- **Omitting `target="_blank" rel="noopener noreferrer"` on Calendly CTA:** External link security.
- **Using dark: Tailwind variants for block backgrounds:** Project uses inline OKLCH styles per [02-03].
- **Hard-coding the Calendly URL in JSX:** It lives in `siteSettings.defaultCtaHref` — read from there.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile drawer with focus trap | Custom positioned div + manual focus management | `@base-ui/react` Drawer | Accessible by default: focus trap, ARIA `dialog` role, backdrop dismiss, ESC key close |
| URL validation in route handler | Regex or `new URL()` try/catch | `zod` `.url()` | Already in node_modules, typed errors, consistent validation |
| Locale switching | Custom cookie/URL manipulation | `useRouter().replace({ pathname, params }, { locale })` from `@/i18n/navigation` | Already established pattern in project |
| Scroll-triggered class toggle | `window.addEventListener('scroll')` listener | IntersectionObserver sentinel pattern | No scroll event overhead, same pattern as `.reveal` animations |

**Key insight:** Every utility needed is already installed. This phase is purely assembly — no new packages, no custom primitives from scratch.

---

## Common Pitfalls

### Pitfall 1: Navbar Causes Layout Shift

**What goes wrong:** `position: fixed` navbar removes nav from document flow, causing content to jump up by the navbar height. Or content hides behind sticky navbar on anchor-link scroll.
**Why it happens:** Fixed positioning takes element out of flow; sticky does not until threshold is reached.
**How to avoid:** Use `position: sticky top-0` on the nav. For anchor scroll offset, add `scroll-margin-top` to each section target equal to navbar height (e.g., `scroll-margin-top: 80px`).
**Warning signs:** Hero section jumps on page load; clicking anchor links lands below section title.

### Pitfall 2: Drawer Not Accessible on Mobile

**What goes wrong:** Focus escapes the open mobile menu; screen readers can navigate the page behind the open drawer.
**Why it happens:** Custom div-based menus don't manage focus or ARIA roles.
**How to avoid:** Use `@base-ui/react` Drawer — it handles this by default. Do not replace with a custom implementation.
**Warning signs:** Tab key leaves the drawer when open.

### Pitfall 3: Locale Switcher Loses Current Path

**What goes wrong:** Language switch navigates to `/` (homepage) instead of staying on the current page.
**Why it happens:** Using `router.push('/')` with a locale instead of the replace-with-pathname pattern.
**How to avoid:** Always use `router.replace({ pathname, params }, { locale: code })` from `@/i18n/navigation` where `pathname = usePathname()`.
**Warning signs:** Switching locale from `/de/analyse` goes to `/en` instead of `/en/analyse`.

### Pitfall 4: CORS Headers Too Permissive

**What goes wrong:** Setting `Access-Control-Allow-Origin: *` allows any website to call `/api/analyze`.
**Why it happens:** Copy-pasting the example from Next.js docs which uses `*`.
**How to avoid:** Set `Access-Control-Allow-Origin` to `process.env.NEXT_PUBLIC_SITE_URL` (the production domain) or omit it entirely — by default, no CORS header means browser enforces same-origin policy automatically.
**Warning signs:** The route requirement LEAD-03 says "CORS headers for same-origin only."

### Pitfall 5: `sanityFetch` Called in a Client Component

**What goes wrong:** TypeScript/runtime error — `sanityFetch` is a server-side utility, not available in client components.
**Why it happens:** Trying to fetch nav data reactively inside `NavbarClient`.
**How to avoid:** Fetch in the Server Component `Navbar.tsx`, pass as props. The Sanity data for nav (siteSettings) does not need to be reactive in the client — it's essentially static.
**Warning signs:** "You're importing a component that needs `next/headers`. That only works in a Server Component."

### Pitfall 6: Hardcoded German Copy in JSX

**What goes wrong:** German text in component files means English/Spanish locale pages get German text.
**Why it happens:** Confusing Sanity content (block-level, CMS-managed) with UI chrome strings (navbar labels, etc.).
**How to avoid:** Sanity-managed content (hero headline, FAQ questions) comes from Sanity and is locale-specific. Navbar UI labels (hamburger menu aria-label, "Close" button) go in `messages/de.json` etc. The nav links themselves come from `siteSettings.navigation` (a global singleton — keep labels neutral/German since target is DE market).

### Pitfall 7: Analysis Page Not in Middleware Matcher

**What goes wrong:** `/de/analyse` or `/analyse` page bypasses i18n middleware and renders without locale context.
**Why it happens:** `middleware.ts` matcher already covers `/((?!api|studio|_next|_vercel|.*\\..*).*)`  — this will match `/analyse` correctly. However, the page needs to be inside `[locale]/` folder.
**How to avoid:** Create page at `src/app/[locale]/analyse/page.tsx` — it automatically inherits locale params. Do not create at `src/app/analyse/page.tsx`.

---

## Code Examples

Verified patterns from official sources:

### POST Route Handler — Body Parsing
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/route
export async function POST(request: Request) {
  const body = await request.json()
  return Response.json({ result: body })
}
```

### CORS Headers in Route Handler
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/route
// For same-origin: omit Access-Control-Allow-Origin OR set to specific domain
// Setting '*' would allow cross-origin — NOT what LEAD-03 requires
export async function POST(request: Request) {
  // ... handler logic
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
    // No Access-Control-Allow-Origin = same-origin only (browser enforces)
  })
}
```

### Locale Switcher — Current Approach
```typescript
// Source: https://next-intl.dev/docs/routing/navigation
import { usePathname, useRouter } from '@/i18n/navigation'  // project's exports
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'

const pathname = usePathname()
const router = useRouter()
const params = useParams()
const locale = useLocale()

// Switch to German:
router.replace({ pathname, params }, { locale: 'de' })
```

### @base-ui/react Drawer — Minimum Structure
```typescript
// Source: https://base-ui.com/react/components/drawer
import { Drawer } from '@base-ui/react'

<Drawer.Root>
  <Drawer.Trigger>
    <button aria-label="Menü öffnen"><Menu /></button>
  </Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop className="fixed inset-0 bg-black/40" />
    <Drawer.Viewport className="fixed inset-y-0 right-0">
      <Drawer.Popup className="h-full w-72 bg-white flex flex-col p-6">
        <Drawer.Close asChild>
          <button aria-label="Menü schließen"><X /></button>
        </Drawer.Close>
        {/* Nav links */}
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
```

### Score Gauge — SVG Circular Progress
```typescript
// CSS-only pattern consistent with existing hero SVG animation
// No motion library
const CIRCUMFERENCE = 2 * Math.PI * 40
function ScoreGauge({ score, label }: { score: number; label: string }) {
  const offset = CIRCUMFERENCE * (1 - score / 100)
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" width="100" height="100" aria-label={`${label}: ${score}`}>
        <circle cx="50" cy="50" r="40" fill="none"
          stroke="oklch(0.88 0.005 80)" strokeWidth="8" />
        <circle cx="50" cy="50" r="40" fill="none"
          stroke="oklch(0.45 0.18 290)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 1s ease 0.2s',
          }}
        />
        <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="700"
          fill="oklch(0.12 0 0)">{score}</text>
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `window.addEventListener('scroll')` for sticky nav | IntersectionObserver sentinel | No scroll listener overhead, same as existing reveal pattern |
| `position: fixed` navbar | `position: sticky top-0` | No layout shift, element stays in flow |
| `next/link` directly | `@/i18n/navigation` Link | Automatic locale prefix handling |
| `groq` tag | `defineQuery` from `next-sanity` | TypeGen-compatible, already established in project [02-04] |

**Deprecated/outdated in this project:**
- `groq` template tag: project uses `defineQuery` from `next-sanity`
- `next/link` and `next/navigation` directly: project uses `@/i18n/navigation` wrappers
- `framer-motion` / GSAP: project enforces CSS-only animations

---

## Open Questions

1. **Calendly/Cal.com URL not yet known**
   - What we know: CTA links to an external calendar, opens in new tab
   - What's unclear: The actual booking URL — needed in Sanity `siteSettings.defaultCtaHref`
   - Recommendation: Populate with a placeholder URL in Sanity (e.g., `https://cal.com/nestorsegura/erstgespraech`) that the user can update; the field is in `siteSettings` which is a Sanity-managed singleton

2. **Real estate agent photos for testimonials**
   - What we know: Testimonial schema has an `avatar` image field; `TestimonialsBlock` renders initials placeholder when no image
   - What's unclear: Whether real agent photos are available for this phase
   - Recommendation: Populate with initials placeholder for now (already works); add photo alt text in Sanity when images are available. The image URL builder for Sanity images is noted as a prior TODO [02-03].

3. **`NEXT_PUBLIC_SITE_URL` environment variable**
   - What we know: Used in CORS header for `/api/analyze`
   - What's unclear: Whether this env var exists in `.env.local`
   - Recommendation: Add to `.env.local` and `.env.example`; omitting `Access-Control-Allow-Origin` entirely is also acceptable since browsers enforce same-origin by default when the header is absent

4. **Navbar anchor link scroll offset**
   - What we know: Each section needs a CSS `id` for anchor links; scrolling must clear the sticky navbar
   - What's unclear: Block components don't currently add `id` attributes
   - Recommendation: Add `id` attributes to each section element in the relevant block components (e.g., `<section id="leistungen" ...>`) — or rely on the Sanity `navigation[].href` field pointing to `#leistungen` — and add `scroll-margin-top: 80px` in `globals.css` for all section targets

---

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/api-reference/file-conventions/route — Route handler API, CORS pattern, POST body parsing (fetched, dated 2026-02-27)
- https://nextjs.org/docs/app/getting-started/route-handlers — Route handler overview (fetched, dated 2026-02-27)
- https://next-intl.dev/docs/routing/navigation — Locale switcher pattern with `usePathname`/`useRouter`/`router.replace` (fetched)
- https://base-ui.com/react/components/drawer — Drawer component API (fetched)
- Project source code — `src/blocks/`, `src/sanity/`, `src/i18n/` — confirmed existing patterns

### Secondary (MEDIUM confidence)
- https://www.wisp.blog/blog/handling-common-cors-errors-in-nextjs-15 — CORS in Next.js 15 (WebSearch, aligns with official docs)
- https://taylor.callsen.me/modern-navigation-menus-with-css-position-sticky-and-intersectionobservers — Sentinel-based scroll detection (WebSearch, pattern verified against project's existing IntersectionObserver usage)

### Tertiary (LOW confidence)
- jibemates.de nav inspection — WebFetch showed general structure but could not fully extract animation timing; behavior described is based on project context and standard CSS sticky nav patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in node_modules, versions confirmed
- Architecture: HIGH — patterns verified against official docs and existing codebase
- Pitfalls: HIGH for structural pitfalls (server/client boundary, locale routing); MEDIUM for scroll timing specifics
- German copy content: LOW — placeholder copy exists in `de.json`, Sanity data to be drafted; user reviews before publishing

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable libraries, 30-day window)

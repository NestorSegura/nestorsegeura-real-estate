# Phase 7: i18n and Content Layer - Research

**Researched:** 2026-04-13
**Domain:** Astro 6 i18n routing, @sanity/document-internationalization, font loading
**Confidence:** HIGH overall (official docs + verified patterns)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Locale switcher behavior**
- Same document, different locale: Resolve via Sanity `document-internationalization` plugin's translation references. Switching from `/en/blog/successful-agency` → `/blog/erfolgreiche-immobilienagentur` (the localized slug, not just a prefix swap).
- No target equivalent exists: Redirect to the target locale's homepage (`/`, `/en`, `/es`) with a small notice in the target locale ("This article isn't available in English yet").
- First-time visitors: Honor the URL they requested. Do NOT auto-redirect based on `Accept-Language` header.
- Persistence: Remember the user's last explicit choice in a cookie. Cookie only consulted when user lands on `/` (the default-locale root). Does not override an explicit URL.

**Missing translation fallback**
- Sanity document missing for locale: Fall back to German version and render a small banner in the target locale.
- UI string key missing in `messages/{en,es}.json`: Fall back to the value in `messages/de.json`. Log a build-time warning listing missing keys per locale.
- Individual Page Builder block missing for locale: Skip the block silently.

**Font loading strategy**
- Self-host all font files in `/public/fonts/`. No CDN, no Google Fonts, no Fontshare runtime.
- Subset Clash Display (and Chivo if oversized) to Latin + Latin Extended. Must cover German and Spanish glyphs.
- `font-display: swap` on all `@font-face` rules.
- Emit `<link rel="preload">` for Clash Display and Chivo regular weights in `BaseLayout.astro` `<head>`.

**URL shape / slug localization**
- Blog post slugs: Localized per language. Each Sanity post has its own slug field per locale document.
- Route segments: Translated per locale — `/blog` (DE) / `/en/blog` / `/es/blog`, `/analyse` (DE) / `/en/analyze` / `/es/analizar`.
- `/de/*` handling: Redirect `301 → /*`. Enforces canonical root-no-prefix for default locale.

### Claude's Discretion
- Exact copy/styling of the "translation pending" banner
- Cookie name (`ns_locale`), path, `SameSite=Lax`, 365-day expiry
- Glyph subset range string for pyftsubset (suggest: `U+0020-007F,U+00A0-00FF,U+0100-017F`)
- Structure of `src/i18n/utils.ts`: `t(key)`, `localizeRoute(pathname, targetLocale)`, helpers
- Shape of Sanity GROQ query helper filtering by `language` field
- Build-time warning format for missing i18n keys
- Whether `/de/*` redirect is in Astro middleware, Worker redirect, or `_redirects`

### Deferred Ideas (OUT OF SCOPE)
- The actual locale switcher UI component — belongs to Phase 9 Interactive Islands.
- Auto-translation pipeline for missing Sanity documents.
- Multi-region Cloudflare deploy / geo-IP language routing.
</user_constraints>

---

## Summary

Phase 7 wires three interrelated systems: Astro 6's built-in i18n routing (already partially configured in `astro.config.mjs`), the `@sanity/document-internationalization` plugin (referenced in `src/sanity/config.ts` but **not yet installed** — `package.json` lacks the dependency), and self-hosted fonts with preloading in `BaseLayout.astro`.

The standard approach is: Astro's native i18n for routing and locale resolution, plain JSON files in `messages/` for UI strings (already present and complete for all three locales), GROQ queries filtering by the `language` field that the plugin sets on each document, and manual `@font-face` + `<link rel="preload">` for font loading. Astro's experimental Fonts API is not recommended here because the fonts are already in `public/fonts/` (not `src/assets/fonts/`) and the API is still experimental in Astro 6.

Translated route segments (`/analyse` vs `/en/analyze`) are **not natively supported** by Astro's i18n system and require separate per-locale `.astro` files or a route-mapping table plus a middleware rewrite — the separate file approach is simpler and more reliable for static output.

**Primary recommendation:** Install `@sanity/document-internationalization`, create the `src/i18n/utils.ts` module with flat-key fallback `t()`, build per-locale page files for translated segments, use `public/_redirects` for the `/de/*` → `/*` 301, and emit preload + `@font-face` manually in `BaseLayout.astro`.

---

## Critical Finding: Missing Dependency

`@sanity/document-internationalization` is imported in `src/sanity/config.ts` but is **NOT in `package.json`** and **NOT in `node_modules`**. The Sanity Studio currently runs with this import failing silently (Sanity may bundle it internally in older setups) or the dev server has never exercised this code path. Phase 7 must install the package.

**Install:**
```bash
npm install @sanity/document-internationalization
```

Latest version as of research: **4.x** (peer-compatible with `sanity@4.22`). Verify with `npm show @sanity/document-internationalization version` before installing.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro (built-in i18n) | 6.1.5 (installed) | Routing, `Astro.currentLocale`, `getRelativeLocaleUrl` | Native, no extra dep |
| `@sanity/document-internationalization` | 4.x | Document-level translation metadata in Sanity Studio | Official Sanity plugin, already configured |
| messages/*.json (plain JSON) | — | UI strings, already complete for de/en/es | Simplest approach, already exists |
| fonttools / pyftsubset | latest pip | One-time font subsetting | Industry standard, CLI, no runtime cost |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `astro:i18n` module | built-in | `getRelativeLocaleUrl`, `getAbsoluteLocaleUrl` | Generating locale-aware hrefs |
| `@web-alchemy/fonttools` | npm | Run pyftsubset via npx without installing Python | When Python is not available locally |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain JSON + utils.ts | astro-i18next / paraglide | Heavier dep, more config, messages/*.json already complete |
| manual @font-face | Astro experimental Fonts API | Experimental in Astro 6, requires src/assets/ not public/, adds config complexity |
| `_redirects` for /de/* | Astro middleware + run_worker_first | _redirects is zero-runtime, simpler; middleware approach needs wrangler config change |

### Installation
```bash
npm install @sanity/document-internationalization
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── i18n/
│   ├── utils.ts          # t(), localizeRoute(), LOCALES, DEFAULT_LOCALE
│   └── routes.ts         # translated segment map { analyse: { en: 'analyze', es: 'analizar' } }
├── layouts/
│   └── BaseLayout.astro  # @font-face via global.css ref, <link preload>, lang attr, Astro.currentLocale
├── pages/
│   ├── index.astro       # DE root (no prefix) — fetches page with language=='de'
│   ├── blog/
│   │   └── [slug].astro  # DE blog posts — getStaticPaths filters language=='de'
│   ├── analyse.astro     # DE /analyse page
│   ├── en/
│   │   ├── index.astro   # EN root
│   │   ├── blog/
│   │   │   └── [slug].astro  # EN blog posts
│   │   └── analyze.astro     # EN /en/analyze page
│   └── es/
│       ├── index.astro   # ES root
│       ├── blog/
│       │   └── [slug].astro  # ES blog posts
│       └── analizar.astro    # ES /es/analizar page
├── styles/
│   └── global.css        # @font-face rules here
messages/
├── de.json               # complete (already exists)
├── en.json               # complete (already exists)
└── es.json               # complete (already exists)
public/
├── fonts/
│   ├── ClashDisplay-Variable.woff2       # already exists
│   ├── ClashDisplay-Variable-subset.woff2 # generate via pyftsubset
│   ├── Chivo-Variable.woff2             # download from Google Fonts / Fontsource
│   └── Chivo-Variable-subset.woff2     # generate via pyftsubset
└── _redirects            # /de/* → /* 301
scripts/
└── check-i18n-keys.mjs   # build-time key audit script
```

### Pattern 1: Astro i18n Configuration (already in astro.config.mjs)
**What:** `prefixDefaultLocale: false` means DE lives at `/`, EN at `/en/`, ES at `/es/`.  
**Status:** Already correct in `astro.config.mjs`. No change needed.

```typescript
// astro.config.mjs — current config is correct, no modification required
i18n: {
  defaultLocale: 'de',
  locales: ['de', 'en', 'es'],
  routing: {
    prefixDefaultLocale: false,
  },
},
```

**Astro.currentLocale behavior:**
- At `/` → `'de'` (defaultLocale)
- At `/en/blog/foo` → `'en'`
- At `/es/blog/bar` → `'es'`
- In `getStaticPaths`, Astro.currentLocale reflects the generated path's locale correctly for non-index pages. For index pages with `[locale]` param, there is a known SSG bug (GitHub #14228) where it falls back to defaultLocale — avoid relying on `Astro.currentLocale` inside `getStaticPaths` itself; use the `params.locale` prop instead.

### Pattern 2: src/i18n/utils.ts
**What:** Typed `t()` function reading flat-key JSON, locale resolver, route localizer.

```typescript
// src/i18n/utils.ts
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

export const LOCALES = ['de', 'en', 'es'] as const;
export type Locale = typeof LOCALES[number];
export const DEFAULT_LOCALE: Locale = 'de';

const messages = { de, en, es } as const;

// Flat dot-notation key lookup with DE fallback
type DeepKeys<T, P extends string = ''> = T extends object
  ? { [K in keyof T]: DeepKeys<T[K], P extends '' ? `${K & string}` : `${P}.${K & string}`> }[keyof T]
  : P;
type MessageKey = DeepKeys<typeof de>;

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj) as string | undefined;
}

export function useTranslations(locale: Locale) {
  return function t(key: string): string {
    const msg = messages[locale] as Record<string, unknown>;
    const fallback = messages[DEFAULT_LOCALE] as Record<string, unknown>;
    return getNestedValue(msg, key) ?? getNestedValue(fallback, key) ?? key;
  };
}

// Usage in .astro frontmatter:
// const t = useTranslations(Astro.currentLocale as Locale ?? DEFAULT_LOCALE);
// t('nav.home') → 'Startseite' | 'Home' | 'Inicio'
```

**Note:** The existing `messages/*.json` files use nested objects (`nav.home`, `hero.title`), NOT flat keys. The utility above traverses the nesting with dot-notation. Items in arrays (like `features.items[0].title`) need array index support or a different access pattern — consider flattening only non-array sections, or use explicit keys like `'features.items'` returning the whole array.

### Pattern 3: GROQ Locale Filtering
**What:** Filter Sanity documents by `language` field populated by `@sanity/document-internationalization`.  
**Schema state:** Both `page` and `post` schemas already have `language: string` (readOnly, hidden). The plugin sets this field automatically.

```typescript
// Fetch a page for current locale with German fallback
const FETCH_PAGE = `
  *[_type == "page" && slug.current == $slug && language == $locale][0]
`;

// Fetch page with DE fallback (coalesce pattern)
const FETCH_PAGE_WITH_FALLBACK = `
  coalesce(
    *[_type == "page" && slug.current == $slug && language == $locale][0],
    *[_type == "page" && slug.current == $slug && language == "de"][0]
  )
`;

// Fetch all post slugs per locale (for getStaticPaths)
const FETCH_POST_SLUGS_BY_LOCALE = `
  *[_type == "post" && language == $locale && defined(slug.current)]{
    "slug": slug.current,
    language
  }
`;

// Fetch a post with its sibling translations (for locale switcher URL resolution)
const FETCH_POST_WITH_TRANSLATIONS = `
  *[_type == "post" && slug.current == $slug && language == $locale][0]{
    title,
    slug,
    language,
    body,
    "_translations": *[_type == "translation.metadata" && references(^._id)]
      .translations[].value->{
        title,
        "slug": slug.current,
        language
      }
  }
`;
```

**translation.metadata structure:**
```
// Sanity creates a document of type "translation.metadata" linking variants:
{
  _type: "translation.metadata",
  translations: [
    { _type: "internationalizedArrayReferenceValue", language: "de", value: { _ref: "post-id-de" } },
    { _type: "internationalizedArrayReferenceValue", language: "en", value: { _ref: "post-id-en" } },
    { _type: "internationalizedArrayReferenceValue", language: "es", value: { _ref: "post-id-es" } }
  ]
}
```

The `_translations` sub-query above resolves the locale switcher's target URLs: given the current post's `_id`, find all sibling translations to build `/blog/de-slug`, `/en/blog/en-slug`, `/es/blog/es-slug`.

### Pattern 4: getStaticPaths for Localized Blog Posts
**What:** Each locale's blog `[slug].astro` generates paths for only that locale's posts.

```typescript
// src/pages/blog/[slug].astro  (DE posts — no prefix)
import { sanityClient } from 'sanity:client';

export async function getStaticPaths() {
  const posts = await sanityClient.fetch(
    `*[_type == "post" && language == "de" && defined(slug.current)]{
      "slug": slug.current
    }`
  );
  return posts.map((post: { slug: string }) => ({
    params: { slug: post.slug },
  }));
}
```

```typescript
// src/pages/en/blog/[slug].astro  (EN posts)
export async function getStaticPaths() {
  const posts = await sanityClient.fetch(
    `*[_type == "post" && language == "en" && defined(slug.current)]{
      "slug": slug.current
    }`
  );
  return posts.map((post: { slug: string }) => ({
    params: { slug: post.slug },
  }));
}
```

The pattern repeats for `src/pages/es/blog/[slug].astro` with `language == "es"`.

### Pattern 5: Translated Route Segments
**What:** `/analyse` (DE) / `/en/analyze` (EN) / `/es/analizar` (ES) requires **separate .astro files per locale**.

Astro does NOT natively translate route segment names. The solution is:
1. Create `src/pages/analyse.astro` (DE, no prefix)
2. Create `src/pages/en/analyze.astro` (EN)
3. Create `src/pages/es/analizar.astro` (ES)

All three files can share a layout and props. Create a route map for URL generation:

```typescript
// src/i18n/routes.ts
export const ROUTE_SEGMENTS: Record<string, Record<string, string>> = {
  blog:    { de: 'blog',    en: 'blog',    es: 'blog'     },
  analyse: { de: 'analyse', en: 'analyze', es: 'analizar' },
};

// Helper: given a route key and target locale, return the full localized path
export function localizeRoute(routeKey: string, targetLocale: string): string {
  const segments = ROUTE_SEGMENTS[routeKey];
  const segment = segments?.[targetLocale] ?? routeKey;
  const prefix = targetLocale === 'de' ? '' : `/${targetLocale}`;
  return `${prefix}/${segment}`;
}
// localizeRoute('analyse', 'en') → '/en/analyze'
// localizeRoute('analyse', 'de') → '/analyse'
```

### Pattern 6: Font Loading — Self-Hosted Manual @font-face
**What:** Place `@font-face` rules in `src/styles/global.css`, emit `<link rel="preload">` in `BaseLayout.astro`.

**Why not Astro's experimental Fonts API:**
- Still experimental in Astro 6 (enabled via `experimental: { fonts: true }`)
- Requires font files in `src/assets/fonts/`, but ClashDisplay is already in `public/fonts/`
- Adds config complexity for a feature that manual CSS does in 10 lines
- Not recommended for production with the current pinned adapter version

```css
/* src/styles/global.css */
@font-face {
  font-family: 'Clash Display';
  src: url('/fonts/ClashDisplay-Variable-subset.woff2') format('woff2');
  font-weight: 200 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Chivo';
  src: url('/fonts/Chivo-Variable-subset.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

```astro
<!-- src/layouts/BaseLayout.astro <head> -->
<link rel="preload" href="/fonts/ClashDisplay-Variable-subset.woff2"
      as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/Chivo-Variable-subset.woff2"
      as="font" type="font/woff2" crossorigin />
```

```css
/* Tailwind v4 — register custom font in global.css */
@theme inline {
  --font-heading: 'Clash Display', sans-serif;
  --font-body: 'Chivo', sans-serif;
}
```

**crossorigin attribute is mandatory** on preload for fonts — without it browsers ignore the hint.

### Pattern 7: /de/* → /* Redirect via _redirects
**What:** Canonical URL enforcement — German content lives at `/`, not `/de/`.

```
# public/_redirects
/de  /  301
/de/*  /:splat  301
```

**Why _redirects beats Astro middleware here:**
- With `output: 'static'` and `prerenderEnvironment: 'node'`, Astro middleware does NOT run at request time for static assets by default.
- Making middleware run at request time requires `run_worker_first` in wrangler config + a custom `workerEntryPoint` — additional complexity for a redirect that `_redirects` handles in two lines.
- Cloudflare Workers fully support `_redirects` with wildcard splat and 301 status codes.
- Limit: 2,000 static + 100 dynamic redirects. Two rules is negligible.

**Caveat:** `_redirects` is processed by Cloudflare before the Worker. If a user somehow lands on `/de/blog/foo`, the redirect fires at the CDN layer without incurring a Worker invocation.

### Pattern 8: Cookie-Based Locale Persistence (Client-Side Only)
**What:** Since all pages are prerendered static HTML, cookies cannot be read server-side. The cookie must be written by a tiny inline script and only consulted when the user is on `/` (DE root) to optionally redirect.

**Critical constraint:** Setting and reading cookies for navigation decisions **requires client-side JavaScript**. Astro's `Astro.cookies` is only available in SSR (prerender=false) pages. For static output, you must use a `<script>` tag.

```astro
<!-- In src/pages/index.astro (DE root only) — inline cookie check -->
<script is:inline>
  const cookieName = 'ns_locale';
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(cookieName + '='))
    ?.split('=')[1];
  // Only redirect if cookie says a non-DE locale AND user hasn't already been redirected
  if (cookieValue && cookieValue !== 'de' && !sessionStorage.getItem('locale_redirected')) {
    const localeMap = { en: '/en', es: '/es' };
    const target = localeMap[cookieValue];
    if (target) {
      sessionStorage.setItem('locale_redirected', '1');
      window.location.replace(target);
    }
  }
</script>
```

Cookie write (on locale switch — Phase 9 will call this, but Phase 7 defines the contract):
```typescript
// Contract for Phase 9 NavbarClient to call when user switches locale
function persistLocale(locale: string) {
  document.cookie = `ns_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
```

**The cookie is not consulted on deep URLs** (`/en/blog/foo` never runs this script). Only `src/pages/index.astro` includes it. This matches the locked decision.

### Pattern 9: Build-Time Missing Key Warning Script
**What:** Node script run after build (or as part of build) that compares keys between DE (reference) and EN/ES.

```javascript
// scripts/check-i18n-keys.mjs
import de from '../messages/de.json' assert { type: 'json' };
import en from '../messages/en.json' assert { type: 'json' };
import es from '../messages/es.json' assert { type: 'json' };

function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && !Array.isArray(v)
      ? flattenKeys(v, prefix ? `${prefix}.${k}` : k)
      : [`${prefix ? prefix + '.' : ''}${k}`]
  );
}

const deKeys = new Set(flattenKeys(de));
for (const [locale, messages] of [['en', en], ['es', es]]) {
  const localeKeys = new Set(flattenKeys(messages));
  for (const key of deKeys) {
    if (!localeKeys.has(key)) {
      console.warn(`[i18n] Missing key in ${locale}: "${key}"`);
    }
  }
}
```

Add to `package.json`:
```json
"scripts": {
  "check:i18n": "node scripts/check-i18n-keys.mjs",
  "build": "node scripts/check-i18n-keys.mjs && astro build"
}
```

**Note:** Array items (`features.items[0].title`) will not be detected by this flat-key approach. Arrays flatten to a single key (`features.items`). This is acceptable — the warning catches structural key renames and additions, not array item counts.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL generation for locale-aware links | Custom string concatenation | `getRelativeLocaleUrl(locale, path)` from `astro:i18n` | Handles prefixDefaultLocale:false correctly |
| Detecting locale from URL | Manual pathname parsing | `Astro.currentLocale` | Built into Astro's routing context |
| Translation ref resolution | Custom Sanity query | `_translations` sub-query with `references(^._id)` | Correct pattern for translation.metadata structure |
| Font subsetting | Custom font processing | `pyftsubset` (fonttools) | Industry standard, covers all edge cases |
| Cloudflare redirects | Middleware + run_worker_first | `public/_redirects` | Simpler, zero Worker invocation cost |

**Key insight:** For static-output Astro on Cloudflare Workers, any runtime behavior (redirects, cookie reads) must happen either at CDN level (`_redirects`) or in client-side `<script>` tags. Server-side middleware only runs if you explicitly configure `run_worker_first` and a custom worker entry point — avoid this complexity unless absolutely necessary.

---

## Common Pitfalls

### Pitfall 1: messages/*.json Array Items vs Flat Keys
**What goes wrong:** `t('features.items')` returns the whole array, not a string. Calling `t('features.items.0.title')` returns undefined because arrays don't index like objects.
**Why it happens:** The existing JSON structure uses arrays for lists. The flat-key approach works for string leafs only.
**How to avoid:** In `utils.ts`, access arrays directly: `import de from 'messages/de.json'` and use `messages.features.items[0].title` directly where array items are needed. Reserve `t()` for string-leaf lookups only.
**Warning signs:** TypeScript will complain if you try to use `t()` on array paths — use strict typing.

### Pitfall 2: @sanity/document-internationalization Not Installed
**What goes wrong:** Sanity Studio import fails at runtime; plugin features absent; `language` field not set on documents.
**Why it happens:** The package is referenced in `src/sanity/config.ts` but absent from `package.json` and `node_modules`.
**How to avoid:** `npm install @sanity/document-internationalization` is the first task.

### Pitfall 3: Astro.currentLocale in getStaticPaths Index Pages
**What goes wrong:** On index pages using `[locale]` param in `getStaticPaths`, `Astro.currentLocale` returns the defaultLocale (`de`) even when generating EN/ES paths (GitHub issue #14228).
**Why it happens:** SSG evaluates currentLocale from the URL, which hasn't fully resolved in the getStaticPaths context for root index files.
**How to avoid:** Pass locale as a **prop** from `getStaticPaths`, not via `Astro.currentLocale`. Use `Astro.props.locale` inside the page.

```typescript
export function getStaticPaths() {
  return [
    { params: {}, props: { locale: 'de' } },  // root index
  ];
}
const { locale } = Astro.props;
```

For non-index dynamic routes (like `[slug].astro`), `Astro.currentLocale` works correctly.

### Pitfall 4: Missing crossorigin on Font Preload
**What goes wrong:** Browser downloads the font twice — once from the preload hint and once from the @font-face rule.
**Why it happens:** Without `crossorigin` attribute on the preload link, the browser treats them as different requests.
**How to avoid:** Always include `crossorigin` (anonymous) on `<link rel="preload" as="font">`.

### Pitfall 5: Cloudflare _redirects Only Works for Static Asset Responses
**What goes wrong:** If a `/de/blog/foo` URL happens to match a Worker route, the `_redirects` rule is NOT applied (Cloudflare Workers docs: "Redirects are not applied to requests served by your Worker code").
**Why it happens:** `_redirects` only applies to pure static asset serving, not Worker-handled responses.
**How to avoid:** Since all pages are prerendered static HTML, `/de/*` paths won't match any Worker route (there are no `/de/` page files). The `_redirects` rule will fire correctly for any stray `/de/` request.

### Pitfall 6: Sanity GROQ language Field Before Plugin Runs
**What goes wrong:** Querying `language == "de"` returns 0 documents if no one has opened the Sanity Studio and the plugin hasn't auto-set the language field on existing documents.
**Why it happens:** `@sanity/document-internationalization` sets the `language` field when you create/edit a document in Studio. Pre-existing documents created before the plugin was configured don't have it set.
**How to avoid:** After installing the plugin, open Sanity Studio and manually set the language on each document, or run a migration script. Document this in Phase 7 verification criteria.

### Pitfall 7: Translated Segment Pages Import Conflicts
**What goes wrong:** `src/pages/analyse.astro` and `src/pages/en/analyze.astro` both import the same data-fetching logic but use different GROQ locale parameters. If they share a layout that assumes locale from path, the DE page at root level may get `currentLocale = 'de'` correctly but the import of shared components needs the locale passed explicitly.
**How to avoid:** Always pass locale as a prop from each page file into shared components. Never derive locale from `Astro.currentLocale` inside components — only in page-level `.astro` files.

---

## Code Examples

### Complete src/i18n/utils.ts

```typescript
// src/i18n/utils.ts
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

export const LOCALES = ['de', 'en', 'es'] as const;
export type Locale = typeof LOCALES[number];
export const DEFAULT_LOCALE: Locale = 'de';

const messages: Record<Locale, Record<string, unknown>> = { de, en, es };

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && !Array.isArray(acc)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function useTranslations(locale: Locale) {
  return function t(key: string): string {
    const val = getNestedValue(messages[locale], key);
    if (typeof val === 'string') return val;
    // Fallback to DE
    const fallback = getNestedValue(messages[DEFAULT_LOCALE], key);
    if (typeof fallback === 'string') return fallback;
    // Last resort: return key so missing keys are visible in dev
    return key;
  };
}

// Array helper (use for features.items, problem.items, etc.)
export function useTranslationArray<T>(locale: Locale, key: string): T[] {
  const val = getNestedValue(messages[locale], key);
  if (Array.isArray(val)) return val as T[];
  const fallback = getNestedValue(messages[DEFAULT_LOCALE], key);
  if (Array.isArray(fallback)) return fallback as T[];
  return [];
}
```

### BaseLayout.astro Skeleton with Font Preload + lang Attribute

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
import { type Locale, DEFAULT_LOCALE } from '../i18n/utils';

interface Props {
  title: string;
  locale?: Locale;
  description?: string;
}

const { title, locale = DEFAULT_LOCALE, description } = Astro.props;
---
<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <!-- Font preloads — crossorigin is required for CORS font fetch -->
    <link rel="preload" href="/fonts/ClashDisplay-Variable-subset.woff2"
          as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/Chivo-Variable-subset.woff2"
          as="font" type="font/woff2" crossorigin />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### GROQ: Fetch Post With Translations for Locale Switcher

```typescript
// src/lib/sanity.ts
import { sanityClient } from 'sanity:client';
import type { Locale } from '../i18n/utils';

export async function getPostWithTranslations(slug: string, locale: Locale) {
  return sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug && language == $locale][0]{
      title,
      "slug": slug.current,
      language,
      publishedAt,
      excerpt,
      body,
      "_translations": *[_type == "translation.metadata" && references(^._id)]
        .translations[].value->{
          "slug": slug.current,
          language
        }
    }`,
    { slug, locale }
  );
}

export async function getAllPostSlugsForLocale(locale: Locale) {
  return sanityClient.fetch<Array<{ slug: string }>>(
    `*[_type == "post" && language == $locale && defined(slug.current)]{
      "slug": slug.current
    }`,
    { locale }
  );
}

// Fallback: fetch post in any locale then look up translation
export async function getPostWithFallback(slug: string, locale: Locale) {
  const post = await sanityClient.fetch(
    `coalesce(
      *[_type == "post" && slug.current == $slug && language == $locale][0],
      *[_type == "post" && slug.current == $slug && language == "de"][0]
    ){ title, "slug": slug.current, language, body, publishedAt }`,
    { slug, locale }
  );
  return { post, isFallback: post?.language !== locale };
}
```

### pyftsubset Command for Font Subsetting

```bash
# Install fonttools once (Python required)
pip install fonttools brotli

# Subset ClashDisplay Variable
pyftsubset \
  public/fonts/ClashDisplay-Variable.woff2 \
  --unicodes="U+0020-007F,U+00A0-00FF,U+0100-017F" \
  --layout-features="kern,liga,clig,calt,ccmp,locl,mark,mkmk" \
  --flavor=woff2 \
  --output-file=public/fonts/ClashDisplay-Variable-subset.woff2

# Same for Chivo (after downloading)
pyftsubset \
  public/fonts/Chivo-Variable.woff2 \
  --unicodes="U+0020-007F,U+00A0-00FF,U+0100-017F" \
  --layout-features="kern,liga,calt,ccmp,locl,mark,mkmk" \
  --flavor=woff2 \
  --output-file=public/fonts/Chivo-Variable-subset.woff2

# Alternative: npx without installing Python
npx --package=@web-alchemy/fonttools -- pyftsubset \
  public/fonts/ClashDisplay-Variable.woff2 \
  --unicodes="U+0020-007F,U+00A0-00FF,U+0100-017F" \
  --flavor=woff2 \
  --output-file=public/fonts/ClashDisplay-Variable-subset.woff2
```

**Unicode range explanation:**
- `U+0020-007F`: Basic Latin (ASCII, covers EN)
- `U+00A0-00FF`: Latin-1 Supplement (covers `ä ö ü ß ñ á é í ó ú ¡ ¿` and more)
- `U+0100-017F`: Latin Extended-A (covers additional DE/ES characters)

### Chivo Download Source

Chivo is available as a **variable font** on:
- Google Fonts: https://fonts.google.com/specimen/Chivo — download "Variable TTF/WOFF2" from the page
- Fontsource npm: `npm install @fontsource-variable/chivo` — then copy `node_modules/@fontsource-variable/chivo/files/chivo-latin-woff2-variable.woff2` to `public/fonts/`

**Recommendation:** Use Fontsource npm to download, copy to `public/fonts/`, then subset. This avoids manual download steps and the npm package contains the canonical variable woff2.

### public/_redirects

```
/de  /  301
/de/*  /:splat  301
```

Place in `public/_redirects` (no file extension). Cloudflare Workers reads this during static asset serving.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `__i18n_lang` / `__i18n_refs` fields on base document | Separate `translation.metadata` document linking variants | Plugin v2 (2023) | GROQ must query `translation.metadata`, not base doc fields |
| `_key` for language in internalized arrays | Dedicated `language` field | Plugin v5 (2024) | GROQ uses `language == "en"` not `_key == "en"` |
| Astro i18n experimental (Astro 3) | Stable built-in i18n (Astro 4+) | Astro 4.0 | No experimental flag needed, already in config |
| Manual font file import + CSS | Astro experimental Fonts API | Astro 5.7 | API is still experimental in Astro 6 — manual approach remains recommended for production |

**Deprecated/outdated:**
- `__i18n_lang`, `__i18n_base`, `__i18n_refs` fields: These were v1 plugin fields. The current plugin uses `language` (string) on documents and a separate `translation.metadata` doc. Do not query for `__i18n_*` fields.
- `greeting[_key == "en"][0].value` pattern: Replaced by `greeting[language == "en"][0].value` after v5 migration.

---

## Open Questions

1. **Sanity document-internationalization actual installed version**
   - What we know: Package is not in node_modules. The repo was archived on Feb 12, 2026 and moved to sanity-io/plugins monorepo.
   - What's unclear: Whether `npm install @sanity/document-internationalization` still resolves to v4.x or now points to the plugins monorepo package. Need to check latest npm tag.
   - Recommendation: Run `npm show @sanity/document-internationalization version` to confirm before installing.

2. **Existing Sanity documents without language field**
   - What we know: Post/page schemas have the `language` field defined. The plugin wasn't installed.
   - What's unclear: Whether any documents have been created in Sanity Studio that are missing the `language` field (it would be empty/null).
   - Recommendation: Phase 7 verification must include a GROQ query to count documents with/without `language` set. Any missing ones need editorial action before the site can work.

3. **ClashDisplay-Variable.woff2 size before subsetting**
   - What we know: File exists at `public/fonts/ClashDisplay-Variable.woff2`.
   - What's unclear: Current file size — variable fonts can be 200KB–1MB. Subsetting may reduce 50–80%.
   - Recommendation: Check size with `ls -lh public/fonts/` before and after subsetting.

4. **Astro.currentLocale on index.astro (DE root)**
   - What we know: With `prefixDefaultLocale: false`, `/` maps to `defaultLocale = 'de'`.
   - What's unclear: Whether `Astro.currentLocale` returns `'de'` or `undefined` in `src/pages/index.astro` (not a dynamic route, so the SSG index bug may not apply).
   - Recommendation: The fix is defensive — always `Astro.currentLocale ?? DEFAULT_LOCALE` in all page files.

---

## Sources

### Primary (HIGH confidence)
- [Astro i18n Routing Guide](https://docs.astro.build/en/guides/internationalization/) — routing config, prefixDefaultLocale, currentLocale, fallback config
- [Astro i18n Module Reference](https://docs.astro.build/en/reference/modules/astro-i18n/) — getRelativeLocaleUrl and all helper function signatures
- [Astro i18n Recipe](https://docs.astro.build/en/recipes/i18n/) — useTranslations pattern, getStaticPaths with locales
- [Astro Custom Fonts Guide](https://docs.astro.build/en/guides/fonts/) — Font API, local provider, @font-face in global.css
- [Cloudflare Workers _redirects docs](https://developers.cloudflare.com/workers/static-assets/redirects/) — wildcard splat syntax, 301 support, interaction with Worker code
- [sanity-io/plugins — @sanity/document-internationalization README](https://github.com/sanity-io/plugins/blob/main/plugins/@sanity/document-internationalization/README.md) — GROQ patterns, translation.metadata structure, language field spec

### Secondary (MEDIUM confidence)
- [Sanity Localization Docs](https://www.sanity.io/docs/studio/localization) — coalesce fallback GROQ pattern, translation.metadata structure
- [fonttools pyftsubset docs](https://fonttools.readthedocs.io/en/stable/subset/) — CLI flag reference, woff2 flavor support
- [codejam.info: Astro middleware on static pages](https://www.codejam.info/2026/02/astro-middleware-static-pages.html) — run_worker_first pattern for Cloudflare Workers

### Tertiary (LOW confidence)
- [npm @sanity/document-internationalization](https://www.npmjs.com/package/@sanity/document-internationalization) — version number (search result said v4.1.1 but unverified directly)
- WebSearch result on Astro.currentLocale SSG bug (GitHub #14228) — not directly verified via official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official Astro and Sanity docs, verified patterns
- Architecture: HIGH — patterns derived from official docs, existing codebase analyzed
- Pitfalls: MEDIUM-HIGH — mix of official issue tracker and official docs verification
- Font subsetting: HIGH — official fonttools docs + verified command syntax
- Cloudflare _redirects: HIGH — official Cloudflare Workers docs confirmed wildcard behavior

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (Sanity plugin moves fast — re-verify version if > 30 days old)

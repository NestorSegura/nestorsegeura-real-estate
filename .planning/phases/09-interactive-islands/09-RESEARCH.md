# Phase 9: Interactive Islands - Research

**Researched:** 2026-04-14
**Domain:** Astro islands, GSAP navbar, Cloudflare Worker endpoints, React hydration, scroll animations
**Confidence:** HIGH (codebase grounded, official docs verified)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Navbar — base implementation**
- Use the **osmo.supply "mega-nav directional hover" component** as the foundation
  - HTML structure, CSS classes (`mega-nav*`), and JS controller (`initMegaNavDirectionalHover`) as provided
  - GSAP-driven (already loaded globally in BaseLayout from Phase 8)
  - Osmo data-attributes drive the JS: `[data-menu-wrap]`, `[data-dropdown-toggle]`, `[data-nav-content]`, `[data-burger-toggle]`, `[data-menu-backdrop]`, etc.
- Component lives as an **Astro component** with a client-side `<script>` block for the controller (not a React island unless necessary for state)
- Keep stock osmo behavior: sticky at `top: 1.25em`, always visible (no hide-on-scroll, no shrink-on-scroll for Phase 9)

**Navbar — structure for Phase 9**
- **No mega-dropdowns in Phase 9** — strip dropdown toggles; keep only flat top-level links
- Flat links: **Blog**, **Analyse**, **Kontakt**
  - Blog → `/blog`
  - Analyse → `/analyse` (localized per locale per Phase 7 routing)
  - Kontakt → anchor to CTA section on homepage (or dedicated page — Claude's discretion)
- Preserve osmo's `data-dropdown-toggle` structural hooks / DOM layout so dropdowns can be re-enabled later without refactoring

**Locale switcher**
- **Small compact toggle in `mega-nav__bar-end`** (next to the CTA button)
- Segmented DE | EN | ES style control
- On click: navigate to equivalent page in target locale (using existing Phase 7 i18n routing)
- Behavior on untranslated pages: falls back to DE equivalent (consistent with Phase 7 `getPageWithFallback` pattern)

**Nav content source**
- **Sanity `siteSettings`** — extend schema with per-locale nav items
  - Nav label translations live in Sanity (editable from Studio) — NOT in `messages/{locale}.json`
  - CTA label + CTA URL (Calendly booking link) also on `siteSettings`
- Fetched at build time via existing `getSiteSettings` helper (Phase 8-01)

**CTA buttons**
- **One primary CTA only** in nav bar-end: "Termin buchen" / "Book appointment" / "Reservar cita"
- Links to Calendly URL from `siteSettings`
- Drop osmo's secondary "Log in" — no login on this marketing site

**Mobile behavior**
- Use osmo's stock mobile drawer (slide-over, GSAP-animated, burger → X transform)
- Burger visible ≤991px (osmo default breakpoint)
- Locale toggle visible inside mobile drawer too (decision: place in mobile `bar-end` which osmo's CSS already shows on mobile)

**Specific Implementation Notes**
- Color adjustment: osmo uses `#6840ff` purple; swap for site's Jibemates purple (hue 290 OKLCH, existing brand palette)
- Font adjustment: osmo uses Haffer Mono for panel labels; swap for site's Chivo (body) / Clash Display (headings)

### Claude's Discretion

- Exact Astro vs React split for the navbar (likely `.astro` with inline `<script>` since osmo is vanilla JS + GSAP)
- Kontakt link destination (anchor vs page)
- /analyse form UX details (validation, loading, error handling, score visualization)
- Scroll animation implementation (IO vs GSAP ScrollTrigger — flag decision to user during planning)
- Typography/color adjustments to osmo styles to match brand (Clash Display, Jibemates purple `OKLCH hue 290`)
- /analyse form UX (React island with locale + labels as props, NOT next-intl hooks; calls /api/analyze Cloudflare Worker returning JSON scores)

### Deferred Ideas (OUT OF SCOPE)

- **Mega-dropdown panels** — planned for future phase when Blogs + Locations use hyper-localization strategy
- **Hide-on-scroll / shrink-on-scroll nav behavior**
- **Über mich / About page** — not in current scope; link not added to nav
- **Second nav CTA (e.g., "Website analysieren")** — dropped; Analyse is already a top-level link
</user_constraints>

---

## Summary

Phase 9 delivers four interactive pieces: the osmo mega-nav (Astro + inline script, GSAP-driven), locale switcher, /analyse React island, and scroll reveal animations. All research is grounded in the actual codebase.

**Critical GSAP finding:** Despite the phase context saying "GSAP loaded globally in BaseLayout," this is factually incorrect as of the current codebase. BaseLayout only loads Lenis globally. GSAP + ScrollTrigger are dynamically injected by `StackingCards.astro` on pages that use that component, via a guarded CDN loader. BaseLayout's Lenis init checks `if (window.gsap && window.ScrollTrigger)` to conditionally sync, but GSAP is absent on pages without StackingCards. This means GSAP is NOT reliably available on the /analyse page or any page without StackingCards. The scroll animation recommendation must account for this.

**React islands finding:** React packages (`react`, `react-dom`, `react-is`) are in `package.json` but `@astrojs/react` integration is NOT in `astro.config.mjs`. Adding the React island for /analyse requires installing `@astrojs/react` and updating both `astro.config.mjs` and `tsconfig.json`.

**Cloudflare endpoint finding:** The project uses `output: 'static'` with `prerenderEnvironment: 'node'`. Adding `export const prerender = false` to a page/endpoint file opts that route into Cloudflare Worker on-demand rendering — the mechanism is built into the adapter.

**Primary recommendation:** Navbar as `.astro` + `<script is:inline>` (with GSAP loaded alongside it), locale switcher as inline JS using existing `localizeRoute()` helper, /analyse as React island (`client:visible`), API endpoint as `src/pages/api/analyze.ts` with `prerender = false`, scroll animations as pure Intersection Observer + CSS.

---

## INTR-01 Discrepancy: Roadmap vs CONTEXT.md

**Roadmap says:** `NavbarClient` as React island (`client:load`) with mobile drawer and locale switcher.

**CONTEXT.md says (LOCKED):** Navbar as Astro component with inline `<script>`. Not a React island.

**Resolution:** CONTEXT.md overrides the roadmap. The user explicitly decided on `.astro + inline script`. The planner MUST implement this as an Astro component, not a React island. The requirement INTR-01 label is reused but the implementation differs from what the roadmap described.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Astro | ^6.0.0 | Framework | Installed |
| @astrojs/cloudflare | ^13.0.0 | Cloudflare adapter | Installed |
| Lenis | 1.2.3 (CDN) | Smooth scroll — BaseLayout | Loaded globally |
| GSAP 3.12.5 | CDN | StackingCards only — NOT global | Page-specific |
| react | ^19.0.0 | React runtime | Installed, NOT wired |
| react-dom | ^19.0.0 | React DOM | Installed, NOT wired |
| TailwindCSS | ^4.0.0 (Vite plugin) | Styling | Installed |

### Must Add
| Library | Version | Purpose | Action Required |
|---------|---------|---------|-----------------|
| @astrojs/react | latest | React island hydration | `npm install @astrojs/react` |

**Installation:**
```bash
npm install @astrojs/react
```

Then add to `astro.config.mjs`:
```javascript
import react from '@astrojs/react';
// in integrations array:
react()
```

And add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 9 additions)

```
src/
├── components/
│   ├── nav/
│   │   └── MegaNav.astro          # osmo mega-nav, inline script, locale switcher
│   └── analyse/
│       └── AnalyseForm.tsx        # React island — form + score display
├── pages/
│   ├── analyse.astro              # DE — imports AnalyseForm, passes locale + labels as props
│   ├── api/
│   │   └── analyze.ts             # Cloudflare Worker — prerender=false, handles POST
│   ├── en/
│   │   └── analyze.astro          # EN — same pattern, locale='en'
│   └── es/
│       └── analizar.astro         # ES — same pattern, locale='es'
├── layouts/
│   └── BaseLayout.astro           # unchanged — slot receives MegaNav
└── sanity/schemas/documents/
    └── siteSettings.ts            # extend: navItems[], ctaLabel, ctaHref
```

### Pattern 1: Osmo Mega-Nav as Astro Component + Inline Script

**What:** A `.astro` file contains the full osmo HTML structure. A `<script is:inline>` block initializes the vanilla JS + GSAP controller after DOM ready. Props flow from Astro frontmatter.

**Key decision:** `is:inline` is required because:
1. The osmo controller references `window.gsap` (loaded via CDN, not npm)
2. The script must run after the osmo HTML is in the DOM
3. No npm imports needed — vanilla JS only

**GSAP loading for MegaNav:** Since GSAP is not globally loaded, MegaNav's `<script is:inline>` must load GSAP from CDN if not already present (same guard pattern StackingCards uses). However, on pages WITH StackingCards, GSAP loads from StackingCards first — the guard `if (window._cardsStackInitialized)` won't conflict since MegaNav uses its own guard. The safest pattern: MegaNav loads GSAP via the same CDN URLs if `!window.gsap`, then calls its init function.

```astro
---
// MegaNav.astro
interface Props {
  locale: 'de' | 'en' | 'es';
  navItems: Array<{ label: string; href: string }>;
  ctaLabel: string;
  ctaHref: string;
}
const { locale, navItems, ctaLabel, ctaHref } = Astro.props;
const locales = ['de', 'en', 'es'] as const;
---

<nav class="mega-nav" data-menu-wrap>
  <div class="mega-nav__bar">
    <div class="mega-nav__bar-start">
      <!-- logo -->
    </div>
    <div class="mega-nav__bar-nav">
      {navItems.map(item => (
        <a href={item.href} class="mega-nav__link">{item.label}</a>
      ))}
    </div>
    <div class="mega-nav__bar-end">
      <!-- Locale switcher -->
      <div class="locale-switcher">
        {locales.map(l => (
          <button class={`locale-btn${l === locale ? ' is-active' : ''}`} data-locale={l}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <!-- CTA -->
      <a href={ctaHref} class="mega-nav__cta">{ctaLabel}</a>
      <!-- Burger -->
      <button data-burger-toggle class="mega-nav__burger">
        <span></span>
      </button>
    </div>
  </div>
  <!-- Mobile drawer (osmo stock) -->
  <div data-nav-content class="mega-nav__mobile-drawer">
    <!-- mobile nav items + locale switcher -->
  </div>
  <div data-menu-backdrop class="mega-nav__backdrop"></div>
</nav>

<script is:inline>
(function() {
  if (window.__megaNavInit) return;
  window.__megaNavInit = true;

  function initNav() {
    // Locale switcher logic
    document.querySelectorAll('[data-locale]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetLocale = btn.getAttribute('data-locale');
        // Use window.__localizeRoute if available, else redirect
        window.location.href = window.__localizeRoute(targetLocale);
      });
    });

    // Mobile drawer — uses GSAP if available, fallback CSS class toggle
    if (window.gsap) {
      // osmo initMegaNavDirectionalHover() call
    } else {
      // CSS class toggle fallback for burger
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
</script>
```

### Pattern 2: Locale Switcher — Path Computation

**What:** Given the current page's pathname and the target locale, compute the equivalent URL.

**Existing infrastructure:**
- `src/i18n/routes.ts` exports `localizeRoute(routeKey, targetLocale)` — handles known routes (blog, analyse)
- `src/i18n/utils.ts` exports `DEFAULT_LOCALE = 'de'`, `LOCALES = ['de', 'en', 'es']`
- DE has no prefix (`/`), EN/ES have `/{locale}/` prefix

**Challenge:** The locale switcher runs client-side in an inline script, but `localizeRoute()` is a TypeScript module — it can't be directly imported in `is:inline`. 

**Solution options:**
1. **Serialize route map into data attribute** on MegaNav at build time: pass the full locale → href map as a `data-locale-urls='{"de":"/","en":"/en/","es":"/es/"}'` attribute computed in Astro frontmatter. The inline script reads this JSON.
2. **Inline the route logic** as a simple URL transform function in the script block.

**Recommended approach (Option 1):** Each page that renders MegaNav computes the locale URL map at build time (using `localizeRoute` server-side) and passes it as a prop. MegaNav renders these as `data-href` attributes on each locale button. The inline script does: `window.location.href = btn.getAttribute('data-href')`. Zero client-side routing logic needed.

```astro
<!-- In the page that renders MegaNav -->
---
import { localizeRoute } from '../i18n/routes';
const localeUrls = {
  de: localizeRoute('home', 'de'),  // or computed from current route
  en: localizeRoute('home', 'en'),
  es: localizeRoute('home', 'es'),
};
---
<MegaNav {locale} {navItems} {ctaLabel} {ctaHref} localeUrls={localeUrls} />
```

For **blog post pages**, the locale switcher must navigate to the equivalent translated post. The `getPostWithTranslations()` helper (already in `src/lib/sanity.ts`) returns `_translations: [{ language, slug }]`. The page computes the full locale URL map at build time and passes it to MegaNav.

For **generic pages without translations**, fall back to the DE homepage URL. This is consistent with the `getPageWithFallback` pattern.

### Pattern 3: Sanity siteSettings Extension

**Current schema fields:** `siteName`, `tagline`, `defaultCtaHref`, `seo`, `navigation[]` (label + href), `footer`.

**Current navigation limitation:** The `navigation[]` array has a single `label` (string) — no per-locale support.

**Required additions:**
```typescript
// In siteSettingsType fields array, replace or augment navigation:
defineField({
  name: 'navItems',
  title: 'Navigation Items',
  type: 'array',
  of: [{
    type: 'object',
    fields: [
      defineField({ name: 'key', type: 'string', title: 'Route Key' }),
      defineField({ name: 'labelDe', type: 'string', title: 'Label (DE)' }),
      defineField({ name: 'labelEn', type: 'string', title: 'Label (EN)' }),
      defineField({ name: 'labelEs', type: 'string', title: 'Label (ES)' }),
    ],
  }],
}),
defineField({ name: 'ctaLabel', type: 'object', fields: [
  defineField({ name: 'de', type: 'string' }),
  defineField({ name: 'en', type: 'string' }),
  defineField({ name: 'es', type: 'string' }),
]}),
defineField({ name: 'ctaHref', type: 'url', title: 'CTA URL (Calendly)' }),
```

**GROQ update for `getSiteSettings()`:**
```typescript
const query = `*[_type == "siteSettings"][0]{
  siteName, tagline, defaultCtaHref, ctaHref, ctaLabel,
  navItems[],
  seo { title, description, ogImage { asset->{ _ref, _id } } },
  footer { socialLinks[] }
}`;
```

**TypeScript type addition to `SiteSettings`:**
```typescript
export interface SiteSettings {
  // existing fields...
  navItems?: Array<{ key: string; labelDe?: string; labelEn?: string; labelEs?: string }>;
  ctaLabel?: { de?: string; en?: string; es?: string };
  ctaHref?: string;
}
```

### Pattern 4: React Island for /analyse

**What:** A React component (`AnalyseForm.tsx`) that manages form state (URL input), calls `/api/analyze`, and displays JSON scores. Hydrated with `client:visible`.

**Why `client:visible` not `client:load`:** The form is below the fold on most viewports. `client:visible` defers hydration until the user scrolls to see it, reducing initial JS parse time.

**Props pattern (locale + labels as props, NOT hooks):**
```tsx
// src/components/analyse/AnalyseForm.tsx
interface Props {
  locale: 'de' | 'en' | 'es';
  labels: {
    placeholder: string;
    submit: string;
    loading: string;
    resultTitle: string;
    errorMessage: string;
  };
}

export default function AnalyseForm({ locale, labels }: Props) {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ScoreResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, locale }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  // ...render
}
```

**In the Astro page:**
```astro
---
import AnalyseForm from '../../components/analyse/AnalyseForm';
const labels = {
  placeholder: t('analysis.placeholder'),
  submit: t('analysis.submit'),
  loading: t('analysis.loading'),
  resultTitle: t('analysis.resultTitle'),
  errorMessage: t('analysis.errorMessage'),
};
---
<AnalyseForm client:visible locale={locale} labels={labels} />
```

### Pattern 5: Cloudflare Worker API Endpoint

**File:** `src/pages/api/analyze.ts`

**Key:** `export const prerender = false` — opts this single route out of static prerendering into Cloudflare Worker on-demand mode. The rest of the site remains static. This works because `@astrojs/cloudflare` adapter handles the hybrid.

```typescript
// src/pages/api/analyze.ts
export const prerender = false;

export async function POST({ request }: { request: Request }): Promise<Response> {
  const body = await request.json();
  const { url, locale } = body as { url: string; locale: string };

  // V1: mock scores (LEAD-V2-01 = future PageSpeed integration)
  const scores = {
    performance: Math.floor(Math.random() * 40) + 50,
    seo: Math.floor(Math.random() * 30) + 60,
    accessibility: Math.floor(Math.random() * 25) + 65,
    bestPractices: Math.floor(Math.random() * 20) + 70,
  };

  return new Response(JSON.stringify({ url, scores }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

### Pattern 6: Scroll Animations

**Recommendation: Use Intersection Observer (pure IO), NOT GSAP ScrollTrigger.**

**Rationale:**
1. **GSAP is NOT reliably global.** BaseLayout does NOT load GSAP. Only `StackingCards.astro` loads it, only on pages that use that component. The homepage uses StackingCards, but /analyse and /blog do not. A scroll animation system requiring GSAP would need to load it separately on non-StackingCards pages — adding weight where it wasn't before.
2. **Roadmap success criteria says "no third-party animation library."** This was intentional.
3. **IO is simpler and zero-cost.** Add a `data-reveal` attribute to sections, one script block in BaseLayout (or a shared script), toggle a CSS class on intersection.
4. **Lenis is already running** — IO callbacks fire correctly during Lenis-smoothed scrolling because Lenis uses `requestAnimationFrame`, not intercepted scroll events.

**Implementation pattern:**
```javascript
// In BaseLayout.astro or a dedicated <script> in each page
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // fire once
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
);

document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
```

```css
/* In global.css */
[data-reveal] {
  opacity: 0;
  transform: translateY(1.5rem);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
[data-reveal].is-visible {
  opacity: 1;
  transform: none;
}
```

Usage in any section component:
```astro
<section data-reveal class="landing-hero">...</section>
```

**If user decides to use GSAP ScrollTrigger instead:** Load GSAP globally in BaseLayout (same CDN URLs StackingCards uses), remove the inline GSAP load from StackingCards, sync with Lenis in BaseLayout's script. This would simplify the GSAP loading architecture but adds ~100KB to every page.

### Anti-Patterns to Avoid

- **React island for the navbar:** Osmo's controller is vanilla JS + GSAP, uses DOM refs and data-attributes. A React wrapper would fight the imperative GSAP animations. Use `.astro + is:inline` as decided.
- **`define:vars` for passing locale data to inline scripts:** This forces `is:inline` automatically AND wraps values in a `let` block — fine for simple values, but awkward for objects. Prefer `data-` attributes on the element for complex payloads.
- **Importing TypeScript modules in `is:inline` scripts:** `is:inline` scripts cannot use `import`. Route maps must be serialized into HTML at build time via Astro props → `data-` attributes.
- **`client:load` for /analyse form:** It's below-the-fold content. Use `client:visible` to defer JS loading until the user scrolls to it.
- **GROQ with locale filter on siteSettings:** The existing `getSiteSettings()` correctly queries without locale filter (siteSettings is a singleton, no `language` field). Do NOT add `language == $locale` — it will return null.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route localization | Custom path transformer | Existing `localizeRoute()` in `src/i18n/routes.ts` | Already handles DE no-prefix, EN/ES prefix, ROUTE_SEGMENTS map |
| Translation fallback | Custom fallback logic | Existing `useTranslations(locale)` in `src/i18n/utils.ts` | Already falls back to DE, returns key on miss |
| Sanity data fetching | Direct `sanityClient.fetch` calls in nav | Extend `getSiteSettings()` in `src/lib/sanity.ts` | Centralized, typed, consistent pattern |
| GSAP loading guard | Custom loader | Same guard pattern as `StackingCards.astro` | Proven, prevents double-registration |
| Smooth scroll during IO | Manual RAF integration | Lenis already running — IO works correctly alongside it | No extra integration needed |

**Key insight:** This codebase has strong patterns established in Phases 6-8. Phase 9 should extend them, not reinvent them.

---

## Common Pitfalls

### Pitfall 1: Assuming GSAP is Globally Available
**What goes wrong:** Writing navbar or scroll animation code that calls `gsap.*` without a guard, crashing on pages that don't use StackingCards.
**Why it happens:** The phase context description says "GSAP loaded globally" — but BaseLayout only loads Lenis. GSAP is dynamically loaded by StackingCards only.
**How to avoid:** Always guard GSAP calls with `if (window.gsap)`. For MegaNav, load GSAP from CDN in the inline script if not already present. For scroll animations, use IO instead.
**Warning signs:** Uncaught `ReferenceError: gsap is not defined` on /analyse or /blog pages.

### Pitfall 2: Missing @astrojs/react Integration
**What goes wrong:** Creating `.tsx` React components and using `client:visible` produces a build error: "No matching renderer found."
**Why it happens:** React packages are installed but `@astrojs/react` integration is not registered in `astro.config.mjs`.
**How to avoid:** `npm install @astrojs/react`, add `react()` to integrations, add `"jsx": "react-jsx"` to tsconfig.
**Warning signs:** Build error mentioning "renderer" or "framework."

### Pitfall 3: prerender=false Missing from API Endpoint
**What goes wrong:** `src/pages/api/analyze.ts` without `export const prerender = false` will be statically generated at build time — it cannot handle POST requests, only GET at build time.
**Why it happens:** Default behavior with `output: 'static'` is to prerender everything.
**How to avoid:** First line after imports must be `export const prerender = false`.
**Warning signs:** Build succeeds but calling the endpoint returns 404 or a static file download.

### Pitfall 4: Locale Switcher Doing Client-Side URL Computation
**What goes wrong:** Computing locale URLs in the inline script requires re-implementing `localizeRoute()` logic in vanilla JS, risking drift from the TypeScript source of truth.
**Why it happens:** `is:inline` scripts cannot import TypeScript modules.
**How to avoid:** Compute all locale URLs at build time in the Astro component frontmatter. Serialize them as `data-href` attributes on locale buttons. Inline script just reads `button.dataset.href` and navigates.
**Warning signs:** EN/ES links produce wrong paths, especially for the /analyse route (de=`/analyse`, en=`/en/analyze`, es=`/es/analizar`).

### Pitfall 5: navItems Without Per-Locale Labels
**What goes wrong:** Current `siteSettings.navigation[]` has a single `label` string — no locale variants. Using it directly would show German labels in all locales.
**Why it happens:** The schema was built before i18n nav was needed.
**How to avoid:** Extend the schema with `labelDe`, `labelEn`, `labelEs` fields (or a nested locale object). Query all three in `getSiteSettings()`. Select the correct one in the Astro component based on `locale` prop.
**Warning signs:** English/Spanish pages show German nav labels.

### Pitfall 6: React Island Receiving Astro.url or i18n Hooks
**What goes wrong:** Trying to use `Astro.url`, `useTranslations`, or next-intl hooks inside the `.tsx` React component — these are server-side Astro APIs unavailable in client-side React.
**Why it happens:** INTR-02 requirement came from a Next.js codebase; the pattern doesn't translate.
**How to avoid:** All locale-specific strings are computed in the `.astro` page frontmatter using `useTranslations(locale)` and passed as the `labels` prop to the React island.
**Warning signs:** TypeScript errors about Astro global not being defined, or runtime errors in the browser.

---

## Code Examples

### Cloudflare Worker Endpoint with prerender=false
```typescript
// src/pages/api/analyze.ts
// Source: https://docs.astro.build/en/guides/on-demand-rendering/
export const prerender = false;

export async function POST({ request }: { request: Request }): Promise<Response> {
  const body = await request.json() as { url: string; locale: string };
  // V1: Return mock scores. Replace with PageSpeed API in LEAD-V2-01.
  return new Response(JSON.stringify({
    url: body.url,
    scores: { performance: 72, seo: 81, accessibility: 68, bestPractices: 75 },
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### Astro Page Passing Props to React Island
```astro
---
// src/pages/analyse.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import AnalyseForm from '../components/analyse/AnalyseForm';
import { useTranslations } from '../i18n/utils';

const locale = 'de' as const;
const t = useTranslations(locale);

const labels = {
  placeholder: t('analysis.placeholder'),
  submit: t('analysis.submit'),
  loading: t('analysis.loading'),
  resultTitle: t('analysis.resultTitle'),
};
---
<BaseLayout title={t('analysis.title')} locale={locale}>
  <main>
    <AnalyseForm client:visible locale={locale} labels={labels} />
  </main>
</BaseLayout>
```

### Locale URL Map Serialized at Build Time
```astro
---
// MegaNav.astro frontmatter
import { localizeRoute } from '../i18n/routes';

interface Props {
  locale: 'de' | 'en' | 'es';
  localeUrls: Record<'de' | 'en' | 'es', string>;
  // ... other props
}
const { locale, localeUrls } = Astro.props;
---
{(['de', 'en', 'es'] as const).map(l => (
  <button
    class={`locale-btn${l === locale ? ' is-active' : ''}`}
    data-href={localeUrls[l]}
  >
    {l.toUpperCase()}
  </button>
))}

<script is:inline>
document.querySelectorAll('.locale-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    window.location.href = btn.getAttribute('data-href');
  });
});
</script>
```

### Calling localizeRoute in the Page, Passing to Nav
```astro
---
// src/pages/analyse.astro
import { localizeRoute } from '../i18n/routes';
const localeUrls = {
  de: localizeRoute('analyse', 'de'),  // → '/analyse'
  en: localizeRoute('analyse', 'en'),  // → '/en/analyze'
  es: localizeRoute('analyse', 'es'),  // → '/es/analizar'
};
---
<MegaNav locale="de" {localeUrls} ... />
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| React SPA for interactivity | Astro islands — only what needs JS is hydrated | Minimal JS by default |
| Global scroll libraries | Intersection Observer API | Zero dependency, native browser API |
| next-intl hooks in components | Locale + labels as props | Works in any framework, not tied to Next.js |
| SSR everything | Static + `prerender=false` for specific routes | Fastest possible static delivery + Worker flexibility |

---

## Open Questions

1. **GSAP loading for MegaNav mobile drawer**
   - What we know: osmo's burger/drawer animation uses GSAP timeline. GSAP is not globally loaded.
   - What's unclear: Whether to (a) load GSAP in MegaNav's inline script if not present, (b) use a CSS transition fallback for the drawer, or (c) move GSAP to BaseLayout globally.
   - Recommendation: Load GSAP in MegaNav's inline script only if `!window.gsap`. Use the same CDN URLs and guard pattern as StackingCards. This keeps GSAP page-scoped — pages without StackingCards OR MegaNav pay zero cost.

2. **Kontakt link destination**
   - What we know: User said "anchor to CTA section on homepage (or dedicated page — Claude's discretion)."
   - What's unclear: No dedicated contact page exists. The homepage has a `LandingCtaFinal` block.
   - Recommendation: Use `/#kontakt` anchor (or `/#cta`) pointing to the homepage CTA section. Add `id="kontakt"` to the `LandingCtaFinal` component. This avoids needing a new page.

3. **Score result visualization for /analyse**
   - What we know: API returns `{ performance, seo, accessibility, bestPractices }` as 0-100 scores.
   - What's unclear: How to visualize — circular progress, horizontal bars, or simple numbers?
   - Recommendation: Simple score cards with large number + label + color band (green/yellow/red threshold). No charting library needed. Pure HTML + TailwindCSS.

4. **MegaNav in BaseLayout vs per-page**
   - What we know: BaseLayout has `<slot />` in `<body>` with no nav slot. All current pages wrap their content in BaseLayout.
   - What's unclear: Whether to add MegaNav to BaseLayout's slot (requiring all pages to include it) or add it to BaseLayout directly.
   - Recommendation: Add MegaNav directly inside BaseLayout, above `<slot />`. It needs locale + localeUrls + nav data — BaseLayout already receives `locale` prop and calls `getSiteSettings()`. This avoids duplicating nav in every page.

---

## Sources

### Primary (HIGH confidence)
- Codebase — `src/layouts/BaseLayout.astro` — GSAP loading behavior confirmed
- Codebase — `src/components/blocks/StackingCards.astro` — GSAP CDN load pattern
- Codebase — `src/lib/sanity.ts` — `getSiteSettings()`, `getPostWithTranslations()`, `SiteSettings` type
- Codebase — `src/i18n/routes.ts` — `localizeRoute()`, `ROUTE_SEGMENTS`
- Codebase — `src/i18n/utils.ts` — `useTranslations()`, locale types
- Codebase — `src/sanity/schemas/documents/siteSettings.ts` — current schema shape
- Codebase — `astro.config.mjs` — output: static, Cloudflare adapter, no React integration
- Codebase — `package.json` — react/react-dom installed, @astrojs/react NOT installed
- https://docs.astro.build/en/guides/on-demand-rendering/ — prerender=false hybrid mode
- https://docs.astro.build/en/guides/framework-components/ — client:* directives
- https://docs.astro.build/en/guides/integrations-guide/react/ — @astrojs/react setup
- https://docs.astro.build/en/guides/integrations-guide/cloudflare/ — prerenderEnvironment

### Secondary (MEDIUM confidence)
- https://docs.astro.build/en/guides/endpoints/ — Static vs server endpoint behavior
- https://docs.astro.build/en/reference/directives-reference/ — is:inline, define:vars behavior

### Tertiary (LOW confidence)
- WebSearch: GSAP + Astro inline script patterns — community confirms window.gsap access works; needs guard for CDN ordering

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against package.json and astro.config.mjs
- Architecture: HIGH — grounded in actual codebase file structure and existing patterns
- Pitfalls: HIGH — derived from direct code inspection (GSAP not global, React not wired)
- API endpoint pattern: HIGH — verified against official Astro docs

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (Astro 6 is stable; Cloudflare adapter patterns stable)

---
phase: 09-interactive-islands
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/components/nav/MegaNav.astro
  - src/layouts/BaseLayout.astro
  - src/styles/global.css
autonomous: false

must_haves:
  truths:
    - "Every page rendered through BaseLayout shows a sticky osmo-style mega-nav at the top"
    - "Nav links (Blog, Analyse, Kontakt) come from Sanity siteSettings.navItems and use the active locale's label"
    - "A single CTA button uses siteSettings.ctaLabel[locale] and links to siteSettings.ctaHref (Calendly)"
    - "A compact DE|EN|ES segmented control in mega-nav__bar-end navigates to the equivalent localized URL of the current page; untranslated routes fall back to DE"
    - "On viewports ≤991px the burger toggles the mobile drawer (osmo stock animation); locale switcher is reachable inside drawer"
    - "Brand restyling applied: Jibemates purple (OKLCH hue 290) replaces osmo's #6840ff; Clash Display + Chivo replace Haffer Mono"
    - "data-dropdown-toggle DOM hooks are preserved (panels stripped) so future mega-dropdowns can be re-enabled without rewrite"
  artifacts:
    - path: "src/components/nav/MegaNav.astro"
      provides: "Osmo mega-nav HTML + scoped CSS + inline GSAP-loading script"
      min_lines: 200
    - path: "src/layouts/BaseLayout.astro"
      provides: "Includes <MegaNav /> above <slot />, computes localeUrls via localizeRoute, passes locale + nav data props"
  key_links:
    - from: "src/components/nav/MegaNav.astro"
      to: "src/lib/sanity.ts getSiteSettings"
      via: "BaseLayout fetches siteSettings, passes navItems/ctaLabel/ctaHref as props"
      pattern: "navItems|ctaLabel|ctaHref"
    - from: "src/components/nav/MegaNav.astro"
      to: "src/i18n/routes.ts localizeRoute"
      via: "BaseLayout computes localeUrls map at build time, serializes as data-href on locale buttons"
      pattern: "data-href|data-locale"
---

<objective>
Build the osmo "mega-nav directional hover" navbar as an Astro component with an inline `<script>` controller. Wire it into BaseLayout so every page gets the nav. Implements INTR-01 (per CONTEXT.md override: .astro + script, NOT React island). Includes locale switcher, single Calendly CTA, mobile drawer, brand restyling, and preserved dropdown DOM hooks.

Purpose: The site's primary navigation shell — sticky, branded, locale-aware, mobile-friendly.
Output: MegaNav.astro component, BaseLayout integration, CSS additions for osmo classes restyled to brand.
</objective>

<execution_context>
@/Users/nestorsegura/.claude/get-shit-done/workflows/execute-plan.md
@/Users/nestorsegura/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/phases/09-interactive-islands/09-CONTEXT.md
@.planning/phases/09-interactive-islands/09-RESEARCH.md
@.planning/phases/09-interactive-islands/09-01-SUMMARY.md
@src/layouts/BaseLayout.astro
@src/i18n/routes.ts
@src/i18n/utils.ts
@src/lib/sanity.ts
@src/components/blocks/StackingCards.astro
@src/styles/global.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build MegaNav.astro with osmo HTML, brand styles, GSAP-guarded inline script</name>
  <files>
src/components/nav/MegaNav.astro
src/styles/global.css
  </files>
  <action>
Create `src/components/nav/MegaNav.astro` adapting osmo.supply's "mega-nav directional hover" component.

**Props interface:**
```ts
interface Props {
  locale: 'de' | 'en' | 'es';
  navItems: Array<{ href: string; label: string }>; // resolved label for current locale
  ctaLabel: string;
  ctaHref: string;
  localeUrls: Record<'de' | 'en' | 'es', string>;
}
```

**HTML structure (osmo classes preserved):**
- `<nav class="mega-nav" data-menu-wrap>` outer wrapper
- `.mega-nav__bar` with `__bar-start` (logo/brand text), `__bar-nav` (desktop links), `__bar-end` (locale switcher + CTA + burger)
- Desktop nav links: render with `data-dropdown-toggle` attribute on each link wrapper (KEEP this hook even though no panels — preserves future dropdown wiring per CONTEXT.md). No `<div data-nav-panel>` content yet.
- Locale switcher: 3 `<button class="locale-btn" data-href={localeUrls[l]} data-locale={l}>` items (segmented control). Active locale gets `is-active` class, `aria-current="true"`, and `disabled` attribute.
- CTA: `<a href={ctaHref} class="mega-nav__cta" target="_blank" rel="noopener">{ctaLabel}</a>`
- Burger: `<button data-burger-toggle class="mega-nav__burger" aria-label="Menu" aria-expanded="false"><span></span></button>`
- Mobile drawer: `<div data-nav-content class="mega-nav__drawer">` containing duplicated nav links + locale switcher + CTA
- Backdrop: `<div data-menu-backdrop class="mega-nav__backdrop"></div>`

**Scoped styles (in `<style>` block in component) OR add to `src/styles/global.css`** — use Astro scoped styles for `.mega-nav*` classes:
- Sticky `top: 1.25em`, z-index above content
- Replace osmo's `#6840ff` purple → use existing CSS var for Jibemates purple (OKLCH hue 290 — check global.css for the brand token name, e.g. `--color-primary-500` or similar)
- Font: headings/links use `var(--font-display)` (Clash Display); osmo's Haffer Mono usages → swap to `var(--font-body)` (Chivo)
- Mobile breakpoint: burger visible ≤991px, `__bar-nav` hidden ≤991px, drawer slides in from right
- Locale switcher: compact pill, `is-active` button shows filled brand purple, others ghost
- Honor `prefers-reduced-motion`: disable GSAP animations / use instant transitions

**Inline script (`<script>`, NOT `is:inline` — Astro will hoist & bundle, but it must run after DOM ready):**
Actually use `<script is:inline>` because we need to access window.gsap CDN-loaded global. Implement:

1. **GSAP guard-loader** (same pattern as `src/components/blocks/StackingCards.astro`): if `!window.gsap`, inject `<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js">` and wait for load. No ScrollTrigger needed for nav.
2. **`initMegaNav()`** — runs once `window.__megaNavInit` guard:
   - Locale switcher: each `[data-href]` button on click → `window.location.href = btn.dataset.href`
   - Burger toggle: clicks `[data-burger-toggle]` → toggle `is-open` class on `[data-menu-wrap]`, animate drawer with GSAP timeline (slideX 100% → 0, opacity backdrop 0 → 1). Toggle `aria-expanded`. ESC key closes. Click backdrop closes.
   - Directional hover (osmo's signature): for each `[data-dropdown-toggle]` link, compute hover-direction (left/right of previous element) and add `data-direction` attribute for CSS to consume. Even though panels are stripped, KEEP this logic — it's the structural hook to preserve for future dropdowns.
3. Init runs on `DOMContentLoaded` (or immediately if already loaded).

Reference osmo source structure faithfully — class names exactly match `mega-nav__*` so future restoration of mega-dropdowns is trivial.
  </action>
  <verify>
`astro build` succeeds. `astro dev` serves homepage with visible nav. Browser console: no errors. `window.gsap` is defined after first nav interaction.
  </verify>
  <done>
MegaNav.astro renders, locale buttons present with data-href, burger present, GSAP loads on demand, no console errors. Brand colors/fonts applied (visual confirm in next task).
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire MegaNav into BaseLayout with computed localeUrls + nav prop resolution</name>
  <files>src/layouts/BaseLayout.astro</files>
  <action>
Update `src/layouts/BaseLayout.astro`:

1. Add prop (or compute internally if `locale` already exists): the layout already receives `locale`. Add new optional prop `navLocaleUrls?: Record<'de'|'en'|'es', string>` for pages that need page-specific locale URLs (e.g., blog post translations). When omitted, default to `localizeRoute('home', l)` for each locale.

2. In frontmatter:
```ts
import MegaNav from '../components/nav/MegaNav.astro';
import { getSiteSettings } from '../lib/sanity';
import { localizeRoute } from '../i18n/routes';

const settings = await getSiteSettings();

// Resolve nav items for current locale (label fallback: labelDe)
const navItems = (settings?.navItems ?? []).map(item => ({
  href: localizeRoute(item.key, locale) ?? `/${item.key}`,
  label: item[`label${locale.toUpperCase()}` as 'labelDe'|'labelEn'|'labelEs'] ?? item.labelDe,
}));

const ctaLabel = settings?.ctaLabel?.[locale] ?? settings?.ctaLabel?.de ?? 'Termin buchen';
const ctaHref = settings?.ctaHref ?? '#';

const localeUrls = navLocaleUrls ?? {
  de: localizeRoute('home', 'de'),
  en: localizeRoute('home', 'en'),
  es: localizeRoute('home', 'es'),
};
```

3. In template, render `<MegaNav {locale} {navItems} {ctaLabel} {ctaHref} {localeUrls} />` immediately inside `<body>`, BEFORE `<slot />`.

4. Do NOT modify Lenis init or font preloads. Existing structure preserved.

5. For pages that have translation-specific URLs (blog posts), document via comment that they should pass `navLocaleUrls` prop with their computed map (deferred — not required for this plan, just enable the prop).

6. Add `id="kontakt"` recommendation as a comment near where homepages compose the LandingCtaFinal block — actual ID add can be a follow-up; for now, "Kontakt" link in nav can target `/#kontakt` via the navItems `key="kontakt"` resolved to `/#kontakt` (extend `localizeRoute` if needed, or hardcode the kontakt key fallback).

Ensure TypeScript compiles cleanly.
  </action>
  <verify>
`astro build` succeeds for all locales. `astro dev` then visit `/`, `/en/`, `/es/` — nav renders with locale-correct labels and CTA. Locale switcher buttons have correct hrefs in DOM (inspect `data-href`).
  </verify>
  <done>
BaseLayout renders MegaNav on every page, navItems resolved per locale, locale switcher links navigate to equivalent localized homepage by default.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Osmo mega-nav as .astro component, wired into BaseLayout, with brand restyling, locale switcher, mobile drawer, and preserved dropdown DOM hooks.</what-built>
  <how-to-verify>
1. `npm run dev`, open `http://localhost:4321/`
2. Desktop (>991px): nav sticky at top, brand purple visible, links Blog/Analyse/Kontakt visible with German labels, CTA "Termin buchen" links to Calendly URL.
3. Click DE/EN/ES switcher: navigates to `/`, `/en/`, `/es/`. Active locale button shows filled style and is disabled.
4. Resize to ≤991px: burger appears, links hide. Tap burger: drawer slides in (GSAP-animated). Locale switcher and CTA visible inside drawer. ESC or backdrop closes drawer.
5. DevTools: `window.gsap` defined after first interaction (or page load if drawer used). No console errors.
6. Visit `/en/` and `/es/`: nav labels translate (English/Spanish from siteSettings).
7. Inspect a nav link in DevTools: `data-dropdown-toggle` attribute present on the link wrapper (preserved hook).
8. Confirm visual brand: hue 290 purple (NOT osmo's #6840ff blue-purple), Clash Display headings, Chivo body.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `astro build` passes
- All 3 locale homepages render with MegaNav
- Locale switcher hrefs computed at build time via localizeRoute
- Mobile drawer animates open/close
- No console errors
- Brand tokens (purple, Clash Display, Chivo) applied
</verification>

<success_criteria>
INTR-01 satisfied (mega-nav as .astro + script per CONTEXT.md). Phase 9 success criteria #1 (mobile drawer) and #2 (locale switcher navigates to equivalent page) met for the homepage. Other pages inherit nav via BaseLayout.
</success_criteria>

<output>
After completion, create `.planning/phases/09-interactive-islands/09-02-SUMMARY.md`
</output>

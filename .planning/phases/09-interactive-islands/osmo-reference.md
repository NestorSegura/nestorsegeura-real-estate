# Osmo mega-nav directional hover — EXACT reference

User requirement: match this DOM/CSS/JS structure. Current MegaNav.astro diverged too much.

## Required DOM structure

```html
<nav data-menu-open="false" data-menu-wrap class="mega-nav">
  <div class="mega-nav__bar">
    <div class="mega-nav__container">
      <div class="mega-nav__bar-start">
        <a data-menu-logo href="/" class="mega-nav__bar-logo w-inline-block">
          <!-- brand SVG or text logo -->
        </a>
        <div data-nav-list data-mobile-nav class="mega-nav__bar-inner">
          <ul class="mega-nav__bar-list">
            <!-- Each nav link wrapped in <li data-nav-list-item>.
                 For flat links (Phase 9): use <a> not <button>. Omit is--dropdown.
                 KEEP data-dropdown-toggle="key" on the button form for deferred re-enable:
                 render BOTH shapes or just the <a> shape. Phase 9 decision: render <a>
                 but preserve ability to swap later. To keep DOM hook present without
                 wiring dropdowns, skip data-dropdown-toggle on the flat links. -->
            <li data-nav-list-item>
              <a href="/blog" class="mega-nav__bar-link w-inline-block">
                <span class="mega-nav__bar-link-label">Blog</span>
              </a>
            </li>
            <li data-nav-list-item>
              <a href="/analyse" class="mega-nav__bar-link w-inline-block">
                <span class="mega-nav__bar-link-label">Analyse</span>
              </a>
            </li>
            <li data-nav-list-item>
              <a href="/#kontakt" class="mega-nav__bar-link w-inline-block">
                <span class="mega-nav__bar-link-label">Kontakt</span>
              </a>
            </li>
          </ul>
          <ul data-nav-list-item class="mega-nav__bar-list is--actions">
            <!-- Actions: locale switcher + single CTA.
                 Replace osmo's Log in / Get Started with: locale switcher (3 buttons)
                 + single CTA "Termin buchen" → ctaHref. -->
            <li class="mega-nav__bar-action" data-locale-switcher>
              <div role="group" aria-label="Language" class="locale-switcher">
                <button data-href="/" data-locale="de" class="locale-btn is-active" disabled>DE</button>
                <button data-href="/en/" data-locale="en" class="locale-btn">EN</button>
                <button data-href="/es/" data-locale="es" class="locale-btn">ES</button>
              </div>
            </li>
            <li class="mega-nav__bar-action">
              <a href={ctaHref} class="mega-nav__bar-cta w-inline-block">
                <span class="mega-nav__bar-link-label">{ctaLabel}</span>
                <svg class="mega-nav__bar-link-icon"><!-- arrow --></svg>
              </a>
            </li>
          </ul>
        </div>
        <div class="mega-nav__bar-end">
          <button data-burger-toggle aria-label="toggle menu" aria-expanded="false" class="mega-nav__burger">
            <span data-burger-line="top" class="mega-nav__burger-line"></span>
            <span data-burger-line="mid" class="mega-nav__burger-line"></span>
            <span data-burger-line="bot" class="mega-nav__burger-line"></span>
          </button>
        </div>
        <div data-mobile-back class="mega-nav__back">
          <button aria-label="back to menu" class="mega-nav__bar-link is--back">
            <svg class="mega-nav__bar-link-icon"><!-- chevron left --></svg>
            <span class="mega-nav__bar-link-label">Back</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Dropdown wrapper MUST EXIST even with no panels in Phase 9.
       The controller querySelectors these elements and will error if missing.
       Leave the wrapper/container/bg empty (no panels inside). -->
  <div data-dropdown-wrapper class="mega-nav__dropdown-wrapper">
    <div data-dropdown-container class="mega-nav__dropdown-container">
      <div data-dropdown-bg class="mega-nav__dropdown-bg"></div>
      <!-- NO panels in Phase 9. Future: <div data-nav-content="products" ...> -->
    </div>
  </div>

  <div data-menu-backdrop class="mega-nav__backdrop"></div>
</nav>
```

## CSS — use osmo's stylesheet VERBATIM

Copy the full osmo CSS (both desktop and @media queries at 991px and 479px) into `<style is:global>` inside MegaNav.astro (or import as a .css file).

**Only change:**
- `#6840ff` → `oklch(0.58 0.20 290)` (Jibemates purple). Keep `#e4e0f5` burger bg (lightened osmo tint) OR swap to our purple-100.
- `#f7f5ff` panel colored bg → our purple-50 equivalent (only relevant if panels come back).
- `font-family: Haffer Mono` → `Chivo` (for .mega-nav__panel-label) / `Clash Display` for logo wordmark.
- Logo fill `#151313` and `#6840FF` in the SVG → brand equivalents. Or replace SVG with "NS" wordmark in Clash Display — user discretion.

Do NOT restructure class names, spacing, breakpoints, or layout. osmo CSS drives the visual fidelity.

## JS — use initMegaNavDirectionalHover VERBATIM

The full controller (DUR constants, state object, openDropdown, closeDropdown, switchPanel, hover intent handlers, mobile open/close/panel, burger animation, resize handler, event binding) is EXACTLY what the user wants. It must be inlined into `<script is:inline>` in MegaNav.astro.

**Handle the "no panels" case:**
The controller queries `[data-dropdown-toggle]` and `[data-nav-content]`. With no dropdown toggles on flat links and no panels rendered:
- `toggles = []` — hover intent handlers simply don't bind. OK.
- `panels = []` — no panel setup runs. OK.
- `dropWrapper`, `dropContainer`, `dropBg`, `backdrop` still exist (we rendered the wrapper). OK.

The controller should not throw. Test: open browser console, confirm no errors.

**Load GSAP lazily (same as StackingCards.astro pattern):** before calling `initMegaNavDirectionalHover()`, check `window.gsap`; if absent, inject `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js">` and run the init on its `load` event.

## Locale switcher — wire in

Osmo doesn't have a locale switcher natively. Add our compact DE|EN|ES segmented control inside the `is--actions` list's first `<li>`. Click handlers:

```js
document.querySelectorAll('.locale-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const href = btn.getAttribute('data-href');
    if (href && !btn.disabled) window.location.href = href;
  });
});
```

Pre-compute `data-href` at build time with `localizeRoute(currentPathname, targetLocale)` from src/i18n/routes.ts.

## Phase 9 flat links: Blog / Analyse / Kontakt

Sanity siteSettings.navItems is empty in Studio right now. Use a fallback default array in MegaNav props resolution (in BaseLayout.astro where getSiteSettings is called):

```ts
const fallbackNavItems = [
  { key: 'blog', href: localizeRoute('/blog', locale), label: t('nav.blog') ?? 'Blog' },
  { key: 'analyse', href: localizeRoute('/analyse', locale), label: t('nav.analyse') ?? 'Analyse' },
  { key: 'kontakt', href: `${localeUrls[locale]}#kontakt`, label: t('nav.kontakt') ?? 'Kontakt' },
];
const navItems = siteSettings.navItems?.length
  ? siteSettings.navItems.map(...)
  : fallbackNavItems;
```

So the nav renders with content even before Studio is populated.

## Summary of what must change from current implementation

1. Wrap links in `<ul class="mega-nav__bar-list">` with `<li data-nav-list-item>` children
2. Put the list + actions inside `<div data-nav-list data-mobile-nav class="mega-nav__bar-inner">` (osmo's exact structure)
3. Add `<div data-mobile-back class="mega-nav__back">` with back button (even if not used for dropdowns in Phase 9 — controller needs it)
4. Add `<div data-dropdown-wrapper>` → `<div data-dropdown-container>` → `<div data-dropdown-bg>` (empty, no panels) — REQUIRED by controller
5. Replace our custom CSS with osmo CSS verbatim (with purple/font swaps only)
6. Replace our simplified script with `initMegaNavDirectionalHover()` VERBATIM
7. Add fallback nav items (Blog/Analyse/Kontakt) for when Sanity is empty
8. Locale switcher goes inside `is--actions` list as a `<li>`

# Phase 9: Interactive Islands - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the interactive pieces of the site: navbar (mobile drawer, locale switcher), /analyse form + score display, /api/analyze Worker endpoint, and scroll animations. Static rendering and content blocks are already done (Phase 8).

Discussion focus: **navbar only**. /analyse form and scroll animations left to Claude's discretion within roadmap success criteria.

</domain>

<decisions>
## Implementation Decisions

### Navbar — base implementation
- Use the **osmo.supply "mega-nav directional hover" component** as the foundation
  - HTML structure, CSS classes (`mega-nav*`), and JS controller (`initMegaNavDirectionalHover`) as provided
  - GSAP-driven (already loaded globally in BaseLayout from Phase 8)
  - Osmo data-attributes drive the JS: `[data-menu-wrap]`, `[data-dropdown-toggle]`, `[data-nav-content]`, `[data-burger-toggle]`, `[data-menu-backdrop]`, etc.
- Component lives as an **Astro component** with a client-side `<script>` block for the controller (not a React island unless necessary for state)
- Keep stock osmo behavior: sticky at `top: 1.25em`, always visible (no hide-on-scroll, no shrink-on-scroll for Phase 9)

### Navbar — structure for Phase 9
- **No mega-dropdowns in Phase 9** — strip dropdown toggles; keep only flat top-level links
- Flat links: **Blog**, **Analyse**, **Kontakt**
  - Blog → `/blog`
  - Analyse → `/analyse` (localized per locale per Phase 7 routing)
  - Kontakt → anchor to CTA section on homepage (or dedicated page — Claude's discretion)
- Preserve osmo's `data-dropdown-toggle` structural hooks / DOM layout so dropdowns can be re-enabled later without refactoring (see Deferred Ideas)

### Locale switcher
- **Small compact toggle in `mega-nav__bar-end`** (next to the CTA button)
- Segmented DE | EN | ES style control
- On click: navigate to equivalent page in target locale (using existing Phase 7 i18n routing)
- Behavior on untranslated pages: falls back to DE equivalent (consistent with Phase 7 `getPageWithFallback` pattern)

### Nav content source
- **Sanity `siteSettings`** — extend schema with per-locale nav items
  - Nav label translations live in Sanity (editable from Studio) — NOT in `messages/{locale}.json`
  - CTA label + CTA URL (Calendly booking link) also on `siteSettings`
- Fetched at build time via existing `getSiteSettings` helper (Phase 8-01)

### CTA buttons
- **One primary CTA only** in nav bar-end: "Termin buchen" / "Book appointment" / "Reservar cita"
- Links to Calendly URL from `siteSettings`
- Drop osmo's secondary "Log in" — no login on this marketing site

### Mobile behavior
- Use osmo's stock mobile drawer (slide-over, GSAP-animated, burger → X transform)
- Burger visible ≤991px (osmo default breakpoint)
- Locale toggle visible inside mobile drawer too (decision: place in mobile `bar-end` which osmo's CSS already shows on mobile)

### /analyse form + scores
- Claude's Discretion — no specific preferences captured
- Must satisfy Phase 9 success criteria: React island receives locale + labels as props (not hooks), returns JSON scores from `/api/analyze` Worker

### Scroll animations
- Claude's Discretion — no specific preferences captured
- **Note:** Roadmap success criteria says "Intersection Observer (no third-party animation library)", but Phase 8 already added GSAP + Lenis globally. Researcher/planner should reconcile: either (a) use IO per roadmap and ignore GSAP for scroll reveals, or (b) update roadmap to allow the already-loaded GSAP since the cost is paid. Flag this tradeoff during planning.

### Claude's Discretion
- Exact Astro vs React split for the navbar (likely `.astro` with inline `<script>` since osmo is vanilla JS + GSAP)
- Kontakt link destination (anchor vs page)
- /analyse form UX details (validation, loading, error handling, score visualization)
- Scroll animation implementation (IO vs GSAP ScrollTrigger — flag decision to user during planning)
- Typography/color adjustments to osmo styles to match brand (Clash Display, Jibemates purple `OKLCH hue 290`)

</decisions>

<specifics>
## Specific Ideas

- Osmo mega-nav component from osmo.supply — use the HTML/CSS/JS exactly as provided (adapted to Astro + brand tokens)
- Color adjustment: osmo uses `#6840ff` purple; swap for site's Jibemates purple (hue 290 OKLCH, existing brand palette)
- Font adjustment: osmo uses Haffer Mono for panel labels; swap for site's Chivo (body) / Clash Display (headings)
- Future plan: re-enable osmo's mega-dropdown capability once hyper-localization strategy kicks in (see Deferred)

</specifics>

<deferred>
## Deferred Ideas

- **Mega-dropdown panels** — planned for future phase when Blogs + Locations use hyper-localization strategy (dropdowns would expose location-specific landing pages and blog categories). Preserve osmo's dropdown DOM hooks in Phase 9 implementation so this can be added without a rewrite.
- **Hide-on-scroll / shrink-on-scroll nav behavior** — considered but not Phase 9
- **Über mich / About page** — not in current scope; link not added to nav
- **Second nav CTA (e.g., "Website analysieren")** — dropped; Analyse is already a top-level link

</deferred>

---

*Phase: 09-interactive-islands*
*Context gathered: 2026-04-14*

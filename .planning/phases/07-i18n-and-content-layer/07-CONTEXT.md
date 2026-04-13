# Phase 7: i18n and Content Layer - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Astro's built-in i18n routes German content at `/` (no prefix), English at `/en`, Spanish at `/es`. UI strings load from `messages/de.json`, `messages/en.json`, `messages/es.json` via `src/i18n/utils.ts`. GROQ queries return locale-correct Sanity documents. `BaseLayout.astro` applies Clash Display (headings) and Chivo (body) globally.

Out of scope: Rendering the page-builder blocks (Phase 8), interactive islands like the navbar locale switcher component itself (Phase 9 — this phase only defines its contract), production deployment (Phase 10).

</domain>

<decisions>
## Implementation Decisions

### Locale switcher behavior
- **Same document, different locale:** Resolve via Sanity `document-internationalization` plugin's translation references. Switching from `/en/blog/successful-agency` → `/blog/erfolgreiche-immobilienagentur` (the localized slug, not just a prefix swap).
- **No target equivalent exists:** Redirect to the target locale's homepage (`/`, `/en`, `/es`) with a small notice in the target locale ("This article isn't available in English yet").
- **First-time visitors:** Honor the URL they requested. Do NOT auto-redirect based on `Accept-Language` header. (Better SEO, no surprises.)
- **Persistence:** Remember the user's last explicit choice in a cookie. Cookie only consulted when user lands on `/` (the default-locale root) — deeper URLs always win. Does not override an explicit URL.

### Missing translation fallback
- **Sanity document missing for locale:** Fall back to the German version and render a small banner in the target locale ("Übersetzung folgt" in DE → localized equivalents: "Translation coming soon" / "Traducción próximamente").
- **UI string key missing in `messages/{en,es}.json`:** Fall back to the value in `messages/de.json`. Log a build-time warning listing missing keys per locale.
- **Individual Page Builder block missing for locale:** Skip the block silently (do not render it, do not fall back to DE for a single block — would produce mixed-language pages).

### Font loading strategy
- **Hosting:** Self-host all font files in `/public/fonts/`. No CDN, no Google Fonts, no Fontshare runtime.
- **Subsetting:** Subset Clash Display (and Chivo if also oversized) to Latin + Latin Extended glyph ranges. Must cover: `ä ö ü ß` (German) and `ñ á é í ó ú ¡ ¿` (Spanish). One-time build step (fonttools/glyphhanger or pyftsubset) producing a reduced woff2.
- **`font-display`:** `swap` on all `@font-face` rules. Content never hidden; FOUT is acceptable trade-off for LCP.
- **Preload:** Emit `<link rel="preload" as="font" type="font/woff2" crossorigin>` for Clash Display and Chivo **regular weights** in `BaseLayout.astro` `<head>`. Other weights load on demand.

### URL shape / slug localization
- **Blog post slugs:** Localized per language. Each Sanity post has a slug field per locale. Example: DE `/blog/erfolgreiche-immobilienagentur`, EN `/en/blog/successful-real-estate-agency`, ES `/es/blog/agencia-inmobiliaria-exitosa`. Sanity `document-internationalization` plugin already configured — rely on its translation refs to link the three variants.
- **Route segments:** Translated per locale.
  - `/blog` (DE default) / `/en/blog` / `/es/blog`
  - `/analyse` (DE) / `/en/analyze` / `/es/analizar`
  - File-based Astro routes remain in English on disk; use i18n route-name mapping (messages or a dedicated `src/i18n/routes.ts`) so the emitted URLs are localized.
- **`/de/*` handling:** Redirect `301 → /*`. Enforces canonical root-no-prefix for the default locale, prevents duplicate-content SEO issues. (Claude's discretion — user said "you decide".)

### Claude's Discretion
- Exact copy and styling of the "translation pending" banner (respect tone of voice per locale)
- Cookie name, path, `SameSite` attributes, and expiration for locale persistence (suggest: `ns_locale`, 365 days, `SameSite=Lax`)
- Precise glyph subset range string for fonttools / pyftsubset (suggest: `U+0020-007F,U+00A0-00FF,U+0100-017F`)
- Structure of `src/i18n/utils.ts`: signature of `t(key)`, `localizeRoute(pathname, targetLocale)`, and any locale resolver helpers
- Shape of Sanity GROQ query helper that filters by `language` field (per @sanity/document-internationalization convention)
- Build-time warning format for missing i18n keys
- Whether `/de/*` redirect is implemented in Astro middleware, a Worker redirect, or `_routes.json` / `_headers` (adapter-level)

</decisions>

<specifics>
## Specific Ideas

- Sanity already uses `@sanity/document-internationalization` with `supportedLanguages: [es, de, en]` and `schemaTypes: ['page', 'post']` (see `src/sanity/config.ts:17-24`). Locale-filtered GROQ should use the `language` field populated by that plugin.
- Fonts already on disk: `public/fonts/ClashDisplay-Variable.woff2` (per git status). Chivo needs to be added; regular weight woff2 minimum.
- German is the primary market; any ambiguity in "default behavior" resolves in DE's favor (e.g. fallback language = DE, no-prefix = DE).

</specifics>

<deferred>
## Deferred Ideas

- The actual locale switcher UI component (dropdown, flags, etc.) — belongs to Phase 9 Interactive Islands (NavbarClient). Phase 7 defines the switcher's contract (URL resolution + cookie write) but not its rendering.
- Auto-translation pipeline for missing Sanity documents — out of scope; editorial workflow.
- Multi-region Cloudflare deploy / language routing via geo-IP — not requested.

</deferred>

---

*Phase: 07-i18n-and-content-layer*
*Context gathered: 2026-04-13*

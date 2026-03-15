# Stack Research

**Domain:** Professional multilingual landing page / lead generation site (real estate agency market, Hamburg DE)
**Researched:** 2026-03-15
**Confidence:** HIGH (core stack verified via npm registry and official docs; Stitch is LOW — see note)

---

## Decided Stack (User-Confirmed)

These are non-negotiable — already chosen by the project owner. Research validates versions and identifies exact package names.

| Technology | Confirmed Version | Purpose | Source |
|------------|-------------------|---------|--------|
| Next.js | 15.x (latest: 16.1.6) | React framework, App Router | npm registry |
| TypeScript | 5.x | Type safety | bundled with Next.js |
| Tailwind CSS | 4.x (latest: 4.2.1) | Utility-first styling | npm registry |
| Sanity.io | v3 (sanity pkg: 5.16.0) | Headless CMS | npm registry |
| next-intl | v4 (latest: 4.8.3) | i18n for en/es/de | npm registry |
| Hostinger VPS + PM2 | PM2 latest | Self-hosted deployment | deployment guides |
| Sanity CDN | — | Image delivery | Sanity platform |

**IMPORTANT — Next.js version note:** npm `next` latest is **16.1.6** as of research date. The project context says "Next.js 15" — start with `next@15` explicitly pinned unless the team has validated Next.js 16 breaking changes. The App Router patterns are stable across both.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| next | ^15.2.x | React framework + SSR | Stable LTS-equivalent; v16 just shipped so v15 is safer for greenfield without known migration cost |
| react | ^19.x | UI runtime | Required by Next.js 15+; concurrent rendering improves streaming SSR |
| react-dom | ^19.x | DOM rendering | Paired with React 19 |
| typescript | ^5.4.x | Type safety | Required by next-intl v4 (TypeScript 5 minimum) |
| tailwindcss | ^4.2.x | Styling | v4 is CSS-native, zero-config, works with shadcn/ui |
| @tailwindcss/postcss | ^4.2.x | PostCSS integration | Required for Tailwind v4 in Next.js; replaces tailwindcss-postcss |
| sanity | ^5.16.0 | CMS + Studio | v3 = current generation; embedded at /studio |
| next-sanity | ^12.1.1 | Next.js + Sanity bridge | Official toolkit; provides VisualEditing, SanityLive, GROQ client |
| @sanity/client | ^7.17.0 | Sanity API client | Peer dep of next-sanity; standalone client for GROQ queries |
| next-intl | ^4.8.3 | i18n routing + translations | v4 released March 2025; ESM-only, stricter types, 7% smaller bundle |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sanity/image-url | ^2.0.3 | Build Sanity CDN image URLs | Every Sanity image render; generates cropped/sized URLs |
| @portabletext/react | ^6.0.3 | Render Sanity Portable Text | Blog posts, rich text blocks in Page Builder |
| motion (formerly framer-motion) | ^12.x | UI animations | Scroll-triggered reveals, hero transitions, staggered lists |
| shadcn/ui | CLI-based (no version pin) | Accessible UI components | Forms, dialogs, buttons, navigation — copy-paste components, not a package |
| lucide-react | ^0.577.0 | Icon set | Used by shadcn/ui; 1000+ icons, tree-shakeable |
| zod | ^4.3.x | Schema validation | Form validation, GROQ response typing |
| react-hook-form | ^7.71.x | Form management | Contact form, lead magnet form; minimal re-renders |
| clsx | ^2.1.x | Conditional class names | Utility for combining Tailwind classes |
| tailwind-merge | ^3.5.x | Merge Tailwind classes safely | Prevent conflicting Tailwind utility classes |
| tw-animate-css | ^1.4.x | CSS animations for Tailwind v4 | Replaces `tailwindcss-animate` in v4 projects; used by shadcn/ui |
| next-sitemap | ^4.2.x | Sitemap + robots.txt generation | Required for multilingual SEO; generates /sitemap.xml per locale |
| @tailwindcss/typography | ^0.5.x | Prose styles for rich text | Blog post rendering via Portable Text |
| sharp | ^0.34.x | Server-side image processing | Required by Next.js Image Optimization in standalone mode |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| eslint + eslint-config-next | Linting | Included in create-next-app; App Router rules built-in |
| prettier | Code formatting | Add prettier-plugin-tailwindcss for class sorting |
| prettier-plugin-tailwindcss | Tailwind class sorting | Integrates with both v3 and v4 automatically |
| @sanity/vision | GROQ query explorer in Studio | Dev-only; invaluable for schema debugging |
| @next/bundle-analyzer | Bundle size analysis | Run before launch to identify bloat |
| typescript-eslint | TypeScript linting | Included via eslint-config-next |

---

## Installation

```bash
# Bootstrap
npx create-next-app@15 nestorsegura-real-estate \
  --typescript --tailwind --eslint --app --src-dir

# Core CMS + i18n
npm install next-sanity@^12 @sanity/client@^7 @sanity/image-url@^2 \
  @portabletext/react@^6 next-intl@^4

# Init Sanity Studio (run in project root)
npm create sanity@latest -- --project <YOUR_PROJECT_ID> --dataset production \
  --template clean --output-path studio

# Sanity Dev tooling
npm install -D @sanity/vision

# UI & animation
npm install motion@^12 lucide-react clsx tailwind-merge tw-animate-css

# Forms & validation
npm install react-hook-form zod

# SEO
npm install next-sitemap

# Typography (for blog)
npm install @tailwindcss/typography

# Image processing (required for standalone mode)
npm install sharp

# Dev tools
npm install -D prettier prettier-plugin-tailwindcss @next/bundle-analyzer
```

**shadcn/ui setup (after Tailwind v4 is configured):**
```bash
npx shadcn@latest init
# Select: TypeScript, App Router, Tailwind v4, src/ directory
# Then add components individually:
npx shadcn@latest add button card dialog form input label navigation-menu sheet
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| shadcn/ui + Tailwind | Radix UI directly | shadcn gives pre-styled accessible components without a runtime package dependency |
| shadcn/ui + Tailwind | Mantine / Chakra UI | These import full CSS bundles; Tailwind v4 gives better control and smaller output |
| motion (v12) | framer-motion | `motion` IS framer-motion rebranded; same package, same API; install `motion` not `framer-motion` |
| next-intl v4 | next-i18next | next-i18next is Pages Router only; next-intl has full App Router + Server Components support |
| next-intl v4 | Paraglide / Lingui | next-intl is the de facto standard for Next.js App Router i18n; best DX and docs |
| react-hook-form + zod | Formik | RHF is lighter, faster, and the current industry standard; Formik is in maintenance mode |
| next-sitemap | next.js built-in sitemap | next-sitemap provides better multilingual hreflang support required for en/es/de |
| @sanity/image-url | next-sanity-image | next-sanity-image v6 has reported peer dep conflicts with @sanity/client v7+; @sanity/image-url is the official approach |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| framer-motion (package name) | Rebranded; the `motion` package is the correct current name | `motion@^12` |
| tailwindcss-animate | Deprecated in Tailwind v4 ecosystem; shadcn/ui v4 docs explicitly replace it | `tw-animate-css` |
| tailwind.config.js | Tailwind v4 removes the JS config file; all config lives in CSS via `@theme` | `@theme` directives in globals.css |
| next-i18next | Pages Router only; no App Router support | `next-intl` |
| next-sanity-image | Peer dep conflicts with @sanity/client v7+; community maintained not Sanity-official | `@sanity/image-url` + custom `useNextSanityImage` hook pattern |
| Vercel AI SDK (for lead tools) | Overkill for landing page; adds unnecessary complexity | Server Actions + Resend/Nodemailer for contact forms |
| react-query / SWR | Unnecessary for mostly-static CMS content; adds client bundle weight | Server Components + ISR/revalidate for Sanity data |
| CMS alternatives (Contentful, Strapi) | User already decided Sanity; Sanity is correct choice for this use case | Sanity v3 |

---

## Google Labs Stitch — Clarification

**The milestone context references `https://github.com/nicholasgriffintn/stitch` — this URL returned 404 as of 2026-03-15.**

Research identified that "Google Labs Stitch" is:
- An **AI-powered UI design tool** at [stitch.withgoogle.com](https://stitch.withgoogle.com)
- Launched at Google I/O May 2025
- **NOT an npm-installable design system or component library**
- Exports HTML/CSS, Tailwind, and React/JSX code for use in projects
- The related [stitch-skills](https://github.com/google-labs-code/stitch-skills) repo provides AI agent skill plugins (v0.1, March 2026), not a production component library
- Explicitly labeled "not an officially supported Google product"

**Verdict: Do not use Google Stitch as a component library.** It is an AI design ideation tool. Use **shadcn/ui + Tailwind v4** as the component foundation.

**Confidence: LOW on the original Stitch reference** (URL is dead; the product is AI tooling, not an npm package). If the project owner has a specific private or renamed repo in mind, they need to clarify.

---

## Stack Patterns by Variant

**For Page Builder blocks (Sanity):**
- Define each page section as a Sanity `defineType({ type: 'object' })`
- Use an `array` field with named object types: HeroSection, FeatureGrid, TestimonialBlock, CTABanner
- Render in Next.js via a `switch` or component map: `const blockComponents = { heroSection: HeroSection, ... }`
- Do NOT use Portable Text as the page builder root — use it only inside block types for rich text fields

**For multilingual content (next-intl + Sanity):**
- Use next-intl for UI strings (navigation labels, button text, form labels)
- Use Sanity's localized string fields for CMS content (blog posts, page copy)
- Combine: Sanity handles content localization; next-intl handles interface localization
- Route structure: `/[locale]/...` via `src/app/[locale]/layout.tsx`

**For lead magnet tools (website analysis):**
- Use Next.js Server Actions for form submission
- Validate with Zod on server
- Email via Resend (simpler API than SendGrid for solo dev)
- Store leads in Sanity as a document type (no separate DB needed at this scale)

**For standalone deployment (PM2 on Hostinger):**
```js
// next.config.ts
export default {
  output: 'standalone',
  images: {
    remotePatterns: [{ hostname: 'cdn.sanity.io' }]
  }
}
```
```js
// ecosystem.config.js (PM2)
module.exports = {
  apps: [{
    name: 'nestorsegura-real-estate',
    script: '.next/standalone/server.js',
    env: { PORT: 3000, NODE_ENV: 'production' }
  }]
}
```
After build: `cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/`

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@15 | react@19, react-dom@19 | React 19 is required; not optional |
| next-intl@4 | TypeScript@5+, Next.js@14+ | ESM-only; TypeScript 5 minimum |
| sanity@5 | next-sanity@12, @sanity/client@7 | Do not mix sanity@3 references; current major is v5 of the `sanity` package (this IS Sanity Studio v3 gen) |
| tailwindcss@4 | @tailwindcss/postcss@4 | Requires postcss; NOT the standalone CLI for Next.js |
| shadcn/ui (latest) | tailwindcss@4, react@19 | Fully compatible; replaces tailwindcss-animate with tw-animate-css |
| motion@12 | react@19, Next.js@15 | Full React 19 + Server Component compatibility |
| tw-animate-css@1 | tailwindcss@4 | CSS-only; drop-in replacement for tailwindcss-animate |

**CRITICAL NOTE on Sanity package naming:** The npm package is `sanity` at version `5.x`. The product is called "Sanity Studio v3." When docs say "Sanity v3," they mean the third generation product — the npm package is v5. Do not install `sanity@3`.

---

## Sources

- npm registry (direct `npm info` queries, 2026-03-15) — package versions: next@16.1.6, next-sanity@12.1.1, next-intl@4.8.3, sanity@5.16.0, tailwindcss@4.2.1, motion@12.36.0 — **HIGH confidence**
- [next-sanity GitHub releases](https://github.com/sanity-io/next-sanity/releases) — v12.1.1 confirmed; v13 pre-release available — **HIGH confidence**
- [next-intl v4.0 release blog](https://next-intl.dev/blog/next-intl-4-0) — breaking changes, ESM-only, TypeScript 5 req — **HIGH confidence**
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — full Tailwind v4 + React 19 support confirmed — **HIGH confidence**
- [Sanity Visual Editing with Next.js App Router](https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router) — next-sanity v11+ required; current is v12 — **HIGH confidence**
- [Google Labs Stitch blog](https://developers.googleblog.com/stitch-a-new-way-to-design-uis/) — confirmed: AI design tool, not npm library — **HIGH confidence**
- [stitch-skills GitHub](https://github.com/google-labs-code/stitch-skills) — v0.1 agent skills, not a React component library — **HIGH confidence**
- WebSearch: Tailwind v4 + Next.js 15 setup, PM2 + Hostinger deployment patterns — **MEDIUM confidence** (multiple concordant sources)

---

*Stack research for: nestorsegura-real-estate (professional landing page, Hamburg real estate market)*
*Researched: 2026-03-15*

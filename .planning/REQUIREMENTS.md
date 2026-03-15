# Requirements: nestorsegura.com

**Defined:** 2026-03-15
**Core Value:** Real estate agents land on the site, immediately feel "this is for me," and book an appointment

## v1 Requirements

### Foundation (FOUN)

- [x] **FOUN-01**: Next.js 15 App Router project with TypeScript strict mode, Tailwind v4, shadcn/ui
- [x] **FOUN-02**: src/ directory structure matching specified layout (app/, components/, sanity/, i18n/)
- [x] **FOUN-03**: next-intl v4 configured with 3 locales (en default, es, de), localePrefix 'as-needed'
- [x] **FOUN-04**: Middleware excludes /studio and /api routes from i18n processing
- [x] **FOUN-05**: All translation keys exist in en.json, es.json, and de.json
- [x] **FOUN-06**: Environment variables configured (.env.local template with all required vars)

### Sanity CMS (CMS)

- [x] **CMS-01**: Sanity Studio v3 embedded and accessible at /studio
- [x] **CMS-02**: Page document schema with Page Builder pattern (title, slug, seo, sections array)
- [x] **CMS-03**: Post document schema (title, slug, publishedAt, mainImage, excerpt, body, author, seo)
- [x] **CMS-04**: SiteSettings singleton schema (siteName, tagline i18n, navigation i18n, footer social links)
- [x] **CMS-05**: Sanity TypeGen configured for type-safe schema access
- [x] **CMS-06**: Sanity client with separate CDN (read) and non-CDN (revalidation) configurations
- [x] **CMS-07**: Internationalized fields using @sanity/document-internationalization plugin

### Page Builder Blocks (BLCK)

- [x] **BLCK-01**: heroSection block — headline (i18n), subheadline (i18n), ctaLabel (i18n), ctaHref, backgroundImage
- [x] **BLCK-02**: featureStrip block — title (i18n), features[] with icon, title (i18n), description (i18n)
- [x] **BLCK-03**: testimonialsBlock — title (i18n), testimonials[] with quote (i18n), author, role, avatar
- [x] **BLCK-04**: ctaBlock — headline (i18n), subtext (i18n), ctaLabel (i18n), ctaHref, variant (primary|secondary)
- [x] **BLCK-05**: problemSolutionBlock — title (i18n), problems[] with number, headline (i18n), description (i18n)
- [x] **BLCK-06**: servicesBlock — title (i18n), services[] with number, name (i18n), description (i18n), features[] (i18n), ctaLabel (i18n), ctaHref
- [x] **BLCK-07**: faqBlock — title (i18n), faqs[] with question (i18n), answer (i18n) — accordion UI
- [x] **BLCK-08**: referencesBlock — title (i18n), references[] with name, description (i18n), image, url
- [x] **BLCK-09**: PageBuilder.tsx component mapping _type to React components with unknown-type warning
- [x] **BLCK-10**: All block components use minimal animations (performance-first, no heavy motion libraries)

### Landing Page (LAND)

- [x] **LAND-01**: Homepage renders via PageBuilder with all block types functional
- [x] **LAND-02**: German (/de) page is the primary conversion page with full content
- [x] **LAND-03**: English (/) and Spanish (/es) pages render with translated content
- [x] **LAND-04**: Single clear CTA per screen section (appointment booking links)
- [x] **LAND-05**: Mobile-first responsive design across all breakpoints
- [x] **LAND-06**: Navigation bar with logo, menu items, and CTA button

### Blog (BLOG)

- [x] **BLOG-01**: Blog listing page at /[locale]/blog showing published posts
- [x] **BLOG-02**: Blog post page at /[locale]/blog/[slug] with portable text rendering
- [x] **BLOG-03**: Blog posts pulled from Sanity with locale-aware content

### Lead Generation (LEAD)

- [x] **LEAD-01**: /api/analyze POST endpoint accepting { url: string } with input validation
- [x] **LEAD-02**: Stub response returning mock scores (performance, seo, mobile, conversion)
- [x] **LEAD-03**: CORS headers for same-origin only on analyze endpoint
- [x] **LEAD-04**: TODO comments indicating where PageSpeed Insights API call will go
- [x] **LEAD-05**: Appointment booking CTAs throughout the site linking to external calendar

### SEO (SEO)

- [x] **SEO-01**: generateMetadata() in every [locale]/page.tsx pulling from Sanity siteSettings
- [x] **SEO-02**: sitemap.ts covering all locales with hreflang (nestorsegura.com, /es, /de)
- [x] **SEO-03**: robots.ts blocking /studio from crawling
- [x] **SEO-04**: OpenGraph tags with Sanity image URLs
- [x] **SEO-05**: Person JSON-LD structured data on homepage (Nestor Segura, not Organization)

### Operations (OPS)

- [ ] **OPS-01**: /api/revalidate POST endpoint verifying SANITY_WEBHOOK_SECRET header
- [ ] **OPS-02**: Revalidation calls revalidatePath/revalidateTag for affected paths by document _type
- [ ] **OPS-03**: next.config.ts with output: 'standalone'
- [ ] **OPS-04**: deploy.sh script (build, copy public/ + .next/static to standalone, PM2 start)
- [ ] **OPS-05**: ecosystem.config.js for PM2 process management
- [ ] **OPS-06**: npm run dev starts without errors
- [ ] **OPS-07**: npm run build completes without TypeScript errors

## v2 Requirements

### Lead Generation (Paid)

- **LEAD-V2-01**: Actual PageSpeed Insights API integration for real website analysis
- **LEAD-V2-02**: Payment flow (€49) for detailed analysis report via Stripe
- **LEAD-V2-03**: Automated PDF report generation and delivery
- **LEAD-V2-04**: Additional analysis tools (local SEO audit, competitor analysis)

### Marketing

- **MKTG-V2-01**: Email capture with DSGVO-compliant consent
- **MKTG-V2-02**: Newsletter integration
- **MKTG-V2-03**: Email nurture sequence for leads

### Content

- **CONT-V2-01**: German-language blog content targeting Immobilienmakler keywords
- **CONT-V2-02**: Case studies with quantified client results

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication | Not needed for landing page / lead gen |
| Real-time chat widget | Anti-feature per research — goes unmaintained, hurts conversion |
| Portfolio/project gallery (separate page) | Anti-feature — scatters attention; references block on landing page is sufficient |
| Mobile app | Web only |
| Heavy animations / parallax | Performance-first approach; minimal CSS transitions only |
| Payment/checkout system | Deferred to v2 after free tool validates demand |
| Multiple competing CTAs per screen | Anti-pattern — single CTA per section |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| FOUN-05 | Phase 1 | Complete |
| FOUN-06 | Phase 1 | Complete |
| CMS-01 | Phase 2 | Complete |
| CMS-02 | Phase 2 | Complete |
| CMS-03 | Phase 2 | Complete |
| CMS-04 | Phase 2 | Complete |
| CMS-05 | Phase 2 | Complete |
| CMS-06 | Phase 2 | Complete |
| CMS-07 | Phase 2 | Complete |
| BLCK-01 | Phase 2 | Complete |
| BLCK-02 | Phase 2 | Complete |
| BLCK-03 | Phase 2 | Complete |
| BLCK-04 | Phase 2 | Complete |
| BLCK-05 | Phase 2 | Complete |
| BLCK-06 | Phase 2 | Complete |
| BLCK-07 | Phase 2 | Complete |
| BLCK-08 | Phase 2 | Complete |
| BLCK-09 | Phase 2 | Complete |
| BLCK-10 | Phase 2 | Complete |
| LAND-01 | Phase 3 | Pending |
| LAND-02 | Phase 3 | Pending |
| LAND-03 | Phase 3 | Pending |
| LAND-04 | Phase 3 | Pending |
| LAND-05 | Phase 3 | Pending |
| LAND-06 | Phase 3 | Pending |
| BLOG-01 | Phase 4 | Complete |
| BLOG-02 | Phase 4 | Complete |
| BLOG-03 | Phase 4 | Complete |
| LEAD-01 | Phase 3 | Pending |
| LEAD-02 | Phase 3 | Pending |
| LEAD-03 | Phase 3 | Pending |
| LEAD-04 | Phase 3 | Pending |
| LEAD-05 | Phase 3 | Pending |
| SEO-01 | Phase 4 | Complete |
| SEO-02 | Phase 4 | Complete |
| SEO-03 | Phase 4 | Complete |
| SEO-04 | Phase 4 | Complete |
| SEO-05 | Phase 4 | Complete |
| OPS-01 | Phase 5 | Pending |
| OPS-02 | Phase 5 | Pending |
| OPS-03 | Phase 5 | Pending |
| OPS-04 | Phase 5 | Pending |
| OPS-05 | Phase 5 | Pending |
| OPS-06 | Phase 5 | Pending |
| OPS-07 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 49 total
- Mapped to phases: 49
- Unmapped: 0

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after roadmap creation — all requirements mapped*

# nestorsegura.com

## What This Is

A professional landing page for Nestor Segura, a full-stack developer and digital agency owner based in Hamburg, Germany. The site positions Nestor as a digital strategy partner for real estate agencies (Immobilienmakler), helping them turn their websites into sales channels through SEO, conversion optimization, local SEO, and marketing automation. The primary goal is filling Nestor's appointment calendar with qualified leads from German real estate agencies.

## Current Milestone: v2.0 Astro Migration

**Goal:** Migrate the entire site from Next.js to Astro, deploy on Cloudflare Pages for zero-cost hosting with better performance and less complexity.

**Target features:**
- Full Astro rewrite with same content/functionality
- Cloudflare Pages deployment (free tier)
- All 3 locales preserved (de primary, en, es)
- Blog infrastructure rebuilt in Astro
- Website analysis tool (/analyse) as Cloudflare Function
- Same Sanity content model (schemas unchanged)
- Sanity Studio hosted externally (studio.nestorsegura.com)
- Switch fonts to Clash Display + Chivo

## Core Value

Real estate agents land on the site, immediately feel "this is for me," and book an appointment — the site must convert Immobilienmakler visitors into booked calls.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Modern, polished landing page that signals digital expertise to real estate agents
- [ ] Page Builder pattern with Sanity CMS — hero, features, testimonials, CTA blocks
- [ ] Trilingual support (en default, /es, /de) with next-intl — German is the money page
- [ ] Sanity Studio embedded at /studio for content management
- [ ] Blog infrastructure for German-language content marketing targeting Immobilienmakler
- [ ] Lead magnet tool stub: website URL analysis (free taste → paid report €49 → appointment)
- [ ] Appointment booking CTAs throughout (external calendar already configured)
- [ ] SEO: generateMetadata, sitemap, robots, OpenGraph, Person JSON-LD
- [ ] Revalidation webhook for Sanity content updates
- [ ] Hostinger VPS deployment config (standalone output, PM2, deploy script)

### Out of Scope

- Actual PageSpeed Insights API integration — stub only for v1
- Payment/checkout for the €49 analysis report — planned but not v1
- User authentication — not needed for landing page
- Newsletter integration — deferred
- Additional analysis tools beyond the URL stub — future tools will follow same pattern
- Mobile app — web only

## Context

- **Target market:** German real estate agencies (Immobilienmakler) looking to improve their digital presence
- **Positioning:** Not "SEO services" — Nestor is a digital strategy partner who helps agencies turn websites into sales channels. This includes SEO, conversion optimization, local SEO, and automation
- **Lead funnel:** Free tool (website analysis) → paid detailed report (€49) → booked appointment. Multiple tools planned over time, all around the services offered
- **Revenue model:** Service appointments (primary), paid analysis reports (secondary/lead qualification)
- **Content strategy:** German-language blog targeting real estate agent pain points and search terms
- **Locales priority:** German (target market) > English (developer portfolio) > Spanish (personal)
- **Design direction:** Use Google Labs Stitch design system for modern, polished aesthetic. Add SEO skill if available
- **External integrations:** Appointment calendar already configured, will be linked via CTAs

## Constraints

- **Tech stack:** Next.js 15 (App Router, TypeScript, Tailwind CSS 4), Sanity.io v3, next-intl — already decided
- **Hosting:** Hostinger VPS with Node.js, PM2 process manager — no serverless
- **i18n:** 3 locales (en, es, de), localePrefix 'as-needed', middleware must exclude /studio and /api
- **CMS:** All content editable through Sanity Studio — no hardcoded marketing copy
- **Domain:** nestorsegura.com
- **Image CDN:** Sanity CDN (cdn.sanity.io)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Sanity.io as CMS | Headless, embeddable studio, i18n support, image CDN included | — Pending |
| next-intl for i18n | Mature Next.js i18n library, supports App Router | — Pending |
| Page Builder pattern | Flexible content composition, each block = 1 Sanity schema + 1 React component | — Pending |
| Partner positioning, not service vendor | Builds trust with agency owners, higher perceived value | — Pending |
| Lead magnet tools as conversion strategy | Free taste → paid report → appointment funnel | — Pending |
| Hostinger VPS over Vercel | Existing infrastructure, cost control, full server access | — Pending |
| Google Labs Stitch for design system | Modern component aesthetics, professional look | — Pending |

---
*Last updated: 2026-04-11 after milestone v2.0 started*

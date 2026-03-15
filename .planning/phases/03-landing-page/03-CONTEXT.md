# Phase 3: Landing Page - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

German conversion page (`/de`) live with all eight block sections populated with real content, a navigation bar, working appointment CTAs linking to an external calendar, a website analysis section with a mock-score form, and a fully responsive layout down to 375px. English and Spanish locale pages also populated. The analysis tool stub returns mock scores — no real API integration, no payment processing.

</domain>

<decisions>
## Implementation Decisions

### Navigation bar
- Style reference: jibemates.de navigation — replicate its behavior and feel
- Slide-in drawer for mobile menu
- Language switcher: text-based labels (DE | EN | ES) in the navbar
- 5-6 section anchor links (e.g., Leistungen, Über mich, Referenzen, Analyse, FAQ, Kontakt)
- Sticky behavior and scroll animation per jibemates.de reference

### Website analysis form
- Landing page includes a dedicated section promoting the analysis tool
- The actual analysis form lives on its own page (e.g., `/de/analyse`)
- Results display inline on the tool page with animated score gauges
- Mock scores: Performance, SEO, Mobile, Conversion, and Positioning (niche + offer definition)
- No lead gate — overview scores shown freely (paid full report is deferred)

### CTA & booking flow
- Primary CTA copy: "Erstgespräch vereinbaren" (schedule initial consultation)
- Links to external calendar (Calendly/Cal.com) — opens in new tab
- Button style adapts to section: filled primary on dark sections, outlined on light sections
- Single CTA per section — no secondary "learn more" links, reduce decision fatigue

### Content & copy tone
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

</decisions>

<specifics>
## Specific Ideas

- Navigation should match jibemates.de behavior and feel — the primary nav reference
- "Erstgespräch vereinbaren" chosen deliberately — softer than "Termin buchen," implies no-commitment first conversation
- Analysis tool gets its own landing page, not just a form embedded in a section — the landing page section promotes/links to it
- Positioning score (niche + offer definition) is unique to Nestor's consulting offer — not a standard web audit metric
- Testimonials need to show real estate agent photos to build trust with the target audience

</specifics>

<deferred>
## Deferred Ideas

- **Stripe-gated full analysis report** — User wants overview scores free, but full detailed report behind a paid gate (Stripe integration). This is a new capability requiring payment processing and PDF/report generation — future phase.
- **Real PageSpeed API integration** — Phase 3 uses mock scores only. Real API integration is v2 scope (already noted in STATE.md blockers).

</deferred>

---

*Phase: 03-landing-page*
*Context gathered: 2026-03-15*

# Phase 2: CMS and Page Builder - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

All eight Page Builder block schemas exist in Sanity Studio, TypeGen produces typed interfaces, and each block renders a React component from live Sanity data dispatched through PageBuilder.tsx. This phase delivers the CMS content model and rendering pipeline — actual page content population happens in Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Block visual style
- **Hybrid layout:** Dark/purple immersive hero section, then clean light sections for the rest of the page
- **Bold & high-contrast** overall feel — strong jibemates purple, large headings, commands attention
- **Gradient transitions** between sections (smooth color flows, not hard breaks)
- **Staggered scroll reveals** — items within a block appear one-by-one with slight delays (CSS transitions only, no heavy motion libraries)
- **Hero:** SVG path animation (start → goal journey concept) using osmo.supply component, adapted to React
- **Reference sites:** Somerstone.com.au (dark premium authority), thetandemco.com (clean minimalist spacing), allinnhomeofstudents.com (bold energy + staggered animations), mycommuters.com (SVG path animation concept)
- **Typography:** Clean sans-serif, generous whitespace in light sections, word-by-word or character-level reveals via CSS

### Content editor experience
- **Solo editor** — power-user features fine, fewer guardrails needed
- **Live preview essential** — must see exactly how the page looks while editing blocks in Studio
- **Drag-and-drop block reordering** — full flexibility on section order within a page
- **Enabled/disabled toggle per block** — can turn blocks on/off without deleting them (useful for A/B testing or seasonal content)

### i18n content strategy
- **Document-per-locale model** — separate Sanity documents for DE, EN, ES using document-internationalization plugin
- **Spanish (es) is the source language** — content written in Spanish first, then translated to DE and EN
- **Translation status badges** in Studio showing which locales need translation updates
- **Frontend fallback:** If a translation doesn't exist, fall back to Spanish version rather than 404

### Block content fields
- **Content + style options** per block — text, images, links plus light/dark variant, background color, spacing size
- **Flexible item counts with limits** — min/max constraints per block type (e.g., 3-6 features) to keep design integrity
- **Hero variants selectable** — dropdown in Studio to pick hero style: SVG path animation, background image, text-only, etc.
- **CTA links: global default + per-block override** — one calendar URL in SiteSettings, any block can override with a custom link

### Claude's Discretion
- Exact min/max item limits per block type
- Loading skeleton design
- Error state handling
- Specific spacing values and typography scale
- Studio field grouping and organization
- Preview infrastructure implementation approach (Sanity's native preview vs custom)
- Exact gradient transition colors between sections

</decisions>

<specifics>
## Specific Ideas

- Somerstone.com.au — dark hero overlay with character-level text reveals, Lenis smooth scroll, premium real estate authority feel
- thetandemco.com — clean minimalist sections, generous whitespace, word-by-word GSAP reveals, muted neutrals
- allinnhomeofstudents.com — bold section energy, staggered animation delays, vibrant block-based layout
- mycommuters.com — SVG path animation showing a journey from start to goal
- osmo.supply — user has membership access to production-ready animated components (page transitions, cursor animations, sliders, navigation); adapt HTML/Webflow components to React
- "Start → Goal" SVG animation in hero to represent agent's journey from struggling to booked calendar

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-cms-and-page-builder*
*Context gathered: 2026-03-15*

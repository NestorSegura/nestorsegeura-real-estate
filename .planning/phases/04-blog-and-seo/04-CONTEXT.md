# Phase 4: Blog and SEO - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Blog routes functional (listing + detail), every page has correct SEO metadata from Sanity, sitemap covers all locales with hreflang, robots.txt blocks /studio and /api, and structured data (Person + ProfessionalService + Article) is in place. No new landing page blocks or conversion features — this is content infrastructure and discoverability.

</domain>

<decisions>
## Implementation Decisions

### Blog listing layout
- Featured + grid layout: latest post displayed hero-sized at top, remaining posts in a card grid below
- Cards show: featured image, title, excerpt, date, estimated reading time
- Featured post card includes a CTA or "read more" link

### Blog post page
- Article + sidebar layout: article content in a centered column on the left, sticky sidebar on the right
- Sidebar contains: auto-generated table of contents (from headings), appointment booking CTA block, author info card
- Show estimated reading time in post header alongside date

### Blog content structure
- Mixed content: tips/guides AND case studies, categorized separately
- Categories + tags: categories for content type (e.g., Tipps, Fallstudien), tags for topics (SEO, Webdesign, Conversion, etc.)
- Author field in CMS as a Sanity reference — supports multiple authors in the future
- Tone: professional expert — authoritative, data-driven (e.g., "Ihre Website verliert 40% der Anfragen weil...")

### SEO metadata
- Per-page SEO fields in Sanity: each Page and Post document has its own title and description fields
- siteSettings provides global fallback defaults

### Structured data (JSON-LD)
- Homepage: Person (Nestor Segura) + ProfessionalService (the agency)
- Blog posts: Article schema with headline, author, datePublished — enables rich results in Google

### OpenGraph images
- Claude's Discretion: pick the best approach balancing effort vs social sharing impact (featured image fallback, auto-generated, or static)

### Sitemap
- Include all locale pages AND all published blog posts dynamically
- Hreflang self-references for all three locales (de, en, es)
- Priority/changefreq: Claude's Discretion — pick what actually helps crawling

### Robots.txt
- Disallow /studio and /api
- Allow all other paths
- /analyse page is indexed (it's a lead magnet for "Website Analyse für Makler" searches)

### Claude's Discretion
- OpenGraph image generation approach
- Sitemap priority/changefreq values
- Typography and spacing details for blog reading experience
- Table of contents scroll behavior implementation
- Category/tag URL structure

</decisions>

<specifics>
## Specific Ideas

- /analyse page should be indexable as a lead magnet for search queries like "Website Analyse für Makler"
- Blog tone should position Nestor as an authority — data-driven, professional expert voice
- Sidebar CTA should match existing landing page appointment booking style (Cal.com link)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-blog-and-seo*
*Context gathered: 2026-03-15*

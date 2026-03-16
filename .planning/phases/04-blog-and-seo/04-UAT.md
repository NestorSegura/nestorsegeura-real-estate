---
status: complete
phase: 04-blog-and-seo
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-03-16T10:00:00Z
updated: 2026-03-16T10:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Sanity Studio — Author and Updated Post Schemas
expected: Run `npm run dev` and visit `/studio`. Author document type visible with name/bio/image fields. Post author field is a reference picker, category is a radio (tipps/fallstudien), tags array exists, and body supports image blocks.
result: pass

### 2. Sanity Studio — SiteSettings SEO Object
expected: In `/studio`, open the SiteSettings document. Below the existing fields (siteName, tagline, etc.), there should be an "SEO" object with sub-fields: title (string), description (text), and ogImage (image with hotspot).
result: pass

### 3. Blog Listing Page
expected: Create at least one Post in Sanity Studio (with title, slug, publishedAt date, mainImage, excerpt, and set language to "de"). Then visit `/blog`. You should see the post rendered as a featured hero card with: large image, title, excerpt, formatted date, estimated reading time (e.g., "3 Min. Lesezeit"), and a link to the full post.
result: pass (after fix)
reported: "Initially crashed with cdn.sanity.io not configured in next.config.js. Fixed by adding remotePatterns. Re-tested: works great."

### 4. Blog Post Detail Page
expected: Click into a blog post from the listing (or visit `/blog/[your-slug]`). You should see: the post title as h1, date + reading time + category badge, hero image, and the portable text body rendered with proper formatting. On the right side (desktop), a sticky sidebar should contain a Table of Contents (if headings exist), an appointment CTA card linking to Cal.com, and an author card (if author is set).
result: pass (after fix)
reported: "Blocked by image error initially. After fix, works great."

### 5. Blog Table of Contents
expected: On a blog post with h2/h3 headings in the body, the Table of Contents sidebar should list those headings. Clicking a heading link should smooth-scroll to that section. The currently visible heading should be highlighted in the TOC.
result: pass (after fix)
reported: "Blocked by image error initially. After fix, page renders correctly."

### 6. Homepage JSON-LD Structured Data
expected: Visit `/` and view page source (Ctrl+U / Cmd+U). Search for "application/ld+json". You should find two JSON-LD script blocks: one with `"@type": "Person"` (name: "Nestor Segura", Hamburg, DE) and one with `"@type": "ProfessionalService"`.
result: pass

### 7. Page Metadata from Sanity
expected: Visit `/` and inspect the `<head>`. The `<title>` and `<meta name="description">` should reflect values from Sanity siteSettings (if SEO fields are populated in Studio) or show fallback values. The layout title should use a template like "Page Title | nestorsegura.com".
result: pass

### 8. Sitemap with Hreflang
expected: Visit `/sitemap.xml` in the browser. It should contain entries for homepage, /analyse, /blog for all 3 locales. German URLs should have no `/de` prefix (e.g., `https://nestorsegura.com/blog`), English should be `/en/blog`, Spanish `/es/blog`. Each entry should have hreflang alternate links for all 3 locales. If blog posts exist, they should also appear.
result: pass
reported: "Initially appeared missing — browser XML viewer stripped xhtml:link tags when copying text. Viewing raw source (Cmd+U) confirmed full hreflang alternates present for all entries."

### 9. Robots.txt
expected: Visit `/robots.txt`. It should show `Disallow: /studio` and `Disallow: /api` (without trailing slashes), `Allow: /`, and a Sitemap reference to `https://nestorsegura.com/sitemap.xml`.
result: pass

### 10. Blog Locale Routing
expected: Visit `/en/blog` — should show the blog listing for English locale. Visit `/es/blog` — should show the blog listing for Spanish locale. Both should work without errors (may show empty state if no posts exist for those locales).
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0

## Gaps

[none — all issues resolved]
- Original gap 1 (cdn.sanity.io image error): Fixed by adding remotePatterns to next.config.ts (commit 9720cbd)
- Original gap 2 (sitemap hreflang): Was a false positive — hreflang was present, browser XML viewer stripped tags when copying

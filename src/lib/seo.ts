/**
 * SEO helper module for realestatestrategy.eu
 *
 * Provides:
 *   - buildMeta()               — title/description/ogImage/canonical chain
 *   - buildOrganizationSchema() — Organization JSON-LD (site-wide via BaseLayout)
 *   - buildPersonSchema()       — Person JSON-LD (homepages)
 *   - buildArticleSchema()      — Article JSON-LD (blog post detail pages)
 *   - buildBreadcrumbSchema()   — BreadcrumbList JSON-LD (posts + /analyse)
 *
 * Resolution chains (per 08-CONTEXT.md):
 *   title:       pageSeo.title → settings.seo.title → fallbackTitle
 *   description: pageSeo.description → settings.seo.description → fallbackDescription
 *   ogImage:     page's seo.ogImage (resolved via urlFor) →
 *                settings.seo.ogImage (resolved via urlFor) →
 *                `${siteUrl}/og-default.png`
 */

import { urlFor } from './imageUrl'
import type { SiteSettings, FullPost } from './sanity'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SITE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_SITE_URL) ??
  'https://realestatestrategy.eu'

/** Resolve a Sanity image ref to a full URL string, or return null. */
function resolveImageUrl(
  ref: { asset?: { _ref: string; _id?: string } } | null | undefined,
): string | null {
  if (!ref?.asset?._ref) return null
  return urlFor(ref as { asset: { _ref: string } })?.width(1200).format('webp').url() ?? null
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageSeo {
  title?: string | null
  description?: string | null
  ogImage?: { asset?: { _ref: string; _id?: string } } | null
}

export interface MetaResult {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: 'website' | 'article'
  canonical: string
}

export interface BreadcrumbItem {
  name: string
  url: string
}

// ---------------------------------------------------------------------------
// buildMeta
// ---------------------------------------------------------------------------

export function buildMeta({
  pageSeo,
  settings,
  fallbackTitle,
  fallbackDescription,
  ogImageRef,
  ogType = 'website',
  currentUrl,
}: {
  pageSeo?: PageSeo | null
  settings?: SiteSettings | null
  fallbackTitle?: string | null
  fallbackDescription?: string | null
  ogImageRef?: { asset?: { _ref: string; _id?: string } } | null
  ogType?: 'website' | 'article'
  currentUrl: string
}): MetaResult {
  const title =
    pageSeo?.title ??
    settings?.seo?.title ??
    fallbackTitle ??
    'realestatestrategy.eu'

  const description =
    pageSeo?.description ??
    settings?.seo?.description ??
    fallbackDescription ??
    ''

  const ogImage =
    resolveImageUrl(ogImageRef) ??
    resolveImageUrl(settings?.seo?.ogImage) ??
    `${SITE_URL}/og-default.png`

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogType,
    canonical: currentUrl,
  }
}

// ---------------------------------------------------------------------------
// buildOrganizationSchema
// ---------------------------------------------------------------------------

export function buildOrganizationSchema(
  settings: SiteSettings | null | undefined,
  siteUrl: string = SITE_URL,
): Record<string, unknown> {
  const logoUrl = resolveImageUrl(settings?.seo?.ogImage)

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.siteName ?? 'realestatestrategy.eu',
    url: siteUrl,
  }

  if (logoUrl) {
    schema.logo = logoUrl
  }

  return schema
}

// ---------------------------------------------------------------------------
// buildPersonSchema
// ---------------------------------------------------------------------------

export function buildPersonSchema(
  settings: SiteSettings | null | undefined,
): Record<string, unknown> {
  const imageUrl = resolveImageUrl(settings?.seo?.ogImage)

  // footer.socialLinks is typed as unknown[] — extract href strings safely
  const sameAs: string[] = []
  if (Array.isArray(settings?.footer?.socialLinks)) {
    for (const link of settings.footer.socialLinks as unknown[]) {
      if (link && typeof link === 'object' && 'href' in link) {
        const href = (link as Record<string, unknown>).href
        if (typeof href === 'string') sameAs.push(href)
      }
      // also handle url/link keys
      if (link && typeof link === 'object' && 'url' in link) {
        const url = (link as Record<string, unknown>).url
        if (typeof url === 'string') sameAs.push(url)
      }
    }
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: settings?.siteName ?? 'realestatestrategy.eu',
    jobTitle: settings?.tagline ?? undefined,
    sameAs,
  }

  if (imageUrl) {
    schema.image = imageUrl
  }

  return schema
}

// ---------------------------------------------------------------------------
// buildArticleSchema
// ---------------------------------------------------------------------------

export function buildArticleSchema({
  post,
  siteUrl = SITE_URL,
  postUrl,
}: {
  post: FullPost
  locale?: string
  siteUrl?: string
  postUrl: string
}): Record<string, unknown> {
  const imageUrl = post.mainImage ? resolveImageUrl(post.mainImage) : null

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title ?? '',
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.publishedAt ?? undefined,
    description: post.excerpt ?? undefined,
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'realestatestrategy.eu',
      url: siteUrl,
    },
  }

  if (post.author?.name) {
    schema.author = {
      '@type': 'Person',
      name: post.author.name,
    }
  }

  if (imageUrl) {
    schema.image = imageUrl
  }

  return schema
}

// ---------------------------------------------------------------------------
// buildBreadcrumbSchema
// ---------------------------------------------------------------------------

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

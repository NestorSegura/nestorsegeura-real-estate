import type { MetadataRoute } from 'next'
import { getPathname } from '@/i18n/navigation'
import { client } from '@/sanity/lib/client'
import { ALL_POSTS_FOR_SITEMAP_QUERY } from '@/sanity/lib/queries'

const BASE_URL = 'https://nestorsegura.com'
const LOCALES = ['de', 'en', 'es'] as const

type SupportedLocale = (typeof LOCALES)[number]

// Build hreflang alternates for a given path string
function buildAlternates(href: string) {
  const languages: Record<string, string> = {}
  for (const locale of LOCALES) {
    // getPathname respects localePrefix: 'as-needed' — de gets no prefix, en/es get prefix
    const pathname = getPathname({ locale, href })
    languages[locale] = BASE_URL + pathname
  }
  return { languages }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch(ALL_POSTS_FOR_SITEMAP_QUERY)

  // Static pages — one entry per locale
  const staticEntries: MetadataRoute.Sitemap = []

  const staticPages: Array<{
    href: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  }> = [
    { href: '/', priority: 1.0, changeFrequency: 'monthly' },
    { href: '/analyse', priority: 0.9, changeFrequency: 'monthly' },
    { href: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  ]

  for (const page of staticPages) {
    const alternates = buildAlternates(page.href)
    for (const locale of LOCALES) {
      const pathname = getPathname({ locale, href: page.href })
      staticEntries.push({
        url: BASE_URL + pathname,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates,
      })
    }
  }

  // Dynamic blog posts
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const postLocale: SupportedLocale =
      LOCALES.includes(post.language as SupportedLocale)
        ? (post.language as SupportedLocale)
        : 'de'
    const slugHref = `/blog/${post.slug!.current}`
    const pathname = getPathname({ locale: postLocale, href: slugHref })
    return {
      url: BASE_URL + pathname,
      lastModified: post._updatedAt ? new Date(post._updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: buildAlternates(slugHref),
    }
  })

  return [...staticEntries, ...postEntries]
}

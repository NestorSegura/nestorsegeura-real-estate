import { sanityFetch } from '@/sanity/lib/live'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import { NavbarClient } from './NavbarClient'

/**
 * Navbar server component — fetches siteSettings from Sanity and passes
 * navLinks, ctaHref, and siteName to the interactive NavbarClient.
 */
export async function Navbar() {
  const { data: siteSettings } = await sanityFetch({ query: SITE_SETTINGS_QUERY })

  const navLinks: { label: string; href: string; _key: string }[] =
    (siteSettings?.navigation ?? []).map((item) => ({
      label: item.label ?? '',
      href: item.href ?? '#',
      _key: item._key ?? item.href ?? item.label ?? Math.random().toString(),
    }))

  const ctaHref = siteSettings?.defaultCtaHref ?? '#kontakt'
  const siteName = siteSettings?.siteName ?? 'nestorsegura'

  return <NavbarClient navLinks={navLinks} ctaHref={ctaHref} siteName={siteName} />
}

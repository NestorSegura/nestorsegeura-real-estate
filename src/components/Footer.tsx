import { sanityFetch } from '@/sanity/lib/live'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import { FooterClient } from './FooterClient'

export async function Footer() {
  const { data } = await sanityFetch({ query: SITE_SETTINGS_QUERY })

  return (
    <FooterClient
      siteName={data?.siteName ?? 'nestorsegura.com'}
      tagline={data?.tagline ?? ''}
      ctaHref={data?.defaultCtaHref ?? '#'}
      socialLinks={data?.footer?.socialLinks ?? []}
      navLinks={data?.navigation ?? []}
    />
  )
}

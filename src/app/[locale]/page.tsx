import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { sanityFetch } from '@/sanity/lib/live'
import { PAGE_BY_SLUG_QUERY } from '@/sanity/lib/queries'
import { PageBuilder, type PageSection } from '@/blocks/PageBuilder'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  // Fetch homepage from Sanity — uses locale for language-aware query
  const { data: page } = await sanityFetch({
    query: PAGE_BY_SLUG_QUERY,
    params: { slug: 'home', language: locale },
  })

  if (!page) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-muted-foreground text-lg text-center">
          Kein Inhalt konfiguriert. Bitte erstelle eine &ldquo;home&rdquo;-Seite im Sanity Studio.
        </p>
      </main>
    )
  }

  return (
    <main>
      <PageBuilder sections={(page.sections ?? []) as PageSection[]} />
    </main>
  )
}

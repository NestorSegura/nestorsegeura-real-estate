import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { sanityFetch } from '@/sanity/lib/live'
import { ALL_POSTS_QUERY } from '@/sanity/lib/queries'
import { BlogListing } from '@/components/blog/BlogListing'

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const { data } = await sanityFetch({
    query: ALL_POSTS_QUERY,
    params: { language: locale },
  })

  const [featuredPost, ...restPosts] = data ?? []

  return (
    <main>
      <div className="border-b border-border bg-muted/30 py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Blog</h1>
          <p className="text-muted-foreground text-lg">
            Tipps, Fallstudien und Einblicke für Immobilienmakler
          </p>
        </div>
      </div>
      <BlogListing featuredPost={featuredPost} posts={restPosts} />
    </main>
  )
}

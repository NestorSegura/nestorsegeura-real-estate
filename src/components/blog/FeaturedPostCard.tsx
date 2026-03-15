import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { urlFor } from '@/sanity/lib/image'
import type { ALL_POSTS_QUERYResult } from '@/types/sanity.types'

type FeaturedPost = ALL_POSTS_QUERYResult[number]

interface FeaturedPostCardProps {
  post: FeaturedPost
}

export function FeaturedPostCard({ post }: FeaturedPostCardProps) {
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const readingTime = post.estimatedReadingTime
    ? `${post.estimatedReadingTime} Min. Lesezeit`
    : null

  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(675).url()
    : null

  return (
    <article className="group w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
      {imageUrl && (
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={post.title ?? ''}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
          {post.category && (
            <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              {post.category === 'tipps' ? 'Tipps' : 'Fallstudien'}
            </span>
          )}
        </div>
      )}
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          {publishedDate && <time dateTime={post.publishedAt ?? ''}>{publishedDate}</time>}
          {publishedDate && readingTime && <span aria-hidden="true">·</span>}
          {readingTime && <span>{readingTime}</span>}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <Link
          href={`/blog/${post.slug?.current}`}
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline transition-colors"
        >
          Weiterlesen
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

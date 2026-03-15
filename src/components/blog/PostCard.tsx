import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { urlFor } from '@/sanity/lib/image'
import type { ALL_POSTS_QUERYResult } from '@/types/sanity.types'

type Post = ALL_POSTS_QUERYResult[number]

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
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
    ? urlFor(post.mainImage).width(600).height(338).url()
    : null

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
      {imageUrl && (
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={post.title ?? ''}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {post.category && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              {post.category === 'tipps' ? 'Tipps' : 'Fallstudien'}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {publishedDate && <time dateTime={post.publishedAt ?? ''}>{publishedDate}</time>}
          {publishedDate && readingTime && <span aria-hidden="true">·</span>}
          {readingTime && <span>{readingTime}</span>}
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2 leading-snug line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1">
            {post.excerpt}
          </p>
        )}
        <Link
          href={`/blog/${post.slug?.current}`}
          className="mt-auto inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline transition-colors"
        >
          Weiterlesen
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

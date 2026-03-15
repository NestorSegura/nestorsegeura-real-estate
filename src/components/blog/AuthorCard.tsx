import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

interface AuthorCardProps {
  author: {
    name: string | null
    bio: string | null
    image: {
      asset?: {
        _ref: string
        _type: 'reference'
        _weak?: boolean
      }
      hotspot?: unknown
      crop?: unknown
      _type: 'image'
    } | null
  }
}

export function AuthorCard({ author }: AuthorCardProps) {
  const avatarUrl = author.image
    ? urlFor(author.image).width(64).height(64).url()
    : null

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Über den Autor
      </p>
      <div className="flex items-start gap-3">
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt={author.name ?? ''}
            width={64}
            height={64}
            className="rounded-full flex-shrink-0 object-cover"
          />
        )}
        <div className="min-w-0">
          {author.name && (
            <p className="font-semibold text-foreground text-sm leading-snug">{author.name}</p>
          )}
          {author.bio && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-4">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

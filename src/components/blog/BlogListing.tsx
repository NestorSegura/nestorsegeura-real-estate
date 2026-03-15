import { FeaturedPostCard } from './FeaturedPostCard'
import { PostCard } from './PostCard'
import type { ALL_POSTS_QUERYResult } from '@/types/sanity.types'

interface BlogListingProps {
  featuredPost: ALL_POSTS_QUERYResult[number] | undefined
  posts: ALL_POSTS_QUERYResult
}

export function BlogListing({ featuredPost, posts }: BlogListingProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      {/* Featured post hero */}
      {featuredPost && (
        <section className="mb-12">
          <FeaturedPostCard post={featuredPost} />
        </section>
      )}

      {/* Remaining posts grid */}
      {posts.length > 0 && (
        <section>
          {featuredPost && (
            <h2 className="text-xl font-semibold text-muted-foreground mb-6">
              Weitere Beiträge
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!featuredPost && posts.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground text-lg text-center">
            Noch keine Beiträge vorhanden.
          </p>
        </div>
      )}
    </div>
  )
}

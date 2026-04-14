/**
 * Sanity image URL builder.
 *
 * Wraps @sanity/image-url so consuming components can call urlFor(image)?.width(1280).format('webp').url()
 * without re-instantiating the builder each time.
 *
 * Returns null for falsy input — always guard the return value.
 *
 * Example:
 *   const src = urlFor(mainImage)?.width(1280).format('webp').url()
 *   srcset={[640, 960, 1280].map(w => `${urlFor(img)?.width(w).format('webp').url()} ${w}w`).join(', ')}
 */
import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from 'sanity:client'

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: { asset: { _ref: string } } | null | undefined) {
  if (!source) return null
  return builder.image(source)
}

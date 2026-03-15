// DEPRECATED: Use sanityFetch from ./live.ts instead. Kept as fallback.
import { client } from './client'

export async function sanityFetch<T>({
  query,
  params = {},
}: {
  query: string
  params?: Record<string, unknown>
}): Promise<T> {
  return client.fetch<T>(query, params)
}

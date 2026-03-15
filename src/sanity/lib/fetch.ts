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

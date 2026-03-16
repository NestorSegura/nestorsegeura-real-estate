import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

const KNOWN_TYPES = ['page', 'post', 'siteSettings', 'author'] as const

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{ _type: string }>(
      req,
      process.env.SANITY_WEBHOOK_SECRET,
    )

    if (!isValidSignature) {
      return new Response('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new Response('Bad request', { status: 400 })
    }

    revalidateTag(body._type)

    return NextResponse.json({
      revalidated: true,
      type: body._type,
      now: Date.now(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[revalidate] ${message}`)
    return new Response('Internal server error', { status: 500 })
  }
}

// Export KNOWN_TYPES for documentation purposes (not required at runtime)
export { KNOWN_TYPES }

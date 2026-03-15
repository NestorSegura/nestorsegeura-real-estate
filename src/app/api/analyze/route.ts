import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const BodySchema = z.object({
  url: z.string().url('URL muss eine gueltige Web-Adresse sein'),
})

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 422 }
    )
  }

  // TODO: Replace mock scores with PageSpeed Insights API call
  // TODO: Add Positioning score logic (niche + offer definition analysis)
  const performance = randomInt(55, 84)
  const seo = randomInt(60, 84)
  const mobile = randomInt(50, 84)
  const conversion = randomInt(40, 79)
  const positioning = randomInt(35, 79)

  return NextResponse.json({
    url: parsed.data.url,
    scores: {
      performance,
      seo,
      mobile,
      conversion,
      positioning,
    },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

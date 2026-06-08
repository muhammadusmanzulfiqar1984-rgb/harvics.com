import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isAuthorized(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key')
  const authHeader = req.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY
  if (!INTERNAL_API_KEY) return false
  return apiKey === INTERNAL_API_KEY || bearerToken === INTERNAL_API_KEY
}

const XAI_IMAGINE_URL = 'https://api.x.ai/v1/images/generations'
const IMAGINE_MODEL = 'grok-imagine-image-quality'

// Strict system visual modifier to maintain the 25-pillar brand aesthetic
const CORPORATE_STYLE_APPEND =
  ', premium corporate architectural aesthetic, shot on 35mm film, muted editorial colors, subtle deep burgundy and gold undertones, professional lighting, zero neon or oversaturated elements.'

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.XAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server configuration error: XAI_API_KEY is not set.' },
      { status: 500 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const basePrompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
  if (!basePrompt) {
    return NextResponse.json({ error: 'A text prompt is required to generate media.' }, { status: 400 })
  }

  // Combine user intent with the strict system style guide enforcement
  const structuredPrompt = `${basePrompt}${CORPORATE_STYLE_APPEND}`

  const payload: Record<string, unknown> = {
    model: IMAGINE_MODEL,
    prompt: structuredPrompt,
    n: typeof body?.n === 'number' ? Math.min(Math.max(body.n, 1), 10) : 1,
    aspect_ratio: typeof body?.aspect_ratio === 'string' ? body.aspect_ratio : '16:9',
    response_format: typeof body?.response_format === 'string' ? body.response_format : 'url',
  }

  try {
    const upstream = await fetch(XAI_IMAGINE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!upstream.ok) {
      const details = await upstream.text()
      return NextResponse.json(
        {
          error: 'xAI Imagine generation failed.',
          status: upstream.status,
          details,
        },
        { status: upstream.status }
      )
    }

    const data = await upstream.json()
    return NextResponse.json({ success: true, data: data?.data || [] }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal media gateway failure.', details: error?.message || error },
      { status: 500 }
    )
  }
}

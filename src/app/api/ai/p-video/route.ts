/**
 * POST /api/ai/p-video
 *
 * Generates video via Cloudflare Workers AI model `pruna/p-video`
 * using the existing `AI` binding in wrangler.jsonc.
 *
 * Auth: Authorization: Bearer <INTERNAL_API_KEY | PVIDEO_API_KEY>
 * Defaults to draft:true @720p to stretch free Neurons / startup credits.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getWorkersAI } from '@/lib/cloudflare/workersAi'

export const runtime = 'nodejs'
/** Video gen can take tens of seconds on Workers AI. */
export const maxDuration = 120
export const dynamic = 'force-dynamic'

const MODEL = 'pruna/p-video'

const ASPECT = new Set(['16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '1:1'])
const RES = new Set(['720p', '1080p'])

type Body = {
  prompt?: string
  image?: string
  audio?: string
  duration?: number
  resolution?: string
  aspect_ratio?: string
  draft?: boolean
  save_audio?: boolean
  prompt_upsampling?: boolean
  seed?: number
  last_frame_image?: string
}

function authorized(req: NextRequest): boolean {
  const expected = (
    process.env.PVIDEO_API_KEY ||
    process.env.INTERNAL_API_KEY ||
    ''
  ).trim()
  // Fail closed in production if no key configured.
  if (!expected) {
    if (process.env.NODE_ENV !== 'production') return true
    return false
  }
  const header = req.headers.get('authorization') || ''
  const token = header.replace(/^Bearer\s+/i, '').trim()
  const alt = (req.headers.get('x-pvideo-key') || '').trim()
  return token === expected || alt === expected
}

function pickVideoUrl(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null
  const r = result as Record<string, unknown>
  for (const key of ['video_url', 'url', 'uri', 'video']) {
    const v = r[key]
    if (typeof v === 'string' && v.startsWith('http')) return v
  }
  // Some adapters nest under .result / .output
  for (const nest of ['result', 'output', 'data']) {
    const inner = r[nest]
    if (inner && typeof inner === 'object') {
      const found = pickVideoUrl(inner)
      if (found) return found
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized. Set PVIDEO_API_KEY or INTERNAL_API_KEY and send Bearer token.' },
      { status: 401 },
    )
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const prompt = (body.prompt || '').trim()
  if (!prompt && !body.image) {
    return NextResponse.json(
      { error: 'Provide prompt (text-to-video) and/or image (image-to-video).' },
      { status: 400 },
    )
  }

  const duration = Math.min(20, Math.max(1, Number(body.duration) || 5))
  const resolution = RES.has(body.resolution || '') ? body.resolution! : '720p'
  const aspect_ratio = ASPECT.has(body.aspect_ratio || '') ? body.aspect_ratio! : '16:9'
  // Default draft=true — cheapest Neurons burn for previews.
  const draft = body.draft !== false

  const input: Record<string, unknown> = {
    duration,
    resolution,
    aspect_ratio,
    draft,
    save_audio: body.save_audio !== false,
    prompt_upsampling: body.prompt_upsampling !== false,
  }
  if (prompt) input.prompt = prompt
  if (body.image) input.image = body.image
  if (body.audio) input.audio = body.audio
  if (body.last_frame_image) input.last_frame_image = body.last_frame_image
  if (typeof body.seed === 'number') input.seed = body.seed

  const ai = await getWorkersAI()
  if (!ai) {
    return NextResponse.json(
      {
        error:
          'Workers AI binding not available. This route runs on the Cloudflare Worker (harvics-com) after deploy. For local tests use: node scripts/p-video-generate.mjs',
        model: MODEL,
        hint: 'wrangler.jsonc already has ai.binding = "AI"',
      },
      { status: 503 },
    )
  }

  try {
    const started = Date.now()
    const result = await ai.run(MODEL, input)
    const videoUrl = pickVideoUrl(result)

    return NextResponse.json({
      ok: true,
      model: MODEL,
      draft,
      resolution,
      duration,
      aspect_ratio,
      videoUrl,
      ms: Date.now() - started,
      raw: result,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { ok: false, error: message, model: MODEL },
      { status: 502 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    model: MODEL,
    binding: 'AI (wrangler.jsonc)',
    usage: 'POST with JSON { prompt, duration?, resolution?, aspect_ratio?, draft? }',
    auth: 'Authorization: Bearer <PVIDEO_API_KEY|INTERNAL_API_KEY>',
    tip: 'Keep draft:true and 720p to use free Neurons / startup credits cheaply.',
  })
}

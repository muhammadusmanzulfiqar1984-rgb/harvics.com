/**
 * POST /api/ai/workers
 * GET  /api/ai/workers  — health / usage
 *
 * Cloudflare Workers AI via env.AI (wrangler.jsonc ai.binding = "AI")
 * Example model: @cf/meta/llama-3.1-8b-instruct
 */

import { NextRequest, NextResponse } from 'next/server'
import { getWorkersAI } from '@/lib/cloudflare/workersAi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct'

function authorized(req: NextRequest): boolean {
  const expected = (
    process.env.PVIDEO_API_KEY ||
    process.env.INTERNAL_API_KEY ||
    ''
  ).trim()
  if (!expected) {
    if (process.env.NODE_ENV !== 'production') return true
    return false
  }
  const header = req.headers.get('authorization') || ''
  const token = header.replace(/^Bearer\s+/i, '').trim()
  const alt = (req.headers.get('x-ai-key') || '').trim()
  return token === expected || alt === expected
}

export async function GET() {
  return NextResponse.json({
    binding: 'AI',
    defaultModel: DEFAULT_MODEL,
    usage: 'POST { "prompt": "What is Cloudflare?" } or { "messages": [...] }',
    auth: 'Authorization: Bearer <INTERNAL_API_KEY|PVIDEO_API_KEY>',
    also: 'POST /api/ai/p-video for pruna/p-video',
  })
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    prompt?: string
    messages?: { role: string; content: string }[]
    model?: string
    max_tokens?: number
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const model = (body.model || DEFAULT_MODEL).trim()
  const prompt = (body.prompt || '').trim()
  const messages = body.messages

  if (!prompt && (!messages || messages.length === 0)) {
    return NextResponse.json(
      { error: 'Provide prompt or messages' },
      { status: 400 },
    )
  }

  const ai = await getWorkersAI()
  if (!ai) {
    return NextResponse.json(
      {
        error:
          'Workers AI binding not available locally. Deployed Worker has env.AI — call https://www.harvics.com/api/ai/workers',
      },
      { status: 503 },
    )
  }

  try {
    const input: Record<string, unknown> = messages?.length
      ? { messages, max_tokens: body.max_tokens ?? 512 }
      : { prompt, max_tokens: body.max_tokens ?? 512 }

    const result = await ai.run(model, input)
    return NextResponse.json({ ok: true, model, result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: message, model }, { status: 502 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const XAI_CHAT_COMPLETIONS_URL = 'https://api.x.ai/v1/chat/completions'
const DEFAULT_MODEL = 'grok-4.3'
const HARVICS_SYSTEM_PROMPT =
  'You are the Harvics Sovereign Trade Infrastructure Copilot. You must only return responses tailored for an Alabaster Cream canvas platform (#F5F0E8). All tabular data structures you return must match the standard \'harvics-table\' layout schema cleanly.'

type AllowedRole = 'user' | 'assistant' | 'tool'

interface IncomingMessage {
  role?: string
  content?: unknown
}

function sanitizeMessages(input: unknown): Array<{ role: AllowedRole; content: string }> {
  if (!Array.isArray(input)) return []

  return input
    .filter((m): m is IncomingMessage => !!m && typeof m === 'object')
    .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'tool')
    .filter((m) => typeof m.content === 'string' && m.content.trim().length > 0)
    .map((m) => ({ role: m.role as AllowedRole, content: (m.content as string).trim() }))
}

export async function POST(request: NextRequest) {
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

  const userMessages = sanitizeMessages(body?.messages)
  if (userMessages.length === 0) {
    return NextResponse.json(
      { error: 'messages must include at least one user/assistant/tool message.' },
      { status: 400 }
    )
  }

  const payload: Record<string, unknown> = {
    model: typeof body?.model === 'string' && body.model.trim() ? body.model.trim() : DEFAULT_MODEL,
    stream: true,
    messages: [
      { role: 'system', content: HARVICS_SYSTEM_PROMPT },
      ...userMessages,
    ],
  }

  if (typeof body?.temperature === 'number') payload.temperature = body.temperature
  if (typeof body?.top_p === 'number') payload.top_p = body.top_p
  if (typeof body?.max_tokens === 'number') payload.max_tokens = body.max_tokens

  const upstream = await fetch(XAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
  })

  if (!upstream.ok) {
    const details = await upstream.text()
    return NextResponse.json(
      {
        error: 'xAI request failed.',
        status: upstream.status,
        details,
      },
      { status: upstream.status }
    )
  }

  if (!upstream.body) {
    return NextResponse.json(
      { error: 'xAI response did not include a readable stream.' },
      { status: 502 }
    )
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

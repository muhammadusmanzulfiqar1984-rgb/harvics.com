import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Fin Data Connector — voice handoff for Intercom Fin.
 *
 * Configure in Intercom → Settings → Integrations → Data connectors:
 *   POST https://www.harvics.com/api/intercom/fin/voice
 *   Header: Authorization: Bearer <FIN_VOICE_SECRET>
 *
 * Fin can call this when a visitor asks to talk / call / voice chat.
 * The website listens for `harvics:fin-start-voice` (Talk button) and starts Vapi.
 * STT on the voice path is Deepgram (configure in Vapi assistant + our /api/ai/transcribe).
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.FIN_VOICE_SECRET || process.env.INTERCOM_ACCESS_TOKEN || ''
  if (!secret) return false
  const header = req.headers.get('authorization') || ''
  const bearer = header.replace(/^Bearer\s+/i, '').trim()
  const alt = req.headers.get('x-fin-voice-secret') || ''
  return bearer === secret || alt === secret
}

export async function GET() {
  const deepgram = Boolean(process.env.DEEPGRAM_API_KEY)
  const vapi = Boolean(
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY && process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
  )
  return NextResponse.json({
    service: 'harvics-fin-voice',
    deepgram,
    vapi,
    ready: deepgram && vapi,
    client_event: 'harvics:fin-start-voice',
  })
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  const conversationId =
    (body.conversation_id as string) ||
    ((body.conversation as { id?: string } | undefined)?.id ?? '') ||
    (body.conversationId as string) ||
    ''

  const contactId =
    (body.contact_id as string) ||
    ((body.contact as { id?: string } | undefined)?.id ?? '') ||
    (body.user_id as string) ||
    ''

  const deepgram = Boolean(process.env.DEEPGRAM_API_KEY)
  const vapi = Boolean(
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY && process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
  )

  if (!vapi) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Voice is not configured on the Harvics site yet.',
        fin_reply:
          "Voice isn't available right now. Please continue in this chat, or email info@harvics.com / WhatsApp +44 7405 527427.",
      },
      { status: 503 },
    )
  }

  return NextResponse.json({
    ok: true,
    product: 'fin',
    action: 'start_voice',
    provider: {
      chat: 'intercom_fin',
      voice: 'vapi',
      stt: deepgram ? 'deepgram' : 'vapi-default',
    },
    conversation_id: conversationId || null,
    contact_id: contactId || null,
    client_event: 'harvics:fin-start-voice',
    fin_reply:
      'Opening Fin voice now (Vapi + Deepgram). On the site, open Fin → Talk to Fin, or stay on this page if voice starts automatically.',
    deepgram,
  })
}

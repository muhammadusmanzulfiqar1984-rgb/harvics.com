import { NextRequest, NextResponse } from 'next/server'
import { createUserMessage, postConversationNote } from '@/lib/intercom-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Vapi server webhook → Intercom Fin conversation.
 *
 * In Vapi dashboard → Assistant / Phone Number → Server URL:
 *   https://www.harvics.com/api/vapi/webhook
 *
 * Optional header check: x-vapi-secret === VAPI_WEBHOOK_SECRET
 *
 * On end-of-call-report, posts transcript/summary into the Intercom conversation
 * (metadata.conversation_id) or as a user message when email/user_id is present.
 */

type VapiMessage = {
  type?: string
  endedReason?: string
  transcript?: string
  summary?: string
  recordingUrl?: string
  stereoRecordingUrl?: string
  messages?: Array<{ role?: string; message?: string; content?: string }>
  call?: {
    id?: string
    metadata?: Record<string, string | undefined>
  }
  artifact?: {
    transcript?: string
    summary?: string
  }
}

function verify(req: NextRequest): boolean {
  const secret = process.env.VAPI_WEBHOOK_SECRET || ''
  if (!secret) return true
  const header = req.headers.get('x-vapi-secret') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return header === secret
}

function extractTranscript(msg: VapiMessage): string {
  if (msg.artifact?.transcript) return msg.artifact.transcript
  if (msg.transcript) return msg.transcript
  if (Array.isArray(msg.messages) && msg.messages.length) {
    return msg.messages
      .map((m) => {
        const role = m.role || 'unknown'
        const text = m.message || m.content || ''
        return `${role}: ${text}`
      })
      .join('\n')
  }
  return ''
}

export async function POST(req: NextRequest) {
  if (!verify(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: { message?: VapiMessage } & VapiMessage = {}
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const msg = (payload.message || payload) as VapiMessage
  const type = msg.type || ''

  // Ack early events
  if (type && type !== 'end-of-call-report' && type !== 'hang') {
    return NextResponse.json({ received: true, type })
  }

  const metadata = msg.call?.metadata || {}
  const conversationId = metadata.conversation_id || metadata.intercom_conversation_id || ''
  const userId = metadata.user_id || metadata.intercom_user_id || ''
  const email = metadata.email || ''
  const transcript = extractTranscript(msg)
  const summary = msg.artifact?.summary || msg.summary || ''

  const body = [
    '**Fin voice call (Vapi + Deepgram)**',
    summary ? `\nSummary:\n${summary}` : '',
    transcript ? `\nTranscript:\n${transcript}` : '',
    msg.call?.id ? `\nCall ID: ${msg.call.id}` : '',
    msg.endedReason ? `\nEnded: ${msg.endedReason}` : '',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 7500)

  if (!body.trim() || body === '**Fin voice call (Vapi + Deepgram)**') {
    return NextResponse.json({ received: true, posted: false, reason: 'empty' })
  }

  let posted = false
  if (conversationId) {
    posted = await postConversationNote(conversationId, body)
  }
  if (!posted && (userId || email)) {
    posted = await createUserMessage({
      userId: userId || undefined,
      email: email || undefined,
      body: `Voice call with Fin completed.\n\n${body}`,
    })
  }

  return NextResponse.json({
    received: true,
    posted,
    conversation_id: conversationId || null,
  })
}

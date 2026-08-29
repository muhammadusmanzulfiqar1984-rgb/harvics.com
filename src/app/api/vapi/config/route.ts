import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Public Fin voice config (Vapi + Deepgram flags).
 * Private keys never leave the server.
 */
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ''
  const deepgram = Boolean(process.env.DEEPGRAM_API_KEY)

  if (!publicKey || !assistantId) {
    return NextResponse.json(
      {
        error: 'Vapi not configured. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID.',
        deepgram,
        product: 'fin',
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    product: 'fin',
    publicKey,
    assistantId,
    deepgram,
    deepgramModel: process.env.DEEPGRAM_MODEL || 'nova-3',
    deepgramLanguage: process.env.DEEPGRAM_LANGUAGE || 'en',
    stack: {
      chat: 'intercom_fin',
      voice: 'vapi',
      stt: deepgram ? 'deepgram' : 'vapi_default',
    },
  })
}

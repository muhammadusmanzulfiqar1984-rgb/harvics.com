import { NextRequest, NextResponse } from 'next/server'
import { ttsWithNvidia, ttsWithOpenAI } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/speak
 * Body: { text: string, voice?: string }
 * Returns audio/wav or audio/mpeg stream.
 *
 * Chain: NVIDIA Riva TTS → OpenAI TTS-1 → 404
 */
export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const trimmed = text.slice(0, 4096)

    // 1. NVIDIA Riva TTS
    const nvidiaAudio = await ttsWithNvidia(trimmed, voice)
    if (nvidiaAudio) {
      return new NextResponse(nvidiaAudio, {
        headers: { 'Content-Type': 'audio/wav', 'Cache-Control': 'no-store' },
      })
    }

    // 2. OpenAI TTS-1 fallback
    const openAIAudio = await ttsWithOpenAI(trimmed, voice as 'nova' ?? 'nova')
    if (openAIAudio) {
      return new NextResponse(openAIAudio, {
        headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
      })
    }

    return NextResponse.json({ error: 'No TTS provider configured (set NVIDIA_API_KEY or OPENAI_API_KEY).' }, { status: 503 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

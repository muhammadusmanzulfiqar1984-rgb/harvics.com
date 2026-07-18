import { NextRequest, NextResponse } from 'next/server'
import { callNvidiaDeepThink, callOpenAI } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/think
 * Deep reasoning endpoint — uses NVIDIA Nemotron-Ultra 550B (thinking=true).
 * Falls back to OpenAI gpt-4o for complex multi-step analysis.
 *
 * Body: { prompt: string, system?: string }
 * Returns: { result: string, model: string, latencyMs: number }
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, system } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const systemPrompt = system ||
      'You are a deep-reasoning AI for Harvics Global. Think step by step. Be thorough, precise, and strategic.'

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: prompt },
    ]

    const start = Date.now()

    // 1. NVIDIA Nemotron-Ultra 550B (full chain-of-thought)
    const deepReply = await callNvidiaDeepThink(messages, { maxTokens: 16384 })
    if (deepReply) {
      return NextResponse.json({ result: deepReply, model: 'nvidia/nemotron-3-ultra-550b-a55b', latencyMs: Date.now() - start })
    }

    // 2. OpenAI gpt-4o fallback
    const oaReply = await callOpenAI(messages, { model: 'gpt-4o', maxTokens: 4096, temperature: 0.7 })
    if (oaReply) {
      return NextResponse.json({ result: oaReply, model: 'gpt-4o', latencyMs: Date.now() - start })
    }

    return NextResponse.json({ error: 'No deep-think provider available.' }, { status: 503 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

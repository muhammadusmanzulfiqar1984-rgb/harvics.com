import { NextRequest, NextResponse } from 'next/server'
import { transcribeWithNvidia, transcribeWithOpenAI, callNvidia, callOpenAI, ttsWithNvidia, ttsWithOpenAI } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/voice  — Speech-to-Speech pipeline
 *
 * Accepts multipart/form-data with:
 *   audio   — audio blob (webm / mp3 / wav)
 *   system? — optional system prompt override
 *   voice?  — TTS voice name
 *
 * Pipeline:
 *   1. STT:  NVIDIA Parakeet → OpenAI Whisper → CF Whisper binding
 *   2. LLM:  OpenAI gpt-4o-mini → NVIDIA Nemotron-70B → CF Workers AI
 *   3. TTS:  NVIDIA Riva → OpenAI TTS-1
 *
 * Returns: { transcript, reply, audio: base64 }
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const audioFile = form.get('audio')
    const systemPrompt = (form.get('system') as string | null) ||
      'You are a helpful Harvics assistant. Keep replies under 3 sentences.'
    const voice = (form.get('voice') as string | null) || undefined

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ error: 'audio file is required' }, { status: 400 })
    }

    // ── Step 1: Speech → Text ─────────────────────────────────────────────────
    let transcript = await transcribeWithNvidia(audioFile, 'audio.webm')
    if (!transcript) transcript = await transcribeWithOpenAI(audioFile, 'audio.webm')

    // CF Workers AI Whisper fallback
    if (!transcript) {
      // @ts-expect-error - CF env binding available at runtime
      const ai = (globalThis as unknown as { AI?: unknown }).AI ?? (req as unknown as { env?: { AI?: unknown } }).env?.AI
      if (ai && typeof (ai as { run?: unknown }).run === 'function') {
        const cfAI = ai as { run: (model: string, opts: unknown) => Promise<{ text?: string }> }
        const buf = await audioFile.arrayBuffer()
        const result = await cfAI.run('@cf/openai/whisper', { audio: [...new Uint8Array(buf)] })
        transcript = result?.text ?? ''
      }
    }

    if (!transcript) {
      return NextResponse.json({ error: 'Could not transcribe audio.' }, { status: 422 })
    }

    // ── Step 2: Text → LLM ───────────────────────────────────────────────────
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: transcript },
    ]
    let reply = await callOpenAI(messages, { maxTokens: 256, temperature: 0.5 })
    if (!reply) reply = await callNvidia(messages, { maxTokens: 256, temperature: 0.5 })

    // CF Workers AI LLM fallback
    if (!reply) {
      // @ts-expect-error - CF env binding available at runtime
      const ai = (globalThis as unknown as { AI?: unknown }).AI ?? (req as unknown as { env?: { AI?: unknown } }).env?.AI
      if (ai && typeof (ai as { run?: unknown }).run === 'function') {
        const cfAI = ai as { run: (model: string, opts: unknown) => Promise<{ response?: string }> }
        const result = await cfAI.run('@cf/meta/llama-3-8b-instruct', { messages, max_tokens: 256 })
        reply = result?.response ?? null
      }
    }

    if (!reply) {
      return NextResponse.json({ transcript, error: 'LLM unavailable.' }, { status: 503 })
    }

    // ── Step 3: Text → Speech ────────────────────────────────────────────────
    let audioBuf = await ttsWithNvidia(reply, voice)
    let contentType = 'audio/wav'
    if (!audioBuf) {
      audioBuf = await ttsWithOpenAI(reply, (voice as 'nova') ?? 'nova')
      contentType = 'audio/mpeg'
    }

    const audioBase64 = audioBuf
      ? Buffer.from(audioBuf).toString('base64')
      : null

    return NextResponse.json({
      transcript,
      reply,
      audio:       audioBase64,
      contentType: audioBase64 ? contentType : null,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

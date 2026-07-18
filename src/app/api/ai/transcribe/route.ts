import { NextRequest, NextResponse } from 'next/server'
import { transcribeWithNvidia, transcribeWithOpenAI } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio')
    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ text: '' })
    }

    // 1. Cloudflare AI Whisper (no extra cost, uses CF binding)
    // @ts-expect-error - CF env binding available at runtime
    const ai = (globalThis as unknown as { AI?: unknown }).AI ?? (req as unknown as { env?: { AI?: unknown } }).env?.AI
    if (ai && typeof (ai as { run?: unknown }).run === 'function') {
      const cfAI = ai as { run: (model: string, opts: unknown) => Promise<{ text?: string }> }
      const buffer = await audioFile.arrayBuffer()
      const result = await cfAI.run('@cf/openai/whisper', { audio: [...new Uint8Array(buffer)] })
      if (result?.text) return NextResponse.json({ text: result.text })
    }

    // 2. NVIDIA Parakeet ASR fallback
    const nvidiaText = await transcribeWithNvidia(audioFile, 'audio.webm')
    if (nvidiaText) return NextResponse.json({ text: nvidiaText })

    // 3. OpenAI Whisper-1 fallback
    const text = await transcribeWithOpenAI(audioFile, 'audio.webm')
    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ text: '' })
  }
}

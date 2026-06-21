import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // @ts-expect-error - CF env binding available at runtime
    const ai = (globalThis as unknown as { AI?: unknown }).AI ?? (req as unknown as { env?: { AI?: unknown } }).env?.AI

    if (ai && typeof (ai as { run?: unknown }).run === 'function') {
      const cfAI = ai as { run: (model: string, opts: unknown) => Promise<{ text?: string }> }
      const formData = await req.formData()
      const audioFile = formData.get('audio')
      if (audioFile && audioFile instanceof Blob) {
        const buffer = await audioFile.arrayBuffer()
        const result = await cfAI.run('@cf/openai/whisper', { audio: [...new Uint8Array(buffer)] })
        return NextResponse.json({ text: result?.text ?? '' })
      }
    }

    return NextResponse.json({ text: '' })
  } catch {
    return NextResponse.json({ text: '' })
  }
}

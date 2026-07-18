import { NextRequest, NextResponse } from 'next/server'
import { callOpenAI, callNvidia } from '@/lib/openai'

const RECEIPT_SYSTEM = 'Extract receipt data and return JSON with fields: vendor (string), date (YYYY-MM-DD), amount (number), currency (string), description (string). Return ONLY valid JSON, no markdown.'

function parseReceiptJSON(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null
  try { return JSON.parse(raw.replace(/^```json\s*|\s*```$/g, '').trim()) } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text: string = body.text || body.imageText || ''
    const receiptMessages = [
      { role: 'system' as const, content: RECEIPT_SYSTEM },
      { role: 'user' as const, content: text || 'No receipt text provided' },
    ]

    // 1. OpenAI (json mode)
    const oaRaw = await callOpenAI(receiptMessages, { maxTokens: 200, temperature: 0, jsonMode: true })
    const oaParsed = parseReceiptJSON(oaRaw)
    if (oaParsed) return NextResponse.json(oaParsed)

    // 2. NVIDIA
    const nvRaw = await callNvidia(receiptMessages, { maxTokens: 200, temperature: 0 })
    const nvParsed = parseReceiptJSON(nvRaw)
    if (nvParsed) return NextResponse.json(nvParsed)

    // 3. Cloudflare Workers AI
    // @ts-expect-error - CF env binding available at runtime
    const ai = (globalThis as unknown as { AI?: unknown }).AI ?? (req as unknown as { env?: { AI?: unknown } }).env?.AI

    if (ai && typeof (ai as { run?: unknown }).run === 'function') {
      const cfAI = ai as { run: (model: string, opts: unknown) => Promise<{ response?: string }> }
      const result = await cfAI.run('@cf/meta/llama-3-8b-instruct', { messages: receiptMessages, max_tokens: 200 })
      const cfParsed = parseReceiptJSON(result?.response ?? null)
      if (cfParsed) return NextResponse.json(cfParsed)
    }

    // Rule-based: try to extract numbers and dates from text
    const amountMatch = text.match(/[\$€£]?\s*(\d+[\.,]\d{2})/)?.[1]
    const dateMatch = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/)?.[0]
    return NextResponse.json({
      vendor: 'Unknown',
      date: dateMatch ?? new Date().toISOString().split('T')[0],
      amount: amountMatch ? parseFloat(amountMatch.replace(',', '.')) : 0,
      currency: text.includes('€') ? 'EUR' : text.includes('£') ? 'GBP' : 'USD',
      description: text.slice(0, 80) || 'Receipt',
    })
  } catch {
    return NextResponse.json({ vendor: 'Unknown', date: '', amount: 0, currency: 'EUR', description: '' })
  }
}

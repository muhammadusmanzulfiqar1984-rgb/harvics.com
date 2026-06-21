import { NextRequest, NextResponse } from 'next/server'


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text: string = body.text || body.imageText || ''

    // @ts-expect-error - CF env binding available at runtime
    const ai = (globalThis as unknown as { AI?: unknown }).AI ?? (req as unknown as { env?: { AI?: unknown } }).env?.AI

    if (ai && typeof (ai as { run?: unknown }).run === 'function') {
      const cfAI = ai as { run: (model: string, opts: unknown) => Promise<{ response?: string }> }
      const result = await cfAI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: 'Extract receipt data and return JSON with fields: vendor (string), date (YYYY-MM-DD), amount (number), currency (string), description (string). Return ONLY valid JSON.',
          },
          { role: 'user', content: text || 'No receipt text provided' },
        ],
        max_tokens: 200,
      })
      try {
        const parsed = JSON.parse(result?.response ?? '{}')
        return NextResponse.json(parsed)
      } catch {
        // Parse failed, return defaults
      }
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

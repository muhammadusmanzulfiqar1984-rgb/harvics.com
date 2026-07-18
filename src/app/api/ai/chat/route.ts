import { NextRequest, NextResponse } from 'next/server'
import { callOpenAI, callNvidia } from '@/lib/openai'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL   = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

/* Rule-based fallback responses when AI is unavailable */
function ruleBasedReply(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('hello') || m.includes('hi') || m.includes('hey'))
    return "Hello! I'm the Harvics AI assistant. How can I help you today?"
  if (m.includes('price') || m.includes('cost') || m.includes('fee'))
    return 'Pricing varies by product and volume. Please contact our team at info@harvics.com for a quote.'
  if (m.includes('ship') || m.includes('deliver') || m.includes('logistics'))
    return 'We handle UK-GCC corridor shipments with full customs clearance. Typical transit is 5-12 days depending on mode.'
  if (m.includes('certif') || m.includes('compliance') || m.includes('audit'))
    return 'We support WRAP, BSCI, Higg Index, SEDEX/SMETA, ISO 9001, OEKO-TEX, and ZDHC MRSL certifications.'
  if (m.includes('event') || m.includes('exhibitor') || m.includes('fair') || m.includes('show'))
    return 'Use the event directory to browse exhibitors and agenda. Tap any exhibitor card to save to your bookmarks.'
  if (m.includes('vat') || m.includes('tax') || m.includes('expense'))
    return 'Vatify supports VAT calculations across all EU jurisdictions. Add your expenses and the engine auto-calculates the recoverable VAT.'
  if (m.includes('contact') || m.includes('support') || m.includes('help'))
    return 'For support, email info@harvics.com or visit harvics.com. Our team is available Mon-Fri 9am-6pm GMT.'
  if (m.includes('thank'))
    return "You're welcome! Let me know if you need anything else."
  return "I'm here to help with trade, logistics, events, and compliance questions. What would you like to know?"
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages: { role: string; content: string }[] = body.messages || []
    const userMessage = messages.findLast((m) => m.role === 'user')?.content || ''
    const systemPrompt: string = body.system || 'You are a helpful Harvics business assistant. Be concise and professional.'

    // Try Cloudflare Workers AI
    // @ts-expect-error - CF env binding available at runtime
    const ai = (globalThis as unknown as { AI?: unknown }).AI ?? (req as unknown as { env?: { AI?: unknown } }).env?.AI

    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // 1. Groq primary
    if (GROQ_API_KEY) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: GROQ_MODEL, messages: aiMessages, max_tokens: 512 }),
      }).catch(() => null)
      if (res?.ok) {
        const d = await res.json()
        const r = d.choices?.[0]?.message?.content
        if (r) return NextResponse.json({ response: r })
      }
    }

    // 2. OpenAI fallback
    const openAIReply = await callOpenAI(aiMessages, { maxTokens: 512 })
    if (openAIReply) return NextResponse.json({ response: openAIReply })

    // 3. NVIDIA fallback
    const nvidiaReply = await callNvidia(aiMessages, { maxTokens: 512 })
    if (nvidiaReply) return NextResponse.json({ response: nvidiaReply })

    // 4. Cloudflare Workers AI fallback
    if (ai && typeof (ai as { run?: unknown }).run === 'function') {
      const cfAI = ai as { run: (model: string, opts: unknown) => Promise<{ response?: string }> }
      const result = await cfAI.run('@cf/meta/llama-3-8b-instruct', { messages: aiMessages, max_tokens: 512 })
      return NextResponse.json({ response: result?.response ?? ruleBasedReply(userMessage) })
    }

    // 4. Rule-based fallback
    return NextResponse.json({ response: ruleBasedReply(userMessage) })
  } catch {
    const body = await req.clone().json().catch(() => ({}))
    const msgs = (body as { messages?: { role: string; content: string }[] }).messages ?? []
    const last = msgs.findLast?.((m: { role: string }) => m.role === 'user')?.content ?? ''
    return NextResponse.json({ response: ruleBasedReply(last) })
  }
}

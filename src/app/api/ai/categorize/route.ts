import { NextRequest, NextResponse } from 'next/server'
import { callOpenAI, callNvidia } from '@/lib/openai'

const CATEGORIES = ['Food & Dining', 'Transport', 'Accommodation', 'Office Supplies', 'Software & Tech',
  'Marketing', 'Professional Services', 'Utilities', 'Entertainment', 'Healthcare', 'Other']

function ruleBasedCategory(description: string): string {
  const d = description.toLowerCase()
  if (d.includes('restaurant') || d.includes('food') || d.includes('lunch') || d.includes('dinner') || d.includes('coffee')) return 'Food & Dining'
  if (d.includes('taxi') || d.includes('uber') || d.includes('train') || d.includes('flight') || d.includes('fuel') || d.includes('parking')) return 'Transport'
  if (d.includes('hotel') || d.includes('airbnb') || d.includes('accommodation')) return 'Accommodation'
  if (d.includes('office') || d.includes('stationery') || d.includes('paper') || d.includes('printer')) return 'Office Supplies'
  if (d.includes('software') || d.includes('subscription') || d.includes('saas') || d.includes('hosting') || d.includes('domain')) return 'Software & Tech'
  if (d.includes('marketing') || d.includes('advertis') || d.includes('social media')) return 'Marketing'
  if (d.includes('consult') || d.includes('lawyer') || d.includes('accountant') || d.includes('freelance')) return 'Professional Services'
  if (d.includes('electric') || d.includes('gas') || d.includes('water') || d.includes('internet') || d.includes('phone')) return 'Utilities'
  return 'Other'
}


export async function POST(req: NextRequest) {
  try {
    const { description, amount } = await req.json()
    // @ts-expect-error - CF env binding available at runtime
    const ai = (globalThis as unknown as { AI?: unknown }).AI ?? (req as unknown as { env?: { AI?: unknown } }).env?.AI

    const catMessages = [
      { role: 'system' as const, content: `Categorize the expense into exactly one of: ${CATEGORIES.join(', ')}. Reply with only the category name.` },
      { role: 'user' as const, content: `Description: ${description}, Amount: ${amount}` },
    ]

    // 1. OpenAI
    const oaReply = await callOpenAI(catMessages, { maxTokens: 20, temperature: 0 })
    if (oaReply) {
      const cat = CATEGORIES.find(c => oaReply.includes(c)) ?? ruleBasedCategory(description)
      return NextResponse.json({ category: cat })
    }

    // 2. NVIDIA
    const nvReply = await callNvidia(catMessages, { maxTokens: 20, temperature: 0 })
    if (nvReply) {
      const cat = CATEGORIES.find(c => nvReply.includes(c)) ?? ruleBasedCategory(description)
      return NextResponse.json({ category: cat })
    }

    // 3. Cloudflare Workers AI
    if (ai && typeof (ai as { run?: unknown }).run === 'function') {
      const cfAI = ai as { run: (model: string, opts: unknown) => Promise<{ response?: string }> }
      const result = await cfAI.run('@cf/meta/llama-3-8b-instruct', { messages: catMessages, max_tokens: 20 })
      const cat = CATEGORIES.find(c => result?.response?.includes(c)) ?? ruleBasedCategory(description)
      return NextResponse.json({ category: cat })
    }

    return NextResponse.json({ category: ruleBasedCategory(description) })
  } catch {
    return NextResponse.json({ category: 'Other' })
  }
}

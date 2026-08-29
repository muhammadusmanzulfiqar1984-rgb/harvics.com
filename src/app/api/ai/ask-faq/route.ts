import { NextRequest, NextResponse } from 'next/server'
import { generateTabraizText } from '@/lib/tabraiz-town/gemini'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, lang, learnedIntents } = body

    let learnedContext = ''
    if (learnedIntents && Array.isArray(learnedIntents) && learnedIntents.length > 0) {
      learnedContext = `\n\nUSER SESSION INTERACTIVE MEMORY (Learned Intentions):
The user has interacted with the following elements during this session:
${learnedIntents.map((i: string) => `- ${i}`).join('\n')}
Please subtly reference or adapt your tone to show that you remember these specific interactions if relevant, but remain completely professional, objective, and McKinsey-aligned.`
    }

    const prompt = `You are the sovereign AI Concierge for Tabraiz Town, Rahim Yar Khan, a luxury 30-Kanal architectural vertical monolith.
Answer the user's question with absolute precision, courtesy, and high-end brand alignment.

Context details about Tabraiz Town:
- Location: Rahim Yar Khan, Southern Punjab, Pakistan. Near Cholistan's heritage sites (Bhong Mosque, Derawar Fort, Pattan Minara).
- Core Vision: Agritech fluid pivot, securing land yield reserves against inflation, providing international tier physical security, high-rise 30-kanal vertical master planning.
- Materials: Premium Italian White Travertine, Champagne-finish structural steel rebar (Amreli/Mughal Grade 60), high-density monolith cement.
- Amenities: Rooftop "Sky-Desert" restaurant, Dolby Atmos Private viewing lounge, Sovereign gourmet culinary court, supervision play area, Sufi Wellness Spa, Hammam, and infinity-edge pools.
- Installment Plan: 4-Year sovereign installment plan (15% reservation deposit, 15% excavation, 30% split across 12 quarters, 20% interior fitting, 20% handover).
- Financial/Banking Partners: Meezan Bank (Musharakah), Bank Alfalah (Alfa Executive), HBL Prestige, MCB Private Wealth.

User's Question: "${question}"
Language: ${lang === 'en' ? 'English' : 'Urdu'}${learnedContext}

Provide a highly polished, helpful, and sophisticated response in markdown format. If the question is unrelated to Tabraiz Town or investments/lifestyle in Pakistan, gently redirect the user back to the spatial grandeur of Tabraiz Town. Keep it concise. Ensure response is beautifully structured.`

    const result = await generateTabraizText(prompt)
    if (result.error) {
      return NextResponse.json({ error: result.error })
    }
    return NextResponse.json({ text: result.text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred during Q&A generation.'
    console.error('[tabraiz ask-faq]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

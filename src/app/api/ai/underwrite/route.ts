import { NextRequest, NextResponse } from 'next/server'
import { generateTabraizText } from '@/lib/tabraiz-town/gemini'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { scale, horizonYears, capitalSource, lang, arr, initialPKR, finalPKR } = body

    const prompt = `You are an elite, high-end McKinsey financial underwriter specializing in sovereign wealth and mega-infrastructure investments in Southern Punjab.
Write an exclusive, highly tailored Investment Underwriting Brief for a client considering investing in Tabraiz Town, Rahim Yar Khan.

User's Selection Parameters:
- Asset Scale: ${scale} (Initial Valuation: ${initialPKR})
- Investment Horizon: ${horizonYears} Years
- Capital Source: ${capitalSource}
- Tabraiz Town ARR: ${arr}%
- Projected Valuation after ${horizonYears} years: ${finalPKR}

Please write a sophisticated, McKinsey-style executive analysis. Organize it into the following three parts:
1. **Strategic Macro Thesis**: Why this asset scale and capital source makes sense in Southern Punjab's agricultural-to-urban pivot.
2. **Volumetric Asset Shielding**: How the physical monolithic structure safeguards this capital from inflation.
3. **Generational Wealth Preservation Pro-Forma**: A detailed commentary on the growth curve and return profile over the ${horizonYears}-year holding period.

Respond in ${lang === 'en' ? 'English' : 'Urdu'}. Keep the tone extremely elegant, intellectual, objective, and professional. Avoid fluffy marketing jargon; sound like a sovereign wealth fund's senior director or a lead McKinsey partner. Use markdown. Do not include excessive introductions, get straight to the point.`

    const result = await generateTabraizText(prompt)
    if (result.error) {
      return NextResponse.json({ error: result.error })
    }
    return NextResponse.json({ text: result.text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred during text generation.'
    console.error('[tabraiz underwrite]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

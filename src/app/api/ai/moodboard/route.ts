import { NextRequest, NextResponse } from 'next/server'
import { generateTabraizText } from '@/lib/tabraiz-town/gemini'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { suiteConfig, lifestyle, lang } = body

    const prompt = `You are a world-class interior architect from Milan collaborating with Harvics Global Ventures on the interior design language of Tabraiz Town, Rahim Yar Khan.
Based on the chosen Suite Style: ${suiteConfig === 'furnished' ? 'Bespoke Fully Furnished Edition' : 'Sovereign Unfurnished Shell'} and the resident's Lifestyle Profile: ${lifestyle}, write an exclusive, poetic, and highly tactile interior design specification.

Integrate:
- Southern Punjab's golden desert light angles (maximizing passive illumination)
- Locally sourced details (hints of hand-glazed indigo clay, delicate desert sand palettes)
- Core Monolith materials: Italian White Travertine, Champagne-finish steel, Sulphate-Resistant concrete structures.

Please structure the response into 3 elegant parts:
1. **Architectural Spatial Vibe**: The conceptual atmosphere and feeling of the space.
2. **Materials Palette & Lighting Kelvin**: Specific material selections, texture pairings, and ambient color temperature.
3. **Bespoke Artistry & Furniture Suggestions**: Tailored details for this lifestyle profile.

Respond in ${lang === 'en' ? 'English' : 'Urdu'}. Keep the tone extremely elegant, sophisticated, poetic, and professional. Avoid cheap marketing speak; write like a world-renowned architecture journal. Use markdown.`

    const result = await generateTabraizText(prompt)
    if (result.error) {
      return NextResponse.json({ error: result.error })
    }
    return NextResponse.json({ text: result.text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred during moodboard generation.'
    console.error('[tabraiz moodboard]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

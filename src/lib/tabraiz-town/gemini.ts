/**
 * Shared Gemini helper for Tabraiz Town AI endpoints.
 * Uses the Generative Language REST API (no SDK dependency).
 */

const MODEL = process.env.TABRAIZ_GEMINI_MODEL || 'gemini-2.0-flash'

export async function generateTabraizText(prompt: string): Promise<{ text?: string; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    return {
      error:
        'Gemini API Key is not configured on the server. Please add GEMINI_API_KEY to the environment.',
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `Gemini request failed (${res.status})`)
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
  return { text }
}

// Uses Cloudflare Workers AI via /api/ai/chat — no Gemini key required

const getSystemInstruction = (config: Record<string, unknown>, exhibitors: unknown[], agenda: unknown[], language: string = 'English') => `
Role: You are the "Event Intelligence Concierge" for Harvics EventOS.
Persona: Structured, intelligent, and professional. You assist attendees in navigating complex trade environments across multiple sectors (Textile, Food, Mining, Industrial, etc.).
Current Event: ${(config?.name as string) || 'Harvics EventOS'} (${(config?.edition as string) || '2026'})
Current Language: ${language}

Task: Assist professionals in discovering exhibitors, categories, session insights, or discovery strategies. You MUST respond in ${language}.

Harvics EventOS Description:
Harvics EventOS is a structured intelligence platform built for global trade events and multi-sector exhibitions. It transforms traditional event directories into curated ecosystems—integrating exhibitors, agendas, AI-assisted discovery, and secure networking tools into a unified system.

Exhibitor Data (first 10):
${JSON.stringify(exhibitors.slice(0, 10), null, 2)}

Agenda Data (first 10):
${JSON.stringify((agenda as unknown[]).slice(0, 10), null, 2)}

When answering:
1. Be concise and scannable.
2. Use a professional, institutional tone.
3. Provide booth numbers and hall locations clearly.
4. Assist with discovery strategies across industries.
`

/* Rule-based fallback for when the AI endpoint is unreachable */
function ruleFallback(message: string, exhibitors: unknown[]): string {
  const m = message.toLowerCase()
  const exList = exhibitors as { name?: string; category?: string; hall?: string; booth?: string }[]
  if (m.includes('textile') || m.includes('fabric') || m.includes('denim')) {
    const matches = exList.filter(e => (e.category ?? '').toLowerCase().includes('text'))
    if (matches.length) return `Textile exhibitors: ${matches.map(e => `${e.name} (Hall ${e.hall}, Booth ${e.booth})`).join(', ')}.`
  }
  if (m.includes('food') || m.includes('fmcg') || m.includes('beverage')) {
    const matches = exList.filter(e => (e.category ?? '').toLowerCase().includes('food'))
    if (matches.length) return `Food & FMCG exhibitors: ${matches.map(e => `${e.name} (Hall ${e.hall}, Booth ${e.booth})`).join(', ')}.`
  }
  if (m.includes('hello') || m.includes('hi')) return 'Welcome to Harvics EventOS! I can help you find exhibitors, sessions, and networking opportunities.'
  if (m.includes('agenda') || m.includes('session') || m.includes('schedule')) return 'Check the Agenda tab for the full schedule. Use the search to filter by topic or time slot.'
  if (m.includes('network') || m.includes('meet') || m.includes('contact')) return 'Use the QR scanner on the Networking tab to connect with other attendees and exhibitors.'
  return 'I can help you find exhibitors by sector, navigate the agenda, or assist with networking. What are you looking for?'
}

export async function chatWithConcierge(
  message: string,
  history: { role: string; parts: { text: string }[] }[] = [],
  config: Record<string, unknown>,
  exhibitors: unknown[],
  agenda: unknown[],
  language: string = 'English'
): Promise<string> {
  try {
    const messages = [
      ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.parts?.[0]?.text ?? '' })),
      { role: 'user', content: message },
    ]

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: getSystemInstruction(config, exhibitors, agenda, language),
        messages,
      }),
    })

    if (res.ok) {
      const data = await res.json() as { response?: string }
      return data.response ?? ruleFallback(message, exhibitors)
    }
  } catch {
    // network error — use rule-based
  }
  return ruleFallback(message, exhibitors)
}

export async function generateSpeech(_text: string): Promise<string | null> {
  // TTS not available without Gemini — return null gracefully
  return null
}

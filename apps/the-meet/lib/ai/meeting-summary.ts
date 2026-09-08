export async function summarizeMeetingTranscript(transcript: string) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY missing')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MEET_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Summarize a meeting transcript. Return JSON: {"summary":"2-4 paragraphs","decisions":["..."],"actionItems":[{"owner":"","task":"","due":null}]}',
        },
        { role: 'user', content: transcript.slice(0, 12000) },
      ],
    }),
  })
  const json: any = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error?.message || `OpenAI ${res.status}`)
  const raw = json?.choices?.[0]?.message?.content || '{}'
  try {
    return JSON.parse(raw) as {
      summary: string
      decisions: string[]
      actionItems: Array<{ owner: string; task: string; due: string | null }>
    }
  } catch {
    return { summary: String(raw), decisions: [], actionItems: [] }
  }
}

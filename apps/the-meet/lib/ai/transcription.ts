/**
 * Deepgram transcription helper.
 * Live path: LiveKit egress / data channel → Deepgram streaming.
 */
export function deepgramConfigured() {
  return Boolean(process.env.DEEPGRAM_API_KEY)
}

export async function transcribeAudioBuffer(buf: Buffer, mime = 'audio/wav') {
  const key = process.env.DEEPGRAM_API_KEY
  if (!key) throw new Error('DEEPGRAM_API_KEY missing')

  const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true', {
    method: 'POST',
    headers: {
      Authorization: `Token ${key}`,
      'Content-Type': mime,
    },
    body: new Uint8Array(buf),
  })
  const json: any = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.err_msg || `Deepgram ${res.status}`)
  const text =
    json?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
    json?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript ||
    ''
  return { text, raw: json }
}

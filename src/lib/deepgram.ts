/**
 * Deepgram speech-to-text (pre-recorded).
 * Docs: https://developers.deepgram.com/docs/pre-recorded-audio
 */

const DEEPGRAM_LISTEN = 'https://api.deepgram.com/v1/listen'

export type DeepgramTranscribeOptions = {
  model?: string
  language?: string
  smartFormat?: boolean
}

/**
 * Transcribe an audio blob via Deepgram Nova.
 * Returns transcript text, or '' if unset / failed.
 */
export async function transcribeWithDeepgram(
  audioBlob: Blob,
  filename = 'audio.webm',
  opts: DeepgramTranscribeOptions = {},
): Promise<string> {
  const key = process.env.DEEPGRAM_API_KEY
  if (!key) return ''

  const model = opts.model || process.env.DEEPGRAM_MODEL || 'nova-3'
  const smartFormat = opts.smartFormat !== false
  const language = opts.language || process.env.DEEPGRAM_LANGUAGE || ''

  const params = new URLSearchParams({
    model,
    smart_format: String(smartFormat),
  })
  if (language) params.set('language', language)

  const contentType =
    audioBlob.type ||
    (filename.endsWith('.wav')
      ? 'audio/wav'
      : filename.endsWith('.mp3')
        ? 'audio/mpeg'
        : filename.endsWith('.ogg')
          ? 'audio/ogg'
          : 'audio/webm')

  try {
    const res = await fetch(`${DEEPGRAM_LISTEN}?${params.toString()}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${key}`,
        'Content-Type': contentType,
      },
      body: audioBlob,
    })

    if (!res.ok) {
      const err = await res.text().catch(() => '')
      console.error(`Deepgram listen ${res.status}:`, err.slice(0, 200))
      return ''
    }

    const data = (await res.json()) as {
      results?: {
        channels?: Array<{
          alternatives?: Array<{ transcript?: string }>
        }>
      }
    }

    return data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? ''
  } catch (e) {
    console.error('Deepgram transcription error:', e)
    return ''
  }
}

/** Lightweight key check — returns true if Deepgram accepts the key. */
export async function deepgramKeyOk(): Promise<boolean> {
  const key = process.env.DEEPGRAM_API_KEY
  if (!key) return false
  try {
    const res = await fetch(
      `${DEEPGRAM_LISTEN}?model=nova-3&smart_format=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://dpgr.am/spacewalk.wav' }),
      },
    )
    return res.ok
  } catch {
    return false
  }
}

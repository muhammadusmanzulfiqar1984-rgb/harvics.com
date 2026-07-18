/**
 * Shared OpenAI + NVIDIA REST helpers — no SDK, plain fetch.
 * Used server-side only; never exposed to the client.
 */

const OPENAI_BASE  = 'https://api.openai.com/v1'
const NVIDIA_BASE  = 'https://integrate.api.nvidia.com/v1'

export const OPENAI_CHAT_MODEL  = process.env.OPENAI_CHAT_MODEL  || 'gpt-4o-mini'
export const NVIDIA_CHAT_MODEL       = process.env.NVIDIA_CHAT_MODEL       || 'deepseek-ai/deepseek-v4-pro'
export const NVIDIA_DEEPTHINK_MODEL  = process.env.NVIDIA_DEEPTHINK_MODEL  || 'nvidia/nemotron-3-ultra-550b-a55b'
export const OPENAI_AUDIO_MODEL = 'whisper-1'

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIChatOptions {
  model?:       string
  temperature?: number
  maxTokens?:   number
  jsonMode?:    boolean    // enables response_format: { type: 'json_object' }
}

/**
 * Call the OpenAI Chat Completions API.
 * Returns the assistant text, or null if the key is missing / call fails.
 */
export async function callOpenAI(
  messages: OpenAIMessage[],
  opts: OpenAIChatOptions = {},
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null

  const body: Record<string, unknown> = {
    model:       opts.model       ?? OPENAI_CHAT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens:  opts.maxTokens   ?? 1024,
  }
  if (opts.jsonMode) body.response_format = { type: 'json_object' }

  try {
    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text().catch(() => '')
      console.error(`OpenAI ${res.status}:`, err.slice(0, 200))
      return null
    }

    const data = await res.json()
    return (data.choices?.[0]?.message?.content as string | undefined) ?? null
  } catch (e) {
    console.error('OpenAI fetch error:', e)
    return null
  }
}

/**
 * Call NVIDIA DeepSeek V4 Pro — primary NVIDIA chat model.
 * Passes chat_template_kwargs.thinking=false to disable chain-of-thought overhead
 * for fast conversational responses.
 */
export async function callNvidia(
  messages: OpenAIMessage[],
  opts: OpenAIChatOptions = {},
): Promise<string | null> {
  const key = process.env.NVIDIA_API_KEY
  if (!key) return null

  const body: Record<string, unknown> = {
    model:                    opts.model       ?? NVIDIA_CHAT_MODEL,
    messages,
    temperature:              opts.temperature ?? 0.7,
    max_tokens:               opts.maxTokens   ?? 1024,
    // Disable CoT for fast conversational use
    chat_template_kwargs:     { thinking: false },
  }

  try {
    const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text().catch(() => '')
      console.error(`NVIDIA ${res.status}:`, err.slice(0, 200))
      return null
    }

    const data = await res.json()
    return (data.choices?.[0]?.message?.content as string | undefined) ?? null
  } catch (e) {
    console.error('NVIDIA fetch error:', e)
    return null
  }
}

/**
 * Call NVIDIA Nemotron-Ultra 550B — deep reasoning / think mode.
 * Uses thinking=true for full chain-of-thought. Slower but much more thorough.
 */
export async function callNvidiaDeepThink(
  messages: OpenAIMessage[],
  opts: OpenAIChatOptions = {},
): Promise<string | null> {
  const key = process.env.NVIDIA_API_KEY
  if (!key) return null

  const body: Record<string, unknown> = {
    model:                opts.model       ?? NVIDIA_DEEPTHINK_MODEL,
    messages,
    temperature:          opts.temperature ?? 1,
    top_p:                0.95,
    max_tokens:           opts.maxTokens   ?? 16384,
    chat_template_kwargs: { thinking: true },
  }

  try {
    const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text().catch(() => '')
      console.error(`NVIDIA DeepThink ${res.status}:`, err.slice(0, 200))
      return null
    }

    const data = await res.json()
    return (data.choices?.[0]?.message?.content as string | undefined) ?? null
  } catch (e) {
    console.error('NVIDIA DeepThink error:', e)
    return null
  }
}

/**
 * Transcribe audio via OpenAI Whisper-1.
 */
export async function transcribeWithOpenAI(
  audioBlob: Blob,
  filename = 'audio.webm',
): Promise<string> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return ''
  try {
    const form = new FormData()
    form.append('file', audioBlob, filename)
    form.append('model', OPENAI_AUDIO_MODEL)
    const res = await fetch(`${OPENAI_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    })
    if (!res.ok) return ''
    const data = await res.json()
    return (data.text as string | undefined) ?? ''
  } catch {
    return ''
  }
}

/**
 * Transcribe audio via NVIDIA Parakeet ASR (OpenAI-compatible endpoint).
 */
export async function transcribeWithNvidia(
  audioBlob: Blob,
  filename = 'audio.webm',
): Promise<string> {
  const key = process.env.NVIDIA_API_KEY
  if (!key) return ''
  try {
    const form = new FormData()
    form.append('file', audioBlob, filename)
    form.append('model', 'nvidia/parakeet-ctc-0.6b-asr')
    const res = await fetch(`${NVIDIA_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    })
    if (!res.ok) return ''
    const data = await res.json()
    return (data.text as string | undefined) ?? ''
  } catch {
    return ''
  }
}

/**
 * Convert text to speech via NVIDIA Riva TTS (OpenAI-compatible /audio/speech).
 * Returns the audio ArrayBuffer, or null on failure.
 */
export async function ttsWithNvidia(
  text: string,
  voice = 'English-US.Female-1',
): Promise<ArrayBuffer | null> {
  const key = process.env.NVIDIA_API_KEY
  if (!key) return null
  try {
    const res = await fetch(`${NVIDIA_BASE}/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model:           'nvidia/fastpitch-hifigan-tts',
        input:           text,
        voice,
        response_format: 'wav',
      }),
    })
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

/**
 * Convert text to speech via OpenAI TTS (tts-1).
 * Returns the audio ArrayBuffer, or null on failure.
 */
export async function ttsWithOpenAI(
  text: string,
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova',
): Promise<ArrayBuffer | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  try {
    const res = await fetch(`${OPENAI_BASE}/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: 'tts-1', input: text, voice, response_format: 'mp3' }),
    })
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

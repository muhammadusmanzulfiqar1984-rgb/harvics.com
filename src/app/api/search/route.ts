import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * "Ask Harvics" — queries the Cloudflare AI Search instance (managed RAG over
 * the live site) and returns a natural-language answer plus source links.
 *
 * Requires CLOUDFLARE_API_TOKEN with AI Search:Edit + AI Search:Run permissions.
 */

interface AiSearchChunk {
  score?: number
  item?: {
    key?: string
    metadata?: { title?: string; description?: string }
  }
}

type SupportedLang = 'ar' | 'de' | 'cs' | 'pl' | 'en'

const LANGUAGE_NAMES: Record<SupportedLang, string> = {
  ar: 'Arabic',
  de: 'German',
  cs: 'Czech',
  pl: 'Polish',
  en: 'English',
}

/**
 * Detect the user's language from their message text.
 * Supports Arabic, German, Czech and Polish; everything else defaults to
 * English. Detection favours language-specific characters, then falls back to
 * distinctive stopwords for short / diacritic-free messages.
 */
function detectLanguage(text: string): SupportedLang {
  if (!text) return 'en'
  const lower = text.toLowerCase()

  // Arabic script is unambiguous.
  if (/[\u0600-\u06FF]/.test(text)) return 'ar'

  // Characters that are (near-)unique to a single Latin-script language.
  const polishChars = /[łąęźż]/.test(lower)
  const czechChars = /[řůě]/.test(lower)
  const germanChars = /[äöüß]/.test(lower)
  // Shared Central-European diacritics (help disambiguate cs vs pl).
  const sharedPolish = /[ńśćó]/.test(lower)
  const sharedCzech = /[čšžďťň]/.test(lower)

  if (polishChars) return 'pl'
  if (czechChars) return 'cs'
  if (germanChars) return 'de'
  if (sharedPolish && !sharedCzech) return 'pl'
  if (sharedCzech && !sharedPolish) return 'cs'

  // Distinctive stopwords for messages without diacritics.
  const words = new Set(lower.split(/\W+/).filter(Boolean))
  const has = (list: string[]) => list.some((w) => words.has(w))
  const de = ['der', 'die', 'das', 'und', 'ist', 'nicht', 'ich', 'wie', 'was', 'kann', 'für', 'hallo', 'danke', 'bitte', 'guten', 'möchte', 'haben', 'wir', 'eine', 'mit']
  const pl = ['jest', 'nie', 'jak', 'dziękuję', 'proszę', 'cześć', 'dzień', 'dobry', 'chcę', 'czy', 'gdzie', 'który', 'dla', 'mam']
  const cs = ['je', 'jak', 'děkuji', 'prosím', 'ahoj', 'dobrý', 'den', 'chci', 'kde', 'který', 'pro', 'ano', 'mám', 'jaký']

  if (has(de)) return 'de'
  if (has(pl) && !has(cs)) return 'pl'
  if (has(cs) && !has(pl)) return 'cs'
  if (has(pl)) return 'pl'
  if (has(cs)) return 'cs'

  return 'en'
}

function chunkToSource(chunk: AiSearchChunk): { url: string; title: string } | null {
  const key = chunk?.item?.key
  if (!key) return null
  let url = String(key)
  if (!/^https?:\/\//i.test(url)) {
    url = `https://www.harvics.com/${url.replace(/^\/+/, '')}`
  }
  // Prefer the crawled page title; fall back to a slug derived from the URL.
  let title = chunk?.item?.metadata?.title?.replace(/&amp;/g, '&').trim() || ''
  if (!title) {
    try {
      const u = new URL(url)
      const parts = u.pathname.split('/').filter(Boolean)
      title = parts.length ? parts[parts.length - 1].replace(/[-_]/g, ' ') : u.hostname
      title = title.charAt(0).toUpperCase() + title.slice(1)
    } catch {
      title = url
    }
  }
  return { url, title }
}

export async function POST(req: Request) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const instance = process.env.AI_SEARCH_INSTANCE || 'harvics-search'

  if (!accountId || !apiToken) {
    return NextResponse.json(
      { error: 'AI Search not configured (missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN).' },
      { status: 500 },
    )
  }

  let body: { query?: string } = {}
  try {
    body = await req.json()
  } catch {
    /* handled below */
  }
  const query = (body.query || '').toString().trim()
  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai-search/instances/${instance}`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiToken}`,
  }
  const lang = detectLanguage(query)
  const languageName = LANGUAGE_NAMES[lang]

  const messages = [
    {
      role: 'system',
      content:
        'You are the Harvics Global Ventures assistant. Answer questions about Harvics, ' +
        'HarvicTrade, its industries, products, and services using the retrieved site content. ' +
        'Be concise, professional, and helpful. Do not say phrases like "according to the ' +
        'provided documents" — just answer directly as Harvics. If the content does not cover ' +
        'the question, say so briefly and suggest contacting the Harvics team. ' +
        `The user's message is in ${languageName}. You MUST write your entire reply in ${languageName}, ` +
        'and never switch to another language.',
    },
    { role: 'user', content: query },
  ]

  try {
    // One call: chat/completions returns the answer AND the retrieved chunks
    // (used for source links).
    const chatRes = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages }),
    })

    const chatData: any = await chatRes.json().catch(() => ({}))
    if (!chatRes.ok) {
      const status = chatRes.status
      const hint =
        status === 403 || status === 401
          ? 'The API token is missing AI Search:Edit / AI Search:Run permissions.'
          : undefined
      return NextResponse.json(
        { error: 'AI Search request failed', hint, detail: chatData },
        { status },
      )
    }

    const answer: string =
      chatData?.choices?.[0]?.message?.content ??
      chatData?.result?.response ??
      chatData?.response ??
      ''

    // Sources come from the retrieved chunks on the chat response.
    const chunks: AiSearchChunk[] = chatData?.chunks ?? chatData?.result?.chunks ?? []
    const sources: { url: string; title: string }[] = []
    const seen = new Set<string>()
    for (const c of chunks) {
      const src = chunkToSource(c)
      if (!src) continue
      // Collapse locale variants (same page title / same path minus locale prefix).
      let canonical = src.title.toLowerCase()
      try {
        const p = new URL(src.url).pathname.replace(/^\/[a-z]{2}(\/|$)/, '/')
        canonical = `${src.title.toLowerCase()}|${p}`
      } catch {
        /* keep title-only key */
      }
      if (!seen.has(canonical)) {
        seen.add(canonical)
        sources.push(src)
      }
      if (sources.length >= 4) break
    }

    return NextResponse.json({ success: true, answer, sources })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

/**
 * TinyFishProspector — Standalone B2B discovery utility.
 *
 * Uses TinyFish Search + Fetch APIs only. Zero Node.js builtins, zero local
 * filesystem access. Safe to run on the Cloudflare Edge (V8 isolates).
 *
 * APIs used:
 *   Search  GET  https://api.search.tinyfish.ai?query=<q>
 *   Fetch   POST https://api.fetch.tinyfish.ai   { urls, format: "markdown" }
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExtractedLead {
  company: string
  contactName: string
  location: string
  email: string
  phone: string
  request: string   // buying lead / inquiry snippet
  source: string    // URL the lead came from
}

export interface TinyFishSearchResult {
  position: number
  title: string
  url: string
  site_name: string
  snippet: string
  date?: string
}

export interface TinyFishSearchResponse {
  query: string
  results: TinyFishSearchResult[]
  total_results: number
  page: number
}

export interface TinyFishFetchResult {
  url: string
  final_url: string
  title: string
  description: string
  text: string          // clean markdown content
  language: string | null
  author: string | null
  published_date: string | null
  latency_ms: number
  format: string
}

export interface TinyFishFetchResponse {
  results: TinyFishFetchResult[]
  errors: Array<{ url: string; error: string }>
}

export interface DiscoveryResult {
  niche: string
  location: string
  query: string
  searchHits: TinyFishSearchResult[]   // raw search results (all)
  fetchedPages: TinyFishFetchResult[]  // fetched content for top URLs
  leads: ExtractedLead[]               // structured lead objects with email/phone
  chatOutput: string                   // clean formatted reply ready for HarvyX chat
  markdown: string                     // full raw markdown (for LLM / advanced use)
}

// ─── Prospector class ─────────────────────────────────────────────────────────

export class TinyFishProspector {
  private readonly apiKey: string
  private readonly searchBase = 'https://api.search.tinyfish.ai'
  private readonly fetchBase  = 'https://api.fetch.tinyfish.ai'

  /**
   * @param apiKey  Your TinyFish API key. Defaults to process.env.TINYFISH_API_KEY.
   */
  constructor(apiKey?: string) {
    const key = apiKey || (typeof process !== 'undefined' ? process.env.TINYFISH_API_KEY : '') || ''
    if (!key) throw new Error('TinyFishProspector: TINYFISH_API_KEY is required.')
    this.apiKey = key
  }

  // ── Internal: Search ────────────────────────────────────────────────────────

  private async search(query: string, limit = 10): Promise<TinyFishSearchResult[]> {
    const url = `${this.searchBase}?query=${encodeURIComponent(query)}&limit=${limit}`
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'X-API-Key': this.apiKey },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`TinyFish Search ${res.status}: ${body.slice(0, 200)}`)
    }
    const data: TinyFishSearchResponse = await res.json()
    return data.results ?? []
  }

  // ── Internal: Fetch pages → markdown ───────────────────────────────────────

  private async fetchPages(urls: string[]): Promise<TinyFishFetchResult[]> {
    if (!urls.length) return []
    const res = await fetch(this.fetchBase, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls, format: 'markdown' }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`TinyFish Fetch ${res.status}: ${body.slice(0, 200)}`)
    }
    const data: TinyFishFetchResponse = await res.json()
    return data.results ?? []
  }

  // ── Static: Extract structured leads from raw markdown ────────────────────

  /**
   * Parse raw markdown (from fetched pages + snippets) into clean lead objects.
   *
   * Strategy:
   *  1. Split the full markdown by `## ` page-level headers → one block per fetched page.
   *  2. Each page block has a `**Source:** URL` line → extract as source.
   *  3. Within each page block, split by `### ` entry-level headers (individual
   *     buyer/inquiry records in B2B directory sites) → get the entry title as company/name.
   *  4. Within each entry, regex-scan for email + phone.
   *  5. De-duplicate on email. Cap total at MAX_LEADS.
   */
  static extractLeads(markdown: string, sourceUrl = ''): ExtractedLead[] {
    const MAX_LEADS = 15
    const leads: ExtractedLead[] = []
    const seenEmails = new Set<string>()

    const EMAIL_RE = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi
    const PHONE_RE = /(?:\+[\d().\s-]{7,20}|\b(?:00|\(0\)|0)[\d().\s-]{7,16})/g

    // Junk company strings to discard
    const JUNK_COMPANY = [
      /^thanks/i, /^regards/i, /^sincerely/i, /^dear/i,
      /^please/i, /^note:/i, /^re:/i, /^fwd:/i,
      /^looking forward/i, /^awaiting/i, /^we are/i,
      /^feel free/i, /^kindly/i, /^hope/i,
    ]

    // ── Split into per-page blocks (## level) ────────────────────────────────
    const pageBlocks = markdown.split(/\n(?=## )/)

    for (const pageBlock of pageBlocks) {
      // Extract the source URL from this page block
      const srcMatch = pageBlock.match(/\*\*Source:\*\*\s*(https?:\/\/[^\s\n]+)/)
      const src = (srcMatch ? srcMatch[1] : sourceUrl).trim()

      // Split this page into per-entry segments (### level = individual lead record)
      const entryBlocks = pageBlock.split(/\n(?=### )/)

      for (const entry of entryBlocks) {
        if (leads.length >= MAX_LEADS) break

        const emails = Array.from(entry.matchAll(EMAIL_RE), (m) => m[0].toLowerCase())
        const phones = Array.from(entry.matchAll(PHONE_RE), (m) => m[0].trim())

        for (const email of emails) {
          if (leads.length >= MAX_LEADS) break
          if (seenEmails.has(email)) continue
          // Skip obvious test / placeholder emails
          if (/example|test|noreply|no-reply|admin@|info@example|hello@example/.test(email)) continue
          seenEmails.add(email)

          // The ### header line = company / lead title
          const headerMatch = entry.match(/^###\s+(.+)/m)
          const rawCompany  = headerMatch ? headerMatch[1].replace(/[*_]/g, '').trim() : ''

          // Validate company field — discard junk phrases
          const company = JUNK_COMPANY.some((re) => re.test(rawCompany)) ? '' : rawCompany.slice(0, 80)

          // Use a tight ±300-char window around the email to avoid bleeding data from other leads
          const emailIdx = entry.indexOf(email)
          const window   = entry.slice(Math.max(0, emailIdx - 300), emailIdx + 250)

          // Extract phones only within the local window
          const localPhones = Array.from(window.matchAll(PHONE_RE), (m) => m[0].trim())

          // Nearest phone — pick the one whose position is closest to the email
          let nearestPhone = ''
          let minDist = Infinity
          for (const ph of localPhones) {
            const phIdx = window.indexOf(ph)
            const emailLocalIdx = window.indexOf(email)
            const dist = Math.abs(phIdx - emailLocalIdx)
            if (dist < minDist) { minDist = dist; nearestPhone = ph }
          }

          const ctxLines = window.split('\n').map((l) => l.replace(/[*#>_|]/g, '').trim()).filter(Boolean)

          const LOCATION_RE = /\b(Poland|Warsaw|Krak[oó]w|Gda[ńn]sk|Pozna[ńn]|Wroc[łl]aw|[A-Z][a-z]+ Poland)\b/i
          const locationLine = ctxLines.find((l) => LOCATION_RE.test(l)) || ''

          // Request/note: first complete sentence with 30+ chars that starts with capital letter
          const requestLine = ctxLines.find(
            (l) =>
              l.length > 30 &&
              /^[A-Z]/.test(l) &&            // starts with capital — avoids cut-off fragments
              !l.includes(email) &&
              !l.includes('@') &&
              !JUNK_COMPANY.some((re) => re.test(l)) &&
              !/^https?:/.test(l)
          ) || ''

          leads.push({
            company,
            contactName: '',
            location:    locationLine.slice(0, 80),
            email,
            phone:       nearestPhone.replace(/\s+/g, ' ').trim(),
            request:     requestLine.slice(0, 180),
            source:      src,
          })
        }
      }

      if (leads.length >= MAX_LEADS) break
    }

    return leads
  }

  /**
   * Format extracted leads into a clean, scannable HarvyX chat reply.
   */
  static formatLeadsAsChat(
    leads: ExtractedLead[],
    niche: string,
    location: string,
    searchHits: TinyFishSearchResult[],
  ): string {
    const lines: string[] = []

    const leadWord = leads.length === 1 ? 'lead' : 'leads'
    lines.push(`**🔍 B2B Discovery: ${niche} — ${location}**`)
    lines.push(`Extracted **${leads.length}** ${leadWord} with direct contact info from ${searchHits.length} search results.\n`)

    if (leads.length === 0) {
      lines.push('> ⚠️ No direct email/phone found in fetched pages. Use the source links below to research manually.')
    } else {
      leads.forEach((lead, i) => {
        lines.push(`---`)
        lines.push(`**Lead ${i + 1}${lead.company ? ` — ${lead.company}` : ''}**`)
        if (lead.location)    lines.push(`📍 ${lead.location}`)
        if (lead.email)       lines.push(`📧 ${lead.email}`)
        if (lead.phone)       lines.push(`📞 ${lead.phone}`)
        if (lead.request)     lines.push(`💬 ${lead.request}`)
        if (lead.source)      lines.push(`🔗 [View source](${lead.source})`)
      })
      lines.push('---')
    }

    // Always append top search results as reference links
    if (searchHits.length > 0) {
      lines.push('\n---\n**📋 Top Search Results**')
      searchHits.slice(0, 6).forEach((h) => {
        lines.push(`• **[${h.title}](${h.url})** — ${h.snippet.slice(0, 100)}…`)
      })
    }

    return lines.join('\n')
  }

  // ── Internal: Detect JS-gated / login-walled / empty pages ────────────────

  private isUsefulPage(page: TinyFishFetchResult): boolean {
    const text = (page.text || '').trim()
    if (text.length < 200) return false

    const lower = text.toLowerCase()
    const JUNK_SIGNALS = [
      'javascript is disabled',
      'please enable javascript',
      'please click here to check who',
      'you need to enable javascript',
      'sign in to continue',
      'log in to view',
      'create a free account',
      'subscribe to access',
      'verify you are human',
      'checking your browser',
      'enable cookies',
      'access denied',
      '403 forbidden',
      'captcha',
    ]
    const junkHits = JUNK_SIGNALS.filter((s) => lower.includes(s)).length
    if (junkHits >= 1 && text.length < 1000) return false

    return true
  }

  // ── Public: discoverRawLeads ────────────────────────────────────────────────

  /**
   * Searches for B2B leads in a given niche + location, fetches the top
   * directory/listing pages, and returns clean markdown text ready to be
   * processed by an LLM or stored directly.
   *
   * @param niche     e.g. "denim fabric importer", "FMCG wholesaler"
   * @param location  e.g. "Warsaw Poland", "Dubai UAE"
   * @param topN      How many search results to fetch full content for (default 4)
   * @returns         Combined markdown string from all fetched pages
   */
  async discoverRawLeads(niche: string, location: string, topN = 4): Promise<string> {
    const result = await this.discover(niche, location, topN)
    return result.markdown
  }

  /**
   * Full discovery — returns structured result with search hits AND fetched
   * page content. Use this when you need more than the raw markdown.
   */
  async discover(niche: string, location: string, topN = 4): Promise<DiscoveryResult> {
    // Contact-focused query — surfaces company pages with emails/phones over
    // login-walled B2B aggregators.
    const query = `"${location}" "${niche}" importer buyer contact email`

    // 1. Primary search
    const hits = await this.search(query, 10)

    // 2. Skip social/video/aggregator/JS-heavy directory sites that rarely
    //    expose real contact info via static fetch.
    const SKIP_DOMAINS = [
      'instagram.com', 'facebook.com', 'youtube.com', 'twitter.com',
      'x.com', 'tiktok.com', 'linkedin.com', 'yelp.com',
      'go4worldbusiness.com', 'volza.com', 'trademo.com',  // login-walled
      'scribd.com',                                         // paywall
      'tradekey.com', 'alibaba.com', 'made-in-china.com',  // JS-heavy / login
    ]

    const candidates = hits
      .filter((h) => !SKIP_DOMAINS.some((d) => h.url.includes(d)))

    // Fetch up to (topN + 3) candidates so we have spares if some are junk.
    const fetchBatch = candidates.slice(0, Math.min(topN + 3, 8)).map((h) => h.url)

    // 3. Fetch → markdown
    const allFetched = await this.fetchPages(fetchBatch)

    // 4. Filter out JS-gated / empty pages, keep up to topN useful ones.
    const fetched = allFetched.filter((p) => this.isUsefulPage(p)).slice(0, topN)

    // 5. Build combined markdown sections from useful pages.
    const sections = fetched.map((page) => {
      const header = [
        `## ${page.title || page.url}`,
        page.description ? `> ${page.description}` : '',
        `**Source:** ${page.final_url}`,
        '',
      ]
        .filter(Boolean)
        .join('\n')
      return `${header}\n${page.text ?? ''}`
    })

    // 6. Append search-snippets for all hits not fully fetched (always useful
    //    as a lead list even without full page content).
    const fetchedUrls = new Set(allFetched.map((p) => p.url))
    const snippetSection = hits
      .filter((h) => !fetchedUrls.has(h.url))
      .slice(0, 8)
      .map((h) => `- **[${h.title}](${h.url})** — ${h.site_name}${h.date ? ` (${h.date})` : ''}\n  ${h.snippet}`)
      .join('\n')

    const markdown = [
      `# B2B Discovery: ${niche} in ${location}`,
      `**Query:** \`${query}\``,
      `**Search hits:** ${hits.length} | **Pages with content:** ${fetched.length}`,
      '',
      ...sections,
      snippetSection
        ? `\n## Search snippets (additional leads)\n${snippetSection}`
        : '',
    ]
      .join('\n\n')
      .trim()

    const leads = TinyFishProspector.extractLeads(markdown)
    const chatOutput = TinyFishProspector.formatLeadsAsChat(leads, niche, location, hits)

    return { niche, location, query, searchHits: hits, fetchedPages: fetched, leads, chatOutput, markdown }
  }
}

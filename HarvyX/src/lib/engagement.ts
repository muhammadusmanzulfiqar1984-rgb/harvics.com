/**
 * HarvyX Concierge — engagement persistence, analytics, itinerary helpers.
 */

export type ChatRole = 'user' | 'assistant' | 'system' | 'voice'

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  ts: number
  source?: 'text' | 'voice' | 'quick' | 'intent' | 'upload'
}

export type TravelerProfile = {
  displayName: string
  email: string
  preferredClass: 'economy' | 'business' | 'first' | 'private'
  preferredAirlines: string
  dietary: string
  homeCity: string
  languages: string
  notes: string
}

export type CultureMemory = {
  tips: string[]
  cityNotes: Record<string, string>
  phrases: { lang: string; phrase: string; meaning: string }[]
}

export type ItineraryItem = {
  id: string
  type: 'flight' | 'hotel' | 'transfer' | 'dining' | 'meeting' | 'other'
  title: string
  when: string
  meta?: string
}

export type AnalyticsEvent = {
  name: string
  ts: number
  props?: Record<string, string | number | boolean>
}

const KEYS = {
  chat: 'harvyx_concierge_chat_v1',
  profile: 'harvyx_concierge_profile_v1',
  culture: 'harvyx_concierge_culture_v1',
  itinerary: 'harvyx_concierge_itinerary_v1',
  draft: 'harvyx_concierge_draft_v1',
  dark: 'harvyx_concierge_dark_v1',
  analytics: 'harvyx_concierge_analytics_v1',
} as const

export const DEFAULT_PROFILE: TravelerProfile = {
  displayName: 'Executive Guest',
  email: '',
  preferredClass: 'business',
  preferredAirlines: 'Emirates, Qatar Airways',
  dietary: '',
  homeCity: '',
  languages: 'en',
  notes: '',
}

export const DEFAULT_CULTURE: CultureMemory = {
  tips: [],
  cityNotes: {},
  phrases: [],
}

export const EXECUTIVE_INTENTS = [
  { id: 'flight', label: 'Book flight', prompt: 'Find first / business class options for my next trip. Prefer preferred airlines and flexible timing.' },
  { id: 'hotel', label: 'Reserve hotel', prompt: 'Suggest 5-star hotels near my destination with suite availability and late checkout.' },
  { id: 'chauffeur', label: 'Chauffeur', prompt: 'Arrange a chauffeur transfer from airport to hotel. Prefer Mercedes S-Class or equivalent.' },
  { id: 'dining', label: 'Restaurant', prompt: 'Book a fine dining table tonight — Michelin if available. Note dietary preferences from my profile.' },
  { id: 'meeting', label: 'Meeting room', prompt: 'Find a private meeting room or hotel boardroom for tomorrow afternoon.' },
  { id: 'itinerary', label: 'Build itinerary', prompt: 'Summarize my current trip into a clean executive itinerary with times and confirmation refs.' },
] as const

export const QUICK_REPLIES = [
  'Confirm',
  'Change time',
  'Upgrade cabin',
  'Send alternatives',
  'Hold with HPay',
  'Escalate to human',
] as const

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function loadChat(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  return safeParse(localStorage.getItem(KEYS.chat), [])
}

export function saveChat(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.chat, JSON.stringify(messages.slice(-200)))
}

export function loadProfile(): TravelerProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE
  return { ...DEFAULT_PROFILE, ...safeParse(localStorage.getItem(KEYS.profile), {}) }
}

export function saveProfile(profile: TravelerProfile) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.profile, JSON.stringify(profile))
}

export function loadCulture(): CultureMemory {
  if (typeof window === 'undefined') return DEFAULT_CULTURE
  return { ...DEFAULT_CULTURE, ...safeParse(localStorage.getItem(KEYS.culture), {}) }
}

export function saveCulture(culture: CultureMemory) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.culture, JSON.stringify(culture))
}

export function loadItinerary(): ItineraryItem[] {
  if (typeof window === 'undefined') return []
  return safeParse(localStorage.getItem(KEYS.itinerary), [])
}

export function saveItinerary(items: ItineraryItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.itinerary, JSON.stringify(items))
}

export function loadDraft(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(KEYS.draft) || ''
}

export function saveDraft(text: string) {
  if (typeof window === 'undefined') return
  if (!text.trim()) localStorage.removeItem(KEYS.draft)
  else localStorage.setItem(KEYS.draft, text)
}

export function loadDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEYS.dark) === '1'
}

export function saveDarkMode(on: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.dark, on ? '1' : '0')
  document.documentElement.classList.toggle('harvyx-dark', on)
}

export function trackEvent(name: string, props?: AnalyticsEvent['props']) {
  if (typeof window === 'undefined') return
  const events = safeParse<AnalyticsEvent[]>(localStorage.getItem(KEYS.analytics), [])
  events.push({ name, ts: Date.now(), props })
  localStorage.setItem(KEYS.analytics, JSON.stringify(events.slice(-500)))
  // Optional bridge for main-site analytics if present
  try {
    ;(window as any).gtag?.('event', name, props || {})
  } catch {
    /* ignore */
  }
}

export function loadAnalyticsSummary(): { name: string; count: number }[] {
  if (typeof window === 'undefined') return []
  const events = safeParse<AnalyticsEvent[]>(localStorage.getItem(KEYS.analytics), [])
  const map = new Map<string, number>()
  for (const e of events) map.set(e.name, (map.get(e.name) || 0) + 1)
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

export function profileSystemHint(profile: TravelerProfile, culture: CultureMemory): string {
  const tips = culture.tips.slice(-5).join('; ')
  return [
    `Traveler: ${profile.displayName || 'Guest'}.`,
    `Class: ${profile.preferredClass}. Airlines: ${profile.preferredAirlines || 'flexible'}.`,
    profile.dietary ? `Dietary: ${profile.dietary}.` : '',
    profile.homeCity ? `Home city: ${profile.homeCity}.` : '',
    profile.languages ? `Languages: ${profile.languages}.` : '',
    profile.notes ? `Notes: ${profile.notes}.` : '',
    tips ? `Culture memory: ${tips}` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function buildItineraryShareText(items: ItineraryItem[], profile: TravelerProfile): string {
  const lines = [
    `HarvyX Concierge — Itinerary`,
    `Guest: ${profile.displayName || 'Executive'}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    ...items.map((i, n) => `${n + 1}. [${i.type.toUpperCase()}] ${i.title}${i.when ? ` — ${i.when}` : ''}${i.meta ? ` (${i.meta})` : ''}`),
    '',
    'Shared via Harvics HarvyX Concierge',
  ]
  return lines.join('\n')
}

export function buildIcsCalendar(items: ItineraryItem[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const events = items
    .map((item) => {
      const uid = `${item.id}@harvyx.harvics`
      const start = stamp.slice(0, 8) + 'T120000Z'
      const end = stamp.slice(0, 8) + 'T130000Z'
      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}Z`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${(item.title || 'HarvyX item').replace(/,/g, '\\,')}`,
        `DESCRIPTION:${((item.meta || item.type) + '').replace(/,/g, '\\,')}`,
        'END:VEVENT',
      ].join('\r\n')
    })
    .join('\r\n')

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Harvics//HarvyX Concierge//EN', events, 'END:VCALENDAR'].join('\r\n')
}

export function downloadText(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

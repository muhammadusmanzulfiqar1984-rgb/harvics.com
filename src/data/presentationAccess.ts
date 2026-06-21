import type { PresentationCategory, PresentationId } from '@/data/presentationsCatalog'

export type PresentationZone = 'lobby' | 'lounge'

export interface PresentationAccessGrant {
  zone: PresentationZone
  deckId?: PresentationId
  label: string
}

/** Single source of truth for presentation pin/password access (NOT CRM login). */
export const presentationAccessCodes: Record<string, PresentationAccessGrant> = {
  // Lobby — general Harvics decks
  lobby: { zone: 'lobby', label: 'Lobby Access' },
  HGVLOBBY: { zone: 'lobby', label: 'Lobby Access' },

  // Lounge — all customised programme decks
  lounge: { zone: 'lounge', label: 'Lounge Access' },
  HGVLOUNGE: { zone: 'lounge', label: 'Lounge Access' },

  // Direct deck access
  '222': { zone: 'lounge', deckId: 'textiles-lpp', label: 'LPP Board' },
  lpp2026: { zone: 'lounge', deckId: 'textiles-lpp', label: 'LPP Board' },
  mafi222: { zone: 'lounge', deckId: 'fmcg-mafi', label: 'MAFI Programme' },
  denim2026: { zone: 'lounge', deckId: 'textiles-vietnam-denim', label: 'Vietnam Denim' },
  vndenim: { zone: 'lounge', deckId: 'textiles-vietnam-denim', label: 'Vietnam Denim' },
}

export const LA_PRES_NAME = 'La Pres'

/** All presentation routes live under this path only. */
export const LA_PRES_ENTRY_PATH = 'la-pres'

export function laPresUrl(locale: string, ...segments: string[]): string {
  const tail = segments.filter(Boolean).join('/')
  return tail ? `/${locale}/${LA_PRES_ENTRY_PATH}/${tail}` : `/${locale}/${LA_PRES_ENTRY_PATH}`
}

export const PRESENTATION_SESSION_KEY = 'harvics_presentation_access'

export function resolveAccessCode(code: string): PresentationAccessGrant | null {
  const normalized = code.trim()
  if (!normalized) return null
  if (presentationAccessCodes[normalized]) {
    return presentationAccessCodes[normalized]
  }
  const lower = normalized.toLowerCase()
  const match = Object.entries(presentationAccessCodes).find(([key]) => key.toLowerCase() === lower)
  if (match) return match[1]
  // Allow spaced variants e.g. "mafi 222" → mafi222
  const compact = lower.replace(/\s+/g, '')
  const compactMatch = Object.entries(presentationAccessCodes).find(
    ([key]) => key.toLowerCase().replace(/\s+/g, '') === compact
  )
  return compactMatch ? compactMatch[1] : null
}

export function savePresentationSession(grant: PresentationAccessGrant): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(PRESENTATION_SESSION_KEY, JSON.stringify(grant))
  
  // Bridge access to the static LPP presentation iframe
  if (grant.deckId === 'textiles-lpp') {
    sessionStorage.setItem('lpp_presentation_access', 'granted')
  }
}

export function readPresentationSession(): PresentationAccessGrant | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(PRESENTATION_SESSION_KEY)
    return raw ? (JSON.parse(raw) as PresentationAccessGrant) : null
  } catch {
    return null
  }
}

export function clearPresentationSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(PRESENTATION_SESSION_KEY)
  sessionStorage.removeItem('lpp_presentation_access')
}

export function canAccessZone(session: PresentationAccessGrant | null, zone: PresentationZone): boolean {
  if (!session) return false
  if (session.zone === zone) return true
  return false
}

export function canAccessDeck(
  session: PresentationAccessGrant | null,
  deckId: PresentationId,
  deckCategory: PresentationCategory
): boolean {
  if (!session) return false
  if (session.deckId === deckId) return true
  if (session.zone === 'lobby' && deckCategory === 'lobby') return true
  if (session.zone === 'lounge' && deckCategory === 'lounge') return true
  return false
}

/**
 * Harvics Meet — LiveKit + Prisma meeting platform helpers.
 */

import { AccessToken } from 'livekit-server-sdk'
import { randomBytes } from 'crypto'

export const MEET_APP_NAME = 'Harvics Meet'
export const MEET_ENTRY_PATH = 'meet'
export const MEET_APPS_PATH = 'apps/meet'
export const MEET_NAME_KEY = 'harvics_meet_display_name'

export function meetWebUrl(locale: string, ...segments: string[]): string {
  const tail = segments.filter(Boolean).join('/')
  return tail ? `/${locale}/${MEET_ENTRY_PATH}/${tail}` : `/${locale}/${MEET_ENTRY_PATH}`
}

export function meetAppsUrl(locale: string, ...segments: string[]): string {
  const tail = segments.filter(Boolean).join('/')
  return tail ? `/${locale}/${MEET_APPS_PATH}/${tail}` : `/${locale}/${MEET_APPS_PATH}`
}

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'meeting'
  return `${base}-${randomBytes(3).toString('hex')}`
}

export function livekitConfigured(): boolean {
  return Boolean(
    process.env.LIVEKIT_URL &&
      process.env.LIVEKIT_API_KEY &&
      process.env.LIVEKIT_API_SECRET,
  )
}

export function getLiveKitConfig() {
  const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || ''
  const apiKey = process.env.LIVEKIT_API_KEY || ''
  const apiSecret = process.env.LIVEKIT_API_SECRET || ''
  if (!url || !apiKey || !apiSecret) {
    throw new Error(
      'LiveKit not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET.',
    )
  }
  return { url, apiKey, apiSecret }
}

export async function mintLiveKitToken(opts: {
  roomName: string
  identity: string
  name: string
  canPublish?: boolean
  canSubscribe?: boolean
  metadata?: string
}): Promise<{ token: string; url: string }> {
  const { url, apiKey, apiSecret } = getLiveKitConfig()
  const at = new AccessToken(apiKey, apiSecret, {
    identity: opts.identity,
    name: opts.name,
    metadata: opts.metadata,
    ttl: '6h',
  })
  at.addGrant({
    roomJoin: true,
    room: opts.roomName,
    canPublish: opts.canPublish !== false,
    canSubscribe: opts.canSubscribe !== false,
    canPublishData: true,
  })
  return { token: await at.toJwt(), url }
}

export function buildMeetIcs(opts: {
  uid: string
  title: string
  description: string
  start: Date
  durationMins: number
  url: string
  organizerEmail?: string | null
}): string {
  const end = new Date(opts.start.getTime() + opts.durationMins * 60_000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Harvics Meet//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${opts.uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(opts.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${opts.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${opts.description.replace(/\n/g, '\\n')}`,
    `URL:${opts.url}`,
    `LOCATION:${opts.url}`,
    opts.organizerEmail ? `ORGANIZER:mailto:${opts.organizerEmail}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

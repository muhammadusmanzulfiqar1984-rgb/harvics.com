/**
 * Harvics Meet — Cloudflare RealtimeKit video meetings.
 *
 * This is a self-contained "Meet" area that lives alongside La Pres on the
 * login page. It is NOT company CRM sign-in — it only needs a display name to
 * start or join a room. All privileged operations (creating rooms, issuing
 * join tokens) happen server-side in the /api/meet routes.
 */

export const MEET_NAME = 'Harvics Meet'

/** All meeting routes live under this path. */
export const MEET_ENTRY_PATH = 'meet'

export function meetUrl(locale: string, ...segments: string[]): string {
  const tail = segments.filter(Boolean).join('/')
  return tail ? `/${locale}/${MEET_ENTRY_PATH}/${tail}` : `/${locale}/${MEET_ENTRY_PATH}`
}

/** sessionStorage key that carries the display name into the room page. */
export const MEET_NAME_KEY = 'harvics_meet_display_name'

/** Cloudflare RealtimeKit REST base for this account + app (server-only). */
export function realtimeApiBase(accountId: string, appId: string): string {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/realtime/kit/${appId}`
}

export interface MeetServerConfig {
  accountId: string
  appId: string
  apiToken: string
  hostPreset: string
  guestPreset: string
}

/** Read + validate server-side RealtimeKit config from env. Throws if missing. */
export function getMeetServerConfig(): MeetServerConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const appId = process.env.REALTIME_APP_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const hostPreset = process.env.REALTIME_HOST_PRESET || 'group_call_host'
  const guestPreset = process.env.REALTIME_GUEST_PRESET || 'group_call_participant'

  const missing: string[] = []
  if (!accountId) missing.push('CLOUDFLARE_ACCOUNT_ID')
  if (!appId) missing.push('REALTIME_APP_ID')
  if (!apiToken) missing.push('CLOUDFLARE_API_TOKEN')
  if (missing.length) {
    throw new Error(`Harvics Meet is not configured. Missing env: ${missing.join(', ')}`)
  }

  return {
    accountId: accountId as string,
    appId: appId as string,
    apiToken: apiToken as string,
    hostPreset,
    guestPreset,
  }
}

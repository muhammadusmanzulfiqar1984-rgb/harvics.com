/**
 * HARVYX CONCIERGE — elite executive app launch URL (iframe target).
 * Access is Clerk-gated at /[locale]/apps/harvyx-concierge
 * Local: cd HarvyX && npm run dev → http://localhost:3002
 * Prod: set NEXT_PUBLIC_HARVYX_CONCIERGE_URL to the deployed Concierge origin
 */
export function getHarvyxConciergeUrl(): string {
  const raw = process.env.NEXT_PUBLIC_HARVYX_CONCIERGE_URL || 'http://localhost:3002'
  return raw.replace(/\/$/, '')
}

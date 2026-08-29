/**
 * HPay — settlement & treasury launch URL (iframe target).
 * Local: cd "hpay (1)" && npm run dev → http://localhost:3001
 * Prod: Cloudflare Worker (override with NEXT_PUBLIC_HPAY_URL)
 */
const HPAY_CLOUDFLARE = 'https://hpay.muhammadusmanzulfiqar1984.workers.dev'

export function getHPayAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_HPAY_URL || HPAY_CLOUDFLARE
  return raw.replace(/\/$/, '')
}

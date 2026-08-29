/**
 * HARVOICE (HARVOICEX) — encrypted P2P messenger launch URL.
 * Local: HARVOICEX `npm run dev` → http://localhost:3000
 * Prod: set NEXT_PUBLIC_HARVOICE_URL (e.g. https://harvoice.vercel.app or Fly host)
 */
export function getHarvoiceAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_HARVOICE_URL || 'http://localhost:3000'
  return raw.replace(/\/$/, '')
}

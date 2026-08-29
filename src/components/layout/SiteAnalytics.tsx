'use client'

import { Analytics } from '@vercel/analytics/next'
import { usePathname } from 'next/navigation'

/** Skip Vercel Analytics on Energies so CSP / overlay noise does not sit on the page. */
export default function SiteAnalytics() {
  const pathname = usePathname()
  if (/(?:^|\/)energies(?:\/|$)/.test(pathname || '')) return null
  return <Analytics />
}

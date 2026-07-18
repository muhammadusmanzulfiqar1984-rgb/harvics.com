'use client'

import { usePathname } from 'next/navigation'

/** Hide global chrome widgets on full-screen local trial (iframe). */
export default function TrialChromeGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (/\/homepage-trial\/?$/.test(pathname || '')) return null
  return <>{children}</>
}

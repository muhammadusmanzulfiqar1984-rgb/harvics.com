'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'
import { isHarvyxAppShellPath } from './ConditionalHeader'

function shouldHideChrome(pathname: string | null): boolean {
  if (!pathname) return false
  if (/\/meet\/[^/]+/.test(pathname)) return true
  if (isHarvyxAppShellPath(pathname)) return true
  if (/(?:^|\/)doha(?:\/|$)/.test(pathname)) return true
  if (/(?:^|\/)ventures(?:\/|$)/.test(pathname)) return true
  return false
}

export default function ConditionalFooter() {
  const pathname = usePathname()
  if (shouldHideChrome(pathname)) return null
  return (
    <div className="relative z-[200] isolate" style={{ background: 'var(--harvics-cream)' }}>
      <Footer />
    </div>
  )
}

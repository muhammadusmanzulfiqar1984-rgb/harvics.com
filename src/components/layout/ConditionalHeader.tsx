'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import type { ProductCategory } from '@/data/folderBasedProducts'

/** True for HarvyX app shell routes — not the public Apps store page. */
export function isHarvyxAppShellPath(pathname: string | null): boolean {
  if (!pathname) return false
  if (/\/apps\/harvyx(?:\/|$)/.test(pathname)) return false
  return /(?:^|\/)harvyx(?:\/|$)/.test(pathname)
}

function shouldHideChrome(pathname: string | null): boolean {
  if (!pathname) return false
  if (/\/meet\/[^/]+/.test(pathname)) return true
  if (/\/apps\/harvyx-concierge(?:\/|$)/.test(pathname)) return true
  if (/\/apps\/harvoice(?:\/|$)/.test(pathname)) return true
  if (/(?:^|\/)doha(?:\/|$)/.test(pathname)) return true
  if (/(?:^|\/)ventures(?:\/|$)/.test(pathname)) return true
  if (isHarvyxAppShellPath(pathname)) return true
  return false
}

interface ConditionalHeaderProps {
  categories?: ProductCategory[]
}

export default function ConditionalHeader({
  categories = [],
}: ConditionalHeaderProps) {
  const pathname = usePathname()
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(136)
  const hideChrome = shouldHideChrome(pathname)

  useEffect(() => {
    if (hideChrome) {
      document.documentElement.style.setProperty('--harvics-header-h', '0px')
      return
    }

    const measure = () => {
      if (headerRef.current) {
        const h = headerRef.current.offsetHeight
        setHeaderHeight(h)
        document.documentElement.style.setProperty('--harvics-header-h', `${h}px`)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [hideChrome])

  if (hideChrome) return null

  return (
    <>
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-[1000] overflow-visible">
        <Header categories={categories} />
      </div>
      <div style={{ height: headerHeight }} />
    </>
  )
}

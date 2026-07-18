'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import type { ProductCategory } from '@/data/folderBasedProducts'

interface ConditionalHeaderProps {
  categories?: ProductCategory[]
}

export default function ConditionalHeader({ 
  categories = []
}: ConditionalHeaderProps) {
  const pathname = usePathname()
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(136)
  const hideForMeetRoom = /\/meet\/[^/]+/.test(pathname || '')
  const hideForHomepageTrial = /\/homepage-trial\/?$/.test(pathname || '')
  const hideChrome = hideForMeetRoom || hideForHomepageTrial

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
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-[1000]">
        <Header categories={categories} />
      </div>
      <div style={{ height: headerHeight }} />
    </>
  )
}


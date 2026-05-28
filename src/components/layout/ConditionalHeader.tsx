'use client'

import { useEffect, useRef, useState } from 'react'
import Header from './Header'
import type { ProductCategory } from '@/data/folderBasedProducts'

interface ConditionalHeaderProps {
  categories?: ProductCategory[]
}

export default function ConditionalHeader({ 
  categories = []
}: ConditionalHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(136)

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        const h = headerRef.current.offsetHeight
        setHeaderHeight(h)
        document.documentElement.style.setProperty('--harvics-header-h', `${h}px`)
      }
    }
    measure()
    // Re-measure on resize (T3 nav shows/hides based on width)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  
  return (
    <>
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-[1000]">
        <Header categories={categories} />
      </div>
      {/* Dynamic spacer — matches actual header height at any screen width */}
      <div style={{ height: headerHeight }} />
    </>
  )
}


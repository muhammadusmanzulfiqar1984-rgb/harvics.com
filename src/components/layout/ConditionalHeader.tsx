'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import type { ProductCategory } from '@/data/folderBasedProducts'

interface ConditionalHeaderProps {
  categories?: ProductCategory[]
  hideOnPaths?: string[]
}

export default function ConditionalHeader({ 
  categories = [], 
  hideOnPaths = [] 
}: ConditionalHeaderProps) {
  const pathname = usePathname()
  
  const shouldHide = hideOnPaths.some(path => pathname.includes(path))
  const isAnalyticsPage = pathname.includes('/reports/analytics')
  
  if (shouldHide || isAnalyticsPage) {
    return null
  }
  
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[1000]" style={{ background: '#F5F1E8' }}>
        <Header categories={categories} />
      </div>
      {/* Spacer: T1(32px) + T2(64px) + T3 nav(40px) = ~136px */}
      <div className="h-[136px]" />
    </>
  )
}


'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// Pages with their own full-screen layouts — skip transition (avoids opacity:0 flash)
const NO_TRANSITION_PATHS = ['/portal/', '/os/', '/dashboard/', '/admin/']

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const skipTransition = NO_TRANSITION_PATHS.some(p => pathname?.includes(p))
  const [visible, setVisible] = useState(true)

  // Only animate on route changes — never fires on data loading / state changes
  useEffect(() => {
    if (skipTransition) {
      setVisible(true)
      return
    }
    setVisible(false)
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  if (skipTransition) {
    return <>{children}</>
  }

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {children}
    </div>
  )
}

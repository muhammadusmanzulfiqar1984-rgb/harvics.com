'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * PageTransition — Wraps page content with a fade/slide transition
 * on route changes. Uses Next.js pathname to detect navigation.
 * Provides a smooth cinematic feel between page loads.
 */
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [displayChildren, setDisplayChildren] = useState(children)
  const prevPathname = useRef(pathname)

  useEffect(() => {
    // On route change, fade out → swap content → fade in
    if (pathname !== prevPathname.current) {
      setIsVisible(false)

      const timer = setTimeout(() => {
        setDisplayChildren(children)
        prevPathname.current = pathname

        // Small delay then fade in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsVisible(true)
            // Scroll to top on navigation
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
          })
        })
      }, 250) // Duration of fade-out

      return () => clearTimeout(timer)
    } else {
      setDisplayChildren(children)
    }
  }, [pathname, children])

  return (
    <div
      className="page-transition-wrapper"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'opacity, transform',
        minHeight: '100vh',
      }}
    >
      {displayChildren}
    </div>
  )
}

export default PageTransition

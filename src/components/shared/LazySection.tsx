'use client'

import React, { useState, useEffect, useRef } from 'react'

interface LazySectionProps {
  children: React.ReactNode
  minHeight?: string
  rootMargin?: string
}

export default function LazySection({ children, minHeight = '100vh', rootMargin = '200px' }: LazySectionProps) {
  const [isRendered, setIsRendered] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // If IntersectionObserver is not supported, just render the content immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsRendered(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsRendered(true)
          // Once rendered, we don't need to observe anymore
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current)
          }
        }
      },
      { rootMargin } // Start loading a bit before it enters the viewport
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [rootMargin])

  return (
    <div ref={sectionRef} style={{ minHeight: isRendered ? 'auto' : minHeight, width: '100%' }}>
      {isRendered ? children : null}
    </div>
  )
}

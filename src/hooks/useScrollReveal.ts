'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

/**
 * useScrollReveal — Global scroll reveal hook.
 * Elements fade + slide in when they enter the viewport.
 * Matches SUPREME's IntersectionObserver reveal system.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, isVisible }
}

/**
 * Reveal wrapper CSS classes.
 * Use with className={revealClass(isVisible, 'up' | 'left' | 'right' | 'fade')}
 */
export function revealClass(
  isVisible: boolean,
  direction: 'up' | 'left' | 'right' | 'fade' | 'scale' = 'up',
  delay: number = 0
): string {
  const base = 'transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]'
  const delayStyle = delay > 0 ? `delay-[${delay}ms]` : ''

  const hidden: Record<string, string> = {
    up: 'opacity-0 translate-y-12',
    left: 'opacity-0 -translate-x-12',
    right: 'opacity-0 translate-x-12',
    fade: 'opacity-0',
    scale: 'opacity-0 scale-95',
  }

  const visible = 'opacity-100 translate-x-0 translate-y-0 scale-100'

  return `${base} ${delayStyle} ${isVisible ? visible : hidden[direction]}`
}

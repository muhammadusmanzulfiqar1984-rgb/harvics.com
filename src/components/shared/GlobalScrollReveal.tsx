'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * GlobalScrollReveal — Auto-applies scroll reveal animations to ALL pages.
 * Mounted once in layout.tsx. Uses MutationObserver to catch dynamically added elements.
 * Any element with data-reveal or any <section> auto-animates on scroll.
 * 
 * IMPORTANT: Elements already in viewport are revealed immediately to prevent
 * invisible sections after client-side navigation.
 */
export default function GlobalScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    const REVEAL_SELECTOR = '[data-reveal], .reveal-on-scroll'

    function isInViewport(el: Element): boolean {
      const rect = el.getBoundingClientRect()
      return rect.top < window.innerHeight && rect.bottom > 0
    }

    function applyObserver(el: Element) {
      if ((el as any).__revealed) return
      ;(el as any).__revealed = true
      el.classList.add('scroll-reveal')

      // If element is already in viewport, reveal immediately
      if (isInViewport(el)) {
        requestAnimationFrame(() => {
          el.classList.add('scroll-revealed')
        })
        return
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-revealed')
            observer.unobserve(entry.target)
          }
        },
        { threshold: 0.05, rootMargin: '50px 0px 0px 0px' }
      )
      observer.observe(el)
    }

    // On route change, clear old flags so sections can re-animate
    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      ;(el as any).__revealed = false
      el.classList.remove('scroll-reveal', 'scroll-revealed')
    })

    // Apply to matching elements (only opt-in, NOT every section)
    document.querySelectorAll(REVEAL_SELECTOR).forEach(applyObserver)

    // Watch for new elements (dynamic content)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.matches(REVEAL_SELECTOR)) applyObserver(node)
            node.querySelectorAll(REVEAL_SELECTOR).forEach(applyObserver)
          }
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => mo.disconnect()
  }, [pathname])

  return null
}

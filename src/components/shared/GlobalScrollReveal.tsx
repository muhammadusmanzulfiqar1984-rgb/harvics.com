'use client'

import { useEffect } from 'react'

/**
 * GlobalScrollReveal — Auto-applies scroll reveal animations to ALL pages.
 * Mounted once in layout.tsx. Uses MutationObserver to catch dynamically added elements.
 * Any element with data-reveal or any <section> auto-animates on scroll.
 */
export default function GlobalScrollReveal() {
  useEffect(() => {
    const REVEAL_SELECTOR = 'section, [data-reveal], .reveal-on-scroll'

    function applyObserver(el: Element) {
      if ((el as any).__revealed) return
      ;(el as any).__revealed = true
      el.classList.add('scroll-reveal')

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-revealed')
            observer.unobserve(entry.target)
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      )
      observer.observe(el)
    }

    // Apply to all existing elements
    document.querySelectorAll(REVEAL_SELECTOR).forEach(applyObserver)

    // Watch for new elements (page navigations, dynamic content)
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
  }, [])

  return null
}

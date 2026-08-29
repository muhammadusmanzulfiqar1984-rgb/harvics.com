'use client'

import { useEffect } from 'react'

/**
 * Scroll polish for homepage sections.
 * Does NOT hide content — apple-effects.css only animates .is-visible.
 */
export default function AppleStyleScrollEffects() {
  useEffect(() => {
    const homepageMain = document.getElementById('homepage-main')
    if (!homepageMain) return

    const overflowY = getComputedStyle(homepageMain).overflowY
    const isScrollport = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'
    const root: Element | null = isScrollport ? homepageMain : null

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { root, threshold: [0, 0.12], rootMargin: '0px 0px -6% 0px' },
    )

    const elements = homepageMain.querySelectorAll(':scope > [data-animate], :scope > [data-frame], :scope > section, :scope > div')
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        el.classList.add('is-visible')
      }
      observer.observe(el)
    })

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const parallaxElements = reduceMotion
      ? []
      : (Array.from(document.querySelectorAll('[data-parallax]')) as HTMLElement[])

    let raf = 0
    const handleScroll = () => {
      if (!parallaxElements.length) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const scrolled = window.scrollY
        parallaxElements.forEach((el) => {
          const speed = parseFloat(el.dataset.parallaxSpeed || '0.5')
          el.style.transform = `translate3d(0, ${-(scrolled * speed)}px, 0)`
        })
      })
    }

    if (parallaxElements.length) {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      if (parallaxElements.length) window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return null
}

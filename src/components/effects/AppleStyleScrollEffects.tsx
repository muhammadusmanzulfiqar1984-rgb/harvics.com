'use client'

import { useEffect } from 'react'

/**
 * Apple-style scroll effects
 * - Fade in elements as they enter viewport
 * - Smooth reveal animations
 * - Parallax effects
 */
export default function AppleStyleScrollEffects() {
  useEffect(() => {
    // Use the homepage snap-scroll container as the intersection root
    const scrollContainer = document.getElementById('homepage-main')

    // Intersection Observer for fade-in effects
    const observerOptions = {
      root: scrollContainer || null, // observe relative to the snap container
      threshold: [0, 0.1, 0.3, 0.5],
      rootMargin: '0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, observerOptions)

    // Observe all sections, snap frames, and annotated components
    const elements = document.querySelectorAll('#homepage-main > [data-animate], #homepage-main > [data-frame]')
    elements.forEach((el) => observer.observe(el))

    // Parallax scroll effect for hero images (skip when user prefers reduced motion)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const parallaxElements = reduceMotion
      ? []
      : Array.from(document.querySelectorAll('[data-parallax]')) as HTMLElement[]

    let raf = 0
    const handleScroll = () => {
      if (!parallaxElements.length) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const scrolled = window.scrollY
        parallaxElements.forEach((el) => {
          const speed = parseFloat(el.dataset.parallaxSpeed || '0.5')
          const yPos = -(scrolled * speed)
          el.style.transform = `translate3d(0, ${yPos}px, 0)`
        })
      })
    }

    if (parallaxElements.length) {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      if (parallaxElements.length) {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return null
}

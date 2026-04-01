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

    // Parallax scroll effect for hero images
    const handleScroll = () => {
      const scrolled = window.scrollY
      const parallaxElements = document.querySelectorAll('[data-parallax]')
      
      parallaxElements.forEach((el) => {
        const speed = parseFloat((el as HTMLElement).dataset.parallaxSpeed || '0.5')
        const yPos = -(scrolled * speed)
        ;(el as HTMLElement).style.transform = `translate3d(0, ${yPos}px, 0)`
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return null
}

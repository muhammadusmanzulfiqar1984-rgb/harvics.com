'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * LenisProvider — mounts Lenis smooth scroll site-wide and keeps
 * GSAP ScrollTrigger in sync with Lenis's virtual scroll position.
 * Renders nothing — pure side-effect component.
 */
export default function LenisProvider() {
  useEffect(() => {
    // Lightweight config — no momentum lag, just removes jank
    const lenis = new Lenis({
      duration: 0.6,
      easing: (t: number) => t,   // linear — no stickiness at all
      smoothTouch: false,
      syncTouch: false,
    })

    // Keep ScrollTrigger in sync
    lenis.on('scroll', ScrollTrigger.update)

    const tickerFn = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(tickerFn)
    }
  }, [])

  return null
}

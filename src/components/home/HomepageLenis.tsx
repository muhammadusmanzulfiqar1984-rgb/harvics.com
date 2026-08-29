'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis smooth scroll + ScrollTrigger sync.
 * Do NOT use scrollerProxy — it desyncs pin/scrub and blanks sections.
 * Do NOT ScrollTrigger.getAll().kill() on cleanup — wipes other sections (Strict Mode).
 */
export default function HomepageLenis() {
  const pathname = usePathname()
  const isHome = pathname != null && /^\/[^/]+\/?$/.test(pathname)

  useEffect(() => {
    if (!isHome) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)

    const refresh = () => {
      ScrollTrigger.refresh()
    }

    let refreshRaf = 0
    const debouncedRefresh = () => {
      cancelAnimationFrame(refreshRaf)
      refreshRaf = requestAnimationFrame(refresh)
    }

    window.addEventListener('load', refresh)
    window.addEventListener('resize', refresh)

    const t1 = window.setTimeout(refresh, 100)
    const t2 = window.setTimeout(refresh, 600)
    const t3 = window.setTimeout(refresh, 1500)
    const t4 = window.setTimeout(refresh, 3500)

    const mo = new MutationObserver(() => {
      debouncedRefresh()
    })
    const main = document.getElementById('homepage-main')
    if (main) {
      mo.observe(main, { childList: true, subtree: true })
    }

    requestAnimationFrame(refresh)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
      cancelAnimationFrame(refreshRaf)
      window.removeEventListener('load', refresh)
      window.removeEventListener('resize', refresh)
      mo.disconnect()
      lenis.destroy()
      gsap.ticker.remove(tickerFn)
      ScrollTrigger.refresh()
    }
  }, [isHome, pathname])

  return null
}

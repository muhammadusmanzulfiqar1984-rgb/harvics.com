'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Sections where Lenis smooth wheel is active (editorial + lower funnel). */
const SMOOTH_ZONE_IDS = new Set([
  'manifesto',
  'supply-chain',
  'marquee',
  'operating-model',
  'products',
  'harvics-tv',
  'apps',
  'startup-academy',
])

/** Pin / horizontal / cinematic — keep native scroll feel. */
const NATIVE_ZONE_IDS = new Set([
  'hero',
  'campaign',
  'industries',
  'network',
  'market',
  'contact',
])

function zoneAtViewportCenter(): string | null {
  const x = Math.min(window.innerWidth * 0.5, Math.max(8, window.innerWidth - 8))
  const y = window.innerHeight * 0.42
  const el = document.elementFromPoint(x, y)
  if (!el) return null

  const section = el.closest('section[id]') as HTMLElement | null
  if (section?.id) return section.id

  if (el.closest('#supply-chain')) return 'supply-chain'
  return null
}

function shouldSmoothScroll(zone: string | null): boolean {
  if (!zone) return false
  if (NATIVE_ZONE_IDS.has(zone)) return false
  return SMOOTH_ZONE_IDS.has(zone)
}

/**
 * Lenis on homepage — smooth scroll only in editorial bands.
 * Pauses during GSAP pin (proof) and horizontal industries scrub.
 */
export default function HomepageLenis() {
  const pathname = usePathname()
  const isHome = pathname != null && /^\/[^/]+\/?$/.test(pathname)

  useEffect(() => {
    if (!isHome) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.35,
    })

    let smoothActive = false

    const syncZone = () => {
      const wantSmooth = shouldSmoothScroll(zoneAtViewportCenter())
      if (wantSmooth && !smoothActive) {
        lenis.start()
        smoothActive = true
      } else if (!wantSmooth && smoothActive) {
        lenis.stop()
        smoothActive = false
      }
    }

    lenis.on('scroll', () => {
      ScrollTrigger.update()
      syncZone()
    })

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)

    const refresh = () => ScrollTrigger.refresh()

    let refreshRaf = 0
    const debouncedRefresh = () => {
      cancelAnimationFrame(refreshRaf)
      refreshRaf = requestAnimationFrame(refresh)
    }

    const onNativeScroll = () => syncZone()

    window.addEventListener('load', refresh)
    window.addEventListener('resize', refresh)
    window.addEventListener('scroll', onNativeScroll, { passive: true })

    const t1 = window.setTimeout(refresh, 100)
    const t2 = window.setTimeout(refresh, 600)
    const t3 = window.setTimeout(refresh, 1500)
    const t4 = window.setTimeout(refresh, 3500)

    const mo = new MutationObserver(() => debouncedRefresh())
    const main = document.getElementById('homepage-main')
    if (main) mo.observe(main, { childList: true, subtree: true })

    lenis.stop()
    smoothActive = false
    requestAnimationFrame(() => {
      refresh()
      syncZone()
    })

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
      cancelAnimationFrame(refreshRaf)
      window.removeEventListener('load', refresh)
      window.removeEventListener('resize', refresh)
      window.removeEventListener('scroll', onNativeScroll)
      mo.disconnect()
      lenis.destroy()
      gsap.ticker.remove(tickerFn)
      ScrollTrigger.refresh()
    }
  }, [isHome, pathname])

  return null
}

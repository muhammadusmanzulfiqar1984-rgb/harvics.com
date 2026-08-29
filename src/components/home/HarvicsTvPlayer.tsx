'use client'

import { useEffect, useRef } from 'react'

const SRC = '/assets/media/video/french-tv.mp4'
const POSTER = '/assets/media/video/posters/french-fmcg.jpg'

/** Loads and plays only while the TV is on screen. Pauses off-screen. */
export default function HarvicsTvPlayer() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const el = videoRef.current
    if (!wrap || !el) return

    el.muted = true
    el.defaultMuted = true
    el.playsInline = true

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!el.getAttribute('src')) {
            el.src = SRC
            el.load()
          }
          void el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { rootMargin: '80px 0px', threshold: 0.15 },
    )

    obs.observe(wrap)
    return () => {
      obs.disconnect()
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
  }, [])

  return (
    <div ref={wrapRef} className="relative aspect-[16/9] overflow-hidden rounded-[12px] bg-black md:rounded-[14px]">
      <video
        ref={videoRef}
        poster={POSTER}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
        loop
        preload="none"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 38%)',
        }}
      />
      <div className="absolute left-4 top-4 md:left-5 md:top-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-harvics-cream/90">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          Live
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.22em] text-harvics-gold">
          Now playing
        </p>
        <p
          className="max-w-[24ch] text-harvics-cream"
          style={{
            fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
            fontSize: 'clamp(18px, 2.8vw, 28px)',
            fontWeight: 500,
            lineHeight: 1.15,
          }}
        >
          Harvics Classic
        </p>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LINE =
  'VERIFIED SUPPLY · ESCROW SETTLEMENT · 42+ MARKETS · RFQ TO DOCK · HARVICTRADE · INSTITUTIONAL TRADE · '

/**
 * Trial 05 — editorial corridor marquee on cream.
 */
export default function CorridorMarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tween = gsap.fromTo(
      track,
      { x: '5%' },
      {
        x: '-55%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="marquee"
      className="corridor-marquee overflow-hidden border-y border-harvics-gold/30 bg-harvics-cream py-3 md:py-3.5"
    >
      <div ref={trackRef} className="flex w-max whitespace-nowrap will-change-transform">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="pr-3 text-[13px] leading-none tracking-[0.06em] text-harvics-burgundy/75 md:text-[14px]"
            style={{
              fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {LINE.split(' · ').map((part, idx, arr) => (
              <span key={`${i}-${idx}`}>
                {part}
                {idx < arr.length - 1 && (
                  <em className="not-italic px-[0.25em] text-harvics-gold">·</em>
                )}
              </span>
            ))}
          </span>
        ))}
      </div>
    </section>
  )
}

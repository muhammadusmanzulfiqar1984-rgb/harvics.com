'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Proof of corridor — goal scoring clip with trial pin + blur/reveal scrub.
 */
export default function CorridorProofSection() {
  const locale = useLocale()
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLVideoElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const eyeRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const pin = pinRef.current
    const media = mediaRef.current
    const veil = veilRef.current
    if (!section || !pin || !media) return

    media.muted = true
    media.defaultMuted = true
    const tryPlay = () => {
      void media.play().catch(() => {})
    }
    tryPlay()
    media.addEventListener('loadeddata', tryPlay)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(media, { filter: 'brightness(0.72)', scale: 1 })
        if (veil) gsap.set(veil, { opacity: 0.25 })
        if (eyeRef.current) gsap.set(eyeRef.current, { opacity: 1, y: 0 })
        if (titleRef.current) gsap.set(titleRef.current, { opacity: 1, y: 0 })
        if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 1, y: 0 })
        return
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin,
        pinSpacing: true,
        scrub: true,
      })

      gsap.fromTo(
        media,
        { filter: 'blur(28px) brightness(0.4)', scale: 1.2 },
        {
          filter: 'blur(0px) brightness(0.72)',
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      )

      if (veil) {
        gsap.fromTo(
          veil,
          { opacity: 0.7 },
          {
            opacity: 0.25,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          }
        )
      }

      if (eyeRef.current) {
        gsap.fromTo(
          eyeRef.current,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: '5% top',
              end: '25% top',
              scrub: true,
            },
          }
        )
      }

      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: '8% top',
              end: '40% top',
              scrub: true,
            },
          }
        )
      }

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: '40% top',
              end: '65% top',
              scrub: true,
            },
          }
        )
      }
    }, section)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)
    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      media.removeEventListener('loadeddata', tryPlay)
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="campaign"
      className="corridor-proof relative h-[220vh] bg-harvics-burgundy md:h-[280vh]"
    >
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <video
            ref={mediaRef}
            className="h-full w-full object-cover will-change-transform"
            src="/assets/media/video/goal-score.mp4"
            poster="/assets/shared/heroes/goal-score-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
        </div>

        <div
          ref={veilRef}
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(61, 18, 18, 0.55)' }}
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 z-[3] mx-auto flex w-full max-w-harvics-layout flex-col justify-end px-6 pb-[clamp(40px,8vw,80px)] md:px-12">
          <p
            ref={eyeRef}
            className="mb-4 harvics-corridor-eyebrow tracking-[0.22em]"
          >
            03 · Proof of corridor
          </p>
          <h2
            ref={titleRef}
            className="mb-[18px] max-w-[min(16ch,92%)] harvics-corridor-display leading-[1.05] text-harvics-cream"
            style={{
              fontSize: 'clamp(32px, 5.5vw, 64px)',
            }}
          >
            Certainty at
            <br />
            every milestone.
          </h2>
          <Link
            ref={ctaRef}
            href={`/${locale}/harvictrade`}
            className="pointer-events-auto inline-flex w-fit items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1a0d00]"
            style={{
              background:
                'linear-gradient(105deg, var(--harvics-gold) 0%, var(--harvics-gold) 40%, #f0d08e 52%, var(--harvics-gold) 64%, var(--harvics-gold) 100%)',
            }}
          >
            Enter HarvicTrade
          </Link>
        </div>
      </div>
    </section>
  )
}

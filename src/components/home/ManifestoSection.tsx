'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

/**
 * Calm statement beat after the hero reel.
 * Subtle only: fade/rise, gold line draw, soft ambient wash.
 */
export default function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-12% 0px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const washY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const washOpacity = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [0.15, 0.35, 0.28, 0.1])

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative overflow-hidden border-b border-harvics-gold/20 bg-harvics-cream"
      style={{ padding: 'clamp(72px, 12vw, 120px) 0' }}
    >
      {/* Soft ambient wash — barely moves with scroll */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] top-[-20%] h-[70%] w-[55%] rounded-full"
        style={{
          y: washY,
          opacity: washOpacity,
          background:
            'radial-gradient(ellipse at center, rgba(195, 163, 94,0.16) 0%, rgba(195, 163, 94,0.04) 45%, transparent 70%)',
          filter: 'blur(2px)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-harvics-layout px-6 md:px-12">
        <div className="grid items-end gap-8 md:grid-cols-[1fr_1.2fr] md:gap-[clamp(32px,6vw,80px)]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-harvics-gold"
            >
              02 · Statement
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="harvics-corridor-display max-w-[14ch] text-harvics-burgundy"
              style={{
                fontSize: 'clamp(28px, 4.2vw, 48px)',
              }}
            >
              We do not list products. We run trade.
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.85, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="m-0 max-w-[44ch] harvics-corridor-body md:text-[17px]"
          >
            Harvics is the operating layer between buyer and supplier — from first RFQ to final
            settlement. Ten industries, one governed path, and no catalogue theatre. Every listing
            is vetted. Every milestone is tracked. Every payment is protected.
          </motion.p>
        </div>

        {/* Gold line draws left → right as the section enters */}
        <motion.div
          aria-hidden
          className="mt-[clamp(40px,6vw,64px)] h-px origin-left"
          style={{
            background: 'linear-gradient(90deg, var(--harvics-gold) 0%, rgba(195, 163, 94,0.35) 45%, transparent 100%)',
          }}
          initial={{ scaleX: 0, opacity: 0.4 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : undefined}
          transition={{ duration: 1.15, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </section>
  )
}

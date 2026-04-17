'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

const steps = [
  {
    number: '01',
    title: 'Source',
    subtitle: 'Tell us what you need',
    description: 'Submit your product brief — category, volume, market, certifications required. Our sourcing team identifies the right factories and suppliers from our verified global network within 24 hours.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    details: ['Product specification', 'Volume & frequency', 'Target market', 'Certification needs'],
    color: '#C3A35E',
  },
  {
    number: '02',
    title: 'Sample',
    subtitle: 'Validate before you commit',
    description: 'Receive physical samples with full lab reports — HACCP, Halal, ISO documentation included. Our QC team runs AQL inspections at source. You approve, we proceed. No surprises.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    details: ['Physical sample dispatch', 'Lab & compliance reports', 'AQL factory inspection', 'Price confirmation'],
    color: '#6B1F2B',
  },
  {
    number: '03',
    title: 'Ship',
    subtitle: 'Door to door, tracked',
    description: 'Full freight management — FCL, LCL, air and road. Customs documentation, Letters of Credit, HS code filing. Real-time container tracking until your goods are on shelf.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    details: ['FCL / LCL freight', 'Customs & HS codes', 'Letter of Credit support', 'Real-time tracking'],
    color: '#C3A35E',
  },
]

const HowItWorksSection: React.FC = () => {
  const locale = useLocale()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.25 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  // Auto-cycle active step
  useEffect(() => {
    if (!visible) return
    const t = setInterval(() => setActiveStep(s => (s + 1) % 3), 3200)
    return () => clearInterval(t)
  }, [visible])

  return (
    <section ref={sectionRef} className="relative h-full flex flex-col justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #faf9f7 60%, #f5f4f2 100%)' }}>

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(107,31,43,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(107,31,43,0.03) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 w-full">

        {/* Header */}
        <div className="text-center mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, transparent, #C3A35E)' }} />
            <span style={{ color: '#C3A35E', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>How It Works</span>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, #C3A35E, transparent)' }} />
          </div>
          <h2 style={{
            fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, letterSpacing: '-0.03em',
            color: '#1d1d1f', lineHeight: 1.08,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            marginBottom: '8px',
          }}>
            From Brief to{' '}
            <span style={{ background: 'linear-gradient(135deg, #C3A35E 0%, #6B1F2B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Shelf in 3 Steps
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(107,31,43,0.45)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.65, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            No middlemen. No guesswork. A repeatable commercial process built for serious buyers.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', position: 'relative' }}>

          {/* Connector line */}
          <div className="absolute top-[52px] left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] pointer-events-none" style={{
            height: '1px',
            background: 'linear-gradient(90deg, #C3A35E, rgba(107,31,43,0.3), #C3A35E)',
            zIndex: 0,
          }} />

          {steps.map((step, i) => (
            <div
              key={i}
              onClick={() => setActiveStep(i)}
              style={{
                position: 'relative', zIndex: 1,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.6s ease ${0.2 + i * 0.15}s, transform 0.6s ease ${0.2 + i * 0.15}s`,
                cursor: 'pointer',
              }}
            >
              <div className="hiw-gold-card" style={{
                background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
                backgroundSize: '220% 100%',
                border: activeStep === i ? '2px solid rgba(26,13,0,0.18)' : '1.5px solid rgba(160,130,60,0.18)',
                padding: '26px 22px',
                boxShadow: activeStep === i ? '0 10px 36px rgba(195,163,94,0.32), 0 2px 8px rgba(0,0,0,0.08)' : '0 2px 6px rgba(195,163,94,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                height: '100%',
                position: 'relative' as const,
                overflow: 'hidden',
              }}>

                {/* Number + Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                    background: activeStep === i
                      ? `linear-gradient(135deg, ${step.color}, ${i === 1 ? '#C3A35E' : '#6B1F2B'})`
                      : 'rgba(26,13,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: activeStep === i ? '#fff' : '#1a0d00',
                    transition: 'all 0.3s ease',
                    boxShadow: activeStep === i ? `0 4px 16px ${step.color}40` : 'none',
                  }}>
                    {step.icon}
                  </div>
                  <div style={{
                    fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800,
                    color: activeStep === i ? step.color : 'rgba(26,13,0,0.18)',
                    letterSpacing: '-0.04em', lineHeight: 1,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    transition: 'color 0.3s ease',
                  }}>
                    {step.number}
                  </div>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '16px', fontWeight: 700, color: '#1a0d00',
                  letterSpacing: '-0.02em', marginBottom: '2px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}>
                  {step.title}
                </h3>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B1F2B', marginBottom: '10px', fontFamily: '-apple-system, sans-serif' }}>
                  {step.subtitle}
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '11.5px', color: 'rgba(26,13,0,0.55)', lineHeight: 1.6,
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  marginBottom: '14px',
                  maxHeight: activeStep === i ? '200px' : '60px',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease',
                }}>
                  {step.description}
                </p>

                {/* Detail pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {step.details.map((d, j) => (
                    <span key={j} style={{
                      fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
                      padding: '3px 8px',
                      background: activeStep === i ? 'rgba(26,13,0,0.1)' : 'rgba(26,13,0,0.06)',
                      color: activeStep === i ? '#1a0d00' : 'rgba(26,13,0,0.5)',
                      borderRadius: '20px',
                      fontFamily: '-apple-system, sans-serif',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                    }}>
                      {d}
                    </span>
                  ))}
                </div>

                {/* Active indicator bar */}
                <div style={{
                  height: '2px',
                  background: `linear-gradient(90deg, ${step.color}, transparent)`,
                  marginTop: '14px',
                  width: activeStep === i ? '60%' : '20%',
                  borderRadius: '1px',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center', marginTop: '28px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.8s',
        }}>
          <Link href={`/${locale}/contact`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '11px 28px',
            background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
            backgroundSize: '220% 100%',
            color: '#1a0d00', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            textDecoration: 'none', borderRadius: '8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            Start Your Sourcing Brief
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .hiw-gold-card {
          animation: hiwGoldShimmer 2.8s linear infinite;
        }
        .hiw-gold-card::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.3) 50%, transparent 80%);
          animation: hiwSweep 3s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes hiwGoldShimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes hiwSweep {
          0%   { left: -100%; }
          50%  { left: 200%; }
          100% { left: 200%; }
        }
      `}</style>
    </section>
  )
}

export default HowItWorksSection

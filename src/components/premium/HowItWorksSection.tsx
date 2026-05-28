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
      { threshold: 0.15 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const t = setInterval(() => setActiveStep(s => (s + 1) % 3), 3200)
    return () => clearInterval(t)
  }, [visible])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-screen flex flex-col py-10"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #faf9f7 60%, #f5f4f2 100%)' }}
    >
      <style jsx>{`
        @keyframes hiwGoldShimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes hiwSweep {
          0%   { left: -100%; }
          60%  { left: 200%; }
          100% { left: 200%; }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(195,163,94,0.5); }
          50%       { box-shadow: 0 0 0 10px rgba(195,163,94,0); }
        }
        .hiw-gold-card {
          animation: hiwGoldShimmer 3s linear infinite;
        }
        .hiw-gold-card::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%);
          animation: hiwSweep 3.2s ease-in-out infinite;
          pointer-events: none;
        }
        .cta-pulse {
          animation: ctaPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(107,31,43,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(107,31,43,0.03) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div className="relative z-10 max-w-[1140px] mx-auto px-6 w-full">

        {/* ── Header ── */}
        <div
          className="text-center mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, transparent, #C3A35E)' }} />
            <span style={{
              color: '#C3A35E', fontSize: '11px', fontWeight: 800,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              How It Works
            </span>
            <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, #C3A35E, transparent)' }} />
          </div>

          {/* Main heading */}
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 40px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#1d1d1f',
            lineHeight: 1.05,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            marginBottom: '14px',
          }}>
            From Brief to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #C3A35E 0%, #6B1F2B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Shelf in 3 Steps
            </span>
          </h2>

          <p style={{
            fontSize: '15px',
            color: 'rgba(107,31,43,0.5)',
            maxWidth: '460px',
            margin: '0 auto',
            lineHeight: 1.7,
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            No middlemen. No guesswork. A repeatable commercial process built for serious buyers.
          </p>
        </div>

        {/* ── Steps Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', position: 'relative', alignItems: 'stretch' }}>

          {/* Connector line with arrows */}
          <div className="absolute pointer-events-none" style={{
            top: '56px',
            left: 'calc(33.33% - 12px)',
            right: 'calc(33.33% - 12px)',
            height: '2px',
            background: 'linear-gradient(90deg, #C3A35E 0%, rgba(107,31,43,0.4) 50%, #C3A35E 100%)',
            zIndex: 2,
          }}>
            {/* Arrow left-center */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 0, height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: '8px solid #C3A35E',
            }} />
          </div>

          {steps.map((step, i) => (
            <div
              key={i}
              onClick={() => setActiveStep(i)}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.65s ease ${0.15 + i * 0.18}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${0.15 + i * 0.18}s`,
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                className="hiw-gold-card"
                style={{
                  background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
                  backgroundSize: '220% 100%',
                  border: activeStep === i
                    ? '2px solid rgba(26,13,0,0.22)'
                    : '1.5px solid rgba(160,130,60,0.2)',
                  borderRadius: '16px',
                  padding: '20px 18px 18px',
                  boxShadow: activeStep === i
                    ? '0 16px 48px rgba(195,163,94,0.38), 0 4px 16px rgba(0,0,0,0.1)'
                    : '0 4px 16px rgba(195,163,94,0.14), 0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.3s ease, border 0.3s ease, transform 0.3s ease',
                  transform: activeStep === i ? 'translateY(-4px)' : 'translateY(0)',
                  height: '100%',
                  position: 'relative' as const,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column' as const,
                }}
              >
                {/* Number + Icon row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  {/* Icon box */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                    background: activeStep === i
                      ? `linear-gradient(135deg, ${step.color}, ${i === 1 ? '#C3A35E' : '#6B1F2B'})`
                      : 'rgba(26,13,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: activeStep === i ? '#fff' : '#1a0d00',
                    transition: 'all 0.3s ease',
                    boxShadow: activeStep === i ? `0 6px 20px ${step.color}55` : 'none',
                  }}>
                    {step.icon}
                  </div>

                  {/* Bold step number */}
                  <div style={{
                    fontSize: 'clamp(32px, 3vw, 44px)',
                    fontWeight: 900,
                    color: activeStep === i ? step.color : 'rgba(26,13,0,0.15)',
                    letterSpacing: '-0.05em',
                    lineHeight: 1,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    transition: 'color 0.3s ease',
                  }}>
                    {step.number}
                  </div>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '20px', fontWeight: 800, color: '#1a0d00',
                  letterSpacing: '-0.03em', marginBottom: '4px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}>
                  {step.title}
                </h3>

                {/* Subtitle */}
                <div style={{
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#6B1F2B',
                  marginBottom: '12px',
                  fontFamily: '-apple-system, sans-serif',
                }}>
                  {step.subtitle}
                </div>

                {/* Description — always fully visible */}
                <p style={{
                  fontSize: '13px', color: 'rgba(26,13,0,0.6)', lineHeight: 1.65,
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  marginBottom: '18px',
                  flex: 1,
                }}>
                  {step.description}
                </p>

                {/* Detail pills — spaced out */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '14px' }}>
                  {step.details.map((d, j) => (
                    <span key={j} style={{
                      fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                      padding: '5px 12px',
                      background: activeStep === i ? 'rgba(26,13,0,0.12)' : 'rgba(26,13,0,0.07)',
                      color: activeStep === i ? '#1a0d00' : 'rgba(26,13,0,0.55)',
                      borderRadius: '20px',
                      fontFamily: '-apple-system, sans-serif',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(26,13,0,0.08)',
                    }}>
                      {d}
                    </span>
                  ))}
                </div>

                {/* Active progress bar */}
                <div style={{
                  height: '3px',
                  background: `linear-gradient(90deg, ${step.color}, transparent)`,
                  width: activeStep === i ? '70%' : '15%',
                  borderRadius: '2px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div style={{
          textAlign: 'center', marginTop: '36px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s',
        }}>
          <Link
            href={`/${locale}/contact`}
            className="cta-pulse"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 36px',
              background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
              backgroundSize: '220% 100%',
              color: '#1a0d00', fontSize: '12px', fontWeight: 800,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              textDecoration: 'none', borderRadius: '10px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              border: '1.5px solid rgba(26,13,0,0.14)',
            }}
          >
            Start Your Sourcing Brief
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}

export default HowItWorksSection

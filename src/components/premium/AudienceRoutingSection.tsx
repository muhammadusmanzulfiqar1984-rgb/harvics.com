'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

const portals = [
  {
    audience: 'Buyers',
    tagline: 'Source at scale',
    description: 'You need FMCG, textiles or industrial products for your retail chain, e-commerce, or distribution network. Browse 1,185+ products across 10 verticals, request samples, and place orders with full compliance documentation.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    actions: [
      { label: 'Browse Products', href: '/products' },
      { label: 'Request Sample', href: '/contact?topic=sample' },
      { label: 'Get Quote', href: '/contact?topic=quote' },
    ],
    href: '/products',
    gradient: 'linear-gradient(135deg, #C3A35E 0%, #E5C07B 100%)',
    bg: 'rgba(195,163,94,0.05)',
    border: 'rgba(195,163,94,0.2)',
    accentColor: '#C3A35E',
  },
  {
    audience: 'Distributors',
    tagline: 'Build your territory',
    description: 'You are a regional distributor looking to add premium FMCG and consumer goods to your portfolio. Access exclusive pricing, territory agreements, marketing support and a dedicated distributor portal with real-time inventory.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    actions: [
      { label: 'View Portal', href: '/portal/distributor' },
      { label: 'Territory Map', href: '/portal/distributor/retailers' },
      { label: 'Apply Now', href: '/login/distributor' },
    ],
    href: '/portal/distributor',
    gradient: 'linear-gradient(135deg, #6B1F2B 0%, #9B3A4B 100%)',
    bg: 'rgba(107,31,43,0.05)',
    border: 'rgba(107,31,43,0.15)',
    accentColor: '#6B1F2B',
  },
  {
    audience: 'Suppliers',
    tagline: 'Grow your export reach',
    description: 'You manufacture quality goods and want access to Harvics\' global distribution network across 42 markets. List your products, receive RFQs from verified buyers, and manage shipments through the supplier portal.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    actions: [
      { label: 'Supplier Portal', href: '/portal/supplier' },
      { label: 'Submit RFQ', href: '/portal/supplier/rfqs' },
      { label: 'List Products', href: '/portal/supplier/pos' },
    ],
    href: '/portal/supplier',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
    bg: 'rgba(37,99,235,0.04)',
    border: 'rgba(37,99,235,0.15)',
    accentColor: '#2563EB',
  },
]

const AudienceRoutingSection: React.FC = () => {
  const locale = useLocale()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fdfcfb 0%, #f5f4f2 100%)' }}>

      {/* Background radials */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(195,163,94,0.06), transparent)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,31,43,0.05), transparent)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 w-full">

        {/* Header */}
        <div style={{
          textAlign: 'center', marginBottom: '24px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, transparent, #C3A35E)' }} />
            <span style={{ color: '#C3A35E', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Who Are You?</span>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, #C3A35E, transparent)' }} />
          </div>
          <h2 style={{
            fontSize: 'clamp(20px, 2.8vw, 32px)', fontWeight: 700, letterSpacing: '-0.03em',
            color: '#1d1d1f', lineHeight: 1.08,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            marginBottom: '8px',
          }}>
            Built for every side of{' '}
            <span style={{ background: 'linear-gradient(135deg, #C3A35E 0%, #6B1F2B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              global trade
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(107,31,43,0.4)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.65, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            Whether you buy, distribute or manufacture — Harvics has a dedicated pathway for you.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {portals.map((portal, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.6s ease ${0.15 + i * 0.12}s, transform 0.6s ease ${0.15 + i * 0.12}s`,
              }}
            >
              <div className="audience-gold-card" style={{
                background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
                backgroundSize: '220% 100%',
                border: 'none',
                padding: '20px 18px',
                height: '100%',
                boxShadow: hovered === i
                  ? '0 12px 36px rgba(195,163,94,0.38), 0 3px 10px rgba(0,0,0,0.1)'
                  : '0 2px 6px rgba(195,163,94,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex',
                flexDirection: 'column' as const,
                position: 'relative' as const,
                overflow: 'hidden',
                transform: hovered === i ? 'translateY(-4px)' : 'translateY(0)',
              }}>

                {/* Icon */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: hovered === i ? portal.gradient : 'rgba(26,13,0,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: hovered === i ? '#fff' : '#1a0d00',
                  marginBottom: '16px',
                  boxShadow: hovered === i ? `0 4px 16px ${portal.accentColor}55` : 'none',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}>
                  {portal.icon}
                </div>

                {/* Audience */}
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B1F2B', marginBottom: '4px', fontFamily: '-apple-system, sans-serif' }}>
                  {portal.audience}
                </div>
                <h3 style={{
                  fontSize: '18px', fontWeight: 700, color: '#1a0d00',
                  letterSpacing: '-0.03em', marginBottom: '10px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}>
                  {portal.tagline}
                </h3>
                <p style={{
                  fontSize: '12px', color: 'rgba(26,13,0,0.55)', lineHeight: 1.65,
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  flexGrow: 1, marginBottom: '18px',
                }}>
                  {portal.description}
                </p>

                {/* Action links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {portal.actions.map((action, j) => (
                    <Link
                      key={j}
                      href={`/${locale}${action.href}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: j === 0 && hovered === i ? portal.gradient : 'rgba(26,13,0,0.08)',
                        borderRadius: '8px',
                        fontSize: '11px', fontWeight: 600,
                        color: j === 0 && hovered === i ? '#fff' : '#1a0d00',
                        textDecoration: 'none',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        letterSpacing: '0.02em',
                        border: `1px solid ${j === 0 && hovered === i ? 'transparent' : 'rgba(26,13,0,0.15)'}`,
                        transition: 'all 0.25s ease',
                      }}
                    >
                      {action.label}
                      <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .audience-gold-card {
          animation: audGoldShimmer 2.8s linear infinite;
        }
        .audience-gold-card::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.3) 50%, transparent 80%);
          animation: audSweep 3s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes audGoldShimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes audSweep {
          0%   { left: -100%; }
          50%  { left: 200%; }
          100% { left: 200%; }
        }
      `}</style>
    </section>
  )
}

export default AudienceRoutingSection

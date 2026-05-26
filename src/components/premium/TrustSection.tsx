'use client'

import React, { useRef, useState, useEffect } from 'react'

const certifications = [
  {
    code: 'ISO 22000',
    name: 'Food Safety Management',
    body: 'International Organization for Standardization',
    color: '#1a6b3c',
    backdrop: 'radial-gradient(ellipse at 30% 40%, rgba(26,107,60,0.35) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(26,107,60,0.22) 0%, transparent 55%)',
    icon: '🔬',
    bgPhoto: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1400&q=60&fit=crop',
  },
  {
    code: 'HACCP',
    name: 'Hazard Analysis Critical Control',
    body: 'Codex Alimentarius / EU Regulation 852/2004',
    color: '#1a4a6b',
    backdrop: 'radial-gradient(ellipse at 60% 30%, rgba(26,74,107,0.35) 0%, transparent 60%), radial-gradient(ellipse at 25% 70%, rgba(26,74,107,0.22) 0%, transparent 55%)',
    icon: '🛡️',
    bgPhoto: 'https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=1400&q=60&fit=crop',
  },
  {
    code: 'HALAL',
    name: 'Halal Certified',
    body: 'ESMA UAE · JAKIM Malaysia · HFA UK',
    color: '#2d6b1a',
    backdrop: 'radial-gradient(ellipse at 45% 35%, rgba(45,107,26,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 65%, rgba(45,107,26,0.22) 0%, transparent 55%)',
    icon: '☪️',
    bgPhoto: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=1400&q=60&fit=crop',
  },
  {
    code: 'BRC',
    name: 'British Retail Consortium',
    body: 'Global Standard for Food Safety — Grade A',
    color: '#6b1a1a',
    backdrop: 'radial-gradient(ellipse at 70% 40%, rgba(107,26,26,0.35) 0%, transparent 60%), radial-gradient(ellipse at 30% 60%, rgba(107,26,26,0.22) 0%, transparent 55%)',
    icon: '🏅',
    bgPhoto: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=60&fit=crop',
  },
  {
    code: 'FSSC 22000',
    name: 'Food Safety System Certification',
    body: 'GFSI Recognised — Version 6',
    color: '#3d1a6b',
    backdrop: 'radial-gradient(ellipse at 50% 50%, rgba(61,26,107,0.35) 0%, transparent 60%), radial-gradient(ellipse at 20% 30%, rgba(61,26,107,0.22) 0%, transparent 55%)',
    icon: '✅',
    bgPhoto: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=60&fit=crop',
  },
  {
    code: 'CE / EU',
    name: 'European Conformity',
    body: 'EU Food & Labelling Regulations Compliant',
    color: '#1a3d6b',
    backdrop: 'radial-gradient(ellipse at 40% 60%, rgba(26,61,107,0.35) 0%, transparent 60%), radial-gradient(ellipse at 75% 30%, rgba(26,61,107,0.22) 0%, transparent 55%)',
    icon: '🇪🇺',
    bgPhoto: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400&q=60&fit=crop',
  },
]

const markets = [
  { flag: '/Images/flags/uk.svg', country: 'United Kingdom', city: 'London HQ', role: 'Headquarters', backdrop: 'radial-gradient(ellipse at 35% 45%, rgba(107,31,43,0.32) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(195,163,94,0.22) 0%, transparent 50%)' },
  { flag: '/Images/flags/saudiarabia.svg', country: 'UAE & GCC', city: 'Dubai', role: 'Regional Hub', backdrop: 'radial-gradient(ellipse at 60% 40%, rgba(195,163,94,0.38) 0%, transparent 60%), radial-gradient(ellipse at 25% 65%, rgba(139,110,50,0.20) 0%, transparent 55%)' },
  { flag: '/Images/flags/pakistan.svg', country: 'Pakistan', city: 'Karachi', role: 'Sourcing Hub', backdrop: 'radial-gradient(ellipse at 45% 50%, rgba(0,100,0,0.30) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(0,100,0,0.18) 0%, transparent 50%)' },
  { flag: '/Images/flags/usa.svg', country: 'United States', city: 'New York', role: 'Trade Office', backdrop: 'radial-gradient(ellipse at 50% 35%, rgba(0,40,104,0.30) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(187,19,62,0.20) 0%, transparent 55%)' },
  { flag: '/Images/flags/italy.svg', country: 'Italy', city: 'Milan', role: 'Procurement', backdrop: 'radial-gradient(ellipse at 55% 45%, rgba(0,87,63,0.30) 0%, transparent 60%), radial-gradient(ellipse at 35% 60%, rgba(206,43,55,0.20) 0%, transparent 55%)' },
  { flag: '/Images/flags/china.svg', country: 'China', city: 'Shanghai', role: 'Manufacturing', backdrop: 'radial-gradient(ellipse at 40% 40%, rgba(222,41,16,0.28) 0%, transparent 60%), radial-gradient(ellipse at 65% 65%, rgba(255,222,0,0.20) 0%, transparent 55%)' },
  { flag: '/Images/flags/india.svg', country: 'India', city: 'Mumbai', role: 'Sourcing', backdrop: 'radial-gradient(ellipse at 50% 50%, rgba(255,153,51,0.30) 0%, transparent 60%), radial-gradient(ellipse at 30% 35%, rgba(0,100,0,0.20) 0%, transparent 55%)' },
  { flag: '/Images/flags/brazil.svg', country: 'Brazil', city: 'São Paulo', role: 'Emerging Market', backdrop: 'radial-gradient(ellipse at 45% 55%, rgba(0,156,59,0.30) 0%, transparent 60%), radial-gradient(ellipse at 65% 30%, rgba(255,223,0,0.20) 0%, transparent 55%)' },
]

const TrustSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [visibleCards, setVisibleCards] = useState<number>(0)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  // Staggered entrance once the section is visible
  useEffect(() => {
    if (!visible) return
    let i = 0
    const total = certifications.length
    const tick = () => {
      i += 1
      setVisibleCards(i)
      if (i < total) setTimeout(tick, 100)
    }
    setTimeout(tick, 100)
  }, [visible])

  // Per-card 3D magnetic tilt + mouse-tracked laser radial gradient
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
    const centerX = x - rect.width / 2
    const centerY = y - rect.height / 2
    const rotateX = -(centerY / rect.height) * 6
    const rotateY = (centerX / rect.width) * 6
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
  }
  const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transition = 'background 300ms ease, border-color 300ms ease'
  }
  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    card.style.transition = 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), background 300ms ease, border-color 300ms ease'
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)'
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-full flex flex-col justify-center overflow-hidden"
      style={{ background: '#0D0D0D', padding: '96px 0', color: '#F5F0E8' }}
    >
      {/* Vault glow — soft gold radial bloom anchored at center */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(201, 168, 76, 0.04) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />
      {/* Subtle grain overlay — vault/paper texture feel */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.03,
          mixBlendMode: 'overlay',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">

        {/* ── TOP: CERTIFICATIONS — DOCUMENT VAULT ── */}
        <div style={{
          marginBottom: '64px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
        }}>
          {/* Thin gold gradient divider above title */}
          <div style={{
            height: '1px',
            width: '192px',
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)',
            margin: '0 auto 24px',
          }} />
          <p style={{
            textAlign: 'center',
            color: '#8a7d6b',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            Global Standards
          </p>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(22px, 3vw, 36px)',
            fontWeight: 300,
            letterSpacing: '0.01em',
            color: '#F5F0E8',
            lineHeight: 1.25,
            marginBottom: '56px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            Every product ships with{' '}
            <span style={{ fontWeight: 400, color: '#C9A84C' }}>full compliance documentation</span>
          </h2>

          <div className="cert-grid">
            {certifications.map((cert, i) => (
              <div
                key={cert.code}
                className={`cert-card group${i < visibleCards ? ' visible' : ''}`}
                onMouseMove={handleCardMove}
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
              >
                {/* Laser radial gradient follows the cursor */}
                <span className="cert-card__laser" aria-hidden="true" />

                {/* Gold accent left border (expands width on hover) */}
                <span className="cert-card__accent" aria-hidden="true" />

                <div className="cert-card__head">
                  <div className="cert-card__head-left">
                    {/* Document/shield icon — turns gold on hover */}
                    <svg className="cert-card__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="cert-card__code">{cert.code}</span>
                  </div>
                  <span className="cert-card__secured">Secured</span>
                </div>

                <div className="cert-card__body-wrap">
                  <div className="cert-card__content">
                    <h3 className="cert-card__name">{cert.name}</h3>
                    <p className="cert-card__desc">{cert.body}</p>
                  </div>
                  <div className="cert-card__cta">
                    <span>View Certificate</span>
                    <svg className="cert-card__cta-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.30), transparent)',
          margin: '8px 0 48px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.6s',
        }} />

        {/* ── BOTTOM: KEY MARKETS ── */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
            <span style={{ color: '#C9A84C', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Key Markets</span>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
          </div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#8a7d6b', marginBottom: '20px', fontFamily: '-apple-system, sans-serif', letterSpacing: '-0.005em' }}>
            42 active markets &nbsp;·&nbsp; 6 continents &nbsp;·&nbsp; offices in 5 cities
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
            {markets.map((market, i) => (
              <div
                key={i}
                className="market-card"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.4s ease ${0.6 + i * 0.05}s, transform 0.4s ease ${0.6 + i * 0.05}s, border-color 0.3s ease, transform 0.3s ease`,
                }}
              >
                <img
                  src={market.flag}
                  alt={market.country}
                  loading="lazy"
                  style={{ width: '28px', height: '20px', objectFit: 'cover', margin: '0 auto 6px', borderRadius: '2px', display: 'block' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#F5F0E8', fontFamily: '-apple-system, sans-serif', marginBottom: '2px', lineHeight: 1.2 }}>
                  {market.city}
                </div>
                <div style={{ fontSize: '8px', fontWeight: 700, color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: '-apple-system, sans-serif' }}>
                  {market.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .cert-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        @media (max-width: 900px) {
          .cert-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 600px) {
          .cert-grid { grid-template-columns: 1fr; }
        }

        .cert-card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 32px;
          height: 288px;
          cursor: pointer;
          opacity: 0;
          transform: translateY(30px);
          transform-style: preserve-3d;
          will-change: transform;
          transition: opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 800ms cubic-bezier(0.16, 1, 0.3, 1),
                      background 300ms ease,
                      border-color 300ms ease;
        }
        .cert-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .cert-card:hover {
          background: #181818;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .cert-card__laser {
          position: absolute;
          inset: -1px;
          background: radial-gradient(300px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(201, 168, 76, 0.15), transparent 40%);
          border-radius: 8px;
          z-index: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 300ms ease;
        }
        .cert-card:hover .cert-card__laser {
          opacity: 1;
        }
        .cert-card__accent {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 0;
          background: #C9A84C;
          z-index: 10;
          transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cert-card:hover .cert-card__accent {
          width: 3px;
        }
        .cert-card__head {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          pointer-events: none;
        }
        .cert-card__head-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cert-card__icon {
          color: #8a7d6b;
          transition: color 0.3s ease;
          flex-shrink: 0;
        }
        .cert-card:hover .cert-card__icon {
          color: #C9A84C;
        }
        .cert-card__code {
          font-family: -apple-system, BlinkMacSystemFont, "SF Mono", "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8a7d6b;
          transition: color 0.3s ease;
        }
        .cert-card:hover .cert-card__code {
          color: #ffffff;
        }
        .cert-card__secured {
          font-family: -apple-system, BlinkMacSystemFont, "SF Mono", monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.2);
          transition: color 0.3s ease;
        }
        .cert-card:hover .cert-card__secured {
          color: rgba(201, 168, 76, 0.4);
        }
        .cert-card__body-wrap {
          position: relative;
          z-index: 1;
          min-height: 110px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: 4px;
          pointer-events: none;
        }
        .cert-card__content {
          transform: translateY(0);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cert-card:hover .cert-card__content {
          transform: translateY(-24px);
        }
        .cert-card__name {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: #F5F0E8;
          line-height: 1.3;
          margin: 0 0 6px;
        }
        .cert-card__desc {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 12px;
          font-weight: 300;
          line-height: 1.6;
          color: #8a7d6b;
          margin: 0;
        }
        .cert-card__cta {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          color: #C9A84C;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cert-card:hover .cert-card__cta {
          opacity: 1;
          transform: translateY(0);
        }
        .cert-card__cta-arrow {
          margin-left: 6px;
          transition: transform 0.3s ease;
        }
        .cert-card:hover .cert-card__cta-arrow {
          transform: translateX(4px);
        }

        .market-card {
          padding: 12px 6px;
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 6px;
          text-align: center;
          cursor: default;
          transition: border-color 0.3s ease, transform 0.3s ease, background 0.3s ease;
        }
        .market-card:hover {
          background: #181818;
          border-color: rgba(201, 168, 76, 0.35);
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  )
}

export default TrustSection

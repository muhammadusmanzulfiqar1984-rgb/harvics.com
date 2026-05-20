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
  const [hoveredBackdrop, setHoveredBackdrop] = useState<string | null>(null)
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)

  const [hoveredIdx, setHoveredIdx] = useState<number>(0)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative h-full flex flex-col justify-center overflow-hidden"
      style={{ background: '#faf9f7' }}>

      {/* Cross-fading background photo — same style as industries */}
      {certifications.map((cert, idx) => (
        <div
          key={cert.code}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${cert.bgPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(38px) saturate(1.05)',
            transform: 'scale(1.12)',
            opacity: idx === hoveredIdx ? 0.32 : 0,
            transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 0,
          }}
        />
      ))}
      {/* Lighter wash so the backdrop photo + label + icon stay visible */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,255,255,0.40)', zIndex: 1 }} />

      {/* Ambient glow orbs — slow-moving behind content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(195,163,94,0.12) 0%, rgba(195,163,94,0.04) 40%, transparent 70%)',
          top: '5%', left: '10%',
          animation: 'certGlow1 16s ease-in-out infinite',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,31,43,0.10) 0%, rgba(107,31,43,0.03) 40%, transparent 70%)',
          bottom: '0%', right: '5%',
          animation: 'certGlow2 20s ease-in-out infinite',
          filter: 'blur(50px)',
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(195,163,94,0.08) 0%, transparent 60%)',
          top: '40%', right: '30%',
          animation: 'certGlow3 14s ease-in-out infinite',
          filter: 'blur(35px)',
        }} />
      </div>

      {/* Dynamic backdrop that changes on hover */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: hoveredBackdrop || 'radial-gradient(ellipse at 40% 40%, rgba(195,163,94,0.12) 0%, transparent 55%), radial-gradient(ellipse at 65% 55%, rgba(107,31,43,0.10) 0%, transparent 50%)',
          transition: 'background 0.6s ease',
          zIndex: 0,
        }}
      />

      {/* Hovered item label — large faded text in background */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {hoveredLabel && (
          <div style={{
            fontSize: 'clamp(80px, 16vw, 220px)',
            fontWeight: 900,
            color: 'rgba(107,31,43,0.32)',
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            textShadow: '0 4px 40px rgba(107,31,43,0.18)',
          }}>
            {hoveredLabel}
          </div>
        )}
      </div>

      {/* Hovered icon — large centered behind content */}
      {hoveredIcon && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 0, fontSize: 'clamp(120px, 22vw, 300px)', opacity: 0.65, filter: 'drop-shadow(0 8px 24px rgba(107,31,43,0.25))' }}
        >
          {hoveredIcon}
        </div>
      )}

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 w-full">

        {/* ── TOP: CERTIFICATIONS ── */}
        <div style={{
          marginBottom: '16px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, transparent, #C3A35E)' }} />
            <span style={{ color: '#C3A35E', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Certifications</span>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, #C3A35E, transparent)' }} />
          </div>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(16px, 2vw, 26px)', fontWeight: 700, letterSpacing: '-0.025em',
            color: '#1d1d1f', lineHeight: 1.1, marginBottom: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            Every product ships with full compliance documentation
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
            {certifications.map((cert, i) => (
              <div key={i} className="trust-card cert-shimmer" style={{
                padding: '12px 8px',
                background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
                backgroundSize: '220% 100%',
                borderRadius: '12px',
                textAlign: 'center',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
                transition: `opacity 0.5s ease ${0.2 + i * 0.07}s, transform 0.5s ease ${0.2 + i * 0.07}s, box-shadow 0.3s ease`,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(107,31,43,0.25)',
                boxShadow: '0 4px 14px rgba(107,31,43,0.10), 0 1px 3px rgba(107,31,43,0.08), inset 0 1px 0 rgba(255,255,255,0.45)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-3px) scale(1.02)'
                el.style.boxShadow = '0 12px 28px rgba(107,31,43,0.22), 0 4px 10px rgba(195,163,94,0.25), inset 0 1px 0 rgba(255,255,255,0.6)'
                setHoveredBackdrop(cert.backdrop)
                setHoveredLabel(cert.code)
                setHoveredIcon(cert.icon)
                setHoveredIdx(i)
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0) scale(1)'
                el.style.boxShadow = '0 4px 14px rgba(107,31,43,0.10), 0 1px 3px rgba(107,31,43,0.08), inset 0 1px 0 rgba(255,255,255,0.45)'
                setHoveredBackdrop(null)
                setHoveredLabel(null)
                setHoveredIcon(null)
              }}
              >
                {/* Color dot */}
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: cert.color, margin: '0 auto 8px',
                  boxShadow: `0 0 6px ${cert.color}80`,
                  border: '1.5px solid rgba(255,255,255,0.5)',
                }} />
                <div style={{
                  fontSize: '12px', fontWeight: 800, color: '#1a0d00',
                  letterSpacing: '-0.01em', marginBottom: '3px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  textShadow: '0 1px 0 rgba(255,255,255,0.4)',
                }}>
                  {cert.code}
                </div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(26,13,0,0.78)', lineHeight: 1.3, fontFamily: '-apple-system, sans-serif' }}>
                  {cert.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(195,163,94,0.25), transparent)',
          margin: '18px 0',
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
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, transparent, #C3A35E)' }} />
            <span style={{ color: '#C3A35E', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Key Markets</span>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, #C3A35E, transparent)' }} />
          </div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(107,31,43,0.38)', marginBottom: '12px', fontFamily: '-apple-system, sans-serif', letterSpacing: '-0.005em' }}>
            42 active markets &nbsp;·&nbsp; 6 continents &nbsp;·&nbsp; offices in 5 cities
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
            {markets.map((market, i) => (
              <div key={i} className="trust-card market-shimmer" style={{
                padding: '10px 6px',
                background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
                backgroundSize: '220% 100%',
                borderRadius: '10px',
                textAlign: 'center',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transition: `opacity 0.4s ease ${0.6 + i * 0.06}s, transform 0.4s ease ${0.6 + i * 0.06}s, box-shadow 0.3s ease`,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(107,31,43,0.22)',
                boxShadow: '0 3px 10px rgba(107,31,43,0.08), 0 1px 2px rgba(107,31,43,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-3px) scale(1.03)'
                el.style.boxShadow = '0 10px 22px rgba(107,31,43,0.20), 0 4px 8px rgba(195,163,94,0.20), inset 0 1px 0 rgba(255,255,255,0.55)'
                setHoveredBackdrop(market.backdrop)
                setHoveredLabel(market.city)
                setHoveredIcon(null)
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0) scale(1)'
                el.style.boxShadow = '0 3px 10px rgba(107,31,43,0.08), 0 1px 2px rgba(107,31,43,0.06), inset 0 1px 0 rgba(255,255,255,0.4)'
                setHoveredBackdrop(market.backdrop)
                setHoveredLabel(null)
              }}
              >
                <img
                  src={market.flag}
                  alt={market.country}
                  loading="lazy"
                  style={{ width: '28px', height: '20px', objectFit: 'cover', margin: '0 auto 6px', borderRadius: '2px', display: 'block' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#1a0d00', fontFamily: '-apple-system, sans-serif', marginBottom: '2px', lineHeight: 1.2 }}>
                  {market.city}
                </div>
                <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(26,13,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: '-apple-system, sans-serif' }}>
                  {market.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .trust-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .cert-shimmer {
          border: none;
          animation: goldBgShimmer 2.8s linear infinite;
        }
        .cert-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%);
          animation: goldSweep 2.8s ease-in-out infinite;
          pointer-events: none;
        }
        .cert-shimmer:hover {
          box-shadow: 0 6px 24px rgba(195,163,94,0.4), 0 2px 8px rgba(0,0,0,0.1);
        }
        .market-shimmer {
          border: none;
          animation: goldBgShimmer 3.5s linear infinite;
        }
        .market-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.3) 50%, transparent 80%);
          animation: goldSweep 3.5s ease-in-out infinite;
          pointer-events: none;
        }
        .market-shimmer:hover {
          box-shadow: 0 4px 18px rgba(195,163,94,0.35), 0 2px 6px rgba(0,0,0,0.08);
        }
        @keyframes goldBgShimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes goldSweep {
          0%   { left: -100%; }
          50%  { left: 200%; }
          100% { left: 200%; }
        }
        @keyframes certGlow1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          33% { transform: translate(50px, 30px) scale(1.15); opacity: 1; }
          66% { transform: translate(-30px, -20px) scale(0.9); opacity: 0.8; }
        }
        @keyframes certGlow2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          40% { transform: translate(-40px, -35px) scale(1.2); opacity: 1; }
          70% { transform: translate(25px, 20px) scale(0.85); opacity: 0.7; }
        }
        @keyframes certGlow3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(35px, -25px) scale(1.1); opacity: 0.9; }
        }
      `}</style>
    </section>
  )
}

export default TrustSection

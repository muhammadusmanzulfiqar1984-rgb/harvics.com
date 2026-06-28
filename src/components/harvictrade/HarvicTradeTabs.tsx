'use client'

import { useState } from 'react'

interface Props {
  locale: string
  children: React.ReactNode
}

export default function HarvicTradeTabs({ locale, children }: Props) {
  const [active, setActive] = useState<'classic' | 'digital'>('classic')

  return (
    <div className="min-h-screen bg-white">

      {/* ── Tab Bar — inline, sits right below the sticky header ────── */}
      <div className="w-full border-b border-[#C3A35E]/15" style={{ background: '#3D1212' }}>
        <div className="max-w-[1100px] mx-auto px-4 flex items-center">

          <button
            onClick={() => setActive('classic')}
            style={{
              position: 'relative',
              padding: '14px 28px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: active === 'classic' ? '#C3A35E' : 'rgba(255,255,255,0.3)',
              borderBottom: active === 'classic' ? '2px solid #C3A35E' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Classic Marketplace
          </button>

          <button
            onClick={() => setActive('digital')}
            style={{
              position: 'relative',
              padding: '14px 28px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: active === 'digital' ? '#F5F0E8' : 'rgba(255,255,255,0.3)',
              borderBottom: active === 'digital' ? '2px solid #F5F0E8' : '2px solid transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#34d399', display: 'inline-block',
              animation: 'pulse 2s infinite',
            }} />
            AI Digital Marketplace
          </button>

          <div style={{ marginLeft: 'auto', fontSize: '9px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.22em', textTransform: 'uppercase', paddingRight: '8px' }}>
            HarvicTrade
          </div>
        </div>
      </div>

      {/* ── Classic Tab ─────────────────────────────────────────────── */}
      <div style={{ display: active === 'classic' ? 'block' : 'none' }}>
        {children}
      </div>

      {/* ── Digital Marketplace Tab ─────────────────────────────────── */}
      {active === 'digital' && (
        <div style={{ height: '85vh' }}>
          <iframe
            src="/harvictrade-v2.html"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            title="HarvicTrade AI Digital Marketplace"
            allow="microphone"
          />
        </div>
      )}

    </div>
  )
}

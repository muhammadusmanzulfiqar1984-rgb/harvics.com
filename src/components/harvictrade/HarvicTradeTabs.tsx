'use client'

import { useState } from 'react'

interface Props {
  locale: string
  children: React.ReactNode // classic marketplace content
}

export default function HarvicTradeTabs({ locale, children }: Props) {
  const [active, setActive] = useState<'classic' | 'digital'>('classic')

  return (
    <div className="min-h-screen bg-white">

      {/* ── Tab Bar ─────────────────────────────────────────────────── */}
      <div className="fixed top-[64px] left-0 right-0 z-[400] border-b border-[#C3A35E]/15"
        style={{ background: '#1A0505' }}>
        <div className="max-w-[1100px] mx-auto px-4 flex items-center gap-0">

          <button
            onClick={() => setActive('classic')}
            className={`relative px-7 py-4 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors
              ${active === 'classic'
                ? 'text-[#C3A35E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C3A35E]'
                : 'text-white/30 hover:text-white/60'
              }`}
          >
            Classic Marketplace
          </button>

          <button
            onClick={() => setActive('digital')}
            className={`relative px-7 py-4 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors flex items-center gap-2
              ${active === 'digital'
                ? 'text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#F5F0E8]'
                : 'text-white/30 hover:text-white/60'
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Digital Marketplace
          </button>

          <div className="ml-auto text-[9px] text-white/20 uppercase tracking-[0.22em] pr-2">
            HarvicTrade
          </div>
        </div>
      </div>

      {/* ── Classic Tab ─────────────────────────────────────────────── */}
      <div className={`pt-[104px] ${active === 'classic' ? 'block' : 'hidden'}`}>
        {children}
      </div>

      {/* ── Digital Marketplace Tab ─────────────────────────────────── */}
      {active === 'digital' && (
        <div className="pt-[104px] h-screen">
          <iframe
            src="/harvictrade-v2.html"
            className="w-full border-0"
            style={{ height: 'calc(100vh - 104px)' }}
            title="HarvicTrade AI Digital Marketplace"
            allow="microphone"
          />
        </div>
      )}

    </div>
  )
}

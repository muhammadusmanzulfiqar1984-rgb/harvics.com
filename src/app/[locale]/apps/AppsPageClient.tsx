'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

/* Countdown to June 1, 2026 launch */
const LAUNCH_DATE = new Date('2026-06-01T00:00:00Z')

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const calc = () => {
      const diff = LAUNCH_DATE.getTime() - Date.now()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])
  return timeLeft
}

interface AppsPageClientProps {
  locale: string
}

/* ─────────────────────────────────────────────
   APP CATALOGUE DATA
───────────────────────────────────────────── */
const APPS = [
  {
    id: 'harvichr',
    name: 'HarvicHR',
    tagline: 'Complete Human Capital Management',
    description:
      'Full-cycle HR platform built for global enterprises operating across emerging markets. Covers recruitment & ATS, onboarding workflows, payroll processing, performance cycles, leave management, and multi-country compliance — all in one unified dashboard.',
    category: 'Human Resources',
    status: 'live' as const,
    badge: 'LIVE',
    icon: '👥',
    color: '#6B1F2B',
    accentColor: '#C3A35E',
    url: 'https://www.harvichr.eu',
    features: [
      'Recruitment & ATS',
      'Employee Onboarding',
      'Payroll Processing',
      'Performance Reviews',
      'Leave Management',
      'Compliance Engine',
      'Multi-Country Support',
      'Analytics Dashboard',
    ],
    pricing: [
      { tier: 'Starter', price: 'Free', seats: 'Up to 10 employees', highlight: false },
      { tier: 'Growth', price: '$49/mo', seats: 'Up to 100 employees', highlight: false },
      { tier: 'Enterprise', price: 'Custom', seats: 'Unlimited', highlight: true },
    ],
    stats: [
      { label: 'Countries Supported', value: '42+' },
      { label: 'Currencies', value: '80+' },
      { label: 'Compliance Frameworks', value: '15+' },
    ],
    unsplash: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=600&fit=crop&q=80',
  },
  {
    id: 'harvics-event-os',
    name: 'Harvics Event OS',
    tagline: 'B2B Event Discovery & Networking Platform',
    description:
      'Premium white-label event intelligence platform for trade fairs, conferences, and exhibitions. Smart AI concierge guides attendees through exhibitor directories, live agenda tracking, QR-code networking, multi-language support, and real-time notifications — built for the world\'s leading trade events.',
    category: 'Events & Networking',
    status: 'preview' as const,
    badge: 'EARLY ACCESS',
    icon: '🎪',
    color: '#1A2E4A',
    accentColor: '#C3A35E',
    url: '#',
    features: [
      'AI Event Concierge',
      'Exhibitor Directory',
      'Live Agenda Tracker',
      'QR Code Networking',
      'Smart Bookmarks',
      'Multi-Language Support',
      'Push Notifications',
      'Voice & Chat Assistant',
    ],
    pricing: [],
    stats: [
      { label: 'Event Types', value: 'B2B' },
      { label: 'Languages', value: '10+' },
      { label: 'Access', value: 'Invite Only' },
    ],
    unsplash: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop&q=80',
  },
  {
    id: 'harvics-os',
    name: 'Harvics OS',
    tagline: 'Customs & Logistics Intelligence — UK-GCC Corridor',
    description:
      'Enterprise-grade customs and logistics intelligence dashboard purpose-built for the UK–GCC trade corridor. Tracks live shipments, calculates duty & VAT, flags compliance risks, optimises routes intelligently, and integrates document management with real-time cost analytics.',
    category: 'Trade & Logistics',
    status: 'preview' as const,
    badge: 'EARLY ACCESS',
    icon: '🚢',
    color: '#1C3A2A',
    accentColor: '#C3A35E',
    url: '#',
    features: [
      'Live Shipment Tracking',
      'Duty & VAT Calculator',
      'Compliance Risk Flags',
      'Intelligent Route Planning',
      'Document Management',
      'Logistics Map',
      'Cost Analytics',
      'Trade Assistant',
    ],
    pricing: [],
    stats: [
      { label: 'Trade Corridor', value: 'UK-GCC' },
      { label: 'Shipment Modes', value: 'Air, Sea, Road' },
      { label: 'Access', value: 'Invite Only' },
    ],
    unsplash: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&h=600&fit=crop&q=80',
  },
  {
    id: 'vatify-os',
    name: 'Vatify OS',
    tagline: 'VAT-Ready Expense Management for Europe',
    description:
      'Premium expense management platform purpose-built for European freelancers and SMEs. Auto-categorises expenses, calculates VAT across EU jurisdictions, generates compliant PDF reports, and provides an intelligent tax assistant — designed for precision and simplicity.',
    category: 'Finance & Payments',
    status: 'preview' as const,
    badge: 'EARLY ACCESS',
    icon: '🧾',
    color: '#2D1F4A',
    accentColor: '#C3A35E',
    url: '#',
    features: [
      'Expense Tracking',
      'Multi-Country VAT Engine',
      'PDF Report Export',
      'AI Tax Assistant',
      'Receipt Scanner',
      'Multi-Language UI',
      'Analytics Dashboard',
      'Category Management',
    ],
    pricing: [],
    stats: [
      { label: 'VAT Regions', value: 'EU-wide' },
      { label: 'Export Formats', value: 'PDF/CSV' },
      { label: 'Access', value: 'Invite Only' },
    ],
    unsplash: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop&q=80',
  },
  {
    id: 'hpay',
    name: 'HPay',
    tagline: 'Digital Payments & Treasury',
    description:
      'Enterprise payment infrastructure with multi-currency wallets, SWIFT/SEPA transfers, crypto settlement, and trade finance instruments built for cross-border commerce.',
    category: 'Finance & Payments',
    status: 'coming-soon' as const,
    badge: 'SUBMIT INTEREST',
    icon: '💳',
    color: '#1A3A5C',
    accentColor: '#C3A35E',
    url: '#',
    features: [
      'Multi-Currency Wallets',
      'SWIFT / SEPA / ACH',
      'Crypto Settlement',
      'Trade Finance (LC/SBLC)',
      'FX Trading Desk',
      'Escrow Services',
      'KYC / AML Engine',
      'Payment Gateway',
    ],
    pricing: [],
    stats: [
      { label: 'Currencies', value: '150+' },
      { label: 'Payment Rails', value: '12' },
      { label: 'Settlement Time', value: '<2h' },
    ],
    unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop&q=80',
  },
  {
    id: 'harvics-crm',
    name: 'Harvics CRM',
    tagline: 'Intelligent Sales & Customer Intelligence',
    description:
      'AI-powered CRM engineered for commodity traders, FMCG distributors, and industrial sales teams. Territory mapping, demand forecasting, and competitor intelligence built-in.',
    category: 'Sales & CRM',
    status: 'coming-soon' as const,
    badge: 'SUBMIT INTEREST',
    icon: '📈',
    color: '#1F4D2B',
    accentColor: '#C3A35E',
    url: '#',
    features: [
      'AI Territory Planner',
      'Pipeline & CPQ',
      'Lead Intelligence',
      'Competitor Tracking',
      'Distributor Portal',
      'Commission Engine',
      'Customer 360',
      'Demand Forecasting',
    ],
    pricing: [],
    stats: [
      { label: 'AI Models', value: '6' },
      { label: 'Industries', value: '10' },
      { label: 'Integrations', value: '30+' },
    ],
    unsplash: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop&q=80',
  },
]

const CATEGORIES = ['All', 'Human Resources', 'Events & Networking', 'Trade & Logistics', 'Finance & Payments', 'Sales & CRM']

/* ─────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────── */
function StatusBadge({ status, badge }: { status: 'live' | 'preview' | 'coming-soon'; badge: string }) {
  if (status === 'live') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold tracking-[0.12em] uppercase"
        style={{ background: '#C3A35E', color: '#fff' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
        {badge}
      </span>
    )
  }
  if (status === 'preview') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold tracking-[0.12em] uppercase"
        style={{ background: 'rgba(195,163,94,0.15)', color: '#C3A35E', border: '1px solid rgba(195,163,94,0.4)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#C3A35E] animate-pulse inline-block" />
        {badge}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center px-3 py-1 text-[10px] font-bold tracking-[0.12em] uppercase"
      style={{ background: 'rgba(107,31,43,0.08)', color: '#6B1F2B', border: '1px solid rgba(107,31,43,0.2)' }}
    >
      {badge}
    </span>
  )
}

/* ─────────────────────────────────────────────
   APP CARD
───────────────────────────────────────────── */
function AppCard({ app, locale, onClick }: { app: typeof APPS[0]; locale: string; onClick: () => void }) {
  const countdown = useCountdown()
  return (
    <div
      className="group relative bg-white cursor-pointer overflow-hidden transition-all duration-500"
      style={{ border: '1px solid rgba(195,163,94,0.15)' }}
      onClick={onClick}
    >
      {/* Hero Image */}
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={app.unsplash}
          alt={app.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, transparent 40%, ${app.color}ee 100%)` }}
        />
        {/* Badge top-right */}
        <div className="absolute top-4 right-4">
          <StatusBadge status={app.status} badge={app.badge} />
        </div>
        {/* Icon + Name bottom-left */}
        <div className="absolute bottom-4 left-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{app.icon}</span>
            <div>
              <h3 className="text-white font-bold text-xl tracking-wide">{app.name}</h3>
              <p className="text-white/70 text-xs tracking-[0.06em] uppercase">{app.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <p
          className="text-xs font-semibold tracking-[0.1em] uppercase mb-2"
          style={{ color: '#C3A35E' }}
        >
          {app.tagline}
        </p>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#4a3728' }}>
          {app.description}
        </p>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 divide-x divide-[rgba(195,163,94,0.15)] mb-5"
          style={{ borderTop: '1px solid rgba(195,163,94,0.15)', borderBottom: '1px solid rgba(195,163,94,0.15)' }}
        >
          {app.stats.map((s) => (
            <div key={s.label} className="px-3 py-3 text-center">
              <div className="text-lg font-bold" style={{ color: '#6B1F2B' }}>{s.value}</div>
              <div className="text-[10px] tracking-[0.06em] uppercase" style={{ color: '#9a8070' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features preview */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {app.features.slice(0, 4).map((f) => (
            <span
              key={f}
              className="text-[10px] px-2 py-1 tracking-[0.04em]"
              style={{ background: '#F5F0E8', color: '#6B1F2B', border: '1px solid rgba(107,31,43,0.1)' }}
            >
              {f}
            </span>
          ))}
          {app.features.length > 4 && (
            <span
              className="text-[10px] px-2 py-1 tracking-[0.04em]"
              style={{ background: 'rgba(195,163,94,0.1)', color: '#C3A35E' }}
            >
              +{app.features.length - 4} more
            </span>
          )}
        </div>

        {/* CTA */}
        {app.status === 'live' ? (
          <button
            className="w-full py-3 text-xs font-bold tracking-[0.1em] uppercase transition-all duration-300"
            style={{ background: '#6B1F2B', color: '#fff' }}
            onClick={() => onClick()}
          >
            {`Launch ${app.name} →`}
          </button>
        ) : app.status === 'preview' ? (
          <div
            className="w-full overflow-hidden"
            style={{ border: '1px solid rgba(195,163,94,0.35)' }}
          >
            <div className="py-2 text-center text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: '#C3A35E', background: 'rgba(195,163,94,0.06)' }}>
              Launching In
            </div>
            <div className="grid grid-cols-4 divide-x divide-[rgba(195,163,94,0.2)]">
              {[
                { v: countdown.days, l: 'Days' },
                { v: countdown.hours, l: 'Hrs' },
                { v: countdown.minutes, l: 'Min' },
                { v: countdown.seconds, l: 'Sec' },
              ].map(({ v, l }) => (
                <div key={l} className="py-2 text-center">
                  <div className="text-base font-bold tabular-nums" style={{ color: '#6B1F2B' }}>{String(v).padStart(2, '0')}</div>
                  <div className="text-[9px] tracking-[0.06em] uppercase" style={{ color: '#9a8070' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            className="w-full py-3 text-xs font-bold tracking-[0.1em] uppercase transition-all duration-300"
            style={{ background: 'transparent', border: '1px solid #6B1F2B', color: '#6B1F2B' }}
            onClick={() => onClick()}
          >
            Submit Your Interest →
          </button>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MODAL COUNTDOWN (larger version)
───────────────────────────────────────────── */
function ModalCountdown() {
  const countdown = useCountdown()
  return (
    <div style={{ border: '1px solid rgba(195,163,94,0.35)' }}>
      <div className="py-2 text-center text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: '#C3A35E', background: 'rgba(195,163,94,0.06)' }}>
        Early Access Opens In
      </div>
      <div className="grid grid-cols-4 divide-x divide-[rgba(195,163,94,0.2)]">
        {[
          { v: countdown.days, l: 'Days' },
          { v: countdown.hours, l: 'Hours' },
          { v: countdown.minutes, l: 'Min' },
          { v: countdown.seconds, l: 'Sec' },
        ].map(({ v, l }) => (
          <div key={l} className="py-4 text-center">
            <div className="text-2xl font-bold tabular-nums" style={{ color: '#6B1F2B' }}>{String(v).padStart(2, '0')}</div>
            <div className="text-[10px] tracking-[0.06em] uppercase mt-1" style={{ color: '#9a8070' }}>{l}</div>
          </div>
        ))}
      </div>
      <div className="py-2 text-center text-[10px]" style={{ color: '#9a8070' }}>
        June 1, 2026 — Invite-only early access
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   APP DETAIL MODAL
───────────────────────────────────────────── */
function AppModal({ app, onClose }: { app: typeof APPS[0]; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid rgba(195,163,94,0.3)' }}
      >
        {/* Hero */}
        <div className="relative h-[280px] overflow-hidden">
          <img src={app.unsplash} alt={app.name} className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent 20%, ${app.color}f0 100%)` }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
            aria-label="Close"
          >
            ✕
          </button>
          <div className="absolute bottom-6 left-8">
            <StatusBadge status={app.status} badge={app.badge} />
            <div className="flex items-center gap-4 mt-3">
              <span className="text-4xl">{app.icon}</span>
              <div>
                <h2 className="text-white text-3xl font-bold">{app.name}</h2>
                <p className="text-white/70 text-sm uppercase tracking-[0.1em]">{app.category}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-7">
            <div>
              <h3 className="text-xs font-bold tracking-[0.12em] uppercase mb-2" style={{ color: '#C3A35E' }}>
                About
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4a3728' }}>
                {app.description}
              </p>
            </div>

            {/* Stats */}
            <div>
              <h3 className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: '#C3A35E' }}>
                Key Numbers
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {app.stats.map((s) => (
                  <div
                    key={s.label}
                    className="p-4 text-center"
                    style={{ background: '#F5F0E8', border: '1px solid rgba(195,163,94,0.2)' }}
                  >
                    <div className="text-2xl font-bold" style={{ color: '#6B1F2B' }}>{s.value}</div>
                    <div className="text-[10px] tracking-[0.06em] uppercase mt-1" style={{ color: '#9a8070' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full features */}
            <div>
              <h3 className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: '#C3A35E' }}>
                All Features
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {app.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#4a3728' }}>
                    <span style={{ color: '#C3A35E' }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: pricing / CTA */}
          <div className="space-y-5">
            {app.pricing.length > 0 ? (
              <div>
                <h3 className="text-xs font-bold tracking-[0.12em] uppercase mb-4" style={{ color: '#C3A35E' }}>
                  Pricing
                </h3>
                <div className="space-y-3">
                  {app.pricing.map((plan) => (
                    <div
                      key={plan.tier}
                      className="p-4"
                      style={{
                        background: plan.highlight ? '#6B1F2B' : '#F5F0E8',
                        border: plan.highlight ? 'none' : '1px solid rgba(195,163,94,0.2)',
                      }}
                    >
                      <div
                        className="text-xs font-bold tracking-[0.1em] uppercase"
                        style={{ color: plan.highlight ? '#C3A35E' : '#9a8070' }}
                      >
                        {plan.tier}
                      </div>
                      <div
                        className="text-2xl font-bold mt-1"
                        style={{ color: plan.highlight ? '#fff' : '#6B1F2B' }}
                      >
                        {plan.price}
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#9a8070' }}
                      >
                        {plan.seats}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="p-5 text-center"
                style={{ background: '#F5F0E8', border: '1px solid rgba(195,163,94,0.2)' }}
              >
                <div className="text-xs font-bold tracking-[0.1em] uppercase mb-2" style={{ color: '#C3A35E' }}>
                  Pricing
                </div>
                <p className="text-sm" style={{ color: '#9a8070' }}>
                  Announced at launch. Join the waitlist for early-access pricing.
                </p>
              </div>
            )}

            {/* Launch / Countdown / Submit Interest */}
            {app.status === 'live' ? (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 text-center text-sm font-bold tracking-[0.1em] uppercase transition-all duration-300 hover:opacity-90"
                style={{ background: '#6B1F2B', color: '#fff' }}
              >
                Launch {app.name} →
              </a>
            ) : app.status === 'preview' ? (
              <ModalCountdown />
            ) : (
              <button
                className="w-full py-4 text-sm font-bold tracking-[0.1em] uppercase"
                style={{ background: '#6B1F2B', color: '#fff' }}
              >
                Submit Your Interest →
              </button>
            )}

            <p className="text-[11px] text-center" style={{ color: '#9a8070' }}>
              All Harvics apps share a single sign-on. One account, full platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function AppsPageClient({ locale }: AppsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedApp, setSelectedApp] = useState<typeof APPS[0] | null>(null)

  const filtered = activeCategory === 'All' ? APPS : APPS.filter((a) => a.category === activeCategory)

  return (
    <main style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      {/* ── HERO ── */}
      <section
        className="relative py-24 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #6B1F2B 0%, #3d1018 60%, #1a0a0e 100%)',
        }}
      >
        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(195,163,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(195,163,94,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-[1200px] mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-12" style={{ background: '#C3A35E' }} />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: '#C3A35E' }}>
              Harvics App Store
            </span>
            <span className="h-px w-12" style={{ background: '#C3A35E' }} />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Enterprise Apps.<br />
            <span style={{ color: '#C3A35E' }}>One Platform.</span>
          </h1>

          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Modular, best-in-class applications built on the Harvics OS infrastructure. 
            Activate what you need. Everything shares one sign-on, one data model, one AI brain.
          </p>

          {/* Stats bar */}
          <div className="inline-grid grid-cols-3 divide-x divide-white/10 border border-white/10 bg-white/5">
            {[
              { value: '6', label: 'Apps in Store' },
              { value: '42+', label: 'Countries' },
              { value: '1', label: 'Unified Platform' },
            ].map((s) => (
              <div key={s.label} className="px-8 py-4">
                <div className="text-2xl font-bold" style={{ color: '#C3A35E' }}>{s.value}</div>
                <div className="text-white/50 text-xs tracking-[0.08em] uppercase mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <section
        className="sticky top-0 z-40 border-b"
        style={{ background: '#fff', borderColor: 'rgba(195,163,94,0.2)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="whitespace-nowrap px-4 py-2 text-xs font-bold tracking-[0.08em] uppercase transition-all duration-200"
                style={{
                  background: activeCategory === cat ? '#6B1F2B' : 'transparent',
                  color: activeCategory === cat ? '#fff' : '#6B1F2B',
                  border: activeCategory === cat ? 'none' : '1px solid rgba(107,31,43,0.2)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED BANNER — HarvicHR ── */}
      {activeCategory === 'All' && (
        <section className="max-w-[1200px] mx-auto px-6 pt-12 pb-4">
          <div
            className="relative overflow-hidden cursor-pointer group"
            style={{ border: '1px solid rgba(195,163,94,0.3)' }}
            onClick={() => setSelectedApp(APPS[0])}
          >
            <div className="absolute inset-0">
              <img
                src={APPS[0].unsplash}
                alt="HarvicHR"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, rgba(107,31,43,0.95) 45%, rgba(107,31,43,0.4) 100%)' }}
              />
            </div>

            <div className="relative p-10 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <div className="mb-4">
                  <StatusBadge status="live" badge="LIVE NOW — FEATURED APP" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">👥</span>
                  <div>
                    <h2 className="text-white text-3xl font-bold">HarvicHR</h2>
                    <p className="text-white/60 text-sm uppercase tracking-[0.1em]">Human Capital Management</p>
                  </div>
                </div>
                <p className="text-white/70 text-base leading-relaxed">
                  Complete HR platform for global enterprises. Recruitment, payroll, performance, 
                  compliance — live at harvichr.eu
                </p>
                <div className="flex gap-3 mt-4">
                  {APPS[0].features.slice(0, 4).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] px-2 py-1 uppercase tracking-[0.06em]"
                      style={{ background: 'rgba(195,163,94,0.2)', color: '#C3A35E', border: '1px solid rgba(195,163,94,0.3)' }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                <a
                  href={APPS[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-4 text-sm font-bold tracking-[0.12em] uppercase transition-all duration-300 hover:opacity-90"
                  style={{ background: '#C3A35E', color: '#fff' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Launch HarvicHR →
                </a>
                <button
                  className="py-4 text-sm font-bold tracking-[0.12em] uppercase"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.8)' }}
                  onClick={(e) => { e.stopPropagation(); setSelectedApp(APPS[0]) }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── APP GRID ── */}
      <section className="max-w-[1200px] mx-auto px-6 py-10">
        {activeCategory === 'All' && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: '#9a8070' }}>
              All Applications ({APPS.length})
            </h2>
            <span className="text-xs" style={{ color: '#9a8070' }}>
              More apps added regularly
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filtered.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              locale={locale}
              onClick={() => setSelectedApp(app)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24" style={{ color: '#9a8070' }}>
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-sm tracking-wide">No apps in this category yet.</p>
          </div>
        )}
      </section>

      {/* ── PLATFORM CALLOUT ── */}
      <section
        className="border-t"
        style={{ background: '#fff', borderColor: 'rgba(195,163,94,0.15)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: '🔑',
              title: 'Single Sign-On',
              desc: 'One Harvics account unlocks every app. No separate logins, no password fatigue.',
            },
            {
              icon: '🧠',
              title: 'Shared AI Brain',
              desc: 'Every app uses the same Harvics AI engine — demand, price, risk, and territory intelligence shared across modules.',
            },
            {
              icon: '🏗️',
              title: 'One Data Model',
              desc: 'Employees, customers, orders, payments — one universal schema. No duplicate data, no integration tax.',
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-base font-bold mb-2" style={{ color: '#6B1F2B' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#9a8070' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUILD ON HARVICS ── */}
      <section
        className="py-16"
        style={{ background: 'linear-gradient(135deg, #6B1F2B 0%, #3d1018 100%)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Want to build on Harvics OS?
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 text-base leading-relaxed">
            The Harvics platform is open for enterprise partners. Bring your vertical solution, 
            we provide the infrastructure, compliance, payments, and distribution.
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-block px-10 py-4 text-sm font-bold tracking-[0.12em] uppercase transition-all duration-300 hover:opacity-90"
            style={{ background: '#C3A35E', color: '#fff' }}
          >
            Talk to Us →
          </Link>
        </div>
      </section>

      {/* ── MODAL ── */}
      {selectedApp && (
        <AppModal app={selectedApp} onClose={() => setSelectedApp(null)} />
      )}
    </main>
  )
}

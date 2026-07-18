'use client'
/**
 * HARVICS OS — Module Catalog
 * Visual grid of all 71 modules across 15 architecture bands.
 * Read from MODULE_REGISTRY (single source of truth).
 */
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { MODULE_REGISTRY, MODULE_BANDS, type ModuleBand, type IntelligenceLevel } from '@/lib/modules/registry'

const BAND_COLORS: Record<string, string> = {
  'Finance & Controlling':     '#1E3A8A',
  'Commercial & Sales':        '#0F766E',
  'Procurement & Sourcing':    '#7C2D12',
  'Manufacturing':             '#5B21B6',
  'Inventory & Warehouse':     '#155E75',
  'Logistics & Trade':         '#9A3412',
  'Human Capital':             '#831843',
  'Asset & Maintenance':       '#3F3F46',
  'GRC':                       '#991B1B',
  'Analytics & Intelligence':  '#365314',
  'Projects & Services':       '#0E7490',
  'Platform & Infrastructure': '#1F2937',
  'Data & AI':                 '#6B21A8',
  'HARVICS Universe':          'var(--harvics-burgundy)',
  'Portals':                   '#7C2D12',
}

const INTEL_LABEL: Record<IntelligenceLevel, string> = {
  L1: 'Basic', L2: 'Smart', L3: 'Predictive', L4: 'Cognitive', L5: 'Autonomous',
}

export default function ModuleCatalogPage() {
  const [q, setQ] = useState('')
  const [activeBand, setActiveBand] = useState<ModuleBand | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return MODULE_REGISTRY.filter(m => {
      if (activeBand !== 'ALL' && m.band !== activeBand) return false
      if (!term) return true
      return (
        m.name.toLowerCase().includes(term) ||
        m.band.toLowerCase().includes(term) ||
        String(m.id).includes(term) ||
        m.route.toLowerCase().includes(term)
      )
    })
  }, [q, activeBand])

  const grouped = useMemo(() => {
    const map: Record<string, typeof MODULE_REGISTRY[number][]> = {}
    for (const m of filtered) (map[m.band] ||= []).push(m)
    return map
  }, [filtered])

  const totalLive = MODULE_REGISTRY.filter(m => m.status === 'live').length

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAF7', padding: '32px 24px', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--harvics-gold)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>HARVICS OS</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--harvics-burgundy)', margin: 0 }}>Module Catalog</h1>
          <p style={{ color: '#666', marginTop: 6, fontSize: 14 }}>
            {totalLive}/{MODULE_REGISTRY.length} modules live · 15 architecture bands · click any module to open
          </p>
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name, band, route, or #id…"
            style={{ flex: '1 1 280px', padding: '10px 14px', fontSize: 14, border: '1px solid #E5E5E5', borderRadius: 8, background: '#fff' }}
          />
          <select
            value={activeBand}
            onChange={e => setActiveBand(e.target.value as ModuleBand | 'ALL')}
            style={{ padding: '10px 14px', fontSize: 14, border: '1px solid #E5E5E5', borderRadius: 8, background: '#fff', minWidth: 220 }}
          >
            <option value="ALL">All 15 bands</option>
            {MODULE_BANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div style={{ alignSelf: 'center', fontSize: 13, color: '#666' }}>
            Showing <strong>{filtered.length}</strong> of {MODULE_REGISTRY.length}
          </div>
        </div>

        {/* Band quick chips */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          <Chip active={activeBand === 'ALL'} color="var(--harvics-burgundy)" onClick={() => setActiveBand('ALL')}>ALL · 71</Chip>
          {MODULE_BANDS.map(b => {
            const count = MODULE_REGISTRY.filter(m => m.band === b).length
            return (
              <Chip key={b} active={activeBand === b} color={BAND_COLORS[b]} onClick={() => setActiveBand(b)}>
                {b} · {count}
              </Chip>
            )
          })}
        </div>

        {/* Grouped grid */}
        {MODULE_BANDS.map(band => {
          const mods = grouped[band]
          if (!mods?.length) return null
          const color = BAND_COLORS[band]
          return (
            <section key={band} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 4, height: 24, background: color, borderRadius: 2 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {band}
                </h2>
                <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>{mods.length} modules</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {mods.map(m => (
                  <ModuleCard key={m.id} mod={m} color={color} />
                ))}
              </div>
            </section>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999', fontSize: 14 }}>
            No modules match "{q}"
          </div>
        )}
      </div>
    </main>
  )
}

function Chip({ children, active, color, onClick }: { children: React.ReactNode; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 999,
        border: active ? `2px solid ${color}` : '1px solid #E5E5E5',
        background: active ? color : '#fff',
        color: active ? '#fff' : '#333',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function ModuleCard({ mod, color }: { mod: typeof MODULE_REGISTRY[number]; color: string }) {
  const href = mod.osPath ? `/en${mod.osPath}` : undefined
  const inner = (
    <div style={{
      background: '#fff',
      border: '1px solid #E5E5E5',
      borderRadius: 10,
      padding: 14,
      height: '100%',
      transition: 'all 0.15s',
      cursor: href ? 'pointer' : 'default',
      position: 'relative',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${color}22` }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 0.5 }}>#{String(mod.id).padStart(2, '0')}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Badge bg={statusBg(mod.status)} fg={statusFg(mod.status)}>{mod.status.toUpperCase()}</Badge>
          <Badge bg="#F4F4F4" fg="#333">{mod.intelligence}</Badge>
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{mod.name}</div>
      <div style={{ fontSize: 10, color: '#999', fontFamily: 'Menlo, monospace', marginBottom: 8, wordBreak: 'break-all' }}>{mod.route}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
        <span style={{ color: '#666' }}>{mod.reporting} · {INTEL_LABEL[mod.intelligence]}</span>
        {href ? <span style={{ color, fontWeight: 700 }}>OPEN →</span> : <span style={{ color: '#999', fontStyle: 'italic' }}>API only</span>}
      </div>
    </div>
  )
  if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>
  return inner
}

function Badge({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return <span style={{ background: bg, color: fg, padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{children}</span>
}

function statusBg(s: string) { return s === 'live' ? '#10B981' : s === 'demo' ? '#F59E0B' : s === 'stub' ? '#6B7280' : '#E5E5E5' }
function statusFg(s: string) { return s === 'planned' ? '#666' : '#fff' }

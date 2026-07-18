'use client'
/** Wave 5 — shared compact UI primitives reused across 16 module pages */
import React, { CSSProperties } from 'react'

export const B = 'var(--harvics-burgundy)'
export const G = 'var(--harvics-gold)'
export const C = 'var(--harvics-cream)'

export function Hdr({ no, band, title, sub }: { no: string; band: string; title: string; sub: string }) {
  return (
    <div style={{ background: B, color: C, padding: '20px 32px', borderBottom: `4px solid ${G}` }}>
      <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.85 }}>MODULE {no} · {band}</div>
      <h1 style={{ margin: '6px 0 0', fontSize: 26, fontFamily: 'Georgia,serif' }}>{title}</h1>
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{sub}</div>
    </div>
  )
}

export function Panel({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${B}33`, gridColumn: full ? '1/-1' : undefined }}>
      <div style={{ background: B, color: C, padding: '8px 12px', fontWeight: 700, fontSize: 12 }}>{title}</div>
      <div style={{ padding: 10 }}>{children}</div>
    </div>
  )
}

export function Inp({ l, v, on, tp = 'text', cols = 1 }: { l: string; v: string | number; on: (v: string) => void; tp?: string; cols?: number }) {
  return (
    <label style={{ gridColumn: `span ${cols}` }}>
      <div style={{ fontSize: 10, color: B, fontWeight: 600 }}>{l}</div>
      <input type={tp} value={String(v ?? '')} onChange={e => on(e.target.value)} style={{ width: '100%', padding: 6, border: `1px solid ${B}55`, fontSize: 12 }} />
    </label>
  )
}

export function Sel({ l, v, on, opts, cols = 1 }: { l: string; v: string; on: (v: string) => void; opts: string[]; cols?: number }) {
  return (
    <label style={{ gridColumn: `span ${cols}` }}>
      <div style={{ fontSize: 10, color: B, fontWeight: 600 }}>{l}</div>
      <select value={v} onChange={e => on(e.target.value)} style={{ width: '100%', padding: 6, border: `1px solid ${B}55`, fontSize: 12 }}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </label>
  )
}

export function Form({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 6, alignItems: 'end' }}>{children}</div>
}

export const btnB: CSSProperties = { padding: '6px 14px', background: G, color: B, border: 0, fontWeight: 700, cursor: 'pointer', marginTop: 8, marginBottom: 6 }
export const btnA: CSSProperties = { padding: '4px 10px', background: 'transparent', color: B, border: `1px solid ${B}`, fontSize: 10, fontWeight: 700, cursor: 'pointer' }
export const td: CSSProperties = { padding: 6, fontSize: 12 }

export function Tbl({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 8, maxHeight: 420, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: B, color: C, position: 'sticky', top: 0 }}>{head.map(h => <th key={h} style={{ padding: 6, textAlign: 'left', fontSize: 11 }}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Pill({ s, kind = 'status' }: { s: string; kind?: 'status' | 'priority' }) {
  const map: Record<string, string> = {
    Draft: '#666', Sent: '#1565C0', Accepted: '#2E7D32', Rejected: '#B71C1C', Expired: '#999',
    Open: '#1565C0', InProgress: '#B8860B', OnHold: '#666', Resolved: '#2E7D32', Closed: '#999',
    Active: '#2E7D32', Signed: '#2E7D32', Negotiating: '#1565C0', Terminated: '#B71C1C',
    Discovered: '#666', InReview: '#B8860B', Qualified: '#2E7D32',
    Applied: '#999', Screened: '#1565C0', Interview: '#B8860B', Offer: '#9C27B0', Hired: '#2E7D32',
    Enrolled: '#1565C0', Completed: '#2E7D32', Failed: '#B71C1C',
    Released: '#2E7D32', Paid: '#2E7D32', Approved: '#2E7D32',
    Promote: '#2E7D32', Stretch: '#1565C0', Hold: '#666', PIP: '#B71C1C',
    Filled: '#2E7D32', Paused: '#B8860B', Cancelled: '#B71C1C',
    Vacant: '#B71C1C', UnderRenovation: '#B8860B', Sold: '#999',
    Low: '#666', Medium: '#1565C0', High: '#B8860B', Critical: '#B71C1C', Urgent: '#B71C1C',
    Queued: '#666', Scrapped: '#B71C1C',
    Preventive: '#2E7D32', Corrective: '#B8860B', Predictive: '#1565C0', Emergency: '#B71C1C',
  }
  const c = map[s] || '#666'
  return <span style={{ background: c, color: '#fff', padding: '1px 8px', fontSize: 10, fontWeight: 700, borderRadius: 2 }}>{s.toUpperCase()}</span>
}

export function Page({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'system-ui', minHeight: '100vh', background: C }}>{children}</div>
}

export function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return <div style={{ padding: '12px 24px 24px', display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16 }}>{children}</div>
}

export async function postJson(url: string, body: any) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const j = await r.json()
  if (!j.success) throw new Error(j.error || JSON.stringify(j.issues || j))
  return j
}

export async function getJson(url: string) {
  const r = await fetch(url, { cache: 'no-store' })
  return r.json()
}

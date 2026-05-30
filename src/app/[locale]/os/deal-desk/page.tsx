'use client'

/**
 * HARVICS OS — Deal Desk (Module #8 slice)
 * Real workflow UI: submit → approve / reject. Shows KPIs (open value,
 * pending count, avg discount) computed from live Prisma rows.
 */

import { useEffect, useState } from 'react'

interface Deal {
  id: string
  dealName: string
  customerId: string | null
  opportunityValue: number
  requestedDiscount: number
  requiredMargin: number
  approvedDiscount: number | null
  currency: string
  submittedBy: string | null
  status: 'Pending' | 'Approved' | 'Rejected' | 'Negotiating'
  decisionDate: string | null
  createdAt: string
}

const BURGUNDY = '#6B1F2B'
const GOLD = '#C3A35E'
const CREAM = '#F5F0E8'

const STATUS_COLORS: Record<string, string> = {
  Pending: '#B8860B',
  Approved: '#2E7D32',
  Rejected: '#8B0000',
  Negotiating: '#1565C0',
}

export default function DealDeskPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ dealName: '', customerId: '', opportunityValue: 0, requestedDiscount: 0, requiredMargin: 18, currency: 'USD' })

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/t14/deal-desk', { cache: 'no-store' })
    const json = await res.json()
    setDeals(json.data || [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const create = async () => {
    if (!form.dealName || !form.opportunityValue) { alert('Deal name and value required'); return }
    const res = await fetch('/api/t14/deal-desk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (!json.success) { alert(JSON.stringify(json.issues || json.error)); return }
    setShowCreate(false)
    setForm({ dealName: '', customerId: '', opportunityValue: 0, requestedDiscount: 0, requiredMargin: 18, currency: 'USD' })
    await load()
  }

  const decide = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/t14/deal-desk/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const json = await res.json()
    if (!json.success) { alert(json.error); return }
    await load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this deal?')) return
    await fetch(`/api/t14/deal-desk/${id}`, { method: 'DELETE' })
    await load()
  }

  const pending = deals.filter(d => d.status === 'Pending' || d.status === 'Negotiating')
  const totalOpenValue = pending.reduce((s, d) => s + d.opportunityValue, 0)
  const approvedCount = deals.filter(d => d.status === 'Approved').length
  const avgRequested = deals.length ? (deals.reduce((s, d) => s + d.requestedDiscount, 0) / deals.length).toFixed(1) : '0'

  return (
    <div style={{ fontFamily: 'system-ui', minHeight: '100vh', background: CREAM }}>
      <div style={{ background: BURGUNDY, color: CREAM, padding: '24px 32px', borderBottom: `4px solid ${GOLD}` }}>
        <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.85 }}>MODULE #8 · COMMERCIAL &amp; SALES</div>
        <h1 style={{ margin: '6px 0 0', fontSize: 28, fontFamily: 'Georgia, serif' }}>Deal Desk</h1>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Pending approvals, discount governance, margin guardrails</div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, padding: 24 }}>
        {[
          { label: 'Open Pipeline Value', value: `$${totalOpenValue.toLocaleString()}`, color: BURGUNDY },
          { label: 'Pending / Negotiating', value: pending.length, color: '#B8860B' },
          { label: 'Approved', value: approvedCount, color: '#2E7D32' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', padding: 20, borderTop: `4px solid ${k.color}`, border: `1px solid ${BURGUNDY}22` }}>
            <div style={{ fontSize: 11, color: '#666', letterSpacing: 1, fontWeight: 600 }}>{k.label.toUpperCase()}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: BURGUNDY, marginTop: 6 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ padding: '0 24px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={() => setShowCreate(s => !s)} style={{ padding: '8px 20px', background: BURGUNDY, color: CREAM, border: `2px solid ${GOLD}`, fontWeight: 600, cursor: 'pointer' }}>+ NEW DEAL</button>
        <button onClick={load} style={{ padding: '8px 20px', background: 'transparent', color: BURGUNDY, border: `2px solid ${BURGUNDY}`, fontWeight: 600, cursor: 'pointer' }}>REFRESH</button>
        <div style={{ marginLeft: 'auto', color: BURGUNDY, fontSize: 13, opacity: 0.7 }}>Avg requested discount: <b>{avgRequested}%</b></div>
      </div>

      {showCreate && (
        <div style={{ margin: '0 24px 16px', background: '#fff', padding: 16, border: `1px solid ${BURGUNDY}33` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <Field label="Deal name *"><input value={form.dealName} onChange={e => setForm({ ...form, dealName: e.target.value })} style={inp} /></Field>
            <Field label="Customer ID"><input value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} style={inp} /></Field>
            <Field label="Opportunity value *"><input type="number" value={form.opportunityValue} onChange={e => setForm({ ...form, opportunityValue: +e.target.value })} style={inp} /></Field>
            <Field label="Requested discount %"><input type="number" value={form.requestedDiscount} onChange={e => setForm({ ...form, requestedDiscount: +e.target.value })} style={inp} /></Field>
            <Field label="Required margin %"><input type="number" value={form.requiredMargin} onChange={e => setForm({ ...form, requiredMargin: +e.target.value })} style={inp} /></Field>
            <Field label="Currency"><input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })} maxLength={3} style={inp} /></Field>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={create} style={{ padding: '8px 20px', background: GOLD, color: BURGUNDY, border: 0, fontWeight: 700, cursor: 'pointer', marginRight: 8 }}>SUBMIT FOR APPROVAL</button>
            <button onClick={() => setShowCreate(false)} style={{ padding: '8px 20px', background: 'transparent', color: BURGUNDY, border: `1px solid ${BURGUNDY}`, cursor: 'pointer' }}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ background: '#fff', border: `1px solid ${BURGUNDY}33`, overflowX: 'auto' }}>
          {loading ? <div style={{ padding: 32, textAlign: 'center', color: BURGUNDY }}>Loading…</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: BURGUNDY, color: CREAM, textAlign: 'left' }}>
                  {['DEAL', 'CUSTOMER', 'VALUE', 'DISCOUNT', 'STATUS', 'ACTIONS'].map(h => <th key={h} style={{ padding: 10 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {deals.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#888' }}>No deals yet</td></tr>
                ) : deals.map((d, i) => (
                  <tr key={d.id} style={{ background: i % 2 ? CREAM : '#fff', borderBottom: `1px solid ${BURGUNDY}11` }}>
                    <td style={{ padding: 10, fontWeight: 600, color: BURGUNDY }}>{d.dealName}</td>
                    <td style={{ padding: 10 }}>{d.customerId || '—'}</td>
                    <td style={{ padding: 10, fontFamily: 'monospace' }}>{d.currency} {d.opportunityValue.toLocaleString()}</td>
                    <td style={{ padding: 10 }}>
                      <span>requested {d.requestedDiscount}%</span>
                      {d.approvedDiscount != null && <span style={{ marginLeft: 6, color: '#2E7D32', fontWeight: 600 }}>→ {d.approvedDiscount}%</span>}
                    </td>
                    <td style={{ padding: 10 }}>
                      <span style={{ background: STATUS_COLORS[d.status] || '#666', color: '#fff', padding: '2px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{d.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: 10 }}>
                      {(d.status === 'Pending' || d.status === 'Negotiating') && (
                        <>
                          <button onClick={() => decide(d.id, 'approve')} style={btn('#2E7D32')}>APPROVE</button>{' '}
                          <button onClick={() => decide(d.id, 'reject')} style={btn('#8B0000')}>REJECT</button>{' '}
                        </>
                      )}
                      <button onClick={() => remove(d.id)} style={btn('#666')}>DELETE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const inp: React.CSSProperties = { width: '100%', padding: 8, border: `1px solid ${BURGUNDY}55`, background: CREAM, fontFamily: 'system-ui' }
const btn = (color: string): React.CSSProperties => ({ padding: '3px 10px', background: 'transparent', color, border: `1px solid ${color}`, cursor: 'pointer', fontSize: 11, fontWeight: 600 })

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, color: BURGUNDY, fontWeight: 600, marginBottom: 4, letterSpacing: 0.5 }}>{label}</div>
      {children}
    </label>
  )
}

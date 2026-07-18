'use client'

/**
 * HARVICS OS — Commissions (Module #8 slice)
 * Calc → Approve → Pay workflow. Auto-calculates commissionAmount.
 */

import { useEffect, useState } from 'react'

interface Commission {
  id: string
  employeeId: string
  employeeName: string | null
  period: string
  baseRevenue: number
  commissionRate: number
  commissionAmount: number
  currency: string
  status: 'Calculated' | 'Approved' | 'Paid'
  paidDate: string | null
}

const B = 'var(--harvics-burgundy)'; const G = 'var(--harvics-gold)'; const C = 'var(--harvics-cream)'
const SC: Record<string,string> = { Calculated: '#B8860B', Approved: '#1565C0', Paid: '#2E7D32' }

export default function CommissionsPage() {
  const [rows, setRows] = useState<Commission[]>([])
  const [summary, setSummary] = useState<{ totalAmount: number }>({ totalAmount: 0 })
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ employeeId: '', employeeName: '', period: '2026-Q2', baseRevenue: 0, commissionRate: 2.5, currency: 'USD' })

  const load = async () => {
    const r = await fetch('/api/t14/commissions', { cache: 'no-store' })
    const j = await r.json(); setRows(j.data || []); setSummary(j.summary || { totalAmount: 0 })
  }
  useEffect(() => { void load() }, [])

  const create = async () => {
    if (!form.employeeId || !form.baseRevenue) return alert('Employee + revenue required')
    const r = await fetch('/api/t14/commissions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const j = await r.json(); if (!j.success) return alert(JSON.stringify(j.issues || j.error))
    setShowCreate(false); await load()
  }
  const act = async (id: string, what: 'approve' | 'pay') => {
    const r = await fetch(`/api/t14/commissions/${id}/${what}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:'{}' })
    const j = await r.json(); if (!j.success) return alert(j.error); await load()
  }
  const remove = async (id: string) => {
    if (!confirm('Delete?')) return
    const r = await fetch(`/api/t14/commissions/${id}`, { method:'DELETE' })
    const j = await r.json(); if (!j.success) return alert(j.error); await load()
  }

  const previewAmount = (form.baseRevenue * form.commissionRate / 100).toFixed(2)
  const byStatus = { Calculated: rows.filter(r=>r.status==='Calculated').length, Approved: rows.filter(r=>r.status==='Approved').length, Paid: rows.filter(r=>r.status==='Paid').length }

  return (
    <div style={{ fontFamily:'system-ui', minHeight:'100vh', background:C }}>
      <div style={{ background:B, color:C, padding:'24px 32px', borderBottom:`4px solid ${G}` }}>
        <div style={{ fontSize:11, letterSpacing:2, opacity:.85 }}>MODULE #8 · COMMERCIAL &amp; SALES</div>
        <h1 style={{ margin:'6px 0 0', fontSize:28, fontFamily:'Georgia,serif' }}>Commissions</h1>
        <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>Calculate → approve → pay sales commissions</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, padding:24 }}>
        {[
          { l:'Total Payable', v:`$${summary.totalAmount.toLocaleString()}`, c:B },
          { l:'Calculated', v:byStatus.Calculated, c:'#B8860B' },
          { l:'Approved', v:byStatus.Approved, c:'#1565C0' },
          { l:'Paid', v:byStatus.Paid, c:'#2E7D32' },
        ].map(k => (
          <div key={k.l} style={{ background:'#fff', padding:20, borderTop:`4px solid ${k.c}`, border:`1px solid ${B}22` }}>
            <div style={{ fontSize:11, color:'#666', letterSpacing:1, fontWeight:600 }}>{k.l.toUpperCase()}</div>
            <div style={{ fontSize:28, fontWeight:700, color:B, marginTop:6 }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'0 24px 16px', display:'flex', gap:12 }}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{ padding:'8px 20px', background:B, color:C, border:`2px solid ${G}`, fontWeight:600, cursor:'pointer' }}>+ CALCULATE NEW</button>
        <button onClick={load} style={{ padding:'8px 20px', background:'transparent', color:B, border:`2px solid ${B}`, fontWeight:600, cursor:'pointer' }}>REFRESH</button>
      </div>

      {showCreate && (
        <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`1px solid ${B}33` }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            <F l="Employee ID *"><input value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})} style={inp} /></F>
            <F l="Employee name"><input value={form.employeeName} onChange={e=>setForm({...form,employeeName:e.target.value})} style={inp} /></F>
            <F l="Period *"><input value={form.period} onChange={e=>setForm({...form,period:e.target.value})} style={inp} /></F>
            <F l="Base revenue *"><input type="number" value={form.baseRevenue} onChange={e=>setForm({...form,baseRevenue:+e.target.value})} style={inp} /></F>
            <F l="Commission rate %"><input type="number" step="0.1" value={form.commissionRate} onChange={e=>setForm({...form,commissionRate:+e.target.value})} style={inp} /></F>
            <F l="Currency"><input value={form.currency} onChange={e=>setForm({...form,currency:e.target.value.toUpperCase()})} maxLength={3} style={inp} /></F>
          </div>
          <div style={{ marginTop:8, fontSize:13, color:B }}>Computed amount: <b style={{ fontSize:18 }}>{form.currency} {previewAmount}</b></div>
          <div style={{ marginTop:12 }}>
            <button onClick={create} style={{ padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer', marginRight:8 }}>CALCULATE</button>
            <button onClick={()=>setShowCreate(false)} style={{ padding:'8px 20px', background:'transparent', color:B, border:`1px solid ${B}`, cursor:'pointer' }}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ padding:'0 24px 24px' }}>
        <div style={{ background:'#fff', border:`1px solid ${B}33`, overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:B, color:C, textAlign:'left' }}>
              {['EMPLOYEE','PERIOD','BASE','RATE','AMOUNT','STATUS','ACTIONS'].map(h=><th key={h} style={{ padding:10 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.length===0 ? <tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:'#888' }}>No commissions yet</td></tr> :
                rows.map((r,i)=>(
                  <tr key={r.id} style={{ background:i%2?C:'#fff', borderBottom:`1px solid ${B}11` }}>
                    <td style={{ padding:10, fontWeight:600, color:B }}>{r.employeeName || r.employeeId}</td>
                    <td style={{ padding:10 }}>{r.period}</td>
                    <td style={{ padding:10, fontFamily:'monospace' }}>{r.currency} {r.baseRevenue.toLocaleString()}</td>
                    <td style={{ padding:10 }}>{r.commissionRate}%</td>
                    <td style={{ padding:10, fontFamily:'monospace', fontWeight:700, color:B }}>{r.currency} {r.commissionAmount.toLocaleString()}</td>
                    <td style={{ padding:10 }}><span style={{ background:SC[r.status]||'#666', color:'#fff', padding:'2px 8px', fontSize:11, fontWeight:700 }}>{r.status.toUpperCase()}</span></td>
                    <td style={{ padding:10 }}>
                      {r.status==='Calculated' && <button onClick={()=>act(r.id,'approve')} style={ab('#1565C0')}>APPROVE</button>}{' '}
                      {r.status==='Approved' && <button onClick={()=>act(r.id,'pay')} style={ab('#2E7D32')}>PAY</button>}{' '}
                      {r.status!=='Paid' && <button onClick={()=>remove(r.id)} style={ab('#666')}>DELETE</button>}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const inp: React.CSSProperties = { width:'100%', padding:8, border:`1px solid ${B}55`, background:C, fontFamily:'system-ui' }
const ab = (color: string): React.CSSProperties => ({ padding:'3px 10px', background:'transparent', color, border:`1px solid ${color}`, cursor:'pointer', fontSize:11, fontWeight:600 })
function F({l,children}:{l:string;children:React.ReactNode}){ return <label><div style={{ fontSize:11, color:B, fontWeight:600, marginBottom:4 }}>{l}</div>{children}</label> }

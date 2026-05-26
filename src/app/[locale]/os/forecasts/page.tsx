'use client'

/**
 * HARVICS OS — Sales Forecasts (Module #8 slice)
 * Best/base/worst case per period with confidence + scenario roll-up.
 */

import { useEffect, useState } from 'react'

interface Forecast {
  id: string; forecastPeriod: string; ownerId: string; ownerTerritory: string | null
  bestCase: number; baseCase: number; worstCase: number; currency: string
  confidence: number; notes: string | null
}

const B = '#6B1F2B'; const G = '#C3A35E'; const C = '#F5F1E8'

export default function ForecastsPage() {
  const [rows, setRows] = useState<Forecast[]>([])
  const [sum, setSum] = useState({ bestCase: 0, baseCase: 0, worstCase: 0 })
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ forecastPeriod:'2026-Q3', ownerId:'', ownerTerritory:'', bestCase:0, baseCase:0, worstCase:0, currency:'USD', confidence:60, notes:'' })

  const load = async () => {
    const r = await fetch('/api/t14/forecasts', { cache:'no-store' })
    const j = await r.json(); setRows(j.data || []); setSum(j.summary || { bestCase:0, baseCase:0, worstCase:0 })
  }
  useEffect(()=>{ void load() },[])

  const create = async () => {
    if (!form.ownerId) return alert('Owner required')
    if (form.worstCase > form.baseCase || form.baseCase > form.bestCase) return alert('worst ≤ base ≤ best')
    const r = await fetch('/api/t14/forecasts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const j = await r.json(); if (!j.success) return alert(JSON.stringify(j.issues || j.error))
    setShowCreate(false); await load()
  }
  const remove = async (id: string) => { if (!confirm('Delete?')) return; await fetch(`/api/t14/forecasts/${id}`, { method:'DELETE' }); await load() }

  return (
    <div style={{ fontFamily:'system-ui', minHeight:'100vh', background:C }}>
      <div style={{ background:B, color:C, padding:'24px 32px', borderBottom:`4px solid ${G}` }}>
        <div style={{ fontSize:11, letterSpacing:2, opacity:.85 }}>MODULE #8 · COMMERCIAL &amp; SALES</div>
        <h1 style={{ margin:'6px 0 0', fontSize:28, fontFamily:'Georgia,serif' }}>Sales Forecasts</h1>
        <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>Best · base · worst scenarios per period · roll-up at top</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, padding:24 }}>
        {[
          { l:'Best Case Total', v:sum.bestCase, c:'#2E7D32' },
          { l:'Base Case Total', v:sum.baseCase, c:B },
          { l:'Worst Case Total', v:sum.worstCase, c:'#B71C1C' },
        ].map(k => (
          <div key={k.l} style={{ background:'#fff', padding:20, borderTop:`4px solid ${k.c}`, border:`1px solid ${B}22` }}>
            <div style={{ fontSize:11, color:'#666', letterSpacing:1, fontWeight:600 }}>{k.l.toUpperCase()}</div>
            <div style={{ fontSize:24, fontWeight:700, color:k.c, marginTop:6, fontFamily:'monospace' }}>${k.v.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'0 24px 16px' }}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{ padding:'8px 20px', background:B, color:C, border:`2px solid ${G}`, fontWeight:600, cursor:'pointer', marginRight:8 }}>+ NEW FORECAST</button>
        <button onClick={load} style={{ padding:'8px 20px', background:'transparent', color:B, border:`2px solid ${B}`, fontWeight:600, cursor:'pointer' }}>REFRESH</button>
      </div>

      {showCreate && (
        <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`1px solid ${B}33` }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            <F l="Period *"><input value={form.forecastPeriod} onChange={e=>setForm({...form,forecastPeriod:e.target.value})} style={inp} /></F>
            <F l="Owner ID *"><input value={form.ownerId} onChange={e=>setForm({...form,ownerId:e.target.value})} style={inp} /></F>
            <F l="Territory"><input value={form.ownerTerritory} onChange={e=>setForm({...form,ownerTerritory:e.target.value})} style={inp} /></F>
            <F l="Currency"><input value={form.currency} onChange={e=>setForm({...form,currency:e.target.value.toUpperCase()})} maxLength={3} style={inp} /></F>
            <F l="Best case"><input type="number" value={form.bestCase} onChange={e=>setForm({...form,bestCase:+e.target.value})} style={inp} /></F>
            <F l="Base case"><input type="number" value={form.baseCase} onChange={e=>setForm({...form,baseCase:+e.target.value})} style={inp} /></F>
            <F l="Worst case"><input type="number" value={form.worstCase} onChange={e=>setForm({...form,worstCase:+e.target.value})} style={inp} /></F>
            <F l="Confidence %"><input type="number" min={0} max={100} value={form.confidence} onChange={e=>setForm({...form,confidence:+e.target.value})} style={inp} /></F>
          </div>
          <F l="Notes"><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={inp} /></F>
          <div style={{ marginTop:12 }}>
            <button onClick={create} style={{ padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer', marginRight:8 }}>SAVE FORECAST</button>
            <button onClick={()=>setShowCreate(false)} style={{ padding:'8px 20px', background:'transparent', color:B, border:`1px solid ${B}`, cursor:'pointer' }}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ padding:'0 24px 24px' }}>
        <div style={{ background:'#fff', border:`1px solid ${B}33`, overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:B, color:C, textAlign:'left' }}>
              {['PERIOD','OWNER','TERRITORY','BEST','BASE','WORST','CONF','ACTIONS'].map(h=><th key={h} style={{ padding:10 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.length===0 ? <tr><td colSpan={8} style={{ padding:32, textAlign:'center', color:'#888' }}>No forecasts</td></tr> :
                rows.map((r,i)=>(
                  <tr key={r.id} style={{ background:i%2?C:'#fff', borderBottom:`1px solid ${B}11` }}>
                    <td style={{ padding:10, fontWeight:600, color:B }}>{r.forecastPeriod}</td>
                    <td style={{ padding:10 }}>{r.ownerId}</td>
                    <td style={{ padding:10 }}>{r.ownerTerritory || '—'}</td>
                    <td style={{ padding:10, fontFamily:'monospace', color:'#2E7D32' }}>{r.currency} {r.bestCase.toLocaleString()}</td>
                    <td style={{ padding:10, fontFamily:'monospace', fontWeight:600 }}>{r.currency} {r.baseCase.toLocaleString()}</td>
                    <td style={{ padding:10, fontFamily:'monospace', color:'#B71C1C' }}>{r.currency} {r.worstCase.toLocaleString()}</td>
                    <td style={{ padding:10 }}>
                      <div style={{ height:8, background:'#eee', width:60, position:'relative' }}>
                        <div style={{ height:'100%', width:`${r.confidence}%`, background:G }} />
                      </div>
                      <div style={{ fontSize:11, color:'#666' }}>{r.confidence}%</div>
                    </td>
                    <td style={{ padding:10 }}><button onClick={()=>remove(r.id)} style={ab('#666')}>DELETE</button></td>
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

const inp: React.CSSProperties = { width:'100%', padding:8, border:`1px solid ${B}55`, background:C }
const ab = (color: string): React.CSSProperties => ({ padding:'3px 10px', background:'transparent', color, border:`1px solid ${color}`, cursor:'pointer', fontSize:11, fontWeight:600 })
function F({l,children}:{l:string;children:React.ReactNode}){ return <label style={{ display:'block', marginTop:4 }}><div style={{ fontSize:11, color:B, fontWeight:600, marginBottom:4 }}>{l}</div>{children}</label> }

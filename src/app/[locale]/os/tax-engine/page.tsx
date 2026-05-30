'use client'

/**
 * HARVICS OS — Tax Engine (Module #48)
 * Rate management + live lookup ("how much VAT on $X in DE?").
 */
import { useEffect, useState } from 'react'

interface Rate { id: string; country: string; region: string | null; taxType: string; ratePercent: number; effectiveFrom: string; effectiveTo: string | null; notes: string | null }
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F0E8'

export default function TaxPage() {
  const [rows, setRows] = useState<Rate[]>([])
  const [form, setForm] = useState({ country:'AE', region:'', taxType:'VAT', ratePercent:5, notes:'' })
  const [lookup, setLookup] = useState({ country:'AE', taxType:'VAT', amount:1000 })
  const [calc, setCalc] = useState<any>(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = async () => { const r = await fetch('/api/platform/tax/rates', {cache:'no-store'}); setRows((await r.json()).data || []) }
  useEffect(()=>{ void load() },[])

  const create = async () => {
    const r = await fetch('/api/platform/tax/rates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j = await r.json(); if(!j.success) return alert(JSON.stringify(j.issues || j.error))
    setShowCreate(false); await load()
  }
  const doLookup = async () => {
    const r = await fetch(`/api/platform/tax/lookup?country=${lookup.country}&taxType=${lookup.taxType}&amount=${lookup.amount}`)
    const j = await r.json(); if(!j.success) return alert(j.error); setCalc(j.data)
  }
  const remove = async (id: string) => { if(!confirm('Delete?')) return; await fetch(`/api/platform/tax/rates/${id}`,{method:'DELETE'}); await load() }

  return (
    <div style={{ fontFamily:'system-ui', minHeight:'100vh', background:C }}>
      <div style={{ background:B, color:C, padding:'24px 32px', borderBottom:`4px solid ${G}` }}>
        <div style={{ fontSize:11, letterSpacing:2, opacity:.85 }}>MODULE #48 · PLATFORM &amp; INFRASTRUCTURE</div>
        <h1 style={{ margin:'6px 0 0', fontSize:28, fontFamily:'Georgia,serif' }}>Tax Engine</h1>
        <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>VAT / GST / Sales / Excise / Withholding rate registry + live calc</div>
      </div>

      <div style={{ padding:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'#fff', padding:16, border:`1px solid ${B}33` }}>
          <div style={{ fontSize:13, color:B, fontWeight:700, marginBottom:8 }}>LIVE TAX LOOKUP</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            <F l="Country (ISO-2)"><input value={lookup.country} onChange={e=>setLookup({...lookup,country:e.target.value.toUpperCase()})} maxLength={2} style={inp} /></F>
            <F l="Tax type"><select value={lookup.taxType} onChange={e=>setLookup({...lookup,taxType:e.target.value})} style={inp}><option>VAT</option><option>GST</option><option>Sales</option><option>Excise</option><option>Withholding</option></select></F>
            <F l="Amount"><input type="number" value={lookup.amount} onChange={e=>setLookup({...lookup,amount:+e.target.value})} style={inp} /></F>
          </div>
          <button onClick={doLookup} style={{ marginTop:10, padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer' }}>CALCULATE</button>
          {calc && (
            <div style={{ marginTop:12, background:C, padding:12, borderLeft:`4px solid ${G}` }}>
              <div style={{ fontSize:13, color:B }}>{calc.country} {calc.taxType} {calc.ratePercent}% on {calc.amount}</div>
              <div style={{ fontSize:20, fontWeight:700, color:B, marginTop:4 }}>Tax: {calc.tax} · Total: {calc.total}</div>
            </div>
          )}
        </div>

        <div style={{ background:'#fff', padding:16, border:`1px solid ${B}33` }}>
          <div style={{ fontSize:13, color:B, fontWeight:700, marginBottom:8 }}>QUICK STATS</div>
          <div>Rates loaded: <b>{rows.length}</b></div>
          <div>Countries: <b>{new Set(rows.map(r=>r.country)).size}</b></div>
          <div>Tax types: <b>{new Set(rows.map(r=>r.taxType)).size}</b></div>
        </div>
      </div>

      <div style={{ padding:'0 24px 16px' }}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{ padding:'8px 20px', background:B, color:C, border:`2px solid ${G}`, fontWeight:600, cursor:'pointer', marginRight:8 }}>+ ADD RATE</button>
        <button onClick={load} style={{ padding:'8px 20px', background:'transparent', color:B, border:`2px solid ${B}`, fontWeight:600, cursor:'pointer' }}>REFRESH</button>
      </div>

      {showCreate && (
        <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`1px solid ${B}33` }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
            <F l="Country (ISO-2) *"><input value={form.country} onChange={e=>setForm({...form,country:e.target.value.toUpperCase()})} maxLength={2} style={inp} /></F>
            <F l="Region"><input value={form.region} onChange={e=>setForm({...form,region:e.target.value})} style={inp} /></F>
            <F l="Tax type"><select value={form.taxType} onChange={e=>setForm({...form,taxType:e.target.value})} style={inp}><option>VAT</option><option>GST</option><option>Sales</option><option>Excise</option><option>Withholding</option></select></F>
            <F l="Rate %"><input type="number" step="0.01" value={form.ratePercent} onChange={e=>setForm({...form,ratePercent:+e.target.value})} style={inp} /></F>
            <F l="Notes"><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={inp} /></F>
          </div>
          <button onClick={create} style={{ marginTop:10, padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer' }}>ADD</button>
        </div>
      )}

      <div style={{ padding:'0 24px 24px' }}>
        <div style={{ background:'#fff', border:`1px solid ${B}33`, overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:B, color:C, textAlign:'left' }}>{['COUNTRY','REGION','TYPE','RATE','EFFECTIVE FROM','NOTES','ACTIONS'].map(h=><th key={h} style={{padding:10}}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.length===0 ? <tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:'#888' }}>No rates loaded. Add some.</td></tr> :
                rows.map((r,i)=>(
                  <tr key={r.id} style={{ background:i%2?C:'#fff', borderBottom:`1px solid ${B}11` }}>
                    <td style={{ padding:10, fontWeight:600, color:B }}>{r.country}</td>
                    <td style={{ padding:10 }}>{r.region || '—'}</td>
                    <td style={{ padding:10 }}>{r.taxType}</td>
                    <td style={{ padding:10, fontWeight:700, color:B }}>{r.ratePercent}%</td>
                    <td style={{ padding:10, color:'#555' }}>{new Date(r.effectiveFrom).toLocaleDateString()}</td>
                    <td style={{ padding:10, color:'#555', fontSize:12 }}>{r.notes || '—'}</td>
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
function F({l,children}:{l:string;children:React.ReactNode}){ return <label><div style={{ fontSize:11, color:B, fontWeight:600, marginBottom:4 }}>{l}</div>{children}</label> }

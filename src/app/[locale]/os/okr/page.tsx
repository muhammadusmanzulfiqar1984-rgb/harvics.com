'use client'

/**
 * HARVICS OS — OKR Tracking (Module #43)
 * Create objectives, check in with progress, auto status (On Track/At Risk/Behind/Completed).
 */

import { useEffect, useState } from 'react'

interface OKR {
  id: string; objective: string; owner: string; progress: number
  keyResults: number; completed: number; period: string
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed'
}

const B = 'var(--harvics-burgundy)'; const G = 'var(--harvics-gold)'; const C = 'var(--harvics-cream)'
const SC: Record<string,string> = { 'On Track':'#2E7D32', 'At Risk':'#F9A825', Behind:'#B71C1C', Completed:'#1565C0' }

export default function OkrPage() {
  const [rows, setRows] = useState<OKR[]>([])
  const [avg, setAvg] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ objective:'', owner:'', keyResults:3, period:'2026-H1' })
  const [checkin, setCheckin] = useState<{ id: string; progress: number; completed: number } | null>(null)

  const load = async () => {
    const r = await fetch('/api/t14/okr', { cache:'no-store' })
    const j = await r.json(); setRows(j.data || []); setAvg(j.summary?.avgProgress || 0)
  }
  useEffect(() => { void load() }, [])

  const create = async () => {
    if (!form.objective || !form.owner) return alert('Objective + owner required')
    const r = await fetch('/api/t14/okr', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const j = await r.json(); if (!j.success) return alert(JSON.stringify(j.issues || j.error))
    setShowCreate(false); setForm({ objective:'', owner:'', keyResults:3, period:'2026-H1' }); await load()
  }
  const saveCheckin = async () => {
    if (!checkin) return
    const r = await fetch(`/api/t14/okr/${checkin.id}/checkin`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ progress: checkin.progress, completed: checkin.completed }) })
    const j = await r.json(); if (!j.success) return alert(j.error)
    setCheckin(null); await load()
  }
  const remove = async (id: string) => {
    if (!confirm('Delete?')) return
    await fetch(`/api/t14/okr/${id}`, { method:'DELETE' }); await load()
  }

  return (
    <div style={{ fontFamily:'system-ui', minHeight:'100vh', background:C }}>
      <div style={{ background:B, color:C, padding:'24px 32px', borderBottom:`4px solid ${G}` }}>
        <div style={{ fontSize:11, letterSpacing:2, opacity:.85 }}>MODULE #43 · ANALYTICS &amp; INTELLIGENCE</div>
        <h1 style={{ margin:'6px 0 0', fontSize:28, fontFamily:'Georgia,serif' }}>OKR Tracking</h1>
        <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>Objectives and key results · auto health from check-ins</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, padding:24 }}>
        <div style={{ background:'#fff', padding:20, borderTop:`4px solid ${B}`, border:`1px solid ${B}22` }}>
          <div style={{ fontSize:11, color:'#666', letterSpacing:1, fontWeight:600 }}>AVG PROGRESS</div>
          <div style={{ fontSize:32, fontWeight:700, color:B, marginTop:6 }}>{avg}%</div>
        </div>
        <div style={{ background:'#fff', padding:20, borderTop:`4px solid ${G}`, border:`1px solid ${B}22` }}>
          <div style={{ fontSize:11, color:'#666', letterSpacing:1, fontWeight:600 }}>ACTIVE OBJECTIVES</div>
          <div style={{ fontSize:32, fontWeight:700, color:B, marginTop:6 }}>{rows.filter(r=>r.status!=='Completed').length}</div>
        </div>
      </div>

      <div style={{ padding:'0 24px 16px' }}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{ padding:'8px 20px', background:B, color:C, border:`2px solid ${G}`, fontWeight:600, cursor:'pointer', marginRight:8 }}>+ NEW OBJECTIVE</button>
        <button onClick={load} style={{ padding:'8px 20px', background:'transparent', color:B, border:`2px solid ${B}`, fontWeight:600, cursor:'pointer' }}>REFRESH</button>
      </div>

      {showCreate && (
        <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`1px solid ${B}33` }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
            <F l="Objective *"><input value={form.objective} onChange={e=>setForm({...form,objective:e.target.value})} style={inp} /></F>
            <F l="Owner *"><input value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})} style={inp} /></F>
            <F l="Key results count"><input type="number" min={1} max={20} value={form.keyResults} onChange={e=>setForm({...form,keyResults:+e.target.value})} style={inp} /></F>
            <F l="Period"><input value={form.period} onChange={e=>setForm({...form,period:e.target.value})} style={inp} /></F>
          </div>
          <div style={{ marginTop:12 }}>
            <button onClick={create} style={{ padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer', marginRight:8 }}>CREATE</button>
            <button onClick={()=>setShowCreate(false)} style={{ padding:'8px 20px', background:'transparent', color:B, border:`1px solid ${B}`, cursor:'pointer' }}>CANCEL</button>
          </div>
        </div>
      )}

      {checkin && (() => {
        const okr = rows.find(r => r.id === checkin.id)
        if (!okr) return null
        return (
          <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`2px solid ${G}` }}>
            <div style={{ fontWeight:600, color:B, marginBottom:8 }}>Check-in: {okr.objective}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <F l={`Progress: ${checkin.progress}%`}><input type="range" min={0} max={100} value={checkin.progress} onChange={e=>setCheckin({...checkin, progress:+e.target.value})} style={{ width:'100%' }} /></F>
              <F l={`Completed key results: ${checkin.completed} / ${okr.keyResults}`}><input type="range" min={0} max={okr.keyResults} value={checkin.completed} onChange={e=>setCheckin({...checkin, completed:+e.target.value})} style={{ width:'100%' }} /></F>
            </div>
            <div style={{ marginTop:12 }}>
              <button onClick={saveCheckin} style={{ padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer', marginRight:8 }}>SAVE CHECK-IN</button>
              <button onClick={()=>setCheckin(null)} style={{ padding:'8px 20px', background:'transparent', color:B, border:`1px solid ${B}`, cursor:'pointer' }}>CANCEL</button>
            </div>
          </div>
        )
      })()}

      <div style={{ padding:'0 24px 24px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px,1fr))', gap:16 }}>
        {rows.length===0 ? <div style={{ padding:32, color:'#888' }}>No OKRs yet</div> :
          rows.map(o => (
            <div key={o.id} style={{ background:'#fff', padding:16, border:`1px solid ${B}33`, borderLeft:`6px solid ${SC[o.status]}` }}>
              <div style={{ fontSize:11, letterSpacing:1, color:'#666', fontWeight:600 }}>{o.period} · {o.owner}</div>
              <div style={{ fontWeight:700, color:B, fontSize:15, margin:'4px 0 10px' }}>{o.objective}</div>
              <div style={{ height:10, background:'#eee', border:`1px solid ${B}22`, marginBottom:6 }}>
                <div style={{ height:'100%', width:`${o.progress}%`, background:SC[o.status] }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#555' }}>
                <span>{o.progress}% · KRs {o.completed}/{o.keyResults}</span>
                <span style={{ background:SC[o.status], color:'#fff', padding:'1px 8px', fontSize:10, fontWeight:700 }}>{o.status.toUpperCase()}</span>
              </div>
              <div style={{ marginTop:10 }}>
                <button onClick={()=>setCheckin({ id:o.id, progress:o.progress, completed:o.completed })} style={ab(B)}>CHECK-IN</button>{' '}
                <button onClick={()=>remove(o.id)} style={ab('#666')}>DELETE</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

const inp: React.CSSProperties = { width:'100%', padding:8, border:`1px solid ${B}55`, background:C }
const ab = (color: string): React.CSSProperties => ({ padding:'3px 10px', background:'transparent', color, border:`1px solid ${color}`, cursor:'pointer', fontSize:11, fontWeight:600 })
function F({l,children}:{l:string;children:React.ReactNode}){ return <label><div style={{ fontSize:11, color:B, fontWeight:600, marginBottom:4 }}>{l}</div>{children}</label> }

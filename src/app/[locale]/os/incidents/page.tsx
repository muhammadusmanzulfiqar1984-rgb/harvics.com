'use client'

/**
 * HARVICS OS — Incidents (GRC Core #37)
 * Lifecycle: Open → In Progress → Resolved → Closed.
 */

import { useEffect, useState } from 'react'

interface Incident {
  id: string
  title: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  reportedDate: string
  resolution: string | null
  resolvedDate: string | null
}

const B = '#6B1F2B'; const G = '#C3A35E'; const C = '#F5F1E8'
const SEV: Record<string,string> = { Critical:'#B71C1C', High:'#E65100', Medium:'#F9A825', Low:'#558B2F' }
const STA: Record<string,string> = { Open:'#B8860B', 'In Progress':'#1565C0', Resolved:'#2E7D32', Closed:'#666' }

export default function IncidentsPage() {
  const [rows, setRows] = useState<Incident[]>([])
  const [summary, setSummary] = useState({ open: 0, critical: 0 })
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', severity: 'Medium' as Incident['severity'] })
  const [resolveFor, setResolveFor] = useState<string | null>(null)
  const [resolution, setResolution] = useState('')

  const load = async () => {
    const r = await fetch('/api/t14/incidents', { cache: 'no-store' })
    const j = await r.json(); setRows(j.data || []); setSummary(j.summary || { open: 0, critical: 0 })
  }
  useEffect(() => { void load() }, [])

  const create = async () => {
    if (!form.title) return alert('Title required')
    const r = await fetch('/api/t14/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const j = await r.json(); if (!j.success) return alert(JSON.stringify(j.issues || j.error))
    setShowCreate(false); setForm({ title: '', severity: 'Medium' }); await load()
  }
  const act = async (id: string, what: 'start' | 'close') => {
    const r = await fetch(`/api/t14/incidents/${id}/${what}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:'{}' })
    const j = await r.json(); if (!j.success) return alert(j.error); await load()
  }
  const resolve = async () => {
    if (!resolveFor || !resolution) return
    const r = await fetch(`/api/t14/incidents/${resolveFor}/resolve`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ resolution }) })
    const j = await r.json(); if (!j.success) return alert(j.error)
    setResolveFor(null); setResolution(''); await load()
  }

  return (
    <div style={{ fontFamily:'system-ui', minHeight:'100vh', background:C }}>
      <div style={{ background:B, color:C, padding:'24px 32px', borderBottom:`4px solid ${G}` }}>
        <div style={{ fontSize:11, letterSpacing:2, opacity:.85 }}>MODULE #37 · GRC</div>
        <h1 style={{ margin:'6px 0 0', fontSize:28, fontFamily:'Georgia,serif' }}>Incidents</h1>
        <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>Report, triage, resolve and close operational incidents</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, padding:24 }}>
        <div style={{ background:'#fff', padding:20, borderTop:`4px solid #B8860B`, border:`1px solid ${B}22` }}>
          <div style={{ fontSize:11, color:'#666', letterSpacing:1, fontWeight:600 }}>OPEN INCIDENTS</div>
          <div style={{ fontSize:32, fontWeight:700, color:B, marginTop:6 }}>{summary.open}</div>
        </div>
        <div style={{ background:'#fff', padding:20, borderTop:`4px solid #B71C1C`, border:`1px solid ${B}22` }}>
          <div style={{ fontSize:11, color:'#666', letterSpacing:1, fontWeight:600 }}>CRITICAL OPEN</div>
          <div style={{ fontSize:32, fontWeight:700, color:'#B71C1C', marginTop:6 }}>{summary.critical}</div>
        </div>
      </div>

      <div style={{ padding:'0 24px 16px' }}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{ padding:'8px 20px', background:B, color:C, border:`2px solid ${G}`, fontWeight:600, cursor:'pointer', marginRight:8 }}>+ REPORT INCIDENT</button>
        <button onClick={load} style={{ padding:'8px 20px', background:'transparent', color:B, border:`2px solid ${B}`, fontWeight:600, cursor:'pointer' }}>REFRESH</button>
      </div>

      {showCreate && (
        <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`1px solid ${B}33` }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
            <F l="Title *"><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inp} /></F>
            <F l="Severity">
              <select value={form.severity} onChange={e=>setForm({...form,severity:e.target.value as Incident['severity']})} style={inp}>
                <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
              </select>
            </F>
          </div>
          <div style={{ marginTop:12 }}>
            <button onClick={create} style={{ padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer', marginRight:8 }}>REPORT</button>
            <button onClick={()=>setShowCreate(false)} style={{ padding:'8px 20px', background:'transparent', color:B, border:`1px solid ${B}`, cursor:'pointer' }}>CANCEL</button>
          </div>
        </div>
      )}

      {resolveFor && (
        <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`2px solid ${G}` }}>
          <div style={{ fontSize:12, color:B, marginBottom:4, fontWeight:600 }}>RESOLUTION NOTES *</div>
          <textarea value={resolution} onChange={e=>setResolution(e.target.value)} rows={3} style={{ ...inp, fontFamily:'system-ui' }} />
          <div style={{ marginTop:12 }}>
            <button onClick={resolve} style={{ padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer', marginRight:8 }}>MARK RESOLVED</button>
            <button onClick={()=>{setResolveFor(null);setResolution('')}} style={{ padding:'8px 20px', background:'transparent', color:B, border:`1px solid ${B}`, cursor:'pointer' }}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ padding:'0 24px 24px' }}>
        <div style={{ background:'#fff', border:`1px solid ${B}33`, overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:B, color:C, textAlign:'left' }}>
              {['TITLE','SEVERITY','REPORTED','STATUS','RESOLUTION','ACTIONS'].map(h=><th key={h} style={{ padding:10 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.length===0 ? <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'#888' }}>No incidents</td></tr> :
                rows.map((r,i)=>(
                  <tr key={r.id} style={{ background:i%2?C:'#fff', borderBottom:`1px solid ${B}11` }}>
                    <td style={{ padding:10, fontWeight:600, color:B }}>{r.title}</td>
                    <td style={{ padding:10 }}><span style={{ background:SEV[r.severity], color:'#fff', padding:'2px 8px', fontSize:11, fontWeight:700 }}>{r.severity.toUpperCase()}</span></td>
                    <td style={{ padding:10, color:'#555' }}>{new Date(r.reportedDate).toLocaleDateString()}</td>
                    <td style={{ padding:10 }}><span style={{ background:STA[r.status], color:'#fff', padding:'2px 8px', fontSize:11, fontWeight:700 }}>{r.status.toUpperCase()}</span></td>
                    <td style={{ padding:10, color:'#555', fontSize:12, maxWidth:240 }}>{r.resolution || '—'}</td>
                    <td style={{ padding:10 }}>
                      {r.status==='Open' && <button onClick={()=>act(r.id,'start')} style={ab('#1565C0')}>START</button>}{' '}
                      {(r.status==='Open' || r.status==='In Progress') && <button onClick={()=>{setResolveFor(r.id);setResolution('')}} style={ab('#2E7D32')}>RESOLVE</button>}{' '}
                      {r.status==='Resolved' && <button onClick={()=>act(r.id,'close')} style={ab('#666')}>CLOSE</button>}
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

const inp: React.CSSProperties = { width:'100%', padding:8, border:`1px solid ${B}55`, background:C }
const ab = (color: string): React.CSSProperties => ({ padding:'3px 10px', background:'transparent', color, border:`1px solid ${color}`, cursor:'pointer', fontSize:11, fontWeight:600 })
function F({l,children}:{l:string;children:React.ReactNode}){ return <label><div style={{ fontSize:11, color:B, fontWeight:600, marginBottom:4 }}>{l}</div>{children}</label> }

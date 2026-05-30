'use client'

/**
 * HARVICS OS — Globalisation (Module #58)
 * Locale toggle + per-locale config.
 */
import { useEffect, useState } from 'react'

interface Loc { id:string; code:string; name:string; direction:string; enabled:boolean; fallback:string|null; dateFormat:string|null; currency:string|null }
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F0E8'

export default function LocalesPage() {
  const [rows, setRows] = useState<Loc[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ code:'', name:'', direction:'ltr', enabled:true, fallback:'en', dateFormat:'YYYY-MM-DD', currency:'USD' })

  const load = async () => { const r = await fetch('/api/platform/locales',{cache:'no-store'}); setRows((await r.json()).data || []) }
  useEffect(()=>{ void load() },[])

  const create = async () => {
    if (!form.code || !form.name) return alert('Code + name required')
    const r = await fetch('/api/platform/locales',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j = await r.json(); if(!j.success) return alert(JSON.stringify(j.issues || j.error))
    setShowCreate(false); await load()
  }
  const toggle = async (id: string) => { await fetch(`/api/platform/locales/${id}/toggle`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}); await load() }
  const remove = async (id: string) => { if(!confirm('Delete?')) return; await fetch(`/api/platform/locales/${id}`,{method:'DELETE'}); await load() }

  return (
    <div style={{ fontFamily:'system-ui', minHeight:'100vh', background:C }}>
      <div style={{ background:B, color:C, padding:'24px 32px', borderBottom:`4px solid ${G}` }}>
        <div style={{ fontSize:11, letterSpacing:2, opacity:.85 }}>MODULE #58 · DATA &amp; AI</div>
        <h1 style={{ margin:'6px 0 0', fontSize:28, fontFamily:'Georgia,serif' }}>Globalisation</h1>
        <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>Locale registry · LTR/RTL · per-locale formats + toggles</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, padding:24 }}>
        <div style={{ background:'#fff', padding:20, borderTop:`4px solid ${B}`, border:`1px solid ${B}22` }}><div style={{ fontSize:11, color:'#666', fontWeight:600 }}>TOTAL LOCALES</div><div style={{ fontSize:28, fontWeight:700, color:B, marginTop:6 }}>{rows.length}</div></div>
        <div style={{ background:'#fff', padding:20, borderTop:`4px solid #2E7D32`, border:`1px solid ${B}22` }}><div style={{ fontSize:11, color:'#666', fontWeight:600 }}>ENABLED</div><div style={{ fontSize:28, fontWeight:700, color:B, marginTop:6 }}>{rows.filter(r=>r.enabled).length}</div></div>
        <div style={{ background:'#fff', padding:20, borderTop:`4px solid ${G}`, border:`1px solid ${B}22` }}><div style={{ fontSize:11, color:'#666', fontWeight:600 }}>RTL LOCALES</div><div style={{ fontSize:28, fontWeight:700, color:B, marginTop:6 }}>{rows.filter(r=>r.direction==='rtl').length}</div></div>
      </div>

      <div style={{ padding:'0 24px 16px' }}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{ padding:'8px 20px', background:B, color:C, border:`2px solid ${G}`, fontWeight:600, cursor:'pointer', marginRight:8 }}>+ ADD LOCALE</button>
        <button onClick={load} style={{ padding:'8px 20px', background:'transparent', color:B, border:`2px solid ${B}`, fontWeight:600, cursor:'pointer' }}>REFRESH</button>
      </div>

      {showCreate && (
        <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`1px solid ${B}33` }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            <F l="Code *"><input value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="ar" style={inp} /></F>
            <F l="Name *"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Arabic" style={inp} /></F>
            <F l="Direction"><select value={form.direction} onChange={e=>setForm({...form,direction:e.target.value})} style={inp}><option>ltr</option><option>rtl</option></select></F>
            <F l="Fallback"><input value={form.fallback} onChange={e=>setForm({...form,fallback:e.target.value})} style={inp} /></F>
            <F l="Date format"><input value={form.dateFormat} onChange={e=>setForm({...form,dateFormat:e.target.value})} style={inp} /></F>
            <F l="Currency"><input value={form.currency} onChange={e=>setForm({...form,currency:e.target.value.toUpperCase()})} maxLength={3} style={inp} /></F>
            <F l="Enabled"><input type="checkbox" checked={form.enabled} onChange={e=>setForm({...form,enabled:e.target.checked})} /></F>
          </div>
          <button onClick={create} style={{ marginTop:10, padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer' }}>ADD LOCALE</button>
        </div>
      )}

      <div style={{ padding:'0 24px 24px' }}>
        <div style={{ background:'#fff', border:`1px solid ${B}33`, overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:B, color:C, textAlign:'left' }}>{['CODE','NAME','DIR','FALLBACK','DATE FMT','CURRENCY','STATUS','ACTIONS'].map(h=><th key={h} style={{padding:10}}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.length===0 ? <tr><td colSpan={8} style={{padding:32, textAlign:'center', color:'#888'}}>No locales registered yet.</td></tr> :
                rows.map((l,i)=>(
                  <tr key={l.id} style={{ background:i%2?C:'#fff', borderBottom:`1px solid ${B}11` }}>
                    <td style={{ padding:10, fontWeight:700, color:B, fontFamily:'monospace' }}>{l.code}</td>
                    <td style={{ padding:10 }}>{l.name}</td>
                    <td style={{ padding:10 }}><span style={{ background:l.direction==='rtl'?G:'#666', color:'#fff', padding:'1px 6px', fontSize:10, fontWeight:700 }}>{l.direction.toUpperCase()}</span></td>
                    <td style={{ padding:10 }}>{l.fallback || '—'}</td>
                    <td style={{ padding:10, fontFamily:'monospace', fontSize:12 }}>{l.dateFormat || '—'}</td>
                    <td style={{ padding:10 }}>{l.currency || '—'}</td>
                    <td style={{ padding:10 }}><span style={{ background:l.enabled?'#2E7D32':'#666', color:'#fff', padding:'1px 6px', fontSize:10, fontWeight:700 }}>{l.enabled?'ENABLED':'DISABLED'}</span></td>
                    <td style={{ padding:10 }}>
                      <button onClick={()=>toggle(l.id)} style={ab(l.enabled?'#666':'#2E7D32')}>{l.enabled?'DISABLE':'ENABLE'}</button>{' '}
                      <button onClick={()=>remove(l.id)} style={ab('#8B0000')}>DELETE</button>
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

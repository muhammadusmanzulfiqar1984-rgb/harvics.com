'use client'

/**
 * HARVICS OS — Audit Log Search (Module #50)
 */
import { useEffect, useState } from 'react'

interface Evt { id: string; actorId: string|null; actorRole: string|null; action: string; module: string|null; entity: string|null; entityId: string|null; result: string; ipAddress: string|null; createdAt: string }
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'

export default function AuditPage() {
  const [rows, setRows] = useState<Evt[]>([])
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ actorId:'', action:'', module:'', entity:'', result:'' })
  const [summary, setSummary] = useState<any>(null)

  const load = async () => {
    const q = new URLSearchParams()
    Object.entries(filters).forEach(([k,v])=>{ if(v) q.set(k,v) })
    q.set('limit','200')
    const r = await fetch(`/api/platform/audit/search?${q}`,{cache:'no-store'})
    const j = await r.json(); setRows(j.data || []); setTotal(j.total || 0)
    const s = await fetch('/api/platform/audit/summary',{cache:'no-store'})
    setSummary((await s.json()).data)
  }
  useEffect(()=>{ void load() },[])

  return (
    <div style={{ fontFamily:'system-ui', minHeight:'100vh', background:C }}>
      <div style={{ background:B, color:C, padding:'24px 32px', borderBottom:`4px solid ${G}` }}>
        <div style={{ fontSize:11, letterSpacing:2, opacity:.85 }}>MODULE #50 · PLATFORM &amp; INFRASTRUCTURE</div>
        <h1 style={{ margin:'6px 0 0', fontSize:28, fontFamily:'Georgia,serif' }}>Audit Log</h1>
        <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>Search, filter and review every recorded action</div>
      </div>

      <div style={{ padding:24, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <div style={{ background:'#fff', padding:16, border:`1px solid ${B}22`, borderTop:`4px solid ${B}` }}>
          <div style={{ fontSize:11, color:'#666', fontWeight:600 }}>EVENTS (24H)</div>
          <div style={{ fontSize:28, fontWeight:700, color:B, marginTop:6 }}>{summary?.last24h ?? '…'}</div>
        </div>
        {(summary?.byResult || []).map((b: any) => (
          <div key={b.result} style={{ background:'#fff', padding:16, border:`1px solid ${B}22`, borderTop:`4px solid ${b.result==='success'?'#2E7D32':'#B71C1C'}` }}>
            <div style={{ fontSize:11, color:'#666', fontWeight:600 }}>{b.result.toUpperCase()} (24H)</div>
            <div style={{ fontSize:28, fontWeight:700, color:B, marginTop:6 }}>{b._count}</div>
          </div>
        ))}
      </div>

      <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`1px solid ${B}33` }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr) auto', gap:8, alignItems:'end' }}>
          <F l="Actor"><input value={filters.actorId} onChange={e=>setFilters({...filters,actorId:e.target.value})} style={inp} /></F>
          <F l="Action contains"><input value={filters.action} onChange={e=>setFilters({...filters,action:e.target.value})} style={inp} /></F>
          <F l="Module"><input value={filters.module} onChange={e=>setFilters({...filters,module:e.target.value})} style={inp} /></F>
          <F l="Entity"><input value={filters.entity} onChange={e=>setFilters({...filters,entity:e.target.value})} style={inp} /></F>
          <F l="Result"><select value={filters.result} onChange={e=>setFilters({...filters,result:e.target.value})} style={inp}><option value="">all</option><option>success</option><option>failure</option><option>denied</option></select></F>
          <button onClick={load} style={{ padding:'8px 16px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer', height:'36px' }}>SEARCH</button>
        </div>
        <div style={{ marginTop:8, fontSize:12, color:B }}>Showing {rows.length} of {total} matching events</div>
      </div>

      <div style={{ padding:'0 24px 24px' }}>
        <div style={{ background:'#fff', border:`1px solid ${B}33`, overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead><tr style={{ background:B, color:C, textAlign:'left' }}>{['WHEN','ACTOR','ROLE','ACTION','MODULE','ENTITY','ENTITY ID','RESULT','IP'].map(h=><th key={h} style={{padding:8}}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.length===0 ? <tr><td colSpan={9} style={{ padding:32, textAlign:'center', color:'#888' }}>No events match. Use the app to generate audit data.</td></tr> :
                rows.map((e,i)=>(
                  <tr key={e.id} style={{ background:i%2?C:'#fff', borderBottom:`1px solid ${B}11` }}>
                    <td style={{ padding:8, color:'#555', fontFamily:'monospace', fontSize:11 }}>{new Date(e.createdAt).toLocaleString()}</td>
                    <td style={{ padding:8 }}>{e.actorId || '—'}</td>
                    <td style={{ padding:8 }}>{e.actorRole || '—'}</td>
                    <td style={{ padding:8, fontWeight:600, color:B }}>{e.action}</td>
                    <td style={{ padding:8 }}>{e.module || '—'}</td>
                    <td style={{ padding:8 }}>{e.entity || '—'}</td>
                    <td style={{ padding:8, fontFamily:'monospace', fontSize:11 }}>{(e.entityId || '').slice(0,16)}</td>
                    <td style={{ padding:8 }}><span style={{ background:e.result==='success'?'#2E7D32':'#B71C1C', color:'#fff', padding:'1px 6px', fontSize:10, fontWeight:700 }}>{e.result.toUpperCase()}</span></td>
                    <td style={{ padding:8, fontSize:11, color:'#555' }}>{e.ipAddress || '—'}</td>
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
function F({l,children}:{l:string;children:React.ReactNode}){ return <label><div style={{ fontSize:11, color:B, fontWeight:600, marginBottom:4 }}>{l}</div>{children}</label> }

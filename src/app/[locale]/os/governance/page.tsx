'use client'

/**
 * HARVICS OS — Governance (Module #40)
 * Policy CRUD + decision log viewer.
 */
import { useEffect, useState } from 'react'

interface Policy { id: string; name: string; scope: string; targetKey: string|null; severity: string; enabled: boolean; rule: any; createdAt: string }
interface Decision { id: string; policyId: string; outcome: string; reason: string|null; module: string|null; route: string|null; actorId: string|null; createdAt: string }
const B='var(--harvics-burgundy)'; const G='var(--harvics-gold)'; const C='var(--harvics-cream)'
const SEV: Record<string,string> = { low:'#666', medium:'#1565C0', high:'#E65100', critical:'#B71C1C' }
const OUT: Record<string,string> = { allow:'#2E7D32', warn:'#E65100', deny:'#B71C1C' }

export default function GovernancePage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [summary, setSummary] = useState<any>({})
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name:'', scope:'global', targetKey:'', severity:'medium', enabled:true, rule:'{"type":"rate-limit","params":{"max":100}}' })

  const load = async () => {
    const p = await fetch('/api/platform/governance/policies',{cache:'no-store'}); setPolicies((await p.json()).data || [])
    const d = await fetch('/api/platform/governance/decisions?limit=50',{cache:'no-store'}); const dj = await d.json(); setDecisions(dj.data || []); setSummary(dj.summary || {})
  }
  useEffect(()=>{ void load() },[])

  const create = async () => {
    if(!form.name) return alert('Name required')
    let rule: any
    try { rule = JSON.parse(form.rule) } catch { return alert('Rule must be valid JSON') }
    const body = { ...form, rule, targetKey: form.targetKey || null }
    const r = await fetch('/api/platform/governance/policies',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    const j = await r.json(); if(!j.success) return alert(JSON.stringify(j.issues || j.error))
    setShowCreate(false); await load()
  }
  const toggle = async (p: Policy) => {
    await fetch(`/api/platform/governance/policies/${p.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled:!p.enabled})})
    await load()
  }
  const remove = async (id: string) => { if(!confirm('Delete?')) return; await fetch(`/api/platform/governance/policies/${id}`,{method:'DELETE'}); await load() }

  return (
    <div style={{ fontFamily:'system-ui', minHeight:'100vh', background:C }}>
      <div style={{ background:B, color:C, padding:'24px 32px', borderBottom:`4px solid ${G}` }}>
        <div style={{ fontSize:11, letterSpacing:2, opacity:.85 }}>MODULE #40 · GRC</div>
        <h1 style={{ margin:'6px 0 0', fontSize:28, fontFamily:'Georgia,serif' }}>Neural Governance</h1>
        <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>Policy registry + decision log</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, padding:24 }}>
        {[
          { l:'Policies', v:policies.length, c:B },
          { l:'Allow (all-time)', v:summary.allow ?? '…', c:'#2E7D32' },
          { l:'Warn (all-time)', v:summary.warn ?? '…', c:'#E65100' },
          { l:'Deny (all-time)', v:summary.deny ?? '…', c:'#B71C1C' },
        ].map(k=>(
          <div key={k.l} style={{ background:'#fff', padding:20, borderTop:`4px solid ${k.c}`, border:`1px solid ${B}22` }}>
            <div style={{ fontSize:11, color:'#666', letterSpacing:1, fontWeight:600 }}>{k.l.toUpperCase()}</div>
            <div style={{ fontSize:28, fontWeight:700, color:B, marginTop:6 }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'0 24px 16px' }}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{ padding:'8px 20px', background:B, color:C, border:`2px solid ${G}`, fontWeight:600, cursor:'pointer', marginRight:8 }}>+ NEW POLICY</button>
        <button onClick={load} style={{ padding:'8px 20px', background:'transparent', color:B, border:`2px solid ${B}`, fontWeight:600, cursor:'pointer' }}>REFRESH</button>
      </div>

      {showCreate && (
        <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`1px solid ${B}33` }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:8 }}>
            <F l="Name *"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inp} /></F>
            <F l="Scope"><select value={form.scope} onChange={e=>setForm({...form,scope:e.target.value})} style={inp}><option>global</option><option>module</option><option>route</option></select></F>
            <F l="Target key"><input value={form.targetKey} onChange={e=>setForm({...form,targetKey:e.target.value})} style={inp} /></F>
            <F l="Severity"><select value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})} style={inp}><option>low</option><option>medium</option><option>high</option><option>critical</option></select></F>
          </div>
          <F l="Rule JSON"><textarea value={form.rule} onChange={e=>setForm({...form,rule:e.target.value})} rows={3} style={{...inp, fontFamily:'monospace', fontSize:12}} /></F>
          <button onClick={create} style={{ marginTop:8, padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer' }}>CREATE</button>
        </div>
      )}

      <div style={{ padding:'0 24px 24px', display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:16 }}>
        <div style={{ background:'#fff', border:`1px solid ${B}33`, overflow:'hidden' }}>
          <div style={{ background:B, color:C, padding:'10px 12px', fontWeight:700, fontSize:13 }}>POLICIES</div>
          {policies.length===0 ? <div style={{ padding:24, color:'#888' }}>No policies defined.</div> :
            policies.map(p => (
              <div key={p.id} style={{ padding:'10px 12px', borderBottom:`1px solid ${B}11`, display:'flex', gap:10, alignItems:'center' }}>
                <span style={{ background:SEV[p.severity], color:'#fff', padding:'1px 6px', fontSize:10, fontWeight:700 }}>{p.severity.toUpperCase()}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:B }}>{p.name}</div>
                  <div style={{ fontSize:11, color:'#666' }}>{p.scope}{p.targetKey ? ` · ${p.targetKey}` : ''}</div>
                </div>
                <button onClick={()=>toggle(p)} style={ab(p.enabled?'#2E7D32':'#666')}>{p.enabled?'ENABLED':'DISABLED'}</button>{' '}
                <button onClick={()=>remove(p.id)} style={ab('#8B0000')}>DELETE</button>
              </div>
            ))
          }
        </div>
        <div style={{ background:'#fff', border:`1px solid ${B}33`, overflow:'hidden' }}>
          <div style={{ background:B, color:C, padding:'10px 12px', fontWeight:700, fontSize:13 }}>RECENT DECISIONS</div>
          {decisions.length===0 ? <div style={{ padding:24, color:'#888' }}>No decisions logged yet.</div> :
            decisions.map(d=>(
              <div key={d.id} style={{ padding:'8px 12px', borderBottom:`1px solid ${B}11`, fontSize:12 }}>
                <span style={{ background:OUT[d.outcome], color:'#fff', padding:'1px 6px', fontSize:10, fontWeight:700 }}>{d.outcome.toUpperCase()}</span>
                {' '}<b>{d.module || '—'}</b> · {d.actorId || 'anon'} · {new Date(d.createdAt).toLocaleString()}
                {d.reason && <div style={{ color:'#555', marginTop:2 }}>{d.reason}</div>}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
const inp: React.CSSProperties = { width:'100%', padding:8, border:`1px solid ${B}55`, background:C }
const ab = (color: string): React.CSSProperties => ({ padding:'3px 10px', background:'transparent', color, border:`1px solid ${color}`, cursor:'pointer', fontSize:11, fontWeight:600 })
function F({l,children}:{l:string;children:React.ReactNode}){ return <label style={{display:'block', marginTop:4}}><div style={{ fontSize:11, color:B, fontWeight:600, marginBottom:4 }}>{l}</div>{children}</label> }

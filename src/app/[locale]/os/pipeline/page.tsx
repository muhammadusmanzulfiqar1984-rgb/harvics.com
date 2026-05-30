'use client'
/** HARVICS OS — CRM Pipeline (Module #8) — kanban-style stage view */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F0E8'
const STAGES=['Prospecting','Qualified','Proposal','Negotiation','Closed Won','Closed Lost'] as const
const SC:Record<string,string>={'Prospecting':'#1565C0','Qualified':'#0277BD','Proposal':'#B8860B','Negotiation':'#E65100','Closed Won':'#2E7D32','Closed Lost':'#666'}
interface Deal{id:string;name:string;value:number;currency:string;stage:string;probability:number;ownerId:string|null;customerId:string|null;expectedClose:string|null}
interface StageData{stage:string;count:number;value:number;weighted:number;deals:Deal[]}
export default function PipelinePage(){
  const [pipeline,setPipeline]=useState<StageData[]>([])
  const [summary,setSummary]=useState({totalPipeline:0,totalWeighted:0})
  const [showCreate,setShowCreate]=useState(false)
  const [form,setForm]=useState({name:'',customerId:'',ownerId:'',stage:'Prospecting',value:0,currency:'USD',probability:20})
  const load=async()=>{const r=await fetch('/api/wave3/crm/pipeline',{cache:'no-store'});const j=await r.json();setPipeline(j.data||[]);setSummary(j.summary||{totalPipeline:0,totalWeighted:0})}
  useEffect(()=>{void load()},[])
  const create=async()=>{
    if(!form.name||form.value<=0)return alert('Name + value required')
    const r=await fetch('/api/wave3/crm/deals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error))
    setShowCreate(false);setForm({name:'',customerId:'',ownerId:'',stage:'Prospecting',value:0,currency:'USD',probability:20});await load()
  }
  const advance=async(d:Deal,dir:1|-1)=>{
    const idx=STAGES.indexOf(d.stage as any);const next=STAGES[idx+dir];if(!next)return
    await fetch(`/api/wave3/crm/deals/${d.id}/stage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({stage:next})})
    await load()
  }
  return(
    <div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
      <div style={{background:B,color:C,padding:'24px 32px',borderBottom:`4px solid ${G}`}}>
        <div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE #8 · COMMERCIAL &amp; SALES</div>
        <h1 style={{margin:'6px 0 0',fontSize:28,fontFamily:'Georgia,serif'}}>Sales Pipeline</h1>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>Deals across stages · weighted value at top · drag-forward via buttons</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,padding:24}}>
        <div style={{background:'#fff',padding:20,borderTop:`4px solid ${B}`,border:`1px solid ${B}22`}}><div style={{fontSize:11,color:'#666',fontWeight:600}}>TOTAL PIPELINE</div><div style={{fontSize:28,fontWeight:700,color:B,marginTop:6,fontFamily:'monospace'}}>${summary.totalPipeline.toLocaleString()}</div></div>
        <div style={{background:'#fff',padding:20,borderTop:`4px solid ${G}`,border:`1px solid ${B}22`}}><div style={{fontSize:11,color:'#666',fontWeight:600}}>WEIGHTED (probability adj.)</div><div style={{fontSize:28,fontWeight:700,color:B,marginTop:6,fontFamily:'monospace'}}>${summary.totalWeighted.toLocaleString()}</div></div>
      </div>
      <div style={{padding:'0 24px 16px'}}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{padding:'8px 20px',background:B,color:C,border:`2px solid ${G}`,fontWeight:600,cursor:'pointer',marginRight:8}}>+ NEW DEAL</button>
        <button onClick={load} style={{padding:'8px 20px',background:'transparent',color:B,border:`2px solid ${B}`,fontWeight:600,cursor:'pointer'}}>REFRESH</button>
      </div>
      {showCreate && (
        <div style={{margin:'0 24px 16px',background:'#fff',padding:16,border:`1px solid ${B}33`}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            <F l="Deal name *"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inp}/></F>
            <F l="Customer ID"><input value={form.customerId} onChange={e=>setForm({...form,customerId:e.target.value})} style={inp}/></F>
            <F l="Owner ID"><input value={form.ownerId} onChange={e=>setForm({...form,ownerId:e.target.value})} style={inp}/></F>
            <F l="Value *"><input type="number" value={form.value} onChange={e=>setForm({...form,value:+e.target.value})} style={inp}/></F>
            <F l="Currency"><input value={form.currency} onChange={e=>setForm({...form,currency:e.target.value.toUpperCase()})} maxLength={3} style={inp}/></F>
            <F l="Stage"><select value={form.stage} onChange={e=>setForm({...form,stage:e.target.value})} style={inp}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></F>
            <F l="Probability %"><input type="number" min={0} max={100} value={form.probability} onChange={e=>setForm({...form,probability:+e.target.value})} style={inp}/></F>
          </div>
          <button onClick={create} style={{marginTop:10,padding:'8px 20px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer'}}>CREATE</button>
        </div>
      )}
      <div style={{padding:'0 24px 24px',display:'grid',gridTemplateColumns:`repeat(${STAGES.length},1fr)`,gap:8,overflowX:'auto'}}>
        {pipeline.map(p=>(
          <div key={p.stage} style={{background:'#fff',border:`1px solid ${B}22`,minWidth:180}}>
            <div style={{background:SC[p.stage]||B,color:'#fff',padding:8,fontSize:11,fontWeight:700,letterSpacing:1}}>{p.stage.toUpperCase()}</div>
            <div style={{padding:'8px 10px',borderBottom:`1px solid ${B}11`,fontSize:11,color:'#666'}}>{p.count} deals · ${p.value.toLocaleString()}</div>
            <div style={{maxHeight:500,overflowY:'auto'}}>
              {p.deals.length===0?<div style={{padding:12,fontSize:11,color:'#aaa'}}>—</div>:p.deals.map(d=>(
                <div key={d.id} style={{padding:8,borderBottom:`1px solid ${B}11`,fontSize:12}}>
                  <div style={{fontWeight:600,color:B}}>{d.name}</div>
                  <div style={{color:'#666',fontFamily:'monospace'}}>{d.currency} {d.value.toLocaleString()}</div>
                  <div style={{color:'#888'}}>P {d.probability}% · {d.ownerId||'—'}</div>
                  <div style={{marginTop:4,display:'flex',gap:4}}>
                    <button onClick={()=>advance(d,-1)} disabled={STAGES.indexOf(d.stage as any)<=0} style={btnSm}>←</button>
                    <button onClick={()=>advance(d,1)} disabled={STAGES.indexOf(d.stage as any)>=STAGES.length-1} style={btnSm}>→</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
const inp:React.CSSProperties={width:'100%',padding:8,border:`1px solid ${B}55`,background:C}
const btnSm:React.CSSProperties={padding:'2px 6px',background:B,color:C,border:0,fontSize:11,cursor:'pointer'}
function F({l,children}:{l:string;children:React.ReactNode}){return <label><div style={{fontSize:11,color:B,fontWeight:600,marginBottom:4}}>{l}</div>{children}</label>}

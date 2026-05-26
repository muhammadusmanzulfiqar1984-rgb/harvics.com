'use client'
/** HARVICS OS — Chart of Accounts (Module #1) — hierarchy + posting periods */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
interface CoA { id:string; code:string; name:string; accountType:string; parentCode:string|null; active:boolean; children?:CoA[] }
interface Per { id:string; code:string; startDate:string; endDate:string; status:string }
const TYPES=['Asset','Liability','Equity','Revenue','Expense']
export default function CoAPage(){
  const [tree,setTree]=useState<CoA[]>([])
  const [periods,setPeriods]=useState<Per[]>([])
  const [showCa,setShowCa]=useState(false)
  const [showP,setShowP]=useState(false)
  const [ca,setCa]=useState({code:'',name:'',accountType:'Asset',parentCode:'',active:true})
  const [per,setPer]=useState({code:'',startDate:'2026-05-01',endDate:'2026-05-31'})
  const load=async()=>{
    const t=await fetch('/api/wave3/coa/tree',{cache:'no-store'});setTree((await t.json()).data||[])
    const p=await fetch('/api/wave3/periods',{cache:'no-store'});setPeriods((await p.json()).data||[])
  }
  useEffect(()=>{void load()},[])
  const createCa=async()=>{
    const r=await fetch('/api/wave3/coa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...ca,parentCode:ca.parentCode||null})})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error));setShowCa(false);await load()
  }
  const createP=async()=>{
    const r=await fetch('/api/wave3/periods',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(per)})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error));setShowP(false);await load()
  }
  const closeP=async(id:string)=>{await fetch(`/api/wave3/periods/${id}/close`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});await load()}
  const Node=({n,d}:{n:CoA;d:number})=>(
    <div>
      <div style={{padding:'4px 8px 4px ' + (12+d*20) + 'px',borderBottom:`1px solid ${B}11`,display:'flex',gap:8,alignItems:'center',fontSize:13}}>
        <span style={{fontFamily:'monospace',fontWeight:700,color:B,minWidth:80}}>{n.code}</span>
        <span style={{flex:1}}>{n.name}</span>
        <span style={{fontSize:10,background:B,color:C,padding:'1px 6px',fontWeight:700}}>{n.accountType.toUpperCase()}</span>
        {!n.active && <span style={{fontSize:10,background:'#666',color:'#fff',padding:'1px 6px'}}>INACTIVE</span>}
      </div>
      {n.children?.map(c=><Node key={c.id} n={c} d={d+1}/>)}
    </div>
  )
  return(
    <div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
      <div style={{background:B,color:C,padding:'24px 32px',borderBottom:`4px solid ${G}`}}>
        <div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE #1 · FINANCE &amp; CONTROLLING</div>
        <h1 style={{margin:'6px 0 0',fontSize:28,fontFamily:'Georgia,serif'}}>Chart of Accounts</h1>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>GL hierarchy + posting period control</div>
      </div>
      <div style={{padding:24,display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        <div style={{background:'#fff',border:`1px solid ${B}33`}}>
          <div style={{background:B,color:C,padding:'10px 12px',display:'flex',gap:8,alignItems:'center'}}>
            <span style={{flex:1,fontWeight:700,fontSize:13}}>CHART OF ACCOUNTS</span>
            <button onClick={()=>setShowCa(s=>!s)} style={{background:G,color:B,border:0,padding:'4px 12px',fontWeight:700,cursor:'pointer'}}>+ ACCOUNT</button>
          </div>
          {showCa && (
            <div style={{padding:12,background:C,borderBottom:`1px solid ${B}33`,display:'grid',gridTemplateColumns:'repeat(4,1fr) auto',gap:8,alignItems:'end'}}>
              <F l="Code *"><input value={ca.code} onChange={e=>setCa({...ca,code:e.target.value})} style={inp}/></F>
              <F l="Name *"><input value={ca.name} onChange={e=>setCa({...ca,name:e.target.value})} style={inp}/></F>
              <F l="Type"><select value={ca.accountType} onChange={e=>setCa({...ca,accountType:e.target.value})} style={inp}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></F>
              <F l="Parent code"><input value={ca.parentCode} onChange={e=>setCa({...ca,parentCode:e.target.value})} style={inp}/></F>
              <button onClick={createCa} style={{background:B,color:C,border:0,padding:'8px 14px',fontWeight:700,cursor:'pointer'}}>SAVE</button>
            </div>
          )}
          {tree.length===0?<div style={{padding:32,color:'#888'}}>No accounts. Add a root (no parent).</div>:tree.map(n=><Node key={n.id} n={n} d={0}/>)}
        </div>
        <div style={{background:'#fff',border:`1px solid ${B}33`}}>
          <div style={{background:B,color:C,padding:'10px 12px',display:'flex',gap:8,alignItems:'center'}}>
            <span style={{flex:1,fontWeight:700,fontSize:13}}>POSTING PERIODS</span>
            <button onClick={()=>setShowP(s=>!s)} style={{background:G,color:B,border:0,padding:'4px 12px',fontWeight:700,cursor:'pointer'}}>+ PERIOD</button>
          </div>
          {showP && (
            <div style={{padding:12,background:C,borderBottom:`1px solid ${B}33`}}>
              <F l="Code (e.g. 2026-05) *"><input value={per.code} onChange={e=>setPer({...per,code:e.target.value})} style={inp}/></F>
              <F l="Start"><input type="date" value={per.startDate} onChange={e=>setPer({...per,startDate:e.target.value})} style={inp}/></F>
              <F l="End"><input type="date" value={per.endDate} onChange={e=>setPer({...per,endDate:e.target.value})} style={inp}/></F>
              <button onClick={createP} style={{marginTop:8,background:B,color:C,border:0,padding:'8px 14px',fontWeight:700,cursor:'pointer'}}>SAVE</button>
            </div>
          )}
          {periods.length===0?<div style={{padding:24,color:'#888'}}>No periods yet.</div>:periods.map(p=>(
            <div key={p.id} style={{padding:10,borderBottom:`1px solid ${B}11`,display:'flex',gap:8,alignItems:'center',fontSize:13}}>
              <span style={{fontWeight:700,color:B,minWidth:90}}>{p.code}</span>
              <span style={{flex:1,color:'#666'}}>{new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}</span>
              <span style={{fontSize:10,background:p.status==='Open'?'#2E7D32':'#666',color:'#fff',padding:'1px 6px',fontWeight:700}}>{p.status.toUpperCase()}</span>
              {p.status==='Open' && <button onClick={()=>closeP(p.id)} style={ab('#8B0000')}>CLOSE</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
const inp:React.CSSProperties={width:'100%',padding:8,border:`1px solid ${B}55`,background:'#fff'}
const ab=(c:string):React.CSSProperties=>({padding:'3px 10px',background:'transparent',color:c,border:`1px solid ${c}`,cursor:'pointer',fontSize:11,fontWeight:600})
function F({l,children}:{l:string;children:React.ReactNode}){return <label style={{display:'block',marginTop:4}}><div style={{fontSize:11,color:B,fontWeight:600,marginBottom:4}}>{l}</div>{children}</label>}

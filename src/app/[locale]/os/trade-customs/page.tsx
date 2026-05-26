'use client'
/** HARVICS OS — Trade & Customs (Module #27) — HS codes + duty calc */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
interface HS{id:string;code:string;description:string;category:string|null;dutyPercent:number;notes:string|null}
export default function TradePage(){
  const [rows,setRows]=useState<HS[]>([])
  const [q,setQ]=useState('')
  const [showCreate,setShowCreate]=useState(false)
  const [form,setForm]=useState({code:'',description:'',category:'',dutyPercent:0,notes:''})
  const [calc,setCalc]=useState({code:'',cifValue:1000})
  const [result,setResult]=useState<any>(null)
  const load=async()=>{const r=await fetch(`/api/wave3/trade/hs-codes${q?`?q=${encodeURIComponent(q)}`:''}`,{cache:'no-store'});setRows((await r.json()).data||[])}
  useEffect(()=>{void load()},[q])
  const create=async()=>{
    if(!form.code||!form.description)return alert('Code + description required')
    const r=await fetch('/api/wave3/trade/hs-codes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error));setShowCreate(false);await load()
  }
  const doCalc=async()=>{
    if(!calc.code||calc.cifValue<=0)return alert('Code + value required')
    const r=await fetch(`/api/wave3/trade/duty-calc?code=${encodeURIComponent(calc.code)}&cifValue=${calc.cifValue}`)
    const j=await r.json();if(!j.success)return alert(j.error);setResult(j.data)
  }
  return(
    <div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
      <div style={{background:B,color:C,padding:'24px 32px',borderBottom:`4px solid ${G}`}}>
        <div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE #27 · LOGISTICS &amp; TRADE</div>
        <h1 style={{margin:'6px 0 0',fontSize:28,fontFamily:'Georgia,serif'}}>Trade &amp; Customs</h1>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>HS code registry + live duty calculation (landed cost)</div>
      </div>
      <div style={{padding:24,display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        <div style={{background:'#fff',border:`1px solid ${B}33`}}>
          <div style={{background:B,color:C,padding:'10px 12px',display:'flex',gap:8,alignItems:'center'}}>
            <span style={{flex:1,fontWeight:700,fontSize:13}}>HS CODES</span>
            <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} style={{padding:'4px 8px',background:'#fff',color:'#000',border:0}}/>
            <button onClick={()=>setShowCreate(s=>!s)} style={{background:G,color:B,border:0,padding:'4px 12px',fontWeight:700,cursor:'pointer'}}>+ HS</button>
          </div>
          {showCreate && (
            <div style={{padding:12,background:C,borderBottom:`1px solid ${B}33`,display:'grid',gridTemplateColumns:'repeat(4,1fr) auto',gap:8,alignItems:'end'}}>
              <F l="Code *"><input value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="0901.21" style={inp}/></F>
              <F l="Description *"><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={inp}/></F>
              <F l="Category"><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inp}/></F>
              <F l="Duty %"><input type="number" step="0.01" value={form.dutyPercent} onChange={e=>setForm({...form,dutyPercent:+e.target.value})} style={inp}/></F>
              <button onClick={create} style={{padding:'8px 14px',background:B,color:C,border:0,fontWeight:700,cursor:'pointer'}}>SAVE</button>
            </div>
          )}
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:B,color:C,textAlign:'left'}}>{['CODE','DESCRIPTION','CATEGORY','DUTY %'].map(h=><th key={h} style={{padding:8}}>{h}</th>)}</tr></thead>
            <tbody>{rows.length===0?<tr><td colSpan={4} style={{padding:24,textAlign:'center',color:'#888'}}>No HS codes loaded yet.</td></tr>:rows.map((r,i)=>(
              <tr key={r.id} style={{background:i%2?C:'#fff',borderBottom:`1px solid ${B}11`,cursor:'pointer'}} onClick={()=>setCalc({...calc,code:r.code})}>
                <td style={{padding:8,fontFamily:'monospace',fontWeight:700,color:B}}>{r.code}</td>
                <td style={{padding:8}}>{r.description}</td>
                <td style={{padding:8,color:'#666'}}>{r.category||'—'}</td>
                <td style={{padding:8,fontWeight:700}}>{r.dutyPercent}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div style={{background:'#fff',border:`1px solid ${B}33`,padding:16}}>
          <div style={{fontWeight:700,color:B,marginBottom:8,fontSize:13}}>DUTY CALCULATOR</div>
          <F l="HS code (click row to fill)"><input value={calc.code} onChange={e=>setCalc({...calc,code:e.target.value})} style={inp}/></F>
          <F l="CIF value"><input type="number" value={calc.cifValue} onChange={e=>setCalc({...calc,cifValue:+e.target.value})} style={inp}/></F>
          <button onClick={doCalc} style={{marginTop:8,padding:'8px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer',width:'100%'}}>CALCULATE</button>
          {result && (
            <div style={{marginTop:12,background:C,padding:12,borderLeft:`4px solid ${G}`}}>
              <div style={{fontSize:13,color:B}}>{result.code} — {result.description}</div>
              <div style={{marginTop:4,fontSize:12,color:'#666'}}>CIF: ${result.cifValue.toLocaleString()} · Duty {result.dutyPercent}%</div>
              <div style={{marginTop:8,fontSize:18,color:B}}>Duty: <b>${result.duty.toLocaleString()}</b></div>
              <div style={{fontSize:22,color:B,fontWeight:700,marginTop:4}}>Landed cost: ${result.landedCost.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
const inp:React.CSSProperties={width:'100%',padding:8,border:`1px solid ${B}55`,background:'#fff'}
function F({l,children}:{l:string;children:React.ReactNode}){return <label style={{display:'block',marginTop:4}}><div style={{fontSize:11,color:B,fontWeight:600,marginBottom:4}}>{l}</div>{children}</label>}

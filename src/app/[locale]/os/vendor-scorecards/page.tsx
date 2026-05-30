'use client'
/** HARVICS OS — Vendor Scorecards (Module #14) */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F0E8'
const REC:Record<string,string>={Promote:'#2E7D32',Maintain:'#1565C0',Warn:'#E65100',Drop:'#B71C1C'}
interface SC{id:string;vendorId:string;vendorName:string|null;period:string;onTimePercent:number;qualityScore:number;priceScore:number;responseScore:number;overallScore:number;recommendation:string}
export default function ScorecardPage(){
  const [rows,setRows]=useState<SC[]>([])
  const [showCreate,setShowCreate]=useState(false)
  const [form,setForm]=useState({vendorId:'',vendorName:'',period:'2026-Q2',onTimePercent:90,qualityScore:85,priceScore:75,responseScore:80})
  const load=async()=>{const r=await fetch('/api/wave3/vendors/scorecards',{cache:'no-store'});setRows((await r.json()).data||[])}
  useEffect(()=>{void load()},[])
  const create=async()=>{
    if(!form.vendorId)return alert('Vendor required')
    const r=await fetch('/api/wave3/vendors/scorecards',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error));setShowCreate(false);await load()
  }
  const overallPreview=+((form.onTimePercent+form.qualityScore+form.priceScore+form.responseScore)/4).toFixed(1)
  return(
    <div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
      <div style={{background:B,color:C,padding:'24px 32px',borderBottom:`4px solid ${G}`}}>
        <div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE #14 · PROCUREMENT &amp; SOURCING</div>
        <h1 style={{margin:'6px 0 0',fontSize:28,fontFamily:'Georgia,serif'}}>Vendor Scorecards</h1>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>On-time · quality · price · response → overall + Promote/Maintain/Warn/Drop</div>
      </div>
      <div style={{padding:'16px 24px'}}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{padding:'8px 20px',background:B,color:C,border:`2px solid ${G}`,fontWeight:600,cursor:'pointer',marginRight:8}}>+ SCORE VENDOR</button>
        <button onClick={load} style={{padding:'8px 20px',background:'transparent',color:B,border:`2px solid ${B}`,fontWeight:600,cursor:'pointer'}}>REFRESH</button>
      </div>
      {showCreate && (
        <div style={{margin:'0 24px 16px',background:'#fff',padding:16,border:`1px solid ${B}33`}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            <F l="Vendor ID *"><input value={form.vendorId} onChange={e=>setForm({...form,vendorId:e.target.value})} style={inp}/></F>
            <F l="Vendor name"><input value={form.vendorName} onChange={e=>setForm({...form,vendorName:e.target.value})} style={inp}/></F>
            <F l="Period"><input value={form.period} onChange={e=>setForm({...form,period:e.target.value})} style={inp}/></F>
            {(['onTimePercent','qualityScore','priceScore','responseScore'] as const).map(k=>(
              <F key={k} l={`${k} (0-100)`}>
                <input type="range" min={0} max={100} value={form[k]} onChange={e=>setForm({...form,[k]:+e.target.value} as any)} style={{width:'100%'}}/>
                <div style={{textAlign:'right',fontSize:12,color:B,fontWeight:700}}>{form[k]}</div>
              </F>
            ))}
          </div>
          <div style={{marginTop:8,padding:12,background:C,borderLeft:`4px solid ${G}`}}>
            <span style={{color:B}}>Overall: <b style={{fontSize:20}}>{overallPreview}</b></span>
          </div>
          <button onClick={create} style={{marginTop:8,padding:'8px 20px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer'}}>SAVE SCORE</button>
        </div>
      )}
      <div style={{padding:'0 24px 24px'}}>
        <div style={{background:'#fff',border:`1px solid ${B}33`,overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:B,color:C,textAlign:'left'}}>{['VENDOR','PERIOD','ON-TIME','QUALITY','PRICE','RESPONSE','OVERALL','RECOMMENDATION'].map(h=><th key={h} style={{padding:10}}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#888'}}>No scorecards yet.</td></tr>:rows.map((r,i)=>(
                <tr key={r.id} style={{background:i%2?C:'#fff',borderBottom:`1px solid ${B}11`}}>
                  <td style={{padding:10,fontWeight:600,color:B}}>{r.vendorName||r.vendorId}</td>
                  <td style={{padding:10}}>{r.period}</td>
                  <td style={{padding:10}}>{r.onTimePercent}%</td>
                  <td style={{padding:10}}>{r.qualityScore}</td>
                  <td style={{padding:10}}>{r.priceScore}</td>
                  <td style={{padding:10}}>{r.responseScore}</td>
                  <td style={{padding:10,fontSize:18,fontWeight:700,color:B}}>{r.overallScore.toFixed(1)}</td>
                  <td style={{padding:10}}><span style={{background:REC[r.recommendation]||'#666',color:'#fff',padding:'2px 8px',fontSize:11,fontWeight:700}}>{r.recommendation.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
const inp:React.CSSProperties={width:'100%',padding:8,border:`1px solid ${B}55`,background:'#fff'}
function F({l,children}:{l:string;children:React.ReactNode}){return <label><div style={{fontSize:11,color:B,fontWeight:600,marginBottom:4}}>{l}</div>{children}</label>}

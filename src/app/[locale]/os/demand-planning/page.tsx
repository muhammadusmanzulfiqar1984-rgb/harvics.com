'use client'
/** #24 Demand Planning — moving-average forecast */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F0E8'
interface H{id:string;sku:string;period:string;units:number;revenue:number}
interface F{id:string;sku:string;period:string;forecastUnits:number;method:string;confidence:number;seasonality:number}
export default function DemandPage(){
  const [sku,setSku]=useState('')
  const [hist,setHist]=useState<H[]>([])
  const [fc,setFc]=useState<F[]>([])
  const [hForm,setHForm]=useState({sku:'',period:'2026-01',units:0,revenue:0})
  const [params,setParams]=useState({nextPeriods:3,window:3,seasonality:1})
  const [summary,setSummary]=useState<any>(null)
  const load=async()=>{if(!sku){setHist([]);setFc([]);return}const h=await(await fetch(`/api/wave4/demand/history?sku=${encodeURIComponent(sku)}`,{cache:'no-store'})).json();setHist(h.data||[])}
  useEffect(()=>{void load()},[sku])
  const addH=async()=>{if(!hForm.sku||!hForm.period)return alert('SKU+period required');const r=await(await fetch('/api/wave4/demand/history',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(hForm)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setHForm({...hForm,units:0,revenue:0});if(hForm.sku===sku)await load()}
  const doForecast=async()=>{if(!sku)return alert('Select SKU');const r=await(await fetch('/api/wave4/demand/forecast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku,...params})})).json();if(!r.success)return alert(r.error||JSON.stringify(r.issues));setFc(r.data||[]);setSummary(r.summary)}
  return(<div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
    <Hdr no="#24" band="MANUFACTURING & OPERATIONS" title="Demand Planning" sub="Moving-average forecast with seasonality multiplier and confidence"/>
    <div style={{padding:'12px 24px 24px',display:'grid',gridTemplateColumns:'1fr 2fr',gap:16}}>
      <Panel title="LOG HISTORY">
        <Form><Inp l="SKU *" v={hForm.sku} on={v=>setHForm({...hForm,sku:v})}/><Inp l="Period * (YYYY-MM)" v={hForm.period} on={v=>setHForm({...hForm,period:v})}/><Inp l="Units" tp="number" v={String(hForm.units)} on={v=>setHForm({...hForm,units:+v})}/><Inp l="Revenue" tp="number" v={String(hForm.revenue)} on={v=>setHForm({...hForm,revenue:+v})}/></Form>
        <button onClick={addH} style={btnB}>+ LOG (upsert)</button>
        <div style={{padding:8,background:C,borderLeft:`3px solid ${G}`,marginTop:8,fontSize:12}}>Add at least 3 periods, then select the SKU on the right to run forecast.</div>
      </Panel>
      <Panel title="FORECAST">
        <div style={{display:'flex',gap:8,alignItems:'end',marginBottom:8}}>
          <label style={{flex:1}}><div style={{fontSize:10,color:B,fontWeight:600}}>SKU</div><input value={sku} onChange={e=>setSku(e.target.value)} style={inp}/></label>
          <label><div style={{fontSize:10,color:B,fontWeight:600}}>Window</div><input type="number" value={params.window} onChange={e=>setParams({...params,window:+e.target.value})} style={{...inp,width:60}}/></label>
          <label><div style={{fontSize:10,color:B,fontWeight:600}}>Next periods</div><input type="number" value={params.nextPeriods} onChange={e=>setParams({...params,nextPeriods:+e.target.value})} style={{...inp,width:60}}/></label>
          <label><div style={{fontSize:10,color:B,fontWeight:600}}>Seasonality</div><input type="number" step="0.1" value={params.seasonality} onChange={e=>setParams({...params,seasonality:+e.target.value})} style={{...inp,width:80}}/></label>
          <button onClick={doForecast} style={{padding:'8px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer'}}>FORECAST</button>
        </div>
        {summary && <div style={{padding:8,background:C,borderLeft:`4px solid ${G}`,fontSize:12,color:B,marginBottom:8}}>Window: {summary.window} · Moving avg: <b>{summary.movingAvg}</b> · Confidence: <b>{(summary.confidence*100).toFixed(0)}%</b></div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <div>
            <div style={{fontWeight:700,color:B,padding:6,background:C}}>HISTORY</div>
            <Tbl head={['PERIOD','UNITS','REVENUE']}>{hist.length===0?<tr><td colSpan={3} style={{padding:16,textAlign:'center',color:'#888'}}>{sku?'No history.':'Enter SKU above.'}</td></tr>:hist.map(h=><tr key={h.id} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{h.period}</td><td style={{...td,fontWeight:700}}>{h.units.toLocaleString()}</td><td style={td}>${h.revenue.toLocaleString()}</td></tr>)}</Tbl>
          </div>
          <div>
            <div style={{fontWeight:700,color:B,padding:6,background:C}}>FORECAST</div>
            <Tbl head={['PERIOD','FORECAST','CONF','SEAS']}>{fc.length===0?<tr><td colSpan={4} style={{padding:16,textAlign:'center',color:'#888'}}>Run forecast.</td></tr>:fc.map(f=><tr key={f.id} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{f.period}</td><td style={{...td,fontWeight:700,color:B}}>{f.forecastUnits.toLocaleString()}</td><td style={td}>{(f.confidence*100).toFixed(0)}%</td><td style={td}>{f.seasonality}×</td></tr>)}</Tbl>
          </div>
        </div>
      </Panel>
    </div>
  </div>)
}
const inp:React.CSSProperties={width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}
const td:React.CSSProperties={padding:6,fontSize:12}
const btnB:React.CSSProperties={padding:'6px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer',marginTop:6,marginBottom:8}
function Hdr({no,band,title,sub}:any){return <div style={{background:B,color:C,padding:'20px 32px',borderBottom:`4px solid ${G}`}}><div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE {no} · {band}</div><h1 style={{margin:'6px 0 0',fontSize:26,fontFamily:'Georgia,serif'}}>{title}</h1><div style={{fontSize:12,opacity:.8,marginTop:4}}>{sub}</div></div>}
function Panel({title,children}:any){return <div style={{background:'#fff',border:`1px solid ${B}33`}}><div style={{background:B,color:C,padding:'8px 12px',fontWeight:700,fontSize:12}}>{title}</div><div style={{padding:10}}>{children}</div></div>}
function Form({children}:any){return <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>{children}</div>}
function Inp({l,v,on,tp='text'}:{l:string;v:string;on:(v:string)=>void;tp?:string}){return <label><div style={{fontSize:10,color:B,fontWeight:600}}>{l}</div><input type={tp} value={v} onChange={e=>on(e.target.value)} style={{width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}}/></label>}
function Tbl({head,children}:any){return <div style={{marginTop:8,maxHeight:380,overflowY:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr style={{background:B,color:C,position:'sticky',top:0}}>{head.map((h:string)=><th key={h} style={{padding:6,textAlign:'left',fontSize:11}}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}

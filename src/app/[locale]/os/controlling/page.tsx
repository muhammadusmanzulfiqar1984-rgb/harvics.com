'use client'
/** #2 Controlling — Cost Centers + Allocations + Variance */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
interface CC{id:string;code:string;name:string;manager:string|null}
interface Alloc{id:string;period:string;fromAccount:string;toCostCenter:string;amount:number;basis:string|null}
interface VarRow{account:string;costCenter:string;budgeted:number;actual:number;variance:number;variancePct:number|null}
const P=new Date().toISOString().slice(0,7)
export default function ControllingPage(){
  const [cc,setCc]=useState<CC[]>([]);const [alloc,setAlloc]=useState<Alloc[]>([]);const [vrows,setVrows]=useState<VarRow[]>([])
  const [vsum,setVsum]=useState<any>({})
  const [period,setPeriod]=useState(P)
  const [ccForm,setCcForm]=useState({code:'',name:'',manager:''})
  const [aForm,setAForm]=useState({period:P,fromAccount:'',toCostCenter:'',amount:0,basis:'manual'})
  const load=async()=>{
    setCc((await (await fetch('/api/wave4/cost-centers',{cache:'no-store'})).json()).data||[])
    setAlloc((await (await fetch(`/api/wave4/allocations?period=${period}`,{cache:'no-store'})).json()).data||[])
    const v=await (await fetch(`/api/wave4/variance?period=${period}`,{cache:'no-store'})).json();setVrows(v.data||[]);setVsum(v.summary||{})
  }
  useEffect(()=>{void load()},[period])
  const createCc=async()=>{if(!ccForm.code||!ccForm.name)return alert('Code+name required');const r=await(await fetch('/api/wave4/cost-centers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ccForm)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setCcForm({code:'',name:'',manager:''});await load()}
  const createA=async()=>{const r=await(await fetch('/api/wave4/allocations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(aForm)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setAForm({...aForm,fromAccount:'',amount:0});await load()}
  return(<div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
    <Hdr no="#2" band="FINANCE & CONTROLLING" title="Controlling — Cost Centers & Variance" sub="Allocate costs to centers · compare to budget"/>
    <div style={{padding:'12px 24px',display:'flex',gap:8,alignItems:'center'}}>
      <span style={{color:B,fontWeight:600}}>Period:</span>
      <input value={period} onChange={e=>setPeriod(e.target.value)} placeholder="YYYY-MM" style={{padding:6,border:`1px solid ${B}55`,width:120}}/>
      <button onClick={load} style={btnA}>REFRESH</button>
    </div>
    <div style={{padding:'0 24px 24px',display:'grid',gridTemplateColumns:'1fr 1fr 2fr',gap:16}}>
      <Panel title="COST CENTERS">
        <Form><Inp l="Code *" v={ccForm.code} on={v=>setCcForm({...ccForm,code:v})}/><Inp l="Name *" v={ccForm.name} on={v=>setCcForm({...ccForm,name:v})}/><Inp l="Manager" v={ccForm.manager} on={v=>setCcForm({...ccForm,manager:v})}/></Form>
        <button onClick={createCc} style={btnB}>+ ADD</button>
        <Tbl head={['CODE','NAME','MGR']}>{cc.map(c=><tr key={c.id} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{c.code}</td><td style={td}>{c.name}</td><td style={td}>{c.manager||'—'}</td></tr>)}</Tbl>
      </Panel>
      <Panel title="ALLOCATIONS">
        <Form><Inp l="From acct *" v={aForm.fromAccount} on={v=>setAForm({...aForm,fromAccount:v})}/><Inp l="To CC *" v={aForm.toCostCenter} on={v=>setAForm({...aForm,toCostCenter:v})}/><Inp l="Amount *" tp="number" v={String(aForm.amount)} on={v=>setAForm({...aForm,amount:+v})}/><Inp l="Basis" v={aForm.basis} on={v=>setAForm({...aForm,basis:v})}/></Form>
        <button onClick={createA} style={btnB}>+ POST</button>
        <Tbl head={['ACCT','CC','AMT','BASIS']}>{alloc.map(a=><tr key={a.id} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{a.fromAccount}</td><td style={td}>{a.toCostCenter}</td><td style={{...td,fontWeight:700,color:B}}>${a.amount.toLocaleString()}</td><td style={td}>{a.basis||'—'}</td></tr>)}</Tbl>
      </Panel>
      <Panel title={`VARIANCE — ${period}`}>
        <div style={{padding:8,background:C,fontSize:12,color:B}}>Budget: <b>${(vsum.totalBudget||0).toLocaleString()}</b> · Actual: <b>${(vsum.totalActual||0).toLocaleString()}</b> · Variance: <b style={{color:vsum.variance>0?'#B71C1C':'#2E7D32'}}>${(vsum.variance||0).toLocaleString()}</b></div>
        <Tbl head={['ACCT','CC','BUDGET','ACTUAL','VAR','%']}>
          {vrows.length===0?<tr><td colSpan={6} style={{...td,textAlign:'center',color:'#888'}}>No data for {period}.</td></tr>:vrows.map((r,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${B}11`}}>
              <td style={td}>{r.account}</td><td style={td}>{r.costCenter||'—'}</td><td style={td}>${r.budgeted.toLocaleString()}</td><td style={td}>${r.actual.toLocaleString()}</td>
              <td style={{...td,color:r.variance>0?'#B71C1C':'#2E7D32',fontWeight:700}}>${r.variance.toLocaleString()}</td><td style={td}>{r.variancePct??'—'}{r.variancePct!==null?'%':''}</td>
            </tr>
          ))}
        </Tbl>
      </Panel>
    </div>
  </div>)
}
const td:React.CSSProperties={padding:6,fontSize:12}
const btnA:React.CSSProperties={padding:'6px 16px',background:'transparent',color:B,border:`2px solid ${B}`,fontWeight:600,cursor:'pointer'}
const btnB:React.CSSProperties={padding:'6px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer',marginTop:6,marginBottom:8}
export function Hdr({no,band,title,sub}:any){return <div style={{background:B,color:C,padding:'20px 32px',borderBottom:`4px solid ${G}`}}><div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE {no} · {band}</div><h1 style={{margin:'6px 0 0',fontSize:26,fontFamily:'Georgia,serif'}}>{title}</h1><div style={{fontSize:12,opacity:.8,marginTop:4}}>{sub}</div></div>}
export function Panel({title,children}:any){return <div style={{background:'#fff',border:`1px solid ${B}33`}}><div style={{background:B,color:C,padding:'8px 12px',fontWeight:700,fontSize:12}}>{title}</div><div style={{padding:10}}>{children}</div></div>}
export function Form({children}:any){return <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>{children}</div>}
export function Inp({l,v,on,tp='text'}:{l:string;v:string;on:(v:string)=>void;tp?:string}){return <label><div style={{fontSize:10,color:B,fontWeight:600}}>{l}</div><input type={tp} value={v} onChange={e=>on(e.target.value)} style={{width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}}/></label>}
export function Tbl({head,children}:any){return <div style={{marginTop:8,maxHeight:380,overflowY:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr style={{background:B,color:C,position:'sticky',top:0}}>{head.map((h:string)=><th key={h} style={{padding:6,textAlign:'left',fontSize:11}}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}

'use client'
/** #47 Professional Services */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({code:`ENG-${Date.now().toString().slice(-6)}`,clientName:'',title:'',type:'TimeMaterial',budget:0,startDate:new Date().toISOString().slice(0,10),endDate:'',manager:''})
  const [time,setTime]=useState<Record<string,{employeeId:string;date:string;hours:number;rate:number;description:string;billable:boolean}>>({})
  const load=async()=>setRows((await getJson('/api/wave5/engagements')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.clientName||!form.title)return alert('Client+title required');await postJson('/api/wave5/engagements',{...form,endDate:form.endDate||null});setForm({...form,code:`ENG-${Date.now().toString().slice(-6)}`,clientName:'',title:''});await load()}catch(e:any){alert(e.message)}}
  const logTime=async(eid:string)=>{const t=time[eid];if(!t?.employeeId||!t?.hours)return alert('Employee+hours required');try{await postJson(`/api/wave5/engagements/${eid}/time`,t);setTime({...time,[eid]:{employeeId:'',date:new Date().toISOString().slice(0,10),hours:0,rate:0,description:'',billable:true}});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#47" band="OPERATIONS" title="Professional Services" sub="Engagements · time entries · budget burn"/>
  <Grid cols={2}>
    <Panel title="NEW ENGAGEMENT">
      <Form><Inp l="Code *" v={form.code} on={v=>setForm({...form,code:v})}/><Sel l="Type" v={form.type} on={v=>setForm({...form,type:v})} opts={['FixedFee','TimeMaterial','Retainer']}/></Form>
      <Inp l="Client *" v={form.clientName} on={v=>setForm({...form,clientName:v})}/>
      <Inp l="Title *" v={form.title} on={v=>setForm({...form,title:v})}/>
      <Form><Inp l="Budget" tp="number" v={form.budget} on={v=>setForm({...form,budget:+v})}/><Inp l="Manager" v={form.manager} on={v=>setForm({...form,manager:v})}/></Form>
      <Form><Inp l="Start *" tp="date" v={form.startDate} on={v=>setForm({...form,startDate:v})}/><Inp l="End" tp="date" v={form.endDate} on={v=>setForm({...form,endDate:v})}/></Form>
      <button onClick={create} style={btnB}>+ START ENGAGEMENT</button>
    </Panel>
    <Panel title={`ENGAGEMENTS (${rows.length})`} full>
      {rows.map(r=>{const t=time[r.id]||{employeeId:'',date:new Date().toISOString().slice(0,10),hours:0,rate:0,description:'',billable:true};const burn=r.budget?(r.spent/r.budget*100):0;return <div key={r.id} style={{padding:10,marginBottom:8,border:'1px solid #3D121222',background:'#fafafa'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><b>{r.code} — {r.title}</b> <span style={{color:'#666',fontSize:11}}>· {r.clientName} · {r.type}</span></div>
          <Pill s={r.status}/>
        </div>
        <div style={{marginTop:6,height:8,background:'#eee',borderRadius:4,overflow:'hidden'}}><div style={{width:`${Math.min(100,burn)}%`,height:'100%',background:burn>90?'#B71C1C':burn>70?'#B8860B':'#2E7D32'}}/></div>
        <div style={{fontSize:11,marginTop:2,color:'#666'}}>Budget: <b style={{color:'var(--harvics-burgundy)'}}>${r.budget.toLocaleString()}</b> · Spent: <b style={{color:burn>90?'#B71C1C':'var(--harvics-burgundy)'}}>${r.spent.toLocaleString()} ({burn.toFixed(0)}%)</b></div>
        <div style={{marginTop:8,display:'grid',gridTemplateColumns:'1fr 110px 60px 70px 2fr auto',gap:4}}>
          <input placeholder="Employee ID" value={t.employeeId} onChange={e=>setTime({...time,[r.id]:{...t,employeeId:e.target.value}})} style={inp}/>
          <input type="date" value={t.date} onChange={e=>setTime({...time,[r.id]:{...t,date:e.target.value}})} style={inp}/>
          <input type="number" placeholder="hrs" value={t.hours} onChange={e=>setTime({...time,[r.id]:{...t,hours:+e.target.value}})} style={inp}/>
          <input type="number" placeholder="rate" value={t.rate} onChange={e=>setTime({...time,[r.id]:{...t,rate:+e.target.value}})} style={inp}/>
          <input placeholder="Description" value={t.description} onChange={e=>setTime({...time,[r.id]:{...t,description:e.target.value}})} style={inp}/>
          <button onClick={()=>logTime(r.id)} style={{padding:'4px 12px',background:'var(--harvics-burgundy)',color:'#fff',border:0,cursor:'pointer',fontSize:11,fontWeight:700}}>LOG</button>
        </div>
        {r.timeEntries.length>0 && <Tbl head={['DATE','EMP','HRS','RATE','AMT','DESC']}>{r.timeEntries.map((e:any)=><tr key={e.id}><td style={{...td,fontSize:11}}>{new Date(e.date).toLocaleDateString()}</td><td style={td}>{e.employeeId}</td><td style={td}>{e.hours}</td><td style={td}>${e.rate}</td><td style={{...td,fontWeight:700,color:'var(--harvics-burgundy)'}}>${e.amount}</td><td style={{...td,fontSize:11}}>{e.description||'—'}</td></tr>)}</Tbl>}
      </div>})}
    </Panel>
  </Grid></Page>
}
const inp:React.CSSProperties={padding:6,border:'1px solid #3D121255',fontSize:12}

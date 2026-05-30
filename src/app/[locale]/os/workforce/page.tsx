'use client'
/** #33 Workforce Planning */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Tbl, btnB, td, getJson, postJson } from '@/components/os/w5ui'
const PERIOD='2026-Q3'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({period:PERIOD,department:'',currentFte:0,plannedFte:0,attritionPct:5,notes:''})
  const load=async()=>setRows((await getJson(`/api/wave5/headcount-plans?period=${PERIOD}`)).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.department)return alert('Department required');await postJson('/api/wave5/headcount-plans',form);setForm({...form,department:''});await load()}catch(e:any){alert(e.message)}}
  const totals=rows.reduce((a,r)=>({c:a.c+r.currentFte,p:a.p+r.plannedFte,h:a.h+r.hiringNeed}),{c:0,p:0,h:0})
  return <Page><Hdr no="#33" band="HUMAN RESOURCES" title="Workforce Planning" sub={`Headcount planning for ${PERIOD} · auto-calc hiring need from attrition`}/>
  <Grid cols={2}>
    <Panel title="ADD/UPDATE PLAN">
      <Form><Inp l="Period" v={form.period} on={v=>setForm({...form,period:v})}/><Inp l="Department *" v={form.department} on={v=>setForm({...form,department:v})}/></Form>
      <Form><Inp l="Current FTE *" tp="number" v={form.currentFte} on={v=>setForm({...form,currentFte:+v})}/><Inp l="Planned FTE *" tp="number" v={form.plannedFte} on={v=>setForm({...form,plannedFte:+v})}/></Form>
      <Inp l="Attrition %" tp="number" v={form.attritionPct} on={v=>setForm({...form,attritionPct:+v})}/>
      <Inp l="Notes" v={form.notes} on={v=>setForm({...form,notes:v})}/>
      <button onClick={create} style={btnB}>SAVE (upsert)</button>
      <div style={{marginTop:12,padding:10,background:'#F5F0E8',borderLeft:'4px solid #C3A35E',fontSize:12}}>
        <div style={{color:'#6B1F2B'}}>Hiring need = (Planned − Current) + (Current × Attrition%)</div>
        <div style={{marginTop:4,fontWeight:700,color:'#6B1F2B'}}>Preview: {Math.max(0,(form.plannedFte-form.currentFte)+(form.currentFte*form.attritionPct/100)).toFixed(1)} hires</div>
      </div>
    </Panel>
    <Panel title={`${PERIOD} ROLL-UP — Current ${totals.c} → Planned ${totals.p} · Hires needed ${totals.h.toFixed(1)}`}>
      <Tbl head={['DEPT','CURRENT','PLANNED','ATTR%','HIRE NEED']}>
        {rows.map(r=><tr key={r.id}><td style={td}>{r.department}</td><td style={td}>{r.currentFte}</td><td style={td}>{r.plannedFte}</td><td style={td}>{r.attritionPct}%</td><td style={{...td,fontWeight:700,color:r.hiringNeed>0?'#B71C1C':'#2E7D32'}}>{r.hiringNeed.toFixed(1)}</td></tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

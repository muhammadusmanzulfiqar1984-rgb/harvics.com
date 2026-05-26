'use client'
/** #32 Performance — 9-box grid */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, td, Pill, getJson, postJson } from '@/components/os/w5ui'
const PERIOD='2026-H1'
export default function P(){
  const [rows,setRows]=useState<any[]>([]);const [box,setBox]=useState<Record<string,any[]>>({})
  const [form,setForm]=useState({employeeId:'',period:PERIOD,reviewer:'',selfRating:3,mgrRating:3,strengths:'',improvements:'',potential:'Hold'})
  const load=async()=>{setRows((await getJson(`/api/wave5/perf-reviews?period=${PERIOD}`)).data||[]);setBox((await getJson(`/api/wave5/perf-9box?period=${PERIOD}`)).data||{})}
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.employeeId)return alert('Employee required');await postJson('/api/wave5/perf-reviews',form);setForm({...form,employeeId:''});await load()}catch(e:any){alert(e.message)}}
  const cell=(pot:string,perf:string)=>{const k=`${pot}/${perf}`;const list=box[k]||[];const colors:Record<string,string>={'High/High':'#2E7D32','High/Mid':'#558B2F','High/Low':'#827717','Mid/High':'#1565C0','Mid/Mid':'#5E35B1','Mid/Low':'#B8860B','Low/High':'#558B2F','Low/Mid':'#B8860B','Low/Low':'#B71C1C'};return <div style={{background:colors[k]||'#666',color:'#fff',padding:8,minHeight:90,fontSize:11}}><div style={{fontWeight:700,fontSize:10,opacity:.8}}>{k} ({list.length})</div>{list.slice(0,4).map((p,i)=><div key={i} style={{padding:'2px 0',borderTop:i?'1px solid #ffffff33':undefined}}>{p.employeeId} · {p.score}</div>)}{list.length>4&&<div style={{opacity:.8,marginTop:2}}>+{list.length-4} more</div>}</div>}
  return <Page><Hdr no="#32" band="HUMAN RESOURCES" title="Performance & Succession" sub="Reviews with auto-calc score · 9-box grid"/>
  <Grid cols={3}>
    <Panel title="NEW REVIEW">
      <Inp l="Employee ID *" v={form.employeeId} on={v=>setForm({...form,employeeId:v})}/>
      <Form><Inp l="Period" v={form.period} on={v=>setForm({...form,period:v})}/><Inp l="Reviewer" v={form.reviewer} on={v=>setForm({...form,reviewer:v})}/></Form>
      <Form><Inp l="Self rating (0-5)" tp="number" v={form.selfRating} on={v=>setForm({...form,selfRating:+v})}/><Inp l="Mgr rating (0-5)" tp="number" v={form.mgrRating} on={v=>setForm({...form,mgrRating:+v})}/></Form>
      <Sel l="Potential" v={form.potential} on={v=>setForm({...form,potential:v})} opts={['Promote','Stretch','Hold','PIP']}/>
      <Inp l="Strengths" v={form.strengths} on={v=>setForm({...form,strengths:v})}/>
      <Inp l="Improvements" v={form.improvements} on={v=>setForm({...form,improvements:v})}/>
      <button onClick={create} style={btnB}>+ SUBMIT</button>
    </Panel>
    <Panel title={`9-BOX (${PERIOD}) — ${rows.length} reviews`} full>
      <div style={{display:'flex'}}>
        <div style={{writingMode:'vertical-rl',transform:'rotate(180deg)',padding:8,fontWeight:700,color:'#6B1F2B'}}>POTENTIAL →</div>
        <div style={{flex:1}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
            {cell('High','Low')}{cell('High','Mid')}{cell('High','High')}
            {cell('Mid','Low')}{cell('Mid','Mid')}{cell('Mid','High')}
            {cell('Low','Low')}{cell('Low','Mid')}{cell('Low','High')}
          </div>
          <div style={{textAlign:'center',padding:8,fontWeight:700,color:'#6B1F2B'}}>PERFORMANCE →</div>
        </div>
      </div>
    </Panel>
    <Panel title="ALL REVIEWS" full>
      <Tbl head={['EMPLOYEE','PERIOD','SELF','MGR','SCORE','POTENTIAL']}>
        {rows.map(r=><tr key={r.id}><td style={td}>{r.employeeId}</td><td style={td}>{r.period}</td><td style={td}>{r.selfRating}</td><td style={td}>{r.mgrRating}</td><td style={{...td,fontWeight:700,color:'#6B1F2B'}}>{r.overallScore}</td><td style={td}><Pill s={r.potential}/></td></tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

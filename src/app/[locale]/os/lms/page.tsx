'use client'
/** #31 LMS */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({code:`COURSE-${Date.now().toString().slice(-5)}`,title:'',category:'',durationHrs:1,level:'Beginner'})
  const [enroll,setEnroll]=useState<Record<string,string>>({})
  const [score,setScore]=useState<Record<string,number>>({})
  const load=async()=>setRows((await getJson('/api/wave5/courses')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.title)return alert('Title required');await postJson('/api/wave5/courses',form);setForm({...form,code:`COURSE-${Date.now().toString().slice(-5)}`,title:''});await load()}catch(e:any){alert(e.message)}}
  const doEnroll=async(cid:string)=>{const eid=enroll[cid];if(!eid)return alert('Employee ID required');try{await postJson(`/api/wave5/courses/${cid}/enroll`,{employeeId:eid});setEnroll({...enroll,[cid]:''});await load()}catch(e:any){alert(e.message)}}
  const complete=async(eid:string)=>{const s=score[eid]??0;try{await postJson(`/api/wave5/enrollments/${eid}/complete`,{score:s});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#31" band="HUMAN RESOURCES" title="Learning Management" sub="Courses · enrollments · auto pass/fail at 50%"/>
  <Grid cols={3}>
    <Panel title="NEW COURSE">
      <Inp l="Code *" v={form.code} on={v=>setForm({...form,code:v})}/>
      <Inp l="Title *" v={form.title} on={v=>setForm({...form,title:v})}/>
      <Form><Inp l="Category" v={form.category} on={v=>setForm({...form,category:v})}/><Sel l="Level" v={form.level} on={v=>setForm({...form,level:v})} opts={['Beginner','Intermediate','Advanced']}/></Form>
      <Inp l="Duration (hrs)" tp="number" v={form.durationHrs} on={v=>setForm({...form,durationHrs:+v})}/>
      <button onClick={create} style={btnB}>+ ADD COURSE</button>
    </Panel>
    <Panel title={`COURSES (${rows.length})`} full>
      {rows.map(c=><div key={c.id} style={{padding:10,marginBottom:8,border:'1px solid #6B1F2B22',background:'#fafafa'}}>
        <div style={{display:'flex',justifyContent:'space-between'}}><div><b>{c.code} — {c.title}</b> <span style={{color:'#666',fontSize:11}}>· {c.category||'—'} · {c.level||'—'} · {c.durationHrs}h</span></div><div>{c.enrollments.length} enrolled</div></div>
        <div style={{marginTop:6,display:'flex',gap:4}}>
          <input placeholder="Employee ID to enroll" value={enroll[c.id]||''} onChange={e=>setEnroll({...enroll,[c.id]:e.target.value})} style={{padding:6,border:'1px solid #6B1F2B55',fontSize:12,flex:1}}/>
          <button onClick={()=>doEnroll(c.id)} style={{padding:'4px 14px',background:'#6B1F2B',color:'#fff',border:0,cursor:'pointer',fontSize:11,fontWeight:700}}>ENROLL</button>
        </div>
        <Tbl head={['EMPLOYEE','STATUS','SCORE','COMPLETED','ACT']}>
          {c.enrollments.map((e:any)=><tr key={e.id}><td style={td}>{e.employeeId}</td><td style={td}><Pill s={e.status}/></td><td style={td}>{e.score??'—'}</td><td style={td}>{e.completedAt?new Date(e.completedAt).toLocaleDateString():'—'}</td><td style={td}>{e.status==='Enrolled'&&<><input type="number" placeholder="score" onChange={ev=>setScore({...score,[e.id]:+ev.target.value})} style={{width:60,padding:3,border:'1px solid #6B1F2B55',fontSize:11}}/> <button onClick={()=>complete(e.id)} style={btnA}>COMPLETE</button></>}</td></tr>)}
        </Tbl>
      </div>)}
    </Panel>
  </Grid></Page>
}

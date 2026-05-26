'use client'
/** #64 Mentorship */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [mentors,setMentors]=useState<any[]>([])
  const [form,setForm]=useState({userId:'',name:'',bio:'',expertise:'',yearsExp:0})
  const [req,setReq]=useState<Record<string,{menteeId:string;topic:string;scheduledAt:string;durationMins:number}>>({})
  const load=async()=>setMentors((await getJson('/api/wave6/mentors')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.userId||!form.name)return alert('UserID+name required');await postJson('/api/wave6/mentors',form);setForm({...form,userId:'',name:''});await load()}catch(e:any){alert(e.message)}}
  const request=async(id:string)=>{const r=req[id];if(!r?.menteeId||!r?.topic||!r?.scheduledAt)return alert('All fields required');try{await postJson(`/api/wave6/mentors/${id}/request`,r);setReq({...req,[id]:{menteeId:'',topic:'',scheduledAt:'',durationMins:30}});alert('Session requested!')}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#64" band="MEGA-HARVICS" title="Mentorship" sub="Mentor registry · session requests · auto-recalc mentor rating"/>
  <Grid cols={2}>
    <Panel title="REGISTER AS MENTOR">
      <Form><Inp l="User ID *" v={form.userId} on={v=>setForm({...form,userId:v})}/><Inp l="Name *" v={form.name} on={v=>setForm({...form,name:v})}/></Form>
      <Inp l="Bio" v={form.bio} on={v=>setForm({...form,bio:v})}/>
      <Inp l="Expertise (comma)" v={form.expertise} on={v=>setForm({...form,expertise:v})}/>
      <Inp l="Years experience" tp="number" v={form.yearsExp} on={v=>setForm({...form,yearsExp:+v})}/>
      <button onClick={create} style={btnB}>+ REGISTER</button>
    </Panel>
    <Panel title={`MENTORS (${mentors.length})`} full>
      {mentors.map(m=>{const r=req[m.id]||{menteeId:'',topic:'',scheduledAt:'',durationMins:30};return <div key={m.id} style={{padding:10,marginBottom:8,border:'1px solid #6B1F2B22',background:'#fafafa'}}>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <div><b style={{color:'#6B1F2B'}}>{m.name}</b> <span style={{color:'#666',fontSize:11}}>· {m.yearsExp}y exp · ★ {m.rating}</span></div>
          <Pill s={m.acceptingMentees?'Active':'Hold'}/>
        </div>
        {m.bio && <div style={{fontSize:11,marginTop:4,color:'#444'}}>{m.bio}</div>}
        {m.expertise && <div style={{marginTop:6,fontSize:10,color:'#6B1F2B',fontWeight:600}}>{m.expertise}</div>}
        <div style={{marginTop:8,display:'grid',gridTemplateColumns:'80px 1fr 140px 60px auto',gap:4}}>
          <input placeholder="mentee" value={r.menteeId} onChange={e=>setReq({...req,[m.id]:{...r,menteeId:e.target.value}})} style={{padding:4,border:'1px solid #6B1F2B55',fontSize:11}}/>
          <input placeholder="Topic" value={r.topic} onChange={e=>setReq({...req,[m.id]:{...r,topic:e.target.value}})} style={{padding:4,border:'1px solid #6B1F2B55',fontSize:11}}/>
          <input type="datetime-local" value={r.scheduledAt} onChange={e=>setReq({...req,[m.id]:{...r,scheduledAt:e.target.value}})} style={{padding:4,border:'1px solid #6B1F2B55',fontSize:11}}/>
          <input type="number" placeholder="min" value={r.durationMins} onChange={e=>setReq({...req,[m.id]:{...r,durationMins:+e.target.value}})} style={{padding:4,border:'1px solid #6B1F2B55',fontSize:11}}/>
          <button onClick={()=>request(m.id)} style={{padding:'4px 12px',background:'#6B1F2B',color:'#fff',border:0,cursor:'pointer',fontSize:11,fontWeight:700}}>REQUEST</button>
        </div>
      </div>})}
    </Panel>
  </Grid></Page>
}

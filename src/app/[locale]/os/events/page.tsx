'use client'
/** #62 Events & Webinars */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({slug:'',title:'',description:'',type:'Webinar',startsAt:'',endsAt:'',capacity:100,location:'',meetingUrl:''})
  const [reg,setReg]=useState<Record<string,{userId:string;userName:string}>>({})
  const load=async()=>setRows((await getJson('/api/wave6/events')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.slug||!form.title||!form.startsAt||!form.endsAt)return alert('Slug+title+dates required');await postJson('/api/wave6/events',form);setForm({...form,slug:'',title:''});await load()}catch(e:any){alert(e.message)}}
  const register=async(id:string)=>{const r=reg[id];if(!r?.userId||!r?.userName)return alert('User ID + name required');try{const x=await postJson(`/api/wave6/events/${id}/register`,r);alert(`Registered — ${x.seatsLeft} seats left`);await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#62" band="MEGA-HARVICS" title="Events & Webinars" sub="Schedule events · capacity-managed registration"/>
  <Grid cols={2}>
    <Panel title="NEW EVENT">
      <Inp l="Slug *" v={form.slug} on={v=>setForm({...form,slug:v.toLowerCase().replace(/[^a-z0-9-]/g,'-')})}/>
      <Inp l="Title *" v={form.title} on={v=>setForm({...form,title:v})}/>
      <Form><Sel l="Type" v={form.type} on={v=>setForm({...form,type:v})} opts={['Webinar','InPerson','Hybrid']}/><Inp l="Capacity" tp="number" v={form.capacity} on={v=>setForm({...form,capacity:+v})}/></Form>
      <Form><Inp l="Starts *" tp="datetime-local" v={form.startsAt} on={v=>setForm({...form,startsAt:v})}/><Inp l="Ends *" tp="datetime-local" v={form.endsAt} on={v=>setForm({...form,endsAt:v})}/></Form>
      <Inp l="Location" v={form.location} on={v=>setForm({...form,location:v})}/>
      <Inp l="Meeting URL" v={form.meetingUrl} on={v=>setForm({...form,meetingUrl:v})}/>
      <Inp l="Description" v={form.description} on={v=>setForm({...form,description:v})}/>
      <button onClick={create} style={btnB}>+ SCHEDULE EVENT</button>
    </Panel>
    <Panel title={`EVENTS (${rows.length})`} full>
      <Tbl head={['SLUG','TITLE','TYPE','WHEN','REG/CAP','REGISTER']}>
        {rows.map(e=>{const r=reg[e.id]||{userId:'',userName:''};const regCount=e._count?.registrations||0;return <tr key={e.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{e.slug}</b></td><td style={td}>{e.title}</td><td style={td}><Pill s={e.type==='Webinar'?'Active':'Stretch'}/></td>
          <td style={{...td,fontSize:11}}>{new Date(e.startsAt).toLocaleString()}</td>
          <td style={{...td,fontWeight:700,color:regCount>=e.capacity?'#B71C1C':'#6B1F2B'}}>{regCount}/{e.capacity}</td>
          <td style={td}><input placeholder="uid" value={r.userId} onChange={ev=>setReg({...reg,[e.id]:{...r,userId:ev.target.value}})} style={{width:60,padding:3,border:'1px solid #6B1F2B55',fontSize:11}}/> <input placeholder="name" value={r.userName} onChange={ev=>setReg({...reg,[e.id]:{...r,userName:ev.target.value}})} style={{width:80,padding:3,border:'1px solid #6B1F2B55',fontSize:11}}/> <button onClick={()=>register(e.id)} style={btnA}>RSVP</button></td>
        </tr>})}
      </Tbl>
    </Panel>
  </Grid></Page>
}

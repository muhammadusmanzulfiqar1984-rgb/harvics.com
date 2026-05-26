'use client'
/** #16 Sourcing Network */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [filter,setFilter]=useState({status:'',category:''})
  const [form,setForm]=useState({name:'',country:'',category:'',certifications:'',capabilities:'',rating:0,contactEmail:'',contactPhone:'',notes:''})
  const load=async()=>{const q=new URLSearchParams();if(filter.status)q.set('status',filter.status);if(filter.category)q.set('category',filter.category);setRows((await getJson(`/api/wave5/sourcing-suppliers?${q}`)).data||[])}
  useEffect(()=>{void load()},[filter])
  const create=async()=>{try{if(!form.name)return alert('Name required');await postJson('/api/wave5/sourcing-suppliers',form);setForm({...form,name:'',category:''});await load()}catch(e:any){alert(e.message)}}
  const qualify=async(id:string,s:string)=>{try{await postJson(`/api/wave5/sourcing-suppliers/${id}/qualify`,{qualifiedStatus:s});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#16" band="PROCUREMENT" title="Sourcing Network" sub="Discover · review · qualify suppliers"/>
  <Grid cols={3}>
    <Panel title="ADD SUPPLIER">
      <Inp l="Name *" v={form.name} on={v=>setForm({...form,name:v})}/>
      <Form><Inp l="Country" v={form.country} on={v=>setForm({...form,country:v})}/><Inp l="Category" v={form.category} on={v=>setForm({...form,category:v})}/></Form>
      <Inp l="Certifications" v={form.certifications} on={v=>setForm({...form,certifications:v})}/>
      <Inp l="Capabilities" v={form.capabilities} on={v=>setForm({...form,capabilities:v})}/>
      <Form><Inp l="Email" v={form.contactEmail} on={v=>setForm({...form,contactEmail:v})}/><Inp l="Phone" v={form.contactPhone} on={v=>setForm({...form,contactPhone:v})}/></Form>
      <Inp l="Rating (0-5)" tp="number" v={form.rating} on={v=>setForm({...form,rating:+v})}/>
      <button onClick={create} style={btnB}>+ ADD SUPPLIER</button>
    </Panel>
    <Panel title="FILTERS">
      <Sel l="Status" v={filter.status} on={v=>setFilter({...filter,status:v})} opts={['','Discovered','InReview','Qualified','Rejected']}/>
      <Inp l="Category contains" v={filter.category} on={v=>setFilter({...filter,category:v})}/>
    </Panel>
    <Panel title={`SUPPLIERS (${rows.length})`} full>
      <Tbl head={['NAME','COUNTRY','CATEGORY','RATING','STATUS','ACTIONS']}>
        {rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{r.name}</b></td><td style={td}>{r.country||'—'}</td><td style={td}>{r.category||'—'}</td>
          <td style={td}>{'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5-Math.round(r.rating))} {r.rating}</td>
          <td style={td}><Pill s={r.qualifiedStatus}/></td>
          <td style={td}>{r.qualifiedStatus==='Discovered'&&<button onClick={()=>qualify(r.id,'InReview')} style={btnA}>REVIEW</button>} {r.qualifiedStatus==='InReview'&&<><button onClick={()=>qualify(r.id,'Qualified')} style={btnA}>QUALIFY</button> <button onClick={()=>qualify(r.id,'Rejected')} style={btnA}>REJECT</button></>}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

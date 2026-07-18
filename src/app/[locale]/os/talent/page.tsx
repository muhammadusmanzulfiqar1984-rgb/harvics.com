'use client'
/** #30 Talent Acquisition */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
const STAGES=['Applied','Screened','Interview','Offer','Hired','Rejected']
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [pForm,setPForm]=useState({reqNo:`REQ-${Date.now().toString().slice(-6)}`,title:'',department:'',location:'',level:'Mid',description:''})
  const [cForm,setCForm]=useState<Record<string,{name:string;email:string;phone:string;rating:number}>>({})
  const load=async()=>setRows((await getJson('/api/wave5/postings')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!pForm.title)return alert('Title required');await postJson('/api/wave5/postings',pForm);setPForm({...pForm,reqNo:`REQ-${Date.now().toString().slice(-6)}`,title:''});await load()}catch(e:any){alert(e.message)}}
  const addC=async(pid:string)=>{const c=cForm[pid];if(!c?.name)return alert('Name required');try{await postJson(`/api/wave5/postings/${pid}/candidates`,c);setCForm({...cForm,[pid]:{name:'',email:'',phone:'',rating:0}});await load()}catch(e:any){alert(e.message)}}
  const move=async(id:string,stage:string)=>{try{await postJson(`/api/wave5/candidates/${id}/stage`,{stage});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#30" band="HUMAN RESOURCES" title="Talent Acquisition" sub="Postings · candidate pipeline · stage workflow"/>
  <Grid cols={3}>
    <Panel title="NEW POSTING">
      <Form><Inp l="Req No *" v={pForm.reqNo} on={v=>setPForm({...pForm,reqNo:v})}/><Sel l="Level" v={pForm.level} on={v=>setPForm({...pForm,level:v})} opts={['Junior','Mid','Senior','Lead','Director']}/></Form>
      <Inp l="Title *" v={pForm.title} on={v=>setPForm({...pForm,title:v})}/>
      <Form><Inp l="Department" v={pForm.department} on={v=>setPForm({...pForm,department:v})}/><Inp l="Location" v={pForm.location} on={v=>setPForm({...pForm,location:v})}/></Form>
      <Inp l="Description" v={pForm.description} on={v=>setPForm({...pForm,description:v})}/>
      <button onClick={create} style={btnB}>+ POST</button>
    </Panel>
    <Panel title={`POSTINGS (${rows.length})`} full>
      {rows.map(p=>{const c=cForm[p.id]||{name:'',email:'',phone:'',rating:0};return <div key={p.id} style={{padding:10,marginBottom:8,border:'1px solid #3D121222',background:'#fafafa'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><b>{p.reqNo} — {p.title}</b> <span style={{color:'#666',fontSize:11}}>· {p.department||'—'} · {p.location||'—'} · {p.level||'—'}</span></div><Pill s={p.status}/></div>
        <div style={{marginTop:6,display:'grid',gridTemplateColumns:'1fr 1fr 1fr 60px auto',gap:4}}>
          <input placeholder="Candidate name" value={c.name} onChange={e=>setCForm({...cForm,[p.id]:{...c,name:e.target.value}})} style={inp}/>
          <input placeholder="Email" value={c.email} onChange={e=>setCForm({...cForm,[p.id]:{...c,email:e.target.value}})} style={inp}/>
          <input placeholder="Phone" value={c.phone} onChange={e=>setCForm({...cForm,[p.id]:{...c,phone:e.target.value}})} style={inp}/>
          <input type="number" placeholder="★" value={c.rating} onChange={e=>setCForm({...cForm,[p.id]:{...c,rating:+e.target.value}})} style={inp}/>
          <button onClick={()=>addC(p.id)} style={{padding:'4px 12px',background:'var(--harvics-burgundy)',color:'#fff',border:0,cursor:'pointer',fontSize:11,fontWeight:700}}>+ APPLY</button>
        </div>
        <Tbl head={['NAME','EMAIL','PHONE','★','STAGE','MOVE']}>
          {p.candidates.map((cand:any)=><tr key={cand.id}><td style={td}>{cand.name}</td><td style={td}>{cand.email||'—'}</td><td style={td}>{cand.phone||'—'}</td><td style={td}>{cand.rating}</td><td style={td}><Pill s={cand.stage}/></td><td style={td}><select onChange={e=>e.target.value&&move(cand.id,e.target.value)} defaultValue="" style={{padding:3,fontSize:11,border:'1px solid #3D121255'}}><option value="">→</option>{STAGES.map(s=><option key={s}>{s}</option>)}</select></td></tr>)}
        </Tbl>
      </div>})}
    </Panel>
  </Grid></Page>
}
const inp:React.CSSProperties={padding:6,border:'1px solid #3D121255',fontSize:12}

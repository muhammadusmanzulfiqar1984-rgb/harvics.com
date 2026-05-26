'use client'
/** #15 Contract Lifecycle */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([]);const [expiring,setExpiring]=useState<any[]>([])
  const [form,setForm]=useState({contractNo:`C-${Date.now().toString().slice(-6)}`,title:'',counterparty:'',type:'MSA',value:0,currency:'USD',startDate:'',endDate:'',notes:''})
  const load=async()=>{setRows((await getJson('/api/wave5/contracts')).data||[]);setExpiring((await getJson('/api/wave5/contracts/expiring?days=90')).data||[])}
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.title||!form.counterparty||!form.startDate||!form.endDate)return alert('Title+counterparty+dates required');await postJson('/api/wave5/contracts',form);setForm({...form,contractNo:`C-${Date.now().toString().slice(-6)}`,title:'',counterparty:''});await load()}catch(e:any){alert(e.message)}}
  const sign=async(id:string)=>{try{await postJson(`/api/wave5/contracts/${id}/sign`,{});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#15" band="COMMERCIAL & SALES" title="Contract Lifecycle" sub="Draft · sign · monitor · alert on expiry"/>
  <Grid cols={3}>
    <Panel title="NEW CONTRACT">
      <Form><Inp l="Contract No *" v={form.contractNo} on={v=>setForm({...form,contractNo:v})}/><Sel l="Type" v={form.type} on={v=>setForm({...form,type:v})} opts={['MSA','SOW','NDA','Lease','Purchase','Service']}/></Form>
      <Inp l="Title *" v={form.title} on={v=>setForm({...form,title:v})}/>
      <Inp l="Counterparty *" v={form.counterparty} on={v=>setForm({...form,counterparty:v})}/>
      <Form><Inp l="Value" tp="number" v={form.value} on={v=>setForm({...form,value:+v})}/><Inp l="Currency" v={form.currency} on={v=>setForm({...form,currency:v})}/></Form>
      <Form><Inp l="Start *" tp="date" v={form.startDate} on={v=>setForm({...form,startDate:v})}/><Inp l="End *" tp="date" v={form.endDate} on={v=>setForm({...form,endDate:v})}/></Form>
      <Inp l="Notes" v={form.notes} on={v=>setForm({...form,notes:v})}/>
      <button onClick={create} style={btnB}>+ DRAFT CONTRACT</button>
    </Panel>
    <Panel title={`EXPIRING (next 90 days): ${expiring.length}`}>
      <Tbl head={['CN','TITLE','CP','ENDS']}>{expiring.map(e=><tr key={e.id}><td style={td}>{e.contractNo}</td><td style={td}>{e.title}</td><td style={td}>{e.counterparty}</td><td style={{...td,color:'#B71C1C',fontWeight:700}}>{new Date(e.endDate).toLocaleDateString()}</td></tr>)}</Tbl>
    </Panel>
    <Panel title="ALL CONTRACTS" full>
      <Tbl head={['CN','TITLE','CP','TYPE','VALUE','PERIOD','STATUS','ACT']}>
        {rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{r.contractNo}</b></td><td style={td}>{r.title}</td><td style={td}>{r.counterparty}</td><td style={td}>{r.type}</td>
          <td style={td}>{r.currency} {r.value.toLocaleString()}</td>
          <td style={{...td,fontSize:11}}>{new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}</td>
          <td style={td}><Pill s={r.status}/></td>
          <td style={td}>{['Draft','Negotiating'].includes(r.status)&&<button onClick={()=>sign(r.id)} style={btnA}>SIGN</button>}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

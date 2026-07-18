'use client'
/** #46 Service Management */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({ticketNo:`T-${Date.now().toString().slice(-6)}`,customerName:'',subject:'',description:'',priority:'Medium',category:'',assignedTo:''})
  const [res,setRes]=useState<Record<string,string>>({})
  const load=async()=>setRows((await getJson('/api/wave5/service-tickets')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.customerName||!form.subject)return alert('Customer+subject required');await postJson('/api/wave5/service-tickets',form);setForm({...form,ticketNo:`T-${Date.now().toString().slice(-6)}`,customerName:'',subject:''});await load()}catch(e:any){alert(e.message)}}
  const resolve=async(id:string)=>{const r=res[id]||'Resolved';try{await postJson(`/api/wave5/service-tickets/${id}/resolve`,{resolution:r});await load()}catch(e:any){alert(e.message)}}
  const open=rows.filter(r=>r.status==='Open'||r.status==='InProgress').length
  const breached=rows.filter(r=>r.slaBreached).length
  return <Page><Hdr no="#46" band="OPERATIONS" title="Service Management" sub={`Tickets: ${rows.length} total · ${open} open · ${breached} SLA breaches`}/>
  <Grid cols={2}>
    <Panel title="NEW TICKET">
      <Form><Inp l="Ticket No *" v={form.ticketNo} on={v=>setForm({...form,ticketNo:v})}/><Sel l="Priority" v={form.priority} on={v=>setForm({...form,priority:v})} opts={['Low','Medium','High','Urgent']}/></Form>
      <Inp l="Customer *" v={form.customerName} on={v=>setForm({...form,customerName:v})}/>
      <Inp l="Subject *" v={form.subject} on={v=>setForm({...form,subject:v})}/>
      <Inp l="Description" v={form.description} on={v=>setForm({...form,description:v})}/>
      <Form><Inp l="Category" v={form.category} on={v=>setForm({...form,category:v})}/><Inp l="Assign to" v={form.assignedTo} on={v=>setForm({...form,assignedTo:v})}/></Form>
      <button onClick={create} style={btnB}>+ OPEN TICKET</button>
      <div style={{marginTop:8,padding:8,background:'var(--harvics-cream)',borderLeft:'4px solid #C3A35E',fontSize:11,color:'var(--harvics-burgundy)'}}>SLA: Urgent 4h · High 24h · Medium 72h · Low 168h. Breach auto-flagged on resolve.</div>
    </Panel>
    <Panel title="ALL TICKETS" full>
      <Tbl head={['TICKET','CUSTOMER','SUBJECT','PRI','STATUS','OPENED','SLA','RESOLVE']}>
        {rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #3D121211'}}>
          <td style={td}><b>{r.ticketNo}</b></td><td style={td}>{r.customerName}</td><td style={{...td,fontSize:11}}>{r.subject}</td>
          <td style={td}><Pill s={r.priority}/></td><td style={td}><Pill s={r.status}/></td>
          <td style={{...td,fontSize:11}}>{new Date(r.openedAt).toLocaleString()}</td>
          <td style={td}>{r.slaBreached?<Pill s="BREACHED"/>:r.status==='Resolved'?'✓':'—'}</td>
          <td style={td}>{(r.status==='Open'||r.status==='InProgress')&&<><input placeholder="resolution" onChange={e=>setRes({...res,[r.id]:e.target.value})} style={{padding:3,fontSize:11,border:'1px solid #3D121255',width:120}}/> <button onClick={()=>resolve(r.id)} style={btnA}>RESOLVE</button></>}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

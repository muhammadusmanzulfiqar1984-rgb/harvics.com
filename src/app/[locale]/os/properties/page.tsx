'use client'
/** #36 Properties */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({code:'',name:'',type:'Office',address:'',sqft:0,occupancyPct:0,monthlyRent:0,currency:'USD',leaseEnd:''})
  const load=async()=>setRows((await getJson('/api/wave5/properties')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.code||!form.name)return alert('Code+name required');await postJson('/api/wave5/properties',{...form,leaseEnd:form.leaseEnd||null});setForm({...form,code:'',name:''});await load()}catch(e:any){alert(e.message)}}
  const totalSqft=rows.reduce((s,r)=>s+r.sqft,0);const totalRent=rows.reduce((s,r)=>s+r.monthlyRent,0);const avgOcc=rows.length?rows.reduce((s,r)=>s+r.occupancyPct,0)/rows.length:0
  return <Page><Hdr no="#36" band="OPERATIONS" title="Real Estate & Facilities" sub={`Portfolio: ${rows.length} properties · ${totalSqft.toLocaleString()} sqft · $${totalRent.toLocaleString()}/mo · avg ${avgOcc.toFixed(0)}% occupied`}/>
  <Grid cols={2}>
    <Panel title="NEW PROPERTY">
      <Form><Inp l="Code *" v={form.code} on={v=>setForm({...form,code:v})}/><Sel l="Type *" v={form.type} on={v=>setForm({...form,type:v})} opts={['Office','Warehouse','Retail','Plant','Land']}/></Form>
      <Inp l="Name *" v={form.name} on={v=>setForm({...form,name:v})}/>
      <Inp l="Address" v={form.address} on={v=>setForm({...form,address:v})}/>
      <Form><Inp l="Sqft" tp="number" v={form.sqft} on={v=>setForm({...form,sqft:+v})}/><Inp l="Occupancy %" tp="number" v={form.occupancyPct} on={v=>setForm({...form,occupancyPct:+v})}/></Form>
      <Form><Inp l="Monthly rent" tp="number" v={form.monthlyRent} on={v=>setForm({...form,monthlyRent:+v})}/><Inp l="Currency" v={form.currency} on={v=>setForm({...form,currency:v})}/></Form>
      <Inp l="Lease end" tp="date" v={form.leaseEnd} on={v=>setForm({...form,leaseEnd:v})}/>
      <button onClick={create} style={btnB}>+ ADD PROPERTY</button>
    </Panel>
    <Panel title="PORTFOLIO">
      <Tbl head={['CODE','NAME','TYPE','SQFT','OCC%','RENT','LEASE END','STATUS']}>
        {rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{r.code}</b></td><td style={td}>{r.name}</td><td style={td}>{r.type}</td>
          <td style={td}>{r.sqft.toLocaleString()}</td><td style={{...td,fontWeight:700,color:r.occupancyPct<50?'#B71C1C':r.occupancyPct<80?'#B8860B':'#2E7D32'}}>{r.occupancyPct}%</td>
          <td style={td}>{r.currency} {r.monthlyRent.toLocaleString()}</td>
          <td style={{...td,fontSize:11}}>{r.leaseEnd?new Date(r.leaseEnd).toLocaleDateString():'—'}</td>
          <td style={td}><Pill s={r.status}/></td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

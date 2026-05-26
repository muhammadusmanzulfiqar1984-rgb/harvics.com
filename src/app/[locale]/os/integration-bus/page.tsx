'use client'
/** #54 Integration Bus */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson, B } from '@/components/os/w5ui'
export default function P(){
  const [endpoints,setEndpoints]=useState<any[]>([]);const [deliveries,setDeliveries]=useState<any[]>([])
  const [form,setForm]=useState({code:'',name:'',url:'',method:'POST',authType:'none',authValue:''})
  const [dispatch,setDispatch]=useState({event:'order.created',endpointCode:'',payload:'{"orderId":"ORD-001","amount":1500}'})
  const load=async()=>{setEndpoints((await getJson('/api/wave7/endpoints')).data||[]);setDeliveries((await getJson('/api/wave7/deliveries')).data||[])}
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.code||!form.url)return alert('Code+URL required');await postJson('/api/wave7/endpoints',form);setForm({...form,code:'',name:'',url:''});await load()}catch(e:any){alert(e.message)}}
  const send=async()=>{try{const payload=JSON.parse(dispatch.payload||'{}');const r=await postJson('/api/wave7/dispatch',{...dispatch,payload});alert(`Dispatched to ${r.dispatched}: ${r.delivered} delivered, ${r.failed} failed`);await load()}catch(e:any){alert(e.message)}}
  const retry=async(id:string)=>{try{const r=await postJson(`/api/wave7/deliveries/${id}/retry`,{});if(r.message)alert(r.message);await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#54" band="PLATFORM" title="Integration Bus" sub="Webhook endpoints · dispatch · retries · dead-letter queue"/>
  <Grid cols={3}>
    <Panel title="REGISTER ENDPOINT">
      <Form><Inp l="Code *" v={form.code} on={v=>setForm({...form,code:v})}/><Inp l="Name" v={form.name} on={v=>setForm({...form,name:v})}/></Form>
      <Inp l="URL *" v={form.url} on={v=>setForm({...form,url:v})}/>
      <Form><Sel l="Method" v={form.method} on={v=>setForm({...form,method:v})} opts={['POST','PUT','PATCH','GET']}/><Sel l="Auth" v={form.authType} on={v=>setForm({...form,authType:v})} opts={['none','bearer','basic','hmac']}/></Form>
      {form.authType!=='none'&&<Inp l="Auth value" v={form.authValue} on={v=>setForm({...form,authValue:v})}/>}
      <button onClick={create} style={btnB}>+ REGISTER</button>
    </Panel>
    <Panel title="DISPATCH EVENT">
      <Inp l="Event name" v={dispatch.event} on={v=>setDispatch({...dispatch,event:v})}/>
      <Sel l="Endpoint (blank = all)" v={dispatch.endpointCode} on={v=>setDispatch({...dispatch,endpointCode:v})} opts={['',...endpoints.map(e=>e.code)]}/>
      <label><div style={{fontSize:10,color:B,fontWeight:600}}>Payload (JSON)</div><textarea value={dispatch.payload} onChange={e=>setDispatch({...dispatch,payload:e.target.value})} rows={4} style={{width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:11,fontFamily:'monospace'}}/></label>
      <button onClick={send} style={btnB}>🚀 DISPATCH</button>
    </Panel>
    <Panel title={`ENDPOINTS (${endpoints.length})`}>
      <Tbl head={['CODE','URL','METHOD','AUTH','DELIVERIES']}>
        {endpoints.map(e=><tr key={e.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{e.code}</b></td><td style={{...td,fontSize:10,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{e.url}</td>
          <td style={td}>{e.method}</td><td style={td}>{e.authType}</td><td style={{...td,fontWeight:700,color:B}}>{e._count?.deliveries||0}</td>
        </tr>)}
      </Tbl>
    </Panel>
    <Panel title="DELIVERY LOG" full>
      <Tbl head={['WHEN','ENDPOINT','EVENT','STATUS','ATTEMPTS','HTTP','NEXT RETRY']}>
        {deliveries.map(d=><tr key={d.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={{...td,fontSize:11}}>{new Date(d.createdAt).toLocaleString()}</td>
          <td style={td}>{d.endpoint?.code||'—'}</td>
          <td style={td}>{d.event}</td>
          <td style={td}><Pill s={d.status==='Delivered'?'Active':d.status==='DLQ'?'Cancelled':d.status}/></td>
          <td style={td}>{d.attempts}</td>
          <td style={td}>{d.responseCode||'—'}</td>
          <td style={{...td,fontSize:11}}>{['Failed','Pending'].includes(d.status)?<button onClick={()=>retry(d.id)} style={btnA}>RETRY</button>:d.nextRetryAt?new Date(d.nextRetryAt).toLocaleTimeString():'—'}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

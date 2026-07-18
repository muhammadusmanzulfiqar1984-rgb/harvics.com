'use client'
/** #28 3PL Integration */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, td, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [partners,setPartners]=useState<any[]>([]);const [events,setEvents]=useState<any[]>([])
  const [pForm,setPForm]=useState({code:'',name:'',apiBaseUrl:'',authMode:'apikey',webhookUrl:''})
  const [eForm,setEForm]=useState({partnerCode:'',eventType:'shipment_created',payloadText:'{}'})
  const load=async()=>{setPartners((await getJson('/api/wave5/threepl-partners')).data||[]);setEvents((await getJson('/api/wave5/threepl-events')).data||[])}
  useEffect(()=>{void load()},[])
  const addP=async()=>{try{if(!pForm.code||!pForm.name)return alert('Code+name required');await postJson('/api/wave5/threepl-partners',pForm);setPForm({...pForm,code:'',name:''});await load()}catch(e:any){alert(e.message)}}
  const addE=async()=>{try{let payload;try{payload=JSON.parse(eForm.payloadText)}catch{return alert('Invalid JSON payload')}await postJson('/api/wave5/threepl-events',{partnerCode:eForm.partnerCode,eventType:eForm.eventType,payload});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#28" band="LOGISTICS & TRADE" title="3PL Integration" sub="Partner registry · inbound EDI/webhook event ledger"/>
  <Grid cols={2}>
    <Panel title="3PL PARTNERS">
      <Form><Inp l="Code *" v={pForm.code} on={v=>setPForm({...pForm,code:v})}/><Inp l="Name *" v={pForm.name} on={v=>setPForm({...pForm,name:v})}/></Form>
      <Inp l="API base URL" v={pForm.apiBaseUrl} on={v=>setPForm({...pForm,apiBaseUrl:v})}/>
      <Inp l="Webhook URL" v={pForm.webhookUrl} on={v=>setPForm({...pForm,webhookUrl:v})}/>
      <Sel l="Auth" v={pForm.authMode} on={v=>setPForm({...pForm,authMode:v})} opts={['apikey','oauth','none']}/>
      <button onClick={addP} style={btnB}>+ ADD PARTNER</button>
      <Tbl head={['CODE','NAME','AUTH']}>{partners.map(p=><tr key={p.id}><td style={td}><b>{p.code}</b></td><td style={td}>{p.name}</td><td style={td}>{p.authMode}</td></tr>)}</Tbl>
    </Panel>
    <Panel title="INGEST EVENT">
      <Sel l="Partner code" v={eForm.partnerCode} on={v=>setEForm({...eForm,partnerCode:v})} opts={['',...partners.map(p=>p.code)]}/>
      <Sel l="Event type" v={eForm.eventType} on={v=>setEForm({...eForm,eventType:v})} opts={['shipment_created','status_update','exception','pod','customs']}/>
      <label><div style={{fontSize:10,color:'var(--harvics-burgundy)',fontWeight:600}}>Payload (JSON)</div><textarea value={eForm.payloadText} onChange={e=>setEForm({...eForm,payloadText:e.target.value})} rows={4} style={{width:'100%',padding:6,border:'1px solid #3D121255',fontFamily:'monospace',fontSize:11}}/></label>
      <button onClick={addE} style={btnB}>INGEST</button>
      <Tbl head={['WHEN','PARTNER','TYPE']}>{events.map(e=><tr key={e.id}><td style={{...td,fontSize:11}}>{new Date(e.receivedAt).toLocaleString()}</td><td style={td}>{e.partnerCode}</td><td style={td}>{e.eventType}</td></tr>)}</Tbl>
    </Panel>
  </Grid></Page>
}

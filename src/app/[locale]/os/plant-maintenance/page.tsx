'use client'
/** #35 Plant Maintenance */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([]);const [assets,setAssets]=useState<any[]>([])
  const [form,setForm]=useState({woNo:`PM-${Date.now().toString().slice(-6)}`,assetId:'',type:'Corrective',priority:'Medium',description:'',assignedTo:'',scheduledAt:''})
  const [done,setDone]=useState<Record<string,{laborHours:number;partsCost:number}>>({})
  const load=async()=>{setRows((await getJson('/api/wave5/pm-orders')).data||[]);try{setAssets((await getJson('/api/assets')).data||[])}catch{}}
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.assetId||!form.description)return alert('Asset+description required');await postJson('/api/wave5/pm-orders',{...form,scheduledAt:form.scheduledAt||null});setForm({...form,woNo:`PM-${Date.now().toString().slice(-6)}`,description:''});await load()}catch(e:any){alert(e.message)}}
  const complete=async(id:string)=>{const d=done[id]||{laborHours:0,partsCost:0};try{await postJson(`/api/wave5/pm-orders/${id}/complete`,d);await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#35" band="MANUFACTURING & OPERATIONS" title="Plant Maintenance" sub="Work orders on assets · labor + parts cost rollup"/>
  <Grid cols={2}>
    <Panel title="NEW WORK ORDER">
      <Form><Inp l="WO No *" v={form.woNo} on={v=>setForm({...form,woNo:v})}/><Sel l="Type" v={form.type} on={v=>setForm({...form,type:v})} opts={['Preventive','Corrective','Predictive','Emergency']}/></Form>
      <label><div style={{fontSize:10,color:'#6B1F2B',fontWeight:600}}>Asset * ({assets.length} available)</div>
        <select value={form.assetId} onChange={e=>setForm({...form,assetId:e.target.value})} style={{width:'100%',padding:6,border:'1px solid #6B1F2B55',fontSize:12}}>
          <option value="">-- pick asset --</option>
          {assets.map(a=><option key={a.id} value={a.id}>{a.assetCode} — {a.name}</option>)}
        </select>
      </label>
      <Form><Sel l="Priority" v={form.priority} on={v=>setForm({...form,priority:v})} opts={['Low','Medium','High','Critical']}/><Inp l="Assigned to" v={form.assignedTo} on={v=>setForm({...form,assignedTo:v})}/></Form>
      <Inp l="Scheduled at" tp="datetime-local" v={form.scheduledAt} on={v=>setForm({...form,scheduledAt:v})}/>
      <Inp l="Description *" v={form.description} on={v=>setForm({...form,description:v})}/>
      <button onClick={create} style={btnB}>+ CREATE WO</button>
    </Panel>
    <Panel title={`WORK ORDERS (${rows.length})`} full>
      <Tbl head={['WO','ASSET','TYPE','PRI','DESC','ASSIGNED','STATUS','COST','ACT']}>
        {rows.map(r=>{const d=done[r.id]||{laborHours:0,partsCost:0};const a=assets.find(x=>x.id===r.assetId);return <tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{r.woNo}</b></td><td style={{...td,fontSize:11}}>{a?.assetCode||r.assetId.slice(-6)}</td><td style={td}><Pill s={r.type}/></td><td style={td}><Pill s={r.priority}/></td>
          <td style={{...td,fontSize:11}}>{r.description}</td><td style={td}>{r.assignedTo||'—'}</td>
          <td style={td}><Pill s={r.status}/></td>
          <td style={td}>{r.totalCost?`$${r.totalCost}`:'—'}</td>
          <td style={td}>{r.status!=='Completed'&&<><input type="number" placeholder="hrs" defaultValue={r.laborHours} onChange={e=>setDone({...done,[r.id]:{...d,laborHours:+e.target.value}})} style={{width:40,padding:3,border:'1px solid #6B1F2B55',fontSize:11}}/> <input type="number" placeholder="$parts" defaultValue={r.partsCost} onChange={e=>setDone({...done,[r.id]:{...d,partsCost:+e.target.value}})} style={{width:60,padding:3,border:'1px solid #6B1F2B55',fontSize:11}}/> <button onClick={()=>complete(r.id)} style={btnA}>DONE</button></>}</td>
        </tr>})}
      </Tbl>
    </Panel>
  </Grid></Page>
}

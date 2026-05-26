'use client'
/** #18 Shop Floor Control */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({workOrderId:'',operationNo:10,workCenter:'',description:'',setupMins:5,runMins:30,qtyPlanned:100,operator:''})
  const [report,setReport]=useState<Record<string,{qtyDone:number;qtyScrap:number}>>({})
  const load=async()=>setRows((await getJson('/api/wave5/shop-floor-ops')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.workCenter)return alert('Work center required');await postJson('/api/wave5/shop-floor-ops',{...form,workOrderId:form.workOrderId||null});setForm({...form,workCenter:'',description:''});await load()}catch(e:any){alert(e.message)}}
  const doReport=async(id:string,status?:string)=>{try{const r=report[id]||{qtyDone:0,qtyScrap:0};await postJson(`/api/wave5/shop-floor-ops/${id}/report`,{...r,status});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#18" band="MANUFACTURING & OPERATIONS" title="Shop Floor Control" sub="Operations queue · in-progress reporting · scrap tracking"/>
  <Grid cols={2}>
    <Panel title="NEW OPERATION">
      <Form><Inp l="WO ID (optional)" v={form.workOrderId} on={v=>setForm({...form,workOrderId:v})}/><Inp l="Op No *" tp="number" v={form.operationNo} on={v=>setForm({...form,operationNo:+v})}/></Form>
      <Inp l="Work center *" v={form.workCenter} on={v=>setForm({...form,workCenter:v})}/>
      <Inp l="Description" v={form.description} on={v=>setForm({...form,description:v})}/>
      <Form cols={3}><Inp l="Setup min" tp="number" v={form.setupMins} on={v=>setForm({...form,setupMins:+v})}/><Inp l="Run min" tp="number" v={form.runMins} on={v=>setForm({...form,runMins:+v})}/><Inp l="Qty planned" tp="number" v={form.qtyPlanned} on={v=>setForm({...form,qtyPlanned:+v})}/></Form>
      <Inp l="Operator" v={form.operator} on={v=>setForm({...form,operator:v})}/>
      <button onClick={create} style={btnB}>+ QUEUE OPERATION</button>
    </Panel>
    <Panel title={`OPERATIONS (${rows.length})`} full>
      <Tbl head={['OP','WC','DESC','PLANNED','DONE','SCRAP','STATUS','REPORT','ACT']}>
        {rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}>{r.operationNo}</td><td style={td}>{r.workCenter}</td><td style={td}>{r.description||'—'}</td>
          <td style={td}>{r.qtyPlanned}</td><td style={td}>{r.qtyDone}</td><td style={{...td,color:r.qtyScrap>0?'#B71C1C':undefined}}>{r.qtyScrap}</td>
          <td style={td}><Pill s={r.status}/></td>
          <td style={td}>{r.status!=='Completed'&&<><input type="number" placeholder="done" defaultValue={r.qtyDone} onChange={e=>setReport({...report,[r.id]:{...(report[r.id]||{qtyDone:0,qtyScrap:0}),qtyDone:+e.target.value}})} style={{width:50,padding:3,border:'1px solid #6B1F2B55',fontSize:11}}/> <input type="number" placeholder="scrap" defaultValue={r.qtyScrap} onChange={e=>setReport({...report,[r.id]:{...(report[r.id]||{qtyDone:0,qtyScrap:0}),qtyScrap:+e.target.value}})} style={{width:50,padding:3,border:'1px solid #6B1F2B55',fontSize:11}}/></>}</td>
          <td style={td}>{r.status==='Queued'&&<button onClick={()=>doReport(r.id,'InProgress')} style={btnA}>START</button>} {r.status==='InProgress'&&<button onClick={()=>doReport(r.id,'Completed')} style={btnA}>COMPLETE</button>}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

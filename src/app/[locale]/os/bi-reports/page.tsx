'use client'
/** #41 BI & Reporting — saved reports runner */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, getJson, postJson } from '@/components/os/w5ui'
const SOURCES=['Order','Invoice','Customer','InventoryItem','PurchaseOrder','Employee','Lead','Deal']
const METRICS=['count','sum','avg','min','max']
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({name:'',category:'sales',sourceTable:'Order',metric:'count',metricField:'',groupBy:'',description:''})
  const [result,setResult]=useState<any>(null);const [resultName,setResultName]=useState('')
  const load=async()=>setRows((await getJson('/api/wave5/reports')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.name)return alert('Name required');await postJson('/api/wave5/reports',{...form,metricField:form.metricField||null,groupBy:form.groupBy||null});setForm({...form,name:''});await load()}catch(e:any){alert(e.message)}}
  const run=async(id:string,name:string)=>{try{const r=await postJson(`/api/wave5/reports/${id}/run`,{});setResult(r.data);setResultName(name);await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#41" band="INTELLIGENCE & PLATFORM" title="BI & Reporting" sub="Define saved reports against any canonical entity · run live aggregates"/>
  <Grid cols={2}>
    <Panel title="NEW SAVED REPORT">
      <Inp l="Name *" v={form.name} on={v=>setForm({...form,name:v})}/>
      <Form><Inp l="Category" v={form.category} on={v=>setForm({...form,category:v})}/><Sel l="Source" v={form.sourceTable} on={v=>setForm({...form,sourceTable:v})} opts={SOURCES}/></Form>
      <Form><Sel l="Metric" v={form.metric} on={v=>setForm({...form,metric:v})} opts={METRICS}/><Inp l="Field (req for sum/avg/min/max)" v={form.metricField} on={v=>setForm({...form,metricField:v})}/></Form>
      <Inp l="Group by (column name)" v={form.groupBy} on={v=>setForm({...form,groupBy:v})}/>
      <Inp l="Description" v={form.description} on={v=>setForm({...form,description:v})}/>
      <button onClick={create} style={btnB}>+ SAVE REPORT</button>
      <div style={{marginTop:8,padding:10,background:'var(--harvics-cream)',borderLeft:'4px solid #C3A35E',fontSize:11,color:'var(--harvics-burgundy)'}}>
        Examples:<br/>• Sales count by status: source=Order, metric=count, groupBy=status<br/>• Total invoiced: source=Invoice, metric=sum, field=amount<br/>• AR by status: source=Invoice, metric=sum, field=amount, groupBy=status
      </div>
    </Panel>
    <Panel title={result?`RESULT — ${resultName}`:'RESULT'}>
      {!result?<div style={{padding:20,color:'#888',textAlign:'center'}}>Run a saved report to see results.</div>:(<>
        {Array.isArray(result)?<Tbl head={['KEY','VALUE']}>{result.map((r:any,i:number)=><tr key={i}><td style={td}>{String(r.key)}</td><td style={{...td,fontWeight:700,color:'var(--harvics-burgundy)'}}>{typeof r.value==='number'?r.value.toLocaleString():String(r.value)}</td></tr>)}</Tbl>:<div style={{padding:20,fontSize:28,fontWeight:700,color:'var(--harvics-burgundy)',textAlign:'center'}}>{typeof result==='object'?Object.entries(result).map(([k,v]:any)=><div key={k} style={{fontSize:14}}>{k}: <b style={{fontSize:24}}>{typeof v==='number'?v.toLocaleString():String(v)}</b></div>):result}</div>}
      </>)}
    </Panel>
    <Panel title="SAVED REPORTS" full>
      <Tbl head={['NAME','CATEGORY','SOURCE','METRIC','GROUP BY','LAST RUN','ACTIONS']}>
        {rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #3D121211'}}>
          <td style={td}><b>{r.name}</b></td><td style={td}>{r.category||'—'}</td><td style={td}>{r.sourceTable}</td>
          <td style={td}>{r.metric}{r.metricField?`(${r.metricField})`:''}</td><td style={td}>{r.groupBy||'—'}</td>
          <td style={{...td,fontSize:11}}>{r.lastRunAt?new Date(r.lastRunAt).toLocaleString():'—'}</td>
          <td style={td}><button onClick={()=>run(r.id,r.name)} style={btnA}>RUN</button></td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

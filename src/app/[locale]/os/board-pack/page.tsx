'use client'
/** #42 Board Pack Generator */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({period:'2026-Q2',title:''})
  const [open,setOpen]=useState<any>(null)
  const load=async()=>setRows((await getJson('/api/wave5/board-packs')).data||[])
  useEffect(()=>{void load()},[])
  const generate=async()=>{try{await postJson('/api/wave5/board-packs/generate',form);await load()}catch(e:any){alert(e.message)}}
  const approve=async(id:string)=>{try{await postJson(`/api/wave5/board-packs/${id}/approve`,{});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#42" band="INTELLIGENCE & PLATFORM" title="Board Pack Generator" sub="Auto-compose quarterly board reports from live data"/>
  <Grid cols={2}>
    <Panel title="GENERATE PACK">
      <Inp l="Period *" v={form.period} on={v=>setForm({...form,period:v})}/>
      <Inp l="Title (auto if blank)" v={form.title} on={v=>setForm({...form,title:v})}/>
      <button onClick={generate} style={btnB}>GENERATE FROM LIVE DATA</button>
      <div style={{marginTop:10,padding:10,background:'#F5F1E8',borderLeft:'4px solid #C3A35E',fontSize:11,color:'#6B1F2B'}}>Pulls real KPIs from Orders, Invoices, Customers, Leads, Work Orders. Re-running overwrites the pack for that period.</div>
    </Panel>
    <Panel title="ALL PACKS">
      <Tbl head={['PERIOD','TITLE','STATUS','GENERATED','ACTIONS']}>
        {rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{r.period}</b></td><td style={td}>{r.title}</td><td style={td}><Pill s={r.status}/></td>
          <td style={{...td,fontSize:11}}>{new Date(r.generatedAt).toLocaleString()}</td>
          <td style={td}><button onClick={()=>setOpen(r)} style={btnA}>VIEW</button> {r.status==='Draft'&&<button onClick={()=>approve(r.id)} style={btnA}>APPROVE</button>}</td>
        </tr>)}
      </Tbl>
    </Panel>
    {open && <Panel title={`PACK — ${open.title}`} full>
      {(open.sections as any[]).map((s,i)=><div key={i} style={{padding:10,borderBottom:'1px solid #6B1F2B22'}}>
        <div style={{fontWeight:700,color:'#6B1F2B',fontSize:14}}>{s.name}</div>
        <div style={{fontSize:12,marginTop:4}}>{s.content}</div>
        {s.kpis && <div style={{marginTop:6,display:'flex',gap:16,flexWrap:'wrap'}}>{Object.entries(s.kpis).map(([k,v]:any)=><div key={k} style={{padding:'4px 12px',background:'#F5F1E8',border:'1px solid #C3A35E'}}>
          <div style={{fontSize:10,color:'#666',fontWeight:600}}>{k.toUpperCase()}</div>
          <div style={{fontSize:18,fontWeight:700,color:'#6B1F2B'}}>{typeof v==='number'?v.toLocaleString():v}</div>
        </div>)}</div>}
      </div>)}
    </Panel>}
  </Grid></Page>
}

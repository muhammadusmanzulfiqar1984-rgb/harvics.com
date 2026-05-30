'use client'
/** #44 AI Variance Commentary */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Inp, Tbl, btnB, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [period,setPeriod]=useState(new Date().toISOString().slice(0,7))
  const [rows,setRows]=useState<any[]>([])
  const load=async()=>setRows((await getJson(`/api/wave5/variance-commentary?period=${period}`)).data||[])
  useEffect(()=>{void load()},[period])
  const generate=async()=>{try{const r=await postJson('/api/wave5/variance-commentary/generate',{period});alert(`Generated ${r.total} commentary lines.`);await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#44" band="FINANCE" title="AI Variance Commentary" sub="Auto-classify and explain budget-vs-actual variances by account"/>
  <Grid cols={2}>
    <Panel title="GENERATE">
      <Inp l="Period (YYYY-MM)" v={period} on={v=>setPeriod(v)}/>
      <button onClick={generate} style={btnB}>GENERATE FROM VARIANCE</button>
      <div style={{marginTop:10,padding:10,background:'#F5F0E8',borderLeft:'4px solid #C3A35E',fontSize:11,color:'#6B1F2B'}}>
        Reads budget lines + actual allocations for the period, computes variances, then classifies each as Timing / Volume / Price / Mix / Other and produces a draft narrative for review.
      </div>
    </Panel>
    <Panel title={`COMMENTARY — ${period}`} full>
      <Tbl head={['ACCOUNT','CC','VARIANCE','%','CLASS','COMMENTARY']}>
        {rows.length===0?<tr><td colSpan={6} style={{padding:24,textAlign:'center',color:'#888'}}>None yet. Click GENERATE.</td></tr>:rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{r.account}</b></td><td style={td}>{r.costCenter||'—'}</td>
          <td style={{...td,fontWeight:700,color:r.variance>0?'#B71C1C':'#2E7D32'}}>${r.variance.toLocaleString()}</td>
          <td style={td}>{r.variancePct!==null?`${r.variancePct}%`:'—'}</td>
          <td style={td}><Pill s={r.classification}/></td>
          <td style={{...td,fontSize:11,maxWidth:400}}>{r.commentary}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

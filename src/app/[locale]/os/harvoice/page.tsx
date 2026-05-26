'use client'
/** #57 Harvoice */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Inp, Tbl, btnB, td, Pill, getJson, postJson, B } from '@/components/os/w5ui'
export default function P(){
  const [commands,setCommands]=useState<any[]>([]);const [stats,setStats]=useState<any>(null)
  const [transcript,setTranscript]=useState('')
  const load=async()=>{setCommands((await getJson('/api/wave7/voice/commands')).data||[]);setStats((await getJson('/api/wave7/voice/stats')).data||{})}
  useEffect(()=>{void load()},[])
  const send=async()=>{if(!transcript.trim())return;try{const r=await postJson('/api/wave7/voice/transcribe',{transcript,userId:'demo-user'});setTranscript('');await load();alert(`Intent: ${r.data.intent} (${(r.data.confidence*100).toFixed(0)}% conf)\n${r.data.responseText}`)}catch(e:any){alert(e.message)}}
  const EXAMPLES=['Search invoices over 5000','Create new customer Acme Corp','Open dashboard','Generate sales report for May']
  return <Page><Hdr no="#57" band="DATA & AI" title="Harvoice" sub="Voice/text command intent classifier · rule-based NLU"/>
  <Grid cols={3}>
    <Panel title="SPEAK / TYPE COMMAND">
      <Inp l="Transcript" v={transcript} on={setTranscript}/>
      <button onClick={send} style={btnB}>🎙 PROCESS</button>
      <div style={{marginTop:10,fontSize:10,color:B,fontWeight:600}}>EXAMPLES</div>
      {EXAMPLES.map(e=><button key={e} onClick={()=>setTranscript(e)} style={{display:'block',width:'100%',textAlign:'left',padding:4,marginTop:2,fontSize:11,background:'#F5F1E8',color:B,border:'none',cursor:'pointer'}}>"{e}"</button>)}
    </Panel>
    <Panel title="STATS">
      {!stats?'Loading...':<>
        <div style={{padding:8,background:'#F5F1E8',marginBottom:8}}>
          <div style={{fontSize:10,color:B,fontWeight:600}}>TOTAL COMMANDS</div>
          <div style={{fontSize:28,fontWeight:700,color:B}}>{stats.total||0}</div>
          <div style={{fontSize:11,color:'#666'}}>Avg confidence: <b>{stats.avgConfidence||0}</b> · Avg ms: <b>{stats.avgDurationMs||0}</b></div>
        </div>
        <Tbl head={['INTENT','COUNT']}>{(stats.byIntent||[]).map((i:any)=><tr key={i.intent}><td style={td}><Pill s={i.intent==='unknown'?'Cancelled':'Active'}/> {i.intent}</td><td style={{...td,fontWeight:700,color:B}}>{i.count}</td></tr>)}</Tbl>
      </>}
    </Panel>
    <Panel title={`HISTORY (${commands.length})`} full>
      <Tbl head={['WHEN','TRANSCRIPT','INTENT','CONF','ENTITIES','RESPONSE']}>
        {commands.map(c=><tr key={c.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={{...td,fontSize:11}}>{new Date(c.createdAt).toLocaleTimeString()}</td>
          <td style={{...td,fontSize:11,fontStyle:'italic'}}>"{c.transcript}"</td>
          <td style={td}><Pill s={c.intent==='unknown'?'Cancelled':'Active'}/> {c.intent}</td>
          <td style={{...td,fontWeight:700,color:c.confidence>0.7?'#2E7D32':c.confidence>0.4?'#C9A84C':'#B71C1C'}}>{(c.confidence*100).toFixed(0)}%</td>
          <td style={{...td,fontSize:10,fontFamily:'monospace'}}>{c.entities?JSON.stringify(c.entities):'—'}</td>
          <td style={{...td,fontSize:11}}>{c.responseText}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

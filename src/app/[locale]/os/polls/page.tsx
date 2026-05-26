'use client'
/** #65 Polls & Surveys */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Inp, btnB, btnA, getJson, postJson, B, G } from '@/components/os/w5ui'
export default function P(){
  const [polls,setPolls]=useState<any[]>([]);const [results,setResults]=useState<Record<string,any>>({})
  const [question,setQuestion]=useState('');const [optionsText,setOptionsText]=useState('');const [multi,setMulti]=useState(false)
  const [vote,setVote]=useState<Record<string,string[]>>({})
  const load=async()=>setPolls((await getJson('/api/wave6/polls')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{const opts=optionsText.split('\n').map(s=>s.trim()).filter(Boolean);if(!question||opts.length<2)return alert('Question + ≥2 options required');try{await postJson('/api/wave6/polls',{question,options:opts,multiSelect:multi});setQuestion('');setOptionsText('');await load()}catch(e:any){alert(e.message)}}
  const doVote=async(id:string)=>{const c=vote[id]||[];if(c.length===0)return alert('Pick an option');try{await postJson(`/api/wave6/polls/${id}/vote`,{userId:`user-${Date.now()}`,choices:c});await showResults(id)}catch(e:any){alert(e.message)}}
  const showResults=async(id:string)=>{const r=await getJson(`/api/wave6/polls/${id}/results`);setResults({...results,[id]:r})}
  return <Page><Hdr no="#65" band="MEGA-HARVICS" title="Polls & Surveys" sub="Single/multi-select polls with live tally"/>
  <Grid cols={2}>
    <Panel title="NEW POLL">
      <Inp l="Question *" v={question} on={setQuestion}/>
      <label><div style={{fontSize:10,color:B,fontWeight:600}}>Options (one per line, ≥2) *</div><textarea value={optionsText} onChange={e=>setOptionsText(e.target.value)} rows={4} style={{width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12,fontFamily:'inherit'}}/></label>
      <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:B,fontWeight:600,marginTop:6}}><input type="checkbox" checked={multi} onChange={e=>setMulti(e.target.checked)}/> Allow multi-select</label>
      <button onClick={create} style={btnB}>+ CREATE POLL</button>
    </Panel>
    <Panel title={`POLLS (${polls.length})`} full>
      {polls.map(p=>{const myVote=vote[p.id]||[];const res=results[p.id];return <div key={p.id} style={{padding:10,marginBottom:10,border:`1px solid ${B}22`,background:'#fff'}}>
        <div style={{fontWeight:700,color:B,fontSize:14}}>{p.question}</div>
        <div style={{fontSize:10,color:'#666',marginBottom:6}}>{p._count?.responses||0} responses · {p.multiSelect?'multi-select':'single-select'}</div>
        {!res?(p.options as string[]).map(opt=><label key={opt} style={{display:'block',padding:4}}>
          <input type={p.multiSelect?'checkbox':'radio'} name={`p-${p.id}`} checked={myVote.includes(opt)} onChange={()=>{const nv=p.multiSelect?(myVote.includes(opt)?myVote.filter(x=>x!==opt):[...myVote,opt]):[opt];setVote({...vote,[p.id]:nv})}}/> <span style={{fontSize:12}}>{opt}</span>
        </label>):res.data.map((r:any)=><div key={r.option} style={{padding:'4px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}><span>{r.option}</span><span style={{fontWeight:700,color:B}}>{r.votes} ({r.pct}%)</span></div>
          <div style={{height:6,background:'#eee',marginTop:2}}><div style={{width:`${r.pct}%`,height:'100%',background:G}}/></div>
        </div>)}
        <div style={{marginTop:6,display:'flex',gap:4}}>
          {!res&&<button onClick={()=>doVote(p.id)} style={btnA}>VOTE</button>}
          <button onClick={()=>showResults(p.id)} style={btnA}>{res?'REFRESH':'SHOW RESULTS'}</button>
        </div>
      </div>})}
    </Panel>
  </Grid></Page>
}

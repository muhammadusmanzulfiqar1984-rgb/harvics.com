'use client'
/** #61 Public Job Board */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Inp, Tbl, btnB, btnA, td, Pill, getJson, postJson, B } from '@/components/os/w5ui'
export default function P(){
  const [board,setBoard]=useState<any[]>([]);const [postings,setPostings]=useState<any[]>([])
  const [publishId,setPublishId]=useState('')
  const [apply,setApply]=useState<Record<string,{name:string;email:string}>>({})
  const load=async()=>{setBoard((await getJson('/api/wave6/job-board')).data||[]);setPostings((await getJson('/api/wave5/postings?status=Open')).data||[])}
  useEffect(()=>{void load()},[])
  const publish=async()=>{if(!publishId)return alert('Pick a posting');try{await postJson('/api/wave6/job-board/publish',{postingId:publishId});setPublishId('');await load()}catch(e:any){alert(e.message)}}
  const doApply=async(id:string)=>{const a=apply[id];if(!a?.name)return alert('Name required');try{await postJson(`/api/wave6/job-board/${id}/apply`,a);setApply({...apply,[id]:{name:'',email:''}});await load();alert('Application submitted!')}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#61" band="MEGA-HARVICS" title="Public Job Board" sub="External-facing wrapper on Wave 5 Talent postings"/>
  <Grid cols={2}>
    <Panel title="PUBLISH POSTING TO BOARD">
      <label><div style={{fontSize:10,color:B,fontWeight:600}}>Open posting ({postings.length} available)</div>
        <select value={publishId} onChange={e=>setPublishId(e.target.value)} style={{width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}}>
          <option value="">-- pick --</option>{postings.map(p=><option key={p.id} value={p.id}>{p.reqNo} — {p.title}</option>)}
        </select>
      </label>
      <button onClick={publish} style={btnB}>PUBLISH</button>
    </Panel>
    <Panel title={`PUBLIC BOARD (${board.length})`} full>
      {board.map(b=>{const a=apply[b.id]||{name:'',email:''};return <div key={b.id} style={{padding:10,marginBottom:8,border:`1px solid ${B}22`,background:'#fafafa'}}>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <div><b style={{color:B}}>{b.posting?.title}</b> <span style={{color:'#666',fontSize:11}}>· {b.posting?.department||'—'} · {b.posting?.location||'—'} · {b.posting?.level||'—'}</span></div>
          <div style={{fontSize:11,color:'#666'}}>👁 {b.views} · 📝 {b.applies}</div>
        </div>
        {b.posting?.description && <div style={{fontSize:12,marginTop:4,color:'#444'}}>{b.posting.description}</div>}
        <div style={{marginTop:8,display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:4}}>
          <input placeholder="Your name" value={a.name} onChange={e=>setApply({...apply,[b.id]:{...a,name:e.target.value}})} style={{padding:6,border:`1px solid ${B}55`,fontSize:12}}/>
          <input placeholder="Email" value={a.email} onChange={e=>setApply({...apply,[b.id]:{...a,email:e.target.value}})} style={{padding:6,border:`1px solid ${B}55`,fontSize:12}}/>
          <button onClick={()=>doApply(b.id)} style={{padding:'4px 14px',background:B,color:'#fff',border:0,cursor:'pointer',fontSize:11,fontWeight:700}}>APPLY</button>
        </div>
      </div>})}
      {board.length===0&&<div style={{padding:30,textAlign:'center',color:'#888'}}>No published postings yet.</div>}
    </Panel>
  </Grid></Page>
}

'use client'
/** #63 Knowledge Hub */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Inp, Tbl, btnB, btnA, td, Pill, getJson, postJson, B } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({slug:'',title:'',category:'',body:'',tags:'',authorName:'Demo'})
  const [open,setOpen]=useState<any>(null)
  const load=async()=>setRows((await getJson('/api/wave6/articles')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.slug||!form.title||!form.body)return alert('Slug+title+body required');await postJson('/api/wave6/articles',{...form,authorId:'demo'});setForm({...form,slug:'',title:'',body:''});await load()}catch(e:any){alert(e.message)}}
  const publish=async(id:string)=>{try{await postJson(`/api/wave6/articles/${id}/publish`,{});await load()}catch(e:any){alert(e.message)}}
  const view=async(slug:string)=>{const r=await getJson(`/api/wave6/articles/${slug}`);setOpen(r.data);await load()}
  return <Page><Hdr no="#63" band="MEGA-HARVICS" title="Knowledge Hub" sub="Articles + wiki · draft → publish · view-count tracking"/>
  <Grid cols={3}>
    <Panel title="NEW ARTICLE">
      <Inp l="Slug *" v={form.slug} on={v=>setForm({...form,slug:v.toLowerCase().replace(/[^a-z0-9-]/g,'-')})}/>
      <Inp l="Title *" v={form.title} on={v=>setForm({...form,title:v})}/>
      <Inp l="Category" v={form.category} on={v=>setForm({...form,category:v})}/>
      <Inp l="Tags (comma)" v={form.tags} on={v=>setForm({...form,tags:v})}/>
      <label><div style={{fontSize:10,color:B,fontWeight:600}}>Body *</div><textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} rows={6} style={{width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12,fontFamily:'inherit'}}/></label>
      <button onClick={create} style={btnB}>+ SAVE DRAFT</button>
    </Panel>
    <Panel title={open?`READING — ${open.title}`:'READER'}>
      {!open?<div style={{padding:20,color:'#888',textAlign:'center'}}>Pick an article from the list.</div>:<>
        <div style={{fontSize:10,color:'#666'}}>{open.category||'—'} · 👁 {open.views} views · by {open.authorName||'—'}</div>
        <div style={{marginTop:8,padding:8,whiteSpace:'pre-wrap',fontSize:13}}>{open.body}</div>
        {open.tags && <div style={{marginTop:8}}>{open.tags.split(',').map((t:string)=><span key={t} style={{display:'inline-block',padding:'2px 8px',marginRight:4,background:'#F5F0E8',color:B,fontSize:10,fontWeight:700}}>{t.trim()}</span>)}</div>}
      </>}
    </Panel>
    <Panel title={`ARTICLES (${rows.length})`} full>
      <Tbl head={['SLUG','TITLE','CATEGORY','VIEWS','STATUS','ACTIONS']}>
        {rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{r.slug}</b></td><td style={td}>{r.title}</td><td style={td}>{r.category||'—'}</td>
          <td style={td}>{r.views}</td><td style={td}><Pill s={r.status}/></td>
          <td style={td}><button onClick={()=>view(r.slug)} style={btnA}>VIEW</button> {r.status==='Draft'&&<button onClick={()=>publish(r.id)} style={btnA}>PUBLISH</button>}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

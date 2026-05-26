'use client'
/** #59 Communities */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({slug:'',name:'',description:'',visibility:'public'})
  const [join,setJoin]=useState<Record<string,string>>({})
  const load=async()=>setRows((await getJson('/api/wave6/communities')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.slug||!form.name)return alert('Slug+name required');await postJson('/api/wave6/communities',form);setForm({...form,slug:'',name:''});await load()}catch(e:any){alert(e.message)}}
  const doJoin=async(id:string)=>{const uid=join[id];if(!uid)return alert('Need user ID');try{await postJson(`/api/wave6/communities/${id}/join`,{userId:uid});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#59" band="MEGA-HARVICS" title="Groups & Communities" sub="Topic-based communities with members and roles"/>
  <Grid cols={2}>
    <Panel title="NEW COMMUNITY">
      <Inp l="Slug * (a-z, 0-9, -)" v={form.slug} on={v=>setForm({...form,slug:v.toLowerCase().replace(/[^a-z0-9-]/g,'-')})}/>
      <Inp l="Name *" v={form.name} on={v=>setForm({...form,name:v})}/>
      <Inp l="Description" v={form.description} on={v=>setForm({...form,description:v})}/>
      <Sel l="Visibility" v={form.visibility} on={v=>setForm({...form,visibility:v})} opts={['public','private']}/>
      <button onClick={create} style={btnB}>+ CREATE COMMUNITY</button>
    </Panel>
    <Panel title={`COMMUNITIES (${rows.length})`}>
      <Tbl head={['SLUG','NAME','VIS','MEMBERS','JOIN']}>
        {rows.map(c=><tr key={c.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{c.slug}</b></td><td style={td}>{c.name}</td><td style={td}><Pill s={c.visibility==='public'?'Active':'Hold'}/></td>
          <td style={td}>{c.memberCount}</td>
          <td style={td}><input placeholder="user ID" value={join[c.id]||''} onChange={e=>setJoin({...join,[c.id]:e.target.value})} style={{width:80,padding:3,border:'1px solid #6B1F2B55',fontSize:11}}/> <button onClick={()=>doJoin(c.id)} style={btnA}>JOIN</button></td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

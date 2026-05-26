'use client'
/** #58 Social Feed */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Inp, btnB, btnA, getJson, postJson, B, G } from '@/components/os/w5ui'
const ME={userId:'demo-user',name:'Demo User'}
export default function P(){
  const [posts,setPosts]=useState<any[]>([])
  const [body,setBody]=useState('');const [comment,setComment]=useState<Record<string,string>>({})
  const load=async()=>setPosts((await getJson('/api/wave6/feed')).data||[])
  useEffect(()=>{void load()},[])
  const post=async()=>{if(!body.trim())return;try{await postJson('/api/wave6/feed',{authorId:ME.userId,authorName:ME.name,body});setBody('');await load()}catch(e:any){alert(e.message)}}
  const like=async(id:string)=>{try{await postJson(`/api/wave6/feed/${id}/like`,{userId:ME.userId});await load()}catch(e:any){alert(e.message)}}
  const doComment=async(id:string)=>{const c=comment[id];if(!c?.trim())return;try{await postJson(`/api/wave6/feed/${id}/comment`,{authorId:ME.userId,authorName:ME.name,body:c});setComment({...comment,[id]:''});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#58" band="MEGA-HARVICS" title="Social Feed" sub="Internal LinkedIn-style feed · posts, likes, comments"/>
  <div style={{padding:'12px 24px 24px',maxWidth:720,margin:'0 auto'}}>
    <Panel title="WHAT'S ON YOUR MIND?">
      <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Share an update..." style={{width:'100%',padding:8,border:`1px solid ${B}55`,fontSize:13,fontFamily:'inherit'}}/>
      <button onClick={post} style={btnB}>POST</button>
    </Panel>
    <div style={{marginTop:16}}>
      {posts.map(p=><div key={p.id} style={{background:'#fff',border:`1px solid ${B}33`,marginBottom:12,padding:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:B,color:G,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12}}>{p.authorName.slice(0,2).toUpperCase()}</div>
          <div>
            <div style={{fontWeight:700,color:B,fontSize:13}}>{p.authorName}</div>
            <div style={{fontSize:10,color:'#888'}}>{new Date(p.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <div style={{marginTop:8,fontSize:14}}>{p.body}</div>
        <div style={{marginTop:10,display:'flex',gap:12,paddingTop:8,borderTop:`1px solid ${B}22`}}>
          <button onClick={()=>like(p.id)} style={{...btnA,marginTop:0}}>♥ {p.likeCount} LIKE</button>
          <span style={{fontSize:11,color:'#666',alignSelf:'center'}}>💬 {p.commentCount} comments</span>
        </div>
        {p.comments?.length>0 && <div style={{marginTop:8,paddingLeft:12,borderLeft:`2px solid ${G}`}}>
          {p.comments.map((c:any)=><div key={c.id} style={{marginBottom:4}}><b style={{fontSize:11,color:B}}>{c.authorName}:</b> <span style={{fontSize:12}}>{c.body}</span></div>)}
        </div>}
        <div style={{marginTop:8,display:'flex',gap:4}}>
          <input placeholder="Write a comment..." value={comment[p.id]||''} onChange={e=>setComment({...comment,[p.id]:e.target.value})} onKeyDown={e=>e.key==='Enter'&&doComment(p.id)} style={{flex:1,padding:6,border:`1px solid ${B}55`,fontSize:12}}/>
          <button onClick={()=>doComment(p.id)} style={{padding:'4px 12px',background:B,color:'#fff',border:0,cursor:'pointer',fontSize:11}}>SEND</button>
        </div>
      </div>)}
      {posts.length===0&&<div style={{padding:40,textAlign:'center',color:'#888'}}>No posts yet. Be the first!</div>}
    </div>
  </div></Page>
}

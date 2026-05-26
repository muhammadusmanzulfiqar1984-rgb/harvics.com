'use client'
/** #66 Kudos / Recognition */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, td, Pill, getJson, postJson, B, G } from '@/components/os/w5ui'
export default function P(){
  const [feed,setFeed]=useState<any[]>([]);const [board,setBoard]=useState<any[]>([])
  const [form,setForm]=useState({fromUserId:'demo-me',fromName:'Demo Me',toUserId:'',toName:'',category:'Teamwork',message:'',points:10})
  const load=async()=>{setFeed((await getJson('/api/wave6/kudos')).data||[]);setBoard((await getJson('/api/wave6/kudos/leaderboard')).data||[])}
  useEffect(()=>{void load()},[])
  const give=async()=>{try{if(!form.toUserId||!form.toName||!form.message)return alert('To+message required');await postJson('/api/wave6/kudos',form);setForm({...form,toUserId:'',toName:'',message:''});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#66" band="MEGA-HARVICS" title="Recognition & Kudos" sub="Peer recognition · points · live leaderboard"/>
  <Grid cols={3}>
    <Panel title="GIVE KUDOS">
      <Form><Inp l="To user ID *" v={form.toUserId} on={v=>setForm({...form,toUserId:v})}/><Inp l="To name *" v={form.toName} on={v=>setForm({...form,toName:v})}/></Form>
      <Form><Sel l="Category" v={form.category} on={v=>setForm({...form,category:v})} opts={['Teamwork','Innovation','Customer','Excellence','Leadership']}/><Inp l="Points (1-100)" tp="number" v={form.points} on={v=>setForm({...form,points:+v})}/></Form>
      <Inp l="Message *" v={form.message} on={v=>setForm({...form,message:v})}/>
      <button onClick={give} style={btnB}>🏆 GIVE KUDOS</button>
    </Panel>
    <Panel title="LEADERBOARD">
      <Tbl head={['#','NAME','POINTS','KUDOS']}>
        {board.map((b,i)=><tr key={b.userId} style={{borderBottom:'1px solid #6B1F2B11',background:i===0?'#FFF8DC':undefined}}>
          <td style={{...td,fontWeight:700,color:B}}>{i+1}{i===0?' 🥇':i===1?' 🥈':i===2?' 🥉':''}</td>
          <td style={td}>{b.name}</td><td style={{...td,fontWeight:700,color:B}}>{b.total}</td><td style={td}>{b.count}</td>
        </tr>)}
      </Tbl>
    </Panel>
    <Panel title={`RECENT (${feed.length})`} full>
      {feed.map(k=><div key={k.id} style={{padding:10,marginBottom:6,border:`1px solid ${B}22`,background:'#fff',display:'flex',gap:8,alignItems:'flex-start'}}>
        <div style={{width:40,height:40,borderRadius:'50%',background:G,color:B,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:18,flexShrink:0}}>🏆</div>
        <div style={{flex:1}}>
          <div style={{fontSize:12}}><b style={{color:B}}>{k.fromName}</b> → <b style={{color:B}}>{k.toName}</b> <Pill s={k.category==='Innovation'?'Stretch':k.category==='Excellence'?'Promote':'Active'}/> <span style={{fontWeight:700,color:B}}>+{k.points} pts</span></div>
          <div style={{fontSize:12,marginTop:2,fontStyle:'italic',color:'#444'}}>"{k.message}"</div>
          <div style={{fontSize:10,color:'#888',marginTop:2}}>{new Date(k.createdAt).toLocaleString()}</div>
        </div>
      </div>)}
    </Panel>
  </Grid></Page>
}

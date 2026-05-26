'use client'
/** #71 Mobile API Gateway */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson, B, G } from '@/components/os/w5ui'
export default function P(){
  const [tokens,setTokens]=useState<any[]>([]);const [stats,setStats]=useState<any>(null)
  const [form,setForm]=useState({userId:'',deviceId:'',platform:'ios',scopes:'read',expiresInDays:90})
  const load=async()=>{setTokens((await getJson('/api/wave6/mobile-tokens')).data||[]);setStats((await getJson('/api/wave6/mobile-api/stats')).data||{})}
  useEffect(()=>{void load()},[])
  const issue=async()=>{try{if(!form.userId)return alert('User ID required');const r=await postJson('/api/wave6/mobile-tokens',form);alert(`Token: ${r.data.token.slice(0,30)}…`);setForm({...form,userId:''});await load()}catch(e:any){alert(e.message)}}
  const revoke=async(id:string)=>{try{await postJson(`/api/wave6/mobile-tokens/${id}/revoke`,{});await load()}catch(e:any){alert(e.message)}}
  const simulate=async()=>{try{const t=tokens.find(x=>x.active);if(!t)return alert('Issue an active token first');const eps=['/m/users','/m/products','/m/orders','/m/notifications'];for(let i=0;i<8;i++){await postJson('/api/wave6/mobile-api/log',{token:t.token,endpoint:eps[i%4],method:'GET',statusCode:i===5?500:200,latencyMs:80+Math.floor(Math.random()*300)})}await load();alert('Logged 8 simulated calls')}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#71" band="MEGA-HARVICS" title="Mobile API Gateway" sub="Token issuance · call audit · latency stats"/>
  <Grid cols={3}>
    <Panel title="ISSUE TOKEN">
      <Inp l="User ID *" v={form.userId} on={v=>setForm({...form,userId:v})}/>
      <Form><Inp l="Device ID" v={form.deviceId} on={v=>setForm({...form,deviceId:v})}/><Sel l="Platform" v={form.platform} on={v=>setForm({...form,platform:v})} opts={['ios','android','web']}/></Form>
      <Form><Inp l="Scopes" v={form.scopes} on={v=>setForm({...form,scopes:v})}/><Inp l="Expires in days" tp="number" v={form.expiresInDays} on={v=>setForm({...form,expiresInDays:+v})}/></Form>
      <button onClick={issue} style={btnB}>🔑 ISSUE TOKEN</button>
      <button onClick={simulate} style={btnA}>SIMULATE 8 API CALLS</button>
    </Panel>
    <Panel title="GATEWAY STATS">
      {!stats?<div style={{padding:20,color:'#888'}}>Loading...</div>:<>
        <div style={{padding:8,background:'#F5F1E8',marginBottom:8}}>
          <div style={{fontSize:10,color:B,fontWeight:600}}>TOTAL CALLS</div>
          <div style={{fontSize:24,fontWeight:700,color:B}}>{stats.totalCalls?.toLocaleString()||0}</div>
          <div style={{fontSize:11,color:'#666'}}>Avg latency: <b>{stats.avgLatencyMs||0}ms</b></div>
        </div>
        <div style={{fontWeight:700,fontSize:11,color:B,marginTop:8}}>BY ENDPOINT</div>
        <Tbl head={['ENDPOINT','CALLS']}>{(stats.byEndpoint||[]).map((e:any)=><tr key={e.endpoint}><td style={{...td,fontSize:11}}>{e.endpoint}</td><td style={{...td,fontWeight:700,color:B}}>{e.calls}</td></tr>)}</Tbl>
        <div style={{fontWeight:700,fontSize:11,color:B,marginTop:8}}>BY STATUS</div>
        <Tbl head={['CODE','CALLS']}>{(stats.byStatus||[]).map((s:any)=><tr key={s.statusCode}><td style={td}><Pill s={s.statusCode<400?'Active':'Cancelled'}/> {s.statusCode}</td><td style={{...td,fontWeight:700,color:B}}>{s.calls}</td></tr>)}</Tbl>
      </>}
    </Panel>
    <Panel title={`TOKENS (${tokens.length})`}>
      <Tbl head={['USER','PLAT','SCOPES','EXP','LAST USED','ACT']}>
        {tokens.map(t=><tr key={t.id} style={{borderBottom:'1px solid #6B1F2B11',opacity:t.active?1:0.5}}>
          <td style={{...td,fontSize:11}}>{t.userId}</td><td style={td}>{t.platform||'—'}</td><td style={td}>{t.scopes}</td>
          <td style={{...td,fontSize:11}}>{t.expiresAt?new Date(t.expiresAt).toLocaleDateString():'—'}</td>
          <td style={{...td,fontSize:11}}>{t.lastUsedAt?new Date(t.lastUsedAt).toLocaleString():'never'}</td>
          <td style={td}>{t.active?<button onClick={()=>revoke(t.id)} style={btnA}>REVOKE</button>:<Pill s="Cancelled"/>}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

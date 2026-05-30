'use client'
/** #68/69/70 Customer / Supplier / Partner Portals — unified ops view */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, getJson, postJson, B } from '@/components/os/w5ui'
export default function P(){
  const [portalType,setPortalType]=useState('customer')
  const [sessions,setSessions]=useState<any[]>([]);const [actions,setActions]=useState<any[]>([])
  const [form,setForm]=useState({externalId:'',externalName:''})
  const [act,setAct]=useState<Record<string,string>>({})
  const load=async()=>{setSessions((await getJson(`/api/wave6/portal-sessions?portalType=${portalType}`)).data||[]);setActions((await getJson(`/api/wave6/portal-actions?portalType=${portalType}`)).data||[])}
  useEffect(()=>{void load()},[portalType])
  const start=async()=>{try{if(!form.externalId||!form.externalName)return alert('ID+name required');await postJson('/api/wave6/portal-sessions',{portalType,...form});setForm({externalId:'',externalName:''});await load()}catch(e:any){alert(e.message)}}
  const logAction=async(id:string)=>{const a=act[id];if(!a)return alert('Pick action');try{await postJson(`/api/wave6/portal-sessions/${id}/action`,{action:a});setAct({...act,[id]:''});await load()}catch(e:any){alert(e.message)}}
  const ACTIONS=['viewed_invoices','placed_order','raised_ticket','updated_profile','downloaded_report']
  const title=portalType==='customer'?'#68 Customer Portal':portalType==='supplier'?'#69 Supplier Portal':'#70 Partner Portal'
  return <Page><Hdr no={portalType==='customer'?'#68':portalType==='supplier'?'#69':'#70'} band="MEGA-HARVICS" title={title} sub="Self-service session + action ledger for external parties"/>
  <Grid cols={3}>
    <Panel title="PORTAL TYPE">
      <Sel l="Active portal" v={portalType} on={setPortalType} opts={['customer','supplier','partner']}/>
      <div style={{marginTop:10,padding:10,background:'#F5F0E8',borderLeft:`4px solid ${B}`,fontSize:11,color:B}}>Same backend serves all 3 portals (#68 customer / #69 supplier / #70 partner). Switch above to filter.</div>
    </Panel>
    <Panel title="START SESSION">
      <Inp l="External ID *" v={form.externalId} on={v=>setForm({...form,externalId:v})}/>
      <Inp l="External name *" v={form.externalName} on={v=>setForm({...form,externalName:v})}/>
      <button onClick={start} style={btnB}>+ START SESSION</button>
    </Panel>
    <Panel title={`SESSIONS — ${portalType.toUpperCase()} (${sessions.length})`}>
      <Tbl head={['EXT','LOGIN','ACTIONS','LAST','LOG']}>
        {sessions.map(s=><tr key={s.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={{...td,fontSize:11}}><b>{s.externalId}</b><br/>{s.externalName}</td>
          <td style={{...td,fontSize:11}}>{new Date(s.loginAt).toLocaleString()}</td>
          <td style={{...td,fontWeight:700,color:B}}>{s.actionsCount}</td>
          <td style={{...td,fontSize:11}}>{s.lastActionAt?new Date(s.lastActionAt).toLocaleTimeString():'—'}</td>
          <td style={td}><select value={act[s.id]||''} onChange={e=>setAct({...act,[s.id]:e.target.value})} style={{padding:3,fontSize:10,border:'1px solid #6B1F2B55'}}><option value="">--</option>{ACTIONS.map(a=><option key={a}>{a}</option>)}</select> <button onClick={()=>logAction(s.id)} style={btnA}>LOG</button></td>
        </tr>)}
      </Tbl>
    </Panel>
    <Panel title="RECENT ACTIONS" full>
      <Tbl head={['WHEN','EXTERNAL','ACTION']}>
        {actions.map(a=><tr key={a.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={{...td,fontSize:11}}>{new Date(a.createdAt).toLocaleString()}</td>
          <td style={td}>{a.externalId}</td>
          <td style={{...td,fontWeight:700,color:B}}>{a.action}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

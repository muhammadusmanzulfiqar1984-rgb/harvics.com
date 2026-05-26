'use client'
/** #67 Referrals */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({referrerId:'demo-me',referrerName:'Demo Me',refereeEmail:'',refereeName:'',rewardAmount:50,rewardCurrency:'USD'})
  const load=async()=>setRows((await getJson('/api/wave6/referrals')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.refereeEmail)return alert('Email required');await postJson('/api/wave6/referrals',form);setForm({...form,refereeEmail:'',refereeName:''});await load()}catch(e:any){alert(e.message)}}
  const setStatus=async(code:string,status:string)=>{try{await postJson(`/api/wave6/referrals/${code}/status`,{status});await load()}catch(e:any){alert(e.message)}}
  const totalPaid=rows.filter(r=>r.status==='Paid').reduce((s,r)=>s+r.rewardAmount,0)
  const totalPending=rows.filter(r=>['Signed','Qualified'].includes(r.status)).reduce((s,r)=>s+r.rewardAmount,0)
  return <Page><Hdr no="#67" band="MEGA-HARVICS" title="Referral Program" sub={`Total paid: $${totalPaid.toLocaleString()} · Earned & owed: $${totalPending.toLocaleString()}`}/>
  <Grid cols={2}>
    <Panel title="REFER SOMEONE">
      <Form><Inp l="Referee email *" v={form.refereeEmail} on={v=>setForm({...form,refereeEmail:v})}/><Inp l="Referee name" v={form.refereeName} on={v=>setForm({...form,refereeName:v})}/></Form>
      <Form><Inp l="Reward amount" tp="number" v={form.rewardAmount} on={v=>setForm({...form,rewardAmount:+v})}/><Inp l="Currency" v={form.rewardCurrency} on={v=>setForm({...form,rewardCurrency:v})}/></Form>
      <button onClick={create} style={btnB}>🎁 SEND REFERRAL</button>
    </Panel>
    <Panel title="ALL REFERRALS" full>
      <Tbl head={['CODE','REFERRER','REFEREE','REWARD','STATUS','TIMELINE']}>
        {rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{r.referralCode}</b></td><td style={td}>{r.referrerName}</td><td style={{...td,fontSize:11}}>{r.refereeEmail}</td>
          <td style={{...td,fontWeight:700,color:'#6B1F2B'}}>{r.rewardCurrency} {r.rewardAmount}</td>
          <td style={td}><Pill s={r.status}/></td>
          <td style={td}>
            {r.status==='Pending'&&<button onClick={()=>setStatus(r.referralCode,'Signed')} style={btnA}>SIGNED?</button>}
            {r.status==='Signed'&&<button onClick={()=>setStatus(r.referralCode,'Qualified')} style={btnA}>QUALIFY</button>}
            {r.status==='Qualified'&&<button onClick={()=>setStatus(r.referralCode,'Paid')} style={btnA}>MARK PAID</button>}
            {r.status==='Paid'&&'✓ paid'}
          </td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

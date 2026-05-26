'use client'
/** #56 HPay Wallet */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([]);const [txns,setTxns]=useState<any[]>([]);const [selected,setSelected]=useState<string>('')
  const [form,setForm]=useState({ownerType:'user',ownerId:'',currency:'USD'})
  const [topup,setTopup]=useState({amount:0,reference:''})
  const [xfer,setXfer]=useState({toWalletId:'',amount:0,reference:''})
  const load=async()=>setRows((await getJson('/api/wave6/wallets')).data||[])
  useEffect(()=>{void load()},[])
  useEffect(()=>{if(selected)getJson(`/api/wave6/wallets/${selected}/txns`).then(r=>setTxns(r.data||[]))},[selected])
  const create=async()=>{try{if(!form.ownerId)return alert('Owner ID required');await postJson('/api/wave6/wallets',form);setForm({...form,ownerId:''});await load()}catch(e:any){alert(e.message)}}
  const doTopup=async()=>{if(!selected)return alert('Pick a wallet');try{await postJson(`/api/wave6/wallets/${selected}/topup`,topup);setTopup({amount:0,reference:''});await load();const r=await getJson(`/api/wave6/wallets/${selected}/txns`);setTxns(r.data||[])}catch(e:any){alert(e.message)}}
  const doXfer=async()=>{if(!selected)return alert('Pick a wallet');try{await postJson(`/api/wave6/wallets/${selected}/transfer`,xfer);setXfer({toWalletId:'',amount:0,reference:''});await load();const r=await getJson(`/api/wave6/wallets/${selected}/txns`);setTxns(r.data||[])}catch(e:any){alert(e.message)}}
  const sel=rows.find(w=>w.id===selected)
  return <Page><Hdr no="#56" band="MEGA-HARVICS" title="HPay Wallet" sub="Wallet ledger · top-up · transfer with currency-matched balance"/>
  <Grid cols={3}>
    <Panel title="NEW WALLET">
      <Sel l="Owner type" v={form.ownerType} on={v=>setForm({...form,ownerType:v})} opts={['user','tenant','customer','supplier']}/>
      <Inp l="Owner ID *" v={form.ownerId} on={v=>setForm({...form,ownerId:v})}/>
      <Inp l="Currency" v={form.currency} on={v=>setForm({...form,currency:v})}/>
      <button onClick={create} style={btnB}>+ OPEN WALLET</button>
    </Panel>
    <Panel title={sel?`TOP-UP / TRANSFER — ${sel.ownerType}/${sel.ownerId.slice(-8)}`:'TOP-UP / TRANSFER'}>
      {!sel?<div style={{padding:20,color:'#888',textAlign:'center'}}>Pick a wallet from the list →</div>:<>
        <div style={{padding:8,background:'#F5F1E8',borderLeft:'4px solid #C3A35E',marginBottom:8}}>
          <div style={{fontSize:10,color:'#6B1F2B',fontWeight:600}}>BALANCE</div>
          <div style={{fontSize:24,fontWeight:700,color:'#6B1F2B'}}>{sel.currency} {sel.balance.toLocaleString()}</div>
        </div>
        <div style={{fontWeight:700,color:'#6B1F2B',fontSize:11}}>TOP UP</div>
        <Form><Inp l="Amount" tp="number" v={topup.amount} on={v=>setTopup({...topup,amount:+v})}/><Inp l="Reference" v={topup.reference} on={v=>setTopup({...topup,reference:v})}/></Form>
        <button onClick={doTopup} style={btnA}>+ TOP UP</button>
        <div style={{fontWeight:700,color:'#6B1F2B',fontSize:11,marginTop:8}}>TRANSFER</div>
        <Inp l="To wallet ID" v={xfer.toWalletId} on={v=>setXfer({...xfer,toWalletId:v})}/>
        <Form><Inp l="Amount" tp="number" v={xfer.amount} on={v=>setXfer({...xfer,amount:+v})}/><Inp l="Reference" v={xfer.reference} on={v=>setXfer({...xfer,reference:v})}/></Form>
        <button onClick={doXfer} style={btnA}>SEND</button>
      </>}
    </Panel>
    <Panel title={`WALLETS (${rows.length})`}>
      <Tbl head={['OWNER','CCY','BALANCE','STATUS','PICK']}>
        {rows.map(w=><tr key={w.id} style={{background:selected===w.id?'#F5F1E8':undefined,borderBottom:'1px solid #6B1F2B11'}}>
          <td style={{...td,fontSize:11}}><b>{w.ownerType}</b>/{w.ownerId.slice(-8)}</td>
          <td style={td}>{w.currency}</td><td style={{...td,fontWeight:700,color:'#6B1F2B'}}>{w.balance.toLocaleString()}</td>
          <td style={td}><Pill s={w.status}/></td>
          <td style={td}><button onClick={()=>setSelected(w.id)} style={btnA}>{selected===w.id?'✓':'PICK'}</button></td>
        </tr>)}
      </Tbl>
    </Panel>
    {sel && <Panel title="TRANSACTION HISTORY" full>
      <Tbl head={['WHEN','TYPE','AMOUNT','BAL AFTER','REF','COUNTERPARTY']}>
        {txns.map(t=><tr key={t.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={{...td,fontSize:11}}>{new Date(t.createdAt).toLocaleString()}</td>
          <td style={td}><Pill s={t.type==='topup'||t.type==='transfer_in'?'Posted':'Posted'}/> {t.type}</td>
          <td style={{...td,fontWeight:700,color:t.amount>=0?'#2E7D32':'#B71C1C'}}>{t.amount>=0?'+':''}{t.amount} {t.currency}</td>
          <td style={td}>{t.balanceAfter}</td>
          <td style={{...td,fontSize:11}}>{t.reference||'—'}</td>
          <td style={{...td,fontSize:11}}>{t.counterparty?t.counterparty.slice(-8):'—'}</td>
        </tr>)}
      </Tbl>
    </Panel>}
  </Grid></Page>
}

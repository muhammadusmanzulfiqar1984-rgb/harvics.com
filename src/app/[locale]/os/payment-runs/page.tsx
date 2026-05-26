'use client'
/** #6 HPay Payments — payment runs */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [runs,setRuns]=useState<any[]>([])
  const [form,setForm]=useState({runNo:`PR-${Date.now().toString().slice(-6)}`,description:'',currency:'USD'})
  const [items,setItems]=useState<any[]>([{payeeName:'',amount:0,invoiceRef:''}])
  const load=async()=>setRuns((await getJson('/api/wave5/payment-runs')).data||[])
  useEffect(()=>{void load()},[])
  const addLine=()=>setItems([...items,{payeeName:'',amount:0,invoiceRef:''}])
  const create=async()=>{try{const valid=items.filter(i=>i.payeeName&&i.amount>0);if(valid.length===0)return alert('Add at least one line');await postJson('/api/wave5/payment-runs',{...form,items:valid});setForm({...form,runNo:`PR-${Date.now().toString().slice(-6)}`,description:''});setItems([{payeeName:'',amount:0,invoiceRef:''}]);await load()}catch(e:any){alert(e.message)}}
  const release=async(id:string)=>{try{await postJson(`/api/wave5/payment-runs/${id}/release`,{});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#6" band="FINANCE" title="HPay Payments" sub="Outbound payment runs · draft → approve → release"/>
  <Grid cols={3}>
    <Panel title="NEW PAYMENT RUN">
      <Form><Inp l="Run No *" v={form.runNo} on={v=>setForm({...form,runNo:v})}/><Inp l="Currency" v={form.currency} on={v=>setForm({...form,currency:v})}/></Form>
      <Inp l="Description" v={form.description} on={v=>setForm({...form,description:v})}/>
      <div style={{marginTop:8,fontWeight:700,color:'#6B1F2B',fontSize:11}}>LINE ITEMS</div>
      {items.map((it,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:4,marginTop:4}}>
        <input placeholder="Payee" value={it.payeeName} onChange={e=>{const n=[...items];n[i].payeeName=e.target.value;setItems(n)}} style={{padding:6,border:'1px solid #6B1F2B55',fontSize:12}}/>
        <input type="number" placeholder="Amount" value={it.amount} onChange={e=>{const n=[...items];n[i].amount=+e.target.value;setItems(n)}} style={{padding:6,border:'1px solid #6B1F2B55',fontSize:12}}/>
        <input placeholder="Invoice ref" value={it.invoiceRef} onChange={e=>{const n=[...items];n[i].invoiceRef=e.target.value;setItems(n)}} style={{padding:6,border:'1px solid #6B1F2B55',fontSize:12}}/>
      </div>)}
      <button onClick={addLine} style={btnA}>+ ADD LINE</button>
      <button onClick={create} style={btnB}>CREATE DRAFT</button>
    </Panel>
    <Panel title="ALL RUNS" full>
      <Tbl head={['RUN','DESC','ITEMS','TOTAL','STATUS','ACTION']}>
        {runs.map(r=><tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{r.runNo}</b></td><td style={td}>{r.description||'—'}</td><td style={td}>{r.itemCount}</td>
          <td style={{...td,fontWeight:700,color:'#6B1F2B'}}>{r.currency} {r.totalAmount.toLocaleString()}</td>
          <td style={td}><Pill s={r.status}/></td>
          <td style={td}>{r.status==='Draft'&&<button onClick={()=>release(r.id)} style={btnA}>RELEASE</button>}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

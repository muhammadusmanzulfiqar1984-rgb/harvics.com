'use client'
/** #9 CPQ — quotes */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Tbl, btnB, btnA, td, Pill, getJson, postJson } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({quoteNo:`Q-${Date.now().toString().slice(-6)}`,customerName:'',currency:'USD',discount:0,validUntil:'',notes:''})
  const [lines,setLines]=useState<any[]>([{sku:'',description:'',qty:1,unitPrice:0,discount:0}])
  const load=async()=>setRows((await getJson('/api/wave5/quotes')).data||[])
  useEffect(()=>{void load()},[])
  const addLine=()=>setLines([...lines,{sku:'',description:'',qty:1,unitPrice:0,discount:0}])
  const create=async()=>{try{const valid=lines.filter(l=>l.sku&&l.qty>0);if(valid.length===0)return alert('Need lines');await postJson('/api/wave5/quotes',{...form,lines:valid,validUntil:form.validUntil||null});setForm({...form,quoteNo:`Q-${Date.now().toString().slice(-6)}`,customerName:''});setLines([{sku:'',description:'',qty:1,unitPrice:0,discount:0}]);await load()}catch(e:any){alert(e.message)}}
  const setStatus=async(id:string,status:string)=>{try{await postJson(`/api/wave5/quotes/${id}/status`,{status});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#9" band="COMMERCIAL & SALES" title="CPQ Engine" sub="Configure → Price → Quote with line-level discounts"/>
  <Grid cols={3}>
    <Panel title="NEW QUOTE">
      <Form><Inp l="Quote No *" v={form.quoteNo} on={v=>setForm({...form,quoteNo:v})}/><Inp l="Customer *" v={form.customerName} on={v=>setForm({...form,customerName:v})}/><Inp l="Currency" v={form.currency} on={v=>setForm({...form,currency:v})}/><Inp l="Header disc %" tp="number" v={form.discount} on={v=>setForm({...form,discount:+v})}/></Form>
      <Inp l="Valid until" tp="date" v={form.validUntil} on={v=>setForm({...form,validUntil:v})}/>
      <div style={{marginTop:8,fontWeight:700,color:'#6B1F2B',fontSize:11}}>LINES</div>
      {lines.map((l,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'1fr 2fr 60px 80px 60px',gap:4,marginTop:4}}>
        <input placeholder="SKU" value={l.sku} onChange={e=>{const n=[...lines];n[i].sku=e.target.value;setLines(n)}} style={inp}/>
        <input placeholder="Description" value={l.description} onChange={e=>{const n=[...lines];n[i].description=e.target.value;setLines(n)}} style={inp}/>
        <input type="number" placeholder="Qty" value={l.qty} onChange={e=>{const n=[...lines];n[i].qty=+e.target.value;setLines(n)}} style={inp}/>
        <input type="number" placeholder="Price" value={l.unitPrice} onChange={e=>{const n=[...lines];n[i].unitPrice=+e.target.value;setLines(n)}} style={inp}/>
        <input type="number" placeholder="Disc%" value={l.discount} onChange={e=>{const n=[...lines];n[i].discount=+e.target.value;setLines(n)}} style={inp}/>
      </div>)}
      <button onClick={addLine} style={btnA}>+ LINE</button>
      <button onClick={create} style={btnB}>CREATE QUOTE</button>
    </Panel>
    <Panel title="ALL QUOTES" full>
      <Tbl head={['QUOTE','CUSTOMER','LINES','SUBTOTAL','TOTAL','STATUS','ACTIONS']}>
        {rows.map(r=><tr key={r.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={td}><b>{r.quoteNo}</b></td><td style={td}>{r.customerName}</td><td style={td}>{r.lines.length}</td>
          <td style={td}>{r.currency} {r.subtotal.toLocaleString()}</td>
          <td style={{...td,fontWeight:700,color:'#6B1F2B'}}>{r.currency} {r.total.toLocaleString()}</td>
          <td style={td}><Pill s={r.status}/></td>
          <td style={td}>{r.status==='Draft'&&<button onClick={()=>setStatus(r.id,'Sent')} style={btnA}>SEND</button>} {r.status==='Sent'&&<><button onClick={()=>setStatus(r.id,'Accepted')} style={btnA}>ACCEPT</button> <button onClick={()=>setStatus(r.id,'Rejected')} style={btnA}>REJECT</button></>}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}
const inp:React.CSSProperties={padding:6,border:'1px solid #6B1F2B55',fontSize:12}

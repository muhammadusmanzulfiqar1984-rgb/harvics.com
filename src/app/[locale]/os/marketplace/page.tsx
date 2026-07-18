'use client'
/** #60 Marketplace */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Tbl, btnB, btnA, td, Pill, getJson, postJson, B, G } from '@/components/os/w5ui'
export default function P(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({sellerId:'demo-seller',sellerName:'Demo Seller',title:'',description:'',category:'',price:0,currency:'USD',qtyAvailable:1})
  const [buy,setBuy]=useState<Record<string,number>>({})
  const load=async()=>setRows((await getJson('/api/wave6/listings')).data||[])
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!form.title||form.price<=0)return alert('Title+price required');await postJson('/api/wave6/listings',form);setForm({...form,title:'',description:''});await load()}catch(e:any){alert(e.message)}}
  const purchase=async(id:string)=>{const qty=buy[id]||1;try{const r=await postJson(`/api/wave6/listings/${id}/purchase`,{qty,buyerId:'demo-buyer'});alert(`Purchased ${qty} for $${r.totalCharged}`);await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#60" band="MEGA-HARVICS" title="Marketplace" sub="Peer-to-peer listings with stock tracking and auto-sold-out"/>
  <Grid cols={3}>
    <Panel title="NEW LISTING">
      <Inp l="Title *" v={form.title} on={v=>setForm({...form,title:v})}/>
      <Inp l="Description" v={form.description} on={v=>setForm({...form,description:v})}/>
      <Inp l="Category" v={form.category} on={v=>setForm({...form,category:v})}/>
      <Form><Inp l="Price *" tp="number" v={form.price} on={v=>setForm({...form,price:+v})}/><Inp l="Currency" v={form.currency} on={v=>setForm({...form,currency:v})}/></Form>
      <Inp l="Qty available" tp="number" v={form.qtyAvailable} on={v=>setForm({...form,qtyAvailable:+v})}/>
      <button onClick={create} style={btnB}>+ LIST FOR SALE</button>
    </Panel>
    <Panel title={`LISTINGS (${rows.length})`} full>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
        {rows.map(l=><div key={l.id} style={{border:`1px solid ${B}33`,padding:10,background:'#fff'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{fontWeight:700,color:B,fontSize:13}}>{l.title}</div>
            <Pill s={l.status}/>
          </div>
          <div style={{fontSize:11,color:'#666',marginTop:2}}>{l.category||'Uncategorised'} · by {l.sellerName}</div>
          {l.description && <div style={{fontSize:11,marginTop:6,color:'#444'}}>{l.description}</div>}
          <div style={{marginTop:8,padding:6,background:'var(--harvics-cream)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontSize:18,fontWeight:700,color:B}}>{l.currency} {l.price}</div><div style={{fontSize:10,color:'#666'}}>{l.qtyAvailable} avail</div></div>
            {l.status==='Active'&&<div style={{display:'flex',gap:2}}>
              <input type="number" defaultValue={1} min={1} max={l.qtyAvailable} onChange={e=>setBuy({...buy,[l.id]:+e.target.value})} style={{width:40,padding:3,border:`1px solid ${B}55`,fontSize:11}}/>
              <button onClick={()=>purchase(l.id)} style={{padding:'4px 10px',background:G,color:B,border:0,cursor:'pointer',fontSize:11,fontWeight:700}}>BUY</button>
            </div>}
          </div>
        </div>)}
      </div>
    </Panel>
  </Grid></Page>
}

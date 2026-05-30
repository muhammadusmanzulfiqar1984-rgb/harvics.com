'use client'
/** #61 Trade Floor */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, td, Pill, getJson, postJson, B, G } from '@/components/os/w5ui'
export default function P(){
  const [insts,setInsts]=useState<any[]>([]);const [book,setBook]=useState<any>(null);const [trades,setTrades]=useState<any[]>([])
  const [pick,setPick]=useState('')
  const [newInst,setNewInst]=useState({symbol:'',name:'',category:'Commodity',lastPrice:100})
  const [order,setOrder]=useState({traderId:'',side:'buy',price:0,qty:1})
  const load=async()=>{const r=await getJson('/api/wave7/instruments');setInsts(r.data||[]);if(!pick&&r.data?.[0])setPick(r.data[0].symbol);setTrades((await getJson(`/api/wave7/trades${pick?'?symbol='+pick:''}`)).data||[])}
  useEffect(()=>{void load()},[])
  useEffect(()=>{if(pick)getJson(`/api/wave7/instruments/${pick}/orderbook`).then(setBook);else setBook(null)},[pick,trades.length])
  const create=async()=>{try{if(!newInst.symbol||!newInst.name)return alert('Symbol+name required');await postJson('/api/wave7/instruments',newInst);setNewInst({...newInst,symbol:'',name:''});await load()}catch(e:any){alert(e.message)}}
  const place=async()=>{if(!pick)return alert('Pick instrument');try{const r=await postJson('/api/wave7/orders',{...order,symbol:pick});alert(r.message);await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#61" band="UNIVERSE" title="Trade Floor" sub="Bid/ask order book · price-time matching engine"/>
  <Grid cols={3}>
    <Panel title="NEW INSTRUMENT">
      <Form><Inp l="Symbol *" v={newInst.symbol} on={v=>setNewInst({...newInst,symbol:v.toUpperCase()})}/><Sel l="Category" v={newInst.category} on={v=>setNewInst({...newInst,category:v})} opts={['Commodity','Equity','FX','Crypto']}/></Form>
      <Inp l="Name *" v={newInst.name} on={v=>setNewInst({...newInst,name:v})}/>
      <Inp l="Last price" tp="number" v={newInst.lastPrice} on={v=>setNewInst({...newInst,lastPrice:+v})}/>
      <button onClick={create} style={btnB}>+ LIST INSTRUMENT</button>
    </Panel>
    <Panel title="PLACE ORDER">
      <Sel l="Instrument" v={pick} on={setPick} opts={['',...insts.map(i=>i.symbol)]}/>
      <Form><Inp l="Trader ID *" v={order.traderId} on={v=>setOrder({...order,traderId:v})}/><Sel l="Side" v={order.side} on={v=>setOrder({...order,side:v})} opts={['buy','sell']}/></Form>
      <Form><Inp l="Price" tp="number" v={order.price} on={v=>setOrder({...order,price:+v})}/><Inp l="Qty" tp="number" v={order.qty} on={v=>setOrder({...order,qty:+v})}/></Form>
      <button onClick={place} style={btnB}>{order.side==='buy'?'🟢 BID':'🔴 ASK'}</button>
    </Panel>
    <Panel title={`ORDER BOOK — ${pick||'—'}`}>
      {!book?<div style={{padding:20,color:'#888',textAlign:'center'}}>Pick instrument →</div>:<>
        <div style={{padding:6,background:'#F5F0E8',marginBottom:6,fontSize:11,color:B,fontWeight:600}}>Last: <b style={{fontSize:14}}>${book.instrument?.lastPrice}</b> · Spread: {book.spread!==null?`$${book.spread}`:'—'}</div>
        <div style={{fontSize:10,color:'#B71C1C',fontWeight:700}}>ASKS (sell)</div>
        <Tbl head={['PRICE','QTY']}>{(book.asks||[]).slice(0,5).reverse().map((o:any)=><tr key={o.id}><td style={{...td,color:'#B71C1C',fontWeight:700}}>${o.price}</td><td style={td}>{o.qty}</td></tr>)}</Tbl>
        <div style={{fontSize:10,color:'#2E7D32',fontWeight:700,marginTop:6}}>BIDS (buy)</div>
        <Tbl head={['PRICE','QTY']}>{(book.bids||[]).slice(0,5).map((o:any)=><tr key={o.id}><td style={{...td,color:'#2E7D32',fontWeight:700}}>${o.price}</td><td style={td}>{o.qty}</td></tr>)}</Tbl>
      </>}
    </Panel>
    <Panel title={`RECENT TRADES (${trades.length})`} full>
      <Tbl head={['WHEN','SYMBOL','PRICE','QTY','BUYER','SELLER']}>
        {trades.map(t=><tr key={t.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={{...td,fontSize:11}}>{new Date(t.createdAt).toLocaleTimeString()}</td>
          <td style={td}><b>{t.instrument?.symbol}</b></td>
          <td style={{...td,fontWeight:700,color:B}}>${t.price}</td>
          <td style={td}>{t.qty}</td>
          <td style={{...td,fontSize:11,color:'#2E7D32'}}>{t.buyerId}</td>
          <td style={{...td,fontSize:11,color:'#B71C1C'}}>{t.sellerId}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}

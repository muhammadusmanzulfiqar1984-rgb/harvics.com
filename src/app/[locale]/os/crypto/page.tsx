'use client'
/** #65 Crypto Lite */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Form, Inp, Sel, Tbl, btnB, td, Pill, getJson, postJson, B } from '@/components/os/w5ui'
const ME='demo-trader'
export default function P(){
  const [assets,setAssets]=useState<any[]>([]);const [portfolio,setPortfolio]=useState<any>(null)
  const [newA,setNewA]=useState({symbol:'',name:'',priceUsd:0,change24h:0})
  const [trade,setTrade]=useState({symbol:'',side:'buy',qty:0})
  const load=async()=>{setAssets((await getJson('/api/wave7/crypto/assets')).data||[]);setPortfolio(await getJson(`/api/wave7/crypto/portfolio/${ME}`))}
  useEffect(()=>{void load()},[])
  const create=async()=>{try{if(!newA.symbol||!newA.name||newA.priceUsd<=0)return alert('All fields required');await postJson('/api/wave7/crypto/assets',newA);setNewA({...newA,symbol:'',name:''});await load()}catch(e:any){alert(e.message)}}
  const exec=async()=>{if(!trade.symbol||trade.qty<=0)return alert('Pick asset + qty');try{const r=await postJson('/api/wave7/crypto/trade',{...trade,userId:ME});if(r.realisedPnl!==null&&r.realisedPnl!==undefined)alert(`SELL executed · realised P&L: $${r.realisedPnl}`);else alert(`BUY executed · holding: ${r.holding.qty} @ avg $${r.holding.avgCostUsd}`);await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#65" band="UNIVERSE" title="Crypto Lite" sub={`Sandbox · ${ME} portfolio: $${portfolio?.totalValue||0} (P&L: $${portfolio?.totalPnl||0})`}/>
  <Grid cols={3}>
    <Panel title="LIST NEW ASSET">
      <Form><Inp l="Symbol *" v={newA.symbol} on={v=>setNewA({...newA,symbol:v.toUpperCase()})}/><Inp l="Name *" v={newA.name} on={v=>setNewA({...newA,name:v})}/></Form>
      <Form><Inp l="Price USD *" tp="number" v={newA.priceUsd} on={v=>setNewA({...newA,priceUsd:+v})}/><Inp l="24h change %" tp="number" v={newA.change24h} on={v=>setNewA({...newA,change24h:+v})}/></Form>
      <button onClick={create} style={btnB}>+ LIST ASSET</button>
    </Panel>
    <Panel title="EXECUTE TRADE">
      <Sel l="Asset" v={trade.symbol} on={v=>setTrade({...trade,symbol:v})} opts={['',...assets.map(a=>a.symbol)]}/>
      <Form><Sel l="Side" v={trade.side} on={v=>setTrade({...trade,side:v})} opts={['buy','sell']}/><Inp l="Qty" tp="number" v={trade.qty} on={v=>setTrade({...trade,qty:+v})}/></Form>
      {trade.symbol&&<div style={{padding:6,background:'var(--harvics-cream)',fontSize:11,color:B,marginTop:6}}>Est. cost: <b>${(assets.find(a=>a.symbol===trade.symbol)?.priceUsd*trade.qty||0).toFixed(2)}</b></div>}
      <button onClick={exec} style={btnB}>{trade.side==='buy'?'🟢 BUY':'🔴 SELL'}</button>
    </Panel>
    <Panel title="MARKET">
      <Tbl head={['SYM','NAME','PRICE','24H']}>
        {assets.map(a=><tr key={a.id} style={{borderBottom:'1px solid #3D121211'}}>
          <td style={td}><b>{a.symbol}</b></td><td style={{...td,fontSize:11}}>{a.name}</td>
          <td style={{...td,fontWeight:700,color:B}}>${a.priceUsd.toLocaleString()}</td>
          <td style={{...td,fontWeight:700,color:a.change24h>0?'#2E7D32':a.change24h<0?'#B71C1C':'#666'}}>{a.change24h>0?'+':''}{a.change24h}%</td>
        </tr>)}
      </Tbl>
    </Panel>
    <Panel title="MY PORTFOLIO" full>
      {!portfolio||(portfolio.data?.length||0)===0?<div style={{padding:30,textAlign:'center',color:'#888'}}>No holdings yet. Buy something! 🪙</div>:<>
        <div style={{padding:8,background:'var(--harvics-cream)',marginBottom:8,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          <div><div style={{fontSize:10,color:B,fontWeight:600}}>VALUE</div><div style={{fontSize:18,fontWeight:700,color:B}}>${portfolio.totalValue.toLocaleString()}</div></div>
          <div><div style={{fontSize:10,color:B,fontWeight:600}}>COST</div><div style={{fontSize:18,fontWeight:700}}>${portfolio.totalCost.toLocaleString()}</div></div>
          <div><div style={{fontSize:10,color:B,fontWeight:600}}>UNREAL P&L</div><div style={{fontSize:18,fontWeight:700,color:portfolio.totalPnl>=0?'#2E7D32':'#B71C1C'}}>${portfolio.totalPnl.toLocaleString()}</div></div>
        </div>
        <Tbl head={['SYM','QTY','AVG COST','MKT PRICE','VALUE','UNREAL P&L']}>
          {portfolio.data.map((h:any)=><tr key={h.symbol} style={{borderBottom:'1px solid #3D121211'}}>
            <td style={td}><b>{h.symbol}</b></td>
            <td style={td}>{h.qty}</td>
            <td style={td}>${h.avgCostUsd}</td>
            <td style={td}>${h.currentPriceUsd}</td>
            <td style={{...td,fontWeight:700,color:B}}>${h.value.toLocaleString()}</td>
            <td style={{...td,fontWeight:700,color:h.unrealisedPnl>=0?'#2E7D32':'#B71C1C'}}>{h.unrealisedPnl>=0?'+':''}${h.unrealisedPnl.toLocaleString()}</td>
          </tr>)}
        </Tbl>
      </>}
    </Panel>
  </Grid></Page>
}

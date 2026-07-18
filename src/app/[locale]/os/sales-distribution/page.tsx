'use client'
/** #10 Sales & Distribution — Channels + Routing + Delivery slots */
import { useEffect, useState } from 'react'
const B='var(--harvics-burgundy)'; const G='var(--harvics-gold)'; const C='var(--harvics-cream)'
const TYPES=['direct','distributor','online','retail','wholesale'] as const
interface Ch{id:string;code:string;name:string;type:string;priority:number;leadTimeDays:number;active:boolean}
interface Slot{id:string;orderId:string|null;channelCode:string;scheduledFor:string;windowStart:string|null;windowEnd:string|null;status:string;driver:string|null}
export default function SDPage(){
  const [chs,setChs]=useState<Ch[]>([]);const [slots,setSlots]=useState<Slot[]>([])
  const [chForm,setChForm]=useState({code:'',name:'',type:'direct',priority:50,leadTimeDays:1})
  const [route,setRoute]=useState({customerType:'direct',requestedBy:''})
  const [picked,setPicked]=useState<any>(null)
  const [slotForm,setSlotForm]=useState({orderId:'',channelCode:'',scheduledFor:'',windowStart:'09:00',windowEnd:'12:00',driver:''})
  const load=async()=>{setChs((await(await fetch('/api/wave4/channels',{cache:'no-store'})).json()).data||[]);setSlots((await(await fetch('/api/wave4/delivery-slots',{cache:'no-store'})).json()).data||[])}
  useEffect(()=>{void load()},[])
  const addCh=async()=>{if(!chForm.code||!chForm.name)return alert('Code+name required');const r=await(await fetch('/api/wave4/channels',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(chForm)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setChForm({...chForm,code:'',name:''});await load()}
  const doRoute=async()=>{const body:any={customerType:route.customerType};if(route.requestedBy)body.requestedBy=route.requestedBy;const r=await(await fetch('/api/wave4/route-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})).json();if(!r.success)return alert(r.error);setPicked(r)}
  const addSlot=async()=>{if(!slotForm.channelCode||!slotForm.scheduledFor)return alert('Channel+date required');const r=await(await fetch('/api/wave4/delivery-slots',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(slotForm)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setSlotForm({...slotForm,orderId:'',scheduledFor:''});await load()}
  return(<div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
    <Hdr no="#10" band="COMMERCIAL & SALES" title="Sales & Distribution" sub="Channels · priority-based order routing · delivery slot booking"/>
    <div style={{padding:'12px 24px 24px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
      <Panel title="CHANNELS">
        <Form>
          <Inp l="Code *" v={chForm.code} on={v=>setChForm({...chForm,code:v})}/>
          <Inp l="Name *" v={chForm.name} on={v=>setChForm({...chForm,name:v})}/>
          <label><div style={{fontSize:10,color:B,fontWeight:600}}>Type</div><select value={chForm.type} onChange={e=>setChForm({...chForm,type:e.target.value})} style={inp}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></label>
          <Inp l="Priority (0-100)" tp="number" v={String(chForm.priority)} on={v=>setChForm({...chForm,priority:+v})}/>
          <Inp l="Lead time (days)" tp="number" v={String(chForm.leadTimeDays)} on={v=>setChForm({...chForm,leadTimeDays:+v})}/>
        </Form>
        <button onClick={addCh} style={btnB}>+ ADD CHANNEL</button>
        <Tbl head={['CODE','NAME','TYPE','PRI','LT']}>{chs.map(c=><tr key={c.id} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{c.code}</td><td style={td}>{c.name}</td><td style={td}>{c.type}</td><td style={td}>{c.priority}</td><td style={td}>{c.leadTimeDays}d</td></tr>)}</Tbl>
      </Panel>
      <Panel title="ROUTE ORDER">
        <Form>
          <label><div style={{fontSize:10,color:B,fontWeight:600}}>Customer type</div><select value={route.customerType} onChange={e=>setRoute({...route,customerType:e.target.value})} style={inp}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></label>
          <Inp l="Requested by (date)" tp="date" v={route.requestedBy} on={v=>setRoute({...route,requestedBy:v})}/>
        </Form>
        <button onClick={doRoute} style={btnB}>ROUTE</button>
        {picked && (picked.data?(
          <div style={{padding:10,background:C,borderLeft:`4px solid ${G}`,marginTop:8}}>
            <div style={{fontSize:12,color:'#666',fontWeight:600}}>PICKED CHANNEL</div>
            <div style={{fontSize:18,fontWeight:700,color:B}}>{picked.data.picked.name}</div>
            <div style={{fontSize:12}}>{picked.data.picked.type} · priority {picked.data.picked.priority} · LT {picked.data.picked.leadTimeDays}d</div>
            {picked.data.alternatives?.length>0 && <div style={{fontSize:11,marginTop:6,color:'#666'}}>Alternatives: {picked.data.alternatives.map((a:any)=>a.code).join(', ')}</div>}
          </div>
        ):(
          <div style={{padding:10,background:'#FFF3E0',borderLeft:`4px solid #E65100`,marginTop:8}}>
            <div style={{fontWeight:700,color:'#E65100'}}>NO CHANNEL AVAILABLE</div>
            <div style={{fontSize:12}}>{picked.reason}</div>
          </div>
        ))}
      </Panel>
      <Panel title="DELIVERY SLOTS">
        <Form>
          <Inp l="Order ID" v={slotForm.orderId} on={v=>setSlotForm({...slotForm,orderId:v})}/>
          <Inp l="Channel *" v={slotForm.channelCode} on={v=>setSlotForm({...slotForm,channelCode:v})}/>
          <Inp l="Date *" tp="date" v={slotForm.scheduledFor} on={v=>setSlotForm({...slotForm,scheduledFor:v})}/>
          <Inp l="Driver" v={slotForm.driver} on={v=>setSlotForm({...slotForm,driver:v})}/>
          <Inp l="From" v={slotForm.windowStart} on={v=>setSlotForm({...slotForm,windowStart:v})}/>
          <Inp l="To" v={slotForm.windowEnd} on={v=>setSlotForm({...slotForm,windowEnd:v})}/>
        </Form>
        <button onClick={addSlot} style={btnB}>+ BOOK SLOT</button>
        <Tbl head={['ORD','CH','WHEN','WINDOW','DRIVER','S']}>{slots.map(s=><tr key={s.id} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{s.orderId||'—'}</td><td style={td}>{s.channelCode}</td><td style={td}>{new Date(s.scheduledFor).toLocaleDateString()}</td><td style={td}>{s.windowStart||'—'}-{s.windowEnd||'—'}</td><td style={td}>{s.driver||'—'}</td><td style={td}>{s.status}</td></tr>)}</Tbl>
      </Panel>
    </div>
  </div>)
}
const inp:React.CSSProperties={width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}
const td:React.CSSProperties={padding:6,fontSize:12}
const btnB:React.CSSProperties={padding:'6px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer',marginTop:6,marginBottom:8}
function Hdr({no,band,title,sub}:any){return <div style={{background:B,color:C,padding:'20px 32px',borderBottom:`4px solid ${G}`}}><div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE {no} · {band}</div><h1 style={{margin:'6px 0 0',fontSize:26,fontFamily:'Georgia,serif'}}>{title}</h1><div style={{fontSize:12,opacity:.8,marginTop:4}}>{sub}</div></div>}
function Panel({title,children}:any){return <div style={{background:'#fff',border:`1px solid ${B}33`}}><div style={{background:B,color:C,padding:'8px 12px',fontWeight:700,fontSize:12}}>{title}</div><div style={{padding:10}}>{children}</div></div>}
function Form({children}:any){return <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>{children}</div>}
function Inp({l,v,on,tp='text'}:{l:string;v:string;on:(v:string)=>void;tp?:string}){return <label><div style={{fontSize:10,color:B,fontWeight:600}}>{l}</div><input type={tp} value={v} onChange={e=>on(e.target.value)} style={{width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}}/></label>}
function Tbl({head,children}:any){return <div style={{marginTop:8,maxHeight:380,overflowY:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr style={{background:B,color:C,position:'sticky',top:0}}>{head.map((h:string)=><th key={h} style={{padding:6,textAlign:'left',fontSize:11}}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}

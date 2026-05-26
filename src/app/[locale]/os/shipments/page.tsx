'use client'
/** HARVICS OS — Shipments + Tracking (Module #26) */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
const SS:Record<string,string>={Booked:'#666',InTransit:'#1565C0',Delivered:'#2E7D32',Exception:'#B71C1C'}
interface Ev{id:string;location:string;status:string;description:string|null;eventTime:string}
interface Ship{id:string;trackingNo:string;origin:string;destination:string;carrier:string|null;service:string|null;status:string;bookedAt:string;estimatedEta:string|null;actualDelivery:string|null;events:Ev[]}
export default function ShipPage(){
  const [rows,setRows]=useState<Ship[]>([])
  const [showCreate,setShowCreate]=useState(false)
  const [form,setForm]=useState({trackingNo:'',origin:'',destination:'',carrier:'',service:'air',weightKg:0,estimatedEta:''})
  const [evFor,setEvFor]=useState<string|null>(null)
  const [ev,setEv]=useState({location:'',status:'In transit',description:''})
  const load=async()=>{const r=await fetch('/api/wave3/shipping/shipments',{cache:'no-store'});setRows((await r.json()).data||[])}
  useEffect(()=>{void load()},[])
  const create=async()=>{
    if(!form.trackingNo||!form.origin||!form.destination)return alert('Tracking + origin + dest required')
    const r=await fetch('/api/wave3/shipping/shipments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,estimatedEta:form.estimatedEta||null})})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error));setShowCreate(false);await load()
  }
  const addEv=async(id:string)=>{
    if(!ev.location||!ev.status)return alert('Location + status required')
    const r=await fetch(`/api/wave3/shipping/shipments/${id}/events`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ev)})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error));setEvFor(null);setEv({location:'',status:'In transit',description:''});await load()
  }
  return(
    <div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
      <div style={{background:B,color:C,padding:'24px 32px',borderBottom:`4px solid ${G}`}}>
        <div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE #26 · LOGISTICS &amp; TRADE</div>
        <h1 style={{margin:'6px 0 0',fontSize:28,fontFamily:'Georgia,serif'}}>Shipments &amp; Tracking</h1>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>Book shipments · record tracking events · auto-advance status</div>
      </div>
      <div style={{padding:'16px 24px'}}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{padding:'8px 20px',background:B,color:C,border:`2px solid ${G}`,fontWeight:600,cursor:'pointer',marginRight:8}}>+ BOOK SHIPMENT</button>
        <button onClick={load} style={{padding:'8px 20px',background:'transparent',color:B,border:`2px solid ${B}`,fontWeight:600,cursor:'pointer'}}>REFRESH</button>
      </div>
      {showCreate && (
        <div style={{margin:'0 24px 16px',background:'#fff',padding:16,border:`1px solid ${B}33`}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            <F l="Tracking no *"><input value={form.trackingNo} onChange={e=>setForm({...form,trackingNo:e.target.value})} style={inp}/></F>
            <F l="Origin *"><input value={form.origin} onChange={e=>setForm({...form,origin:e.target.value})} style={inp}/></F>
            <F l="Destination *"><input value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})} style={inp}/></F>
            <F l="Carrier"><input value={form.carrier} onChange={e=>setForm({...form,carrier:e.target.value})} style={inp}/></F>
            <F l="Service"><select value={form.service} onChange={e=>setForm({...form,service:e.target.value})} style={inp}><option>air</option><option>sea</option><option>road</option><option>rail</option></select></F>
            <F l="Weight (kg)"><input type="number" value={form.weightKg} onChange={e=>setForm({...form,weightKg:+e.target.value})} style={inp}/></F>
            <F l="Estimated ETA"><input type="date" value={form.estimatedEta} onChange={e=>setForm({...form,estimatedEta:e.target.value})} style={inp}/></F>
          </div>
          <button onClick={create} style={{marginTop:8,padding:'8px 20px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer'}}>BOOK</button>
        </div>
      )}
      <div style={{padding:'0 24px 24px',display:'grid',gap:12}}>
        {rows.length===0?<div style={{padding:32,color:'#888'}}>No shipments yet.</div>:rows.map(s=>(
          <div key={s.id} style={{background:'#fff',border:`1px solid ${B}33`,borderLeft:`6px solid ${SS[s.status]}`}}>
            <div style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:10,borderBottom:`1px solid ${B}11`}}>
              <span style={{fontFamily:'monospace',fontWeight:700,color:B}}>{s.trackingNo}</span>
              <span style={{flex:1}}>{s.origin} → {s.destination}</span>
              <span style={{color:'#666',fontSize:12}}>{s.carrier||'—'} · {s.service||'—'}</span>
              <span style={{fontSize:11,background:SS[s.status],color:'#fff',padding:'2px 8px',fontWeight:700}}>{s.status.toUpperCase()}</span>
              <button onClick={()=>setEvFor(evFor===s.id?null:s.id)} style={ab(G)}>+ EVENT</button>
            </div>
            {evFor===s.id && (
              <div style={{padding:12,background:C,borderBottom:`1px solid ${B}11`,display:'grid',gridTemplateColumns:'2fr 1fr 2fr auto',gap:8,alignItems:'end'}}>
                <F l="Location *"><input value={ev.location} onChange={e=>setEv({...ev,location:e.target.value})} style={inp}/></F>
                <F l="Status *"><input value={ev.status} onChange={e=>setEv({...ev,status:e.target.value})} placeholder="In transit / Delivered / Exception" style={inp}/></F>
                <F l="Description"><input value={ev.description} onChange={e=>setEv({...ev,description:e.target.value})} style={inp}/></F>
                <button onClick={()=>addEv(s.id)} style={{background:B,color:C,border:0,padding:'8px 14px',fontWeight:700,cursor:'pointer'}}>ADD</button>
              </div>
            )}
            <div style={{padding:'8px 14px'}}>
              {s.events.length===0?<div style={{color:'#888',fontSize:12}}>No tracking events.</div>:s.events.map(e=>(
                <div key={e.id} style={{padding:'4px 0',borderBottom:`1px solid ${B}11`,fontSize:12,display:'flex',gap:8}}>
                  <span style={{color:'#666',minWidth:140,fontFamily:'monospace',fontSize:11}}>{new Date(e.eventTime).toLocaleString()}</span>
                  <span style={{fontWeight:700,color:B,minWidth:120}}>{e.location}</span>
                  <span style={{minWidth:140}}>{e.status}</span>
                  <span style={{color:'#666'}}>{e.description||''}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
const inp:React.CSSProperties={width:'100%',padding:8,border:`1px solid ${B}55`,background:'#fff'}
const ab=(c:string):React.CSSProperties=>({padding:'3px 10px',background:'transparent',color:c,border:`1px solid ${c}`,cursor:'pointer',fontSize:11,fontWeight:600})
function F({l,children}:{l:string;children:React.ReactNode}){return <label><div style={{fontSize:11,color:B,fontWeight:600,marginBottom:4}}>{l}</div>{children}</label>}

'use client'
/** #25 Fleet Management — vehicles + route-optimized trips */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
const SS:Record<string,string>={Planned:'#666',Active:'#1565C0',Completed:'#2E7D32',Cancelled:'#B71C1C'}
interface Veh{id:string;plate:string;type:string;capacityKg:number;driver:string|null;status:string;homeDepot:string|null}
interface Trip{id:string;vehicleId:string;driver:string|null;stops:any;distanceKm:number;optimizedKm:number;savingsKm:number;status:string;startedAt:string|null;completedAt:string|null}
export default function FleetPage(){
  const [vehs,setVehs]=useState<Veh[]>([]);const [trips,setTrips]=useState<Trip[]>([])
  const [vForm,setVForm]=useState({plate:'',type:'van',capacityKg:1000,homeDepot:'',driver:'',fuelType:'diesel'})
  const [tForm,setTForm]=useState({vehicleId:'',driver:'',optimize:true,stopsText:''})
  const [last,setLast]=useState<any>(null)
  const load=async()=>{setVehs((await(await fetch('/api/wave4/vehicles',{cache:'no-store'})).json()).data||[]);setTrips((await(await fetch('/api/wave4/trips',{cache:'no-store'})).json()).data||[])}
  useEffect(()=>{void load()},[])
  const addV=async()=>{if(!vForm.plate)return alert('Plate required');const r=await(await fetch('/api/wave4/vehicles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(vForm)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setVForm({...vForm,plate:''});await load()}
  const plan=async()=>{
    if(!tForm.vehicleId)return alert('Vehicle required')
    const lines=tForm.stopsText.split('\n').map(l=>l.trim()).filter(Boolean)
    if(lines.length<2)return alert('Need at least 2 stops, format per line: "label,lat,lng" e.g. "Depot,25.276,55.296"')
    const stops=lines.map((line,i)=>{const[address,lat,lng]=line.split(',').map(s=>s.trim());return{seq:i+1,address,lat:+lat,lng:+lng}})
    if(stops.some(s=>!s.address||isNaN(s.lat)||isNaN(s.lng)))return alert('Bad format. Use: "address,lat,lng" per line')
    const r=await(await fetch('/api/wave4/trips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vehicleId:tForm.vehicleId,driver:tForm.driver||null,stops,optimize:tForm.optimize})})).json()
    if(!r.success)return alert(JSON.stringify(r.issues||r.error))
    setLast(r);await load()
  }
  const tripAct=async(id:string,act:'start'|'complete')=>{await fetch(`/api/wave4/trips/${id}/${act}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});await load()}
  return(<div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
    <Hdr no="#25" band="LOGISTICS & TRADE" title="Fleet Management" sub="Vehicles · trips with nearest-neighbour route optimization"/>
    <div style={{padding:'12px 24px 24px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <Panel title="VEHICLES">
        <Form>
          <Inp l="Plate *" v={vForm.plate} on={v=>setVForm({...vForm,plate:v})}/>
          <label><div style={{fontSize:10,color:B,fontWeight:600}}>Type</div><select value={vForm.type} onChange={e=>setVForm({...vForm,type:e.target.value})} style={inp}>{['van','truck','car','reefer'].map(t=><option key={t}>{t}</option>)}</select></label>
          <Inp l="Capacity (kg)" tp="number" v={String(vForm.capacityKg)} on={v=>setVForm({...vForm,capacityKg:+v})}/>
          <Inp l="Home depot" v={vForm.homeDepot} on={v=>setVForm({...vForm,homeDepot:v})}/>
          <Inp l="Driver" v={vForm.driver} on={v=>setVForm({...vForm,driver:v})}/>
          <Inp l="Fuel" v={vForm.fuelType} on={v=>setVForm({...vForm,fuelType:v})}/>
        </Form>
        <button onClick={addV} style={btnB}>+ ADD VEHICLE</button>
        <Tbl head={['PLATE','TYPE','CAP','DRIVER','STATUS']}>{vehs.map(v=><tr key={v.id} style={{borderBottom:`1px solid ${B}11`,cursor:'pointer',background:tForm.vehicleId===v.id?C:'#fff'}} onClick={()=>setTForm({...tForm,vehicleId:v.id,driver:v.driver||''})}><td style={td}>{v.plate}</td><td style={td}>{v.type}</td><td style={td}>{v.capacityKg}kg</td><td style={td}>{v.driver||'—'}</td><td style={td}>{v.status}</td></tr>)}</Tbl>
      </Panel>
      <Panel title="PLAN TRIP">
        <Form>
          <Inp l="Vehicle ID (click row left) *" v={tForm.vehicleId} on={v=>setTForm({...tForm,vehicleId:v})}/>
          <Inp l="Driver" v={tForm.driver} on={v=>setTForm({...tForm,driver:v})}/>
        </Form>
        <label style={{display:'block',marginTop:6}}><div style={{fontSize:10,color:B,fontWeight:600}}>Stops (one per line: address, lat, lng)</div>
          <textarea value={tForm.stopsText} onChange={e=>setTForm({...tForm,stopsText:e.target.value})} rows={6} placeholder={`Depot, 25.276, 55.296\nCustomer A, 25.197, 55.274\nCustomer B, 25.246, 55.351\nDepot, 25.276, 55.296`} style={{...inp,fontFamily:'monospace'}}/>
        </label>
        <label style={{marginTop:6,display:'block'}}><input type="checkbox" checked={tForm.optimize} onChange={e=>setTForm({...tForm,optimize:e.target.checked})}/> <span style={{fontSize:12,color:B}}>Optimize route (nearest-neighbour)</span></label>
        <button onClick={plan} style={btnB}>PLAN TRIP</button>
        {last?.optimization && <div style={{marginTop:8,padding:10,background:C,borderLeft:`4px solid ${G}`,fontSize:12,color:B}}>
          Naive: <b>{last.optimization.naiveKm} km</b> · Optimized: <b>{last.optimization.optimizedKm} km</b> · Savings: <b style={{color:'#2E7D32'}}>{last.optimization.savingsKm} km ({last.optimization.percentSaved}%)</b>
        </div>}
      </Panel>
      <div style={{gridColumn:'span 2'}}>
        <Panel title="ALL TRIPS">
          <Tbl head={['VEH','DRIVER','STOPS','NAIVE','OPT','SAV','STATUS','ACT']}>{trips.map(t=><tr key={t.id} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{vehs.find(v=>v.id===t.vehicleId)?.plate||t.vehicleId.slice(-6)}</td><td style={td}>{t.driver||'—'}</td><td style={td}>{Array.isArray(t.stops)?t.stops.length:0}</td><td style={td}>{t.distanceKm} km</td><td style={td}>{t.optimizedKm} km</td><td style={{...td,color:'#2E7D32',fontWeight:700}}>{t.savingsKm} km</td><td style={td}><span style={{background:SS[t.status],color:'#fff',padding:'1px 6px',fontSize:10,fontWeight:700}}>{t.status.toUpperCase()}</span></td><td style={td}>{t.status==='Planned' && <button onClick={()=>tripAct(t.id,'start')} style={ab('#1565C0')}>START</button>}{t.status==='Active' && <button onClick={()=>tripAct(t.id,'complete')} style={ab('#2E7D32')}>COMPLETE</button>}</td></tr>)}</Tbl>
        </Panel>
      </div>
    </div>
  </div>)
}
const inp:React.CSSProperties={width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}
const td:React.CSSProperties={padding:6,fontSize:12}
const btnB:React.CSSProperties={padding:'6px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer',marginTop:6,marginBottom:8}
const ab=(c:string):React.CSSProperties=>({padding:'2px 8px',background:'transparent',color:c,border:`1px solid ${c}`,cursor:'pointer',fontSize:10,fontWeight:700})
function Hdr({no,band,title,sub}:any){return <div style={{background:B,color:C,padding:'20px 32px',borderBottom:`4px solid ${G}`}}><div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE {no} · {band}</div><h1 style={{margin:'6px 0 0',fontSize:26,fontFamily:'Georgia,serif'}}>{title}</h1><div style={{fontSize:12,opacity:.8,marginTop:4}}>{sub}</div></div>}
function Panel({title,children}:any){return <div style={{background:'#fff',border:`1px solid ${B}33`}}><div style={{background:B,color:C,padding:'8px 12px',fontWeight:700,fontSize:12}}>{title}</div><div style={{padding:10}}>{children}</div></div>}
function Form({children}:any){return <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>{children}</div>}
function Inp({l,v,on,tp='text'}:{l:string;v:string;on:(v:string)=>void;tp?:string}){return <label><div style={{fontSize:10,color:B,fontWeight:600}}>{l}</div><input type={tp} value={v} onChange={e=>on(e.target.value)} style={{width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}}/></label>}
function Tbl({head,children}:any){return <div style={{marginTop:8,maxHeight:380,overflowY:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr style={{background:B,color:C,position:'sticky',top:0}}>{head.map((h:string)=><th key={h} style={{padding:6,textAlign:'left',fontSize:11}}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}

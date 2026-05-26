'use client'
/** #23 Warehouse Management — bins + putaway */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Form, Inp, Tbl } from '../controlling/page'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
interface Bin{id:string;code:string;zone:string|null;capacity:number;occupied:number;active:boolean;aisle:string|null;rack:string|null;level:string|null}
interface WH{id:string;code:string;name:string;type:string;bins:Bin[]}
export default function WHPage(){
  const [whs,setWhs]=useState<WH[]>([])
  const [sel,setSel]=useState<WH|null>(null)
  const [form,setForm]=useState({code:'',name:'',location:'',type:'DC'})
  const [bin,setBin]=useState({code:'',aisle:'',rack:'',level:'',zone:'pick',capacityUom:'EA',capacity:100})
  const [pa,setPa]=useState({sku:'',qty:1,strategy:'least-full',preferZone:'pick',movedBy:''})
  const [suggest,setSuggest]=useState<any>(null)
  const load=async()=>{setWhs((await(await fetch('/api/wave4/warehouses',{cache:'no-store'})).json()).data||[])}
  useEffect(()=>{void load()},[])
  const create=async()=>{if(!form.code||!form.name)return alert('Code+name required');const r=await(await fetch('/api/wave4/warehouses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setForm({...form,code:'',name:''});await load()}
  const addBin=async()=>{if(!sel)return;if(!bin.code)return alert('Bin code required');const r=await(await fetch(`/api/wave4/warehouses/${sel.id}/bins`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(bin)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setBin({...bin,code:''});await load();const fresh=(await(await fetch('/api/wave4/warehouses',{cache:'no-store'})).json()).data;setSel(fresh.find((x:WH)=>x.id===sel.id)||null)}
  const doSuggest=async()=>{if(!sel||!pa.sku)return alert('Select WH + SKU');const r=await(await fetch('/api/wave4/putaway/suggest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...pa,warehouseId:sel.id})})).json();if(!r.success)return alert(r.error);setSuggest(r)}
  const execMove=async(binId:string)=>{const r=await(await fetch('/api/wave4/putaway/execute',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku:pa.sku,qty:pa.qty,toBinId:binId,strategy:pa.strategy,movedBy:pa.movedBy})})).json();if(!r.success)return alert(r.error);setSuggest(null);await load();const fresh=(await(await fetch('/api/wave4/warehouses',{cache:'no-store'})).json()).data;setSel(fresh.find((x:WH)=>x.id===sel?.id)||null);alert('Moved.')}
  return(<div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
    <Hdr no="#23" band="INVENTORY & WAREHOUSE" title="Warehouse Management" sub="Warehouses · bin grid · putaway strategies"/>
    <div style={{padding:'12px 24px 24px',display:'grid',gridTemplateColumns:'1fr 2fr',gap:16}}>
      <Panel title="WAREHOUSES">
        <Form><Inp l="Code *" v={form.code} on={v=>setForm({...form,code:v})}/><Inp l="Name *" v={form.name} on={v=>setForm({...form,name:v})}/><Inp l="Location" v={form.location} on={v=>setForm({...form,location:v})}/><label><div style={{fontSize:10,color:B,fontWeight:600}}>Type</div><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={inp}>{['DC','Store','Cold','Bonded'].map(t=><option key={t}>{t}</option>)}</select></label></Form>
        <button onClick={create} style={btnB}>+ NEW WAREHOUSE</button>
        <Tbl head={['CODE','NAME','TYPE','#BINS']}>{whs.map(w=><tr key={w.id} onClick={()=>{setSel(w);setSuggest(null)}} style={{borderBottom:`1px solid ${B}11`,cursor:'pointer',background:sel?.id===w.id?C:'#fff'}}><td style={td}>{w.code}</td><td style={td}>{w.name}</td><td style={td}>{w.type}</td><td style={td}>{w.bins.length}</td></tr>)}</Tbl>
      </Panel>
      <Panel title={sel?`${sel.code} — ${sel.name}`:'Select a warehouse'}>
        {!sel?<div style={{padding:24,color:'#888',textAlign:'center'}}>Pick a warehouse to add bins</div>:(<>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr) auto',gap:6,alignItems:'end'}}>
            <Inp l="Bin code *" v={bin.code} on={v=>setBin({...bin,code:v})}/>
            <Inp l="Aisle" v={bin.aisle} on={v=>setBin({...bin,aisle:v})}/>
            <Inp l="Rack" v={bin.rack} on={v=>setBin({...bin,rack:v})}/>
            <Inp l="Level" v={bin.level} on={v=>setBin({...bin,level:v})}/>
            <label><div style={{fontSize:10,color:B,fontWeight:600}}>Zone</div><select value={bin.zone} onChange={e=>setBin({...bin,zone:e.target.value})} style={inp}>{['pick','reserve','bulk','cold'].map(z=><option key={z}>{z}</option>)}</select></label>
            <Inp l="UoM" v={bin.capacityUom} on={v=>setBin({...bin,capacityUom:v})}/>
            <Inp l="Capacity" tp="number" v={String(bin.capacity)} on={v=>setBin({...bin,capacity:+v})}/>
            <button onClick={addBin} style={{padding:'8px 12px',background:B,color:C,border:0,fontWeight:700,cursor:'pointer'}}>+</button>
          </div>
          <Tbl head={['BIN','ZONE','A/R/L','CAP','OCC','FILL%']}>{sel.bins.map(b=>{const f=b.capacity?Math.round(b.occupied/b.capacity*100):0;return <tr key={b.id} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{b.code}</td><td style={td}>{b.zone||'—'}</td><td style={td}>{b.aisle||'-'}/{b.rack||'-'}/{b.level||'-'}</td><td style={td}>{b.capacity}</td><td style={td}>{b.occupied}</td><td style={{...td,color:f>80?'#B71C1C':f>50?'#B8860B':'#2E7D32',fontWeight:700}}>{f}%</td></tr>})}</Tbl>
          <div style={{marginTop:16,padding:10,background:C,borderLeft:`4px solid ${G}`}}>
            <div style={{fontWeight:700,color:B,marginBottom:6}}>PUTAWAY SUGGEST</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr) auto',gap:6,alignItems:'end'}}>
              <Inp l="SKU *" v={pa.sku} on={v=>setPa({...pa,sku:v})}/>
              <Inp l="Qty *" tp="number" v={String(pa.qty)} on={v=>setPa({...pa,qty:+v})}/>
              <label><div style={{fontSize:10,color:B,fontWeight:600}}>Strategy</div><select value={pa.strategy} onChange={e=>setPa({...pa,strategy:e.target.value})} style={inp}>{['least-full','nearest-pick','zone-match'].map(s=><option key={s}>{s}</option>)}</select></label>
              <label><div style={{fontSize:10,color:B,fontWeight:600}}>Prefer zone</div><select value={pa.preferZone} onChange={e=>setPa({...pa,preferZone:e.target.value})} style={inp}>{['pick','reserve','bulk','cold'].map(z=><option key={z}>{z}</option>)}</select></label>
              <Inp l="Moved by" v={pa.movedBy} on={v=>setPa({...pa,movedBy:v})}/>
              <button onClick={doSuggest} style={{padding:'8px 12px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer'}}>SUGGEST</button>
            </div>
            {suggest && (suggest.data?<div style={{marginTop:8,padding:10,background:'#fff',border:`1px solid ${B}33`}}>
              <div style={{fontWeight:700,color:B}}>→ Recommended bin: <span style={{fontFamily:'monospace'}}>{suggest.data.code}</span> (zone: {suggest.data.zone}, free: {suggest.data.capacity-suggest.data.occupied})</div>
              <button onClick={()=>execMove(suggest.data.id)} style={{marginTop:6,padding:'6px 14px',background:B,color:C,border:0,fontWeight:700,cursor:'pointer'}}>EXECUTE MOVE</button>
              {suggest.alternatives?.length>0 && <div style={{marginTop:6,fontSize:11,color:'#666'}}>Alternatives: {suggest.alternatives.map((a:any)=>a.code).join(', ')}</div>}
            </div>:<div style={{marginTop:8,color:'#B71C1C',fontWeight:700}}>{suggest.reason}</div>)}
          </div>
        </>)}
      </Panel>
    </div>
  </div>)
}
const inp:React.CSSProperties={width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}
const td:React.CSSProperties={padding:6,fontSize:12}
const btnB:React.CSSProperties={padding:'6px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer',marginTop:6,marginBottom:8}

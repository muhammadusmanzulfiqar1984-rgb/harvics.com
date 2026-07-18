'use client'
/** HARVICS OS — Cycle Count + ABC Analysis (Module #22) */
import { useEffect, useState } from 'react'
const B='var(--harvics-burgundy)'; const G='var(--harvics-gold)'; const C='var(--harvics-cream)'
const CAT:Record<string,string>={A:'#2E7D32',B:'#B8860B',C:'#666'}
interface Count{id:string;sku:string;warehouseId:string|null;systemQty:number;countedQty:number;variance:number;countedBy:string|null;status:string;countedAt:string}
interface Abc{sku:string;name:string;qty:number;price:number;value:number;cumPct:number;category:'A'|'B'|'C'}
export default function CyclePage(){
  const [counts,setCounts]=useState<Count[]>([])
  const [abc,setAbc]=useState<Abc[]>([])
  const [absum,setAbsum]=useState<any>({A:0,B:0,C:0,totalValue:0})
  const [showCreate,setShowCreate]=useState(false)
  const [form,setForm]=useState({sku:'',warehouseId:'',systemQty:0,countedQty:0,countedBy:''})
  const load=async()=>{
    const c=await fetch('/api/wave3/inventory/cycle-counts',{cache:'no-store'});setCounts((await c.json()).data||[])
    const a=await fetch('/api/wave3/inventory/abc-analysis',{cache:'no-store'});const aj=await a.json();setAbc(aj.data||[]);setAbsum(aj.summary||{})
  }
  useEffect(()=>{void load()},[])
  const create=async()=>{
    if(!form.sku)return alert('SKU required')
    const r=await fetch('/api/wave3/inventory/cycle-counts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error));setShowCreate(false);await load()
  }
  const confirm=async(id:string)=>{await fetch(`/api/wave3/inventory/cycle-counts/${id}/confirm`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});await load()}
  return(
    <div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
      <div style={{background:B,color:C,padding:'24px 32px',borderBottom:`4px solid ${G}`}}>
        <div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE #22 · INVENTORY &amp; WAREHOUSE</div>
        <h1 style={{margin:'6px 0 0',fontSize:28,fontFamily:'Georgia,serif'}}>Cycle Count &amp; ABC Analysis</h1>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>Variance tracking + Pareto-based inventory classification</div>
      </div>
      <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
        <K l="A items (top 70% value)" v={absum.A} c='#2E7D32'/>
        <K l="B items (70-90%)" v={absum.B} c='#B8860B'/>
        <K l="C items (90-100%)" v={absum.C} c='#666'/>
        <K l="Total Inventory $" v={`$${(absum.totalValue||0).toLocaleString()}`} c={B}/>
      </div>
      <div style={{padding:'0 24px 24px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{background:'#fff',border:`1px solid ${B}33`}}>
          <div style={{background:B,color:C,padding:'10px 12px',display:'flex',gap:8,alignItems:'center'}}>
            <span style={{flex:1,fontWeight:700,fontSize:13}}>CYCLE COUNTS</span>
            <button onClick={()=>setShowCreate(s=>!s)} style={{background:G,color:B,border:0,padding:'4px 12px',fontWeight:700,cursor:'pointer'}}>+ COUNT</button>
          </div>
          {showCreate && (
            <div style={{padding:12,background:C,borderBottom:`1px solid ${B}33`,display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
              <F l="SKU *"><input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} style={inp}/></F>
              <F l="Warehouse"><input value={form.warehouseId} onChange={e=>setForm({...form,warehouseId:e.target.value})} style={inp}/></F>
              <F l="System qty"><input type="number" value={form.systemQty} onChange={e=>setForm({...form,systemQty:+e.target.value})} style={inp}/></F>
              <F l="Counted qty *"><input type="number" value={form.countedQty} onChange={e=>setForm({...form,countedQty:+e.target.value})} style={inp}/></F>
              <F l="Counted by"><input value={form.countedBy} onChange={e=>setForm({...form,countedBy:e.target.value})} style={inp}/></F>
              <div style={{alignSelf:'end'}}><button onClick={create} style={{padding:'8px 14px',background:B,color:C,border:0,fontWeight:700,cursor:'pointer'}}>SAVE</button></div>
            </div>
          )}
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr style={{background:B,color:C,textAlign:'left'}}>{['SKU','SYS','COUNTED','VAR','STATUS','ACT'].map(h=><th key={h} style={{padding:6}}>{h}</th>)}</tr></thead>
            <tbody>
              {counts.length===0?<tr><td colSpan={6} style={{padding:24,color:'#888',textAlign:'center'}}>No counts yet.</td></tr>:counts.map((c,i)=>(
                <tr key={c.id} style={{background:i%2?C:'#fff',borderBottom:`1px solid ${B}11`}}>
                  <td style={{padding:6,fontFamily:'monospace',fontWeight:600,color:B}}>{c.sku}</td>
                  <td style={{padding:6}}>{c.systemQty}</td>
                  <td style={{padding:6}}>{c.countedQty}</td>
                  <td style={{padding:6,color:c.variance===0?'#2E7D32':c.variance>0?'#1565C0':'#B71C1C',fontWeight:700}}>{c.variance>0?'+':''}{c.variance}</td>
                  <td style={{padding:6}}><span style={{background:c.status==='Confirmed'?'#2E7D32':'#666',color:'#fff',padding:'1px 6px',fontSize:10,fontWeight:700}}>{c.status.toUpperCase()}</span></td>
                  <td style={{padding:6}}>{c.status==='Pending' && <button onClick={()=>confirm(c.id)} style={ab('#2E7D32')}>CONFIRM</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{background:'#fff',border:`1px solid ${B}33`}}>
          <div style={{background:B,color:C,padding:'10px 12px',fontWeight:700,fontSize:13}}>ABC ANALYSIS (sorted by value)</div>
          <div style={{maxHeight:500,overflowY:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead><tr style={{background:B,color:C,textAlign:'left',position:'sticky',top:0}}>{['SKU','NAME','QTY','PRICE','VALUE','CUM%','CAT'].map(h=><th key={h} style={{padding:6}}>{h}</th>)}</tr></thead>
              <tbody>
                {abc.length===0?<tr><td colSpan={7} style={{padding:24,color:'#888',textAlign:'center'}}>No items in inventory yet.</td></tr>:abc.map((r,i)=>(
                  <tr key={r.sku} style={{background:i%2?C:'#fff',borderBottom:`1px solid ${B}11`}}>
                    <td style={{padding:6,fontFamily:'monospace'}}>{r.sku}</td>
                    <td style={{padding:6}}>{r.name}</td>
                    <td style={{padding:6}}>{r.qty}</td>
                    <td style={{padding:6}}>${r.price.toFixed(2)}</td>
                    <td style={{padding:6,fontFamily:'monospace',fontWeight:700}}>${r.value.toLocaleString()}</td>
                    <td style={{padding:6}}>{r.cumPct}%</td>
                    <td style={{padding:6}}><span style={{background:CAT[r.category],color:'#fff',padding:'1px 8px',fontSize:11,fontWeight:700}}>{r.category}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
const inp:React.CSSProperties={width:'100%',padding:8,border:`1px solid ${B}55`,background:'#fff'}
const ab=(c:string):React.CSSProperties=>({padding:'3px 10px',background:'transparent',color:c,border:`1px solid ${c}`,cursor:'pointer',fontSize:11,fontWeight:600})
function K({l,v,c}:{l:string;v:any;c:string}){return <div style={{background:'#fff',padding:16,borderTop:`4px solid ${c}`,border:`1px solid ${B}22`}}><div style={{fontSize:11,color:'#666',fontWeight:600}}>{l.toUpperCase()}</div><div style={{fontSize:22,fontWeight:700,color:B,marginTop:6}}>{v}</div></div>}
function F({l,children}:{l:string;children:React.ReactNode}){return <label><div style={{fontSize:11,color:B,fontWeight:600,marginBottom:4}}>{l}</div>{children}</label>}

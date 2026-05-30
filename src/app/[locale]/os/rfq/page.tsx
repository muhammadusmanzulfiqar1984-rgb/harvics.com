'use client'
/** HARVICS OS — RFQ Workflow (Module #13) */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F0E8'
const SS:Record<string,string>={Draft:'#666',Open:'#1565C0',Closed:'#B8860B',Awarded:'#2E7D32',Cancelled:'#8B0000'}
interface Resp{id:string;vendorId:string;vendorName:string|null;amount:number;currency:string;leadTimeDays:number|null;status:string;notes:string|null}
interface RFQ{id:string;rfqNo:string;title:string;status:string;category:string|null;dueDate:string|null;awardedTo:string|null;responses:Resp[]}
export default function RfqPage(){
  const [rows,setRows]=useState<RFQ[]>([])
  const [showCreate,setShowCreate]=useState(false)
  const [form,setForm]=useState({rfqNo:'',title:'',description:'',category:'',dueDate:''})
  const [respFor,setRespFor]=useState<string|null>(null)
  const [resp,setResp]=useState({vendorId:'',vendorName:'',amount:0,currency:'USD',leadTimeDays:14,notes:''})
  const load=async()=>{const r=await fetch('/api/wave3/procurement/rfqs',{cache:'no-store'});setRows((await r.json()).data||[])}
  useEffect(()=>{void load()},[])
  const create=async()=>{
    if(!form.rfqNo||!form.title)return alert('RFQ no + title required')
    const r=await fetch('/api/wave3/procurement/rfqs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,dueDate:form.dueDate||null})})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error));setShowCreate(false);await load()
  }
  const open=async(id:string)=>{await fetch(`/api/wave3/procurement/rfqs/${id}/open`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});await load()}
  const submit=async(id:string)=>{
    if(!resp.vendorId||resp.amount<=0)return alert('Vendor + amount required')
    const r=await fetch(`/api/wave3/procurement/rfqs/${id}/responses`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(resp)})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error))
    setRespFor(null);setResp({vendorId:'',vendorName:'',amount:0,currency:'USD',leadTimeDays:14,notes:''});await load()
  }
  const award=async(rid:string,respId:string)=>{if(!confirm('Award? All others auto-rejected.'))return;await fetch(`/api/wave3/procurement/rfqs/${rid}/award/${respId}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});await load()}
  return(
    <div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
      <div style={{background:B,color:C,padding:'24px 32px',borderBottom:`4px solid ${G}`}}>
        <div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE #13 · PROCUREMENT &amp; SOURCING</div>
        <h1 style={{margin:'6px 0 0',fontSize:28,fontFamily:'Georgia,serif'}}>RFQ Workflow</h1>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>Draft → Open → collect responses → award (auto-reject losers)</div>
      </div>
      <div style={{padding:'16px 24px'}}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{padding:'8px 20px',background:B,color:C,border:`2px solid ${G}`,fontWeight:600,cursor:'pointer',marginRight:8}}>+ NEW RFQ</button>
        <button onClick={load} style={{padding:'8px 20px',background:'transparent',color:B,border:`2px solid ${B}`,fontWeight:600,cursor:'pointer'}}>REFRESH</button>
      </div>
      {showCreate && (
        <div style={{margin:'0 24px 16px',background:'#fff',padding:16,border:`1px solid ${B}33`}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            <F l="RFQ no *"><input value={form.rfqNo} onChange={e=>setForm({...form,rfqNo:e.target.value})} style={inp}/></F>
            <F l="Title *"><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inp}/></F>
            <F l="Category"><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inp}/></F>
            <F l="Due date"><input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} style={inp}/></F>
          </div>
          <F l="Description"><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={inp}/></F>
          <button onClick={create} style={{marginTop:8,padding:'8px 20px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer'}}>SAVE (Draft)</button>
        </div>
      )}
      <div style={{padding:'0 24px 24px',display:'grid',gridTemplateColumns:'1fr',gap:12}}>
        {rows.length===0?<div style={{padding:32,color:'#888'}}>No RFQs yet.</div>:rows.map(r=>(
          <div key={r.id} style={{background:'#fff',border:`1px solid ${B}33`,borderLeft:`6px solid ${SS[r.status]}`}}>
            <div style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:10,borderBottom:`1px solid ${B}11`}}>
              <span style={{fontFamily:'monospace',fontWeight:700,color:B}}>{r.rfqNo}</span>
              <span style={{flex:1,fontWeight:600}}>{r.title}</span>
              <span style={{fontSize:11,background:SS[r.status],color:'#fff',padding:'2px 8px',fontWeight:700}}>{r.status.toUpperCase()}</span>
              {r.status==='Draft' && <button onClick={()=>open(r.id)} style={ab('#1565C0')}>OPEN</button>}
              {r.status==='Open' && <button onClick={()=>setRespFor(respFor===r.id?null:r.id)} style={ab(G)}>+ RESPONSE</button>}
            </div>
            {respFor===r.id && (
              <div style={{padding:12,background:C,borderBottom:`1px solid ${B}11`,display:'grid',gridTemplateColumns:'repeat(5,1fr) auto',gap:8,alignItems:'end'}}>
                <F l="Vendor ID *"><input value={resp.vendorId} onChange={e=>setResp({...resp,vendorId:e.target.value})} style={inp}/></F>
                <F l="Vendor name"><input value={resp.vendorName} onChange={e=>setResp({...resp,vendorName:e.target.value})} style={inp}/></F>
                <F l="Amount *"><input type="number" value={resp.amount} onChange={e=>setResp({...resp,amount:+e.target.value})} style={inp}/></F>
                <F l="Currency"><input value={resp.currency} onChange={e=>setResp({...resp,currency:e.target.value.toUpperCase()})} maxLength={3} style={inp}/></F>
                <F l="Lead time (days)"><input type="number" value={resp.leadTimeDays} onChange={e=>setResp({...resp,leadTimeDays:+e.target.value})} style={inp}/></F>
                <button onClick={()=>submit(r.id)} style={{background:B,color:C,border:0,padding:'8px 14px',fontWeight:700,cursor:'pointer'}}>SUBMIT</button>
              </div>
            )}
            <div style={{padding:'8px 14px'}}>
              {r.responses.length===0?<div style={{color:'#888',fontSize:12}}>No responses yet.</div>:(
                <table style={{width:'100%',fontSize:12,borderCollapse:'collapse'}}>
                  <thead><tr style={{textAlign:'left',background:B,color:C}}>{['VENDOR','AMOUNT','LEAD','STATUS','ACTIONS'].map(h=><th key={h} style={{padding:6}}>{h}</th>)}</tr></thead>
                  <tbody>{r.responses.sort((a,b)=>a.amount-b.amount).map(rp=>(
                    <tr key={rp.id} style={{borderBottom:`1px solid ${B}11`}}>
                      <td style={{padding:6}}>{rp.vendorName||rp.vendorId}</td>
                      <td style={{padding:6,fontFamily:'monospace',fontWeight:700,color:B}}>{rp.currency} {rp.amount.toLocaleString()}</td>
                      <td style={{padding:6}}>{rp.leadTimeDays??'—'}d</td>
                      <td style={{padding:6}}><span style={{background:rp.status==='Awarded'?'#2E7D32':rp.status==='Rejected'?'#8B0000':'#666',color:'#fff',padding:'1px 6px',fontSize:10,fontWeight:700}}>{rp.status.toUpperCase()}</span></td>
                      <td style={{padding:6}}>{r.status==='Open' && rp.status==='Submitted' && <button onClick={()=>award(r.id,rp.id)} style={ab('#2E7D32')}>AWARD</button>}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
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

'use client'
/** HARVICS OS — AP 3-Way Match (Module #4) */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
interface PO { id:string; poNumber:string; supplier:string; total:number; currency:string; status:string }
interface Match { poNumber:string; supplier:string; poQty:number; grQty:number; qtyMatch:boolean; poAmount:number; invoiceAmount:number; amountMatch:boolean; receipts:number; canPay:boolean; candidateInvoices:any[] }
export default function ApMatchPage(){
  const [pos,setPos]=useState<PO[]>([])
  const [match,setMatch]=useState<Match|null>(null)
  const [selectedPo,setSelectedPo]=useState<PO|null>(null)
  const [grForm,setGrForm]=useState({receiptNo:'',qtyReceived:0,receivedBy:''})
  useEffect(()=>{(async()=>{const r=await fetch('/api/procurement?status=Approved',{cache:'no-store'});const j=await r.json();setPos(j.data||j||[])})()},[])
  const check=async(po:PO)=>{setSelectedPo(po);const r=await fetch(`/api/wave3/ap/three-way-match/${po.id}`);const j=await r.json();setMatch(j.data)}
  const createGr=async()=>{
    if(!selectedPo||!grForm.receiptNo)return alert('Receipt no required')
    const r=await fetch('/api/wave3/ap/receipts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...grForm,purchaseOrderId:selectedPo.id})})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error))
    setGrForm({receiptNo:'',qtyReceived:0,receivedBy:''});await check(selectedPo)
  }
  return(
    <div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
      <div style={{background:B,color:C,padding:'24px 32px',borderBottom:`4px solid ${G}`}}>
        <div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE #4 · FINANCE &amp; CONTROLLING</div>
        <h1 style={{margin:'6px 0 0',fontSize:28,fontFamily:'Georgia,serif'}}>AP — 3-Way Match</h1>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>Match Purchase Order ↔ Goods Receipt ↔ Supplier Invoice</div>
      </div>
      <div style={{padding:24,display:'grid',gridTemplateColumns:'1fr 2fr',gap:16}}>
        <div style={{background:'#fff',border:`1px solid ${B}33`}}>
          <div style={{background:B,color:C,padding:'10px 12px',fontWeight:700,fontSize:13}}>PURCHASE ORDERS</div>
          {pos.length===0?<div style={{padding:24,color:'#888'}}>No POs found.</div>:pos.map(p=>(
            <div key={p.id} onClick={()=>check(p)} style={{padding:10,borderBottom:`1px solid ${B}11`,cursor:'pointer',background:selectedPo?.id===p.id?C:'#fff'}}>
              <div style={{fontWeight:600,color:B,fontFamily:'monospace'}}>{p.poNumber}</div>
              <div style={{fontSize:12,color:'#666'}}>{p.supplier} · {p.currency} {p.total.toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div style={{background:'#fff',border:`1px solid ${B}33`,padding:16}}>
          {!match?<div style={{padding:32,color:'#888',textAlign:'center'}}>Select a PO to run match</div>:(
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
                <Card label="Quantity match" ok={match.qtyMatch}>PO {match.poQty} · Received {match.grQty}</Card>
                <Card label="Amount match" ok={match.amountMatch}>PO ${match.poAmount.toLocaleString()} · Invoiced ${match.invoiceAmount.toLocaleString()}</Card>
              </div>
              <div style={{marginTop:16,background:match.canPay?'#E8F5E9':'#FFF3E0',padding:16,border:`2px solid ${match.canPay?'#2E7D32':'#E65100'}`}}>
                <div style={{fontWeight:700,color:match.canPay?'#2E7D32':'#E65100'}}>{match.canPay?'✓ CLEARED — READY FOR PAYMENT':'✗ DISCREPANCY — HOLD'}</div>
                <div style={{marginTop:4,fontSize:12}}>{match.receipts} receipt(s) · {match.candidateInvoices.length} matching invoice(s)</div>
              </div>
              <div style={{marginTop:16,padding:12,background:C,border:`1px solid ${B}33`}}>
                <div style={{fontWeight:700,color:B,marginBottom:8,fontSize:13}}>RECORD GOODS RECEIPT</div>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,alignItems:'end'}}>
                  <F l="Receipt no *"><input value={grForm.receiptNo} onChange={e=>setGrForm({...grForm,receiptNo:e.target.value})} style={inp}/></F>
                  <F l="Qty received *"><input type="number" value={grForm.qtyReceived} onChange={e=>setGrForm({...grForm,qtyReceived:+e.target.value})} style={inp}/></F>
                  <F l="Received by"><input value={grForm.receivedBy} onChange={e=>setGrForm({...grForm,receivedBy:e.target.value})} style={inp}/></F>
                  <button onClick={createGr} style={{background:G,color:B,border:0,padding:'8px 14px',fontWeight:700,cursor:'pointer'}}>RECORD</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
const inp:React.CSSProperties={width:'100%',padding:8,border:`1px solid ${B}55`,background:'#fff'}
function F({l,children}:{l:string;children:React.ReactNode}){return <label><div style={{fontSize:11,color:B,fontWeight:600,marginBottom:4}}>{l}</div>{children}</label>}
function Card({label,ok,children}:{label:string;ok:boolean;children:React.ReactNode}){
  return(<div style={{padding:16,background:ok?'#E8F5E9':'#FFEBEE',border:`2px solid ${ok?'#2E7D32':'#B71C1C'}`}}>
    <div style={{fontSize:11,letterSpacing:1,color:'#666',fontWeight:600}}>{label.toUpperCase()}</div>
    <div style={{fontSize:24,fontWeight:700,color:ok?'#2E7D32':'#B71C1C',marginTop:4}}>{ok?'✓ MATCH':'✗ MISMATCH'}</div>
    <div style={{fontSize:12,color:'#555',marginTop:4}}>{children}</div>
  </div>)
}

'use client'
/** HARVICS OS — AR Aging (Module #3) — computed from existing invoices */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
interface Row { invoiceNo:string; customerName:string|null; amount:number; paid:number; outstanding:number; daysOverdue:number; bucket:string }
interface Sum { current:number; d30:number; d60:number; d90:number; d90plus:number }
const BUCKETS:[keyof Sum,string,string][]=[['current','Current','#2E7D32'],['d30','1-30 days','#9CB451'],['d60','31-60 days','#B8860B'],['d90','61-90 days','#E65100'],['d90plus','90+ days','#B71C1C']]
export default function ArAgingPage(){
  const [rows,setRows]=useState<Row[]>([])
  const [sum,setSum]=useState<Sum>({current:0,d30:0,d60:0,d90:0,d90plus:0})
  const load=async()=>{const r=await fetch('/api/wave3/ar/aging',{cache:'no-store'});const j=await r.json();setRows(j.data||[]);setSum(j.summary||{})}
  useEffect(()=>{void load()},[])
  const total=Object.values(sum).reduce((s,v)=>s+v,0)
  return(
    <div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
      <div style={{background:B,color:C,padding:'24px 32px',borderBottom:`4px solid ${G}`}}>
        <div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE #3 · FINANCE &amp; CONTROLLING</div>
        <h1 style={{margin:'6px 0 0',fontSize:28,fontFamily:'Georgia,serif'}}>Accounts Receivable — Aging</h1>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>Outstanding receivables bucketed by days overdue</div>
      </div>
      <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:16}}>
        {BUCKETS.map(([k,l,col])=>(
          <div key={k} style={{background:'#fff',padding:16,borderTop:`4px solid ${col}`,border:`1px solid ${B}22`}}>
            <div style={{fontSize:11,color:'#666',fontWeight:600,letterSpacing:1}}>{l.toUpperCase()}</div>
            <div style={{fontSize:22,fontWeight:700,color:B,marginTop:6,fontFamily:'monospace'}}>${sum[k].toLocaleString()}</div>
            <div style={{fontSize:11,color:'#888',marginTop:2}}>{total?Math.round(sum[k]/total*100):0}% of total</div>
          </div>
        ))}
      </div>
      <div style={{padding:'0 24px 16px'}}>
        <button onClick={load} style={{padding:'8px 20px',background:B,color:C,border:`2px solid ${G}`,fontWeight:600,cursor:'pointer'}}>REFRESH</button>
        <span style={{marginLeft:16,color:B}}>Total outstanding: <b style={{fontSize:18}}>${total.toLocaleString()}</b></span>
      </div>
      <div style={{padding:'0 24px 24px'}}>
        <div style={{background:'#fff',border:`1px solid ${B}33`,overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:B,color:C,textAlign:'left'}}>{['INVOICE','CUSTOMER','AMOUNT','PAID','OUTSTANDING','DAYS OD','BUCKET'].map(h=><th key={h} style={{padding:10}}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.length===0?<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:'#888'}}>No outstanding invoices.</td></tr>:rows.map((r,i)=>(
                <tr key={r.invoiceNo} style={{background:i%2?C:'#fff',borderBottom:`1px solid ${B}11`}}>
                  <td style={{padding:10,fontFamily:'monospace',fontWeight:600,color:B}}>{r.invoiceNo}</td>
                  <td style={{padding:10}}>{r.customerName||'—'}</td>
                  <td style={{padding:10,fontFamily:'monospace'}}>${r.amount.toLocaleString()}</td>
                  <td style={{padding:10,fontFamily:'monospace',color:'#2E7D32'}}>${r.paid.toLocaleString()}</td>
                  <td style={{padding:10,fontFamily:'monospace',fontWeight:700,color:B}}>${r.outstanding.toLocaleString()}</td>
                  <td style={{padding:10}}>{r.daysOverdue}</td>
                  <td style={{padding:10}}>{r.bucket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

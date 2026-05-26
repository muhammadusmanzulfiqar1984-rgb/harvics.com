'use client'
/** #7 Financial Planning — Budgets + scenarios */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Form, Inp, Tbl } from '../controlling/page'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
const SCN=['Base','Upside','Downside']
const SC:Record<string,string>={Base:'#1565C0',Upside:'#2E7D32',Downside:'#B71C1C'}
const P=new Date().toISOString().slice(0,7)
interface Bud{id:string;period:string;account:string;costCenter:string|null;budgeted:number;scenario:string}
export default function BudgetPage(){
  const [rows,setRows]=useState<Bud[]>([])
  const [period,setPeriod]=useState(P)
  const [scenario,setScenario]=useState('Base')
  const [form,setForm]=useState({period:P,account:'',costCenter:'',budgeted:0,scenario:'Base',notes:''})
  const load=async()=>{const r=await(await fetch(`/api/wave4/budgets?period=${period}&scenario=${scenario}`,{cache:'no-store'})).json();setRows(r.data||[])}
  useEffect(()=>{void load()},[period,scenario])
  const save=async()=>{if(!form.account||!form.budgeted)return alert('Account+amount required');const r=await(await fetch('/api/wave4/budgets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,costCenter:form.costCenter||null})})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setForm({...form,account:'',budgeted:0});await load()}
  const total=rows.reduce((s,r)=>s+r.budgeted,0)
  return(<div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
    <Hdr no="#7" band="FINANCE & CONTROLLING" title="Financial Planning — Budgets" sub="Multi-scenario planning · feeds variance report"/>
    <div style={{padding:'12px 24px',display:'flex',gap:8,alignItems:'center'}}>
      <span style={{color:B,fontWeight:600}}>Period:</span>
      <input value={period} onChange={e=>setPeriod(e.target.value)} style={{padding:6,border:`1px solid ${B}55`,width:120}}/>
      <span style={{color:B,fontWeight:600,marginLeft:12}}>Scenario:</span>
      {SCN.map(s=><button key={s} onClick={()=>setScenario(s)} style={{padding:'4px 12px',background:scenario===s?SC[s]:'#fff',color:scenario===s?'#fff':B,border:`1px solid ${SC[s]}`,fontWeight:600,cursor:'pointer'}}>{s}</button>)}
      <span style={{marginLeft:'auto',color:B}}>Total: <b style={{fontSize:18}}>${total.toLocaleString()}</b></span>
    </div>
    <div style={{padding:'0 24px 24px',display:'grid',gridTemplateColumns:'1fr 2fr',gap:16}}>
      <Panel title="ADD BUDGET LINE">
        <Form>
          <Inp l="Period" v={form.period} on={v=>setForm({...form,period:v})}/>
          <label><div style={{fontSize:10,color:B,fontWeight:600}}>Scenario</div><select value={form.scenario} onChange={e=>setForm({...form,scenario:e.target.value})} style={{width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}}>{SCN.map(s=><option key={s}>{s}</option>)}</select></label>
          <Inp l="Account *" v={form.account} on={v=>setForm({...form,account:v})}/>
          <Inp l="Cost Center" v={form.costCenter} on={v=>setForm({...form,costCenter:v})}/>
          <Inp l="Budgeted *" tp="number" v={String(form.budgeted)} on={v=>setForm({...form,budgeted:+v})}/>
          <Inp l="Notes" v={form.notes} on={v=>setForm({...form,notes:v})}/>
        </Form>
        <button onClick={save} style={{marginTop:8,padding:'6px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer'}}>SAVE (upsert)</button>
      </Panel>
      <Panel title={`${scenario.toUpperCase()} BUDGET — ${period}`}>
        <Tbl head={['ACCOUNT','CC','BUDGETED','NOTES']}>
          {rows.length===0?<tr><td colSpan={4} style={{padding:16,textAlign:'center',color:'#888'}}>No budget lines yet.</td></tr>:rows.map(r=><tr key={r.id} style={{borderBottom:`1px solid ${B}11`}}><td style={{padding:6,fontFamily:'monospace',fontWeight:600,color:B}}>{r.account}</td><td style={{padding:6}}>{r.costCenter||'—'}</td><td style={{padding:6,fontFamily:'monospace',fontWeight:700}}>${r.budgeted.toLocaleString()}</td><td style={{padding:6,fontSize:11,color:'#666'}}>{(r as any).notes||''}</td></tr>)}
        </Tbl>
      </Panel>
    </div>
  </div>)
}

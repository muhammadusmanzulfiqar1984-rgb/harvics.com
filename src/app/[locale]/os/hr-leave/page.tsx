'use client'
/** HARVICS OS — HR Leave & Attendance (Module #29) */
import { useEffect, useState } from 'react'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F0E8'
const SS:Record<string,string>={Pending:'#B8860B',Approved:'#2E7D32',Rejected:'#B71C1C',Cancelled:'#666'}
interface Leave{id:string;employeeId:string;leaveType:string;startDate:string;endDate:string;days:number;status:string;reason:string|null}
interface Att{id:string;employeeId:string;date:string;clockIn:string|null;clockOut:string|null;hoursWorked:number;status:string}
const TODAY=new Date().toISOString().slice(0,10)
export default function HrPage(){
  const [leaves,setLeaves]=useState<Leave[]>([])
  const [att,setAtt]=useState<Att[]>([])
  const [showL,setShowL]=useState(false)
  const [showA,setShowA]=useState(false)
  const [lForm,setLForm]=useState({employeeId:'',leaveType:'Annual',startDate:TODAY,endDate:TODAY,reason:''})
  const [aForm,setAForm]=useState({employeeId:'',date:TODAY,clockIn:'',clockOut:'',status:'Present',notes:''})
  const load=async()=>{
    const l=await fetch('/api/wave3/hr/leave',{cache:'no-store'});setLeaves((await l.json()).data||[])
    const a=await fetch('/api/wave3/hr/attendance',{cache:'no-store'});setAtt((await a.json()).data||[])
  }
  useEffect(()=>{void load()},[])
  const createL=async()=>{
    if(!lForm.employeeId)return alert('Employee required')
    const r=await fetch('/api/wave3/hr/leave',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lForm)})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error));setShowL(false);await load()
  }
  const decide=async(id:string,what:'approve'|'reject')=>{await fetch(`/api/wave3/hr/leave/${id}/${what}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});await load()}
  const createA=async()=>{
    if(!aForm.employeeId)return alert('Employee required')
    const body:any={...aForm}
    if(aForm.clockIn)body.clockIn=`${aForm.date}T${aForm.clockIn}:00Z`
    if(aForm.clockOut)body.clockOut=`${aForm.date}T${aForm.clockOut}:00Z`
    const r=await fetch('/api/wave3/hr/attendance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    const j=await r.json();if(!j.success)return alert(JSON.stringify(j.issues||j.error));setShowA(false);await load()
  }
  return(
    <div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
      <div style={{background:B,color:C,padding:'24px 32px',borderBottom:`4px solid ${G}`}}>
        <div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE #29 · HUMAN CAPITAL</div>
        <h1 style={{margin:'6px 0 0',fontSize:28,fontFamily:'Georgia,serif'}}>HR — Leave &amp; Attendance</h1>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>Leave requests workflow + daily attendance log</div>
      </div>
      <div style={{padding:24,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Leave */}
        <div style={{background:'#fff',border:`1px solid ${B}33`}}>
          <div style={{background:B,color:C,padding:'10px 12px',display:'flex',gap:8,alignItems:'center'}}>
            <span style={{flex:1,fontWeight:700,fontSize:13}}>LEAVE REQUESTS</span>
            <button onClick={()=>setShowL(s=>!s)} style={{background:G,color:B,border:0,padding:'4px 12px',fontWeight:700,cursor:'pointer'}}>+ REQUEST</button>
          </div>
          {showL && (
            <div style={{padding:12,background:C,borderBottom:`1px solid ${B}33`,display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
              <F l="Employee ID *"><input value={lForm.employeeId} onChange={e=>setLForm({...lForm,employeeId:e.target.value})} style={inp}/></F>
              <F l="Type"><select value={lForm.leaveType} onChange={e=>setLForm({...lForm,leaveType:e.target.value})} style={inp}>{['Annual','Sick','Unpaid','Maternity','Paternity','Bereavement'].map(t=><option key={t}>{t}</option>)}</select></F>
              <F l="Start"><input type="date" value={lForm.startDate} onChange={e=>setLForm({...lForm,startDate:e.target.value})} style={inp}/></F>
              <F l="End"><input type="date" value={lForm.endDate} onChange={e=>setLForm({...lForm,endDate:e.target.value})} style={inp}/></F>
              <div style={{gridColumn:'span 2'}}><F l="Reason"><input value={lForm.reason} onChange={e=>setLForm({...lForm,reason:e.target.value})} style={inp}/></F></div>
              <div style={{gridColumn:'span 2'}}><button onClick={createL} style={{padding:'8px 14px',background:B,color:C,border:0,fontWeight:700,cursor:'pointer'}}>SUBMIT</button></div>
            </div>
          )}
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr style={{background:B,color:C,textAlign:'left'}}>{['EMP','TYPE','PERIOD','DAYS','STATUS','ACT'].map(h=><th key={h} style={{padding:6}}>{h}</th>)}</tr></thead>
            <tbody>{leaves.length===0?<tr><td colSpan={6} style={{padding:24,textAlign:'center',color:'#888'}}>No leave requests.</td></tr>:leaves.map((l,i)=>(
              <tr key={l.id} style={{background:i%2?C:'#fff',borderBottom:`1px solid ${B}11`}}>
                <td style={{padding:6,fontWeight:600,color:B}}>{l.employeeId}</td>
                <td style={{padding:6}}>{l.leaveType}</td>
                <td style={{padding:6,fontSize:11}}>{new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}</td>
                <td style={{padding:6,fontWeight:700}}>{l.days}</td>
                <td style={{padding:6}}><span style={{background:SS[l.status],color:'#fff',padding:'1px 6px',fontSize:10,fontWeight:700}}>{l.status.toUpperCase()}</span></td>
                <td style={{padding:6}}>{l.status==='Pending' && <>
                  <button onClick={()=>decide(l.id,'approve')} style={ab('#2E7D32')}>✓</button>{' '}
                  <button onClick={()=>decide(l.id,'reject')} style={ab('#B71C1C')}>✗</button>
                </>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {/* Attendance */}
        <div style={{background:'#fff',border:`1px solid ${B}33`}}>
          <div style={{background:B,color:C,padding:'10px 12px',display:'flex',gap:8,alignItems:'center'}}>
            <span style={{flex:1,fontWeight:700,fontSize:13}}>ATTENDANCE</span>
            <button onClick={()=>setShowA(s=>!s)} style={{background:G,color:B,border:0,padding:'4px 12px',fontWeight:700,cursor:'pointer'}}>+ LOG</button>
          </div>
          {showA && (
            <div style={{padding:12,background:C,borderBottom:`1px solid ${B}33`,display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
              <F l="Employee ID *"><input value={aForm.employeeId} onChange={e=>setAForm({...aForm,employeeId:e.target.value})} style={inp}/></F>
              <F l="Date"><input type="date" value={aForm.date} onChange={e=>setAForm({...aForm,date:e.target.value})} style={inp}/></F>
              <F l="Clock in (HH:MM)"><input type="time" value={aForm.clockIn} onChange={e=>setAForm({...aForm,clockIn:e.target.value})} style={inp}/></F>
              <F l="Clock out (HH:MM)"><input type="time" value={aForm.clockOut} onChange={e=>setAForm({...aForm,clockOut:e.target.value})} style={inp}/></F>
              <F l="Status"><select value={aForm.status} onChange={e=>setAForm({...aForm,status:e.target.value})} style={inp}>{['Present','Absent','Late','Half-Day','WFH'].map(s=><option key={s}>{s}</option>)}</select></F>
              <div><F l="Notes"><input value={aForm.notes} onChange={e=>setAForm({...aForm,notes:e.target.value})} style={inp}/></F></div>
              <div style={{gridColumn:'span 2'}}><button onClick={createA} style={{padding:'8px 14px',background:B,color:C,border:0,fontWeight:700,cursor:'pointer'}}>LOG</button></div>
            </div>
          )}
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr style={{background:B,color:C,textAlign:'left'}}>{['EMP','DATE','IN','OUT','HOURS','STATUS'].map(h=><th key={h} style={{padding:6}}>{h}</th>)}</tr></thead>
            <tbody>{att.length===0?<tr><td colSpan={6} style={{padding:24,textAlign:'center',color:'#888'}}>No attendance logged.</td></tr>:att.map((a,i)=>(
              <tr key={a.id} style={{background:i%2?C:'#fff',borderBottom:`1px solid ${B}11`}}>
                <td style={{padding:6,fontWeight:600,color:B}}>{a.employeeId}</td>
                <td style={{padding:6,fontSize:11}}>{new Date(a.date).toLocaleDateString()}</td>
                <td style={{padding:6,fontSize:11}}>{a.clockIn?new Date(a.clockIn).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'—'}</td>
                <td style={{padding:6,fontSize:11}}>{a.clockOut?new Date(a.clockOut).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'—'}</td>
                <td style={{padding:6,fontWeight:700}}>{a.hoursWorked.toFixed(1)}</td>
                <td style={{padding:6}}><span style={{background:a.status==='Present'||a.status==='WFH'?'#2E7D32':a.status==='Absent'?'#B71C1C':'#B8860B',color:'#fff',padding:'1px 6px',fontSize:10,fontWeight:700}}>{a.status.toUpperCase()}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
const inp:React.CSSProperties={width:'100%',padding:8,border:`1px solid ${B}55`,background:'#fff'}
const ab=(c:string):React.CSSProperties=>({padding:'2px 8px',background:'transparent',color:c,border:`1px solid ${c}`,cursor:'pointer',fontSize:10,fontWeight:700})
function F({l,children}:{l:string;children:React.ReactNode}){return <label><div style={{fontSize:11,color:B,fontWeight:600,marginBottom:4}}>{l}</div>{children}</label>}

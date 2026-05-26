'use client'

/**
 * HARVICS OS — Admin & Security (Module #53)
 * App user CRUD + role grants + activate/deactivate.
 */
import { useEffect, useState } from 'react'

interface User { id: string; username: string; email: string|null; displayName: string|null; role: string; active: boolean; mfaEnabled: boolean; lastLoginAt: string|null; createdAt: string }
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
const ROLE_COLORS: Record<string,string> = { operator:'#666', manager:'#1565C0', admin:'#B8860B', superadmin:'#8B0000' }

export default function AdminUsersPage() {
  const [rows, setRows] = useState<User[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ username:'', email:'', displayName:'', role:'operator', active:true, mfaEnabled:false })
  const [q, setQ] = useState('')

  const load = async () => {
    const url = q ? `/api/platform/admin/users?q=${encodeURIComponent(q)}` : '/api/platform/admin/users'
    const r = await fetch(url, { cache:'no-store' }); setRows((await r.json()).data || [])
  }
  useEffect(()=>{ void load() },[q])

  const create = async () => {
    if (!form.username) return alert('Username required')
    const r = await fetch('/api/platform/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j = await r.json(); if(!j.success) return alert(JSON.stringify(j.issues || j.error))
    setShowCreate(false); setForm({ username:'', email:'', displayName:'', role:'operator', active:true, mfaEnabled:false }); await load()
  }
  const toggleActive = async (u: User) => {
    if (u.active) await fetch(`/api/platform/admin/users/${u.id}/deactivate`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})
    else await fetch(`/api/platform/admin/users/${u.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({active:true})})
    await load()
  }
  const remove = async (id: string) => { if(!confirm('Delete user?')) return; await fetch(`/api/platform/admin/users/${id}`,{method:'DELETE'}); await load() }

  const counts = { total: rows.length, active: rows.filter(r=>r.active).length, admins: rows.filter(r=>r.role==='admin'||r.role==='superadmin').length }

  return (
    <div style={{ fontFamily:'system-ui', minHeight:'100vh', background:C }}>
      <div style={{ background:B, color:C, padding:'24px 32px', borderBottom:`4px solid ${G}` }}>
        <div style={{ fontSize:11, letterSpacing:2, opacity:.85 }}>MODULE #53 · PLATFORM &amp; INFRASTRUCTURE</div>
        <h1 style={{ margin:'6px 0 0', fontSize:28, fontFamily:'Georgia,serif' }}>Admin &amp; Security</h1>
        <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>Application users, roles, MFA flags</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, padding:24 }}>
        {[{l:'Total Users',v:counts.total,c:B},{l:'Active',v:counts.active,c:'#2E7D32'},{l:'Admins',v:counts.admins,c:'#B8860B'}].map(k=>(
          <div key={k.l} style={{ background:'#fff', padding:20, borderTop:`4px solid ${k.c}`, border:`1px solid ${B}22` }}>
            <div style={{ fontSize:11, color:'#666', letterSpacing:1, fontWeight:600 }}>{k.l.toUpperCase()}</div>
            <div style={{ fontSize:28, fontWeight:700, color:B, marginTop:6 }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'0 24px 16px', display:'flex', gap:12, alignItems:'center' }}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{ padding:'8px 20px', background:B, color:C, border:`2px solid ${G}`, fontWeight:600, cursor:'pointer' }}>+ NEW USER</button>
        <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} style={{ padding:'8px 12px', border:`2px solid ${B}55`, background:'#fff', marginLeft:8 }} />
        <button onClick={load} style={{ padding:'8px 20px', background:'transparent', color:B, border:`2px solid ${B}`, fontWeight:600, cursor:'pointer' }}>REFRESH</button>
      </div>

      {showCreate && (
        <div style={{ margin:'0 24px 16px', background:'#fff', padding:16, border:`1px solid ${B}33` }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            <F l="Username *"><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} style={inp} /></F>
            <F l="Email"><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inp} /></F>
            <F l="Display name"><input value={form.displayName} onChange={e=>setForm({...form,displayName:e.target.value})} style={inp} /></F>
            <F l="Role">
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={inp}>
                <option>operator</option><option>manager</option><option>admin</option><option>superadmin</option>
              </select>
            </F>
            <F l="MFA enabled"><input type="checkbox" checked={form.mfaEnabled} onChange={e=>setForm({...form,mfaEnabled:e.target.checked})} /></F>
            <F l="Active"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /></F>
          </div>
          <button onClick={create} style={{ marginTop:10, padding:'8px 20px', background:G, color:B, border:0, fontWeight:700, cursor:'pointer' }}>CREATE</button>
        </div>
      )}

      <div style={{ padding:'0 24px 24px' }}>
        <div style={{ background:'#fff', border:`1px solid ${B}33`, overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:B, color:C, textAlign:'left' }}>{['USERNAME','EMAIL','NAME','ROLE','MFA','STATUS','LAST LOGIN','ACTIONS'].map(h=><th key={h} style={{padding:10}}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.length===0 ? <tr><td colSpan={8} style={{padding:32, textAlign:'center', color:'#888'}}>No users yet</td></tr> :
                rows.map((u,i)=>(
                  <tr key={u.id} style={{ background:i%2?C:'#fff', borderBottom:`1px solid ${B}11` }}>
                    <td style={{ padding:10, fontWeight:600, color:B }}>{u.username}</td>
                    <td style={{ padding:10 }}>{u.email || '—'}</td>
                    <td style={{ padding:10 }}>{u.displayName || '—'}</td>
                    <td style={{ padding:10 }}><span style={{ background:ROLE_COLORS[u.role]||'#666', color:'#fff', padding:'2px 8px', fontSize:11, fontWeight:700 }}>{u.role.toUpperCase()}</span></td>
                    <td style={{ padding:10 }}>{u.mfaEnabled ? '✔' : '—'}</td>
                    <td style={{ padding:10 }}><span style={{ background:u.active?'#2E7D32':'#666', color:'#fff', padding:'2px 8px', fontSize:11, fontWeight:700 }}>{u.active?'ACTIVE':'DISABLED'}</span></td>
                    <td style={{ padding:10, color:'#555', fontSize:12 }}>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}</td>
                    <td style={{ padding:10 }}>
                      <button onClick={()=>toggleActive(u)} style={ab(u.active?'#666':'#2E7D32')}>{u.active?'DISABLE':'ENABLE'}</button>{' '}
                      <button onClick={()=>remove(u.id)} style={ab('#8B0000')}>DELETE</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
const inp: React.CSSProperties = { width:'100%', padding:8, border:`1px solid ${B}55`, background:C }
const ab = (color: string): React.CSSProperties => ({ padding:'3px 10px', background:'transparent', color, border:`1px solid ${color}`, cursor:'pointer', fontSize:11, fontWeight:600 })
function F({l,children}:{l:string;children:React.ReactNode}){ return <label><div style={{ fontSize:11, color:B, fontWeight:600, marginBottom:4 }}>{l}</div>{children}</label> }

'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, StatusBadge, inputCls, btnPrimary, btnGhost, btnDanger, api } from './_shell'

interface Employee {
  id: string
  name: string
  role: string
  department: string
  salary: number
  currency: string
  status: 'Active' | 'OnLeave' | 'Terminated'
  hiredAt: string
}

const DEPARTMENTS = ['Operations', 'Sales', 'Logistics', 'Manufacturing', 'Finance', 'IT', 'HR', 'Marketing']
const STATUSES: Employee['status'][] = ['Active', 'OnLeave', 'Terminated']

export default function HRConsole() {
  const [list, setList] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', role: '', department: 'Operations', salary: '5000' })

  const load = async () => {
    setLoading(true)
    const r = await api<Employee[]>('/api/modules/demo/employees')
    if (r.ok && r.data) setList(r.data)
    else setMessage(r.error || 'Load failed')
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      setMessage('Name and role required')
      return
    }
    const r = await api('/api/modules/demo/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, salary: Number(form.salary) || 0 }),
    })
    setMessage(r.ok ? `Hired ${form.name}` : r.error || 'Create failed')
    if (r.ok) {
      setForm({ name: '', role: '', department: form.department, salary: '5000' })
      load()
    }
  }

  const setStatus = async (id: string, status: Employee['status']) => {
    const r = await api(`/api/modules/demo/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setMessage(r.ok ? `Updated ${id}` : r.error || 'Update failed')
    if (r.ok) load()
  }

  const remove = async (id: string) => {
    const r = await api(`/api/modules/demo/employees/${id}`, { method: 'DELETE' })
    setMessage(r.ok ? `Removed ${id}` : r.error || 'Delete failed')
    if (r.ok) load()
  }

  const headcount = list.length
  const active = list.filter(e => e.status === 'Active').length
  const payroll = list.filter(e => e.status === 'Active').reduce((s, e) => s + e.salary, 0)

  const byDept: Record<string, number> = {}
  for (const e of list) byDept[e.department] = (byDept[e.department] || 0) + 1

  return (
    <ConsoleShell
      title="HR — Employees"
      subtitle="Hire, update status, and track department headcount with live payroll rollup."
      kpis={[
        { label: 'Headcount', value: headcount, sub: `${active} active` },
        { label: 'Monthly Payroll', value: `$${payroll.toLocaleString()}`, sub: `${headcount} on roster` },
        { label: 'Departments', value: Object.keys(byDept).length },
        { label: 'On Leave', value: list.filter(e => e.status === 'OnLeave').length },
      ]}
      message={message}
      onRefresh={load}
      loading={loading}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Hire New Employee">
          <div className="grid gap-2">
            <input className={inputCls} placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className={inputCls} placeholder="Role / title" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
            <select className={inputCls} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input className={inputCls} placeholder="Salary (USD/mo)" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
            <button type="button" onClick={create} className={btnPrimary}>Hire</button>
          </div>
        </Card>

        <Card title="Headcount by Department" count={Object.keys(byDept).length}>
          <div className="grid gap-1.5">
            {Object.entries(byDept).sort((a, b) => b[1] - a[1]).map(([dept, n]) => (
              <div key={dept} className="flex items-center justify-between rounded-lg border border-[#e8e2d5] px-2 py-1.5 text-xs">
                <span className="font-medium">{dept}</span>
                <span className="font-mono font-bold text-[#6b1f2b]">{n}</span>
              </div>
            ))}
            {Object.keys(byDept).length === 0 ? <p className="text-xs text-[#5d5d5d]">No employees yet.</p> : null}
          </div>
        </Card>

        <Card title="Employee Roster" count={`${list.length}`}>
          <div className="grid max-h-96 gap-2 overflow-auto">
            {list.map(emp => (
              <div key={emp.id} className="rounded-lg border border-[#e8e2d5] p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold">{emp.name}</p>
                    <p className="text-[11px] text-[#5d5d5d]">{emp.role} · {emp.department}</p>
                    <p className="text-[11px] font-mono text-[#1a1a1a]">{emp.currency} {emp.salary.toLocaleString()}/mo</p>
                  </div>
                  <StatusBadge status={emp.status} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {STATUSES.filter(s => s !== emp.status).map(s => (
                    <button key={s} type="button" onClick={() => setStatus(emp.id, s)} className={btnGhost}>→ {s}</button>
                  ))}
                  <button type="button" onClick={() => remove(emp.id)} className={`${btnDanger} ml-auto`}>Remove</button>
                </div>
              </div>
            ))}
            {list.length === 0 ? <p className="text-xs text-[#5d5d5d]">No employees yet.</p> : null}
          </div>
        </Card>
      </div>
    </ConsoleShell>
  )
}

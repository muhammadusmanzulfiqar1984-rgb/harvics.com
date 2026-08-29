'use client'

/**
 * Module #29 — HR Core & Payroll
 * DoD: employees + leave/attendance + payroll via /api/hr/* and /api/wave3/hr/*
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'people' | 'leave' | 'attendance' | 'payroll'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

const TODAY = new Date().toISOString().slice(0, 10)
const LEAVE_TYPES = ['Annual', 'Sick', 'Unpaid', 'Maternity', 'Paternity', 'Bereavement']
const ATT_STATUSES = ['Present', 'Absent', 'Late', 'Half-Day', 'WFH']

export default function HRModuleTwentyNine() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('people')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [employees, setEmployees] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [payroll, setPayroll] = useState<any[]>([])
  const [empForm, setEmpForm] = useState({
    name: '',
    department: '',
    position: '',
    country: '',
    city: '',
    salary: '0',
    currency: 'USD',
  })
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    leaveType: 'Annual',
    startDate: TODAY,
    endDate: TODAY,
    reason: '',
  })
  const [attForm, setAttForm] = useState({
    employeeId: '',
    date: TODAY,
    clockIn: '09:00',
    clockOut: '18:00',
    status: 'Present',
    notes: '',
  })
  const [payForm, setPayForm] = useState({ period: '2026-08', totalAmount: '0', currency: 'USD' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [e, l, a, p] = await Promise.allSettled([
        api('/api/hr/employees?limit=100'),
        api('/api/wave3/hr/leave'),
        api('/api/wave3/hr/attendance'),
        api('/api/hr/payroll'),
      ])
      if (e.status === 'fulfilled') setEmployees(e.value.data || [])
      if (l.status === 'fulfilled') setLeaves(l.value.data || [])
      if (a.status === 'fulfilled') setAttendance(a.value.data || [])
      if (p.status === 'fulfilled') setPayroll(p.value.data || [])
      const fails = [e, l, a, p].filter((x) => x.status === 'rejected') as PromiseRejectedResult[]
      if (fails.length === 4) throw new Error(fails[0]?.reason?.message || 'Failed to load Module #29')
      if (fails.length) setError(fails.map((f) => f.reason?.message || 'partial fail').join(' · '))
    } catch (err: any) {
      setError(err.message || 'Failed to load Module #29')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const createEmp = async () => {
    try {
      setError('')
      setMessage('')
      if (!empForm.name || !empForm.department) throw new Error('Name and department required')
      const r = await api('/api/hr/employees', {
        method: 'POST',
        body: JSON.stringify({
          ...empForm,
          salary: Number(empForm.salary) || 0,
        }),
      })
      setEmpForm({ name: '', department: '', position: '', country: '', city: '', salary: '0', currency: 'USD' })
      setMessage(`Employee ${r.data?.name || ''} created`)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const createLeave = async () => {
    try {
      setError('')
      setMessage('')
      if (!leaveForm.employeeId) throw new Error('Employee required')
      const r = await api('/api/wave3/hr/leave', { method: 'POST', body: JSON.stringify(leaveForm) })
      setLeaveForm((f) => ({ ...f, reason: '' }))
      setMessage(`Leave ${r.data?.leaveType} submitted (${r.data?.days}d)`)
      await load()
      setTab('leave')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const decideLeave = async (id: string, what: 'approve' | 'reject') => {
    try {
      setError('')
      await api(`/api/wave3/hr/leave/${id}/${what}`, { method: 'POST', body: '{}' })
      setMessage(`Leave ${what}d`)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const logAttendance = async () => {
    try {
      setError('')
      setMessage('')
      if (!attForm.employeeId) throw new Error('Employee required')
      const body: any = {
        employeeId: attForm.employeeId,
        date: attForm.date,
        status: attForm.status,
        notes: attForm.notes || null,
      }
      if (attForm.clockIn) body.clockIn = `${attForm.date}T${attForm.clockIn}:00Z`
      if (attForm.clockOut) body.clockOut = `${attForm.date}T${attForm.clockOut}:00Z`
      await api('/api/wave3/hr/attendance', { method: 'POST', body: JSON.stringify(body) })
      setMessage('Attendance logged')
      await load()
      setTab('attendance')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const runPayroll = async () => {
    try {
      setError('')
      setMessage('')
      if (!payForm.period) throw new Error('Period required')
      const r = await api('/api/hr/payroll', {
        method: 'POST',
        body: JSON.stringify({
          period: payForm.period,
          totalAmount: Number(payForm.totalAmount) || 0,
          currency: payForm.currency,
          employeeCount: employees.filter((e) => e.status === 'Active').length,
        }),
      })
      setMessage(`Payroll ${r.data?.period} processed`)
      await load()
      setTab('payroll')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const empOpts = employees.map((e) => (
    <option key={e.id} value={e.id}>
      {e.name} — {e.department || '—'}
    </option>
  ))

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #29 · Human Capital</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            HR Core & Payroll
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ people · leave Pending→Approved/Rejected · attendance · payroll · audited.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
        >
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Attrition & payroll AI"
        subtitle="Flags attrition risk from leave backlog and sparse attendance — classic SAP HCM has no coach"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'hr', prompt: 'Assess attrition risk and payroll exceptions. Prioritise pending leave and attendance gaps.' }}
        cta="Advise HR"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Employees', value: employees.length },
          { label: 'Pending leave', value: leaves.filter((l) => l.status === 'Pending').length },
          { label: 'Attendance rows', value: attendance.length },
          { label: 'Payroll runs', value: payroll.length },
        ].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['people', 'Employees'],
            ['leave', 'Leave'],
            ['attendance', 'Attendance'],
            ['payroll', 'Payroll'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
              tab === id ? 'bg-harvics-burgundy text-harvics-cream' : 'border border-harvics-burgundy/25'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

      {!loading && tab === 'people' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New employee</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name *" value={empForm.name} onChange={(e) => setEmpForm((f) => ({ ...f, name: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Department *" value={empForm.department} onChange={(e) => setEmpForm((f) => ({ ...f, department: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Position" value={empForm.position} onChange={(e) => setEmpForm((f) => ({ ...f, position: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Country" value={empForm.country} onChange={(e) => setEmpForm((f) => ({ ...f, country: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="City" value={empForm.city} onChange={(e) => setEmpForm((f) => ({ ...f, city: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Salary" value={empForm.salary} onChange={(e) => setEmpForm((f) => ({ ...f, salary: e.target.value }))} />
            <button type="button" onClick={() => void createEmp()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Create employee
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Name', 'Dept', 'Position', 'Country', 'Salary', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">No employees yet.</td></tr>
                ) : (
                  employees.map((e, i) => (
                    <tr key={e.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-semibold">
                        <Link href={`/${locale}/os/hr/employees/${e.id}`} className="underline decoration-harvics-gold/50">
                          {e.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{e.department || '—'}</td>
                      <td className="px-3 py-2">{e.position || '—'}</td>
                      <td className="px-3 py-2">{e.country || '—'}</td>
                      <td className="px-3 py-2 font-mono">{e.currency} {Number(e.salary || 0).toLocaleString()}</td>
                      <td className="px-3 py-2">{e.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'leave' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Request leave</p>
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={leaveForm.employeeId} onChange={(e) => setLeaveForm((f) => ({ ...f, employeeId: e.target.value }))}>
              <option value="">Employee *</option>
              {empOpts}
            </select>
            {employees.length === 0 ? (
              <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Employee ID *" value={leaveForm.employeeId} onChange={(e) => setLeaveForm((f) => ({ ...f, employeeId: e.target.value }))} />
            ) : null}
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={leaveForm.leaveType} onChange={(e) => setLeaveForm((f) => ({ ...f, leaveType: e.target.value }))}>
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))} />
            <button type="button" onClick={() => void createLeave()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Submit leave
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Employee', 'Type', 'Period', 'Days', 'Status', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">No leave requests.</td></tr>
                ) : (
                  leaves.map((l, i) => (
                    <tr key={l.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono text-xs">
                        <Link href={`/${locale}/os/hr/leave/${l.id}`} className="underline decoration-harvics-gold/50">
                          {employees.find((e) => e.id === l.employeeId)?.name || l.employeeId}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{l.leaveType}</td>
                      <td className="px-3 py-2 text-xs">{new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2 font-mono">{l.days}</td>
                      <td className="px-3 py-2">{l.status}</td>
                      <td className="px-3 py-2">
                        {l.status === 'Pending' ? (
                          <div className="flex gap-1">
                            <button type="button" onClick={() => void decideLeave(l.id, 'approve')} className="border border-green-700 px-2 py-0.5 text-[9px] font-bold uppercase text-green-800">OK</button>
                            <button type="button" onClick={() => void decideLeave(l.id, 'reject')} className="border border-red-300 px-2 py-0.5 text-[9px] font-bold uppercase text-red-800">No</button>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'attendance' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Log attendance</p>
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={attForm.employeeId} onChange={(e) => setAttForm((f) => ({ ...f, employeeId: e.target.value }))}>
              <option value="">Employee *</option>
              {empOpts}
            </select>
            {employees.length === 0 ? (
              <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Employee ID *" value={attForm.employeeId} onChange={(e) => setAttForm((f) => ({ ...f, employeeId: e.target.value }))} />
            ) : null}
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="date" value={attForm.date} onChange={(e) => setAttForm((f) => ({ ...f, date: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="time" value={attForm.clockIn} onChange={(e) => setAttForm((f) => ({ ...f, clockIn: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="time" value={attForm.clockOut} onChange={(e) => setAttForm((f) => ({ ...f, clockOut: e.target.value }))} />
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={attForm.status} onChange={(e) => setAttForm((f) => ({ ...f, status: e.target.value }))}>
              {ATT_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button type="button" onClick={() => void logAttendance()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Log day
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Employee', 'Date', 'In', 'Out', 'Hours', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">No attendance logged.</td></tr>
                ) : (
                  attendance.map((a, i) => (
                    <tr key={a.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono text-xs">{employees.find((e) => e.id === a.employeeId)?.name || a.employeeId}</td>
                      <td className="px-3 py-2">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{a.clockIn ? new Date(a.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="px-3 py-2">{a.clockOut ? new Date(a.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="px-3 py-2 font-mono">{Number(a.hoursWorked || 0).toFixed(1)}</td>
                      <td className="px-3 py-2">{a.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'payroll' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Run payroll</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Period * YYYY-MM" value={payForm.period} onChange={(e) => setPayForm((f) => ({ ...f, period: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Total amount" value={payForm.totalAmount} onChange={(e) => setPayForm((f) => ({ ...f, totalAmount: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Currency" value={payForm.currency} onChange={(e) => setPayForm((f) => ({ ...f, currency: e.target.value }))} />
            <button type="button" onClick={() => void runPayroll()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Process run
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Period', 'Amount', 'Headcount', 'Status', 'Processed'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payroll.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">No payroll runs.</td></tr>
                ) : (
                  payroll.map((p, i) => (
                    <tr key={p.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">{p.period}</td>
                      <td className="px-3 py-2 font-mono">{p.currency} {Number(p.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-3 py-2">{p.employeeCount}</td>
                      <td className="px-3 py-2">{p.status}</td>
                      <td className="px-3 py-2 text-xs">{p.processedDate || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}

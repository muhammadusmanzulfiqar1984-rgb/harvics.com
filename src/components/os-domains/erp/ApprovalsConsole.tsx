'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, inputCls, btnPrimary, btnDanger, btnGhost, api } from './_shell'

interface Notification {
  id: string
  ts: string
  category: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  title: string
  body: string
  status: 'unread' | 'read' | 'archived' | 'actioned'
}

interface Approval {
  id: string
  ts: string
  requesterId: string
  requesterRole: string
  approverRole: string
  entityType: string
  entityId: string
  entitySummary: string
  status: 'pending' | 'approved' | 'rejected'
  priority: 'low' | 'normal' | 'high' | 'critical'
  dueBy?: string
}

const PRIORITY_TONE: Record<string, string> = {
  critical: 'bg-rose-100 text-rose-700',
  high: 'bg-amber-100 text-amber-700',
  normal: 'bg-sky-100 text-sky-700',
  low: 'bg-slate-100 text-slate-700',
}

const STATUS_TONE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
}

export default function ApprovalsConsole() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    const [n, a] = await Promise.all([
      api<Notification[]>('/api/modules/demo/notifications'),
      api<Approval[]>('/api/modules/demo/approvals'),
    ])
    if (n.ok && n.data) setNotifications(n.data)
    if (a.ok && a.data) setApprovals(a.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  const decide = async (id: string, decision: 'approved' | 'rejected') => {
    const r = await api(`/api/modules/demo/approvals/${id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, note: noteDraft[id] || undefined }),
    })
    setMessage(r.ok ? `${id} ${decision}` : r.error || 'Decision failed')
    if (r.ok) {
      setNoteDraft(prev => ({ ...prev, [id]: '' }))
      load()
    }
  }

  const pending = approvals.filter(a => a.status === 'pending')
  const decided = approvals.filter(a => a.status !== 'pending').slice(0, 10)
  const unread = notifications.filter(n => n.status === 'unread').length
  const critical = notifications.filter(n => n.priority === 'critical').length

  return (
    <ConsoleShell
      title="Approvals & Notifications"
      subtitle="Live cross-module event stream. Approvals route by escalation rules — production pipeline, demo data."
      kpis={[
        { label: 'Pending Approvals', value: pending.length },
        { label: 'Decided (recent)', value: decided.length },
        { label: 'Notifications', value: notifications.length, sub: `${unread} unread` },
        { label: 'Critical', value: critical },
      ]}
      message={message}
      onRefresh={load}
      loading={loading}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Pending Approvals" count={pending.length}>
          <div className="grid max-h-[28rem] gap-2 overflow-auto">
            {pending.map(a => (
              <div key={a.id} className="rounded-lg border border-[#e8e2d5] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold">{a.entityType} · {a.entityId}</p>
                    <p className="mt-0.5 text-[11px] text-[#5d5d5d]">{a.entitySummary}</p>
                    <p className="mt-1 text-[10px] text-[#5d5d5d]">
                      Requested by <span className="font-bold">{a.requesterId}</span> ({a.requesterRole}) · approver: <span className="font-bold">{a.approverRole}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_TONE[a.priority] || 'bg-slate-100'}`}>{a.priority}</span>
                    {a.dueBy ? <span className="text-[10px] text-[#5d5d5d]">due {new Date(a.dueBy).toLocaleDateString()}</span> : null}
                  </div>
                </div>
                <input
                  className={`${inputCls} mt-2`}
                  placeholder="Decision note (optional)"
                  value={noteDraft[a.id] || ''}
                  onChange={e => setNoteDraft(prev => ({ ...prev, [a.id]: e.target.value }))}
                />
                <div className="mt-2 flex gap-1">
                  <button type="button" onClick={() => decide(a.id, 'approved')} className={btnPrimary}>Approve</button>
                  <button type="button" onClick={() => decide(a.id, 'rejected')} className={btnDanger}>Reject</button>
                </div>
              </div>
            ))}
            {pending.length === 0 ? <p className="text-xs text-[#5d5d5d]">No pending approvals. Trigger one by posting a ledger entry &gt; $50,000 in the Finance console.</p> : null}
          </div>
        </Card>

        <Card title="Notification Stream" count={notifications.length}>
          <div className="grid max-h-[28rem] gap-1.5 overflow-auto">
            {notifications.map(n => (
              <div key={n.id} className="rounded-lg border border-[#e8e2d5] p-2 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{n.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_TONE[n.priority] || 'bg-slate-100'}`}>{n.priority}</span>
                </div>
                <p className="mt-0.5 text-[#5d5d5d]">{n.body}</p>
                <p className="mt-1 text-[10px] text-[#5d5d5d]">
                  <span className="font-mono">{n.category}</span> · {new Date(n.ts).toLocaleTimeString()}
                </p>
              </div>
            ))}
            {notifications.length === 0 ? <p className="text-xs text-[#5d5d5d]">No notifications. Hire an employee, win a lead, or complete a work order to fire one.</p> : null}
          </div>
        </Card>
      </div>

      {decided.length > 0 ? (
        <Card title="Recent Decisions" count={decided.length}>
          <div className="grid max-h-72 gap-1.5 overflow-auto">
            {decided.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#e8e2d5] px-3 py-2 text-xs">
                <div className="min-w-0">
                  <p className="font-bold">{a.entityType} · {a.entityId}</p>
                  <p className="text-[11px] text-[#5d5d5d] truncate">{a.entitySummary}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[a.status] || 'bg-slate-100'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </ConsoleShell>
  )
}

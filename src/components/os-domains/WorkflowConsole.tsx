'use client'

import { useEffect, useState } from 'react'

interface KPIData {
  orders: { total: number; completed: number; pending: number }
  invoices: { paid: number; outstanding: number }
  inventory: { value: number; skus: number; lowStock: number }
}

interface InventoryItem {
  sku: string
  name: string
  category: string
  warehouse: string
  qty: number
  reserved: number
  unitPrice: number
  currency: string
}

interface Invoice {
  id: string
  orderId: string
  customer: string
  amount: number
  currency: string
  status: 'Draft' | 'Issued' | 'Paid' | 'Cancelled'
}

interface WorkflowEvent {
  id: string
  type: string
  message: string
  ref?: string
  at: string
}

const STATUS_TONE: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-sky-100 text-sky-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700',
  Issued: 'bg-amber-100 text-amber-700',
  Paid: 'bg-emerald-100 text-emerald-700',
  Draft: 'bg-slate-100 text-slate-700',
}

const EVENT_TONE: Record<string, string> = {
  'order.created': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'order.status': 'bg-sky-50 text-sky-700 border-sky-200',
  'order.deleted': 'bg-rose-50 text-rose-700 border-rose-200',
  'inventory.reserved': 'bg-amber-50 text-amber-700 border-amber-200',
  'inventory.released': 'bg-slate-50 text-slate-700 border-slate-200',
  'inventory.shipped': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'inventory.created': 'bg-sky-50 text-sky-700 border-sky-200',
  'inventory.updated': 'bg-slate-50 text-slate-700 border-slate-200',
  'inventory.deleted': 'bg-rose-50 text-rose-700 border-rose-200',
  'invoice.issued': 'bg-amber-50 text-amber-700 border-amber-200',
  'invoice.paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'invoice.status': 'bg-sky-50 text-sky-700 border-sky-200',
}

export default function WorkflowConsole() {
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [events, setEvents] = useState<WorkflowEvent[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [skuForm, setSkuForm] = useState({ sku: '', name: '', category: 'General', warehouse: 'Dubai-W1', qty: '100', unitPrice: '10' })
  const [adjustQty, setAdjustQty] = useState<Record<string, string>>({})

  const loadAll = async () => {
    setLoading(true)
    try {
      const [k, i, v, e] = await Promise.all([
        fetch('/api/modules/demo/kpis').then(r => r.json()),
        fetch('/api/modules/demo/inventory').then(r => r.json()),
        fetch('/api/modules/demo/invoices').then(r => r.json()),
        fetch('/api/modules/demo/workflow').then(r => r.json()),
      ])
      if (k?.success) setKpis(k.data)
      if (i?.success) setInventory(i.data)
      if (v?.success) setInvoices(v.data)
      if (e?.success) setEvents(e.data)
    } catch {
      setMessage('Failed to load workspace data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    const id = setInterval(loadAll, 8000)
    return () => clearInterval(id)
  }, [])

  const createSku = async () => {
    if (!skuForm.sku.trim() || !skuForm.name.trim()) {
      setMessage('SKU and name are required')
      return
    }
    setMessage('')
    try {
      const res = await fetch('/api/modules/demo/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: skuForm.sku.trim(),
          name: skuForm.name.trim(),
          category: skuForm.category,
          warehouse: skuForm.warehouse,
          qty: Number(skuForm.qty || 0),
          unitPrice: Number(skuForm.unitPrice || 0),
        }),
      })
      const payload = await res.json()
      if (!res.ok || !payload?.success) {
        setMessage(payload?.error || 'Create failed')
      } else {
        setMessage(`SKU ${payload.data.sku} created`)
        setSkuForm(prev => ({ ...prev, sku: '', name: '' }))
        await loadAll()
      }
    } catch {
      setMessage('Create failed')
    }
  }

  const adjustStock = async (sku: string) => {
    const qty = Number(adjustQty[sku])
    if (Number.isNaN(qty)) return
    try {
      const res = await fetch(`/api/modules/demo/inventory/${sku}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty }),
      })
      const payload = await res.json()
      if (payload?.success) {
        setMessage(`SKU ${sku} qty → ${qty}`)
        setAdjustQty(prev => ({ ...prev, [sku]: '' }))
        await loadAll()
      }
    } catch {
      setMessage('Adjust failed')
    }
  }

  const removeSku = async (sku: string) => {
    try {
      const res = await fetch(`/api/modules/demo/inventory/${sku}`, { method: 'DELETE' })
      const payload = await res.json()
      if (payload?.success) {
        setMessage(`SKU ${sku} removed`)
        await loadAll()
      } else {
        setMessage(payload?.error || 'Delete failed')
      }
    } catch {
      setMessage('Delete failed')
    }
  }

  const setInvoiceStatus = async (id: string, status: Invoice['status']) => {
    try {
      const res = await fetch(`/api/modules/demo/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const payload = await res.json()
      if (payload?.success) {
        setMessage(`Invoice ${id} → ${status}`)
        await loadAll()
      }
    } catch {
      setMessage('Invoice update failed')
    }
  }

  return (
    <section className="mx-auto mt-6 w-[min(1400px,94vw)] space-y-4">
      <div className="rounded-2xl border border-[#c3a35e]/30 bg-[linear-gradient(140deg,#1f0f14_0%,#3d161f_45%,#5e1f2d_100%)] p-5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Order-to-Cash Workspace</h2>
            <p className="text-sm text-white/75">Live workflow: orders reserve inventory, auto-issue invoices, and complete the cash cycle.</p>
          </div>
          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#f2dfb5]"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {kpis ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[#c3a35e]/30 bg-white/10 p-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-white/70">Orders</div>
              <div className="font-mono text-2xl font-bold text-[#f2dfb5]">{kpis.orders.total}</div>
              <div className="text-xs text-white/70">{kpis.orders.completed} completed · {kpis.orders.pending} active</div>
            </div>
            <div className="rounded-xl border border-[#c3a35e]/30 bg-white/10 p-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-white/70">Cash Cycle</div>
              <div className="font-mono text-2xl font-bold text-[#f2dfb5]">${kpis.invoices.paid.toLocaleString()}</div>
              <div className="text-xs text-white/70">${kpis.invoices.outstanding.toLocaleString()} outstanding</div>
            </div>
            <div className="rounded-xl border border-[#c3a35e]/30 bg-white/10 p-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-white/70">Inventory</div>
              <div className="font-mono text-2xl font-bold text-[#f2dfb5]">${kpis.inventory.value.toLocaleString()}</div>
              <div className="text-xs text-white/70">{kpis.inventory.skus} SKUs · {kpis.inventory.lowStock} low</div>
            </div>
          </div>
        ) : null}
      </div>

      {message ? (
        <div className="rounded-xl border border-[#c3a35e]/40 bg-white px-4 py-2 text-xs text-[#5d5d5d] shadow-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Inventory column */}
        <div className="rounded-2xl border border-[#e8e2d5] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Inventory</h3>
            <span className="text-xs text-[#5e5e5e]">{inventory.length} SKUs</span>
          </div>

          <div className="mb-3 grid gap-2 rounded-xl border border-[#e8e2d5] bg-[#fbf8f1] p-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                value={skuForm.sku}
                onChange={e => setSkuForm(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="SKU"
                className="rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs"
              />
              <input
                value={skuForm.name}
                onChange={e => setSkuForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Name"
                className="rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                value={skuForm.category}
                onChange={e => setSkuForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Category"
                className="rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs"
              />
              <input
                value={skuForm.qty}
                onChange={e => setSkuForm(prev => ({ ...prev, qty: e.target.value }))}
                placeholder="Qty"
                className="rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs"
              />
              <input
                value={skuForm.unitPrice}
                onChange={e => setSkuForm(prev => ({ ...prev, unitPrice: e.target.value }))}
                placeholder="Price"
                className="rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs"
              />
            </div>
            <button
              type="button"
              onClick={createSku}
              className="rounded-lg border border-[#6b1f2b] bg-[#6b1f2b] px-2 py-1.5 text-xs font-bold text-white"
            >
              Create SKU
            </button>
          </div>

          <div className="grid max-h-72 gap-2 overflow-auto">
            {inventory.map(item => {
              const available = item.qty - item.reserved
              const low = available < 100
              return (
                <div key={item.sku} className="rounded-lg border border-[#e8e2d5] p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold">{item.sku}</p>
                      <p className="text-[11px] text-[#5d5d5d]">{item.name}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${low ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {available} avail
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#5d5d5d]">
                    {item.warehouse} · {item.currency} {item.unitPrice} · reserved {item.reserved}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <input
                      value={adjustQty[item.sku] ?? ''}
                      onChange={e => setAdjustQty(prev => ({ ...prev, [item.sku]: e.target.value }))}
                      placeholder="Set qty"
                      className="w-20 rounded border border-[#d6d0c3] px-2 py-1 text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => adjustStock(item.sku)}
                      className="rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[10px] font-bold text-[#3a3a3a]"
                    >
                      Adjust
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSku(item.sku)}
                      className="ml-auto rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[10px] font-bold text-[#b42318]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
            {inventory.length === 0 ? <p className="text-xs text-[#5d5d5d]">No SKUs.</p> : null}
          </div>
        </div>

        {/* Invoices column */}
        <div className="rounded-2xl border border-[#e8e2d5] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Invoices</h3>
            <span className="text-xs text-[#5e5e5e]">{invoices.length} total</span>
          </div>
          <div className="grid max-h-[26rem] gap-2 overflow-auto">
            {invoices.map(inv => (
              <div key={inv.id} className="rounded-lg border border-[#e8e2d5] p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold">{inv.id}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[inv.status] || 'bg-slate-100 text-slate-700'}`}>
                    {inv.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#5d5d5d]">
                  Order {inv.orderId} · {inv.customer}
                </p>
                <p className="mt-0.5 text-[11px] font-mono text-[#1a1a1a]">
                  {inv.currency} {inv.amount.toLocaleString()}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setInvoiceStatus(inv.id, 'Paid')}
                    className="rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[10px] font-bold text-[#3a3a3a]"
                  >
                    Mark Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceStatus(inv.id, 'Cancelled')}
                    className="rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[10px] font-bold text-[#b42318]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
            {invoices.length === 0 ? <p className="text-xs text-[#5d5d5d]">No invoices yet. Create an order to auto-generate one.</p> : null}
          </div>
        </div>

        {/* Workflow event log */}
        <div className="rounded-2xl border border-[#e8e2d5] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Workflow Event Stream</h3>
            <span className="text-xs text-[#5e5e5e]">{events.length} events</span>
          </div>
          <div className="grid max-h-[26rem] gap-1.5 overflow-auto">
            {events.map(ev => (
              <div key={ev.id} className={`rounded-lg border px-2 py-1.5 text-[11px] ${EVENT_TONE[ev.type] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.06em]">{ev.type}</span>
                  <span className="text-[10px] text-[#5d5d5d]">{new Date(ev.at).toLocaleTimeString()}</span>
                </div>
                <p className="mt-0.5 text-[11px]">{ev.message}</p>
              </div>
            ))}
            {events.length === 0 ? <p className="text-xs text-[#5d5d5d]">No events yet. Trigger an action above.</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

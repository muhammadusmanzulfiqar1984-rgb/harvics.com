'use client'

/**
 * Module #12 — Distributor Portal (HQ view)
 * DoD: distributor accounts, place/list orders on channel=distributor.
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'accounts' | 'orders' | 'fulfillment'

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

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

const ORDER_NEXT: Record<string, string[]> = {
  Pending: ['Processing', 'On Hold', 'Cancelled'],
  Processing: ['In Transit', 'On Hold', 'Cancelled'],
  'On Hold': ['Processing', 'Cancelled'],
  'In Transit': ['Delivered', 'Completed'],
  Delivered: ['Completed'],
  Completed: [],
  Cancelled: [],
}

export default function CommercialModuleTwelveDistributor() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('accounts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [acctForm, setAcctForm] = useState({ name: '', country: '', contactEmail: '', city: '' })
  const [orderForm, setOrderForm] = useState({ customer: '', sku: '', qty: '1', unitPrice: '', city: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, o] = await Promise.all([
        api('/api/crm/customers?segment=Distributor&limit=200'),
        api('/api/orders?limit=200'),
      ])
      setAccounts(c.data || [])
      const all = o.data || []
      setOrders(all.filter((row: any) => String(row.channel || '').toLowerCase() === 'distributor'))
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #12')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const createAccount = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/crm/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: acctForm.name,
          segment: 'Distributor',
          country: acctForm.country || undefined,
          city: acctForm.city || undefined,
          contactEmail: acctForm.contactEmail || undefined,
        }),
      })
      setAcctForm({ name: '', country: '', contactEmail: '', city: '' })
      setMessage('Distributor account created')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const placeOrder = async () => {
    try {
      setError('')
      setMessage('')
      const qty = Number(orderForm.qty) || 1
      const unitPrice = Number(orderForm.unitPrice) || 0
      const r = await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer: orderForm.customer,
          customerName: orderForm.customer,
          city: orderForm.city || undefined,
          channel: 'distributor',
          amount: qty * unitPrice,
          items: [{ sku: orderForm.sku, qty, unitPrice }],
        }),
      })
      setOrderForm({ customer: orderForm.customer, sku: '', qty: '1', unitPrice: '', city: '' })
      setMessage(`Order ${r.data?.id?.slice(0, 8) || ''} placed`)
      await load()
      setTab('orders')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const advance = async (id: string, status: string) => {
    try {
      setError('')
      await api(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #12 · Commercial</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Distributor Portal
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            HQ view: distributor accounts and replenishment orders. Public portal stays at /portal/distributor.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/sales-distribution`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Sales
          </Link>
          <Link
            href={`/${locale}/portal/distributor`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Portal
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Distributor HQ coach"
        subtitle="Replenishment risk and account health from live orders"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'distributor' }}
        cta="Advise distributors"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Distributors</div>
          <div className="mt-1 font-mono text-lg font-semibold">{accounts.length}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Open orders</div>
          <div className="mt-1 font-mono text-lg font-semibold">
            {orders.filter((o) => !['Completed', 'Cancelled', 'Delivered'].includes(o.status)).length}
          </div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">In transit</div>
          <div className="mt-1 font-mono text-lg font-semibold">
            {orders.filter((o) => o.status === 'In Transit').length}
          </div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Completed</div>
          <div className="mt-1 font-mono text-lg font-semibold">
            {orders.filter((o) => o.status === 'Completed' || o.status === 'Delivered').length}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['accounts', 'Accounts'],
            ['orders', 'Orders'],
            ['fulfillment', 'Fulfillment'],
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

      {!loading && tab === 'accounts' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New distributor</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Name *"
              value={acctForm.name}
              onChange={(e) => setAcctForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Country"
              value={acctForm.country}
              onChange={(e) => setAcctForm((f) => ({ ...f, country: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="City"
              value={acctForm.city}
              onChange={(e) => setAcctForm((f) => ({ ...f, city: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Email"
              value={acctForm.contactEmail}
              onChange={(e) => setAcctForm((f) => ({ ...f, contactEmail: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createAccount()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Create
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Name', 'Country', 'City', 'Email'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-harvics-burgundy/45">No distributors yet.</td>
                  </tr>
                ) : (
                  accounts.map((a, i) => (
                    <tr key={a.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-semibold">{a.name}</td>
                      <td className="px-3 py-2">{a.country || '—'}</td>
                      <td className="px-3 py-2">{a.city || '—'}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/60">{a.contactEmail || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'orders' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Place order</p>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={orderForm.customer}
              onChange={(e) => setOrderForm((f) => ({ ...f, customer: e.target.value }))}
            >
              <option value="">Distributor *</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="SKU *"
              value={orderForm.sku}
              onChange={(e) => setOrderForm((f) => ({ ...f, sku: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Qty"
              type="number"
              value={orderForm.qty}
              onChange={(e) => setOrderForm((f) => ({ ...f, qty: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Unit price"
              type="number"
              value={orderForm.unitPrice}
              onChange={(e) => setOrderForm((f) => ({ ...f, unitPrice: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="City"
              value={orderForm.city}
              onChange={(e) => setOrderForm((f) => ({ ...f, city: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void placeOrder()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Place order
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Order', 'Distributor', 'Amount', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">No distributor orders yet.</td>
                  </tr>
                ) : (
                  orders.map((o, i) => (
                    <tr key={o.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono">
                        <Link
                          href={`/${locale}/os/distributors/orders/${o.id}`}
                          className="underline decoration-harvics-gold/50 underline-offset-2"
                        >
                          {(o.id || '').slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-semibold">{o.customerName || o.customer || '—'}</td>
                      <td className="px-3 py-2 font-mono">{fmt(o.amount)}</td>
                      <td className="px-3 py-2">{o.status}</td>
                      <td className="space-x-1 px-3 py-2">
                        <Link
                          href={`/${locale}/os/distributors/orders/${o.id}`}
                          className="border border-harvics-burgundy/20 px-2 py-1 text-[10px] font-bold uppercase"
                        >
                          Open
                        </Link>
                        {(ORDER_NEXT[o.status] || []).slice(0, 2).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => void advance(o.id, st)}
                            className="border border-harvics-gold/50 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            {st}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'fulfillment' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Order', 'Distributor', 'Status', 'Next steps'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.filter((o) => !['Completed', 'Cancelled'].includes(o.status)).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No open fulfillment work.
                  </td>
                </tr>
              ) : (
                orders
                  .filter((o) => !['Completed', 'Cancelled'].includes(o.status))
                  .map((o, i) => (
                    <tr key={o.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono">
                        <Link
                          href={`/${locale}/os/distributors/orders/${o.id}`}
                          className="underline decoration-harvics-gold/50"
                        >
                          {(o.id || '').slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{o.customerName || o.customer || '—'}</td>
                      <td className="px-3 py-2 font-semibold">{o.status}</td>
                      <td className="space-x-1 px-3 py-2">
                        {(ORDER_NEXT[o.status] || []).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => void advance(o.id, st)}
                            className="border border-harvics-burgundy/25 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            {st}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

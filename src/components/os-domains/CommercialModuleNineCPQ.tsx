'use client'

/**
 * Module #9 — CPQ Engine
 * DoD: quote with lines, status workflow, Accept → optional AR invoice.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'quotes' | 'builder' | 'orders' | 'prices'

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

const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0)

type Line = { sku: string; description: string; qty: string; unitPrice: string; discount: string }

export default function CommercialModuleNineCPQ() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('quotes')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [quotes, setQuotes] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])

  const [customerName, setCustomerName] = useState('')
  const [discount, setDiscount] = useState('0')
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')
  const [taxCountry, setTaxCountry] = useState('AE')
  const [taxType, setTaxType] = useState('VAT')
  const [salesOrders, setSalesOrders] = useState<any[]>([])
  const [priceLists, setPriceLists] = useState<any[]>([])
  const [plName, setPlName] = useState('Standard List')
  const [plSku, setPlSku] = useState('')
  const [plPrice, setPlPrice] = useState('')
  const [lines, setLines] = useState<Line[]>([
    { sku: '', description: '', qty: '1', unitPrice: '', discount: '0' },
  ])

  const preview = useMemo(() => {
    const parsed = lines
      .filter((l) => l.sku && Number(l.qty) > 0)
      .map((l) => {
        const qty = Number(l.qty) || 0
        const unitPrice = Number(l.unitPrice) || 0
        const d = Number(l.discount) || 0
        const lineTotal = +(qty * unitPrice * (1 - d / 100)).toFixed(2)
        return { ...l, lineTotal }
      })
    const subtotal = +parsed.reduce((s, l) => s + l.lineTotal, 0).toFixed(2)
    const headerDisc = Number(discount) || 0
    const afterDisc = +(subtotal * (1 - headerDisc / 100)).toFixed(2)
    return { lines: parsed, subtotal, afterDisc, total: afterDisc }
  }, [lines, discount])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [q, c, so, pl] = await Promise.all([
        api('/api/wave5/quotes?limit=100'),
        api('/api/crm/customers?limit=100').catch(() => ({ data: [] })),
        api('/api/wave5/sales-orders?limit=50').catch(() => ({ data: [] })),
        api('/api/wave5/price-lists').catch(() => ({ data: [] })),
      ])
      setQuotes(q.data || [])
      setCustomers(c.data || [])
      setSalesOrders(so.data || [])
      setPriceLists(pl.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #9 CPQ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const createQuote = async () => {
    try {
      setError('')
      setMessage('')
      if (!customerName.trim()) throw new Error('Customer required')
      if (preview.lines.length === 0) throw new Error('Add at least one line with SKU and qty')
      if (!/^[A-Z]{2}$/.test(taxCountry.trim().toUpperCase())) {
        throw new Error('Tax country (ISO-2) required — Tax Engine blocks quotes without a rate')
      }
      const r = await api('/api/wave5/quotes', {
        method: 'POST',
        body: JSON.stringify({
          customerName: customerName.trim(),
          discount: Number(discount) || 0,
          validUntil: validUntil || null,
          notes: notes || undefined,
          taxCountry: taxCountry.trim().toUpperCase(),
          taxType,
          lines: preview.lines.map((l) => ({
            sku: l.sku,
            description: l.description || undefined,
            qty: Number(l.qty),
            unitPrice: Number(l.unitPrice) || 0,
            discount: Number(l.discount) || 0,
          })),
        }),
      })
      setCustomerName('')
      setDiscount('0')
      setValidUntil('')
      setNotes('')
      setLines([{ sku: '', description: '', qty: '1', unitPrice: '', discount: '0' }])
      setMessage(
        `Quote ${r.data?.quoteNo} created · ${fmt(r.data?.total || 0)}` +
          (r.data?.taxAmount != null
            ? ` (tax ${fmt(r.data.taxAmount)} @ ${r.data.taxRatePercent}% ${r.data.taxCountry})`
            : ''),
      )
      await load()
      setTab('quotes')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const lookupSku = async (index: number, sku: string, qty: string) => {
    if (!sku.trim()) return
    try {
      const r = await api(
        `/api/wave5/price-lists/lookup?sku=${encodeURIComponent(sku.trim())}&qty=${encodeURIComponent(qty || '1')}`,
      )
      const n = [...lines]
      n[index] = {
        ...n[index],
        unitPrice: String(r.data?.unitPrice ?? n[index].unitPrice),
        discount: String(r.data?.discount ?? n[index].discount),
      }
      setLines(n)
      setMessage(`Price from ${r.data?.priceListName}: ${fmt(r.data?.unitPrice || 0)}`)
    } catch {
      /* optional — manual price still allowed */
    }
  }

  const createPriceList = async () => {
    try {
      setError('')
      if (!plSku.trim() || !(Number(plPrice) > 0)) throw new Error('SKU and unit price required')
      await api('/api/wave5/price-lists', {
        method: 'POST',
        body: JSON.stringify({
          name: plName.trim() || 'Standard List',
          isDefault: priceLists.length === 0,
          entries: [{ sku: plSku.trim(), unitPrice: Number(plPrice), minQty: 1, discount: 0 }],
        }),
      })
      setPlSku('')
      setPlPrice('')
      setMessage('Price list entry saved')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/wave5/quotes/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, createArInvoice: true, createSalesOrder: true }),
      })
      const parts = [`Status → ${status}`]
      if (r.salesOrder?.orderNumber) {
        parts.push(`SO ${r.salesOrder.orderNumber} (${r.salesOrder.status})`)
      }
      if (r.invoice?.invoiceNo) parts.push(`AR ${r.invoice.invoiceNo}`)
      setMessage(parts.join(' · '))
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const byStatus = (s: string) => quotes.filter((q) => q.status === s).length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #9 · Commercial</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            CPQ Engine
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Configure → tax (blocked if missing) → quote. Accept creates Sales Order + optional AR invoice.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/os/crm`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            CRM
          </Link>
          <Link
            href={`/${locale}/os/ar-aging`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            AR
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

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}
      {message ? (
        <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div>
      ) : null}

      <OsSapAiPanel
        title="CPQ advisor"
        subtitle="Prioritises quote pipeline, tax gaps, and accept→AR conversion — classic SAP CPQ has no coach"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'cpq' }}
        cta="Advise quotes"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ['All', quotes.length],
          ['Draft', byStatus('Draft')],
          ['Sent', byStatus('Sent')],
          ['Accepted', byStatus('Accepted')],
          ['Rejected', byStatus('Rejected')],
        ].map(([label, n]) => (
          <div key={String(label)} className="border border-harvics-burgundy/15 bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{n}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['quotes', 'Quotes'],
            ['builder', 'New quote'],
            ['orders', 'Sales orders'],
            ['prices', 'Price lists'],
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

      {!loading && tab === 'quotes' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Quote', 'Customer', 'Lines', 'Tax', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No quotes yet. Open New quote.
                  </td>
                </tr>
              ) : (
                quotes.map((q, i) => (
                  <tr key={q.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link
                        href={`/${locale}/os/cpq/quotes/${q.id}`}
                        className="underline decoration-harvics-gold/50 underline-offset-2"
                      >
                        {q.quoteNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{q.customerName}</td>
                    <td className="px-3 py-2">{(q.lines || []).length}</td>
                    <td className="px-3 py-2 font-mono">{fmt(q.taxAmount || 0, q.currency)}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{fmt(q.total, q.currency)}</td>
                    <td className="px-3 py-2">{q.status}</td>
                    <td className="space-x-1 px-3 py-2">
                      <Link
                        href={`/${locale}/os/cpq/quotes/${q.id}`}
                        className="border border-harvics-burgundy/20 px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        Open
                      </Link>
                      {q.status === 'Draft' ? (
                        <button
                          type="button"
                          onClick={() => void setStatus(q.id, 'Sent')}
                          className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                        >
                          Send
                        </button>
                      ) : null}
                      {q.status === 'Sent' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void setStatus(q.id, 'Accepted')}
                            className="border border-harvics-gold/50 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => void setStatus(q.id, 'Rejected')}
                            className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'orders' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Order', 'Customer', 'Lines', 'Tax', 'Total', 'Status'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salesOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No sales orders yet. Accept a quote to create one.
                  </td>
                </tr>
              ) : (
                salesOrders.map((o, i) => (
                  <tr key={o.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link
                        href={`/${locale}/os/cpq/orders/${o.id}`}
                        className="underline decoration-harvics-gold/50 underline-offset-2"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{o.customerName}</td>
                    <td className="px-3 py-2">{(o.lines || []).length}</td>
                    <td className="px-3 py-2 font-mono">{fmt(o.taxAmount || 0, o.currency)}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{fmt(o.totalAmount || 0, o.currency)}</td>
                    <td className="px-3 py-2">{o.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'prices' ? (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New entry</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="List name"
              value={plName}
              onChange={(e) => setPlName(e.target.value)}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="SKU *"
              value={plSku}
              onChange={(e) => setPlSku(e.target.value)}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Unit price *"
              type="number"
              value={plPrice}
              onChange={(e) => setPlPrice(e.target.value)}
            />
            <button
              type="button"
              onClick={() => void createPriceList()}
              className="w-full bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Save to price list
            </button>
          </div>
          <div className="border border-harvics-burgundy/15 bg-white p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Active lists</p>
            {priceLists.length === 0 ? (
              <p className="py-8 text-center text-sm text-harvics-burgundy/45">No price lists — add SKUs for CPQ auto-pricing.</p>
            ) : (
              priceLists.map((pl) => (
                <div key={pl.id} className="mb-4 border border-harvics-burgundy/10 p-3">
                  <p className="font-semibold">
                    {pl.name}
                    {pl.isDefault ? (
                      <span className="ml-2 text-[10px] font-bold uppercase text-harvics-gold">Default</span>
                    ) : null}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {(pl.entries || []).map((e: any) => (
                      <li key={e.id} className="flex justify-between font-mono">
                        <span>{e.sku}</span>
                        <span>{fmt(e.unitPrice, pl.currency)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {!loading && tab === 'builder' ? (
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Header</p>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value=""
              onChange={(e) => {
                if (e.target.value) setCustomerName(e.target.value)
              }}
            >
              <option value="">Pick CRM customer (optional)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Customer name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Header discount %"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                placeholder="Tax country ISO-2 *"
                maxLength={2}
                value={taxCountry}
                onChange={(e) => setTaxCountry(e.target.value.toUpperCase())}
              />
              <select
                className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
              >
                {['VAT', 'GST', 'Sales', 'Excise', 'Withholding'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="border-t border-harvics-burgundy/15 pt-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">{fmt(preview.subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-mono">{fmt(preview.total)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void createQuote()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Create quote
            </button>
          </div>

          <div className="space-y-3 border border-harvics-burgundy/15 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Lines</p>
              <button
                type="button"
                onClick={() =>
                  setLines((prev) => [...prev, { sku: '', description: '', qty: '1', unitPrice: '', discount: '0' }])
                }
                className="border border-harvics-burgundy/25 px-3 py-1 text-[10px] font-bold uppercase"
              >
                + Line
              </button>
            </div>
            {lines.map((l, i) => (
              <div key={i} className="grid gap-2 border border-harvics-burgundy/10 p-3 md:grid-cols-5">
                <input
                  className="border border-harvics-burgundy/20 px-2 py-1.5 text-sm"
                  placeholder="SKU *"
                  value={l.sku}
                  onChange={(e) => {
                    const n = [...lines]
                    n[i] = { ...n[i], sku: e.target.value }
                    setLines(n)
                  }}
                  onBlur={(e) => void lookupSku(i, e.target.value, l.qty)}
                />
                <input
                  className="border border-harvics-burgundy/20 px-2 py-1.5 text-sm md:col-span-2"
                  placeholder="Description"
                  value={l.description}
                  onChange={(e) => {
                    const n = [...lines]
                    n[i] = { ...n[i], description: e.target.value }
                    setLines(n)
                  }}
                />
                <input
                  className="border border-harvics-burgundy/20 px-2 py-1.5 text-sm"
                  placeholder="Qty"
                  type="number"
                  value={l.qty}
                  onChange={(e) => {
                    const n = [...lines]
                    n[i] = { ...n[i], qty: e.target.value }
                    setLines(n)
                  }}
                />
                <input
                  className="border border-harvics-burgundy/20 px-2 py-1.5 text-sm"
                  placeholder="Unit price"
                  type="number"
                  value={l.unitPrice}
                  onChange={(e) => {
                    const n = [...lines]
                    n[i] = { ...n[i], unitPrice: e.target.value }
                    setLines(n)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

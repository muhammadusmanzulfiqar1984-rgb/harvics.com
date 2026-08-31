'use client'

/**
 * AR Master Data — closes Oracle gaps: customers, items, tax codes, credit limits.
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || 'demo-token-hq' : 'demo-token-hq'
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  ;(h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

type Tab = 'customers' | 'catalog' | 'tax' | 'credit' | 'status'

export default function ArMasterDataPage() {
  const locale = useLocale()
  const search = useSearchParams()
  const initialTab = (search.get('tab') as Tab) || 'status'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [catalog, setCatalog] = useState<any[]>([])
  const [taxCodes, setTaxCodes] = useState<any[]>([])
  const [gaps, setGaps] = useState<any>(null)
  const [creditName, setCreditName] = useState('')
  const [creditLimit, setCreditLimit] = useState('100000')
  const [creditInfo, setCreditInfo] = useState<any>(null)

  const [custForm, setCustForm] = useState({
    name: '',
    code: '',
    contactEmail: '',
    vatNumber: '',
    city: '',
    country: 'AE',
    paymentTerms: 'Net 30',
    currency: 'USD',
    creditLimit: '100000',
  })

  const [itemForm, setItemForm] = useState({
    sku: '',
    description: '',
    hsCode: '',
    uom: 'EA',
    unitPrice: '',
    taxPercent: '5',
  })

  const [taxForm, setTaxForm] = useState({
    code: '',
    name: '',
    rate: '5',
    country: 'AE',
    type: 'VAT',
  })

  const load = useCallback(async () => {
    setError('')
    const [c, cat, tax, gap] = await Promise.all([
      api('/api/finance/ar/customer-master'),
      api('/api/finance/ar/catalog'),
      api('/api/finance/ar/tax-codes'),
      api('/api/finance/ar/oracle-gaps'),
    ])
    setCustomers(c.data || [])
    setCatalog(cat.data || [])
    setTaxCodes(tax.data || [])
    setGaps(gap.data)
  }, [])

  useEffect(() => {
    const t = search.get('tab') as Tab | null
    if (t && ['customers', 'catalog', 'tax', 'credit', 'status'].includes(t)) setTab(t)
  }, [search])

  useEffect(() => {
    void load().catch((e) => setError(e.message))
  }, [load])

  const saveCustomer = async () => {
    try {
      await api('/api/finance/ar/customer-master', {
        method: 'POST',
        body: JSON.stringify({
          ...custForm,
          creditLimit: Number(custForm.creditLimit),
        }),
      })
      setMessage('Customer saved to master + credit synced')
      setCustForm({ name: '', code: '', contactEmail: '', vatNumber: '', city: '', country: 'AE', paymentTerms: 'Net 30', currency: 'USD', creditLimit: '100000' })
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const saveItem = async () => {
    try {
      await api('/api/finance/ar/catalog', { method: 'POST', body: JSON.stringify({ ...itemForm, unitPrice: Number(itemForm.unitPrice), taxPercent: Number(itemForm.taxPercent) }) })
      setMessage('Catalog item saved')
      setItemForm({ sku: '', description: '', hsCode: '', uom: 'EA', unitPrice: '', taxPercent: '5' })
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const saveTax = async () => {
    try {
      await api('/api/finance/ar/tax-codes', { method: 'POST', body: JSON.stringify({ ...taxForm, rate: Number(taxForm.rate) }) })
      setMessage('Tax code saved')
      setTaxForm({ code: '', name: '', rate: '5', country: 'AE', type: 'VAT' })
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const updateCredit = async () => {
    try {
      const r = await api(`/api/finance/ar/credit/${encodeURIComponent(creditName)}`, {
        method: 'PUT',
        body: JSON.stringify({ approvedLimit: Number(creditLimit) }),
      })
      setCreditInfo(r.data)
      setMessage(r.message || 'Credit updated')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const checkCredit = async (name: string) => {
    try {
      const r = await api(`/api/finance/ar/credit/${encodeURIComponent(name)}`)
      setCreditName(name)
      setCreditInfo(r.data)
      setCreditLimit(String(r.data?.approvedLimit || 100000))
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title="AR Master Data"
      subtitle="Close Oracle gaps — customers · items · tax · credit"
      activeDomain="ar"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'AR', href: '/os/ar-aging' },
        { label: 'Master data' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap gap-2">
          <Link href={`/${locale}/os/ar-aging`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← AR
          </Link>
          <Link href={`/${locale}/os/ar/invoices/new`} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Invoice Intelligence
          </Link>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

        <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
          {(
            [
              ['status', 'Oracle gap status'],
              ['customers', 'Customer master'],
              ['catalog', 'Item catalog'],
              ['tax', 'Tax codes'],
              ['credit', 'Credit limits'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${tab === id ? 'bg-harvics-burgundy text-harvics-cream' : 'border border-harvics-burgundy/25'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'status' && gaps ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-harvics-gold/40 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Closed vs Oracle (invoice path)</p>
              <ul className="mt-3 space-y-1 text-sm">
                {(gaps.gapsClosed || []).map((g: string) => (
                  <li key={g}>✓ {g}</li>
                ))}
              </ul>
            </div>
            <div className="border border-harvics-burgundy/20 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-burgundy/50">Oracle parity</p>
              {gaps.oracleParityComplete || !(gaps.gapsRemaining || []).length ? (
                <p className="mt-3 text-lg font-semibold text-harvics-gold">{gaps.oracleParityScore || '100%'} — complete</p>
              ) : (
                <ul className="mt-3 space-y-1 text-sm text-harvics-burgundy/70">
                  {(gaps.gapsRemaining || []).map((g: string) => (
                    <li key={g}>○ {g}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Customers', gaps.customerMaster],
                ['Items', gaps.catalogItems],
                ['Tax codes', gaps.taxCodes],
                ['HPay link', gaps.payLink ? 'On' : 'Off'],
              ].map(([k, v]) => (
                <div key={k as string} className="border border-harvics-burgundy/15 bg-harvics-cream/40 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-xl font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <Link
                href={`/${locale}/os/finance/global-house`}
                className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
              >
                Open Global House →
              </Link>
            </div>
          </div>
        ) : null}

        {tab === 'customers' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 border border-harvics-burgundy/15 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add / update customer</p>
              {(['name', 'code', 'contactEmail', 'vatNumber', 'city', 'country', 'paymentTerms', 'currency', 'creditLimit'] as const).map((f) => (
                <input
                  key={f}
                  className="w-full border border-harvics-burgundy/20 px-3 py-2 text-sm"
                  placeholder={f}
                  value={(custForm as any)[f]}
                  onChange={(e) => setCustForm((s) => ({ ...s, [f]: e.target.value }))}
                />
              ))}
              <button type="button" onClick={() => void saveCustomer()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
                Save customer master
              </button>
            </div>
            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-harvics-cream">
                    {['Code', 'Name', 'VAT', 'Email', 'Limit', ''].map((h) => (
                      <th key={h || 'x'} className="px-2 py-2 text-[10px] uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-t border-harvics-burgundy/10">
                      <td className="px-2 py-2">{c.code}</td>
                      <td className="px-2 py-2 font-semibold">
                        <Link href={`/${locale}/os/ar/customers/${encodeURIComponent(c.name)}`} className="underline decoration-harvics-gold/40">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-2 py-2">{c.vatNumber || '—'}</td>
                      <td className="px-2 py-2">{c.contactEmail || '—'}</td>
                      <td className="px-2 py-2">{c.creditLimit?.toLocaleString()}</td>
                      <td className="px-2 py-2">
                        <button type="button" className="text-[10px] underline" onClick={() => void checkCredit(c.name)}>
                          Credit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'catalog' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 border border-harvics-burgundy/15 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add catalog item</p>
              {(['sku', 'description', 'hsCode', 'uom', 'unitPrice', 'taxPercent'] as const).map((f) => (
                <input
                  key={f}
                  className="w-full border border-harvics-burgundy/20 px-3 py-2 text-sm"
                  placeholder={f}
                  value={(itemForm as any)[f]}
                  onChange={(e) => setItemForm((s) => ({ ...s, [f]: e.target.value }))}
                />
              ))}
              <button type="button" onClick={() => void saveItem()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
                Save item
              </button>
            </div>
            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-harvics-cream">
                    {['SKU', 'Description', 'HS', 'Price', 'Tax%'].map((h) => (
                      <th key={h} className="px-2 py-2 text-[10px] uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catalog.map((it) => (
                    <tr key={it.id || it.sku} className="border-t border-harvics-burgundy/10">
                      <td className="px-2 py-2">{it.sku}</td>
                      <td className="px-2 py-2">{it.description}</td>
                      <td className="px-2 py-2">{it.hsCode || '—'}</td>
                      <td className="px-2 py-2">{it.unitPrice}</td>
                      <td className="px-2 py-2">{it.taxPercent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'tax' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 border border-harvics-burgundy/15 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add tax code</p>
              <input className="w-full border px-3 py-2 text-sm" placeholder="code" value={taxForm.code} onChange={(e) => setTaxForm((s) => ({ ...s, code: e.target.value }))} />
              <input className="w-full border px-3 py-2 text-sm" placeholder="name" value={taxForm.name} onChange={(e) => setTaxForm((s) => ({ ...s, name: e.target.value }))} />
              <input className="w-full border px-3 py-2 text-sm" placeholder="rate %" value={taxForm.rate} onChange={(e) => setTaxForm((s) => ({ ...s, rate: e.target.value }))} />
              <input className="w-full border px-3 py-2 text-sm" placeholder="country" value={taxForm.country} onChange={(e) => setTaxForm((s) => ({ ...s, country: e.target.value }))} />
              <button type="button" onClick={() => void saveTax()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase text-harvics-cream">
                Save tax code
              </button>
            </div>
            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-harvics-cream">
                    {['Code', 'Name', 'Rate', 'Country'].map((h) => (
                      <th key={h} className="px-2 py-2 text-[10px] uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taxCodes.map((t) => (
                    <tr key={t.id} className="border-t border-harvics-burgundy/10">
                      <td className="px-2 py-2 font-mono">{t.code}</td>
                      <td className="px-2 py-2">{t.name}</td>
                      <td className="px-2 py-2">{t.rate}%</td>
                      <td className="px-2 py-2">{t.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'credit' ? (
          <div className="max-w-lg space-y-3 border border-harvics-burgundy/15 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Raise / set credit limit</p>
            <input className="w-full border px-3 py-2 text-sm" placeholder="Customer name" value={creditName} onChange={(e) => setCreditName(e.target.value)} />
            <input className="w-full border px-3 py-2 text-sm" placeholder="Approved limit" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} />
            <button type="button" onClick={() => void updateCredit()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase text-harvics-cream">
              Update credit limit
            </button>
            {creditInfo ? (
              <div className="space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/30 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-harvics-burgundy/55">Approved limit</span>
                  <span className="font-semibold">{Number(creditInfo.approvedLimit || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-harvics-burgundy/55">Open exposure</span>
                  <span>{Number(creditInfo.usedAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-harvics-burgundy/10 pt-2">
                  <span className="text-harvics-burgundy/55">Available</span>
                  <span className="font-semibold text-harvics-gold">{Number(creditInfo.availableAmount || 0).toLocaleString()}</span>
                </div>
                {creditInfo.message ? <p className="text-[12px] text-harvics-burgundy/60">{creditInfo.message}</p> : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}

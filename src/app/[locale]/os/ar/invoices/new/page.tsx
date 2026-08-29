'use client'

/**
 * Invoice Intelligence Studio — AI brief → commercial tax invoice → GL → print.
 * Leapfrogs SAP FB70 (no NL drafting, no trading HS/Incoterms pack, no AI risk pass).
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

type Line = {
  sku: string
  hsCode: string
  description: string
  qty: string
  uom: string
  unitPrice: string
  taxCode: string
  taxPercent: string
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || 'demo-token-hq' : 'demo-token-hq'
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  ;(h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(json?.error || `HTTP ${res.status}`) as Error & { status?: number; payload?: any }
    err.status = res.status
    err.payload = json
    throw err
  }
  return json
}

const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0)

const emptyLine = (taxCode = 'ZERO', taxPercent = '0'): Line => ({
  sku: '',
  hsCode: '',
  description: '',
  qty: '1',
  uom: 'EA',
  unitPrice: '',
  taxCode,
  taxPercent,
})

const EXAMPLES = [
  'Invoice Gulf Foods Trading 100 bags basmati 1121 at USD 42.50 with 5% VAT FOB Dubai net 30 PO-GF-8841',
  'Bill Al Noor Textiles 2500 meters greige fabric at 3.85 EUR CIF Karachi net 45',
  'Invoice Demo Trading LLC ocean freight 1 lot 850 USD plus packing 120 and export docs 95',
]

export default function ArInvoiceIntelligenceStudio() {
  const locale = useLocale()
  const router = useRouter()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [brief, setBrief] = useState(EXAMPLES[0])
  const [customers, setCustomers] = useState<string[]>([])
  const [customerMaster, setCustomerMaster] = useState<any[]>([])
  const [taxCodes, setTaxCodes] = useState<any[]>([])
  const [aiNarrative, setAiNarrative] = useState('')
  const [aiRisks, setAiRisks] = useState<string[]>([])
  const [aiGenerated, setAiGenerated] = useState(false)
  const [collectionsOpener, setCollectionsOpener] = useState('')

  const [customer, setCustomer] = useState('')
  const [billTo, setBillTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [currency, setCurrency] = useState('USD')
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [poNumber, setPoNumber] = useState('')
  const [incoterms, setIncoterms] = useState('FOB')
  const [bankDetails, setBankDetails] = useState('HARVICS TRADE · IBAN AE00 0000 0000 0000 0000 000 · SWIFT HARVAEAD')
  const [notes, setNotes] = useState('')
  const [postToGl, setPostToGl] = useState(true)
  const [lines, setLines] = useState<Line[]>([emptyLine(), emptyLine()])
  const [itemMemory, setItemMemory] = useState<any[]>([])
  const [oracle, setOracle] = useState<any>(null)
  const [oracleFacts, setOracleFacts] = useState<any>(null)
  const [crossing, setCrossing] = useState(false)
  const [creditHold, setCreditHold] = useState<any>(null)
  const [forceCredit, setForceCredit] = useState(false)
  const [defaultTaxCode, setDefaultTaxCode] = useState('ZERO')

  useEffect(() => {
    void api('/api/finance/ar/customer-master')
      .then((r) => {
        setCustomerMaster(r.data || [])
        setCustomers((r.data || []).map((c: any) => c.name).filter(Boolean))
      })
      .catch(() =>
        api('/api/finance/ar/customers')
          .then((r) => setCustomers((r.data || []).map((c: any) => c.customerName).filter(Boolean)))
          .catch(() => {}),
      )
    void api('/api/finance/ar/tax-codes')
      .then((r) => setTaxCodes(r.data || []))
      .catch(() => {})
    void api('/api/finance/ar/item-memory')
      .then((r) => setItemMemory(r.data || []))
      .catch(() => {})
    void api('/api/finance/ar/catalog')
      .then((r) => {
        if (r.data?.length) {
          setItemMemory((prev) => {
            const mapped = r.data.map((c: any) => ({
              sku: c.sku,
              hsCode: c.hsCode,
              description: c.description,
              uom: c.uom,
              lastUnitPrice: c.unitPrice,
              taxPercent: c.taxPercent,
              timesUsed: 99,
              fromCatalog: true,
            }))
            return [...mapped, ...prev]
          })
        }
      })
      .catch(() => {})
  }, [])

  const computed = useMemo(() => {
    let subtotal = 0
    let taxAmount = 0
    const rows = lines.map((l) => {
      const qty = Number(l.qty) || 0
      const unitPrice = Number(l.unitPrice) || 0
      const taxPercent = Number(l.taxPercent) || 0
      const net = +(qty * unitPrice).toFixed(2)
      const tax = +((net * taxPercent) / 100).toFixed(2)
      subtotal += net
      taxAmount += tax
      return { net, tax, total: +(net + tax).toFixed(2) }
    })
    return {
      rows,
      subtotal: +subtotal.toFixed(2),
      taxAmount: +taxAmount.toFixed(2),
      amount: +(subtotal + taxAmount).toFixed(2),
    }
  }, [lines])

  const setLine = (idx: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }
  const addLine = () => setLines((prev) => [...prev, emptyLine(defaultTaxCode, taxCodes.find((t) => t.code === defaultTaxCode)?.rate?.toString() || '0')])
  const removeLine = (idx: number) => setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)))

  const pushItemFromMemory = (it: any) => {
    const tc = taxCodes.find((t) => Number(t.rate) === Number(it.taxPercent))?.code || defaultTaxCode
    setLines((prev) => [
      ...prev.filter((l) => l.description.trim() || l.unitPrice),
      {
        sku: it.sku || '',
        hsCode: it.hsCode || '',
        description: it.description || '',
        qty: '1',
        uom: it.uom || 'EA',
        unitPrice: String(it.lastUnitPrice ?? ''),
        taxCode: tc,
        taxPercent: String(it.taxPercent ?? taxCodes.find((t) => t.code === tc)?.rate ?? 0),
      },
    ])
  }

  const applyTaxCode = (idx: number, code: string) => {
    const tc = taxCodes.find((t) => t.code === code)
    setLine(idx, { taxCode: code, taxPercent: String(tc?.rate ?? 0) })
  }

  const runOracleCross = async () => {
    try {
      setCrossing(true)
      setError('')
      if (!customer.trim()) throw new Error('Set customer first')
      const r = await api('/api/finance/ai/oracle-cross', {
        method: 'POST',
        body: JSON.stringify({
          customer: customer.trim(),
          amount: computed.amount,
          currency,
          lineCount: lines.filter((l) => l.description.trim()).length,
        }),
      })
      setOracle(r.data)
      setOracleFacts(r.facts)
      setMessage(r.data?.headline || 'Oracle-cross complete')
      if (r.data?.creditSignal === 'block') setPostToGl(false)
    } catch (e: any) {
      setError(e.message || 'Oracle-cross failed')
    } finally {
      setCrossing(false)
    }
  }

  const runAiDraft = async () => {
    try {
      setDrafting(true)
      setError('')
      setMessage('')
      const r = await api('/api/finance/ai/draft-invoice', {
        method: 'POST',
        body: JSON.stringify({ brief }),
      })
      const d = r.data
      setCustomer(d.customer || '')
      setBillTo(d.billTo || d.customer || '')
      setCurrency(d.currency || 'USD')
      setInvoiceDate(d.invoiceDate || invoiceDate)
      setDueDate(d.dueDate || '')
      setPaymentTerms(d.paymentTerms || 'Net 30')
      setPoNumber(d.poNumber || '')
      setIncoterms(d.incoterms || 'FOB')
      setBankDetails(d.bankDetails || bankDetails)
      setNotes(d.notes || '')
      setCollectionsOpener(d.collectionsOpener || '')
      setAiNarrative(d.narrative || '')
      setAiRisks(Array.isArray(d.risks) ? d.risks : [])
      setAiGenerated(Boolean(d.aiGenerated))
      setLines(
        (d.lines || []).map((l: any) => {
          const rate = Number(l.taxPercent ?? 0)
          const tc = taxCodes.find((t) => Number(t.rate) === rate)?.code || defaultTaxCode
          return {
            sku: l.sku || '',
            hsCode: l.hsCode || '',
            description: l.description || '',
            qty: String(l.qty ?? 1),
            uom: l.uom || 'EA',
            unitPrice: String(l.unitPrice ?? ''),
            taxCode: l.taxCode || tc,
            taxPercent: String(l.taxPercent ?? 0),
          }
        }),
      )
      setMessage(
        d.aiGenerated
          ? 'AI built a full commercial invoice from your brief — review, then post.'
          : 'Draft built (heuristic). Groq off or failed — still editable.',
      )
    } catch (e: any) {
      setError(e.message || 'AI draft failed')
    } finally {
      setDrafting(false)
    }
  }

  const save = async (asDraft = false) => {
    try {
      setSaving(true)
      setError('')
      setCreditHold(null)
      if (!customer.trim()) throw new Error('Customer is required')
      const payloadLines = lines
        .filter((l) => l.description.trim() && Number(l.qty) > 0 && l.unitPrice !== '')
        .map((l) => ({
          sku: l.sku.trim() || undefined,
          hsCode: l.hsCode.trim() || undefined,
          description: l.description.trim(),
          qty: Number(l.qty),
          uom: l.uom.trim() || 'EA',
          unitPrice: Number(l.unitPrice),
          taxCode: l.taxCode || undefined,
          taxPercent: Number(l.taxPercent) || 0,
        }))
      if (!payloadLines.length) throw new Error('Add at least one line')

      const r = await api('/api/finance/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customer: customer.trim(),
          billTo: billTo.trim() || undefined,
          dueDate: dueDate || undefined,
          invoiceDate: invoiceDate || undefined,
          currency,
          paymentTerms,
          poNumber: poNumber || undefined,
          incoterms,
          bankDetails,
          notes: notes || undefined,
          collectionsOpener: collectionsOpener || undefined,
          type: 'AR',
          saveAsDraft: asDraft,
          postToGl: asDraft ? false : postToGl,
          forceCredit: !asDraft && forceCredit,
          lines: payloadLines,
        }),
      })
      const id = r.data?.id
      if (id) router.push(`/${locale}/os/ar/invoices/${id}${asDraft ? '' : '?print=1'}`)
      else router.push(`/${locale}/os/ar-aging`)
    } catch (e: any) {
      if (e.status === 409 && e.payload?.credit) {
        setCreditHold(e.payload.credit)
        setError(e.message || 'Credit limit exceeded')
      } else {
        setError(e.message || 'Save failed')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <HarvicsOSShell
      title="Invoice Intelligence"
      subtitle="Real path: AI draft → credit gate → GL → PDF → Resend. Built to beat NetSuite on speed + trade DNA."
      activeDomain="ar"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'AR', href: '/os/ar-aging' },
        { label: 'Invoice Intelligence' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/${locale}/os/ar/master`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50">
            AR master data
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={drafting}
              onClick={() => void runAiDraft()}
              className="border border-harvics-gold bg-harvics-gold/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy disabled:opacity-50"
            >
              {drafting ? 'AI drafting…' : 'AI draft from brief'}
            </button>
            <button
              type="button"
              disabled={crossing}
              onClick={() => void runOracleCross()}
              className="border border-harvics-burgundy/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] disabled:opacity-50"
            >
              {crossing ? 'Crossing…' : 'Cross Oracle check'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save(true)}
              className="border border-harvics-burgundy/30 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] disabled:opacity-50"
            >
              Park draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save(false)}
              className="bg-harvics-burgundy px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream disabled:opacity-50"
            >
              {saving ? 'Posting…' : 'Post + GL + print'}
            </button>
          </div>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {creditHold ? (
          <div className="border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Credit hold — Oracle gate blocked post</p>
            <p className="mt-1 text-[13px]">
              Exposure {creditHold.usedAmount} / limit {creditHold.approvedLimit} · available {creditHold.availableAmount}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href={`/${locale}/os/ar/master?tab=credit`} className="text-[11px] font-bold uppercase tracking-[0.12em] underline">
                Raise limit in master
              </Link>
              <label className="flex items-center gap-2 text-[12px]">
                <input type="checkbox" checked={forceCredit} onChange={(e) => setForceCredit(e.target.checked)} />
                Override credit hold (approved)
              </label>
              <button
                type="button"
                disabled={saving || !forceCredit}
                onClick={() => void save(false)}
                className="border border-amber-700 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] disabled:opacity-40"
              >
                Post with override
              </button>
            </div>
          </div>
        ) : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

        {oracle ? (
          <div className="border border-harvics-burgundy/20 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Cross Oracle · NetSuite killer pass</p>
              <div className="flex gap-2 text-[9px] font-bold uppercase tracking-[0.12em]">
                <span className="border border-harvics-burgundy/25 px-2 py-1">Credit {oracle.creditSignal}</span>
                <span className="border border-harvics-burgundy/25 px-2 py-1">Dup {oracle.duplicateRisk}</span>
                {oracle.aiGenerated ? <span className="border border-harvics-gold px-2 py-1 text-harvics-gold">AI</span> : null}
              </div>
            </div>
            <p className="mt-2 text-sm font-semibold">{oracle.headline}</p>
            <p className="mt-1 text-[13px] text-harvics-burgundy/70">{oracle.narrative}</p>
            <p className="mt-2 text-[12px] text-harvics-burgundy/55">{oracle.fxNote}</p>
            {oracleFacts ? (
              <p className="mt-1 text-[12px] text-harvics-burgundy/55">
                Open exposure {oracleFacts.openExposure} · {oracleFacts.openInvoiceCount} open docs ·{' '}
                {(oracleFacts.duplicateCandidates || []).length} near-dupes
              </p>
            ) : null}
            <ul className="mt-3 grid gap-1 sm:grid-cols-2">
              {(oracle.beatOracle || []).map((b: string) => (
                <li key={b} className="border border-harvics-gold/30 bg-harvics-gold/10 px-2 py-1.5 text-[12px]">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {itemMemory.length ? (
          <div className="border border-harvics-burgundy/15 bg-harvics-cream/20 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
              Living item memory · click to add (no NetSuite item-master project)
            </p>
            <div className="flex flex-wrap gap-2">
              {itemMemory.slice(0, 12).map((it) => (
                <button
                  key={`${it.sku}-${it.description}`}
                  type="button"
                  onClick={() => pushItemFromMemory(it)}
                  className="border border-harvics-burgundy/20 bg-white px-2 py-1 text-left text-[11px]"
                >
                  <span className="font-semibold">{it.sku || it.description?.slice(0, 24)}</span>
                  <span className="text-harvics-burgundy/50"> · {it.lastUnitPrice} · ×{it.timesUsed}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="border border-harvics-burgundy/15 bg-white p-4">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Natural language brief</p>
              <p className="text-[12px] text-harvics-burgundy/55">
                One sentence. AI fills customer, Incoterms, HS codes, tax, bank, collections opener — then you confirm.
              </p>
            </div>
            {aiGenerated ? (
              <span className="border border-harvics-gold px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-harvics-gold">
                Groq live
              </span>
            ) : null}
          </div>
          <textarea
            className="min-h-[88px] w-full border border-harvics-burgundy/20 bg-harvics-cream/30 px-3 py-2 text-sm"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setBrief(ex)}
                className="max-w-full truncate border border-harvics-burgundy/20 px-2 py-1 text-[10px] text-harvics-burgundy/70"
              >
                {ex.slice(0, 56)}…
              </button>
            ))}
          </div>
          {aiNarrative ? (
            <p className="mt-3 border-t border-harvics-burgundy/10 pt-3 text-[13px] text-harvics-burgundy/80">{aiNarrative}</p>
          ) : null}
          {aiRisks.length ? (
            <ul className="mt-2 list-disc pl-5 text-[12px] text-harvics-burgundy/60">
              {aiRisks.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="grid gap-3 border border-harvics-burgundy/15 bg-harvics-cream/30 p-4 md:grid-cols-4">
          <label className="block text-[11px] md:col-span-2">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Customer (master)</span>
            <select
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={customer}
              onChange={(e) => {
                const name = e.target.value
                setCustomer(name)
                const m = customerMaster.find((c) => c.name === name)
                if (m) {
                  setBillTo([m.legalName || m.name, m.billToLine1, m.city, m.country].filter(Boolean).join(' · '))
                  setPaymentTerms(m.paymentTerms || 'Net 30')
                  setCurrency(m.currency || 'USD')
                  if (m.contactEmail) setCollectionsOpener(`Hi ${m.name}, please confirm receipt of invoice and settlement date.`)
                  const tc = taxCodes.find((t) => t.country === m.country) || taxCodes.find((t) => t.code === 'ZERO')
                  if (tc) {
                    setDefaultTaxCode(tc.code)
                    setLines((prev) =>
                      prev.map((l) =>
                        !l.description.trim() ? { ...l, taxCode: tc.code, taxPercent: String(tc.rate) } : l,
                      ),
                    )
                  }
                }
              }}
            >
              <option value="">Select customer master…</option>
              {customerMaster.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            <input
              className="mt-2 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Or type customer name"
              list="ar-customers"
            />
            <datalist id="ar-customers">
              {customers.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="block text-[11px]">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Invoice date</span>
            <input
              type="date"
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </label>
          <label className="block text-[11px]">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Due date</span>
            <input
              type="date"
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
          <label className="block text-[11px] md:col-span-2">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Bill-to</span>
            <input
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
              placeholder="Name · city · country"
            />
          </label>
          <label className="block text-[11px]">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Currency</span>
            <select
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>AED</option>
              <option>PKR</option>
            </select>
          </label>
          <label className="block text-[11px]">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Payment terms</span>
            <input
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </label>
          <label className="block text-[11px]">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">PO number</span>
            <input
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
            />
          </label>
          <label className="block text-[11px]">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Incoterms</span>
            <select
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={incoterms}
              onChange={(e) => setIncoterms(e.target.value)}
            >
              <option>FOB</option>
              <option>CIF</option>
              <option>CFR</option>
              <option>EXW</option>
              <option>DAP</option>
            </select>
          </label>
          <label className="block text-[11px] md:col-span-2">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Bank / remittance</span>
            <input
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
            />
          </label>
          <label className="block text-[11px] md:col-span-4">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">Notes</span>
            <input
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <label className="block text-[11px] md:col-span-4">
            <span className="font-bold uppercase tracking-[0.12em] text-harvics-burgundy/50">AI collections opener (auto)</span>
            <input
              className="mt-1 w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={collectionsOpener}
              onChange={(e) => setCollectionsOpener(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-[12px] md:col-span-4">
            <input type="checkbox" checked={postToGl} onChange={(e) => setPostToGl(e.target.checked)} />
            Post to Module #1 GL on save (Dr AR 1100 / Cr Revenue 4000)
          </label>
        </div>

        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <div className="flex items-center justify-between border-b border-harvics-burgundy/10 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Commercial lines · HS · UoM · tax</p>
            <button
              type="button"
              onClick={addLine}
              className="border border-harvics-burgundy/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
            >
              Add line
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['#', 'SKU', 'HS', 'Description', 'Qty', 'UoM', 'Unit', 'Tax code', 'Total', ''].map((h) => (
                  <th key={h || 'x'} className="px-2 py-2 text-[10px] uppercase tracking-[0.1em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((l, idx) => (
                <tr key={idx} className={idx % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                  <td className="px-2 py-1.5 text-harvics-burgundy/50">{idx + 1}</td>
                  <td className="px-1 py-1">
                    <input className="w-20 border border-harvics-burgundy/15 px-2 py-1.5" value={l.sku} onChange={(e) => setLine(idx, { sku: e.target.value })} />
                  </td>
                  <td className="px-1 py-1">
                    <input className="w-20 border border-harvics-burgundy/15 px-2 py-1.5" value={l.hsCode} onChange={(e) => setLine(idx, { hsCode: e.target.value })} placeholder="HS" />
                  </td>
                  <td className="min-w-[160px] px-1 py-1">
                    <input className="w-full border border-harvics-burgundy/15 px-2 py-1.5" value={l.description} onChange={(e) => setLine(idx, { description: e.target.value })} />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" className="w-16 border border-harvics-burgundy/15 px-2 py-1.5" value={l.qty} onChange={(e) => setLine(idx, { qty: e.target.value })} />
                  </td>
                  <td className="px-1 py-1">
                    <input className="w-14 border border-harvics-burgundy/15 px-2 py-1.5" value={l.uom} onChange={(e) => setLine(idx, { uom: e.target.value })} />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" className="w-24 border border-harvics-burgundy/15 px-2 py-1.5" value={l.unitPrice} onChange={(e) => setLine(idx, { unitPrice: e.target.value })} />
                  </td>
                  <td className="px-1 py-1">
                    <select
                      className="w-28 border border-harvics-burgundy/15 bg-white px-1 py-1.5 text-[11px]"
                      value={l.taxCode || ''}
                      onChange={(e) => applyTaxCode(idx, e.target.value)}
                    >
                      <option value="">—</option>
                      {taxCodes.map((t) => (
                        <option key={t.code} value={t.code}>
                          {t.code} ({t.rate}%)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5 font-semibold">{fmt(computed.rows[idx]?.total || 0, currency)}</td>
                  <td className="px-2 py-1">
                    <button type="button" onClick={() => removeLine(idx)} className="text-[10px] font-bold uppercase text-harvics-burgundy/50">
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-2 border border-harvics-burgundy/15 bg-white p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-harvics-burgundy/60">Subtotal</span>
            <span>{fmt(computed.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-harvics-burgundy/60">Tax</span>
            <span>{fmt(computed.taxAmount, currency)}</span>
          </div>
          <div className="flex justify-between border-t border-harvics-burgundy/15 pt-2 text-base font-semibold">
            <span>Invoice total</span>
            <span>{fmt(computed.amount, currency)}</span>
          </div>
        </div>
      </div>
    </HarvicsOSShell>
  )
}

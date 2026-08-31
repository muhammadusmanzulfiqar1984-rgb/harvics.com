'use client'

/**
 * AR commercial tax invoice — print-ready document + collections workflows.
 * Leapfrog: letterhead + HS/Incoterms/bank + AI collections opener on one sheet.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
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

const money = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0)

export default function ArInvoiceDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const search = useSearchParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Bank Transfer')
  const [postToGl, setPostToGl] = useState(true)
  const [sendEmail, setSendEmail] = useState('')
  const [payLinkBusy, setPayLinkBusy] = useState(false)
  const [dunning, setDunning] = useState<any>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/finance/invoices/${id}`)
      setDoc(r.data)
      if (r.data?.outstanding != null) setPayAmount(String(r.data.outstanding))
      const d = await api(`/api/finance/invoices/${id}/dunning`).catch(() => null)
      if (d?.data) setDunning(d.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!doc?.customerName && !doc?.customer) return
    void api('/api/finance/ar/customer-master')
      .then((r) => {
        const m = (r.data || []).find((c: any) => c.name === (doc.customerName || doc.customer))
        if (m?.contactEmail) setSendEmail((prev) => prev || m.contactEmail)
      })
      .catch(() => {})
  }, [doc])

  useEffect(() => {
    if (search.get('paid') === '1' && doc) {
      setMessage('HPay payment received — status updated.')
      void load()
    }
  }, [search, doc, load])

  useEffect(() => {
    if (!loading && doc && search.get('print') === '1') {
      // Don't auto-open print — it hid the download UI. User clicks Download PDF instead.
    }
  }, [loading, doc, search])

  const collect = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/payments', {
        method: 'POST',
        body: JSON.stringify({
          invoiceNo: doc.invoiceNo,
          amount: Number(payAmount),
          method: payMethod,
          postToGl,
        }),
      })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`Payment recorded · ${r.invoiceStatus}${glBit}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const markOverdue = async () => {
    try {
      setError('')
      await api(`/api/finance/invoices/${id}/mark-overdue`, { method: 'POST' })
      setMessage('Marked overdue')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const writeOff = async () => {
    const reason = window.prompt('Write-off reason', 'Bad debt') || undefined
    try {
      setError('')
      const r = await api(`/api/finance/invoices/${id}/write-off`, {
        method: 'POST',
        body: JSON.stringify({ reason, postToGl }),
      })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`${r.message}${glBit}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const creditNote = async () => {
    const reason = window.prompt('Credit note reason', 'Customer credit') || undefined
    try {
      setError('')
      const r = await api(`/api/finance/invoices/${id}/credit-note`, {
        method: 'POST',
        body: JSON.stringify({ reason, postToGl }),
      })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`${r.message}${glBit}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const approve = async () => {
    try {
      setError('')
      const r = await api(`/api/finance/invoices/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ postToGl: true }),
      })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`${r.message}${glBit}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createPayLink = async () => {
    try {
      setPayLinkBusy(true)
      setError('')
      const r = await api(`/api/finance/invoices/${id}/pay-link`, {
        method: 'POST',
        body: JSON.stringify({ origin: window.location.origin, locale }),
      })
      setMessage(`HPay link ready — ${r.data?.url || 'created'}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setPayLinkBusy(false)
    }
  }

  const copyPayLink = () => {
    if (meta.payLinkUrl) {
      void navigator.clipboard.writeText(meta.payLinkUrl)
      setMessage('Pay link copied')
    }
  }

  const sendInvoice = async () => {
    try {
      setError('')
      if (!sendEmail.trim()) throw new Error('Enter buyer email for real Resend delivery')
      const r = await api(`/api/finance/invoices/${id}/send`, {
        method: 'POST',
        body: JSON.stringify({ toEmail: sendEmail.trim() }),
      })
      setMessage(
        r.send?.sent
          ? `Delivered via Resend · id ${r.send.messageId}${r.send.pdfAttached ? ' · PDF attached' : ''}`
          : r.message || 'Send attempted',
      )
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const sendDunning = async () => {
    try {
      setError('')
      const r = await api(`/api/finance/invoices/${id}/dunning/send`, {
        method: 'POST',
        body: JSON.stringify({ toEmail: sendEmail.trim() || undefined }),
      })
      setMessage(r.message || `Dunning L${r.dunning?.stage?.stage} sent`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const downloadPdf = () => {
    const token = localStorage.getItem('auth_token') || 'demo-token-hq'
    void (async () => {
      try {
        const res = await fetch(`/api/finance/invoices/${id}/pdf`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || `PDF HTTP ${res.status}`)
        }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${doc?.invoiceNo || 'invoice'}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        setMessage('PDF downloaded')
      } catch (e: any) {
        setError(e.message || 'PDF download failed')
      }
    })()
  }

  const closed = doc && ['Paid', 'WrittenOff', 'CreditNote', 'Cancelled'].includes(doc.status)
  const isDraft = doc?.status === 'Draft'
  const meta = doc?.meta || {}
  const currency = doc?.currency || 'USD'

  return (
    <HarvicsOSShell
      title={doc?.invoiceNo || 'AR Invoice'}
      subtitle="Commercial tax invoice · PDF · collect"
      activeDomain="ar"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'AR', href: '/os/ar-aging' },
        { label: doc?.invoiceNo || 'Invoice' },
      ]}
      headerActions={
        <button
          type="button"
          onClick={() => downloadPdf()}
          disabled={!doc || loading}
          className="bg-harvics-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy disabled:opacity-40"
        >
          Download PDF
        </button>
      }
      titleActions={
        <>
          <button
            type="button"
            onClick={() => downloadPdf()}
            disabled={!doc || loading}
            className="bg-harvics-burgundy px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-harvics-cream shadow-md disabled:opacity-40"
          >
            ↓ Download PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="border-2 border-harvics-burgundy px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-harvics-burgundy"
          >
            Print
          </button>
        </>
      }
    >
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #harvics-tax-invoice,
          #harvics-tax-invoice * {
            visibility: visible !important;
          }
          #harvics-tax-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 24px !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="no-print sticky top-0 z-20 flex flex-wrap items-center gap-3 border-2 border-harvics-gold bg-harvics-burgundy px-4 py-3 text-harvics-cream shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Invoice actions</span>
          <button
            type="button"
            onClick={() => downloadPdf()}
            disabled={!doc || loading}
            className="bg-harvics-gold px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy disabled:opacity-40"
          >
            ↓ Download PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="border border-harvics-cream/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
          >
            Browser print
          </button>
          <Link href={`/${locale}/os/ar-aging`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← AR
          </Link>
          <Link href={`/${locale}/os/ar/invoices/new`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50">
            New invoice
          </Link>
          <Link href={`/${locale}/os/ar/master`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50">
            Master data
          </Link>
          {isDraft ? (
            <button
              type="button"
              onClick={() => void approve()}
              className="border border-harvics-gold bg-harvics-gold/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
            >
              Approve draft + GL
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="border border-harvics-cream/30 bg-harvics-burgundy/40 px-2 py-1.5 text-sm text-harvics-cream placeholder:text-harvics-cream/40"
                placeholder="buyer@email.com"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
              />
              <button
                type="button"
                onClick={() => void sendInvoice()}
                className="border border-harvics-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold"
              >
                Send via Resend
              </button>
              {dunning?.eligible && dunning?.nextStage ? (
                <button
                  type="button"
                  onClick={() => void sendDunning()}
                  className="border border-harvics-cream/40 bg-harvics-cream/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                >
                  Dunning L{dunning.nextStage.stage}
                </button>
              ) : null}
            </div>
          )}
        </div>

        {error ? <div className="no-print border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="no-print border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {!loading && doc && (meta.sentAt || meta.payLinkUrl || meta.dunning?.history?.length) ? (
          <div className="no-print flex flex-wrap gap-3 border border-harvics-burgundy/15 bg-white px-4 py-3 text-[12px]">
            {meta.sentAt ? (
              <span>
                Sent {new Date(meta.sentAt).toLocaleString()} → {meta.sentTo}
                {meta.sendCount > 1 ? ` (${meta.sendCount}×)` : ''}
              </span>
            ) : null}
            {meta.dunning?.history?.length ? (
              <span>
                Dunning: L{meta.dunning.lastStage} · {meta.dunning.history.length} letter(s)
                {meta.dunning.lastSentAt ? ` · last ${new Date(meta.dunning.lastSentAt).toLocaleDateString()}` : ''}
              </span>
            ) : null}
            {meta.payLinkUrl ? (
              <span className="flex items-center gap-2">
                Pay link:
                <a href={meta.payLinkUrl} target="_blank" rel="noreferrer" className="underline decoration-harvics-gold/50">
                  HPay checkout
                </a>
                <button type="button" onClick={copyPayLink} className="text-[10px] font-bold uppercase tracking-[0.1em] underline">
                  Copy
                </button>
              </span>
            ) : null}
          </div>
        ) : null}
        {loading ? <p className="no-print py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <button
            type="button"
            onClick={() => downloadPdf()}
            className="no-print fixed bottom-6 right-6 z-50 bg-harvics-gold px-6 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy shadow-lg"
            style={{ boxShadow: '0 4px 20px rgba(61,18,18,0.35)' }}
          >
            ↓ Download PDF
          </button>
        ) : null}

        {!loading && doc ? (
          <>
            {/* Printable commercial tax invoice */}
            <div
              id="harvics-tax-invoice"
              className="border border-harvics-burgundy/20 bg-white p-6 text-harvics-burgundy"
              style={{ background: 'linear-gradient(180deg, #FAF7F2 0%, #fff 120px)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-harvics-burgundy pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Harvics Trade</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight">COMMERCIAL TAX INVOICE</h1>
                  <p className="mt-1 text-[12px] text-harvics-burgundy/60">Global trading house · AI-posted receivable</p>
                </div>
                <div className="text-right text-sm">
                  <div className="text-lg font-semibold">{doc.invoiceNo}</div>
                  <div>Date: {meta.invoiceDate || String(doc.createdAt || '').slice(0, 10) || '—'}</div>
                  <div>Due: {doc.dueDate || '—'}</div>
                  <div>Status: {doc.status}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/45">Bill to</p>
                  <p className="mt-1 text-sm font-semibold">{meta.billTo || doc.customer || doc.customerName}</p>
                  <p className="text-[12px] text-harvics-burgundy/60">Customer of record · AR Module #3</p>
                </div>
                <div className="text-sm sm:text-right">
                  <div>
                    <span className="text-harvics-burgundy/50">Terms:</span> {meta.paymentTerms || 'Net 30'}
                  </div>
                  <div>
                    <span className="text-harvics-burgundy/50">Incoterms:</span> {meta.incoterms || '—'}
                  </div>
                  <div>
                    <span className="text-harvics-burgundy/50">PO:</span> {meta.poNumber || '—'}
                  </div>
                  <div>
                    <span className="text-harvics-burgundy/50">Currency:</span> {currency}
                  </div>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-harvics-burgundy bg-harvics-burgundy text-left text-harvics-cream">
                      {['#', 'SKU', 'HS', 'Description', 'Qty', 'UoM', 'Unit', 'Tax', 'Amount'].map((h) => (
                        <th key={h} className="px-2 py-2 text-[10px] uppercase tracking-[0.1em]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!doc.lines?.length ? (
                      <tr>
                        <td colSpan={9} className="px-2 py-6 text-center text-harvics-burgundy/45">
                          Header-only legacy invoice — recreate via Invoice Intelligence for line detail.
                        </td>
                      </tr>
                    ) : (
                      doc.lines.map((l: any, i: number) => (
                        <tr key={l.lineNo || i} className="border-b border-harvics-burgundy/10">
                          <td className="px-2 py-2">{l.lineNo || i + 1}</td>
                          <td className="px-2 py-2">{l.sku || '—'}</td>
                          <td className="px-2 py-2">{l.hsCode || '—'}</td>
                          <td className="px-2 py-2">{l.description}</td>
                          <td className="px-2 py-2">{l.qty}</td>
                          <td className="px-2 py-2">{l.uom || 'EA'}</td>
                          <td className="px-2 py-2">{money(l.unitPrice, currency)}</td>
                          <td className="px-2 py-2">{l.taxCode ? `${l.taxCode} (${l.taxPercent ?? 0}%)` : l.taxPercent ?? 0}</td>
                          <td className="px-2 py-2 font-semibold">{money(l.amount, currency)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap justify-between gap-4">
                <div className="max-w-md text-[12px] text-harvics-burgundy/70">
                  {doc.notes ? <p className="mb-2">{doc.notes}</p> : null}
                  {meta.bankDetails ? (
                    <p>
                      <span className="font-bold uppercase tracking-[0.1em] text-harvics-burgundy/45">Remit to · </span>
                      {meta.bankDetails}
                    </p>
                  ) : null}
                  {meta.collectionsOpener ? (
                    <p className="mt-2 border-l-2 border-harvics-gold pl-2 italic">AI chase: {meta.collectionsOpener}</p>
                  ) : null}
                </div>
                <div className="min-w-[200px] space-y-1 text-sm">
                  <div className="flex justify-between gap-8">
                    <span className="text-harvics-burgundy/55">Subtotal</span>
                    <span>{money(doc.subtotal ?? doc.amount, currency)}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-harvics-burgundy/55">Tax</span>
                    <span>{money(doc.taxAmount ?? 0, currency)}</span>
                  </div>
                  <div className="flex justify-between gap-8 border-t border-harvics-burgundy pt-2 text-base font-semibold">
                    <span>Total due</span>
                    <span>{money(doc.amount, currency)}</span>
                  </div>
                  <div className="flex justify-between gap-8 text-[12px]">
                    <span className="text-harvics-burgundy/55">Outstanding</span>
                    <span>{money(doc.outstanding, currency)}</span>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-center text-[10px] uppercase tracking-[0.16em] text-harvics-burgundy/40">
                Generated by Harvics Invoice Intelligence · Module #3 AR
              </p>
            </div>

            {!closed && !isDraft ? (
              <div className="no-print grid gap-5 lg:grid-cols-[1fr_280px]">
                <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Collect payment</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                    />
                    <select
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                    >
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>Cheque</option>
                      <option>Card</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void collect()}
                      className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                    >
                      Post collection
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-[12px]">
                    <input type="checkbox" checked={postToGl} onChange={(e) => setPostToGl(e.target.checked)} />
                    Post to Module #1 GL
                  </label>
                </div>
                <div className="flex flex-col gap-2 border border-harvics-burgundy/15 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflows</p>
                  <button
                    type="button"
                    disabled={payLinkBusy || !doc.outstanding}
                    onClick={() => void createPayLink()}
                    className="border border-harvics-gold bg-harvics-gold/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] disabled:opacity-40"
                  >
                    {payLinkBusy ? 'Creating…' : meta.payLinkUrl ? 'Refresh HPay link' : 'Create HPay link'}
                  </button>
                  {meta.payLinkUrl ? (
                    <button type="button" onClick={copyPayLink} className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">
                      Copy pay link
                    </button>
                  ) : null}
                  <button type="button" onClick={() => void markOverdue()} className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">
                    Mark overdue
                  </button>
                  <button type="button" onClick={() => void creditNote()} className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">
                    Credit note
                  </button>
                  <button type="button" onClick={() => void writeOff()} className="border border-red-300 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-red-800">
                    Write off
                  </button>
                </div>
              </div>
            ) : null}

            <div className="no-print overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                Payment history
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Amount', 'Method', 'Reference', 'Date'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!doc.payments?.length ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-harvics-burgundy/45">
                        No payments applied.
                      </td>
                    </tr>
                  ) : (
                    doc.payments.map((p: any) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2">{money(p.amount, currency)}</td>
                        <td className="px-3 py-2">{p.method || '—'}</td>
                        <td className="px-3 py-2">{p.reference || '—'}</td>
                        <td className="px-3 py-2">{p.receivedDate || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}

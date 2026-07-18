'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, Suspense } from 'react'

function RFQForm() {
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = (params?.locale as string) || 'en'

  const prefillProduct = searchParams.get('product') || ''
  const prefillCategory = searchParams.get('category') || ''

  const [submitted, setSubmitted] = useState(false)
  const [rfqId, setRfqId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    product: prefillProduct,
    category: prefillCategory,
    quantity: '',
    targetPrice: '',
    requiredBy: '',
    specs: '',
    deliveryLocation: '',
    incoterms: '',
    paymentTerms: '',
    preferredOrigin: '',
    fullName: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    website: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    if (!form.product.trim() || !form.fullName.trim() || !form.email.trim()) {
      setError('Product description, full name and email are required.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/harvictrade/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setRfqId(data.rfqId)
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-harvics-gold/20 bg-white text-harvics-burgundy placeholder-[#3D1212]/25 focus:border-harvics-burgundy focus:outline-none text-sm transition-colors'
  const labelCls = 'block text-[10px] font-bold text-harvics-burgundy/50 uppercase tracking-[0.18em] mb-1.5'

  if (submitted) {
    return (
      <div className="text-center py-24 px-4">
        <div className="w-16 h-16 border-2 border-harvics-gold flex items-center justify-center mx-auto mb-8">
          <span className="text-harvics-gold text-2xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-harvics-burgundy mb-3" style={{ letterSpacing: '-0.02em' }}>RFQ Submitted</h2>
        <p className="text-harvics-burgundy/50 mb-2 max-w-md mx-auto text-sm leading-relaxed">
          Our sourcing team will review your request and match you with verified suppliers within 24 hours.
        </p>
        {rfqId && <p className="text-xs text-harvics-burgundy/30 mb-10 font-mono">{rfqId}</p>}
        <Link href={`/${locale}/harvictrade`}
          className="inline-block px-8 py-3 bg-harvics-burgundy text-white font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#0d0303] transition-colors">
          Back to HarvicTrade
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[860px] mx-auto">

      {/* Section 1 */}
      <div className="bg-white border border-harvics-gold/15 p-8">
        <h2 className="text-sm font-bold text-harvics-burgundy mb-6 flex items-center gap-3 uppercase tracking-[0.15em]">
          <span className="w-7 h-7 bg-harvics-burgundy text-white flex items-center justify-center text-xs font-bold">1</span>
          Product Requirements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Product Name / Description *</label>
            <input value={form.product} onChange={e => set('product', e.target.value)}
              placeholder="e.g. Premium Basmati Rice 1121 Sella" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
              <option value="">Select Category</option>
              <option>Textiles & Apparel</option>
              <option>FMCG & Food</option>
              <option>Commodities</option>
              <option>Industrial & PPE</option>
              <option>Minerals & Metals</option>
              <option>Oil, Gas & Energy</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Quantity Required</label>
            <input value={form.quantity} onChange={e => set('quantity', e.target.value)}
              placeholder="e.g. 25 MT, 1,000 pcs, 1 FCL" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Target Price (optional)</label>
            <input value={form.targetPrice} onChange={e => set('targetPrice', e.target.value)}
              placeholder="e.g. $850–950/MT" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Required By Date</label>
            <input type="date" value={form.requiredBy} onChange={e => set('requiredBy', e.target.value)} className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Specifications / Notes</label>
            <textarea rows={3} value={form.specs} onChange={e => set('specs', e.target.value)}
              placeholder="Quality standards, certifications required, packaging preferences..."
              className={`${inputCls} resize-none`} />
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="bg-white border border-harvics-gold/15 p-8">
        <h2 className="text-sm font-bold text-harvics-burgundy mb-6 flex items-center gap-3 uppercase tracking-[0.15em]">
          <span className="w-7 h-7 bg-harvics-burgundy text-white flex items-center justify-center text-xs font-bold">2</span>
          Delivery & Trade Terms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Delivery Location</label>
            <input value={form.deliveryLocation} onChange={e => set('deliveryLocation', e.target.value)}
              placeholder="City, Country" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Preferred Incoterms</label>
            <select value={form.incoterms} onChange={e => set('incoterms', e.target.value)} className={inputCls}>
              <option value="">Select Incoterms</option>
              <option>FOB — Free on Board</option>
              <option>CIF — Cost, Insurance & Freight</option>
              <option>CFR — Cost & Freight</option>
              <option>EXW — Ex Works</option>
              <option>DDP — Delivered Duty Paid</option>
              <option>DAP — Delivered at Place</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Payment Terms</label>
            <select value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} className={inputCls}>
              <option value="">Select Payment Terms</option>
              <option>Letter of Credit (LC)</option>
              <option>Telegraphic Transfer (TT)</option>
              <option>30/70 (30% advance, 70% on BL)</option>
              <option>Open Account — Net 30</option>
              <option>Open Account — Net 60</option>
              <option>Escrow via HarvicTrade</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Preferred Origin (optional)</label>
            <input value={form.preferredOrigin} onChange={e => set('preferredOrigin', e.target.value)}
              placeholder="e.g. Pakistan, Turkey, Spain" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="bg-white border border-harvics-gold/15 p-8">
        <h2 className="text-sm font-bold text-harvics-burgundy mb-6 flex items-center gap-3 uppercase tracking-[0.15em]">
          <span className="w-7 h-7 bg-harvics-burgundy text-white flex items-center justify-center text-xs font-bold">3</span>
          Your Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full Name *</label>
            <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
              placeholder="Full Name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Company Name</label>
            <input value={form.company} onChange={e => set('company', e.target.value)}
              placeholder="Company Name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email Address *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="you@company.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone (with country code)</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+1 555 000 0000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input value={form.country} onChange={e => set('country', e.target.value)}
              placeholder="Country" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Website (optional)</label>
            <input value={form.website} onChange={e => set('website', e.target.value)}
              placeholder="https://yourcompany.com" className={inputCls} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">{error}</div>
      )}

      <div className="text-center pb-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-12 py-4 bg-harvics-burgundy text-white font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#0d0303] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting…' : 'Submit RFQ'}
        </button>
        <p className="text-[10px] text-harvics-burgundy/30 mt-4 tracking-wide">
          By submitting, you agree to HarvicTrade&apos;s terms. Our team responds within 24 hours.
        </p>
      </div>
    </div>
  )
}

export default function RFQPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  return (
    <main className="min-h-screen bg-[#fafaf9] pt-[136px]">
      <section className="bg-harvics-burgundy py-14 px-4 border-b border-harvics-gold/30">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 mb-5 tracking-[0.2em] uppercase">
            <Link href={`/${locale}/harvictrade`} className="hover:text-harvics-gold transition-colors">HarvicTrade</Link>
            <span>/</span>
            <span className="text-harvics-gold">Request for Quotation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ letterSpacing: '-0.025em' }}>
            Request for Quotation
          </h1>
          <p className="text-white/40 max-w-lg mx-auto text-sm leading-relaxed">
            Tell us what you need. Our sourcing team will match you with verified suppliers within 24 hours.
          </p>
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-4 py-12">
        <Suspense fallback={<div className="text-center py-20 text-harvics-burgundy/40 text-sm">Loading form…</div>}>
          <RFQForm />
        </Suspense>
      </section>
    </main>
  )
}

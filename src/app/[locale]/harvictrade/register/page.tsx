'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const [role, setRole] = useState<'buyer' | 'supplier'>('buyer')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '', company: '', email: '', phone: '',
    country: '', website: '', categories: '', annualVolume: '', message: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    if (!form.fullName.trim() || !form.email.trim() || !form.company.trim()) {
      setError('Full name, company, and email are required.')
      return
    }
    setLoading(true)
    try {
      await fetch('/api/harvictrade/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, product: `[${role.toUpperCase()} REGISTRATION]`, category: 'Registration' }),
      })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-harvics-gold/20 bg-white text-harvics-burgundy placeholder-[#3D1212]/25 focus:border-harvics-burgundy focus:outline-none text-sm transition-colors'
  const labelCls = 'block text-[10px] font-bold text-harvics-burgundy/50 uppercase tracking-[0.18em] mb-1.5'

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#fafaf9] pt-[136px] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-2 border-harvics-gold flex items-center justify-center mx-auto mb-8">
            <span className="text-harvics-gold text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-harvics-burgundy mb-3" style={{ letterSpacing: '-0.02em' }}>
            Application Received
          </h2>
          <p className="text-harvics-burgundy/50 mb-10 text-sm leading-relaxed">
            Our team will review your application and contact you within 1–2 business days to complete your {role} onboarding.
          </p>
          <Link href={`/${locale}/harvictrade`}
            className="inline-block px-8 py-3 bg-harvics-burgundy text-white font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#0d0303] transition-colors">
            Back to HarvicTrade
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] pt-[136px]">
      <section className="bg-harvics-burgundy py-14 px-4 border-b border-harvics-gold/30">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 mb-5 tracking-[0.2em] uppercase">
            <Link href={`/${locale}/harvictrade`} className="hover:text-harvics-gold transition-colors">HarvicTrade</Link>
            <span>/</span>
            <span className="text-harvics-gold">Register</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ letterSpacing: '-0.025em' }}>
            Join HarvicTrade
          </h1>
          <p className="text-white/40 max-w-lg mx-auto text-sm leading-relaxed">
            Access 1,200+ verified suppliers and 42+ buyer markets. Trade with assurance.
          </p>
        </div>
      </section>

      <section className="max-w-[800px] mx-auto px-4 py-12 space-y-6">

        {/* Role Toggle */}
        <div className="flex border border-harvics-gold/20 bg-white overflow-hidden">
          {(['buyer', 'supplier'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                role === r ? 'bg-harvics-burgundy text-white' : 'text-harvics-burgundy/50 hover:text-harvics-burgundy'
              }`}
            >
              {r === 'buyer' ? 'Register as Buyer' : 'Register as Supplier'}
            </button>
          ))}
        </div>

        {/* Role description */}
        <div className="bg-white border border-harvics-gold/15 px-8 py-5">
          {role === 'buyer' ? (
            <p className="text-sm text-harvics-burgundy/60 leading-relaxed">
              As a <strong className="text-harvics-burgundy">Verified Buyer</strong> you get access to 1,185+ products, AI-matched RFQs, trade finance, and dedicated account support. Free to register.
            </p>
          ) : (
            <p className="text-sm text-harvics-burgundy/60 leading-relaxed">
              As a <strong className="text-harvics-burgundy">Verified Supplier</strong> your products are visible to buyers in 42+ countries. Complete onboarding includes factory audit, business license verification, and a dedicated storefront.
            </p>
          )}
        </div>

        {/* Form */}
        <div className="bg-white border border-harvics-gold/15 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                placeholder="Full Name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Company Name *</label>
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
              <label className={labelCls}>Website</label>
              <input value={form.website} onChange={e => set('website', e.target.value)}
                placeholder="https://yourcompany.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{role === 'buyer' ? 'Categories of Interest' : 'Product Categories You Supply'}</label>
              <input value={form.categories} onChange={e => set('categories', e.target.value)}
                placeholder="e.g. Textiles, FMCG, Commodities" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{role === 'buyer' ? 'Annual Import Volume (USD)' : 'Annual Export Volume (USD)'}</label>
              <select value={form.annualVolume} onChange={e => set('annualVolume', e.target.value)} className={inputCls}>
                <option value="">Select Range</option>
                <option>Under $100,000</option>
                <option>$100,000 – $500,000</option>
                <option>$500,000 – $2M</option>
                <option>$2M – $10M</option>
                <option>Over $10M</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Additional Notes (optional)</label>
              <textarea rows={3} value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Tell us about your sourcing needs or product portfolio..."
                className={`${inputCls} resize-none`} />
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
            className="px-12 py-4 bg-harvics-burgundy text-white font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#0d0303] transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting…' : `Submit ${role === 'buyer' ? 'Buyer' : 'Supplier'} Application`}
          </button>
          <p className="text-[10px] text-harvics-burgundy/30 mt-4 tracking-wide">
            Our team reviews all applications within 1–2 business days.
          </p>
        </div>
      </section>
    </main>
  )
}

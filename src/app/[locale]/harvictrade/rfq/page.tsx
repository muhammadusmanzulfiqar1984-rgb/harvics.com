'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function RFQPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-16 px-4 border-b border-[#C3A35E]/40">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[900px] mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-2 text-xs text-white/40 mb-4">
            <Link href={`/${locale}/harvictrade`} className="hover:text-[#C3A35E] transition-colors">HarvicTrade</Link>
            <span>→</span>
            <span className="text-[#C3A35E]">Submit RFQ</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            Request for Quotation
          </h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Tell us what you need. Our sourcing team and AI engine will match you with the best-fit verified suppliers within 24 hours.
          </p>
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-4 py-12">
        {submitted ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold text-[#6B1F2B] mb-3">RFQ Submitted Successfully</h2>
            <p className="text-[#6B1F2B]/50 mb-8 max-w-md mx-auto">
              Our sourcing team will review your request and match you with verified suppliers. Expect quotes within 24 hours.
            </p>
            <Link href={`/${locale}/harvictrade`}
              className="inline-block px-8 py-3 bg-[#6B1F2B] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#5a1a24] transition-colors">
              Back to HarvicTrade
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Product Details */}
            <div className="bg-white border border-[#C3A35E]/20 p-8">
              <h2 className="text-lg font-bold text-[#6B1F2B] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#6B1F2B] text-white flex items-center justify-center text-sm font-bold">1</span>
                Product Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#6B1F2B]/60 uppercase tracking-wider mb-1">Product Name / Description</label>
                  <input placeholder="e.g. Premium Basmati Rice 1121 Sella" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B1F2B]/60 uppercase tracking-wider mb-1">Category</label>
                  <select className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] focus:border-[#C3A35E] focus:outline-none">
                    <option>Select Category</option>
                    <option>Textiles & Apparel</option>
                    <option>FMCG & Food</option>
                    <option>Commodities</option>
                    <option>Industrial & PPE</option>
                    <option>Minerals & Metals</option>
                    <option>Oil, Gas & Energy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B1F2B]/60 uppercase tracking-wider mb-1">Quantity Required</label>
                  <input placeholder="e.g. 25 MT, 1,000 pcs, 1 FCL" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B1F2B]/60 uppercase tracking-wider mb-1">Target Price (optional)</label>
                  <input placeholder="e.g. $850–950/MT" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B1F2B]/60 uppercase tracking-wider mb-1">Required By Date</label>
                  <input type="date" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] focus:border-[#C3A35E] focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#6B1F2B]/60 uppercase tracking-wider mb-1">Specifications / Notes</label>
                  <textarea rows={3} placeholder="Quality standards, certifications required, packaging preferences..." className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none resize-none" />
                </div>
              </div>
            </div>

            {/* Delivery & Trade Terms */}
            <div className="bg-white border border-[#C3A35E]/20 p-8">
              <h2 className="text-lg font-bold text-[#6B1F2B] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#6B1F2B] text-white flex items-center justify-center text-sm font-bold">2</span>
                Delivery & Trade Terms
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6B1F2B]/60 uppercase tracking-wider mb-1">Delivery Location</label>
                  <input placeholder="City, Country" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B1F2B]/60 uppercase tracking-wider mb-1">Preferred Incoterms</label>
                  <select className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] focus:border-[#C3A35E] focus:outline-none">
                    <option>Select Incoterms</option>
                    <option>FOB — Free on Board</option>
                    <option>CIF — Cost, Insurance & Freight</option>
                    <option>CFR — Cost & Freight</option>
                    <option>EXW — Ex Works</option>
                    <option>DDP — Delivered Duty Paid</option>
                    <option>DAP — Delivered at Place</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B1F2B]/60 uppercase tracking-wider mb-1">Payment Terms</label>
                  <select className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] focus:border-[#C3A35E] focus:outline-none">
                    <option>Select Payment Terms</option>
                    <option>Letter of Credit (LC)</option>
                    <option>Telegraphic Transfer (TT)</option>
                    <option>30/70 (30% advance, 70% on BL)</option>
                    <option>Open Account — Net 30</option>
                    <option>Open Account — Net 60</option>
                    <option>Escrow via HarvicTrade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B1F2B]/60 uppercase tracking-wider mb-1">Preferred Origin (optional)</label>
                  <input placeholder="e.g. Pakistan, Turkey, Spain" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white border border-[#C3A35E]/20 p-8">
              <h2 className="text-lg font-bold text-[#6B1F2B] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#6B1F2B] text-white flex items-center justify-center text-sm font-bold">3</span>
                Your Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Full Name" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder="Company Name" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder="Email Address" type="email" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder="Phone (with country code)" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder="Country" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder="Website (optional)" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none" />
              </div>
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                onClick={() => setSubmitted(true)}
                className="px-12 py-4 bg-[#6B1F2B] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#5a1a24] transition-colors"
              >
                Submit RFQ
              </button>
              <p className="text-xs text-[#6B1F2B]/40 mt-4">By submitting, you agree to HarvicTrade&apos;s terms. We&apos;ll match you with suppliers within 24 hours.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

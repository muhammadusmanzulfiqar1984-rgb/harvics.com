'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ALL_PRODUCTS } from '@/data/harvictrade-products'

export default function HarvicTradeSearch({ locale }: { locale: string }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const results = query.trim().length >= 2
    ? ALL_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.origin.toLowerCase().includes(query.toLowerCase()) ||
        (p.subcategory?.toLowerCase().includes(query.toLowerCase()) ?? false)
      ).slice(0, 8)
    : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative max-w-[700px] mx-auto">
      <div className="flex bg-white overflow-hidden shadow-sm">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search products, origins, categories..."
          className="flex-1 px-6 py-4 text-harvics-burgundy placeholder-[#3D1212]/30 text-base focus:outline-none"
        />
        <Link
          href={`/${locale}/harvictrade/rfq`}
          className="px-8 bg-harvics-gold text-harvics-burgundy font-bold text-sm uppercase tracking-wider hover:bg-[#d4b46e] transition-colors flex items-center"
        >
          RFQ
        </Link>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-harvics-gold/20 shadow-xl z-50 divide-y divide-[#C3A35E]/10">
          {results.map((p, i) => (
            <Link
              key={i}
              href={`/${locale}/harvictrade/rfq?product=${encodeURIComponent(p.name)}&category=${encodeURIComponent(p.category)}`}
              onClick={() => { setOpen(false); setQuery('') }}
              className="flex items-center justify-between px-6 py-3 hover:bg-harvics-cream transition-colors group"
            >
              <div>
                <div className="text-sm font-medium text-harvics-burgundy group-hover:text-harvics-burgundy">{p.name}</div>
                <div className="text-xs text-harvics-burgundy/40 mt-0.5">{p.category} · {p.origin}</div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="text-sm font-bold text-harvics-burgundy">{p.price}</div>
                <div className="text-[10px] text-harvics-burgundy/40">MOQ {p.moq}</div>
              </div>
            </Link>
          ))}
          <Link
            href={`/${locale}/harvictrade/rfq?product=${encodeURIComponent(query)}`}
            onClick={() => { setOpen(false) }}
            className="flex items-center gap-2 px-6 py-3 hover:bg-harvics-cream transition-colors"
          >
            <span className="text-xs font-bold text-harvics-gold uppercase tracking-wider">Submit custom RFQ for &ldquo;{query}&rdquo;</span>
            <span className="text-harvics-gold">→</span>
          </Link>
        </div>
      )}

      {open && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-harvics-gold/20 shadow-xl z-50">
          <Link
            href={`/${locale}/harvictrade/rfq?product=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-6 py-4 hover:bg-harvics-cream transition-colors"
          >
            <span className="text-sm text-harvics-burgundy/60">No exact match — submit a custom RFQ for &ldquo;{query}&rdquo;</span>
            <span className="text-xs font-bold text-harvics-gold uppercase tracking-wider">Submit RFQ →</span>
          </Link>
        </div>
      )}
    </div>
  )
}

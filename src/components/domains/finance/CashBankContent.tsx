'use client'

import React, { useState, useEffect } from 'react'
import KPICard from '@/components/shared/KPICard'

interface CurrencyRate {
  currency: string
  rate: number
}

export default function CashBankContent() {
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [convertFrom, setConvertFrom] = useState('USD')
  const [convertTo, setConvertTo] = useState('AED')
  const [convertAmount, setConvertAmount] = useState('1000')
  const [convertResult, setConvertResult] = useState<number | null>(null)

  useEffect(() => { loadRates() }, [])

  const loadRates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/services/currency/rates').then(r => r.json())
      if (res.success) setRates(res.rates)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleConvert = async () => {
    try {
      const res = await fetch(`/api/services/currency/convert?from=${convertFrom}&to=${convertTo}&amount=${convertAmount}`).then(r => r.json())
      if (res.success) setConvertResult(res.converted)
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-[#C3A35E]"></div></div>

  // Key currencies for Harvics operations
  const keyCurrencies = ['AED', 'PKR', 'GBP', 'EUR', 'CNY', 'EGP', 'SAR', 'TRY']

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Cash on Hand" value="$2.4M" icon="💵" change={{ value: 5, trend: 'up', label: 'last week' }} />
        <KPICard label="Bank Balances" value="$8.7M" icon="🏦" />
        <KPICard label="Currencies Tracked" value={Object.keys(rates).length || 0} icon="🌍" />
        <KPICard label="FX Exposure" value="$1.2M" icon="📊" change={{ value: 3, trend: 'down' }} />
      </div>

      {/* Currency Converter */}
      <div className="bg-white border border-[#C3A35E]/20 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-bold text-[#6B1F2B] mb-4">💱 Currency Converter</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="text-xs font-bold text-[#6B1F2B]/70 uppercase mb-1 block">Amount</label>
            <input type="number" value={convertAmount} onChange={e => setConvertAmount(e.target.value)}
              className="w-full px-3 py-2 border border-[#C3A35E]/30 text-sm font-bold" style={{ borderRadius: 0 }} />
          </div>
          <div>
            <label className="text-xs font-bold text-[#6B1F2B]/70 uppercase mb-1 block">From</label>
            <select value={convertFrom} onChange={e => setConvertFrom(e.target.value)}
              className="w-full px-3 py-2 border border-[#C3A35E]/30 text-sm" style={{ borderRadius: 0 }}>
              <option>USD</option>{keyCurrencies.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-[#6B1F2B]/70 uppercase mb-1 block">To</label>
            <select value={convertTo} onChange={e => setConvertTo(e.target.value)}
              className="w-full px-3 py-2 border border-[#C3A35E]/30 text-sm" style={{ borderRadius: 0 }}>
              <option>USD</option>{keyCurrencies.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={handleConvert}
            className="px-4 py-2 text-sm font-bold text-white h-[38px]" style={{ background: '#6B1F2B', borderRadius: 0 }}>
            Convert
          </button>
          {convertResult !== null && (
            <div className="text-xl font-bold text-[#6B1F2B]">
              = {convertTo} {convertResult.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Live Rates Table */}
      <div className="bg-white border border-[#C3A35E]/20 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-bold text-[#6B1F2B] mb-4">📈 Live Exchange Rates (Base: USD)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {keyCurrencies.map(code => (
            <div key={code} className="flex justify-between items-center p-3 bg-[#F5F1E8]/50 border border-[#C3A35E]/10" style={{ borderRadius: 0 }}>
              <span className="font-bold text-[#6B1F2B]">{code}</span>
              <span className="font-mono text-sm text-[#6B1F2B]/80">{rates[code]?.toFixed(4) || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F5F1E8] border-l-4 border-[#C3A35E] p-4" style={{ borderRadius: 0 }}>
        <div className="flex items-start gap-3">
          <span className="text-xl">🤖</span>
          <div>
            <h5 className="font-bold text-[#6B1F2B] text-sm">AI Treasury Insight</h5>
            <p className="text-[#6B1F2B]/80 text-sm mt-1">
              PKR weakened 2.1% against USD this week. Consider hedging exposure on upcoming Lahore Wholesale payment.
              AED peg is stable at 3.67. No action required on GCC receivables.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

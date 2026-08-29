'use client'

/**
 * Public HPay checkout — buyer pays open AR invoice via wallet / bank / card rail.
 * No login; token is the credential.
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

type Rail = 'wallet' | 'bank' | 'card'

type Checkout = {
  token: string
  invoiceNo: string
  customerName: string
  amount: number
  currency: string
  status: string
  merchant: string
  rails: { id: Rail; label: string }[]
}

const money = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0)

export default function HpayCheckoutPage() {
  const params = useParams()
  const search = useSearchParams()
  const locale = String(params?.locale || 'en')
  const token = String(params?.token || '')

  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [checkout, setCheckout] = useState<Checkout | null>(null)
  const [rail, setRail] = useState<Rail>('wallet')
  const [paid, setPaid] = useState(search.get('paid') === '1')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/hpay/checkout/${token}`)
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setCheckout(json.data)
      if (json.data?.status === 'paid') setPaid(true)
    } catch (e: any) {
      setError(e.message || 'Checkout unavailable')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  const pay = async () => {
    try {
      setPaying(true)
      setError('')
      const res = await fetch(`/api/hpay/checkout/${token}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rail }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setPaid(true)
      await load()
    } catch (e: any) {
      setError(e.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  return (
    <main className="min-h-screen bg-harvics-cream text-harvics-burgundy">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-harvics-gold">Harvics · HPay</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Pay invoice</h1>
          <p className="mt-1 text-sm text-harvics-burgundy/60">Secure settlement · Module #6</p>
        </div>

        {loading ? (
          <p className="text-center text-sm text-harvics-burgundy/50">Loading checkout…</p>
        ) : null}

        {error ? (
          <div className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        {!loading && checkout && !paid ? (
          <div className="space-y-5 border border-harvics-burgundy/15 bg-white p-6 shadow-sm">
            <div className="border-b border-harvics-burgundy/10 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/45">Invoice</p>
              <p className="mt-1 text-lg font-semibold">{checkout.invoiceNo}</p>
              <p className="text-sm text-harvics-burgundy/65">{checkout.customerName}</p>
              <p className="mt-3 text-2xl font-bold text-harvics-burgundy">{money(checkout.amount, checkout.currency)}</p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Payment rail</p>
              {checkout.rails.map((r) => (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm ${
                    rail === r.id ? 'border-harvics-gold bg-harvics-gold/10' : 'border-harvics-burgundy/20 bg-harvics-cream/30'
                  }`}
                >
                  <input type="radio" name="rail" checked={rail === r.id} onChange={() => setRail(r.id)} />
                  <span className="font-semibold">{r.label}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              disabled={paying}
              onClick={() => void pay()}
              className="w-full bg-harvics-burgundy py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-harvics-cream disabled:opacity-50"
            >
              {paying ? 'Processing…' : `Pay ${money(checkout.amount, checkout.currency)} with HPay`}
            </button>

            <p className="text-center text-[11px] text-harvics-burgundy/45">
              {checkout.merchant} · Dr Cash / Cr AR posted on settlement
            </p>
          </div>
        ) : null}

        {!loading && paid && checkout ? (
          <div className="space-y-4 border border-harvics-gold/40 bg-white p-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-harvics-gold">Payment received</p>
            <p className="text-lg font-semibold">{checkout.invoiceNo}</p>
            <p className="text-sm text-harvics-burgundy/70">
              {money(checkout.amount, checkout.currency)} settled via HPay
            </p>
            <Link
              href={`/${locale}`}
              className="inline-block border border-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
            >
              Back to Harvics
            </Link>
          </div>
        ) : null}

        {!loading && !checkout && !error ? (
          <p className="text-center text-sm text-harvics-burgundy/50">Pay link not found or expired.</p>
        ) : null}
      </div>
    </main>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { clearCart, createSalesOrder, loadCart, type CartLine } from '@/lib/distributorPortal'

export default function OrderReview() {
  const locale = useLocale()
  const [cart, setCart] = useState<CartLine[]>([])
  const [customerName, setCustomerName] = useState('Distributor Account')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setCart(loadCart().filter((c) => c.quantity > 0))
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity * item.cartonSize, 0)

  const submit = async () => {
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      if (!cart.length) throw new Error('Cart is empty')
      const res = await createSalesOrder({
        customerName,
        paymentTerms: 'Net 30',
        lines: cart.map((c) => ({
          sku: c.sku,
          description: c.name,
          quantity: c.quantity * c.cartonSize,
          unitPrice: c.unitPrice,
        })),
      })
      clearCart()
      setMessage(`Order ${res.data?.orderNumber || ''} submitted (${res.data?.status}).`)
      setCart([])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} className="mb-4" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-harvics-burgundy">Review Order</h1>
        <Link href={`/${locale}/distributor-portal/orders/new`} className="text-harvics-burgundy hover:underline">← Back</Link>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {message && <p className="text-sm text-green-800">{message}</p>}
      <div className="bg-white border p-6 space-y-3">
        <label className="block text-sm font-semibold">Customer / Distributor name</label>
        <input className="w-full border px-3 py-2" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </div>
      <div className="bg-white border overflow-hidden">
        {cart.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-600">No items in cart — add products first.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F5F0E8]">
              <tr>
                {['SKU', 'Product', 'Cartons', 'Unit', 'Line Total'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {cart.map((item) => (
                <tr key={item.sku}>
                  <td className="px-4 py-3 font-semibold">{item.sku}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold">${(item.quantity * item.unitPrice * item.cartonSize).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-semibold">Total</td>
                <td className="px-4 py-3 font-bold">${subtotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={submitting || cart.length === 0}
          onClick={() => void submit()}
          className="flex-1 bg-harvics-burgundy text-white px-8 py-3 font-semibold disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Order'}
        </button>
        <Link href={`/${locale}/distributor-portal/orders/history`} className="flex-1 border text-center px-8 py-3 font-semibold">
          View History
        </Link>
      </div>
    </div>
  )
}

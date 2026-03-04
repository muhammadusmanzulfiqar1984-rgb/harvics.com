'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="pt-28 pb-20 px-4">
        {/* Hero */}
        <section className="max-w-5xl mx-auto text-center mb-16">
          <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-4">SECURE CHECKOUT</div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#6B1F2B] mb-4" style={{ letterSpacing: '-0.03em' }}>Complete Your Order</h1>
          <p className="text-lg text-[#6B1F2B]/60 max-w-xl mx-auto">Review your items, enter shipping details, and confirm payment securely.</p>
        </section>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="bg-white border border-[#C3A35E]/20 p-8">
              <h2 className="text-lg font-bold text-[#6B1F2B] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#6B1F2B] text-white flex items-center justify-center text-sm font-bold">1</span>
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="First Name" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-[#F5F1E8] text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder="Last Name" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-[#F5F1E8] text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder="Email" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-[#F5F1E8] text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none md:col-span-2" />
                <input placeholder="Address" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-[#F5F1E8] text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none md:col-span-2" />
                <input placeholder="City" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-[#F5F1E8] text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder="Country" className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-[#F5F1E8] text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none" />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-[#C3A35E]/20 p-8">
              <h2 className="text-lg font-bold text-[#6B1F2B] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#6B1F2B] text-white flex items-center justify-center text-sm font-bold">2</span>
                Payment Method
              </h2>
              <div className="space-y-3">
                {['Credit / Debit Card', 'Bank Transfer (LC/TT)', 'HPay Digital Wallet'].map((method) => (
                  <label key={method} className="flex items-center gap-3 p-4 border border-[#C3A35E]/20 cursor-pointer hover:border-[#C3A35E] transition-colors">
                    <input type="radio" name="payment" className="accent-[#6B1F2B]" />
                    <span className="text-[#6B1F2B] font-medium">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#C3A35E]/20 p-8 sticky top-28">
              <h2 className="text-lg font-bold text-[#6B1F2B] mb-6">Order Summary</h2>
              <div className="space-y-4 border-b border-[#C3A35E]/20 pb-6 mb-6">
                <div className="flex justify-between text-[#6B1F2B]/70"><span>Subtotal</span><span>$0.00</span></div>
                <div className="flex justify-between text-[#6B1F2B]/70"><span>Shipping</span><span>Calculated at next step</span></div>
                <div className="flex justify-between text-[#6B1F2B]/70"><span>Tax</span><span>—</span></div>
              </div>
              <div className="flex justify-between text-xl font-bold text-[#6B1F2B] mb-8">
                <span>Total</span><span>$0.00</span>
              </div>
              <button className="w-full py-4 bg-[#6B1F2B] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#5a1a24] transition-colors">
                Place Order
              </button>
              <p className="text-xs text-[#6B1F2B]/40 text-center mt-4">Secured with 256-bit SSL encryption</p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="max-w-5xl mx-auto mt-8">
          <Link href={`/${locale}/products`} className="text-[#C3A35E] text-sm font-medium hover:text-[#6B1F2B] transition-colors">← Continue Shopping</Link>
        </div>
      </div>
    </main>
  )
}

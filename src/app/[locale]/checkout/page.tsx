'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function CheckoutPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const t = useTranslations('checkout')

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      <div className="pt-28 pb-20 px-4">
        {/* Hero */}
        <section className="max-w-5xl mx-auto text-center mb-16">
          <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-4">{t('secureCheckout')}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#6B1F2B] mb-4" style={{ letterSpacing: '-0.03em' }}>{t('title')}</h1>
          <p className="text-lg text-[#6B1F2B]/60 max-w-xl mx-auto">{t('subtitle')}</p>
        </section>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="bg-white border border-[#C3A35E]/20 p-8">
              <h2 className="text-lg font-bold text-[#6B1F2B] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#6B1F2B] text-white flex items-center justify-center text-sm font-bold">1</span>
                {t('shippingInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder={t('form.firstName')} className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder={t('form.lastName')} className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder={t('form.email')} className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none md:col-span-2" />
                <input placeholder={t('form.address')} className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none md:col-span-2" />
                <input placeholder={t('form.city')} className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none" />
                <input placeholder={t('form.country')} className="w-full px-4 py-3 border border-[#C3A35E]/30 bg-white text-[#6B1F2B] placeholder-[#6B1F2B]/40 focus:border-[#C3A35E] focus:outline-none" />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-[#C3A35E]/20 p-8">
              <h2 className="text-lg font-bold text-[#6B1F2B] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#6B1F2B] text-white flex items-center justify-center text-sm font-bold">2</span>
                {t('paymentMethod')}
              </h2>
              <div className="space-y-3">
                {[t('paymentMethods.card'), t('paymentMethods.bankTransfer'), t('paymentMethods.wallet')].map((method) => (
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
              <h2 className="text-lg font-bold text-[#6B1F2B] mb-6">{t('orderSummary')}</h2>
              <div className="space-y-4 border-b border-[#C3A35E]/20 pb-6 mb-6">
                <div className="flex justify-between text-[#6B1F2B]/70"><span>{t('summary.subtotal')}</span><span>$0.00</span></div>
                <div className="flex justify-between text-[#6B1F2B]/70"><span>{t('summary.shipping')}</span><span>{t('summary.calculatedNextStep')}</span></div>
                <div className="flex justify-between text-[#6B1F2B]/70"><span>{t('summary.tax')}</span><span>—</span></div>
              </div>
              <div className="flex justify-between text-xl font-bold text-[#6B1F2B] mb-8">
                <span>{t('summary.total')}</span><span>$0.00</span>
              </div>
              <button className="w-full py-4 bg-[#6B1F2B] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#5a1a24] transition-colors">
                {t('placeOrder')}
              </button>
              <p className="text-xs text-[#6B1F2B]/40 text-center mt-4">{t('sslNotice')}</p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="max-w-5xl mx-auto mt-8">
          <Link href={`/${locale}/products`} className="text-[#C3A35E] text-sm font-medium hover:text-[#6B1F2B] transition-colors">← {t('continueShopping')}</Link>
        </div>
      </div>
    </main>
  )
}

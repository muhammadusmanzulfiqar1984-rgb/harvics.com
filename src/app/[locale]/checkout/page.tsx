'use client'

import { useParams } from 'next/navigation'

import Footer from '@/components/layout/Footer'

export default function CheckoutPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  return (
    <main className="min-h-screen bg-white">
      
      <div className="pt-20 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Checkout</h1>
          <p className="text-black">Checkout page - Coming soon</p>
        </div>
      </div>
    </main>
  )
}

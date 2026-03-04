'use client'

import { useState } from 'react'
import PaymentMethodsList from '@/components/finance/payments/PaymentMethodsList'
import { getAvailablePaymentMethods } from '@/components/finance/payments/PaymentMethodConfig'
import { PaymentMethod } from '@/types/payments'
import { useCountry } from '@/contexts/CountryContext'

export default function SupplierCheckout() {
  const { countryData } = useCountry()
  const currency = countryData?.currency || { symbol: '$', code: 'USD' }
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | undefined>(undefined)
  
  // Get available payment methods for supplier portal
  const availableMethods = getAvailablePaymentMethods('supplier')
  const availableMethodTypes = availableMethods.map(m => m.method)
  // Dummy cart items for supplier
  const cartItems = [
    {
      id: 1,
      name: "Raw Materials Package (500 kg)",
      description: "Premium cocoa beans and sugar for production",
      price: 450000,
      quantity: 1,
      image: "/Images/logo.png"
    },
    {
      id: 2,
      name: "Packaging Materials (1000 units)",
      description: "Chocolate boxes and wrappers",
      price: 125000,
      quantity: 2,
      image: "/Images/logo.png"
    },
    {
      id: 3,
      name: "Flavoring Agents (50 kg)",
      description: "Natural vanilla and fruit extracts",
      price: 85000,
      quantity: 1,
      image: "/Images/logo.png"
    },
    {
      id: 4,
      name: "Quality Control Equipment",
      description: "Testing and measurement tools",
      price: 320000,
      quantity: 1,
      image: "/Images/logo.png"
    }
  ]

  // Pakistani business names for billing
  const pakistaniNames = [
    "Imtiaz Store", "Fatima Boutique", "Muhammad Traders", "Ayesha Mart", 
    "Hassan Shop", "Zainab Enterprises", "Ali Brothers", "Khadija Store",
    "Omar Trading", "Amina Shop", "Usman Mart", "Maryam Store"
  ]

  const randomName = pakistaniNames[Math.floor(Math.random() * pakistaniNames.length)]

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 25000
  const tax = Math.round(subtotal * 0.15) // 15% tax
  const total = subtotal + shipping + tax

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-12 md:py-16 px-4 md:px-6 bg-[#6B1F2B]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
                Supplier Checkout
              </h1>
              <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto px-4">
                Complete your supply order for production materials
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 border border-gray-100">
                      <div className="w-16 h-16 bg-[#6B1F2B]/5 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🏭</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm md:text-base">{item.name}</h3>
                        <p className="text-gray-500 text-xs md:text-sm mb-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                          <span className="font-bold text-[#6B1F2B] text-sm md:text-base">
                            {currency.symbol} {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Subtotal:</span>
                      <span className="font-bold text-gray-900">
                        {currency.symbol} {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Shipping:</span>
                      <span className="font-bold text-gray-900">
                        {currency.symbol} {shipping.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Tax (15%):</span>
                      <span className="font-bold text-gray-900">
                        {currency.symbol} {tax.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-lg font-bold text-[#6B1F2B]">Total:</span>
                      <span className="text-xl font-bold text-[#6B1F2B]">
                        {currency.symbol} {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Billing Information */}
              <div className="bg-white shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-6">
                  Billing Information
                </h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        defaultValue={randomName}
                        className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                        placeholder="Enter business name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                        placeholder="Enter contact person name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                      placeholder="business@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      defaultValue="+92 300 1234567"
                      className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address *
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="House 123, Block A, Gulberg, Lahore, Punjab, Pakistan"
                      className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                      placeholder="Enter complete business address"
                    />
                  </div>
                </form>
              </div>

              {/* Payment Method */}
              <div className="bg-white shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-6">
                  Payment Method
                </h2>
                
                {/* Payment Methods List Component */}
                <div className="mb-6">
                  <PaymentMethodsList
                    selectedMethod={selectedPaymentMethod}
                    onMethodSelect={setSelectedPaymentMethod}
                    availableMethods={availableMethodTypes}
                  />
                </div>

                {/* Credit Card Form */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Transfer Info */}
                {(selectedPaymentMethod === PaymentMethod.BANK_TRANSFER || 
                  selectedPaymentMethod === PaymentMethod.WISE ||
                  selectedPaymentMethod === PaymentMethod.CHEQUE ||
                  selectedPaymentMethod === PaymentMethod.PAY_ORDER ||
                  selectedPaymentMethod === PaymentMethod.DEMAND_DRAFT) && (
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Bank Transfer Details</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Transfer the amount to our business account and upload the receipt.
                    </p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Bank Name:</strong> Habib Bank Limited (HBL)</div>
                      <div><strong>Account Name:</strong> Harvics International Ltd</div>
                      <div><strong>Account Number:</strong> 1234567890123456</div>
                      <div><strong>IBAN:</strong> PK36HABB0012345678901234</div>
                      <div><strong>Swift Code:</strong> HABBPKKA</div>
                      <div><strong>Branch:</strong> Gulberg Branch, Lahore</div>
                    </div>
                    {(selectedPaymentMethod === PaymentMethod.BANK_TRANSFER || 
                      selectedPaymentMethod === PaymentMethod.WISE ||
                      selectedPaymentMethod === PaymentMethod.CHEQUE ||
                      selectedPaymentMethod === PaymentMethod.PAY_ORDER ||
                      selectedPaymentMethod === PaymentMethod.DEMAND_DRAFT) && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Proof Document *
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6B1F2B] file:text-white hover:file:bg-[#6B1F2B]/90 transition-all duration-300"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Crypto Payment Info */}
                {(selectedPaymentMethod === PaymentMethod.USDT || selectedPaymentMethod === PaymentMethod.USDC) && (
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Cryptocurrency Payment</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Send {selectedPaymentMethod === PaymentMethod.USDT ? 'USDT' : 'USDC'} to the address below and upload transaction proof.
                    </p>
                    <div className="text-sm text-gray-600 space-y-1 font-mono">
                      <div><strong>Network:</strong> TRC20 (Tron)</div>
                      <div><strong>Address:</strong> TQn9Y2khEsLMWoF3vKzZqJ8K8K8K8K8K8K8</div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Hash (TX ID) *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter transaction hash"
                        className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                {/* Place Order Button */}
                <button 
                  disabled={!selectedPaymentMethod}
                  className="w-full mt-6 bg-[#6B1F2B] hover:bg-[#2a0006] text-white font-bold py-4 px-6 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>💳</span>
                  <span>
                    Place Order - {currency.symbol} {total.toLocaleString()}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}







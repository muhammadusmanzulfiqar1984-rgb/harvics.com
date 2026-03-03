'use client'

import { useState } from 'react'
import PayPalWrapper from '@/components/finance/payments/PayPalWrapper'
import PayPalSectionToggle from '@/components/finance/payments/PayPalSectionToggle'
import PaymentMethodsList from '@/components/finance/payments/PaymentMethodsList'
import { getAvailablePaymentMethods } from '@/components/finance/payments/PaymentMethodConfig'
import { PaymentMethod } from '@/types/payments'
import { useCountry } from '@/contexts/CountryContext'

export default function DistributorCheckout() {
  const { countryData } = useCountry()
  const currency = countryData?.currency || { symbol: '$', code: 'USD' }
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | undefined>(undefined)
  
  // Get available payment methods for distributor portal
  const availableMethods = getAvailablePaymentMethods('distributor')
  const availableMethodTypes = availableMethods.map(m => m.method)
  // Dummy cart items for distributor
  const cartItems = [
    {
      id: 1,
      name: "Premium Chocolate Box (50 units)",
      description: "Luxury assorted chocolates for retail",
      price: 125000,
      quantity: 2,
      image: "/Images/logo.png"
    },
    {
      id: 2,
      name: "Energy Drinks Pack (24 units)",
      description: "Mixed energy drinks variety pack",
      price: 85000,
      quantity: 3,
      image: "/Images/logo.png"
    },
    {
      id: 3,
      name: "Biscuits Assortment (100 units)",
      description: "Premium biscuit collection",
      price: 95000,
      quantity: 1,
      image: "/Images/logo.png"
    },
    {
      id: 4,
      name: "Juice Collection (48 units)",
      description: "Fresh fruit juice variety pack",
      price: 75000,
      quantity: 2,
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
  const shipping = 15000
  const tax = Math.round(subtotal * 0.15) // 15% tax
  const total = subtotal + shipping + tax

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="pt-20">
        {/* Hero Section */}
        <section className="h-[300px] relative bg-[#6B1F2B] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">
              Distributor Checkout
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light">
              Complete your bulk order for distribution
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 pb-20 -mt-16 z-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-gray-900 mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-16 h-16 bg-[#6B1F2B] rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-2xl">📦</span>
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
                      <span className="text-lg font-bold text-gray-900">Total:</span>
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
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-gray-900 mb-6">
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                        placeholder="Enter business name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                      placeholder="Enter complete business address"
                    />
                  </div>
                </form>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-serif font-medium text-gray-900 mb-6">
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

                {/* Credit Card Form - Show only when Credit Card or Debit Card is selected */}
                {(selectedPaymentMethod === PaymentMethod.CREDIT_CARD || selectedPaymentMethod === PaymentMethod.DEBIT_CARD) && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
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
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Info - Show only when Bank Transfer or related methods are selected */}
                {(selectedPaymentMethod === PaymentMethod.BANK_TRANSFER || 
                  selectedPaymentMethod === PaymentMethod.WISE ||
                  selectedPaymentMethod === PaymentMethod.CHEQUE ||
                  selectedPaymentMethod === PaymentMethod.PAY_ORDER ||
                  selectedPaymentMethod === PaymentMethod.DEMAND_DRAFT) && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Bank Transfer Details</h3>
                    <p className="text-sm text-gray-600 mb-3">
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
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6B1F2B] file:text-white hover:file:bg-[#50000b] transition-all duration-300"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Crypto Payment Info - Show only when USDT or USDC is selected */}
                {(selectedPaymentMethod === PaymentMethod.USDT || selectedPaymentMethod === PaymentMethod.USDC) && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Cryptocurrency Payment</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Send {selectedPaymentMethod === PaymentMethod.USDT ? 'USDT' : 'USDC'} to the address below and upload transaction proof.
                    </p>
                    <div className="text-sm text-gray-600 space-y-1 font-mono bg-white p-3 rounded-lg border border-gray-200">
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent text-gray-900 bg-white placeholder-gray-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                {/* PayPal Payment Section - Show only when PayPal is selected */}
                {selectedPaymentMethod === PaymentMethod.PAYPAL && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">PayPal Payment</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Click the PayPal button below to complete your payment securely.
                    </p>
                    <PayPalWrapper
                      amount={total / 100} // Convert local currency to USD equivalent for demo
                      currency="USD"
                    />
                  </div>
                )}

                {/* Apple Pay Section - Show only when Apple Pay is selected */}
                {selectedPaymentMethod === PaymentMethod.APPLE_PAY && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Apple Pay</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Complete your payment using Apple Pay on supported devices.
                    </p>
                    <button className="w-full px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-md">
                      Pay with Apple Pay
                    </button>
                  </div>
                )}

                {/* Place Order Button */}
                <button 
                  disabled={!selectedPaymentMethod}
                  className="w-full mt-6 bg-[#6B1F2B] hover:bg-[#50000b] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

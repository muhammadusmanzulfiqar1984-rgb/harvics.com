'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/data/countryData'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

interface Product {
  id: string
  name: string
  sku: string
  price: number
}

interface OrderItem {
  product_id: string
  quantity: number
  unit_price: number
}

export default function NewDistributorOrder() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('distributorPortal.newOrder')
  const tCommon = useTranslations('distributorPortal.common')
  const { countryData, selectedCountry } = useCountry()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [formData, setFormData] = useState({
    delivery_date: '',
    delivery_address: '',
    notes: '',
    retailer_id: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await apiClient.getProducts()
        if (response.data) {
          setProducts(Array.isArray(response.data) ? response.data : [])
        }
      } catch (err) {
        console.error('Failed to load products:', err)
      }
    }

    fetchProducts()

    // Get CSRF token from localStorage or fetch it
    const storedToken = localStorage.getItem('csrf_token')
    if (storedToken) {
      setCsrfToken(storedToken)
    }
  }, [])

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1, unit_price: 0 }])
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updated = [...orderItems]
    updated[index] = { ...updated[index], [field]: value }
    
    // Auto-update unit_price when product is selected
    if (field === 'product_id') {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].unit_price = product.price
      }
    }
    
    setOrderItems(updated)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (orderItems.length === 0) {
      newErrors.items = t('validation.itemsRequired')
    }

    orderItems.forEach((item, index) => {
      if (!item.product_id) {
        newErrors[`item_${index}_product`] = t('validation.productRequired')
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = t('validation.quantityRequired')
      }
      if (!item.unit_price || item.unit_price < 0) {
        newErrors[`item_${index}_price`] = t('validation.priceRequired')
      }
    })

    if (formData.delivery_date) {
      const deliveryDate = new Date(formData.delivery_date)
      if (isNaN(deliveryDate.getTime())) {
        newErrors.delivery_date = t('validation.invalidDate')
      } else if (deliveryDate < new Date()) {
        newErrors.delivery_date = t('validation.datePast')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // Store CSRF token if available
      if (csrfToken) {
        localStorage.setItem('csrf_token', csrfToken)
      }

      const response = await apiClient.createDistributorOrder({
        items: orderItems,
        delivery_date: formData.delivery_date || undefined,
        delivery_address: formData.delivery_address || undefined,
        notes: formData.notes || undefined,
        retailer_id: formData.retailer_id || undefined,
      })

      if (response.error) {
        setErrors({ submit: response.error })
        return
      }

      const responseData = response as { data?: { data?: { orderId?: string } } }
      if (responseData.data?.data?.orderId) {
        router.push(`/${locale}/distributor/orders/${responseData.data.data.orderId}`)
      } else {
        router.push(`/${locale}/distributor/orders`)
      }
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to create order' })
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  }

  const formatCurrencyAmount = (amount: number) => {
    if (countryData && selectedCountry) {
      const countryCode = countryData?.currency?.code || 'US'
      return formatCurrency(amount, countryCode)
    }
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#C3A35E] mb-8">{t('title')}</h1>

          <form onSubmit={handleSubmit} className="bg-white shadow p-6">
            {errors.submit && (
              <div className="mb-6 bg-red-50 border border-red-200 p-4">
                <p className="text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Order Items */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#C3A35E]">{t('orderItems')}</h2>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="bg-white text-white px-4 py-2 font-semibold hover:bg-[#5a0012] transition-colors"
                >
                  {t('addItem')}
                </button>
              </div>

              {errors.items && (
                <p className="text-red-600 text-sm mb-2">{errors.items}</p>
              )}

              {orderItems.length === 0 ? (
                <p className="text-[#C3A35E]/90 text-center py-8">{t('noItems')}</p>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="border border-black200 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                            {t('product')} *
                          </label>
                          <select
                            value={item.product_id}
                            onChange={(e) => updateOrderItem(index, 'product_id', e.target.value)}
                            className="w-full border border-black300 px-4 py-2"
                            required
                          >
                            <option value="">{t('selectProduct')}</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                              </option>
                            ))}
                          </select>
                          {errors[`item_${index}_product`] && (
                            <p className="text-red-600 text-xs mt-1">{errors[`item_${index}_product`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                            {t('quantity')} *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full border border-black300 px-4 py-2"
                            required
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="text-red-600 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                            {t('unitPrice')} *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full border border-black300 px-4 py-2"
                            required
                          />
                          {errors[`item_${index}_price`] && (
                            <p className="text-red-600 text-xs mt-1">{errors[`item_${index}_price`]}</p>
                          )}
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeOrderItem(index)}
                            className="w-full bg-red-100 text-red-800 px-4 py-2 font-semibold hover:bg-red-200 transition-colors"
                          >
                            {t('remove')}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-[#C3A35E]/90">
                        {t('subtotal')}: {formatCurrencyAmount(item.quantity * item.unit_price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="mb-6 space-y-4">
              <h2 className="text-xl font-bold text-[#C3A35E]">{t('orderDetails')}</h2>
              
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                  {t('deliveryDate')}
                </label>
                <input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  className="w-full border border-black300 px-4 py-2"
                />
                {errors.delivery_date && (
                  <p className="text-red-600 text-xs mt-1">{errors.delivery_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                  {t('deliveryAddress')}
                </label>
                <textarea
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  className="w-full border border-black300 px-4 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                  {t('notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-black300 px-4 py-2"
                  rows={3}
                />
              </div>
            </div>

            {/* Total */}
            <div className="mb-6 p-4 bg-white">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[#C3A35E]/90">{t('totalAmount')}:</span>
                <span className="text-2xl font-bold text-[#C3A35E]">
                  {formatCurrencyAmount(calculateTotal())}
                </span>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-white text-white px-6 py-3 font-semibold hover:bg-[#5a0012] transition-colors disabled:opacity-50"
              >
                {loading ? t('creatingOrder') : t('createOrder')}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/${locale}/distributor/orders`)}
                className="flex-1 bg-white text-[#C3A35E]/90 px-6 py-3 font-semibold hover:bg-white transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface CompetitorProduct {
  id: string
  brand: string
  category: string
  sku_name: string
  size: string
  price: number
  currency: string
  country: string
  created_at: string
}

export default function CompetitorProductsPage() {
  const [products, setProducts] = useState<CompetitorProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    brand: '',
    category: '',
    sku_name: '',
    size: '',
    price: '',
    currency: 'USD',
    country: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await (apiClient as any).getCompetitorProducts()
      if (response.data) {
        setProducts(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await (apiClient as any).createCompetitorProduct({
        product_name: formData.sku_name,
        brand: formData.brand,
        category: formData.category,
        country_code: formData.country,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency
      })
      setShowForm(false)
      setFormData({
        brand: '',
        category: '',
        sku_name: '',
        size: '',
        price: '',
        currency: 'USD',
        country: ''
      })
      loadProducts()
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Competitor Products</h1>
          <p className="text-white/90">Track competitor product information</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-white/90 px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-black200 p-6">
          <h2 className="text-xl font-semibold text-white/90 mb-4">Add Competitor Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Brand *</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">SKU Name *</label>
                <input
                  type="text"
                  value={formData.sku_name}
                  onChange={(e) => setFormData({ ...formData, sku_name: e.target.value })}
                  className="w-full px-3 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Size</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AED">AED</option>
                  <option value="PKR">PKR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-black300 rounded-lg hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-white/90 rounded-lg font-semibold hover:bg-white/90"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-black200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/90">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/90">No competitor products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-black200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">SKU Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">Date Added</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/90">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                      {product.sku_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                      {product.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                      {product.size || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                      {product.price ? `${product.currency} ${product.price.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                      {product.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


'use client'

import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { fetchInventoryProducts, fetchPriceForSku } from '@/lib/distributorPortal'
import HarvicsImage, { IMAGE_SIZES } from '@/components/ui/HarvicsImage'

type ProductRow = {
  sku: string
  name: string
  category: string
  packSize: string
  distributorPrice: number
  image: string
}

export default function ProductCatalogue() {
  const locale = useLocale()
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const rows = await fetchInventoryProducts(200)
        const mapped = await Promise.all(
          rows.map(async (item: any) => {
            const price = (await fetchPriceForSku(item.sku)) ?? Number(item.unitCost) ?? 0
            return {
              sku: item.sku,
              name: item.description || item.name || item.sku,
              category: item.category || 'General',
              packSize: item.packSize || item.uom || '—',
              distributorPrice: price,
              image: '/assets/brand/photo/logo.png',
            }
          }),
        )
        setProducts(mapped)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))]
  const filtered = selectedCategory === 'All' ? products : products.filter((p) => p.category === selectedCategory)

  return (
    <div className="space-y-6">
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} className="mb-4" />
      <h1 className="text-2xl font-bold text-harvics-burgundy">Product Catalogue</h1>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="bg-white p-4 border">
        <label className="block text-sm font-semibold mb-2">Category</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full max-w-xs border px-3 py-2">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {loading ? (
        <p className="text-sm text-gray-600">Loading catalogue…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-600">No SKUs in inventory — add stock in Module #22.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div key={product.sku} className="bg-white border overflow-hidden">
              <div className="relative h-40 flex items-center justify-center p-4 bg-[#F5F0E8]">
                <HarvicsImage src={product.image} alt={product.name} fill sizes={IMAGE_SIZES.product} className="object-contain" />
              </div>
              <div className="p-4">
                <div className="font-semibold text-harvics-burgundy">{product.name}</div>
                <div className="text-xs text-gray-600">{product.sku} · {product.packSize}</div>
                <div className="mt-2 text-lg font-bold">${product.distributorPrice.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

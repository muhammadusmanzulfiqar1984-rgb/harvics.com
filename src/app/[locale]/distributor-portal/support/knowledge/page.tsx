'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'

export default function KnowledgeBase() {
  const locale = useLocale()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null)

  const categories = ['Getting Started', 'Orders', 'Payments', 'Products', 'Territories', 'Technical']

  const articles = [
    { id: 1, title: 'How to Place an Order', category: 'Orders', tags: ['orders', 'purchasing'] },
    { id: 2, title: 'Understanding Your Invoice', category: 'Payments', tags: ['invoice', 'payment'] },
    { id: 3, title: 'Product Catalogue Guide', category: 'Products', tags: ['products', 'catalog'] },
    { id: 4, title: 'Territory Management', category: 'Territories', tags: ['territory', 'coverage'] },
    { id: 5, title: 'Portal Navigation Guide', category: 'Getting Started', tags: ['navigation', 'portal'] },
  ]

  const articleContent: Record<number, string> = {
    1: 'To place an order, navigate to Orders > Place New Order. Select your country, warehouse, and order type. Then add products to your cart and click Review Order.',
    2: 'Your invoice contains all order details, payment terms, and due dates. You can download invoices from the Invoices & Payments section.',
    3: 'Browse products by category, country, and channel. Click on any product to see details and add to your order.',
    4: 'Manage your territories from the Coverage section. View your territories, see coverage heatmaps, or request new territories.',
    5: 'Use the left sidebar to navigate between sections. The top bar shows your distributor info and access to Harvey AI assistant.',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#C3A35E]">Knowledge Base</h1>

      {/* Search Bar */}
      <div className="bg-white p-4 border border-black200 shadow-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="lg:col-span-1 bg-white border border-black200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#C3A35E] mb-4">Categories</h2>
          <div className="space-y-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-4 py-2 transition-colors ${
                  selectedCategory === category
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-[#C3A35E]/90 hover:bg-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Articles List / Article View */}
        <div className="lg:col-span-2 bg-white border border-black200 shadow-sm p-6">
          {selectedArticle ? (
            <div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-white hover:underline mb-4"
              >
                ← Back to Articles
              </button>
              <h2 className="text-2xl font-bold text-[#C3A35E] mb-4">
                {articles.find(a => a.id === selectedArticle)?.title}
              </h2>
              <div className="prose max-w-none">
                <p className="text-[#C3A35E]/90">{articleContent[selectedArticle]}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-black200">
                <div className="text-sm font-semibold text-[#C3A35E]/90 mb-2">Was this helpful?</div>
                <div className="flex space-x-4">
                  <button className="bg-green-100 text-green-800 px-4 py-2 font-semibold hover:bg-green-200 transition-colors">
                    Yes
                  </button>
                  <button className="bg-red-100 text-red-800 px-4 py-2 font-semibold hover:bg-red-200 transition-colors">
                    No
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-[#C3A35E] mb-4">Articles</h2>
              <div className="space-y-3">
                {articles
                  .filter(article => 
                    (selectedCategory === 'All' || article.category === selectedCategory) &&
                    (searchQuery === '' || article.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map(article => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article.id)}
                      className="p-4 border border-black200 hover:border-white hover:shadow-md transition-all cursor-pointer"
                    >
                      <h3 className="font-semibold text-[#C3A35E]/90 mb-2">{article.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-[#C3A35E]/90">
                        <span>{article.category}</span>
                        <div className="flex space-x-2">
                          {article.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white rounded text-xs">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


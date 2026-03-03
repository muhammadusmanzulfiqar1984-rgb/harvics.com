'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'page' | 'product' | 'section'
  title: string
  description?: string
  url: string
}

const searchIndex: SearchResult[] = [
  { type: 'page', title: 'Home', description: 'Main landing page', url: '/' },
  { type: 'page', title: 'About Us', description: 'Learn about Harvics', url: '/about' },
  { type: 'page', title: 'Products', description: 'Browse our products', url: '/products' },
  { type: 'page', title: 'Contact', description: 'Get in touch with us', url: '/contact' },
  { type: 'page', title: 'Dashboard', description: 'Company dashboard', url: '/dashboard/company' },
  { type: 'page', title: 'Portals', description: 'Access portals', url: '/portals' },
  { type: 'section', title: 'ESG Report', description: 'Corporate sustainability', url: '/csr' },
  { type: 'section', title: 'Investor Relations', description: 'Investor information', url: '/investor-relations' },
  { type: 'section', title: 'Media', description: 'Press and media resources', url: '/csr' },
  { type: 'section', title: 'Localization Dashboard', description: 'Country and market analysis', url: '/localization-dashboard' },
]

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setResults([])
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    )
    setResults(filtered.slice(0, 8))
  }, [searchQuery])

  const handleResultClick = (url: string) => {
    router.push(`/${locale}${url}`)
    onClose()
    setSearchQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      setSearchQuery('')
    } else if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0].url)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="fixed inset-x-0 top-20 mx-auto max-w-2xl z-50">
        <div className="bg-white rounded-lg shadow-2xl border-2 border-[#C3A35E]/30 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-[#C3A35E]/30">
            <svg className="w-5 h-5 text-[#C3A35E]/80 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 text-[#C3A35E]/80 hover:text-[#C3A35E]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Results */}
          {searchQuery.trim().length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                <div className="py-2">
                  {results.map((result, index) => (
                    <button
                      key={`${result.url}-${index}`}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors duration-150 border-b border-[#C3A35E]/20 last:border-b-0"
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-white uppercase tracking-wide">
                              {result.type}
                            </span>
                            <h4 className="font-semibold text-white">{result.title}</h4>
                          </div>
                          {result.description && (
                            <p className="text-sm text-[#C3A35E]/90">{result.description}</p>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-[#C3A35E]/80 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-[#C3A35E]/80">
                  <p>{t('noResults')} "{searchQuery}"</p>
                  <p className="text-sm mt-2">{t('tryDifferent')}</p>
                </div>
              )}
            </div>
          )}

          {/* Helper Text */}
          {searchQuery.trim().length === 0 && (
            <div className="px-4 py-6 text-center text-[#C3A35E]/80">
              <p className="text-sm">{t('typeToSearch')}</p>
              <p className="text-xs mt-2 text-white/60">{t('pressEsc')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}


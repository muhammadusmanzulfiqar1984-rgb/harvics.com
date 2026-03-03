'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

interface SaleCategory {
  id: string
  name: string
  discount: string
  subcategories: string[]
}

interface SaleMegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

const SaleMegaMenu: React.FC<SaleMegaMenuProps> = ({ isOpen, onClose }) => {
  const locale = useLocale()
  const menuRef = useRef<HTMLDivElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [showPromoForm, setShowPromoForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    interests: [] as string[]
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const saleCategories: SaleCategory[] = [
    {
      id: 'womens-sale',
      name: "Women's sale",
      discount: 'UP TO 50% OFF',
      subcategories: ["All Women's sale", 'Dresses', 'Shirts & Blouses', 'Jumpers & Cardigans', 'Trousers', 'Coats & Jackets']
    },
    {
      id: 'kids-sale',
      name: "Kids' sale",
      discount: 'UP TO 50% OFF',
      subcategories: ["All Kids' sale", 'Girls', 'Boys', 'Baby']
    },
    {
      id: 'mens-sale',
      name: "Men's sale",
      discount: 'UP TO 50% OFF',
      subcategories: ["All Men's sale", 'Shirts', 'Coats & Jackets', 'Trousers']
    },
    {
      id: 'lingerie-sale',
      name: 'Lingerie & Nightwear sale',
      discount: 'UP TO 50% OFF',
      subcategories: ["All Lingerie sale", 'Bras', 'Knickers', 'Nightwear']
    },
    {
      id: 'homeware-sale',
      name: 'Homeware sale',
      discount: 'UP TO 50% OFF',
      subcategories: ["All Homeware sale"]
    },
    {
      id: 'brands-sale',
      name: 'Brands sale',
      discount: 'UP TO 50% OFF',
      subcategories: ["All Brands sale", "Women's brands sale", "Kids' brands sale", "Men's brands sale", 'Lingerie brands sale']
    },
    {
      id: 'all-offers',
      name: 'All offers',
      discount: 'UNMISSABLE OFFERS',
      subcategories: []
    }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedSubcategory(null)
    setShowPromoForm(false)
  }

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory)
    setShowPromoForm(true)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      const interests = formData.interests
      if (checked) {
        setFormData({ ...formData, interests: [...interests, value] })
      } else {
        setFormData({ ...formData, interests: interests.filter(i => i !== value) })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' })
    }
  }

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email'
    }
    
    if (!formData.phone) {
      errors.phone = 'Phone is required'
    }
    
    if (formData.interests.length === 0) {
      errors.interests = 'Select at least one interest'
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    // Submit form (in real app, send to backend)
    console.log('Promo form submitted:', formData)
    alert('Thank you! You will receive exclusive sale notifications.')
    setShowPromoForm(false)
    setFormData({ email: '', phone: '', interests: [] })
    onClose()
  }

  if (!isOpen) return null

  const selectedCategoryData = selectedCategory 
    ? saleCategories.find(c => c.id === selectedCategory)
    : null

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 right-0 bg-white border-t-4 border-maroon shadow-2xl z-50"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Section - Categories */}
          <div className="col-span-12 lg:col-span-8">
            {!selectedCategory ? (
              /* LAYER 1: Main Categories */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {saleCategories.map((category) => (
                  <div key={category.id} className="border-2 border-maroon/20 rounded-lg p-4 hover:border-maroon hover:bg-maroon/5 transition-colors group">
                    <button
                      onClick={() => handleCategorySelect(category.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-maroon group-hover:text-maroon">{category.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          category.discount.includes('50%') 
                            ? 'bg-maroon text-gold' 
                            : 'bg-gold text-maroon'
                        }`}>
                          {category.discount}
                        </span>
                      </div>
                      {category.subcategories.length > 0 && (
                        <p className="text-sm text-maroon/70 group-hover:text-maroon font-medium">Click to view subcategories →</p>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : selectedCategoryData && !showPromoForm ? (
              /* LAYER 2: Subcategories */
              <div>
                <div className="mb-4 pb-3 border-b-2 border-maroon/20 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-maroon">{selectedCategoryData.name}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black mt-2 inline-block">
                      {selectedCategoryData.discount}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(null)
                      setSelectedSubcategory(null)
                    }}
                    className="text-black hover:text-black font-bold"
                  >
                    ← Back
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedCategoryData.subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => handleSubcategorySelect(subcategory)}
                      className="px-4 py-3 bg-white hover:bg-white border-2 border-black200 hover:border-[#6B1F2B] rounded-md transition-all text-left font-semibold text-sm text-black"
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* LAYER 3: Promo Form */
              <div className="bg-white border-2 border-[#6B1F2B] rounded-lg p-6">
                <div className="mb-4 pb-3 border-b-2 border-[#6B1F2B]">
                  <h3 className="font-bold text-xl text-black mb-2">
                    Get Exclusive Sale Notifications
                  </h3>
                  <p className="text-sm text-black">
                    Selected: {selectedSubcategory} in {selectedCategoryData?.name}
                  </p>
                </div>
                <form onSubmit={handlePromoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border-2 rounded-md ${
                        formErrors.email ? 'border-red-500' : 'border-[#6B1F2B]'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border-2 rounded-md ${
                        formErrors.phone ? 'border-red-500' : 'border-[#6B1F2B]'
                      }`}
                      placeholder="+1 234 567 8900"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Interests *
                    </label>
                    <div className="space-y-2">
                      {selectedCategoryData?.subcategories.map((sub) => (
                        <label key={sub} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={sub}
                            checked={formData.interests.includes(sub)}
                            onChange={handleFormChange}
                            className="w-4 h-4 text-black border-2 border-[#6B1F2B] rounded"
                          />
                          <span className="text-sm text-black">{sub}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.interests && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.interests}</p>
                    )}
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPromoForm(false)
                        setSelectedSubcategory(null)
                      }}
                      className="flex-1 px-4 py-2 bg-white text-black font-bold rounded-md hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-white text-white font-bold rounded-md hover:bg-white"
                    >
                      Subscribe to Deals
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Section - Promotional Image */}
          <div className="col-span-12 lg:col-span-4">
            <div className="relative h-full min-h-[400px] bg-gradient-to-br from-[#6B1F2B] to-[#6B1F2B] rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-6xl font-bold text-white mb-4">SALE</h2>
                <p className="text-2xl text-white font-semibold">up to 50% off</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SaleMegaMenu




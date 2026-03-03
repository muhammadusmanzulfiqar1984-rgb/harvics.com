'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { getCountryFlag } from '@/utils/countryFlags'

// Region to Countries mapping
const REGION_COUNTRIES: Record<string, { name: string; countries: string[] }> = {
  'middle-east': {
    name: 'Middle East',
    countries: ['ae', 'sa', 'eg', 'jo', 'kw', 'qa', 'bh', 'om', 'iq', 'lb', 'ye']
  },
  'europe': {
    name: 'Europe',
    countries: ['gb', 'fr', 'de', 'es', 'it']
  },
  'north-america': {
    name: 'North America',
    countries: ['us']
  },
  'asia': {
    name: 'Asia',
    countries: ['pk', 'cn']
  },
  'africa': {
    name: 'Africa',
    countries: ['eg', 'ma', 'tn', 'dz', 'ly', 'sd', 'so', 'dj']
  }
}

const COUNTRY_NAMES: Record<string, string> = {
  'us': 'United States',
  'pk': 'Pakistan',
  'ae': 'United Arab Emirates',
  'gb': 'United Kingdom',
  'sa': 'Saudi Arabia',
  'eg': 'Egypt',
  'jo': 'Jordan',
  'kw': 'Kuwait',
  'qa': 'Qatar',
  'bh': 'Bahrain',
  'om': 'Oman',
  'iq': 'Iraq',
  'lb': 'Lebanon',
  'fr': 'France',
  'de': 'Germany',
  'es': 'Spain',
  'it': 'Italy',
  'cn': 'China',
  'ma': 'Morocco',
  'tn': 'Tunisia',
  'dz': 'Algeria',
  'ly': 'Libya',
  'sd': 'Sudan',
  'so': 'Somalia',
  'dj': 'Djibouti'
}

interface HarvicsGlobalWorldProps {
  onRegionChange?: (region: string, country: string) => void
}

const HarvicsGlobalWorld: React.FC<HarvicsGlobalWorldProps> = ({ onRegionChange }) => {
  const { selectedCountry, setSelectedCountry, countryData } = useCountry()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('globalWorld')
  const tCommon = useTranslations('common')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    marketingConsent: false
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Layer 1: Region Selection
  const handleRegionSelect = (region: string) => {
    console.log(`🌍 Region selected: ${region}`)
    setSelectedRegion(region)
    setSelectedCountryCode(null) // Reset country selection
    setShowForm(false) // Ensure form doesn't show
  }

  // Layer 2: Country Selection - Navigate immediately
  const handleCountrySelect = (countryCode: string) => {
    // Map country code to locale
    const countryToLocale: Record<string, string> = {
      'us': 'en',
      'gb': 'en',
      'pk': 'en', // Pakistan uses English
      'ae': 'ar', // UAE uses Arabic
      'sa': 'ar', // Saudi Arabia uses Arabic
      'eg': 'ar', // Egypt uses Arabic
      'jo': 'ar', // Jordan uses Arabic
      'kw': 'ar', // Kuwait uses Arabic
      'qa': 'ar', // Qatar uses Arabic
      'bh': 'ar', // Bahrain uses Arabic
      'om': 'ar', // Oman uses Arabic
      'iq': 'ar', // Iraq uses Arabic
      'lb': 'ar', // Lebanon uses Arabic
      'ye': 'ar', // Yemen uses Arabic
      'fr': 'fr', // France uses French
      'de': 'de', // Germany uses German
      'es': 'es', // Spain uses Spanish
      'it': 'it', // Italy uses Italian
      'cn': 'zh', // China uses Chinese
      'ma': 'ar', // Morocco uses Arabic
      'tn': 'ar', // Tunisia uses Arabic
      'dz': 'ar', // Algeria uses Arabic
      'ly': 'ar', // Libya uses Arabic
      'sd': 'ar', // Sudan uses Arabic
      'so': 'ar', // Somalia uses Arabic
      'dj': 'ar'  // Djibouti uses Arabic
    }
    
    // Map country code to country slug for routing
    const countryToSlug: Record<string, string> = {
      'us': 'united-states',
      'gb': 'united-kingdom',
      'pk': 'pakistan',
      'ae': 'uae',
      'sa': 'saudi-arabia',
      'eg': 'egypt',
      'jo': 'jordan',
      'kw': 'kuwait',
      'qa': 'qatar',
      'bh': 'bahrain',
      'om': 'oman',
      'iq': 'iraq',
      'lb': 'lebanon',
      'ye': 'yemen',
      'fr': 'france',
      'de': 'germany',
      'es': 'spain',
      'it': 'italy',
      'cn': 'china',
      'ma': 'morocco',
      'tn': 'tunisia',
      'dz': 'algeria',
      'ly': 'libya',
      'sd': 'sudan',
      'so': 'somalia',
      'dj': 'djibouti'
    }
    
    const targetLocale = countryToLocale[countryCode] || 'en'
    const countrySlug = countryToSlug[countryCode] || countryCode.toLowerCase()
    
    // Close dropdown first to prevent form from showing
    setIsOpen(false)
    setSelectedRegion(null)
    setSelectedCountryCode(null)
    
    // Update country in context
    if (setSelectedCountry) {
      setSelectedCountry(countrySlug)
    }
    
    // Call callback if provided
    if (onRegionChange && selectedRegion) {
      onRegionChange(selectedRegion, countryCode)
    }
    
    // Get current path without locale
    const pathWithoutLocale = pathname ? pathname.replace(`/${locale}`, '') || '/' : '/'
    
    // Navigate to the same page but with new locale
    const newPath = `/${targetLocale}${pathWithoutLocale}`
    
    console.log(`🌍 Navigating to ${newPath} for country ${countryCode} (${countrySlug}) - changing locale from ${locale} to ${targetLocale}`)
    
    // Use router.push for proper Next.js navigation (preserves state, faster)
    router.push(newPath)
    
    // Force a small delay to ensure state updates, then refresh if needed
    setTimeout(() => {
      // If navigation didn't work, force reload
      if (window.location.pathname !== newPath) {
        console.log('Router.push failed, using window.location as fallback')
        window.location.href = newPath
      }
    }, 100)
  }

  // Layer 3: Form Submission
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = t('form.nameRequired') || tCommon('required') || 'Name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = t('form.emailRequired') || tCommon('required') || 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('form.emailInvalid') || 'Please enter a valid email address'
    }
    
    if (!formData.phone.trim()) {
      errors.phone = t('form.phoneRequired') || tCommon('required') || 'Phone number is required'
    }
    
    if (!formData.address.trim()) {
      errors.address = t('form.addressRequired') || tCommon('required') || 'Address is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update country in context
      if (selectedCountryCode) {
        setSelectedCountry(selectedCountryCode)
      }

      // Save customer data (in real app, send to backend)
      const customerData = {
        ...formData,
        region: selectedRegion,
        country: selectedCountryCode,
        locale,
        timestamp: new Date().toISOString()
      }
      
      localStorage.setItem('customer_data', JSON.stringify(customerData))
      
      // Call callback if provided
      if (onRegionChange && selectedRegion && selectedCountryCode) {
        onRegionChange(selectedRegion, selectedCountryCode)
      }

      // Redirect to country-specific site (if form was submitted)
      if (selectedCountryCode) {
        const countryToLocale: Record<string, string> = {
          'us': 'en', 'gb': 'en', 'pk': 'en',
          'ae': 'ar', 'sa': 'ar', 'eg': 'ar', 'jo': 'ar', 'kw': 'ar', 'qa': 'ar', 'bh': 'ar', 'om': 'ar', 'iq': 'ar', 'lb': 'ar', 'ye': 'ar',
          'fr': 'fr', 'de': 'de', 'es': 'es', 'it': 'it', 'cn': 'zh',
          'ma': 'ar', 'tn': 'ar', 'dz': 'ar', 'ly': 'ar', 'sd': 'ar', 'so': 'ar', 'dj': 'ar'
        }
        const targetLocale = countryToLocale[selectedCountryCode] || 'en'
        router.push(`/${targetLocale}`)
      }

      // Reset form
      setShowForm(false)
      setIsOpen(false)
      setSelectedRegion(null)
      setSelectedCountryCode(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        marketingConsent: false
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setFormErrors({ submit: 'Failed to submit. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const currentCountryName = selectedCountryCode 
    ? COUNTRY_NAMES[selectedCountryCode] || selectedCountryCode
    : countryData?.countryName || 'Global Site'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-[#dc2626] hover:text-[#b91c1c] transition-colors duration-200 font-bold text-xs sm:text-sm uppercase"
        aria-label={t('title') || 'Harvics Global World'}
      >
        {/* Globe Icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        {/* Text */}
        <span className="hidden sm:inline">{t('title') || 'Harvics Global'}</span>
        <span className="sm:hidden">{t('titleShort') || 'Global'}</span>
        
        {/* Chevron */}
        <svg 
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - 3 Layer Structure */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border-2 border-[#6B1F2B] shadow-2xl z-50 rounded-lg overflow-hidden">
          {!showForm ? (
            <>
              {/* LAYER 1: Region Selection */}
              {!selectedRegion ? (
                <div className="p-4">
                  <div className="mb-4 pb-3 border-b-2 border-[#6B1F2B]">
                    <h3 className="text-black font-bold text-sm uppercase tracking-wide flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{t('selectRegion') || 'Select Region'}</span>
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(REGION_COUNTRIES).map(([key, region]) => (
                      <button
                        key={key}
                        onClick={() => handleRegionSelect(key)}
                        className="w-full text-left px-4 py-3 bg-white text-white hover:bg-white hover:text-[#C3A35E] border-2 border-[#6B1F2B] rounded-md transition-all duration-200 font-bold text-sm"
                      >
                        {region.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* LAYER 2: Country Selection */
                <div className="p-4">
                  <div className="mb-4 pb-3 border-b-2 border-[#6B1F2B] flex items-center justify-between">
                    <h3 className="text-black font-bold text-sm uppercase tracking-wide">
                      {REGION_COUNTRIES[selectedRegion].name}
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedRegion(null)
                        setSelectedCountryCode(null)
                      }}
                      className="text-black hover:text-[#6B1F2B] font-bold"
                    >
                      ← {tCommon('back') || 'Back'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {REGION_COUNTRIES[selectedRegion].countries.map((countryCode) => (
                      <button
                        key={countryCode}
                        onClick={() => handleCountrySelect(countryCode)}
                        className="w-full text-left px-4 py-3 bg-white hover:bg-white hover:text-[#C3A35E] text-black border-2 border-[#6B1F2B] rounded-md transition-all duration-200 font-bold text-sm flex items-center space-x-3"
                      >
                        <span className="text-2xl">{getCountryFlag(countryCode)}</span>
                        <span>{COUNTRY_NAMES[countryCode] || countryCode.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* LAYER 3: Customer Details Form - Optional (can be skipped) */
            <div className="p-6 bg-white">
              <div className="mb-4 pb-3 border-b-2 border-[#6B1F2B] flex items-center justify-between">
                <div>
                  <h3 className="text-black font-bold text-lg uppercase tracking-wide">
                    {t('form.title') || 'Customer Details'}
                  </h3>
                  <p className="text-sm text-black mt-1">
                    {t('form.selected') || 'Selected'}: {COUNTRY_NAMES[selectedCountryCode || ''] || selectedCountryCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCountryCode) {
                      handleCountrySelect(selectedCountryCode)
                    }
                  }}
                  className="px-4 py-2 bg-white text-white hover:bg-white rounded-md text-sm font-bold transition-colors whitespace-nowrap ml-4"
                >
                  {t('form.skip') || 'Skip & Continue'}
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-black mb-1">
                    {t('form.fullName') || 'Full Name'} * {tCommon('required') ? `(${tCommon('required')})` : ''}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border-2 rounded-md ${
                      formErrors.name ? 'border-red-500' : 'border-[#6B1F2B]'
                    } focus:outline-none focus:ring-2 focus:ring-black`}
                    placeholder={t('form.namePlaceholder') || 'Enter your full name'}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-black mb-1">
                    {t('form.email') || 'Email Address'} * {tCommon('required') ? `(${tCommon('required')})` : ''}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border-2 rounded-md ${
                      formErrors.email ? 'border-red-500' : 'border-[#6B1F2B]'
                    } focus:outline-none focus:ring-2 focus:ring-black`}
                    placeholder={t('form.emailPlaceholder') || 'your.email@example.com'}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-black mb-1">
                    {t('form.phone') || 'Phone Number'} * {tCommon('required') ? `(${tCommon('required')})` : ''}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border-2 rounded-md ${
                      formErrors.phone ? 'border-red-500' : 'border-[#6B1F2B]'
                    } focus:outline-none focus:ring-2 focus:ring-black`}
                    placeholder={t('form.phonePlaceholder') || '+1 234 567 8900'}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label htmlFor="address" className="block text-sm font-bold text-black mb-1">
                    {t('form.address') || tCommon('address') || 'Address'} * {tCommon('required') ? `(${tCommon('required')})` : ''}
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border-2 rounded-md ${
                      formErrors.address ? 'border-red-500' : 'border-[#6B1F2B]'
                    } focus:outline-none focus:ring-2 focus:ring-black`}
                    placeholder={t('form.addressPlaceholder') || 'Your address'}
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                  )}
                </div>

                {/* Marketing Consent */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleFormChange}
                    className="mt-1 w-4 h-4 text-black border-2 border-[#6B1F2B] rounded focus:ring-black"
                  />
                  <label htmlFor="marketingConsent" className="text-sm text-black">
                    {t('form.marketingConsent') || 'I agree to receive marketing communications and updates'}
                  </label>
                </div>

                {formErrors.submit && (
                  <p className="text-red-500 text-xs">{formErrors.submit}</p>
                )}

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setSelectedCountryCode(null)
                    }}
                    className="flex-1 px-4 py-2 bg-white text-black font-bold rounded-md hover:bg-white transition-colors"
                  >
                    {tCommon('cancel') || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-white text-white font-bold rounded-md hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (t('form.submitting') || 'Submitting...') : (t('form.submit') || 'Submit & Continue')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HarvicsGlobalWorld


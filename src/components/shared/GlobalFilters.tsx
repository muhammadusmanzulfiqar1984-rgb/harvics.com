'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import { useLocalization } from '@/utils/localization'

export interface FilterState {
  scope: 'global' | 'region' | 'country' | 'city' | 'district' | 'area' | 'location'
  country: string
  period: '7d' | '30d' | '90d' | 'quarter' | 'ytd' | 'custom'
  currency: 'USD' | 'EUR' | 'PKR' | 'AED' | 'SAR'
  customStartDate?: string
  customEndDate?: string
}

interface GlobalFiltersProps {
  onFilterChange?: (filters: FilterState) => void
  defaultFilters?: Partial<FilterState>
  className?: string
}

export default function GlobalFilters({ 
  onFilterChange, 
  defaultFilters,
  className = '' 
}: GlobalFiltersProps) {
  const locale = useLocale()
  const { selectedCountry, availableCountries, countryData, setSelectedCountry } = useCountry()
  const { getCurrencyCode, getCurrencySymbol, currency, setCurrency } = useLocalization()

  // Get default currency from country data - use localization hook currency as primary source
  const defaultCurrency = (currency?.code || countryData?.currency?.code || getCurrencyCode() || 'USD') as FilterState['currency']
  
  const [filters, setFilters] = useState<FilterState>({
    scope: defaultFilters?.scope || 'global',
    country: defaultFilters?.country || selectedCountry || 'US',
    period: defaultFilters?.period || '30d',
    currency: defaultFilters?.currency || defaultCurrency,
    ...defaultFilters
  })

  const [showCustomDateRange, setShowCustomDateRange] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update context when country changes - THIS IS CRITICAL FOR LOCALIZATION TO WORK
    if (key === 'country' && setSelectedCountry) {
      // CountryContext's setSelectedCountry normalizes internally, but we need to pass 2-letter codes
      // The select uses uppercase codes like 'US', 'PK', etc. - pass as-is and let context normalize
      setSelectedCountry(value)
      // Changing country will automatically update currency via CountryContext useEffect
    }
    
    onFilterChange?.(newFilters)
  }
  
  // Sync filters with context when country changes externally
  useEffect(() => {
    if (selectedCountry) {
      // Normalize country code for comparison (CountryContext stores lowercase, select uses uppercase)
      const normalized = selectedCountry.toUpperCase()
      const currentNormalized = (filters.country || '').toUpperCase()
      
      if (normalized !== currentNormalized) {
        setFilters(prev => ({ ...prev, country: normalized }))
      }
    }
  }, [selectedCountry, filters.country])
  
  // Sync currency when country data changes - THIS ENSURES CURRENCY UPDATES WHEN COUNTRY CHANGES
  useEffect(() => {
    if (countryData?.currency?.code) {
      const newCurrency = countryData.currency.code as FilterState['currency']
      if (newCurrency && newCurrency !== filters.currency) {
        const updatedFilters = { ...filters, currency: newCurrency }
        setFilters(updatedFilters)
        // Trigger filter change to update parent components
        onFilterChange?.(updatedFilters)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryData?.currency?.code])

  const scopeOptions = [
    { value: 'global', label: 'Global' },
    { value: 'region', label: 'Region' },
    { value: 'country', label: 'Country' },
    { value: 'city', label: 'City' },
    { value: 'district', label: 'District' },
    { value: 'area', label: 'Area' },
    { value: 'location', label: 'Location' }
  ]

  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ]

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'PKR', label: 'PKR (₨)', symbol: '₨' },
    { value: 'AED', label: 'AED (د.إ)', symbol: 'د.إ' },
    { value: 'SAR', label: 'SAR (ر.س)', symbol: 'ر.س' }
  ]

  const countryNameMap: Record<string, string> = {
    'US': 'United States',
    'PK': 'Pakistan',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'FR': 'France',
    'DE': 'Germany',
    'ES': 'Spain',
    'IT': 'Italy',
    'UK': 'United Kingdom',
    'CN': 'China',
    'IN': 'India',
    'OM': 'Oman',
    'NG': 'Nigeria'
  }

  const countryOptions = availableCountries.length > 0 
    ? availableCountries.map((c: string | { code: string; name: string }) => {
        if (typeof c === 'string') {
          return { value: c, label: countryNameMap[c] || c }
        } else {
          return { value: c.code, label: c.name }
        }
      })
    : [
        { value: 'US', label: 'United States' },
        { value: 'FR', label: 'France' },
        { value: 'OM', label: 'Oman' },
        { value: 'NG', label: 'Nigeria' },
        { value: 'PK', label: 'Pakistan' }
      ]

  return (
    <div className={`flex flex-wrap items-center gap-4 rounded-lg border border-[#C3A35E]/30 bg-white p-4 shadow-sm ${className}`}>
      {/* Scope Selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider whitespace-nowrap min-w-[60px]">
          SCOPE:
        </label>
        <select
          value={filters.scope}
          onChange={(e) => handleFilterChange('scope', e.target.value)}
          className="px-3 py-1.5 text-sm border border-[#C3A35E]/30 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent min-w-[120px]"
        >
          {scopeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Country Selector - Always visible for currency/locale changes */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider whitespace-nowrap min-w-[60px]">
            COUNTRY:
          </label>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#C3A35E]/30 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent min-w-[150px]"
          >
            {countryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
      </div>

      {/* Region Selector - Show when scope is region */}
      {filters.scope === 'region' && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider whitespace-nowrap min-w-[60px]">
            REGION:
          </label>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#C3A35E]/30 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent min-w-[150px]"
          >
            <option value="global">Global</option>
            <option value="north-america">North America</option>
            <option value="south-america">South America</option>
            <option value="europe">Europe</option>
            <option value="asia">Asia</option>
            <option value="middle-east">Middle East</option>
            <option value="africa">Africa</option>
            <option value="oceania">Oceania</option>
          </select>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider whitespace-nowrap min-w-[60px]">
          PERIOD:
        </label>
        <select
          value={filters.period}
          onChange={(e) => {
            const period = e.target.value as FilterState['period']
            handleFilterChange('period', period)
            if (period === 'custom') {
              setShowCustomDateRange(true)
            } else {
              setShowCustomDateRange(false)
            }
          }}
          className="px-3 py-1.5 text-sm border border-[#C3A35E]/30 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent min-w-[140px]"
        >
          {periodOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Date Range */}
      {showCustomDateRange && filters.period === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.customStartDate || ''}
            onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#C3A35E]/30 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent"
          />
          <span className="text-sm text-[#6B1F2B]">to</span>
          <input
            type="date"
            value={filters.customEndDate || ''}
            onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#C3A35E]/30 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent"
          />
        </div>
      )}

      {/* Currency Selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider whitespace-nowrap min-w-[70px]">
          CURRENCY:
        </label>
        <select
          value={filters.currency}
          onChange={(e) => handleFilterChange('currency', e.target.value)}
          className="px-3 py-1.5 text-sm border border-[#C3A35E]/30 rounded-md bg-white text-[#6B1F2B] focus:outline-none focus:ring-2 focus:ring-[#C3A35E] focus:border-transparent min-w-[120px]"
        >
          {currencyOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          const resetFilters: FilterState = {
            scope: 'global',
            country: selectedCountry || 'US',
            period: '30d',
            currency: 'USD'
          }
          setFilters(resetFilters)
          setShowCustomDateRange(false)
          onFilterChange?.(resetFilters)
        }}
        className="ml-auto px-3 py-1.5 text-xs font-bold text-[#6B1F2B] border border-[#C3A35E]/30 rounded-md hover:bg-[#F8F9FA] transition-colors whitespace-nowrap"
      >
        Reset
      </button>
    </div>
  )
}


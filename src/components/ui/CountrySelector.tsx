'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'

interface CountryOption {
  code: string
  name: string
  isoCode?: string
}

interface CountrySelectorProps {
  buttonClassName?: string
  menuAlignment?: 'left' | 'right'
  fullWidth?: boolean
  options?: CountryOption[]
}

const fallbackCountries: CountryOption[] = [
  { code: 'united-states', name: 'United States', isoCode: 'US' },
  { code: 'pakistan', name: 'Pakistan', isoCode: 'PK' },
  { code: 'india', name: 'India', isoCode: 'IN' },
  { code: 'united-kingdom', name: 'United Kingdom', isoCode: 'UK' },
  { code: 'uae', name: 'United Arab Emirates', isoCode: 'AE' },
  { code: 'saudi-arabia', name: 'Saudi Arabia', isoCode: 'SA' },
  { code: 'spain', name: 'Spain', isoCode: 'ES' },
  { code: 'canada', name: 'Canada', isoCode: 'CA' },
  { code: 'oman', name: 'Oman', isoCode: 'OM' }
]

const normaliseLabel = (value?: string) => {
  if (!value) return ''
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function CountrySelector({
  buttonClassName = '',
  menuAlignment = 'right',
  fullWidth = false,
  options
}: CountrySelectorProps) {
  const t = useTranslations('common')
  const { selectedCountry, setSelectedCountry, countryData, loading } = useCountry()
  const [countries, setCountries] = useState<CountryOption[]>(options || fallbackCountries)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (options) {
      setCountries(options)
      return
    }

    let mounted = true
    const loadCountries = async () => {
      try {
        setFetching(true)
        const response = await apiClient.getCountriesSummary()
        const payload = response.data as any
        if (payload?.success && Array.isArray(payload.data) && payload.data.length) {
          if (mounted) {
            setCountries(
              payload.data.map((item: any) => ({
                code: item.code,
                name: item.name,
                isoCode: item.isoCode
              }))
            )
            setError(null)
          }
        } else if (response.error && mounted) {
          setError(response.error)
        }
      } catch (err) {
        console.error('Country selector: failed to load countries', err)
        if (mounted) {
          setError('Unable to fetch countries')
        }
      } finally {
        if (mounted) {
          setFetching(false)
        }
      }
    }

    loadCountries()
    return () => {
      mounted = false
    }
  }, [options])

  const activeCountryName = useMemo(() => {
    if (countryData?.countryName) return countryData.countryName
    const byCode = countries.find((c) => c.code === selectedCountry)
    if (byCode) return byCode.name
    return normaliseLabel(selectedCountry)
  }, [countryData?.countryName, countries, selectedCountry])

  const currencyDisplay = countryData?.currency
    ? `${countryData.currency.symbol || ''} ${countryData.currency.code || ''}`.trim()
    : ''

  const buttonStyles = [
    'flex items-center gap-2 px-4 py-2 rounded-md border-2 border-[#C3A35E]/30 text-white font-semibold bg-white hover:border-white hover:text-[#C3A35E] transition-colors',
    fullWidth ? 'w-full justify-between' : '',
    buttonClassName
  ]
    .filter(Boolean)
    .join(' ')

  const menuPosition =
    menuAlignment === 'left' ? 'left-0' : menuAlignment === 'right' ? 'right-0' : 'left-0'

  const handleSelect = (code: string) => {
    setSelectedCountry(code)
    setOpen(false)
  }

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={buttonStyles}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-xl">🌍</span>
        <span className="text-sm sm:text-base truncate">{activeCountryName || t('selectCountry')}</span>
        {currencyDisplay && (
          <span className="text-xs text-white font-semibold hidden md:inline-flex">{currencyDisplay}</span>
        )}
        {(loading || fetching) && (
          <span className="ml-2 h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
      
      {/* Dropdown - Smooth Elegant Slide Down with Proper Colors */}
          <div
        className={`absolute ${menuPosition} mt-2 z-50 bg-white text-black rounded-lg shadow-2xl border-2 border-[#dc2626]/30 w-64 max-h-80 overflow-y-auto transition-all duration-300 ease-out ${
          open 
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' 
            : 'opacity-0 -translate-y-2 pointer-events-none scale-95'
        }`}
            role="listbox"
          >
            {error && (
              <div className="px-4 py-3 text-sm text-[#dc2626] border-b border-[#dc2626]/20 font-semibold">{error}</div>
            )}
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleSelect(country.code)}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#dc2626]/10 hover:text-[#dc2626] transition-all duration-200 ${
                  selectedCountry === country.code ? 'bg-[#dc2626]/20 font-bold text-[#dc2626]' : 'text-black'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{country.name}</span>
                  {country.isoCode && (
                    <span className="text-xs text-black/60 mt-0.5">ISO: {country.isoCode}</span>
                  )}
                </div>
              </button>
            ))}
            {countries.length === 0 && (
              <div className="px-4 py-3 text-sm text-black/60">{t('noCountriesAvailable')}</div>
            )}
          </div>
    </div>
  )
}


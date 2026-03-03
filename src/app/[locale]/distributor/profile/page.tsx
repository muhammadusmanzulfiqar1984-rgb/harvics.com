'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

interface ProfileData {
  id: string
  username: string
  distributorId: string
  territory: string
  geoScope: {
    continent?: string
    region?: string
    country?: string
    city?: string
    district?: string
    area?: string
    location?: string
    territory?: string
  }
  currency: string
  language: string
  createdAt: string
}

export default function DistributorProfile() {
  const locale = useLocale()
  const t = useTranslations('distributorPortal.profile')
  const tCommon = useTranslations('distributorPortal.common')
  const { countryData } = useCountry()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    language: 'en',
    currency: 'USD',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getDistributorProfile()

        if (response.error) {
          setError(response.error)
          return
        }

        interface ProfileResponse {
          data?: {
            data?: unknown
          }
        }
        const responseData = response as ProfileResponse
        if (responseData.data?.data) {
          const data = responseData.data.data
          setProfile(data as typeof profile)
          setFormData({
            name: data.username || '',
            email: '',
            phone: '',
            address: '',
            language: data.language || locale,
            currency: data.currency || 'USD',
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()

    // Get CSRF token
    const storedToken = localStorage.getItem('csrf_token')
    if (storedToken) {
      setCsrfToken(storedToken)
    }
  }, [locale])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail')
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = t('validation.invalidPhone')
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
      setSaving(true)
      setSuccessMessage(null)

      // Store CSRF token if available
      if (csrfToken) {
        localStorage.setItem('csrf_token', csrfToken)
      }

      const response = await apiClient.updateDistributorProfile({
        name: formData.name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        language: formData.language,
        currency: formData.currency,
      })

      if (response.error) {
        setErrors({ submit: response.error })
        return
      }

      setSuccessMessage(t('profileUpdated'))
      
      // Reload profile to get updated data
      const profileResponse = await apiClient.getDistributorProfile()
      const profileResponseTyped = profileResponse as { data?: any; error?: string }
      if (profileResponseTyped?.data) {
        const responseData = profileResponseTyped.data as any
        if (responseData.data) {
          setProfile(responseData.data)
        } else {
          setProfile(responseData)
        }
      }
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1F2B] mx-auto mb-4"></div>
          <p className="text-[#C3A35E]/90">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">{tCommon('error')}</h2>
          <p className="text-[#C3A35E]/90">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#C3A35E] mb-8">{t('title')}</h1>

          {/* Profile Info (Read-only) */}
          {profile && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-[#C3A35E] mb-4">{t('accountInformation')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#C3A35E]/90">{t('distributorId')}</p>
                  <p className="text-lg font-semibold">{profile.distributorId}</p>
                </div>
                <div>
                  <p className="text-sm text-[#C3A35E]/90">{t('territory')}</p>
                  <p className="text-lg font-semibold">{profile.territory}</p>
                </div>
                {profile.geoScope.country && (
                  <div>
                    <p className="text-sm text-[#C3A35E]/90">{t('country') || 'Country'}</p>
                    <p className="text-lg font-semibold">{profile.geoScope.country}</p>
                  </div>
                )}
                {profile.geoScope.city && (
                  <div>
                    <p className="text-sm text-[#C3A35E]/90">{t('city') || 'City'}</p>
                    <p className="text-lg font-semibold">{profile.geoScope.city}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-[#C3A35E]/90">{t('accountCreated')}</p>
                  <p className="text-lg font-semibold">
                    {new Date(profile.createdAt).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Update Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-[#C3A35E] mb-4">{t('updateProfile')}</h2>

            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">{successMessage}</p>
              </div>
            )}

            {errors.submit && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-4 py-2"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-4 py-2"
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                  {t('address')}
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-4 py-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                    {t('language')}
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full border border-black300 rounded-lg px-4 py-2"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C3A35E]/90 mb-2">
                    {t('currency')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full border border-black300 rounded-lg px-4 py-2"
                  >
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="PKR">PKR</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5a0012] transition-colors disabled:opacity-50"
              >
                {saving ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  )
}


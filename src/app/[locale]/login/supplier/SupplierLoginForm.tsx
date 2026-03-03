'use client'

import React, { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function SupplierLoginForm() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('login.supplier')
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Import API client dynamically to avoid SSR issues
      const { apiClient } = await import('@/lib/api')
      
      const response = await apiClient.login(
        formData.username,
        formData.password
      )

      if (response.error) {
        // Fallback to demo credentials if backend is not available
        if ((formData.username === 'admin' && formData.password === 'admin') || 
            (formData.username === 'supplier_user' && formData.password === 'password')) {
          // Store demo token for supplier
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', 'demo-token-supplier')
            localStorage.setItem('user_type', 'supplier')
            localStorage.setItem('user_scope', JSON.stringify({
              userId: formData.username === 'admin' ? 'admin' : 'supplier_user',
              role: 'supplier',
              countries: ['PK'],
              territories: ['PK-SOUTH'],
              supplierId: 'sup_pk_megafoods',
              warehouseIds: ['wh_pk_south', 'wh_pk_karachi'],
              currency: 'PKR',
              distributorId: undefined
            }))
          }
          
          // Redirect to supplier portal
          router.push(`/${locale}/portal/supplier`)
          return
        } else {
          setError(response.error || 'Invalid username or password. Try: admin/admin or supplier_user/password')
        }
      } else if (response.data) {
        // Successful login - save token and redirect
        if (typeof window !== 'undefined') {
          if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token)
          }
          if (response.data.user?.scope) {
            localStorage.setItem('user_scope', JSON.stringify(response.data.user.scope))
          }
          localStorage.setItem('user_type', response.data.user?.scope?.role || 'supplier')
        }
        routeByRole(response.data.user?.scope?.role)
      }
    } catch (err) {
      // Fallback to demo mode for supplier
      if ((formData.username === 'admin' && formData.password === 'admin') || 
          (formData.username === 'supplier_user' && formData.password === 'password')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', 'demo-token-supplier')
          localStorage.setItem('user_type', 'supplier')
          localStorage.setItem('user_scope', JSON.stringify({
            userId: formData.username === 'admin' ? 'admin' : 'supplier_user',
            role: 'supplier',
            countries: ['PK'],
            territories: ['PK-SOUTH'],
            supplierId: 'sup_pk_megafoods',
            warehouseIds: ['wh_pk_south', 'wh_pk_karachi'],
            currency: 'PKR',
            distributorId: undefined
          }))
        }
        router.push(`/${locale}/portal/supplier`)
      } else {
        setError('Connection error. Please try again or use: admin/admin or supplier_user/password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const routeByRole = (role?: string) => {
    if (role === 'supplier') {
      router.push(`/${locale}/portal/supplier`)
      return
    }
    if (role === 'distributor' || role === 'sales_officer') {
      router.push(`/${locale}/portal/distributor`)
      return
    }
    // Default fallback
    router.push(`/${locale}/portal/supplier`)
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-[#C3A35E]/30 p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-black text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-black mb-2">
            Username *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-[#C3A35E]/30 rounded-xl focus:ring-2 focus:ring-black focus:border-white bg-white text-black placeholder-[#6B1F2B]/60 transition-all duration-300"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-[#C3A35E]/30 rounded-xl focus:ring-2 focus:ring-black focus:border-white bg-white text-black placeholder-[#6B1F2B]/60 transition-all duration-300"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#6B1F2B] bg-white border-[#C3A35E]/30 rounded focus:ring-[#6B1F2B] focus:ring-2"
            />
            <span className="ml-2 text-sm text-black">Remember me</span>
          </label>
          <a href="#" className="text-sm text-[#6B1F2B] hover:text-[#C3A35E] transition-colors duration-300">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-50 text-[#6B1F2B] font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border-2 border-[#C3A35E]/30 hover:border-[#C3A35E]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#6B1F2B]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{t('form.loggingIn')}</span>
            </>
          ) : (
            <span>{t('form.loginButton')}</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-black/80">
          {t('form.noAccount')}{' '}
          <a href="#" className="text-[#6B1F2B] hover:text-[#C3A35E] font-medium transition-colors duration-300">
            {t('form.contactUs')}
          </a>
        </p>
      </div>
    </div>
  )
}







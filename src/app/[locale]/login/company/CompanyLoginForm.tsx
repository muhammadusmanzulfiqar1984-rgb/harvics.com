'use client'

import React, { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function CompanyLoginForm() {
  const locale = useLocale()
  const router = useRouter()
  const tContact = useTranslations('contact')
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
      const { apiClient } = await import('@/lib/api')
      
      const response = await apiClient.login(
        formData.username,
        formData.password
      )

      if (response.error) {
        setError(response.error || 'Invalid username or password')
      } else if (response.data) {
        routeByRole(response.data.user?.scope?.role)
      }
    } catch (err) {
      // Fallback to demo mode
      setError('Connection error. Please try again.')
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
    if (role === 'hq' || role === 'country_manager') {
      router.push(`/${locale}/dashboard/company/`)
      return
    }
    if (role === 'supplier') {
      router.push(`/${locale}/portal/supplier`)
      return
    }
    if (role === 'distributor' || role === 'sales_officer') {
      router.push(`/${locale}/portal/distributor`)
      return
    }
    router.push(`/${locale}/portals/`)
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-[#C3A35E]/30 p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200">
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
            className="w-full px-4 py-3 border border-[#C3A35E]/30 focus:ring-2 focus:ring-black focus:border-white bg-white text-black placeholder-[#6B1F2B]/60 transition-all duration-300"
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
            className="w-full px-4 py-3 border border-[#C3A35E]/30 focus:ring-2 focus:ring-black focus:border-white bg-white text-black placeholder-[#6B1F2B]/60 transition-all duration-300"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-white bg-white border-[#C3A35E]/30 rounded focus:ring-black focus:ring-2"
            />
            <span className="ml-2 text-sm text-black">Remember me</span>
          </label>
          <a href="#" className="text-sm text-white hover:text-[#C3A35E]/90 transition-colors duration-300">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white hover:bg-white text-white font-bold py-3 px-4 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border-2 border-[#C3A35E]/30 hover:border-white"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Logging in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-black">
          Don't have an account?{' '}
          <a href="#" className="text-white hover:text-[#C3A35E]/90 font-medium transition-colors duration-300">
            {tContact('title')}
          </a>
        </p>
      </div>
    </div>
  )
}


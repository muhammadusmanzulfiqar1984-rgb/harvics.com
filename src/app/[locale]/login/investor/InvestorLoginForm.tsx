'use client'

import React, { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

export default function InvestorLoginForm() {
  const t = useTranslations('investor')
  const locale = useLocale()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      // In a real app, you would handle authentication here
      alert('Login functionality would be implemented here')
    }, 2000)
  }

  return (
    <div className="bg-gradient-to-br from-white800/40 to-white900/60 backdrop-blur-sm rounded-3xl border-2 border-[#C3A35E]/20 p-8 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-white font-semibold mb-2">
            {t('login.email')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-gray-700/50 border-2 border-black600/50 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-all duration-300"
            placeholder={t('login.emailPlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-white font-semibold mb-2">
            {t('login.password')} *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-gray-700/50 border-2 border-black600/50 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-all duration-300"
            placeholder={t('login.passwordPlaceholder')}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-white bg-gray-700 border-black600 rounded focus:ring-white focus:ring-2"
            />
            <span className="ml-2 text-gray-300">{t('login.rememberMe')}</span>
          </label>
          <a href="#" className="text-white hover:text-yellow-300 transition-colors">
            {t('login.forgotPassword')}
          </a>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-white to-white text-black text-lg px-8 py-4 font-bold hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span>{t('login.loggingIn')}</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>{t('login.loginButton')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-300 mb-4">
          {t('login.noAccount')}
        </p>
        <Link 
          href={`/${locale}/investor-relations`}
          className="text-white hover:text-yellow-300 transition-colors font-semibold"
        >
          {t('login.contactUs')}
        </Link>
      </div>
    </div>
  )
}

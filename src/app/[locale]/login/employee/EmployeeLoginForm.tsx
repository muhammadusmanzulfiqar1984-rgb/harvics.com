'use client'

import React, { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function EmployeeLoginForm() {
  const t = useTranslations('employeeLogin')
  const locale = useLocale()
  const router = useRouter()
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

    // Simulate login process
    setTimeout(() => {
      if (formData.username === 'admin' && formData.password === 'admin') {
        // Redirect to employee dashboard
        router.push(`/${locale}/dashboard/employee`)
      } else {
        setError('Invalid username or password. Use admin/admin for demo.')
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-purple-200/50 dark:border-purple-800/50 p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-harvics-red dark:text-harvics-red text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
            {t('form.username')} *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-black300 dark:border-black600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
            placeholder={t('form.usernamePlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-black dark:text-gray-300 mb-2">
            {t('form.password')} *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-black300 dark:border-black600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
            placeholder={t('form.passwordPlaceholder')}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-purple-600 bg-white border-black300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-black600"
            />
            <span className="ml-2 text-sm text-black dark:text-gray-300">{t('form.rememberMe')}</span>
          </label>
          <a href="#" className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-300">
            {t('form.forgotPassword')}
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
        <p className="text-sm text-black dark:text-black">
          {t('form.noAccount')}{' '}
          <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-300">
            {t('form.contactUs')}
          </a>
        </p>
      </div>

      {/* Demo Credentials */}
      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mb-1">Demo Credentials:</p>
        <p className="text-xs text-purple-600 dark:text-purple-400">Username: admin | Password: admin</p>
      </div>
    </div>
  )
}







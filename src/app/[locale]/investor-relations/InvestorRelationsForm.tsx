'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function InvestorRelationsForm() {
  const t = useTranslations('investor')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    investmentType: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        investmentType: ''
      })
    }, 2000)
  }

  const investmentTypes = [
    { value: 'equity', label: t('form.investmentTypes.equity') },
    { value: 'debt', label: t('form.investmentTypes.debt') },
    { value: 'partnership', label: t('form.investmentTypes.partnership') },
    { value: 'acquisition', label: t('form.investmentTypes.acquisition') },
    { value: 'other', label: t('form.investmentTypes.other') }
  ]

  return (
    <div className="bg-gradient-to-br from-white800/40 to-white900/60 backdrop-blur-sm border-2 border-[#C3A35E]/20 p-8 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-white font-semibold mb-2">
              {t('form.name')} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-700/50 border-2 border-black600/50 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-all duration-300"
              placeholder={t('form.namePlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-white font-semibold mb-2">
              {t('form.email')} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-700/50 border-2 border-black600/50 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-all duration-300"
              placeholder={t('form.emailPlaceholder')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="company" className="block text-white font-semibold mb-2">
              {t('form.company')}
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700/50 border-2 border-black600/50 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-all duration-300"
              placeholder={t('form.companyPlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-white font-semibold mb-2">
              {t('form.phone')}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700/50 border-2 border-black600/50 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-all duration-300"
              placeholder={t('form.phonePlaceholder')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="investmentType" className="block text-white font-semibold mb-2">
            {t('form.investmentType')} *
          </label>
          <select
            id="investmentType"
            name="investmentType"
            value={formData.investmentType}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-gray-700/50 border-2 border-black600/50 text-white focus:border-white focus:outline-none transition-all duration-300"
          >
            <option value="">{t('form.selectInvestmentType')}</option>
            {investmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-white font-semibold mb-2">
            {t('form.message')} *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={5}
            className="w-full px-4 py-3 bg-gray-700/50 border-2 border-black600/50 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-all duration-300 resize-none"
            placeholder={t('form.messagePlaceholder')}
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-white to-white text-black text-lg px-12 py-4 font-bold hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 mx-auto"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span>{t('form.submitting')}</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>{t('form.submit')}</span>
              </>
            )}
          </button>
        </div>

        {submitStatus === 'success' && (
          <div className="text-center p-4 bg-green-500/20 border border-green-500/50">
            <p className="text-green-400 font-semibold">
              {t('form.successMessage')}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

const NestleNewsSection: React.FC = () => {
  const t = useTranslations('footer')
  const locale = useLocale()

  return (
    <section style={{ background: '#ffffff', borderTop: '1px solid rgba(195,163,94,0.3)' }} className="py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="text-center md:text-left">
            <h3 className="text-base font-bold mb-1" style={{ color: '#6B1F2B' }}>
              {t('harvicsNews')}
            </h3>
            <p className="mb-2 text-xs" style={{ color: '#6B1F2B', opacity: 0.7 }}>
              {t('subscribeToAlerts') || 'Subscribe to receive alerts and updates'}
            </p>
            <Link
              href={`/${locale}/newsletter`}
              className="inline-block px-4 py-1.5 text-xs font-semibold transition-opacity duration-200 hover:opacity-80"
              style={{ background: '#6B1F2B', color: '#F5F1E8', letterSpacing: '0.08em' }}
            >
              {t('signUp') || 'Sign Up'}
            </Link>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-base font-bold mb-1" style={{ color: '#6B1F2B' }}>
              {t('complianceConcerns') || 'Compliance Concerns'}
            </h3>
            <p className="mb-2 text-xs" style={{ color: '#6B1F2B', opacity: 0.7 }}>
              {t('speakUp') || 'Speak up if you have concerns about compliance or ethics'}
            </p>
            <Link
              href={`/${locale}/compliance`}
              className="inline-block px-4 py-1.5 text-xs font-semibold transition-opacity duration-200 hover:opacity-80"
              style={{ background: '#6B1F2B', color: '#F5F1E8', letterSpacing: '0.08em' }}
            >
              {t('speakUpButton') || 'Speak Up'}
            </Link>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-base font-bold mb-1" style={{ color: '#6B1F2B' }}>
              {t('contactUs') || 'Contact Us'}
            </h3>
            <p className="mb-2 text-xs" style={{ color: '#6B1F2B', opacity: 0.7 }}>
              {t('contactDescription') || 'Get in touch with our team'}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block px-4 py-1.5 text-xs font-semibold transition-opacity duration-200 hover:opacity-80"
              style={{ border: '1px solid #6B1F2B', color: '#6B1F2B', background: 'transparent', letterSpacing: '0.08em' }}
            >
              {t('contactUsButton') || 'Contact Us'}
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default NestleNewsSection


'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'

const ContactSection: React.FC = () => {
  const t = useTranslations('contact')
  const locale = useLocale()
  const [isVisible, setIsVisible] = useState(false)

  const getText = (key: string, fallback: string) => {
    try { return t(key) || fallback } catch { return fallback }
  }

  useEffect(() => { setIsVisible(true) }, [])

  const cards = [
    {
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      title: getText('phone', 'Phone'),
      detail: '+44 7405 527427',
      cta: getText('callNow', 'Call Now'),
      href: 'tel:+447405527427',
    },
    {
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      title: getText('email', 'Email'),
      detail: 'sales.uk@harvics.com',
      cta: getText('sendEmail', 'Send Email'),
      href: 'mailto:sales.uk@harvics.com',
    },
    {
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      title: getText('whatsapp', 'WhatsApp'),
      detail: '+44 7405 527427',
      cta: getText('messageUs', 'Message Us'),
      href: 'https://wa.me/447405527427',
    },
  ]

  return (
    <section className="py-16 sm:py-20" style={{ background: '#F5F1E8' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: '#C3A35E', letterSpacing: '0.2em' }}>
            Get in Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif mb-4" style={{ color: '#6B1F2B' }}>
            {getText('title', 'Contact Us')}
          </h2>
          <div className="w-16 mx-auto" style={{ height: '1px', background: '#C3A35E', opacity: 0.5 }} />
          <p className="max-w-2xl mx-auto mt-4 text-sm" style={{ color: '#6B1F2B', opacity: 0.6 }}>
            {getText('subtitle', "We'd love to hear from you. Reach out to us through any of these channels.")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card.title} className="text-center p-8 transition-opacity duration-200 hover:opacity-80" style={{ border: '1px solid rgba(195,163,94,0.3)', background: 'white' }}>
              <div className="w-10 h-10 mx-auto mb-5 flex items-center justify-center" style={{ opacity: 0.6 }}>
                <svg className="w-5 h-5" fill="none" stroke="#6B1F2B" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-serif mb-1" style={{ color: '#6B1F2B' }}>{card.title}</h3>
              <p className="text-sm mb-5" style={{ color: '#6B1F2B', opacity: 0.5 }}>{card.detail}</p>
              <a
                href={card.href}
                target={card.href.startsWith('http') ? '_blank' : undefined}
                rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-xs uppercase tracking-widest font-bold transition-opacity duration-200 hover:opacity-70"
                style={{ color: '#C3A35E', letterSpacing: '0.1em', textDecoration: 'none', borderBottom: '1px solid rgba(195,163,94,0.4)', paddingBottom: '2px' }}
              >
                {card.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ContactSection

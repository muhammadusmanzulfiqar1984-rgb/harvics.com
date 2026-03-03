'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import NestleNewsSection from './NestleNewsSection'

const Footer: React.FC = () => {
  const t = useTranslations('footer')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setSubmitMessage(t('invalidEmail') || 'Please enter a valid email address')
      return
    }
    setIsSubmitting(true)
    setSubmitMessage('')
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitMessage(t('subscriptionSuccess') || 'Thank you for subscribing!')
      setEmail('')
    } catch {
      setSubmitMessage(t('subscriptionError') || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitMessage(''), 5000)
    }
  }

  const socialLinks = [
    { href: 'https://x.com/HarvicsGlobal', label: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    { href: 'https://www.facebook.com/harvics', label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { href: 'https://www.instagram.com/harvicsfoods/', label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { href: 'https://www.linkedin.com/company/harvics', label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { href: 'https://www.youtube.com/@HarvicsFoods', label: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  ]

  const bottomLinks = [
    { href: `/${locale}/rss`, label: 'RSS' },
    { href: `/${locale}/newsletter`, label: t('signUp') || 'Sign up' },
    { href: `/${locale}/sitemap`, label: t('siteMap') || 'Site map' },
    { href: `/${locale}/help`, label: t('help') || 'Help' },
    { href: `/${locale}/contact`, label: t('contactUs') || 'Contact us' },
    { href: `/${locale}/privacy`, label: t('privacy') || 'Privacy' },
    { href: `/${locale}/terms`, label: t('termsOfUse') || 'Terms of use' },
    { href: `/${locale}/accessibility`, label: t('accessibility') || 'Accessibility' },
  ]

  return (
    <>
      <NestleNewsSection />

      {/* Main Footer — Ivory background, Apple-clean */}
      <footer style={{ background: '#F5F1E8', borderTop: '1px solid rgba(195,163,94,0.3)' }}>

        {/* Brand + Links Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10">

            {/* Brand */}
            <div className="lg:col-span-4">
              <Link href={`/${locale}`} className="inline-block mb-4">
                <h2 className="text-3xl tracking-wide" style={{ color: '#6B1F2B', fontWeight: 300 }}>
                  {t('companyName') || 'Harvics'}
                </h2>
              </Link>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#6B1F2B', opacity: 0.6, lineHeight: '1.7' }}>
                {t('brandStatement') || 'A leading global consumer goods company delivering premium food products across diverse categories with international quality standards.'}
              </p>
              <div className="w-14 h-14 opacity-50">
                <img src="/Images/logo.png" alt="Harvics Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Links */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
              <div>
                <h3 className="mb-5 uppercase text-xs tracking-widest font-semibold" style={{ color: '#6B1F2B' }}>
                  {t('usefulLinks') || 'USEFUL LINKS'}
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: `/${locale}/faq`, label: t('askHarvics') || 'Ask Harvics' },
                    { href: `/${locale}/contact`, label: t('contactUs') || 'Contact us' },
                    { href: `/${locale}/careers`, label: t('searchForJobs') || 'Search for jobs' },
                    { href: `/${locale}/newsletter`, label: t('signUpForNews') || 'Sign up for news' },
                    { href: `/${locale}/compliance`, label: t('speakUp') || 'Speak Up' },
                  ].map(link => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm transition-opacity duration-200 hover:opacity-100" style={{ color: '#6B1F2B', opacity: 0.6, textDecoration: 'none' }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-5 uppercase text-xs tracking-widest font-semibold" style={{ color: '#6B1F2B' }}>
                  {t('company') || 'COMPANY'}
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: `/${locale}/about`, label: t('aboutUs') || 'About us' },
                    { href: `/${locale}/locations`, label: t('globalAddresses') || 'Global addresses' },
                    { href: `/${locale}/strategy`, label: t('strategy') || 'Strategy' },
                    { href: `/${locale}/leadership`, label: t('ourLeadership') || 'Our leadership' },
                    { href: `/${locale}/products`, label: t('brandsAZ') || 'Brands A - Z' },
                    { href: `/${locale}/history`, label: t('ourHistory') || 'Our history' },
                    { href: `/${locale}/csr`, label: t('sustainability') || 'Sustainability' },
                  ].map(link => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm transition-opacity duration-200 hover:opacity-100" style={{ color: '#6B1F2B', opacity: 0.6, textDecoration: 'none' }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-5 uppercase text-xs tracking-widest font-semibold" style={{ color: '#6B1F2B' }}>
                  {t('media') || 'MEDIA'}
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: `/${locale}/media/news`, label: t('news') || 'News' },
                    { href: `/${locale}/media/contacts`, label: t('mediaContacts') || 'Media contacts' },
                    { href: `/${locale}/media/images`, label: t('images') || 'Images' },
                  ].map(link => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm transition-opacity duration-200 hover:opacity-100" style={{ color: '#6B1F2B', opacity: 0.6, textDecoration: 'none' }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-5 uppercase text-xs tracking-widest font-semibold" style={{ color: '#6B1F2B' }}>
                  {t('investors') || 'INVESTORS'}
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: `/${locale}/investors/governance`, label: t('corporateGovernance') || 'Corporate governance' },
                    { href: `/${locale}/investors/shares`, label: t('sharesAdrsBonds') || 'Shares, ADRs, & Bonds' },
                    { href: `/${locale}/investors/publications`, label: t('publications') || 'Publications' },
                  ].map(link => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm transition-opacity duration-200 hover:opacity-100" style={{ color: '#6B1F2B', opacity: 0.6, textDecoration: 'none' }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Social Icons — maroon icons on ivory */}
          <div className="flex items-center justify-center gap-4 py-6" style={{ borderTop: '1px solid rgba(195,163,94,0.2)' }}>
            {socialLinks.map(social => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center transition-opacity duration-200 hover:opacity-100"
                style={{ opacity: 0.5 }}
                aria-label={social.label}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#6B1F2B" d={social.path} />
                </svg>
              </a>
            ))}
          </div>

          {/* Newsletter — inline, clean */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6" style={{ borderTop: '1px solid rgba(195,163,94,0.2)' }}>
            <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 w-full max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('enterEmailPlaceholder') || 'Enter your email'}
                className="flex-1 px-4 py-2 text-sm focus:outline-none"
                style={{ background: 'white', border: '1px solid rgba(195,163,94,0.3)', color: '#6B1F2B' }}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-semibold transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
                style={{ background: '#6B1F2B', color: '#F5F1E8' }}
              >
                {isSubmitting ? '...' : (t('subscribe') || 'Subscribe')}
              </button>
            </form>
            {submitMessage && (
              <p className="text-sm mt-1" style={{ color: submitMessage.includes('Thank') ? '#6B1F2B' : '#dc2626' }}>
                {submitMessage}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar — thin maroon strip, only place maroon is used as bg */}
        <div style={{ background: '#6B1F2B', padding: '12px 0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs" style={{ color: 'rgba(245,241,232,0.7)' }}>
              <span>&copy; {new Date().getFullYear()} {t('companyName') || 'Harvics'}</span>
              {bottomLinks.map((link, i) => (
                <React.Fragment key={link.href}>
                  <span style={{ opacity: 0.3 }}>|</span>
                  <Link href={link.href} className="transition-opacity duration-200 hover:opacity-100" style={{ color: 'rgba(245,241,232,0.7)', textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer

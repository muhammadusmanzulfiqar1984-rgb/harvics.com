'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'

/**
 * HARVICS Footer — F1 F2 F3 F4 system (mirrors header T1 T2 T3)
 * F1 — Newsletter on cream
 * F2 — Sitemap on burgundy (brand zone)
 * F3 — Certifications on darker burgundy
 * F4 — Legal on black
 */
const Footer: React.FC = () => {
  const t = useTranslations('footer')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  // Defensive translator: next-intl returns the key path (e.g. "footer.foo")
  // for missing keys, which is truthy and defeats `t() || fallback`.
  const tt = (key: string, fallback: string) => {
    try {
      const v = t(key)
      if (!v || v === key || v.endsWith(`.${key}`)) return fallback
      return v
    } catch { return fallback }
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setSubmitMessage(tt('invalidEmail', 'Please enter a valid email address'))
      return
    }
    setIsSubmitting(true)
    setSubmitMessage('')
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitMessage(tt('subscriptionSuccess', 'Thank you for subscribing!'))
      setEmail('')
    } catch {
      setSubmitMessage(tt('subscriptionError', 'Something went wrong. Please try again.'))
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitMessage(''), 5000)
    }
  }

  const socialLinks = [
    { href: 'https://x.com/HarvicsGlobal', label: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    { href: 'https://www.facebook.com/harvics', label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { href: 'https://www.instagram.com/harvicsfoods/', label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z' },
    { href: 'https://www.linkedin.com/company/harvics', label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z' },
    { href: 'https://www.youtube.com/@HarvicsFoods', label: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  ]

  const usefulLinks = [
    { href: `/${locale}/faq`, label: tt('askHarvics', 'Ask Harvics') },
    { href: `/${locale}/contact`, label: tt('contactUs', 'Contact us') },
    { href: `/${locale}/careers`, label: tt('searchForJobs', 'Search for jobs') },
    { href: `/${locale}/newsletter`, label: tt('signUpForNews', 'Sign up for news') },
    { href: `/${locale}/compliance`, label: tt('speakUp', 'Speak Up') },
  ]

  const companyLinks = [
    { href: `/${locale}/about`, label: tt('aboutUs', 'About us') },
    { href: `/${locale}/locations`, label: tt('globalAddresses', 'Global addresses') },
    { href: `/${locale}/strategy`, label: tt('strategy', 'Strategy') },
    { href: `/${locale}/leadership`, label: tt('ourLeadership', 'Our leadership') },
    { href: `/${locale}/products`, label: tt('brandsAZ', 'Brands A–Z') },
    { href: `/${locale}/history`, label: tt('ourHistory', 'Our history') },
    { href: `/${locale}/csr`, label: tt('sustainability', 'Sustainability') },
  ]

  const mediaLinks = [
    { href: `/${locale}/media/news`, label: tt('news', 'News') },
    { href: `/${locale}/media/contacts`, label: tt('mediaContacts', 'Media contacts') },
    { href: `/${locale}/media/images`, label: tt('images', 'Images') },
  ]

  const investorLinks = [
    { href: `/${locale}/investors/governance`, label: tt('corporateGovernance', 'Corporate governance') },
    { href: `/${locale}/investors/shares`, label: tt('sharesAdrsBonds', 'Shares, ADRs & Bonds') },
    { href: `/${locale}/investors/publications`, label: tt('publications', 'Publications') },
  ]

  const legalLinks = [
    { href: `/${locale}/privacy`, label: tt('privacy', 'Privacy') },
    { href: `/${locale}/terms`, label: tt('termsOfUse', 'Terms') },
    { href: `/${locale}/sitemap`, label: tt('siteMap', 'Sitemap') },
    { href: `/${locale}/accessibility`, label: tt('accessibility', 'Accessibility') },
  ]

  const certifications = ['ISO 22000', 'HACCP', 'BRC', 'HALAL', 'SEDEX', 'BSCI', 'OEKO-TEX', 'LBMA']

  return (
    <footer className="w-full">

      {/* ============ F1 — NEWSLETTER ON CREAM ============ */}
      <section style={{ background: '#F5F0E8', padding: '36px 0 32px', borderTop: '1px solid rgba(201,168,76,0.25)' }}>
        <div className="universal-layout-frame px-4 sm:px-6 lg:px-8 text-center">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ height: '1px', width: '32px', background: '#C3A35E' }} />
            <span style={{ color: '#C3A35E', fontSize: '10px', fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase' }}>The Harvics Brief</span>
            <div style={{ height: '1px', width: '32px', background: '#C3A35E' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 200, letterSpacing: '-0.02em', color: '#1A0505', lineHeight: 1.15, marginBottom: '8px' }}>
            {tt('newsletterHeadline', 'Monthly intelligence.')}{' '}
            <span style={{ color: '#1A0505', fontWeight: 400 }}>{tt('newsletterHeadline2', 'For serious buyers.')}</span>
          </h2>
          <p style={{ color: 'rgba(26,5,5,0.55)', fontSize: '12px', marginBottom: '18px' }}>
            {tt('newsletterTagline', 'Market alerts · sourcing insights · new factory verifications. One email a month. No spam.')}
          </p>
          <form onSubmit={handleNewsletterSubmit} style={{ display: 'inline-flex', gap: 0, maxWidth: '520px', width: '100%' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tt('enterEmailPlaceholder', 'you@company.com')}
              required
              style={{ flex: 1, padding: '11px 16px', border: '1px solid rgba(26,5,5,0.18)', borderRight: 'none', background: '#fff', fontSize: '12px', color: '#1A0505', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: '11px 26px', background: '#1A0505', color: '#C3A35E', border: '1px solid #1A0505', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              {isSubmitting ? '...' : (tt('subscribe', 'Subscribe'))}
            </button>
          </form>
          {submitMessage && (
            <p style={{ marginTop: '12px', fontSize: '11px', color: submitMessage.includes('Thank') ? '#C3A35E' : '#a32a2a' }}>
              {submitMessage}
            </p>
          )}
        </div>
      </section>

      {/* ============ F2 — SITEMAP ON BURGUNDY ============ */}
      <section style={{ background: '#1A0505', color: 'rgba(245,240,232,0.85)', padding: '48px 0 40px', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="universal-layout-frame px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) repeat(4, minmax(0, 1fr))' }}>

            {/* Brand column */}
            <div className="col-span-2 lg:col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <Image src="/logo.svg" alt="Harvics" width={44} height={44} style={{ width: '44px', height: 'auto', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: '#fff', letterSpacing: '0.06em' }}>HARVICS</div>
                  <div style={{ fontSize: '9px', color: '#C3A35E', letterSpacing: '0.28em', textTransform: 'uppercase' }}>Global Ventures</div>
                </div>
              </Link>
              <p style={{ fontSize: '12px', color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, maxWidth: '300px' }}>
                {tt('brandStatement', 'Sovereign trade infrastructure across 10 industry verticals, 42 markets and 3 continents — built for serious buyers.')}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', border: '1px solid rgba(201,168,76,0.3)', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C3A35E', fontWeight: 600, width: 'fit-content' }}>
                <span style={{ width: '6px', height: '6px', background: '#C3A35E', borderRadius: '50%', animation: 'harvicsPulse 2s infinite' }} />
                1,247 {tt('activeShipments', 'active shipments')}
              </div>
            </div>

            {/* Useful Links */}
            <div>
              <h5 style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#C3A35E', marginBottom: '18px', fontWeight: 600, paddingBottom: '8px', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                {tt('usefulLinks', 'Useful Links')}
              </h5>
              {usefulLinks.map(link => (
                <Link key={link.href} href={link.href} style={{ display: 'block', fontSize: '12.5px', color: 'rgba(245,240,232,0.7)', padding: '6px 0', lineHeight: 1.4, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C3A35E' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.7)' }}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Company */}
            <div>
              <h5 style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#C3A35E', marginBottom: '18px', fontWeight: 600, paddingBottom: '8px', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                {tt('company', 'Company')}
              </h5>
              {companyLinks.map(link => (
                <Link key={link.href} href={link.href} style={{ display: 'block', fontSize: '12.5px', color: 'rgba(245,240,232,0.7)', padding: '6px 0', lineHeight: 1.4, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C3A35E' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.7)' }}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Media */}
            <div>
              <h5 style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#C3A35E', marginBottom: '18px', fontWeight: 600, paddingBottom: '8px', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                {tt('media', 'Media')}
              </h5>
              {mediaLinks.map(link => (
                <Link key={link.href} href={link.href} style={{ display: 'block', fontSize: '12.5px', color: 'rgba(245,240,232,0.7)', padding: '6px 0', lineHeight: 1.4, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C3A35E' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.7)' }}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Investors */}
            <div>
              <h5 style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#C3A35E', marginBottom: '18px', fontWeight: 600, paddingBottom: '8px', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                {tt('investors', 'Investors')}
              </h5>
              {investorLinks.map(link => (
                <Link key={link.href} href={link.href} style={{ display: 'block', fontSize: '12.5px', color: 'rgba(245,240,232,0.7)', padding: '6px 0', lineHeight: 1.4, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C3A35E' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.7)' }}>
                  {link.label}
                </Link>
              ))}
            </div>

          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes harvicsPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        ` }} />
      </section>

      {/* ============ F3 — CERTIFICATIONS ON DARKER BURGUNDY ============ */}
      <section style={{ background: '#0d0303', padding: '18px 0', borderTop: '1px solid rgba(201,168,76,0.18)' }}>
        <div className="universal-layout-frame px-4 sm:px-6 lg:px-8" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#C3A35E', fontWeight: 700, paddingRight: '24px', borderRight: '1px solid rgba(201,168,76,0.2)' }}>
            {tt('certifiedAudited', 'Certified & Audited')}
          </span>
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            {certifications.map((cert, i) => (
              <span key={cert} style={{ fontSize: '10px', letterSpacing: '0.22em', color: 'rgba(245,240,232,0.95)', fontWeight: 700, padding: '0 18px', borderRight: i < certifications.length - 1 ? '1px solid rgba(201,168,76,0.15)' : 'none' }}>
                {cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ F4 — LEGAL ON BLACK ============ */}
      <section style={{ background: '#000', padding: '16px 0' }}>
        <div className="universal-layout-frame px-4 sm:px-6 lg:px-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '10.5px', color: 'rgba(245,240,232,0.45)' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>&copy; {new Date().getFullYear()} {tt('companyName', 'Harvics Global Ventures')}</span>
            {legalLinks.map(link => (
              <Link key={link.href} href={link.href} style={{ color: 'rgba(245,240,232,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C3A35E' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.45)' }}>
                {link.label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(245,240,232,0.6)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C3A35E" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
              </svg>
              <span style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, color: '#C3A35E', fontSize: '10px' }}>Global</span>
              <span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span>
              <span>English (UK)</span>
            </span>
            <div style={{ display: 'flex', gap: '14px' }}>
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{ color: 'rgba(245,240,232,0.55)', display: 'inline-flex', alignItems: 'center', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C3A35E' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.55)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

    </footer>
  )
}

export default Footer

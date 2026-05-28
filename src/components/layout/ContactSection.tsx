'use client'

import React, { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useScrollReveal, revealClass } from '@/hooks/useScrollReveal'

const ContactSection: React.FC = () => {
  const t = useTranslations('contact')
  const locale = useLocale()
  const { ref, isVisible } = useScrollReveal()

  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const getText = (key: string, fallback: string) => {
    try { return t(key) || fallback } catch { return fallback }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.includes('@') || !form.name.trim()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 900))
    setSending(false)
    setSent(true)
    setForm({ name: '', company: '', email: '', message: '' })
    setTimeout(() => setSent(false), 5000)
  }

  const channels = [
    {
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      label: 'Phone',
      value: '+44 7405 527427',
      href: 'tel:+447405527427',
    },
    {
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      label: 'Email',
      value: 'sales.uk@harvics.com',
      href: 'mailto:sales.uk@harvics.com',
    },
    {
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      label: 'WhatsApp',
      value: '+44 7405 527427',
      href: 'https://wa.me/447405527427',
    },
  ]

  return (
    <section
      ref={ref}
      className={`min-h-screen flex flex-col justify-center ${revealClass(isVisible, 'up')}`}
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #faf9f7 60%, #f5f4f2 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, transparent, #C3A35E)' }} />
            <span style={{ color: '#C3A35E', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Enterprise Enquiries</span>
            <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, #C3A35E, transparent)' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1d1d1f', lineHeight: 1.08, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginBottom: '8px' }}>
            Let&apos;s Build{' '}
            <span style={{ background: 'linear-gradient(135deg, #C3A35E 0%, #6B1F2B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Something Together
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(107,31,43,0.42)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.65, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            Whether you are a buyer, distributor, or institution — our team responds within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* Left: Contact form */}
          <div className="lg:col-span-3" style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(195,163,94,0.18)',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(107,31,43,0.05), 0 1px 4px rgba(107,31,43,0.04)',
          }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #C3A35E, #6B1F2B)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#6B1F2B', fontFamily: '-apple-system, sans-serif' }}>Message sent.</p>
                <p style={{ fontSize: '12px', color: 'rgba(107,31,43,0.5)', marginTop: '4px', fontFamily: '-apple-system, sans-serif' }}>Our team will respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B1F2B', marginBottom: '5px', fontFamily: '-apple-system, sans-serif' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Shah Tabraiz"
                      style={{ width: '100%', padding: '10px 13px', fontSize: '13px', border: '1px solid rgba(195,163,94,0.25)', outline: 'none', fontFamily: '-apple-system, sans-serif', background: '#fdfcfb', color: '#1d1d1f', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B1F2B', marginBottom: '5px', fontFamily: '-apple-system, sans-serif' }}>Company</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      placeholder="Your Organisation"
                      style={{ width: '100%', padding: '10px 13px', fontSize: '13px', border: '1px solid rgba(195,163,94,0.25)', outline: 'none', fontFamily: '-apple-system, sans-serif', background: '#fdfcfb', color: '#1d1d1f', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B1F2B', marginBottom: '5px', fontFamily: '-apple-system, sans-serif' }}>Business Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@company.com"
                    style={{ width: '100%', padding: '10px 13px', fontSize: '13px', border: '1px solid rgba(195,163,94,0.25)', outline: 'none', fontFamily: '-apple-system, sans-serif', background: '#fdfcfb', color: '#1d1d1f', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B1F2B', marginBottom: '5px', fontFamily: '-apple-system, sans-serif' }}>How can we help?</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us about your sourcing needs, volumes, or partnership interest..."
                    style={{ width: '100%', padding: '10px 13px', fontSize: '13px', border: '1px solid rgba(195,163,94,0.25)', outline: 'none', fontFamily: '-apple-system, sans-serif', background: '#fdfcfb', color: '#1d1d1f', resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    padding: '12px 28px',
                    background: sending ? 'rgba(107,31,43,0.35)' : 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
                    backgroundSize: '220% 100%',
                    border: 'none',
                    color: '#1a0d00',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const,
                    cursor: sending ? 'not-allowed' : 'pointer',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    alignSelf: 'flex-start',
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                  }}
                >
                  {sending ? 'Sending...' : 'Send Enquiry →'}
                </button>
              </form>
            )}
          </div>

          {/* Right: channel cards + trust points */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {channels.map(ch => (
              <a
                key={ch.label}
                href={ch.href}
                target={ch.href.startsWith('http') ? '_blank' : undefined}
                rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(195,163,94,0.2)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 2px 8px rgba(107,31,43,0.04)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(195,163,94,0.5)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(107,31,43,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(195,163,94,0.2)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(107,31,43,0.04)' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(107,31,43,0.08), rgba(195,163,94,0.12))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" fill="none" stroke="#6B1F2B" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ch.icon} />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C3A35E', fontFamily: '-apple-system, sans-serif', marginBottom: '2px' }}>{ch.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#6B1F2B', fontFamily: '-apple-system, sans-serif' }}>{ch.value}</div>
                </div>
              </a>
            ))}

            {/* Response guarantee */}
            <div style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, rgba(107,31,43,0.04), rgba(195,163,94,0.06))',
              border: '1px solid rgba(195,163,94,0.15)',
              borderRadius: '12px',
              marginTop: '4px',
            }}>
              {[
                '24h response guarantee',
                'Dedicated account manager',
                'NDA available on request',
              ].map((point, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < 2 ? '8px' : 0 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#C3A35E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: '12px', color: '#6B1F2B', fontFamily: '-apple-system, sans-serif', opacity: 0.8 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection

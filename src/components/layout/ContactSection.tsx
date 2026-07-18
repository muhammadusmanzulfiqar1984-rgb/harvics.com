'use client'

import React, { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useScrollReveal, revealClass } from '@/hooks/useScrollReveal'

/**
 * Contact Section — Option C "Dark Split" layout
 * Left pane: cream form
 * Right pane: burgundy direct-channels panel
 */
const ContactSection: React.FC = () => {
  const t = useTranslations('contact')
  const locale = useLocale()
  const { ref, isVisible } = useScrollReveal()

  // Silence unused-locale lint until needed
  void locale

  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const getText = (key: string, fallback: string) => {
    try {
      const v = t(key)
      // next-intl returns the full key path (e.g. "contact.eyebrow") when the
      // translation is missing — treat that as missing and use the fallback.
      if (!v || v === key || v.endsWith(`.${key}`)) return fallback
      return v
    } catch { return fallback }
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
      label: getText('phone', 'Phone (UK)'),
      value: '+44 7405 527427',
      href: 'tel:+447405527427',
    },
    {
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      label: getText('email', 'Email Sales'),
      value: 'sales.uk@harvics.com',
      href: 'mailto:sales.uk@harvics.com',
    },
    {
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      label: 'Call HarvyX',
      value: '+1 (229) 545 5206',
      href: 'tel:+12295455206',
    },
  ]

  const trustPoints = [
    getText('trust1', '24-hour response guarantee'),
    getText('trust2', 'Dedicated account manager'),
    getText('trust3', 'NDA available on request'),
    getText('trust4', '42 markets · 1,247 shipments today'),
  ]

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    fontSize: '13px',
    border: '1px solid rgba(61, 18, 18,0.12)',
    outline: 'none',
    background: '#ffffff',
    color: 'var(--harvics-burgundy)',
    fontFamily: '-apple-system, sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  }

  const labelBase: React.CSSProperties = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--harvics-burgundy)',
    marginBottom: '5px',
    fontFamily: '-apple-system, sans-serif',
  }

  return (
    <section
      ref={ref}
      className={revealClass(isVisible, 'up')}
      style={{
        background: 'var(--harvics-cream)',
        borderTop: '1px solid rgba(195, 163, 94,0.25)',
        borderBottom: '1px solid rgba(195, 163, 94,0.25)',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5" style={{ maxWidth: '1400px', margin: '0 auto', minHeight: '620px' }}>

        {/* ============ LEFT PANE — Form on cream ============ */}
        <div className="lg:col-span-3 bg-harvics-cream" style={{ padding: 'clamp(40px, 6vw, 72px) clamp(28px, 5vw, 64px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', gap: '14px', marginBottom: '14px' }}>
            <div style={{ height: '1px', width: '32px', background: 'var(--harvics-gold)' }} />
            <span style={{ color: 'var(--harvics-gold)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase' }}>
              Contact · Brief
            </span>
          </div>
          <h2 className="harvics-corridor-display text-harvics-burgundy" style={{ fontSize: 'clamp(26px, 3.2vw, 40px)', marginBottom: '12px' }}>
            {getText('headline1', 'Start a brief.')}
            <br />
            <span className="text-harvics-gold font-medium">{getText('headline2', 'We respond in 24 hours.')}</span>
          </h2>
          <p className="harvics-corridor-body" style={{ fontSize: '13px', maxWidth: '520px', marginBottom: '28px' }}>
            {getText('subhead', 'Tell us your category, volume, and target market. A specialist gets back to you with sourcing options and indicative pricing.')}
          </p>

          {sent ? (
            <div style={{ padding: '32px 0' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #C3A35E, #3D1212)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--harvics-burgundy)' }}>{getText('sentTitle', 'Message sent.')}</p>
              <p style={{ fontSize: '12px', color: 'rgba(61, 18, 18,0.5)', marginTop: '4px' }}>{getText('sentSub', 'Our team will respond within 24 hours.')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '560px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelBase}>{getText('fullName', 'Full Name')} *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={getText('fullNamePlaceholder', 'Shah Tabraiz')}
                    style={inputBase}
                    onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--harvics-gold)' }}
                    onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(61, 18, 18,0.12)' }}
                  />
                </div>
                <div>
                  <label style={labelBase}>{getText('company', 'Company')}</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder={getText('companyPlaceholder', 'Your Organisation')}
                    style={inputBase}
                    onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--harvics-gold)' }}
                    onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(61, 18, 18,0.12)' }}
                  />
                </div>
              </div>
              <div>
                <label style={labelBase}>{getText('businessEmail', 'Business Email')} *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com"
                  style={inputBase}
                  onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--harvics-gold)' }}
                  onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(61, 18, 18,0.12)' }}
                />
              </div>
              <div>
                <label style={labelBase}>{getText('howCanWeHelp', 'How can we help?')}</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder={getText('messagePlaceholder', 'Tell us about your sourcing needs, volumes, or partnership interest...')}
                  style={{ ...inputBase, resize: 'none' }}
                  onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--harvics-gold)' }}
                  onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(61, 18, 18,0.12)' }}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                style={{
                  padding: '14px 32px',
                  background: sending ? 'rgba(61, 18, 18,0.4)' : 'var(--harvics-burgundy)',
                  border: '1px solid #3D1212',
                  color: 'var(--harvics-gold)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase' as const,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  alignSelf: 'flex-start',
                  transition: 'all 0.2s ease',
                  marginTop: '6px',
                }}
                onMouseEnter={e => {
                  if (sending) return
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--harvics-gold)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--harvics-burgundy)'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--harvics-gold)'
                }}
                onMouseLeave={e => {
                  if (sending) return
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--harvics-burgundy)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--harvics-gold)'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--harvics-burgundy)'
                }}
              >
                {sending ? getText('sending', 'Sending...') : `${getText('sendEnquiry', 'Send Enquiry')} →`}
              </button>
            </form>
          )}
        </div>

        {/* ============ RIGHT PANE — Direct channels (cream continuous) ============ */}
        <div className="lg:col-span-2" style={{
          background: 'var(--harvics-cream)',
          color: 'var(--harvics-burgundy)',
          padding: 'clamp(40px, 6vw, 72px) clamp(28px, 5vw, 56px)',
          borderLeft: '1px solid rgba(195, 163, 94,0.28)',
        }}>
          <h3 style={{ fontSize: '11px', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--harvics-gold)', fontWeight: 600, marginBottom: '24px' }}>
            {getText('directChannels', 'Direct Channels')}
          </h3>

          {channels.map((ch, i) => (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith('http') ? '_blank' : undefined}
              rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '18px 0',
                borderBottom: i < channels.length - 1 ? '1px solid rgba(195, 163, 94,0.22)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(195, 163, 94,0.45)',
                color: 'var(--harvics-gold)',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ch.icon} />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(61, 18, 18,0.45)', fontWeight: 600, marginBottom: '3px' }}>
                  {ch.label}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--harvics-burgundy)', fontWeight: 500 }}>
                  {ch.value}
                </div>
              </div>
            </a>
          ))}

          {/* Trust block */}
          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(195, 163, 94,0.28)' }}>
            {trustPoints.map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="var(--harvics-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: '12px', color: 'rgba(61, 18, 18,0.7)' }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection

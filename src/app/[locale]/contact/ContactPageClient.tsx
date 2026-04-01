'use client'

import React, { useState, useRef, useEffect } from 'react'

/* ───── Intersection Observer ───── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

interface ContactPageClientProps {
  locale: string
  translations: Record<string, string>
}

const contactItems = [
  { icon: '📞', key: 'phone', value: '+44 7405 527427' },
  { icon: '📧', key: 'email', value: 'sales.uk@harvics.com' },
  { icon: '💬', key: 'whatsapp', value: '+44 7405 527427' },
]

const ContactPageClient: React.FC<ContactPageClientProps> = ({ locale, translations: t }) => {
  const heroRef = useInView(0.1)
  const cardRef = useInView(0.1)
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('sending')
    setTimeout(() => setFormState('sent'), 1500)
  }

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      <div className="pt-20">
        {/* ═══════ HERO ═══════ */}
        <section
          ref={heroRef.ref}
          className="relative bg-gradient-to-br from-[#6B1F2B] via-[#5a1a24] to-[#4a1520] py-28 md:py-32 px-4 overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 65%)' }} />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(195,163,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(195,163,94,0.5) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }} />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C3A35E]/40 to-transparent" />

          <div className="relative z-10 max-w-[1200px] mx-auto text-center">
            <div
              className="transition-all duration-700"
              style={{ opacity: heroRef.inView ? 1 : 0, transform: heroRef.inView ? 'translateY(0)' : 'translateY(12px)' }}
            >
              <span className="inline-block text-xs font-bold text-[#C3A35E] uppercase tracking-[0.25em] mb-5 border border-[#C3A35E]/30 px-3 py-1">
                Get In Touch
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-700 delay-100"
              style={{
                letterSpacing: '-0.03em',
                opacity: heroRef.inView ? 1 : 0,
                transform: heroRef.inView ? 'translateY(0)' : 'translateY(16px)',
              }}
            >
              {t.title}
            </h1>
            <p
              className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200"
              style={{ opacity: heroRef.inView ? 1 : 0, transform: heroRef.inView ? 'translateY(0)' : 'translateY(12px)' }}
            >
              {t.subtitle}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3A35E]/30 to-transparent" />
        </section>

        {/* ═══════ CONTACT CARD ═══════ */}
        <section ref={cardRef.ref} className="relative px-4 pb-20 -mt-16 z-20">
          <div className="max-w-[1200px] mx-auto">
            <div
              className="bg-white border border-[#C3A35E]/15 p-8 md:p-12 transition-all duration-700"
              style={{
                opacity: cardRef.inView ? 1 : 0,
                transform: cardRef.inView ? 'translateY(0)' : 'translateY(24px)',
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
                {/* Contact Information */}
                <div className="order-2 lg:order-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
                    <span className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em]">Contact Details</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-8" style={{ letterSpacing: '-0.02em' }}>{t.getInTouch}</h2>

                  <div className="space-y-3">
                    {contactItems.map((item, i) => (
                      <div
                        key={item.key}
                        className="group flex items-start gap-4 p-5 bg-white/60 border border-[#C3A35E]/10 hover:border-[#C3A35E]/40 transition-all duration-300"
                        style={{
                          opacity: cardRef.inView ? 1 : 0,
                          transform: cardRef.inView ? 'translateX(0)' : 'translateX(-16px)',
                          transitionDelay: `${300 + i * 100}ms`,
                        }}
                      >
                        <div className="w-11 h-11 bg-[#6B1F2B] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C3A35E] transition-colors duration-300">
                          <span className="text-white text-base">{item.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-[#6B1F2B] font-bold text-sm mb-0.5">{t[item.key]}</h3>
                          <p className="text-[#6B1F2B]/50 text-sm">{item.value}</p>
                        </div>
                      </div>
                    ))}

                    {/* Locations card */}
                    <div
                      className="group flex items-start gap-4 p-5 bg-white/60 border border-[#C3A35E]/10 hover:border-[#C3A35E]/40 transition-all duration-300"
                      style={{
                        opacity: cardRef.inView ? 1 : 0,
                        transform: cardRef.inView ? 'translateX(0)' : 'translateX(-16px)',
                        transitionDelay: '600ms',
                      }}
                    >
                      <div className="w-11 h-11 bg-[#6B1F2B] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C3A35E] transition-colors duration-300">
                        <span className="text-white text-base">📍</span>
                      </div>
                      <div>
                        <h3 className="text-[#6B1F2B] font-bold text-sm mb-0.5">{t.locations}</h3>
                        <p className="text-[#6B1F2B]/50 text-sm">{t.locationsValue}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div
                  className="order-1 lg:order-2 transition-all duration-700 delay-200"
                  style={{
                    opacity: cardRef.inView ? 1 : 0,
                    transform: cardRef.inView ? 'translateX(0)' : 'translateX(16px)',
                  }}
                >
                  <div className="bg-white/80 p-8 border border-[#C3A35E]/15">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
                      <span className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em]">Send a Message</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#6B1F2B] mb-8" style={{ letterSpacing: '-0.02em' }}>{t.sendMessage}</h2>

                    {formState === 'sent' ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4">✓</div>
                        <h3 className="text-lg font-bold text-[#6B1F2B] mb-2">Message Sent</h3>
                        <p className="text-sm text-[#6B1F2B]/50">We'll get back to you within 24 hours.</p>
                        <button
                          onClick={() => setFormState('idle')}
                          className="mt-6 text-sm text-[#C3A35E] border border-[#C3A35E]/30 px-4 py-2 hover:bg-[#C3A35E]/5 transition-colors duration-200"
                        >
                          Send Another
                        </button>
                      </div>
                    ) : (
                      <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#6B1F2B] font-bold mb-2 text-[10px] uppercase tracking-wider">{t.firstName}</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 bg-white border border-[#C3A35E]/20 text-[#6B1F2B] text-sm placeholder-[#6B1F2B]/25 focus:border-[#C3A35E] focus:outline-none transition-colors duration-200"
                              placeholder={t.firstNamePlaceholder}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[#6B1F2B] font-bold mb-2 text-[10px] uppercase tracking-wider">{t.lastName}</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 bg-white border border-[#C3A35E]/20 text-[#6B1F2B] text-sm placeholder-[#6B1F2B]/25 focus:border-[#C3A35E] focus:outline-none transition-colors duration-200"
                              placeholder={t.lastNamePlaceholder}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[#6B1F2B] font-bold mb-2 text-[10px] uppercase tracking-wider">{t.email}</label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 bg-white border border-[#C3A35E]/20 text-[#6B1F2B] text-sm placeholder-[#6B1F2B]/25 focus:border-[#C3A35E] focus:outline-none transition-colors duration-200"
                            placeholder={t.emailPlaceholder}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[#6B1F2B] font-bold mb-2 text-[10px] uppercase tracking-wider">{t.subject}</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-white border border-[#C3A35E]/20 text-[#6B1F2B] text-sm placeholder-[#6B1F2B]/25 focus:border-[#C3A35E] focus:outline-none transition-colors duration-200"
                            placeholder={t.subjectPlaceholder}
                          />
                        </div>

                        <div>
                          <label className="block text-[#6B1F2B] font-bold mb-2 text-[10px] uppercase tracking-wider">{t.message}</label>
                          <textarea
                            rows={4}
                            className="w-full px-4 py-3 bg-white border border-[#C3A35E]/20 text-[#6B1F2B] text-sm placeholder-[#6B1F2B]/25 focus:border-[#C3A35E] focus:outline-none transition-colors duration-200 resize-none"
                            placeholder={t.messagePlaceholder}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={formState === 'sending'}
                          className="group relative w-full bg-[#6B1F2B] text-white text-sm font-bold uppercase tracking-widest px-8 py-4 overflow-hidden transition-colors disabled:opacity-60"
                        >
                          <span className="relative z-10">{formState === 'sending' ? 'Sending...' : t.send}</span>
                          <span className="absolute inset-0 bg-[#5a1a24] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ PRIVACY & SECURITY ═══════ */}
        <section className="relative px-4 py-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#6B1F2B] mb-3">Your Privacy Matters</h2>
              <p className="text-[#6B1F2B]/60 max-w-2xl mx-auto">
                We take your privacy seriously. All information shared with us is encrypted and handled with the highest security standards.
              </p>
            </div>
            <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/Images/privacy.jpg" 
                alt="Privacy and Security" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ContactPageClient

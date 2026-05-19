// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'media')
}

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

interface MediaContactsPageProps {
  params: Promise<{ locale: string }>
}

export default async function MediaContactsPage({ params }: MediaContactsPageProps) {
  const { locale } = await params

  const contacts = [
    { icon: '📰', title: 'Press & Media Relations', email: 'media@harvics.com', desc: 'For press inquiries, interview requests, journalist accreditation, and media kit access.' },
    { icon: '📢', title: 'Corporate Communications', email: 'comms@harvics.com', desc: 'For partnership announcements, joint press releases, and co-branded communications.' },
    { icon: '💼', title: 'Investor Relations', email: 'ir@harvics.com', desc: 'For financial media inquiries, earnings coverage, and investor-related press requests.' },
    { icon: '🌍', title: 'Regional Media Offices', email: 'info@harvics.com', desc: 'For market-specific media contacts across the Middle East, Europe, South Asia, and Africa.' },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Media</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Media Contacts
          </h1>
          <p className="text-lg text-white/60 max-w-[600px] mx-auto leading-relaxed">
            Connect with the right team for your media needs.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((c) => (
            <div key={c.title} className="bg-white border border-[#C3A35E]/15 p-8">
              <div className="text-3xl mb-4">{c.icon}</div>
              <h3 className="text-lg font-semibold text-[#6B1F2B] mb-2">{c.title}</h3>
              <p className="text-sm text-[#6B1F2B]/55 leading-relaxed mb-4">{c.desc}</p>
              <a href={`mailto:${c.email}`} className="text-sm font-bold text-[#C3A35E] hover:text-[#6B1F2B] transition-colors">
                {c.email}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Headquarters */}
      <section className="bg-white border-t border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-8 text-center">Global Headquarters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
            {[
              { city: 'Dubai, UAE', type: 'Global HQ', email: 'info@harvics.com' },
              { city: 'London, UK', type: 'Europe Office', email: 'london@harvics.com' },
              { city: 'Lahore, Pakistan', type: 'South Asia Office', email: 'asia@harvics.com' },
            ].map((office) => (
              <div key={office.city} className="text-center p-6 border border-[#C3A35E]/15">
                <div className="text-lg font-bold text-[#6B1F2B] mb-1">{office.city}</div>
                <div className="text-xs text-[#C3A35E] font-semibold uppercase tracking-wider mb-3">{office.type}</div>
                <a href={`mailto:${office.email}`} className="text-sm text-[#6B1F2B]/55 hover:text-[#C3A35E] transition-colors">{office.email}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Need a Media Kit?</h3>
            <p className="text-white/50 text-sm">Download logos, brand guidelines, executive bios, and high-resolution imagery.</p>
          </div>
          <Link href={`/${locale}/media/images`}
            className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors">
            Media Gallery
          </Link>
        </div>
      </section>
    </main>
  )
}


import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'leadership')
}

interface LeadershipPageProps {
  params: Promise<{ locale: string }>
}

export default async function LeadershipPage({ params }: LeadershipPageProps) {
  const { locale } = await params

  const leader = {
    name: 'Mian Muhammad Usman',
    role: 'Founder & Chief Executive Officer',
    bio: "Founder of Harvics Global Ventures, established in 2019. Leads the company's expansion across 42+ countries with a focus on AI-driven supply chain excellence, multi-vertical global trading, and building repeatable commercial systems that convert opportunity into sustained global value.",
    emails: ['ceo@harvics.com', 'founder@harvics.com'] as const,
  }

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      <section className="relative bg-harvics-burgundy py-20 px-4 border-b border-harvics-gold/40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop&q=75"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.75) contrast(1.1) saturate(1.05)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.85) 0%, rgba(107,31,43,0.5) 45%, rgba(107,31,43,0.25) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-harvics-gold font-bold uppercase tracking-[0.2em] mb-3">The Team</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Our Leadership
          </h1>
          <p className="text-lg text-white/60 max-w-[600px] mx-auto leading-relaxed">
            Meet the leadership driving Harvics across 42+ countries, 10 industry verticals, and 38 languages.
          </p>
        </div>
      </section>

      <section className="max-w-[800px] mx-auto px-4 py-16">
        <div className="bg-white border border-harvics-gold/20 overflow-hidden">
          <div
            className="h-[240px] bg-harvics-burgundy/5 flex items-center justify-center"
            style={{
              backgroundImage: 'url(/assets/brand/photo/logo.png)',
              backgroundSize: '35%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="p-8 md:p-10">
            <h3 className="text-2xl font-semibold text-harvics-burgundy mb-1">{leader.name}</h3>
            <p className="text-xs text-harvics-gold font-bold uppercase tracking-wider mb-5">{leader.role}</p>
            <div className="flex flex-wrap gap-4 mb-6">
              {leader.emails.map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="text-sm text-harvics-burgundy/80 hover:text-harvics-gold transition-colors border border-harvics-gold/25 px-3 py-1.5"
                >
                  {email}
                </a>
              ))}
            </div>
            <p className="text-sm text-harvics-burgundy/60 leading-relaxed mb-8">{leader.bio}</p>
            <p className="text-xs text-harvics-burgundy/45">
              For regional desks, sourcing, support, and other channels, see the{' '}
              <Link href={`/${locale}/contact`} className="text-harvics-gold hover:underline">
                full email directory
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-harvics-burgundy border-t border-harvics-gold/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">Work with Harvics</h2>
            <p className="text-white/50 text-sm">Reach the right desk — we respond within 24 hours.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/contact`}
              className="px-8 py-3 bg-harvics-gold text-harvics-burgundy text-sm font-bold uppercase tracking-wider hover:bg-[#d4b46e] transition-colors"
            >
              Contact Directory
            </Link>
            <a
              href="mailto:info@harvics.com"
              className="px-8 py-3 border border-harvics-gold/40 text-harvics-gold text-sm font-medium hover:bg-harvics-gold/10 transition-colors"
            >
              info@harvics.com
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

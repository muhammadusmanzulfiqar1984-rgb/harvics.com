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

  const leaders = [
    {
      name: 'Muhammad Usman Zulfiqar',
      role: 'Founder & Chief Executive Officer',
      bio: 'Founder of Harvics Global Ventures, established in 2019. Leads the company\'s expansion across 42+ countries with a focus on AI-driven supply chain excellence, multi-vertical global trading, and building repeatable commercial systems that convert opportunity into sustained global value.',
      image: undefined,
    },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
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
            Meet the team driving Harvics across 42+ countries, 10 industry verticals, and 38 languages.
          </p>
        </div>
      </section>

      {/* Leaders Grid */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((leader) => (
            <div
              key={leader.name}
              className="bg-white border border-harvics-gold/20 overflow-hidden group"
              style={{ borderRadius: 0, boxShadow: 'none' }}
            >
              <div className="h-[280px] bg-harvics-burgundy/5 overflow-hidden" style={{ backgroundImage: 'url(/assets/brand/photo/logo.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-harvics-burgundy mb-1">{leader.name}</h3>
                <p className="text-xs text-harvics-gold font-bold uppercase tracking-wider mb-4">{leader.role}</p>
                <p className="text-sm text-harvics-burgundy/60 leading-relaxed">{leader.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-harvics-burgundy border-t border-harvics-gold/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Join Our Team</h3>
            <p className="text-white/50 text-sm">We're growing across the globe. Explore opportunities to be part of Harvics.</p>
          </div>
          <Link
            href={`/${locale}/careers`}
            className="px-8 py-3 bg-harvics-gold text-harvics-burgundy text-sm font-bold hover:bg-[#d4b46e] transition-colors"
            style={{ borderRadius: 0 }}
          >
            View Careers
          </Link>
        </div>
      </section>
    </main>
  )
}


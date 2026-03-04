import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leadership | Harvics',
  description: 'Meet the leadership team driving Harvics Global Ventures across 40+ markets and 10 industry verticals.',
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
      bio: 'Visionary entrepreneur who founded Harvics Global Ventures in 2019. Leads the company\'s expansion across 40+ countries with a focus on AI-driven supply chain excellence and multi-vertical global trading.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    },
    {
      name: 'Ahmed Al-Rashid',
      role: 'Chief Operating Officer',
      bio: 'Expert in end-to-end operations and global supply chain management with 18+ years across FMCG, textiles, and industrial distribution in the GCC and South Asia.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    },
    {
      name: 'Sara Khan',
      role: 'Chief Financial Officer',
      bio: 'Financial strategist with extensive global market experience. Oversees multi-currency treasury, trade finance, and the HPay digital payments platform across all operating territories.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    },
    {
      name: 'David Chen',
      role: 'Chief Technology Officer',
      bio: 'Architect of Harvics OS — the unified enterprise platform. Leads AI engine development, real-time intelligence systems, and the company\'s technology strategy across 38 languages.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    },
    {
      name: 'Fatima Al-Maktoum',
      role: 'VP, Global Sourcing',
      bio: 'Manages Harvics\' global sourcing network spanning Asia, Africa, and the Middle East. Expert in quality control, supplier audits, and factory-direct procurement programs.',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face',
    },
    {
      name: 'James Okonkwo',
      role: 'VP, Africa & Emerging Markets',
      bio: 'Drives market entry and distribution partnerships across Sub-Saharan Africa. Specialist in territory development, distributor management, and last-mile logistics.',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    },
  ]

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Hero */}
      <section className="bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">The Team</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Our Leadership
          </h1>
          <p className="text-lg text-white/60 max-w-[600px] mx-auto leading-relaxed">
            Meet the team driving Harvics across 40+ countries, 10 industry verticals, and 38 languages.
          </p>
        </div>
      </section>

      {/* Leaders Grid */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((leader) => (
            <div
              key={leader.name}
              className="bg-white border border-[#C3A35E]/20 overflow-hidden group"
              style={{ borderRadius: 0, boxShadow: 'none' }}
            >
              <div className="h-[280px] bg-[#6B1F2B]/5 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/Images/logo.png' }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#6B1F2B] mb-1">{leader.name}</h3>
                <p className="text-xs text-[#C3A35E] font-bold uppercase tracking-wider mb-4">{leader.role}</p>
                <p className="text-sm text-[#6B1F2B]/60 leading-relaxed">{leader.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Join Our Team</h3>
            <p className="text-white/50 text-sm">We're growing across the globe. Explore opportunities to be part of Harvics.</p>
          </div>
          <Link
            href={`/${locale}/careers`}
            className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors"
            style={{ borderRadius: 0 }}
          >
            View Careers
          </Link>
        </div>
      </section>
    </main>
  )
}


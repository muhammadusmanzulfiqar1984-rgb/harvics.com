import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Media Center | Harvics',
  description: 'Harvics media center — press releases, news, brand assets, and media contacts.',
}

interface MediaPageProps {
  params: Promise<{ locale: string }>
}

export default async function MediaPage({ params }: MediaPageProps) {
  const { locale } = await params

  const sections = [
    {
      icon: '📰',
      title: 'News & Press Releases',
      desc: 'Latest announcements, market expansions, product launches, and corporate updates from Harvics Global Ventures.',
      href: `/${locale}/media/news`,
      cta: 'Read Latest News',
    },
    {
      icon: '📸',
      title: 'Image Gallery',
      desc: 'High-resolution brand assets, product photography, facility images, and event coverage for media use.',
      href: `/${locale}/media/images`,
      cta: 'Browse Gallery',
    },
    {
      icon: '📞',
      title: 'Media Contacts',
      desc: 'Reach our communications team for press inquiries, interview requests, and partnership announcements.',
      href: `/${locale}/media/contacts`,
      cta: 'Contact Press Team',
    },
  ]

  const highlights = [
    { num: '40+', label: 'Markets Covered' },
    { num: '10', label: 'Industry Verticals' },
    { num: '2019', label: 'Founded in Dubai' },
    { num: '38', label: 'Languages Supported' },
  ]

  const recentNews = [
    { date: 'Dec 2025', title: 'Harvics Expands FMCG Operations to 5 New Southeast Asian Markets' },
    { date: 'Nov 2025', title: 'New AI-Powered Supply Chain Platform Launched for Global Distribution' },
    { date: 'Oct 2025', title: 'Harvics Achieves Carbon-Neutral Milestone Across All Facilities' },
    { date: 'Sep 2025', title: 'Strategic Partnership with Leading Textile Manufacturers in South Asia' },
  ]

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Hero */}
      <section className="bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Corporate</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Media Center
          </h1>
          <p className="text-lg text-white/60 max-w-[600px] mx-auto leading-relaxed">
            Press resources, brand assets, and the latest news from Harvics Global Ventures.
          </p>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {highlights.map((h) => (
            <div key={h.label}>
              <div className="text-2xl font-bold text-[#C3A35E]">{h.num}</div>
              <div className="text-xs text-white/50 mt-1">{h.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Media Sections */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white border border-[#C3A35E]/20 p-8 flex flex-col" style={{ borderRadius: 0, boxShadow: 'none' }}>
              <div className="text-4xl mb-5">{s.icon}</div>
              <h3 className="text-lg font-semibold text-[#6B1F2B] mb-3">{s.title}</h3>
              <p className="text-sm text-[#6B1F2B]/60 leading-relaxed mb-6 flex-1">{s.desc}</p>
              <Link
                href={s.href}
                className="inline-block px-6 py-3 bg-[#6B1F2B] text-white text-sm font-semibold hover:bg-[#5a1a24] transition-colors text-center"
                style={{ borderRadius: 0 }}
              >
                {s.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Headlines */}
      <section className="bg-white border-t border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-8 text-center">Recent Headlines</h2>
          <div className="space-y-4 max-w-[800px] mx-auto">
            {recentNews.map((n) => (
              <Link
                key={n.title}
                href={`/${locale}/media/news`}
                className="flex items-center gap-4 p-5 border border-[#C3A35E]/15 bg-[#F5F1E8] hover:border-[#C3A35E] transition-colors group"
                style={{ borderRadius: 0 }}
              >
                <span className="text-xs text-[#C3A35E] font-bold uppercase tracking-wider whitespace-nowrap min-w-[80px]">{n.date}</span>
                <span className="text-sm font-medium text-[#6B1F2B] group-hover:text-[#6B1F2B]/80">{n.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Media Inquiries</h3>
            <p className="text-white/50 text-sm">For press inquiries, interviews, or brand asset requests, contact our communications team.</p>
          </div>
          <Link
            href={`/${locale}/media/contacts`}
            className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors"
            style={{ borderRadius: 0 }}
          >
            Contact Press Team
          </Link>
        </div>
      </section>
    </main>
  )
}

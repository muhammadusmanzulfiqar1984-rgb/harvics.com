import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Site Map | Harvics Global Ventures',
  description: 'Complete site map for Harvics Global Ventures — all pages and sections.',
}

const sections = [
  {
    title: 'Company',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '/about' },
      { label: 'Our Leadership', href: '/leadership' },
      { label: 'Our History', href: '/history' },
      { label: 'Strategy', href: '/strategy' },
      { label: 'Global Addresses', href: '/locations' },
      { label: 'Sustainability & ESG', href: '/csr' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { label: 'Textiles & Apparels', href: '/textiles' },
      { label: 'FMCG', href: '/fmcg' },
      { label: 'Commodities', href: '/commodities' },
      { label: 'Industrial Solutions', href: '/industrial' },
      { label: 'Minerals', href: '/minerals' },
      { label: 'Oil & Gas', href: '/oil-gas' },
      { label: 'Real Estate', href: '/real-estate' },
      { label: 'Sourcing Solutions', href: '/sourcing' },
      { label: 'Finance & HPay', href: '/finance' },
      { label: 'AI & Technology', href: '/ai' },
    ],
  },
  {
    title: 'Access & Portals',
    links: [
      { label: 'Portals Hub', href: '/portals' },
      { label: 'La Pres', href: '/la-pres' },
      { label: 'Company Sign-in', href: '/login' },
    ],
  },
  {
    title: 'Trade Portals',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'Distributor Portal', href: '/portal/distributor' },
      { label: 'Supplier Portal', href: '/portal/supplier' },
    ],
  },
  {
    title: 'Investors & Media',
    links: [
      { label: 'Investor Relations', href: '/investor-relations' },
      { label: 'Corporate Governance', href: '/investors/governance' },
      { label: 'Shares & Bonds', href: '/investors/shares' },
      { label: 'Publications', href: '/investors/publications' },
      { label: 'Media', href: '/media' },
      { label: 'News', href: '/media/news' },
      { label: 'Media Contacts', href: '/media/contacts' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Ask Harvics (FAQ)', href: '/faq' },
      { label: 'Help', href: '/help' },
      { label: 'Newsletter', href: '/newsletter' },
      { label: 'Compliance & Speak Up', href: '/compliance' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
]

export default async function SitemapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <main className="max-w-5xl mx-auto px-6 py-20" style={{ color: '#3d1a22' }}>
      <style>{`.sitemap-link:hover { opacity: 1 !important; }`}</style>
      <div style={{ marginBottom: '56px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C3A35E', marginBottom: '12px', fontFamily: '-apple-system, sans-serif' }}>
          Navigation
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#6B1F2B', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginBottom: '16px' }}>
          Site Map
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(107,31,43,0.5)', fontFamily: '-apple-system, sans-serif' }}>
          Every page on harvics.com — find what you need.
        </p>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, #C3A35E, transparent)', marginTop: '24px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '40px' }}>
        {sections.map((section) => (
          <div key={section.title}>
            <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C3A35E', marginBottom: '14px', fontFamily: '-apple-system, sans-serif' }}>
              {section.title}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    style={{ fontSize: '14px', color: '#6B1F2B', textDecoration: 'none', opacity: 0.75, fontFamily: '-apple-system, sans-serif', transition: 'opacity 0.15s ease' }}
                    className="sitemap-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  )
}

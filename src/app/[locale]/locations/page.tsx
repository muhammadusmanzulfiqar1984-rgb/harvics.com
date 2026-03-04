import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Global Locations | Harvics',
  description: 'Harvics offices and operations across the Middle East, South Asia, Europe, Africa, and more.',
}

interface LocationsPageProps {
  params: Promise<{ locale: string }>
}

export default async function LocationsPage({ params }: LocationsPageProps) {
  const { locale } = await params

  const locations = [
    {
      region: 'Middle East & GCC',
      offices: [
        { city: 'Dubai', country: 'UAE', type: 'Global HQ', address: 'Trade Center District, Sheikh Zayed Road, Dubai, UAE', phone: '+971 4 123 4567', email: 'dubai@harvics.com' },
        { city: 'Riyadh', country: 'Saudi Arabia', type: 'Regional Office', address: 'King Fahd Business District, Riyadh, KSA', phone: '+966 11 234 5678', email: 'riyadh@harvics.com' },
        { city: 'Doha', country: 'Qatar', type: 'Sales Office', address: 'West Bay Tower, Doha, Qatar', phone: '+974 4412 3456', email: 'doha@harvics.com' },
      ]
    },
    {
      region: 'South Asia',
      offices: [
        { city: 'Karachi', country: 'Pakistan', type: 'Operations Hub', address: 'Shahrah-e-Faisal, Clifton, Karachi, Pakistan', phone: '+92 21 3456 7890', email: 'karachi@harvics.com' },
        { city: 'Lahore', country: 'Pakistan', type: 'Distribution Center', address: 'Main Boulevard, Gulberg III, Lahore, Pakistan', phone: '+92 42 3456 7890', email: 'lahore@harvics.com' },
        { city: 'Mumbai', country: 'India', type: 'Sales Office', address: 'Bandra Kurla Complex, Mumbai, India', phone: '+91 22 4567 8901', email: 'mumbai@harvics.com' },
      ]
    },
    {
      region: 'Europe',
      offices: [
        { city: 'London', country: 'United Kingdom', type: 'European HQ', address: 'Canary Wharf, London E14, UK', phone: '+44 20 7123 4567', email: 'london@harvics.com' },
        { city: 'Istanbul', country: 'Turkey', type: 'Sourcing Office', address: 'Levent Business District, Istanbul, Turkey', phone: '+90 212 345 6789', email: 'istanbul@harvics.com' },
      ]
    },
    {
      region: 'Africa',
      offices: [
        { city: 'Lagos', country: 'Nigeria', type: 'West Africa Hub', address: 'Victoria Island, Lagos, Nigeria', phone: '+234 1 234 5678', email: 'lagos@harvics.com' },
        { city: 'Nairobi', country: 'Kenya', type: 'East Africa Hub', address: 'Westlands, Nairobi, Kenya', phone: '+254 20 234 5678', email: 'nairobi@harvics.com' },
      ]
    },
    {
      region: 'East Asia & Pacific',
      offices: [
        { city: 'Shanghai', country: 'China', type: 'Sourcing Hub', address: 'Pudong New Area, Shanghai, China', phone: '+86 21 5678 9012', email: 'shanghai@harvics.com' },
      ]
    },
  ]

  const typeColors: Record<string, string> = {
    'Global HQ': 'bg-[#6B1F2B] text-white',
    'European HQ': 'bg-[#6B1F2B] text-white',
    'Regional Office': 'bg-[#C3A35E]/15 text-[#6B1F2B]',
    'Operations Hub': 'bg-[#C3A35E]/15 text-[#6B1F2B]',
    'Distribution Center': 'bg-[#C3A35E]/15 text-[#6B1F2B]',
    'Sales Office': 'bg-[#F5F1E8] text-[#6B1F2B]',
    'Sourcing Office': 'bg-[#F5F1E8] text-[#6B1F2B]',
    'Sourcing Hub': 'bg-[#F5F1E8] text-[#6B1F2B]',
    'West Africa Hub': 'bg-[#C3A35E]/15 text-[#6B1F2B]',
    'East Africa Hub': 'bg-[#C3A35E]/15 text-[#6B1F2B]',
  }

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Hero */}
      <section className="bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Worldwide</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Global Locations
          </h1>
          <p className="text-lg text-white/60 max-w-[600px] mx-auto leading-relaxed">
            Offices, distribution centers, and sourcing hubs across 5 continents.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { num: '11', label: 'Office Locations' },
            { num: '5', label: 'Continents' },
            { num: '40+', label: 'Countries Served' },
            { num: '24/7', label: 'Global Operations' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-[#C3A35E]">{s.num}</div>
              <div className="text-xs text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Locations by Region */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        {locations.map((region) => (
          <div key={region.region} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-[#C3A35E]" />
              <h2 className="text-xl font-semibold text-[#6B1F2B]">{region.region}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {region.offices.map((office) => (
                <div
                  key={office.city}
                  className="bg-white border border-[#C3A35E]/20 p-6 hover:border-[#C3A35E] transition-colors"
                  style={{ borderRadius: 0, boxShadow: 'none' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-[#6B1F2B]">{office.city}, {office.country}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${typeColors[office.type] || 'bg-[#F5F1E8] text-[#6B1F2B]'}`} style={{ borderRadius: 0 }}>
                      {office.type}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B1F2B]/55 mb-4 leading-relaxed">{office.address}</p>
                  <div className="border-t border-[#C3A35E]/10 pt-3 space-y-1">
                    <div className="text-sm">
                      <span className="text-[#6B1F2B]/40">Tel:</span>{' '}
                      <a href={`tel:${office.phone}`} className="text-[#6B1F2B] hover:text-[#C3A35E] transition-colors">{office.phone}</a>
                    </div>
                    <div className="text-sm">
                      <span className="text-[#6B1F2B]/40">Email:</span>{' '}
                      <a href={`mailto:${office.email}`} className="text-[#C3A35E] hover:underline">{office.email}</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Visit Us or Get in Touch</h3>
            <p className="text-white/50 text-sm">Reach out to the nearest Harvics office for partnership, distribution, or sourcing inquiries.</p>
          </div>
          <Link
            href={`/${locale}/contact`}
            className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors"
            style={{ borderRadius: 0 }}
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  )
}


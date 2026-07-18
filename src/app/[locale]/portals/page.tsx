import Link from 'next/link'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { LA_PRES_NAME } from '@/data/presentationAccess'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function PortalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const Icons = {
    Distributor: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    Supplier: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    Company: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    LaPres: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
  }

  const enterprisePortals = [
    {
      id: 'distributor',
      name: 'Distributor Portal',
      description: 'Authorized access for logistics partners',
      icon: Icons.Distributor,
      href: `/${locale}/login/`,
    },
    {
      id: 'supplier',
      name: 'Supplier Portal',
      description: 'Vendor management & procurement systems',
      icon: Icons.Supplier,
      href: `/${locale}/login/`,
    },
    {
      id: 'company',
      name: 'Company Portal',
      description: 'Internal corporate operations & CRM',
      icon: Icons.Company,
      href: `/${locale}/login/`,
    },
  ]

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      <section className="bg-white border-b border-harvics-gold/20">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <LocalizationBar compact showGeo={false} className="items-center gap-2" />
        </div>
      </section>

      <section 
        className="relative py-20 md:py-24 overflow-hidden"
        style={{
          backgroundImage: "url('/assets/shared/heroes/portals-hub-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-harvics-burgundy/80" />
        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-harvics-gold/10 border border-harvics-gold/30 text-harvics-gold text-xs font-semibold tracking-widest uppercase mb-6 backdrop-blur-sm">
            Access Hub
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Harvics <span className="text-harvics-gold">Portals</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
            Two access paths — enterprise sign-in for partners and teams, and {LA_PRES_NAME} for
            client presentation decks.
          </p>
        </div>
      </section>

      {/* Site structure overview */}
      <section className="py-10 px-6 border-b border-harvics-gold/15 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.2em] text-harvics-gold font-bold mb-4 text-center">
            Site access structure
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="border border-harvics-gold/25 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-harvics-burgundy mb-2">
                01 · Enterprise sign-in
              </p>
              <p className="text-sm text-harvics-burgundy/60 mb-3">Email + password → CRM, OS, dashboards</p>
              <Link href={`/${locale}/login`} className="text-xs font-bold uppercase tracking-wider text-harvics-gold hover:text-harvics-burgundy">
                /login →
              </Link>
            </div>
            <div className="border border-harvics-gold/25 bg-[#1a1010] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-harvics-gold mb-2">
                02 · {LA_PRES_NAME}
              </p>
              <p className="text-sm text-white/50 mb-3">Programme code → Lobby, Lounge, or your deck</p>
              <Link href={`/${locale}/la-pres`} className="text-xs font-bold uppercase tracking-wider text-harvics-gold hover:text-white">
                /la-pres →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise portals */}
      <section className="py-16 px-6 -mt-0 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-xs text-harvics-gold font-bold uppercase tracking-[0.18em] mb-2">
              01 — Enterprise
            </p>
            <h2 className="text-2xl font-bold text-harvics-burgundy">Partner & company sign-in</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {enterprisePortals.map((portal) => {
              const portalImg = portal.id === 'distributor' 
                ? '/assets/shared/heroes/distributor-portal-hero.jpg' 
                : portal.id === 'supplier' 
                  ? '/assets/shared/heroes/supplier-portal-hero.jpg' 
                  : '/assets/shared/heroes/portals-hub-hero.jpg';
              return (
                <Link
                  key={portal.id}
                  href={portal.href}
                  className="group bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
                >
                  <div className="h-32 w-full overflow-hidden bg-[#f5f2ee]">
                    <img src={portalImg} alt={portal.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform" />
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="w-16 h-16 bg-harvics-burgundy text-harvics-gold flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform duration-300">
                      {portal.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-harvics-burgundy transition-colors">
                      {portal.name}
                    </h3>
                    <p className="text-gray-500 leading-relaxed mb-8 font-light text-sm flex-1">
                      {portal.description}
                    </p>
                    <div className="flex items-center text-harvics-gold font-semibold text-xs uppercase tracking-wide">
                      <span>Company sign-in</span>
                      <span className="ml-2" aria-hidden>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* La Pres */}
      <section className="py-16 px-6 border-t border-harvics-gold/15" style={{ background: '#0a0808' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex gap-5 items-start">
              <div className="w-16 h-16 shrink-0 bg-harvics-burgundy text-harvics-gold flex items-center justify-center border border-harvics-gold/30">
                {Icons.LaPres}
              </div>
              <div>
                <p className="text-xs text-harvics-gold font-bold uppercase tracking-[0.18em] mb-2">
                  02 — Client decks
                </p>
                <h2 className="text-3xl font-bold text-white mb-2">{LA_PRES_NAME}</h2>
                <p className="text-sm text-white/45 max-w-xl leading-relaxed">
                  Presentation suite for meetings and board sessions. Not connected to company
                  sign-in — use the programme code shared with you.
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/la-pres`}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-harvics-gold text-[#1a0d00] text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#d4b46e] transition-colors shrink-0"
            >
              Enter {LA_PRES_NAME}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/${locale}/la-pres/lobby`}
              className="border border-harvics-gold/25 bg-white/5 p-6 hover:border-harvics-gold/60 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Lobby</h3>
              <p className="text-sm text-white/45">General Harvics decks — textiles, sourcing.</p>
            </Link>
            <Link
              href={`/${locale}/la-pres/lounge`}
              className="border border-harvics-gold/25 bg-white/5 p-6 hover:border-harvics-gold/60 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Lounge</h3>
              <p className="text-sm text-white/45">Custom programmes — LPP, MAFI, client decks.</p>
            </Link>
            <Link
              href={`/${locale}/la-pres`}
              className="border border-harvics-gold/25 bg-white/5 p-6 hover:border-harvics-gold/60 transition-colors md:col-span-1"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Programme code</h3>
              <p className="text-sm text-white/45">Enter your code to open the right area or deck.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-gray-200" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-gray-900 font-bold mb-1">Developer Access</h4>
            <p className="text-sm text-gray-500">Restricted area for system administrators.</p>
          </div>
          <Link
            href={`/${locale}/admin/portal/`}
            className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-harvics-gold/30 text-gray-600 hover:text-harvics-burgundy font-medium transition-all text-sm flex items-center gap-2"
          >
            System Admin
          </Link>
        </div>
      </section>
    </main>
  )
}

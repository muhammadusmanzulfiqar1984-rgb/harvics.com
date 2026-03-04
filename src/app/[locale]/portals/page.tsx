import Link from 'next/link'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Generate static params for all locales
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'ar' },
    { locale: 'fr' },
    { locale: 'es' },
    { locale: 'de' },
    { locale: 'zh' },
    { locale: 'he' }
  ]
}

export default async function PortalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const categories = getFolderBasedCategories() || []

  // Professional Icons
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
    )
  }

  const portals = [
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
    }
  ]

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="fixed top-0 left-0 right-0 z-[1000] bg-white shadow-sm">
        <Header categories={categories} />
      </div>
      <div className="h-[172px]" /> {/* Fixed Header Spacer */}
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-24 bg-[#6B1F2B] overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C3A35E] rounded-full filter blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C3A35E] rounded-full filter blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-[#C3A35E]/10 border border-[#C3A35E]/30 text-[#C3A35E] text-xs font-semibold tracking-widest uppercase mb-6 backdrop-blur-sm">
            Enterprise Ecosystem
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Harvics <span className="text-[#C3A35E]">Portals</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
            Secure, centralized access points for our global partners and internal teams.
          </p>
        </div>
      </section>

      {/* Portals Grid */}
      <section className="py-16 px-6 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portals.map((portal) => (
              <Link
                key={portal.id}
                href={portal.href}
                className="group bg-white p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-[#6B1F2B] text-[#C3A35E] flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                  {portal.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#6B1F2B] transition-colors">
                  {portal.name}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-8 font-light">
                  {portal.description}
                </p>
                <div className="flex items-center text-[#C3A35E] font-semibold text-sm uppercase tracking-wide group-hover:gap-2 transition-all">
                  <span>Secure Login</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Access Footer */}
      <section className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-gray-900 font-bold mb-1">Developer Access</h4>
            <p className="text-sm text-gray-500">Restricted area for system administrators.</p>
          </div>
          <Link
            href={`/${locale}/admin/portal/`}
            className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-[#C3A35E]/30 text-gray-600 hover:text-[#6B1F2B] font-medium transition-all text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            System Admin
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}

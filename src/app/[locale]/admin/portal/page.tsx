import Link from 'next/link'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function AdminPortalHubPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Professional SVG Icons
  const Icons = {
    Distributor: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    Retailer: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    Sales: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    Manager: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    Investor: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    Copilot: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    Company: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  }

  const personas = [
    {
      id: 'company',
      name: 'Corporate HQ',
      description: 'Centralized administration & CRM',
      icon: Icons.Company,
      href: 'company-dashboard'
    },
    {
      id: 'manager',
      name: 'Executive Cockpit',
      description: 'Strategic oversight & analytics',
      icon: Icons.Manager,
    },
    {
      id: 'investor',
      name: 'Investor Relations',
      description: 'Financial reporting & shareholder data',
      icon: Icons.Investor,
    },
    {
      id: 'sales',
      name: 'Sales Operations',
      description: 'Field sales tracking & order management',
      icon: Icons.Sales,
    },
    {
      id: 'distributor',
      name: 'Supply Chain',
      description: 'Distributor logistics & inventory',
      icon: Icons.Distributor,
    },
    {
      id: 'retailer',
      name: 'Retail Partners',
      description: 'Merchant portal & POS integration',
      icon: Icons.Retailer,
    },
    {
      id: 'copilot',
      name: 'AI Intelligence',
      description: 'Predictive analytics engine',
      icon: Icons.Copilot,
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#6B1F2B] bg-[url('/Images/noise.png')] pt-24 pb-32 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C3A35E] rounded-full filter blur-[150px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#C3A35E] rounded-full filter blur-[150px] -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header Section */}
          <div className="text-center space-y-4 relative">
            <Link 
              href={`/${locale}`}
              className="absolute -top-12 left-0 text-white/50 hover:text-[#C3A35E] flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            <div className="inline-flex items-center justify-center p-2 mb-4 bg-[#C3A35E]/10 rounded-full border border-[#C3A35E]/30 backdrop-blur-sm mt-8 md:mt-0">
              <span className="text-[#C3A35E] text-xs font-semibold tracking-widest uppercase px-4">Secure Gateway</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Harvics <span className="text-[#C3A35E]">Enterprise</span> Hub
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Centralized access point for all corporate operational dashboards. 
              Restricted to authorized personnel only.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-20 relative z-20">
        {/* Portal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {personas.map((persona) => (
            <Link
              key={persona.id}
              href={persona.href ? `/${locale}/admin/${persona.href}/` : `/${locale}/admin/portal/${persona.id}/`}
              className="group relative bg-white rounded-xl p-6 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col h-full justify-between space-y-4">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#6B1F2B] text-[#C3A35E] flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                    {persona.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#6B1F2B] transition-colors">
                    {persona.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 font-light">
                    {persona.description}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#C3A35E] tracking-wider uppercase">Launch</span>
                  <svg className="w-4 h-4 text-[#C3A35E] transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 pt-8 text-center border-t border-gray-200">
          <p className="text-gray-400 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Harvics Corporate Systems. All Rights Reserved.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Operational
          </div>
        </div>
      </div>
    </div>
  )
}

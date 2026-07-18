import Link from 'next/link'
import UnifiedLoginForm from './UnifiedLoginForm'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { LA_PRES_NAME } from '@/data/presentationAccess'
import { MEET_NAME } from '@/data/meetAccess'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'login')
}

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

const trustPoints = [
  {
    title: 'Enterprise portals',
    description: 'Distributor, supplier, and company operations in one secure environment.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    ),
  },
  {
    title: 'Global trade intelligence',
    description: 'Dashboards, analytics, and market tools across 42+ active markets.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
  },
  {
    title: 'Protected access',
    description: 'Role-based entry for partners, managers, and internal teams.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    ),
  },
]

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <main className="min-h-screen pt-[136px] bg-harvics-cream">
      <div className="max-w-harvics-layout mx-auto min-h-[calc(100vh-136px)] grid lg:grid-cols-[1fr_1.05fr]">
        {/* Brand panel */}
        <section className="relative hidden lg:flex flex-col justify-between bg-harvics-burgundy text-harvics-cream overflow-hidden border-r border-harvics-gold/20">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 20% 20%, rgba(195, 163, 94,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 90%, rgba(107,31,43,0.8) 0%, transparent 45%)',
            }}
          />
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[length:40px_40px] bg-[linear-gradient(rgba(195, 163, 94,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(195, 163, 94,0.8)_1px,transparent_1px)]" />

          <div className="relative z-10 p-12 xl:p-14">
            <p className="text-[10px] uppercase tracking-[0.32em] text-harvics-gold font-semibold mb-6">
              Harvics Global Ventures
            </p>
            <h1 className="text-4xl xl:text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-harvics-cream mb-5">
              Sign in to your
              <span className="block text-harvics-gold mt-1">enterprise workspace</span>
            </h1>
            <p className="text-sm text-harvics-cream/55 max-w-md leading-relaxed">
              Authorized partners and internal teams — access dashboards, CRM, and operational tools
              from a single secure entry point.
            </p>
          </div>

          <div className="relative z-10 p-12 xl:p-14 space-y-6 border-t border-harvics-gold/15">
            {trustPoints.map((point) => (
              <div key={point.title} className="flex gap-4">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center border border-harvics-gold/30 text-harvics-gold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {point.icon}
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-harvics-cream mb-1">{point.title}</h2>
                  <p className="text-xs text-harvics-cream/45 leading-relaxed">{point.description}</p>
                </div>
              </div>
            ))}

            <Link
              href={`/${locale}/la-pres`}
              className="block mt-4 pt-6 border-t border-harvics-gold/15 group"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-harvics-gold/70 font-semibold mb-2">
                Also available
              </p>
              <p className="text-base font-medium text-harvics-cream group-hover:text-harvics-gold transition-colors duration-300 ease-vault">
                {LA_PRES_NAME} — presentation deck access
              </p>
              <p className="text-xs text-harvics-cream/40 mt-1.5 leading-relaxed">
                For client meetings and board sessions. Programme code required.
              </p>
            </Link>

            <Link
              href={`/${locale}/meet`}
              className="block mt-4 pt-6 border-t border-harvics-gold/15 group"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-harvics-gold/70 font-semibold mb-2">
                Also available
              </p>
              <p className="text-base font-medium text-harvics-cream group-hover:text-harvics-gold transition-colors duration-300 ease-vault">
                {MEET_NAME} — live video meetings
              </p>
              <p className="text-xs text-harvics-cream/40 mt-1.5 leading-relaxed">
                Buyer &amp; supplier calls and internal sessions. Start a room, share the link.
              </p>
            </Link>
          </div>
        </section>

        {/* Form panel */}
        <section className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14 xl:px-16">
          <div className="w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
            <div className="lg:hidden mb-10 text-center">
              <p className="text-[10px] uppercase tracking-[0.28em] text-harvics-gold font-semibold mb-3">
                Enterprise sign-in
              </p>
              <h1 className="text-3xl font-semibold text-harvics-burgundy tracking-tight">
                Welcome back
              </h1>
            </div>

            <div className="hidden lg:block mb-10">
              <p className="text-[10px] uppercase tracking-[0.28em] text-harvics-gold font-semibold mb-3">
                Secure access
              </p>
              <h1 className="text-3xl font-semibold text-harvics-burgundy tracking-tight mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-harvics-muted">
                Enter your credentials to continue to your portal.
              </p>
            </div>

            <UnifiedLoginForm />

            {/* Secondary access — La Pres (not company login) */}
            <div className="mt-6 border border-harvics-gold/25 bg-harvics-burgundy/95 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 shrink-0 flex items-center justify-center border border-harvics-gold/35 text-harvics-gold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-harvics-gold/80 font-semibold mb-1.5">
                    Presentation deck
                  </p>
                  <p className="text-lg font-medium text-harvics-cream leading-snug mb-1">
                    {LA_PRES_NAME}
                  </p>
                  <p className="text-sm text-harvics-cream/45 leading-relaxed mb-4">
                    Client and board presentations — enter with your programme code, not your company
                    account.
                  </p>
                  <Link
                    href={`/${locale}/la-pres`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-harvics-gold/40 text-harvics-gold text-xs font-semibold uppercase tracking-[0.14em] hover:bg-harvics-gold/10 hover:border-harvics-gold/70 transition-all duration-300 ease-vault"
                  >
                    Enter {LA_PRES_NAME}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Secondary access — Harvics Meet (live video) */}
            <div className="mt-6 border border-harvics-gold/25 bg-harvics-burgundy/95 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 shrink-0 flex items-center justify-center border border-harvics-gold/35 text-harvics-gold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-harvics-gold/80 font-semibold mb-1.5">
                    Live meetings
                  </p>
                  <p className="text-lg font-medium text-harvics-cream leading-snug mb-1">
                    {MEET_NAME}
                  </p>
                  <p className="text-sm text-harvics-cream/45 leading-relaxed mb-4">
                    Secure video rooms for buyer &amp; supplier calls, board sessions, and internal
                    meetings. Start a room and share the link — no account needed to join.
                  </p>
                  <Link
                    href={`/${locale}/meet`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-harvics-gold/40 text-harvics-gold text-xs font-semibold uppercase tracking-[0.14em] hover:bg-harvics-gold/10 hover:border-harvics-gold/70 transition-all duration-300 ease-vault"
                  >
                    Enter {MEET_NAME}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href={`/${locale}/portals`}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-harvics-muted hover:text-harvics-burgundy transition-colors duration-300 ease-vault"
              >
                View all access options
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

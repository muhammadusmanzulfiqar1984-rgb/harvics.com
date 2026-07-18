import { Metadata } from 'next'
import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export const metadata: Metadata = {
  title: 'HPay — Settlement & Treasury | Harvics Apps',
  description:
    'Escrow wallets, FX rails and compliant settlement for cross-border corridor commerce.',
}

const FEATURES = [
  { title: 'Multi-currency wallets', desc: 'Hold and route value across corridor currencies.', icon: '💳' },
  { title: 'Escrow', desc: 'Release on milestone — buyer and supplier aligned.', icon: '🔒' },
  { title: 'FX rails', desc: 'Quote, hedge, and settle without guesswork.', icon: '💱' },
  { title: 'Compliance', desc: 'KYC/AML checks wired into payment flows.', icon: '✓' },
  { title: 'Trade finance', desc: 'LC and documentary instruments on the desk.', icon: '📜' },
  { title: 'Reconciliation', desc: 'Match bank, ledger, and shipment events.', icon: '🔄' },
]

export default async function HPayAppPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <main className="min-h-screen bg-gradient-to-b from-harvics-cream to-white">
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A3A5C] to-harvics-gold flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            H
          </div>
          <div>
            <span className="inline-block px-3 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 mb-1">
              Coming soon
            </span>
            <h1 className="text-3xl font-bold text-harvics-burgundy">HPay</h1>
          </div>
        </div>
        <p className="text-lg text-gray-700 max-w-2xl mb-10">
          Digital payments and treasury for Harvics corridor operators. This is the product page — the
          live wallet opens at launch with invite-only access from the app store.
        </p>

        <div className="flex flex-wrap gap-4 mb-16">
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-harvics-burgundy text-white font-semibold shadow-md hover:opacity-90 transition"
          >
            Submit interest →
          </Link>
          <Link
            href={`/${locale}/apps`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-harvics-burgundy/20 text-harvics-burgundy font-semibold hover:bg-harvics-burgundy/5 transition"
          >
            ← Back to Apps
          </Link>
        </div>

        <h2 className="text-xl font-bold text-harvics-burgundy mb-6">Planned capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-harvics-burgundy mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

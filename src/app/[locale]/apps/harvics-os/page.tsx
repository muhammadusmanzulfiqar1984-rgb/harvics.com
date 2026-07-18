import { Metadata } from 'next'
import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export const metadata: Metadata = {
  title: 'Harvics OS — Customs & Logistics Intelligence | Harvics Apps',
  description: 'Enterprise-grade customs and logistics intelligence dashboard for the UK–GCC corridor. Real-time tracking, HS classification, trade finance, and AI governance.',
}

const FEATURES = [
  { title: 'Live Logistics Map', desc: 'Track shipments in real-time across UK–GCC, UK–EU, and GCC–Asia corridors with D3 visualization.', icon: '🗺️' },
  { title: 'HS Code Repository', desc: 'Filterable classification database with AI-powered document extraction and CSV export.', icon: '📋' },
  { title: 'Neural Governance', desc: 'AI analyzes shipments and HS codes for compliance risks — writes immutable audit logs.', icon: '🧠' },
  { title: 'Trade Finance (HPay)', desc: 'Settlement tracking for LC, TT, USDT Rail, and 3-Way Match with visual charts.', icon: '💳' },
  { title: 'Invoice Scanner', desc: 'Upload BOL or invoice — Gemini extracts structured data and saves to your repository.', icon: '📄' },
  { title: 'Multi-Language', desc: 'Full i18n: English, Arabic, French, German, Spanish, Italian with RTL support.', icon: '🌐' },
]

export default function HarvicsOsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white">
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-harvics-burgundy to-harvics-gold flex items-center justify-center text-white text-2xl font-bold shadow-lg">OS</div>
          <div>
            <span className="inline-block px-3 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 mb-1">Beta</span>
            <h1 className="text-3xl font-bold text-harvics-burgundy">Harvics OS</h1>
          </div>
        </div>
        <p className="text-lg text-gray-700 max-w-2xl mb-10">
          Enterprise-grade customs and logistics intelligence for the UK–GCC trade corridor. Real-time shipment tracking, AI-powered compliance governance, and integrated trade finance — all in one command center.
        </p>

        <div className="flex gap-4 mb-16">
          <a
            href="/launch/harvics-os"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-harvics-burgundy text-white font-semibold shadow-md hover:bg-[#5a1824] transition"
          >
            Launch App ↗
          </a>
          <Link
            href="/en/apps"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-harvics-burgundy/20 text-harvics-burgundy font-semibold hover:bg-harvics-burgundy/5 transition"
          >
            ← Back to Apps
          </Link>
        </div>

        <h2 className="text-xl font-bold text-harvics-burgundy mb-6">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-harvics-burgundy mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-2xl bg-harvics-burgundy/5 border border-harvics-burgundy/10">
          <h3 className="font-bold text-harvics-burgundy mb-2">Tech Stack</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {['React 19', 'Firebase', 'Gemini AI', 'D3.js', 'Google Maps', 'Recharts', 'i18next', 'Tailwind CSS 4'].map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">{t}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

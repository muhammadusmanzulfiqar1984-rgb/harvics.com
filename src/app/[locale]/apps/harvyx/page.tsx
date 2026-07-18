import { Metadata } from 'next'
import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export const metadata: Metadata = {
  title: 'HarvyX — Growth OS | Harvics Apps',
  description:
    'B2B lead intelligence, outreach sequences, reply desk and verified data bank for corridor operators.',
}

const FEATURES = [
  {
    title: 'Lead discovery',
    desc: 'Search and qualify distributors across GCC and emerging markets.',
    icon: '🎯',
  },
  {
    title: 'Outreach sequences',
    desc: 'Multi-step campaigns with templates and send tracking.',
    icon: '✉️',
  },
  {
    title: 'Data bank',
    desc: 'Verified contacts and enrichment pipeline for operator desks.',
    icon: '🗄️',
  },
  {
    title: 'Reply desk',
    desc: 'Classify replies and route hot leads back to the corridor.',
    icon: '📥',
  },
  {
    title: 'ICP scoring',
    desc: 'Prioritize accounts that match your corridor profile.',
    icon: '📊',
  },
  {
    title: 'Exports & audit',
    desc: 'CSV/PDF exports with immutable activity logs.',
    icon: '📎',
  },
]

export default async function HarvyXAppPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <main className="min-h-screen bg-gradient-to-b from-harvics-cream to-white">
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-harvics-burgundy to-harvics-gold flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            X
          </div>
          <div>
            <span className="inline-block px-3 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-900 mb-1">
              Live
            </span>
            <h1 className="text-3xl font-bold text-harvics-burgundy">
              Harvy<span className="text-harvics-gold">X</span>
            </h1>
          </div>
        </div>
        <p className="text-lg text-gray-700 max-w-2xl mb-10">
          Sovereign B2B growth OS for Harvics operators — lead intelligence, outreach, and a live data
          bank. Open the console only after you enter your ops access code on the next step.
        </p>

        <div className="flex flex-wrap gap-4 mb-16">
          <Link
            href={`/${locale}/harvyx/console`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-harvics-burgundy text-white font-semibold shadow-md hover:opacity-90 transition"
          >
            Launch console →
          </Link>
          <Link
            href={`/${locale}/apps`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-harvics-burgundy/20 text-harvics-burgundy font-semibold hover:bg-harvics-burgundy/5 transition"
          >
            ← Back to Apps
          </Link>
        </div>

        <h2 className="text-xl font-bold text-harvics-burgundy mb-6">Capabilities</h2>
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
          <h3 className="font-bold text-harvics-burgundy mb-2">Access</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Public links from the homepage and app store land here first. The live console requires an
            ops access code — it does not open from marketing CTAs without that step.
          </p>
        </div>
      </section>
    </main>
  )
}

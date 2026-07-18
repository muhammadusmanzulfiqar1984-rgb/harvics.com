import { Metadata } from 'next'
import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export const metadata: Metadata = {
  title: 'Vatify OS — VAT Expense Management | Harvics Apps',
  description: 'Premium VAT-ready expense management for European freelancers. AI-powered receipt scanning, multi-country VAT rates, and automated tax reports.',
}

const FEATURES = [
  { title: 'AI Receipt Scanner', desc: 'Snap a receipt — AI extracts merchant, amount, VAT, and category instantly.', icon: '📸' },
  { title: 'Multi-Country VAT', desc: 'Pre-loaded rates for UK, Germany, Nordics, Poland, and France with auto-calculation.', icon: '🇪🇺' },
  { title: 'Smart Categorization', desc: 'Expenses auto-categorized with duplicate detection and compliance flagging.', icon: '🏷️' },
  { title: 'Tax Reports', desc: 'One-click PDF and CSV exports for quarterly VAT filing.', icon: '📊' },
  { title: 'AI Concierge', desc: 'Ask tax questions in natural language — get jurisdiction-specific answers.', icon: '💬' },
  { title: 'Voice Input', desc: 'Dictate expenses hands-free with Whisper transcription.', icon: '🎙️' },
]

export default function VatifyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white">
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-harvics-burgundy to-harvics-gold flex items-center justify-center text-white text-2xl font-bold shadow-lg">V</div>
          <div>
            <span className="inline-block px-3 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 mb-1">Live Beta</span>
            <h1 className="text-3xl font-bold text-harvics-burgundy">Vatify OS</h1>
          </div>
        </div>
        <p className="text-lg text-gray-700 max-w-2xl mb-10">
          Premium VAT-ready expense management for European freelancers. Powered by AI receipt extraction, multi-country compliance, and one-click tax reporting.
        </p>

        <div className="flex gap-4 mb-16">
          <a
            href="/launch/vatify"
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
            {['React 19', 'Tailwind CSS 4', 'Groq AI', 'Whisper STT', 'SQLite', 'Express', 'jsPDF'].map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">{t}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

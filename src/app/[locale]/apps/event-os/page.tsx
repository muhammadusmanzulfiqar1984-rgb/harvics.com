import { Metadata } from 'next'
import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export const metadata: Metadata = {
  title: 'Harvics Event OS — B2B Event Platform | Harvics Apps',
  description: 'White-label B2B event discovery and networking platform for trade fairs, conferences, and exhibitions with AI concierge.',
}

const FEATURES = [
  { title: 'Event Discovery', desc: 'Browse upcoming trade fairs, conferences, and exhibitions with rich exhibitor profiles.', icon: '🎪' },
  { title: 'AI Concierge', desc: 'Ask about exhibitors, schedule, or venue — get instant AI-powered answers with voice.', icon: '🤖' },
  { title: 'QR Badge Scanner', desc: 'Scan attendee badges to collect leads and bookmark exhibitors instantly.', icon: '📱' },
  { title: 'Smart Agenda', desc: 'Build your personal schedule, bookmark sessions, and get reminders.', icon: '📅' },
  { title: 'Networking', desc: 'Discover attendees, send direct messages, and share your live location.', icon: '🤝' },
  { title: 'Multi-Language', desc: 'Interface available in 8 languages with AI concierge multilingual support.', icon: '🌍' },
]

export default function EventOsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white">
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3D1212] to-[#C3A35E] flex items-center justify-center text-white text-2xl font-bold shadow-lg">E</div>
          <div>
            <span className="inline-block px-3 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 mb-1">Beta</span>
            <h1 className="text-3xl font-bold text-[#3D1212]">Harvics Event OS</h1>
          </div>
        </div>
        <p className="text-lg text-gray-700 max-w-2xl mb-10">
          A premium B2B white-label event discovery and networking platform. Built for trade fairs, conferences, and exhibitions — with AI-powered concierge and real-time attendee networking.
        </p>

        <div className="flex gap-4 mb-16">
          <a
            href="/apps/event-os/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3D1212] text-white font-semibold shadow-md hover:bg-[#5a1824] transition"
          >
            Launch App ↗
          </a>
          <Link
            href="/en/apps"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#3D1212]/20 text-[#3D1212] font-semibold hover:bg-[#3D1212]/5 transition"
          >
            ← Back to Apps
          </Link>
        </div>

        <h2 className="text-xl font-bold text-[#3D1212] mb-6">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-[#3D1212] mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-2xl bg-[#3D1212]/5 border border-[#3D1212]/10">
          <h3 className="font-bold text-[#3D1212] mb-2">Tech Stack</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {['React 19', 'Firebase Auth', 'Cloud Firestore', 'Gemini AI', 'TTS', 'QR Scanner', 'Tailwind CSS 4'].map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">{t}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

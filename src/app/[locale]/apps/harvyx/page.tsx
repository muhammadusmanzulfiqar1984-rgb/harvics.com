import { Metadata } from 'next'
import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export const metadata: Metadata = {
  title: 'HarvyX — Growth OS | Harvics Apps',
  description:
    'B2B lead intelligence, outreach, and a verified data bank for corridor operators.',
}

export default async function HarvyXAppPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <main className="min-h-screen bg-gradient-to-b from-harvics-cream to-white">
      <section className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-harvics-gold mb-4">
          Harvics Apps
        </p>
        <h1 className="text-4xl font-bold text-harvics-burgundy tracking-tight mb-4">
          Harvy<span className="text-harvics-gold">X</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-xl">
          Operator console for leads, outreach sequences, and the verified data bank.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/harvyx`}
            className="inline-flex items-center px-7 py-3.5 rounded-md bg-harvics-burgundy text-white font-semibold hover:opacity-90 transition"
          >
            Sign in
          </Link>
          <Link
            href={`/app/sign-up?redirect_url=${encodeURIComponent('/harvyx.html')}`}
            className="inline-flex items-center px-7 py-3.5 rounded-md border border-harvics-burgundy/30 text-harvics-burgundy font-semibold hover:bg-harvics-burgundy/5 transition"
          >
            Create account
          </Link>
        </div>

        <ul className="mt-16 space-y-3 text-sm text-gray-600 border-t border-harvics-burgundy/10 pt-10">
          <li>Lead discovery &amp; ICP scoring</li>
          <li>Outreach sequences &amp; reply desk</li>
          <li>Verified contact data bank</li>
        </ul>

        <p className="mt-10">
          <Link href={`/${locale}/apps`} className="text-sm text-harvics-burgundy/60 hover:text-harvics-burgundy">
            ← All apps
          </Link>
        </p>
      </section>
    </main>
  )
}

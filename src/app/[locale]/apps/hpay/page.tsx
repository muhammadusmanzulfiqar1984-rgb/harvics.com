import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { getHPayAppUrl } from '@/lib/hpay'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export const metadata = {
  title: 'HPay — Settlement & Treasury | Harvics Apps',
  description:
    'Escrow wallets, FX rails and corridor settlement. Sign in or create an HPay account to open the live desk.',
}

export default async function HPayAppPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const launchUrl = getHPayAppUrl()

  return (
    <main className="fixed inset-0 z-[80] bg-[#1a0a0e] flex flex-col">
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-harvics-gold/20 bg-[#1a0a0e]/95 backdrop-blur-sm">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.22em] text-harvics-gold font-bold">
            Harvics · Settlement · HPay
          </p>
          <h1 className="text-sm md:text-base font-semibold text-white truncate">
            HPay — Treasury & Payments
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href={`/${locale}/apps`}
            className="inline-flex items-center justify-center px-4 py-2 border border-harvics-gold/40 text-harvics-gold text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-harvics-gold/10 transition-colors"
          >
            ← Apps
          </Link>
          <a
            href={launchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-harvics-gold text-[#1a0d00] text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-[#d4b46e] transition-colors"
          >
            Full Screen
          </a>
        </div>
      </header>
      <iframe
        title="HPay — Settlement & Treasury"
        src={launchUrl}
        className="flex-1 w-full border-0 bg-[#1a0a0e]"
        allow="clipboard-write; fullscreen; payment"
        referrerPolicy="no-referrer"
      />
    </main>
  )
}

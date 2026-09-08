import type { ReactNode } from 'react'
import './globals.css'
import Link from 'next/link'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Harvics Meet',
  description: 'Secure meetings · invites · AI notes',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-meet-border/60 bg-meet-bg/90 px-4 py-3 backdrop-blur md:px-6">
            <Link href="/" className="text-sm font-semibold tracking-wide">
              <span className="text-meet-gold">Harvics</span> Meet
            </Link>
            <nav className="flex gap-3 text-xs uppercase tracking-[0.14em] text-white/60">
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
              <Link href="/schedule" className="hover:text-white">
                Schedule
              </Link>
              <Link href="/login" className="hover:text-white">
                Login
              </Link>
            </nav>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  )
}

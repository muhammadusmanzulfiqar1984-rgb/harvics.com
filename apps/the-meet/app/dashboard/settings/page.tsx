import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-meet-gold">Settings</p>
      <h1 className="mt-1 text-2xl font-semibold">Account</h1>
      <div className="mt-6 space-y-3 rounded-xl border border-meet-border bg-meet-panel p-5 text-sm">
        <p>
          <span className="text-white/45">Signed in as</span>
          <br />
          {session?.user?.email || 'Not signed in'}
        </p>
        <p className="text-white/45">{session?.user?.name || '—'}</p>
        {!session && (
          <Link href="/login" className="inline-block text-meet-gold hover:underline">
            Sign in
          </Link>
        )}
      </div>
    </main>
  )
}

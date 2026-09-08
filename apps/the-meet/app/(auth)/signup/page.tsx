'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email,
      name: name || email.split('@')[0],
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    router.push('/dashboard')
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-meet-gold">Auth</p>
      <h1 className="mt-1 text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-2xl border border-meet-border bg-meet-panel p-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Work email"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-meet-gold py-3 text-xs font-bold uppercase tracking-wider text-[#1a0d00] disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Get started'}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-white/45">
        Already have an account? <Link href="/login" className="text-meet-gold hover:underline">Sign in</Link>
      </p>
    </main>
  )
}

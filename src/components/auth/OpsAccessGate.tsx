'use client'

import React, { useCallback, useEffect, useState } from 'react'

const SESSION_KEY = 'harvics_ops_unlocked'

type Props = {
  title: string
  subtitle: string
  children: React.ReactNode
}

export default function OpsAccessGate({ title, subtitle, children }: Props) {
  const [checking, setChecking] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const checkAccess = useCallback(async () => {
    try {
      const res = await fetch('/api/harvyx/access', { credentials: 'include' })
      const data = await res.json()
      if (data.ok) {
        try {
          sessionStorage.setItem(SESSION_KEY, 'true')
        } catch {
          /* ignore */
        }
        setUnlocked(true)
        return true
      }
      if (!data.required) {
        setUnlocked(true)
        return true
      }
    } catch {
      /* fall through to gate */
    }
    return false
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (sessionStorage.getItem(SESSION_KEY) === 'true') {
          const ok = await checkAccess()
          if (ok && !cancelled) {
            setUnlocked(true)
            setChecking(false)
            return
          }
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) {
        const ok = await checkAccess()
        if (!ok && !cancelled) setUnlocked(false)
        setChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [checkAccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/harvyx/access', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: input.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error || 'Invalid access code')
        setInput('')
        return
      }
      try {
        sessionStorage.setItem(SESSION_KEY, 'true')
      } catch {
        /* ignore */
      }
      setUnlocked(true)
    } catch {
      setError('Could not verify code. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="w-full flex justify-center py-16">
        <p className="text-xs uppercase tracking-[0.24em] text-harvics-gold/70">Checking access…</p>
      </div>
    )
  }

  if (unlocked) return <>{children}</>

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="p-10 text-center"
        style={{ background: 'rgba(255,252,247,0.06)', border: '1px solid rgba(195, 163, 94,0.35)' }}
      >
        <div
          className="w-16 h-16 mx-auto flex items-center justify-center mb-4"
          style={{ background: 'rgba(107,31,43,0.35)', border: '1px solid rgba(195, 163, 94,0.35)' }}
        >
          <span className="text-2xl" aria-hidden="true">
            🔐
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-harvics-gold font-semibold mb-2">
          Harvics Ops
        </p>
        <h2 className="text-2xl font-semibold mb-2 text-white">{title}</h2>
        <p className="text-sm text-white/50 mb-6 leading-relaxed">{subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError(null)
            }}
            placeholder="Access code"
            autoFocus
            autoComplete="off"
            className="w-full px-4 py-3 text-center text-lg tracking-[0.12em] font-mono outline-none"
            style={{
              background: 'rgba(255,252,247,0.08)',
              border: error ? '2px solid #e53e3e' : '1px solid rgba(195, 163, 94,0.35)',
              color: '#FFFCF7',
            }}
          />
          {error && (
            <p className="text-xs" style={{ color: '#ffb4b4' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="w-full py-3 text-sm font-bold tracking-[0.12em] uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--harvics-burgundy)', color: '#FFFCF7', border: '1px solid #C3A35E' }}
          >
            {submitting ? 'Verifying…' : 'Unlock →'}
          </button>
        </form>

        <p className="text-[10px] mt-6 tracking-wide text-white/30">INVITE ONLY · HARVICS GLOBAL VENTURES</p>
      </div>
    </div>
  )
}

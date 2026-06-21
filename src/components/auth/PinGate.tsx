'use client'

import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'harvics_apps_unlocked'
const PIN = 'harvics2026'

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
        setUnlocked(true)
      }
    } catch {}
  }, [])

  if (unlocked) return <>{children}</>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === PIN) {
      try { sessionStorage.setItem(STORAGE_KEY, 'true') } catch {}
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #6B1F2B 0%, #1a0a0e 100%)' }}
    >
      <div className="w-full max-w-md mx-4">
        <div
          className="p-10 text-center"
          style={{ background: '#fff', border: '1px solid rgba(195,163,94,0.3)' }}
        >
          <div className="mb-6">
            <div
              className="w-16 h-16 mx-auto flex items-center justify-center mb-4"
              style={{ background: '#F5F0E8', border: '1px solid rgba(195,163,94,0.3)' }}
            >
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#6B1F2B' }}>
              Harvics App Store
            </h1>
            <p className="text-sm" style={{ color: '#9a8070' }}>
              Enter the access code to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(false) }}
                placeholder="Access Code"
                autoFocus
                className="w-full px-4 py-3 text-center text-lg tracking-[0.15em] font-mono outline-none transition-all"
                style={{
                  background: '#F5F0E8',
                  border: error ? '2px solid #e53e3e' : '1px solid rgba(195,163,94,0.3)',
                  color: '#6B1F2B',
                }}
              />
              {error && (
                <p className="text-xs mt-2" style={{ color: '#e53e3e' }}>
                  Invalid code. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm font-bold tracking-[0.12em] uppercase transition-all duration-300 hover:opacity-90"
              style={{ background: '#6B1F2B', color: '#fff' }}
            >
              Unlock Apps →
            </button>
          </form>

          <p className="text-[10px] mt-6 tracking-wide" style={{ color: '#9a8070' }}>
            HARVICS GLOBAL VENTURES — INVITE ONLY
          </p>
        </div>
      </div>
    </div>
  )
}

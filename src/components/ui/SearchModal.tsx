'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

interface Source {
  url: string
  title: string
}

interface QuickLink {
  title: string
  description: string
  url: string
}

const QUICK_LINKS: QuickLink[] = [
  { title: 'HarvicTrade', description: 'B2B marketplace', url: '/harvictrade' },
  { title: 'About Us', description: 'Learn about Harvics', url: '/about' },
  { title: 'Portals', description: 'Distributor & supplier access', url: '/portals' },
  { title: 'Contact', description: 'Get in touch', url: '/contact' },
  { title: 'Products', description: 'Browse products', url: '/products' },
  { title: 'Login', description: 'Sign in to your workspace', url: '/login' },
]

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const locale = useLocale()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (!isOpen) {
      setSearchQuery('')
      setAnswer(null)
      setSources([])
      setError(null)
      setLoading(false)
      abortRef.current?.abort()
    }
  }, [isOpen])

  // Debounced AI Search against the live site index
  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setAnswer(null)
      setSources([])
      setError(null)
      setLoading(false)
      abortRef.current?.abort()
      return
    }

    setLoading(true)
    setError(null)
    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
          signal: ctrl.signal,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data?.hint || data?.error || 'Search failed')
          setAnswer(null)
          setSources([])
        } else {
          setAnswer((data?.answer || '').trim() || null)
          setSources(Array.isArray(data?.sources) ? data.sources : [])
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError('Could not reach search. Try again.')
          setAnswer(null)
          setSources([])
        }
      } finally {
        setLoading(false)
      }
    }, 450)

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [searchQuery])

  const goTo = (url: string) => {
    // Absolute external URLs (from AI Search sources) vs relative site paths
    if (/^https?:\/\//i.test(url)) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      router.push(`/${locale}${url.startsWith('/') ? url : `/${url}`}`)
    }
    onClose()
    setSearchQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      setSearchQuery('')
    } else if (e.key === 'Enter' && sources.length > 0) {
      goTo(sources[0].url)
    }
  }

  if (!isOpen) return null

  const q = searchQuery.trim()
  const quickMatches =
    q.length === 0
      ? QUICK_LINKS
      : QUICK_LINKS.filter(
          (l) =>
            l.title.toLowerCase().includes(q.toLowerCase()) ||
            l.description.toLowerCase().includes(q.toLowerCase()),
        )

  return (
    <>
      <div className="fixed inset-0 bg-black/55 z-[100]" onClick={onClose} />

      <div className="fixed inset-x-0 top-20 mx-auto max-w-2xl z-[101] px-4">
        <div
          className="overflow-hidden border border-harvics-gold/35 shadow-2xl"
          style={{ background: 'var(--harvics-cream)' }}
        >
          {/* Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-harvics-gold/25 bg-white">
            <svg className="w-5 h-5 text-harvics-gold mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Harvics — products, industries, HarvicTrade…"
              className="flex-1 outline-none bg-transparent text-harvics-burgundy placeholder:text-harvics-burgundy/40 text-sm"
            />
            {loading && (
              <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-harvics-gold font-semibold shrink-0">
                Searching…
              </span>
            )}
            {searchQuery && !loading && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="ml-2 text-harvics-burgundy/40 hover:text-harvics-burgundy shrink-0"
                aria-label="Clear"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {/* AI answer */}
            {q.length >= 2 && (answer || error || loading) && (
              <div className="px-4 py-4 border-b border-harvics-gold/20 bg-white/60">
                <p className="text-[10px] uppercase tracking-[0.18em] text-harvics-gold font-semibold mb-2">
                  Ask Harvics
                </p>
                {loading && !answer && (
                  <p className="text-sm text-harvics-burgundy/50">Looking across the site…</p>
                )}
                {error && !loading && (
                  <p className="text-sm text-red-700/90">{error}</p>
                )}
                {answer && (
                  <p className="text-sm text-harvics-burgundy leading-relaxed whitespace-pre-wrap">{answer}</p>
                )}
              </div>
            )}

            {/* Source pages from AI Search */}
            {sources.length > 0 && (
              <div className="py-2 border-b border-harvics-gold/20">
                <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-harvics-gold font-semibold">
                  Pages
                </p>
                {sources.map((s) => (
                  <button
                    key={s.url}
                    type="button"
                    onClick={() => goTo(s.url)}
                    className="w-full text-left px-4 py-3 hover:bg-harvics-gold/10 transition-colors border-b border-harvics-gold/10 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-harvics-burgundy truncate">{s.title}</h4>
                        <p className="text-xs text-harvics-burgundy/45 mt-0.5 truncate">{s.url}</p>
                      </div>
                      <svg className="w-4 h-4 text-harvics-gold mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Quick links (always available / filtered) */}
            {quickMatches.length > 0 && (
              <div className="py-2">
                <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-harvics-gold font-semibold">
                  {q.length === 0 ? 'Quick links' : 'Shortcuts'}
                </p>
                {quickMatches.map((link) => (
                  <button
                    key={link.url}
                    type="button"
                    onClick={() => goTo(link.url)}
                    className="w-full text-left px-4 py-3 hover:bg-harvics-gold/10 transition-colors border-b border-harvics-gold/10 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-harvics-burgundy">{link.title}</h4>
                        <p className="text-xs text-harvics-burgundy/45 mt-0.5">{link.description}</p>
                      </div>
                      <svg className="w-4 h-4 text-harvics-gold mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {q.length >= 2 && !loading && !answer && !error && sources.length === 0 && quickMatches.length === 0 && (
              <div className="px-4 py-8 text-center text-harvics-burgundy/50 text-sm">
                No results for “{searchQuery}”
              </div>
            )}

            {q.length === 0 && (
              <p className="px-4 py-3 text-center text-[11px] text-harvics-burgundy/35">
                Press Esc to close · Powered by Cloudflare AI Search
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

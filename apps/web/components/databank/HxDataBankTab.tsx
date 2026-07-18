'use client'

/**
 * HxDataBankTab.tsx — HarvyX Data Bank live dashboard tab
 * Source: HARVYX_REPORTING_WIRE.md § 6, § 3
 *
 * Design system: SupremeNavBar.tsx — Fraunces + Spline Sans, CSS tokens only.
 * Tokens: --harvics-burgundy (#3D1212), --harvics-gold (#C3A35E),
 *         --harvics-cream (#F5F0E8), --harvics-dark (#0D0D0D)
 *
 * Data: GET /api/v1/databank/summary  (initial load)
 *       GET /api/v1/feed              (SSE — live feed)
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface DataBankSummary {
  totals: {
    contacts:          number
    companies:         number
    email_verified:    number
    enriched_apollo:   number
    enriched_lusha:    number
    in_nurture_pool:   number
    sequence_enrolled: number
  }
  by_band: {
    lusha_tier:  number
    apollo_tier: number
    nurture:     number
  }
  by_vertical: Array<{ vertical: string; count: number }>
  by_source:   Array<{ source: string;   count: number }>
  recent_runs: Array<{
    id:         string
    source:     string
    status:     string
    scraped:    number
    ingested:   number
    started_at: string
  }>
}

interface FeedMessage {
  id:         string
  event_type: string
  dot_color:  'green' | 'blue' | 'purple' | 'gold' | 'orange' | 'red' | 'teal' | 'yellow' | 'grey'
  icon:       string
  text:       string
  priority:   'high' | 'normal' | 'low'
  entity_id:  string | null
  ts:         string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const API_BASE     = process.env['NEXT_PUBLIC_HX_API_URL'] ?? '/api/v1'
const FEED_MAX     = 40   // max feed items to retain
const POLL_INTERVAL_MS = 60_000   // re-fetch summary every 60 s

// ── Dot color → CSS token map ──────────────────────────────────────────────────

const DOT_COLORS: Record<FeedMessage['dot_color'], string> = {
  green:  '#22c55e',
  blue:   '#3b82f6',
  purple: '#a855f7',
  gold:   'var(--harvics-gold)',
  orange: '#f97316',
  red:    '#ef4444',
  teal:   '#14b8a6',
  yellow: '#eab308',
  grey:   '#6b7280',
}

// ── Utility: relative time ─────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000)  return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatSource(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, highlight = false,
}: {
  label: string
  value: number | string
  sub?:  string
  highlight?: boolean
}) {
  return (
    <div style={{
      padding:      '20px 24px',
      background:   highlight ? 'var(--harvics-burgundy)' : 'var(--harvics-cream)',
      border:       `1px solid ${highlight ? 'var(--harvics-burgundy)' : 'rgba(195,163,94,0.18)'}`,
      display:      'flex',
      flexDirection: 'column',
      gap:          '6px',
      position:     'relative',
      overflow:     'hidden',
    }}>
      {highlight && (
        <span style={{
          position:   'absolute', top: 0, left: 0,
          width:      '3px', height: '100%',
          background: 'var(--harvics-gold)',
        }} />
      )}
      <span style={{
        fontFamily:    'var(--font-spline-sans, "Spline Sans", system-ui)',
        fontSize:      '10px',
        fontWeight:    600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color:         highlight ? 'rgba(255,255,255,0.6)' : 'var(--harvics-muted, #8A7D6B)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily:  'var(--font-fraunces, "Fraunces", serif)',
        fontSize:    '28px',
        fontWeight:  700,
        lineHeight:  1,
        color:       highlight ? '#fff' : 'var(--harvics-burgundy)',
      }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      {sub && (
        <span style={{
          fontFamily: 'var(--font-spline-sans, "Spline Sans", system-ui)',
          fontSize:   '11px',
          color:      highlight ? 'rgba(255,255,255,0.5)' : 'var(--harvics-muted, #8A7D6B)',
        }}>
          {sub}
        </span>
      )}
    </div>
  )
}

function ProgressBar({
  label, value, max, color = 'var(--harvics-gold)',
}: {
  label: string
  value: number
  max:   number
  color?: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontFamily:    'var(--font-spline-sans, "Spline Sans", system-ui)',
          fontSize:      '12px',
          fontWeight:    500,
          color:         'var(--harvics-burgundy)',
          textTransform: 'capitalize',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--font-fraunces, "Fraunces", serif)',
          fontSize:   '13px',
          fontWeight: 600,
          color:      'var(--harvics-burgundy)',
        }}>
          {value.toLocaleString()}
          <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--harvics-muted, #8A7D6B)', marginLeft: '4px' }}>
            ({pct}%)
          </span>
        </span>
      </div>
      <div style={{
        height:     '4px',
        background: 'rgba(195,163,94,0.15)',
        overflow:   'hidden',
      }}>
        <div style={{
          height:     '100%',
          width:      `${pct}%`,
          background: color,
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  )
}

function FeedItem({ item, isNew }: { item: FeedMessage; isNew: boolean }) {
  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'flex-start',
        gap:          '10px',
        padding:      '10px 12px',
        background:   isNew ? 'rgba(195,163,94,0.06)' : 'transparent',
        borderLeft:   isNew ? '2px solid var(--harvics-gold)' : '2px solid transparent',
        transition:   'background 0.8s ease, border-color 0.8s ease',
        animation:    isNew ? 'hx-slide-in 0.3s ease-out' : 'none',
      }}
    >
      <span style={{
        marginTop:   '2px',
        width:       '8px',
        height:      '8px',
        minWidth:    '8px',
        borderRadius: '50%',
        background:  DOT_COLORS[item.dot_color],
        boxShadow:   item.priority === 'high' ? `0 0 6px ${DOT_COLORS[item.dot_color]}` : 'none',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontFamily:  'var(--font-spline-sans, "Spline Sans", system-ui)',
          fontSize:    '12px',
          fontWeight:  item.priority === 'high' ? 600 : 400,
          color:       'var(--harvics-burgundy)',
          lineHeight:  1.4,
          display:     'block',
        }}>
          {item.icon} {item.text}
        </span>
        <span style={{
          fontFamily: 'var(--font-spline-sans, "Spline Sans", system-ui)',
          fontSize:   '10px',
          color:      'var(--harvics-muted, #8A7D6B)',
          marginTop:  '2px',
          display:    'block',
        }}>
          {relativeTime(item.ts)}
          {item.entity_id && (
            <span style={{ marginLeft: '6px', opacity: 0.6 }}>
              · {item.entity_id.slice(0, 8)}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily:    'var(--font-spline-sans, "Spline Sans", system-ui)',
      fontSize:      '10px',
      fontWeight:    700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color:         'var(--harvics-gold)',
      margin:        '0 0 16px 0',
      paddingBottom: '8px',
      borderBottom:  '1px solid rgba(195,163,94,0.18)',
    }}>
      {children}
    </h3>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface HxDataBankTabProps {
  token?: string   // JWT — if omitted, reads from localStorage 'hx_token'
}

export default function HxDataBankTab({ token }: HxDataBankTabProps) {
  const [summary,  setSummary]  = useState<DataBankSummary | null>(null)
  const [feedItems, setFeedItems] = useState<FeedMessage[]>([])
  const [newIds,   setNewIds]   = useState<Set<string>>(new Set())
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

  const feedRef    = useRef<HTMLDivElement>(null)
  const esRef      = useRef<EventSource | null>(null)
  const pollTimer  = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Resolve token ─────────────────────────────────────────────────────────

  const resolveToken = useCallback((): string => {
    if (token) return token
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hx_token') ?? ''
    }
    return ''
  }, [token])

  // ── Fetch summary ─────────────────────────────────────────────────────────

  const fetchSummary = useCallback(async () => {
    const jwt = resolveToken()
    try {
      const res = await fetch(`${API_BASE}/databank/summary`, {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.success) setSummary(json.data)
      else setError(json.error ?? 'Failed to load summary')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [resolveToken])

  // ── SSE subscription ──────────────────────────────────────────────────────

  const connectSSE = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    const jwt = resolveToken()
    const url = `${API_BASE}/feed${jwt ? `?token=${encodeURIComponent(jwt)}` : ''}`

    const es = new EventSource(url)
    esRef.current = es
    setSseStatus('connecting')

    es.addEventListener('connected', () => {
      setSseStatus('connected')
    })

    es.addEventListener('feed', (evt: MessageEvent) => {
      try {
        const item = JSON.parse(evt.data) as FeedMessage

        setFeedItems(prev => {
          const next = [item, ...prev].slice(0, FEED_MAX)
          return next
        })

        setNewIds(prev => {
          const n = new Set(prev)
          n.add(item.id)
          return n
        })

        // Clear 'new' highlight after 4 s
        setTimeout(() => {
          setNewIds(prev => {
            const n = new Set(prev)
            n.delete(item.id)
            return n
          })
        }, 4_000)

        // Auto-scroll feed to top on high-priority items
        if (item.priority === 'high' && feedRef.current) {
          feedRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } catch { /* ignore malformed */ }
    })

    es.onerror = () => {
      setSseStatus('error')
      es.close()
      esRef.current = null
      // Reconnect after 8 s
      setTimeout(connectSSE, 8_000)
    }
  }, [resolveToken])

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchSummary()
    connectSSE()

    // Poll summary every 60 s to keep metrics fresh
    pollTimer.current = setInterval(fetchSummary, POLL_INTERVAL_MS)

    return () => {
      esRef.current?.close()
      if (pollTimer.current) clearInterval(pollTimer.current)
    }
  }, [fetchSummary, connectSSE])

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <span style={{
          fontFamily:    'var(--font-spline-sans, "Spline Sans", system-ui)',
          fontSize:      '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color:         'var(--harvics-muted, #8A7D6B)',
        }}>
          Loading Data Bank…
        </span>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-spline-sans, "Spline Sans", system-ui)',
          fontSize:   '13px',
          color:      '#ef4444',
        }}>
          {error ?? 'No data available'}
        </span>
      </div>
    )
  }

  const totalContacts = summary.totals.contacts || 1  // avoid /0

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Keyframes ────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes hx-slide-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hx-pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      <div style={{
        fontFamily: 'var(--font-spline-sans, "Spline Sans", system-ui)',
        color:      'var(--harvics-burgundy)',
        display:    'flex',
        flexDirection: 'column',
        gap:        '32px',
      }}>

        {/* ── Header row ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-fraunces, "Fraunces", serif)',
              fontSize:   '20px',
              fontWeight: 700,
              color:      'var(--harvics-burgundy)',
              margin:     0,
            }}>
              Data Bank
            </h2>
            <p style={{
              fontSize:  '11px',
              color:     'var(--harvics-muted, #8A7D6B)',
              margin:    '4px 0 0 0',
            }}>
              {summary.totals.contacts.toLocaleString()} contacts across {summary.by_source.length} sources
            </p>
          </div>

          {/* SSE status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width:        '7px',
              height:       '7px',
              borderRadius: '50%',
              background:   sseStatus === 'connected' ? '#22c55e'
                          : sseStatus === 'error'     ? '#ef4444'
                          : 'var(--harvics-gold)',
              animation: sseStatus === 'connected' ? 'hx-pulse-dot 2.5s ease-in-out infinite' : 'none',
            }} />
            <span style={{
              fontSize:      '10px',
              fontWeight:    600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         sseStatus === 'connected' ? '#22c55e'
                           : sseStatus === 'error'     ? '#ef4444'
                           : 'var(--harvics-gold)',
            }}>
              {sseStatus === 'connected' ? 'Live' : sseStatus === 'error' ? 'Reconnecting' : 'Connecting'}
            </span>
          </div>
        </div>

        {/* ── Metric cards ───────────────────────────────────────────────── */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap:                 '1px',
          background:          'rgba(195,163,94,0.18)',
          border:              '1px solid rgba(195,163,94,0.18)',
        }}>
          <MetricCard
            label="Total Contacts"
            value={summary.totals.contacts}
            sub={`${summary.totals.companies.toLocaleString()} companies`}
            highlight
          />
          <MetricCard
            label="Email Verified"
            value={summary.totals.email_verified}
            sub={`${Math.round((summary.totals.email_verified / totalContacts) * 100)}% of total`}
          />
          <MetricCard
            label="Apollo Enriched"
            value={summary.totals.enriched_apollo}
            sub="phone + title"
          />
          <MetricCard
            label="Lusha Revealed"
            value={summary.totals.enriched_lusha}
            sub="prime leads"
          />
          <MetricCard
            label="In Nurture"
            value={summary.totals.in_nurture_pool}
            sub="score 50–69"
          />
          <MetricCard
            label="In Sequence"
            value={summary.totals.sequence_enrolled}
            sub="active outreach"
          />
        </div>

        {/* ── 3-column layout: sources | bands | feed ─────────────────────── */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr 1.4fr',
          gap:                 '24px',
          alignItems:          'start',
        }}>

          {/* ── By Source ──────────────────────────────────────────────── */}
          <div style={{
            padding:    '20px',
            background: 'var(--harvics-cream)',
            border:     '1px solid rgba(195,163,94,0.18)',
          }}>
            <SectionHeading>By Source</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {summary.by_source.map(({ source, count }) => (
                <ProgressBar
                  key={source}
                  label={formatSource(source)}
                  value={count}
                  max={totalContacts}
                  color="var(--harvics-gold)"
                />
              ))}
              {summary.by_source.length === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--harvics-muted, #8A7D6B)' }}>
                  No data yet
                </span>
              )}
            </div>
          </div>

          {/* ── ICP Distribution ───────────────────────────────────────── */}
          <div style={{
            padding:    '20px',
            background: 'var(--harvics-cream)',
            border:     '1px solid rgba(195,163,94,0.18)',
          }}>
            <SectionHeading>ICP Distribution</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Lusha tier (85-100) */}
              <ProgressBar
                label="Lusha Tier (85–100)"
                value={summary.by_band.lusha_tier}
                max={totalContacts}
                color="var(--harvics-gold)"
              />

              {/* Apollo tier (70-84) */}
              <ProgressBar
                label="Apollo Tier (70–84)"
                value={summary.by_band.apollo_tier}
                max={totalContacts}
                color="#a855f7"
              />

              {/* Nurture (50-69) */}
              <ProgressBar
                label="Nurture (50–69)"
                value={summary.by_band.nurture}
                max={totalContacts}
                color="#f97316"
              />

              {/* Vertical breakdown — top 6 */}
              <div style={{ marginTop: '8px', borderTop: '1px solid rgba(195,163,94,0.15)', paddingTop: '16px' }}>
                <span style={{
                  fontSize:      '10px',
                  fontWeight:    700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color:         'var(--harvics-muted, #8A7D6B)',
                  display:       'block',
                  marginBottom:  '12px',
                }}>
                  By Vertical
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {summary.by_vertical.slice(0, 6).map(({ vertical, count }) => (
                    <ProgressBar
                      key={vertical}
                      label={formatSource(vertical)}
                      value={count}
                      max={totalContacts}
                      color="#3b82f6"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Recent scrape runs */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(195,163,94,0.15)', paddingTop: '20px' }}>
              <SectionHeading>Recent Runs</SectionHeading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {summary.recent_runs.slice(0, 5).map(run => (
                  <div
                    key={run.id}
                    style={{
                      display:        'flex',
                      justifyContent: 'space-between',
                      alignItems:     'center',
                      padding:        '8px 10px',
                      background:     run.status === 'completed' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                      border:         `1px solid ${run.status === 'completed' ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--harvics-burgundy)', textTransform: 'capitalize' }}>
                        {formatSource(run.source)}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--harvics-muted, #8A7D6B)', marginLeft: '6px' }}>
                        {run.ingested.toLocaleString()} ingested
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize:   '10px',
                        fontWeight: 600,
                        color:      run.status === 'completed' ? '#22c55e' : '#ef4444',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}>
                        {run.status}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--harvics-muted, #8A7D6B)' }}>
                        {relativeTime(run.started_at)}
                      </span>
                    </div>
                  </div>
                ))}
                {summary.recent_runs.length === 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--harvics-muted, #8A7D6B)' }}>
                    No runs yet
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Live Feed ──────────────────────────────────────────────── */}
          <div style={{
            background: 'var(--harvics-cream)',
            border:     '1px solid rgba(195,163,94,0.18)',
            display:    'flex',
            flexDirection: 'column',
            maxHeight:  '680px',
          }}>
            <div style={{
              padding:       '16px 20px 12px',
              borderBottom:  '1px solid rgba(195,163,94,0.18)',
              display:       'flex',
              alignItems:    'center',
              justifyContent: 'space-between',
              flexShrink:    0,
            }}>
              <span style={{
                fontFamily:    'var(--font-spline-sans, "Spline Sans", system-ui)',
                fontSize:      '10px',
                fontWeight:    700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color:         'var(--harvics-gold)',
              }}>
                Live Feed
              </span>
              <span style={{
                fontFamily: 'var(--font-fraunces, "Fraunces", serif)',
                fontSize:   '12px',
                color:      'var(--harvics-muted, #8A7D6B)',
              }}>
                {feedItems.length} events
              </span>
            </div>

            <div
              ref={feedRef}
              style={{
                overflowY:  'auto',
                flex:        1,
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(195,163,94,0.3) transparent',
              }}
            >
              {feedItems.length === 0 ? (
                <div style={{
                  padding:   '32px',
                  textAlign: 'center',
                  color:     'var(--harvics-muted, #8A7D6B)',
                  fontSize:  '12px',
                }}>
                  Waiting for events…
                </div>
              ) : (
                feedItems.map(item => (
                  <FeedItem
                    key={item.id}
                    item={item}
                    isNew={newIds.has(item.id)}
                  />
                ))
              )}
            </div>
          </div>

        </div>{/* end 3-column */}
      </div>
    </>
  )
}

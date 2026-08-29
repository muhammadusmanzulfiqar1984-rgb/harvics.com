import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plane, Hotel, Car, Utensils, Calendar, FileUp, User, Share2,
  CreditCard, Headphones, Moon, Sun, BarChart3, X, Check,
  Download, Sparkles, MessageSquare, Shield
} from 'lucide-react'
import {
  EXECUTIVE_INTENTS,
  QUICK_REPLIES,
  TravelerProfile,
  CultureMemory,
  ItineraryItem,
  ChatMessage,
  DEFAULT_PROFILE,
  loadAnalyticsSummary,
  buildItineraryShareText,
  buildIcsCalendar,
  downloadText,
  trackEvent,
  uid,
} from '../lib/engagement'

type Props = {
  darkMode: boolean
  onToggleDark: () => void
  profile: TravelerProfile
  onSaveProfile: (p: TravelerProfile) => void
  culture: CultureMemory
  onSaveCulture: (c: CultureMemory) => void
  itinerary: ItineraryItem[]
  onAddItinerary: (item: Omit<ItineraryItem, 'id'>) => void
  onClearItinerary: () => void
  draftPending: boolean
  isConnected: boolean
  onIntent: (prompt: string, intentId: string) => void
  onQuickReply: (text: string) => void
  onDocumentText: (name: string, text: string) => void
  onHandoff: (reason: string) => void
  onHPayHold: () => void
}

const INTENT_ICONS: Record<string, React.ElementType> = {
  flight: Plane,
  hotel: Hotel,
  chauffeur: Car,
  dining: Utensils,
  meeting: Calendar,
  itinerary: MessageSquare,
}

export default function EngagementPanel({
  darkMode,
  onToggleDark,
  profile,
  onSaveProfile,
  culture,
  onSaveCulture,
  itinerary,
  onAddItinerary,
  onClearItinerary,
  draftPending,
  isConnected,
  onIntent,
  onQuickReply,
  onDocumentText,
  onHandoff,
  onHPayHold,
}: Props) {
  const [panel, setPanel] = useState<'none' | 'profile' | 'handoff' | 'analytics' | 'itinerary'>('none')
  const [draftProfile, setDraftProfile] = useState(profile)
  const [handoffNote, setHandoffNote] = useState('')
  const [cityNote, setCityNote] = useState('')
  const [cityKey, setCityKey] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => setDraftProfile(profile), [profile])

  const analytics = useMemo(() => (panel === 'analytics' ? loadAnalyticsSummary() : []), [panel])

  const handleFile = async (file: File) => {
    trackEvent('document_upload', { name: file.name, type: file.type, size: file.size })
    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
      const text = await file.text()
      onDocumentText(file.name, text.slice(0, 8000))
      return
    }
    // Binary docs — store metadata + ask AI to guide
    onDocumentText(
      file.name,
      `[Document uploaded: ${file.name} (${Math.round(file.size / 1024)} KB, ${file.type || 'unknown'}). Please acknowledge receipt and tell me what you need extracted (passport fields, ticket PNR, visa dates, invitation venue).`
    )
  }

  const shareItinerary = async () => {
    const text = buildItineraryShareText(itinerary, profile)
    trackEvent('share_itinerary', { items: itinerary.length })
    try {
      if (navigator.share) {
        await navigator.share({ title: 'HarvyX Itinerary', text })
      } else {
        await navigator.clipboard.writeText(text)
        alert('Itinerary copied to clipboard')
      }
    } catch {
      downloadText('harvyx-itinerary.txt', text)
    }
  }

  const exportCalendar = () => {
    trackEvent('calendar_export', { items: itinerary.length })
    downloadText('harvyx-itinerary.ics', buildIcsCalendar(itinerary), 'text/calendar')
  }

  return (
    <>
      {/* Executive intents */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
        {EXECUTIVE_INTENTS.map((intent) => {
          const Icon = INTENT_ICONS[intent.id] || Sparkles
          return (
            <button
              key={intent.id}
              onClick={() => {
                trackEvent('intent_tap', { intent: intent.id })
                onIntent(intent.prompt, intent.id)
              }}
              className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-gold/25 bg-white/80 text-[9px] font-bold uppercase tracking-wider text-maroon hover:bg-gold/15 transition-all"
            >
              <Icon className="w-3 h-3 text-gold" />
              {intent.label}
            </button>
          )
        })}
      </div>

      {/* Quick replies */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar shrink-0">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            onClick={() => {
              trackEvent('quick_reply', { reply: q })
              if (q === 'Escalate to human') {
                setPanel('handoff')
                return
              }
              if (q === 'Hold with HPay') {
                onHPayHold()
                return
              }
              onQuickReply(q)
            }}
            className="shrink-0 px-2 py-1 rounded-md bg-maroon/5 border border-maroon/10 text-[8px] font-bold text-maroon hover:border-gold/40 transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Utility strip */}
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        <button
          onClick={() => setPanel('profile')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gold/20 text-[8px] font-bold uppercase text-maroon hover:bg-gold/10"
        >
          <User className="w-3 h-3 text-gold" /> Profile
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gold/20 text-[8px] font-bold uppercase text-maroon hover:bg-gold/10"
        >
          <FileUp className="w-3 h-3 text-gold" /> Docs
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.csv,.doc,.docx"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handleFile(f)
            e.target.value = ''
          }}
        />
        <button
          onClick={() => setPanel('handoff')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gold/20 text-[8px] font-bold uppercase text-maroon hover:bg-gold/10"
        >
          <Headphones className="w-3 h-3 text-gold" /> Human
        </button>
        <button
          onClick={onHPayHold}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gold/20 text-[8px] font-bold uppercase text-maroon hover:bg-gold/10"
        >
          <CreditCard className="w-3 h-3 text-gold" /> HPay
        </button>
        <button
          onClick={() => setPanel('itinerary')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gold/20 text-[8px] font-bold uppercase text-maroon hover:bg-gold/10"
        >
          <Calendar className="w-3 h-3 text-gold" /> Trip
        </button>
        <button
          onClick={onToggleDark}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gold/20 text-[8px] font-bold uppercase text-maroon hover:bg-gold/10"
        >
          {darkMode ? <Sun className="w-3 h-3 text-gold" /> : <Moon className="w-3 h-3 text-gold" />}
          {darkMode ? 'Light' : 'Dark'}
        </button>
        <button
          onClick={() => setPanel('analytics')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gold/20 text-[8px] font-bold uppercase text-maroon hover:bg-gold/10"
        >
          <BarChart3 className="w-3 h-3 text-gold" /> Stats
        </button>
        {draftPending && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[8px] font-bold uppercase text-amber-800">
            Offline draft saved
          </span>
        )}
        {!isConnected && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-maroon/5 border border-maroon/10 text-[8px] font-bold uppercase text-maroon/70">
            <Shield className="w-3 h-3" /> Draft mode — connect mic for live AI
          </span>
        )}
      </div>

      {/* Drawers / modals */}
      {panel !== 'none' && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-3" style={{ background: 'rgba(61,18,18,0.55)' }} onClick={() => setPanel('none')}>
          <div
            className="w-full max-w-md rounded-2xl border border-gold/25 shadow-xl overflow-hidden max-h-[80vh] flex flex-col"
            style={{ background: darkMode ? '#2A0C0C' : '#F5F0E8' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-gold/20" style={{ background: '#3D1212' }}>
              <h3 className="text-sm font-display text-white capitalize">
                {panel === 'profile' && 'Traveler profile'}
                {panel === 'handoff' && 'Human handoff'}
                {panel === 'analytics' && 'Usage analytics'}
                {panel === 'itinerary' && 'Trip workspace'}
              </h3>
              <button onClick={() => setPanel('none')} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3 text-maroon">
              {panel === 'profile' && (
                <>
                  <p className="text-[10px] text-muted">Saved locally on this device. Link Harvics login from the main site when ready.</p>
                  {(
                    [
                      ['displayName', 'Display name'],
                      ['email', 'Email'],
                      ['preferredAirlines', 'Preferred airlines'],
                      ['dietary', 'Dietary'],
                      ['homeCity', 'Home city'],
                      ['languages', 'Languages'],
                      ['notes', 'Notes'],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="block text-[9px] font-bold uppercase tracking-wider">
                      {label}
                      <input
                        className="mt-1 w-full rounded-lg border border-gold/25 bg-white px-2.5 py-2 text-xs outline-none focus:border-gold"
                        value={(draftProfile as any)[key] || ''}
                        onChange={(e) => setDraftProfile({ ...draftProfile, [key]: e.target.value })}
                      />
                    </label>
                  ))}
                  <label className="block text-[9px] font-bold uppercase tracking-wider">
                    Cabin class
                    <select
                      className="mt-1 w-full rounded-lg border border-gold/25 bg-white px-2.5 py-2 text-xs outline-none"
                      value={draftProfile.preferredClass}
                      onChange={(e) => setDraftProfile({ ...draftProfile, preferredClass: e.target.value as TravelerProfile['preferredClass'] })}
                    >
                      <option value="economy">Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First</option>
                      <option value="private">Private</option>
                    </select>
                  </label>

                  <div className="pt-2 border-t border-gold/20 space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gold">Culture memory</p>
                    <div className="flex gap-1.5">
                      <input placeholder="City" value={cityKey} onChange={(e) => setCityKey(e.target.value)} className="w-24 rounded-lg border border-gold/25 bg-white px-2 py-1.5 text-[10px]" />
                      <input placeholder="Etiquette / tip" value={cityNote} onChange={(e) => setCityNote(e.target.value)} className="flex-1 rounded-lg border border-gold/25 bg-white px-2 py-1.5 text-[10px]" />
                      <button
                        className="px-2 rounded-lg bg-maroon text-gold text-[9px] font-bold"
                        onClick={() => {
                          if (!cityKey.trim() || !cityNote.trim()) return
                          const next = {
                            ...culture,
                            tips: [...culture.tips, `${cityKey.trim()}: ${cityNote.trim()}`].slice(-40),
                            cityNotes: { ...culture.cityNotes, [cityKey.trim().toUpperCase()]: cityNote.trim() },
                          }
                          onSaveCulture(next)
                          trackEvent('culture_memory_add', { city: cityKey.trim() })
                          setCityKey('')
                          setCityNote('')
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {culture.tips.slice(-8).reverse().map((t, i) => (
                        <p key={i} className="text-[10px] text-maroon/80 border-l-2 border-gold pl-2">{t}</p>
                      ))}
                    </div>
                  </div>

                  <button
                    className="w-full py-2.5 rounded-xl bg-maroon text-gold text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                    onClick={() => {
                      onSaveProfile(draftProfile)
                      trackEvent('profile_save')
                      setPanel('none')
                    }}
                  >
                    <Check className="w-3.5 h-3.5" /> Save profile
                  </button>
                  <a
                    href="http://localhost:3333/en/login"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-[9px] text-gold font-bold uppercase tracking-wider"
                    onClick={() => trackEvent('harvics_login_link')}
                  >
                    Open Harvics sign-in ↗
                  </a>
                </>
              )}

              {panel === 'handoff' && (
                <>
                  <p className="text-[11px] leading-relaxed text-maroon/80">
                    Escalate to a live Harvics concierge. Your chat draft and traveler profile will be packaged for handoff.
                  </p>
                  <textarea
                    rows={4}
                    value={handoffNote}
                    onChange={(e) => setHandoffNote(e.target.value)}
                    placeholder="What should the human desk prioritize?"
                    className="w-full rounded-xl border border-gold/25 bg-white px-3 py-2 text-xs outline-none focus:border-gold"
                  />
                  <button
                    className="w-full py-2.5 rounded-xl bg-maroon text-gold text-[10px] font-bold uppercase tracking-wider"
                    onClick={() => {
                      onHandoff(handoffNote || 'Executive requested live concierge handoff.')
                      trackEvent('human_handoff')
                      setPanel('none')
                      setHandoffNote('')
                    }}
                  >
                    Request human concierge
                  </button>
                </>
              )}

              {panel === 'itinerary' && (
                <>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      className="px-2 py-1 rounded-lg bg-maroon text-gold text-[8px] font-bold uppercase"
                      onClick={() => onAddItinerary({ type: 'flight', title: 'Flight hold', when: new Date().toLocaleString(), meta: 'Pending confirm' })}
                    >
                      + Flight
                    </button>
                    <button
                      className="px-2 py-1 rounded-lg border border-gold/30 text-[8px] font-bold uppercase"
                      onClick={() => onAddItinerary({ type: 'hotel', title: 'Hotel suite', when: new Date().toLocaleString(), meta: 'Pending' })}
                    >
                      + Hotel
                    </button>
                    <button
                      className="px-2 py-1 rounded-lg border border-gold/30 text-[8px] font-bold uppercase"
                      onClick={() => onAddItinerary({ type: 'transfer', title: 'Chauffeur', when: new Date().toLocaleString() })}
                    >
                      + Transfer
                    </button>
                  </div>
                  {itinerary.length === 0 ? (
                    <p className="text-[11px] text-muted py-6 text-center">No trip items yet. Add from chat or buttons above.</p>
                  ) : (
                    <div className="space-y-2">
                      {itinerary.map((item) => (
                        <div key={item.id} className="rounded-xl border border-gold/20 bg-white/70 p-2.5">
                          <div className="text-[8px] font-bold uppercase tracking-wider text-gold">{item.type}</div>
                          <div className="text-xs font-semibold">{item.title}</div>
                          <div className="text-[10px] text-muted">{item.when}{item.meta ? ` · ${item.meta}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={shareItinerary} className="flex-1 py-2 rounded-xl bg-maroon text-gold text-[9px] font-bold uppercase flex items-center justify-center gap-1">
                      <Share2 className="w-3 h-3" /> Share
                    </button>
                    <button onClick={exportCalendar} className="flex-1 py-2 rounded-xl border border-gold/30 text-[9px] font-bold uppercase flex items-center justify-center gap-1">
                      <Download className="w-3 h-3" /> .ics
                    </button>
                    <button onClick={onClearItinerary} className="px-3 py-2 rounded-xl border border-maroon/20 text-[9px] font-bold uppercase text-maroon/70">
                      Clear
                    </button>
                  </div>
                </>
              )}

              {panel === 'analytics' && (
                <>
                  <p className="text-[10px] text-muted">Local session analytics (last 500 events on this device).</p>
                  {analytics.length === 0 ? (
                    <p className="text-[11px] text-center py-8 text-muted">No events yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {analytics.slice(0, 12).map((row) => (
                        <div key={row.name} className="flex justify-between text-[11px] border-b border-gold/10 pb-1">
                          <span className="font-mono text-maroon/80">{row.name}</span>
                          <span className="font-bold text-gold">{row.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export type { ChatMessage }

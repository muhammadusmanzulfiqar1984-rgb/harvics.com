import React, { useState } from 'react'
import { Send, Mic, Brain, Zap } from 'lucide-react'
import { AISuggestion } from './HarvicsCard'

interface HarvicsAIPanelProps {
  suggestions: AISuggestion[]
  loading?: boolean
  title?: string
  onAsk?: (query: string) => void
  actions?: React.ReactNode
}

function renderHighlights(text: string, highlights?: { word: string; color: string }[]) {
  if (!highlights?.length) return <>{text}</>
  let result = text
  highlights.forEach(h => {
    const safe = h.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`(${safe})`, 'gi'), `<mark style="color:${h.color};background:transparent;font-weight:700">$1</mark>`)
  })
  return <span dangerouslySetInnerHTML={{ __html: result }} />
}

export const HarvicsAIPanel: React.FC<HarvicsAIPanelProps> = ({
  suggestions,
  loading = false,
  title = 'AI Alerts',
  onAsk,
  actions,
}) => {
  const [query, setQuery] = useState('')

  const handleAsk = () => {
    if (query.trim() && onAsk) { onAsk(query.trim()); setQuery('') }
  }

  return (
    <div className="relative flex flex-col h-full rounded-2xl overflow-hidden bg-harvics-burgundy border border-harvics-goldDivider shadow-[0_4px_24px_rgba(26,5,5,0.5)] p-4">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-harvics-gold/50 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-harvics-gold/10 border border-harvics-goldDivider">
          <Brain size={12} className="text-harvics-gold" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-harvics-gold">{title}</span>
        {loading && (
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1 h-1 rounded-full bg-harvics-gold animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
        {!loading && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <Zap size={20} className="text-harvics-muted/40" />
            <p className="text-[11px] text-harvics-muted text-center">No active alerts</p>
          </div>
        )}
        {suggestions.map(s => (
          <div key={s.id} className="rounded-xl p-3 bg-white/[0.03] border border-harvics-goldDivider">
            <p className="text-[11px] text-harvics-cream/80 leading-relaxed">
              {renderHighlights(s.text, s.highlights)}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      {actions && <div className="mt-3 flex flex-col gap-2">{actions}</div>}

      {/* Ask input */}
      <div className="mt-4 flex items-center gap-1.5 rounded-xl border border-harvics-gold/30 bg-white/[0.03] overflow-hidden px-3 py-2 focus-within:border-harvics-gold/60 transition-colors">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
          placeholder="Ask anything…"
          className="flex-1 bg-transparent text-[11px] text-harvics-cream placeholder-harvics-muted/50 outline-none"
        />
        <button
          onClick={handleAsk}
          className="text-harvics-gold hover:text-harvics-cream transition-colors"
        >
          {query.trim() ? <Send size={13} /> : <Mic size={13} />}
        </button>
      </div>
    </div>
  )
}

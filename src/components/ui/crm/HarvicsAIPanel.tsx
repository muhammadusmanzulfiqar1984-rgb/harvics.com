 import React, { useState } from 'react';
import { Mic, Send } from 'lucide-react';
import { AISuggestion } from './HarvicsCard';

interface HarvicsAIPanelProps {
  suggestions: AISuggestion[];
  loading?: boolean;
  title?: string;
  onAsk?: (query: string) => void;
  actions?: React.ReactNode;
}

export const HarvicsAIPanel: React.FC<HarvicsAIPanelProps> = ({
  suggestions,
  loading = false,
  title = 'AI Alerts',
  onAsk,
  actions,
}) => {
  const [query, setQuery] = useState('');

  const handleAsk = () => {
    if (query.trim() && onAsk) {
      onAsk(query.trim());
      setQuery('');
    }
  };

  const renderTextWithHighlights = (text: string, highlights?: { word: string; color: string }[]) => {
    if (!highlights || highlights.length === 0) return text;
    
    // Simplistic highlight logic for demonstration
    // In production, would use regex or precise indices to replace text with colored spans
    let rendered = text;
    highlights.forEach(h => {
      // Escape string for regex
      const safeWord = h.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${safeWord})`, 'gi');
      rendered = rendered.replace(regex, `<span style="color: ${h.color}; font-weight: bold;">$1</span>`);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: rendered }} />;
  };

  return (
    <div className="w-[240px] flex-shrink-0 flex flex-col h-full bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.4)] rounded-lg p-4 font-['DM_Sans'] text-[#e2e8f0]">
      {/* Title Pill */}
      <div className="bg-[#1e3a8a]/50 text-[#93c5fd] text-[10px] uppercase font-bold tracking-wider rounded-full px-3 py-1 self-start flex items-center mb-4 border border-[rgba(59,130,246,0.5)] shadow-md">
        <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse mr-2" />
        {title}
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="flex items-center space-x-1 text-blue-400">
            <span className="animate-bounce delay-75">•</span>
            <span className="animate-bounce delay-150">•</span>
            <span className="animate-bounce delay-300">•</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-[11px] text-[#94a3b8] italic">No active alerts.</div>
        ) : (
          suggestions.map((sugg) => (
            <div key={sugg.id} className="text-[11px] text-gray-300 leading-relaxed border-l-2 border-[rgba(59,130,246,0.4)] pl-2">
              {renderTextWithHighlights(sugg.text, sugg.highlights)}
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      {actions && <div className="mt-4 flex flex-col gap-2">{actions}</div>}

      {/* Harvoice Input */}
      <div className="mt-4 relative border border-[#fbbf24] rounded-full overflow-hidden bg-black/50 shadow-[0_0_8px_rgba(251,191,36,0.15)] flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask anything..."
          className="bg-transparent text-[11px] text-white flex-1 pl-3 py-2 outline-none placeholder-[#475569]"
        />
        <button 
          onClick={handleAsk}
          className="p-2 text-[#fbbf24] hover:bg-[#fbbf24]/20 transition-colors mr-1"
          aria-label="Send query"
        >
          {query.trim() ? <Send size={14} /> : <Mic size={14} />}
        </button>
      </div>
    </div>
  );
};

'use client'

import React, { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  text: string
  ts: Date
}

const SYSTEM_CONTEXT = `You are HARVICS AI Copilot — the intelligent assistant built into HARVICS OS, a global enterprise platform covering FMCG distribution, trading, CRM, logistics, finance, HR, and supply chain across Middle East, South Asia, Africa, and Americas.

Answer in concise, direct, professional language. When referencing data, mention relevant metrics from the HARVICS OS context. Current enterprise snapshot:
- Revenue: $28.4M | Net Profit: $6.2M | Margin: 21.8%
- Total Orders: 2,140 | In Transit: 133 | Pending: 187
- Active Customers: 298 across 5 regions
- Fleet: 6 vehicles, 3 moving, 1 loading
- Inventory: $18.4M across 247 SKUs, 14 low-stock alerts
- Employees: 847 across 6 departments`

export default function GeminiCopilot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hello! I\'m HARVICS AI Copilot. I can help you analyze your business data, answer questions about orders, inventory, finance, HR, or logistics. What would you like to know?', ts: new Date(0) }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Message = { role: 'user', text, ts: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      // Build conversation history for Gemini
      const history = messages.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }))

      const body = {
        system_instruction: { parts: [{ text: SYSTEM_CONTEXT }] },
        contents: [
          ...history,
          { role: 'user', parts: [{ text }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
          topP: 0.8,
        }
      }

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      )
      const data = await res.json()
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I couldn\'t generate a response. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', text: reply, ts: new Date() }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection error. Please check your network and try again.', ts: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const QUICK = [
    'What are my top 3 revenue risks?',
    'Summarize today\'s order status',
    'Which SKUs need restocking?',
    'Show me fleet efficiency',
  ]

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-[2000] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${open ? 'bg-[#1D1D1F] rotate-45' : 'bg-[#6B1F2B]'}`}
        aria-label="HARVICS AI Copilot"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[1999] w-[380px] max-h-[580px] bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#EAE0D5] flex flex-col overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#6B1F2B] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold leading-none">HARVICS AI Copilot</p>
              <p className="text-white/60 text-[11px] mt-0.5">Powered by Gemini 2.5 Flash</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#34C759] rounded-full animate-pulse" />
              <span className="text-white/60 text-[10px]">Live</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#6B1F2B] text-white rounded-br-sm'
                    : 'bg-white text-[#1D1D1F] border border-[#E5E5EA] rounded-bl-sm shadow-sm'
                }`}>
                  {m.text}
                  <p className={`text-[9px] mt-1 ${m.role === 'user' ? 'text-white/50 text-right' : 'text-[#C7C7CC]'}`}>
                    {m.ts.getTime() > 0 ? m.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E5E5EA] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[#8E8E93] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#8E8E93] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#8E8E93] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK.map(q => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="text-[11px] px-2.5 py-1 bg-[#FAF8F5] text-[#6B1F2B] rounded-full border border-[#E5E5EA] hover:bg-[#F0EAE1] transition-colors font-medium">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-[#E5E5EA] flex gap-2 bg-white">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about orders, inventory, KPIs…"
              className="flex-1 bg-[#FAF8F5] rounded-xl px-3 py-2 text-sm text-[#1D1D1F] outline-none placeholder:text-[#C7C7CC] focus:ring-2 focus:ring-[#6B1F2B]/20"
            />
            <button onClick={send} disabled={!input.trim() || loading}
              className="w-9 h-9 bg-[#6B1F2B] rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-[#5a1a24] transition-colors flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'
import { VictorianTelephoneIcon } from '@/components/ui/VictorianHorology'

interface Source {
  url: string
  title: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
  via?: 'text' | 'voice'
}

type CallStatus = 'idle' | 'connecting' | 'active'

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ''

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const vapiRef = useRef<any>(null)

  const t = useTranslations('chatbot')

  // Keyboard: Escape to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleToggle()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  // Tear down Vapi on unmount
  useEffect(() => {
    return () => {
      try {
        vapiRef.current?.stop?.()
      } catch {
        /* ignore */
      }
      vapiRef.current = null
    }
  }, [])

  const pushMessage = (msg: Omit<Message, 'id' | 'timestamp'> & { id?: string }) => {
    setMessages((prev) => [
      ...prev,
      {
        id: msg.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
        sources: msg.sources,
        via: msg.via,
      },
    ])
  }

  const ensureVapi = async () => {
    if (vapiRef.current) return vapiRef.current
    if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) {
      throw new Error('Vapi is not configured (missing NEXT_PUBLIC_VAPI_PUBLIC_KEY / ASSISTANT_ID).')
    }
    const { default: Vapi } = await import('@vapi-ai/web')
    const vapi = new Vapi(VAPI_PUBLIC_KEY)

    vapi.on('call-start', () => {
      setCallStatus('active')
      setVoiceError(null)
      window.dispatchEvent(new CustomEvent('harvics:vapi-call-start'))
      pushMessage({
        role: 'assistant',
        content: 'Voice connected — speak naturally. Transcripts will appear here.',
        via: 'voice',
      })
    })
    vapi.on('call-end', () => {
      setCallStatus('idle')
      window.dispatchEvent(new CustomEvent('harvics:vapi-call-end'))
      pushMessage({
        role: 'assistant',
        content: 'Voice call ended. You can keep chatting by text.',
        via: 'voice',
      })
    })
    vapi.on('speech-start', () => {
      /* assistant speaking */
    })
    vapi.on('message', (m: any) => {
      if (m?.type === 'transcript' && m?.transcriptType === 'final' && m?.transcript) {
        const role = m.role === 'user' ? 'user' : 'assistant'
        pushMessage({ role, content: String(m.transcript), via: 'voice' })
      }
    })
    vapi.on('error', (e: any) => {
      console.error('[HarvyX Vapi]', e)
      setCallStatus('idle')
      setVoiceError(typeof e === 'string' ? e : e?.message || 'Voice call failed')
    })

    vapiRef.current = vapi
    return vapi
  }

  const startVoice = async () => {
    if (callStatus !== 'idle') return
    setVoiceError(null)
    setCallStatus('connecting')
    if (!isOpen) {
      setIsOpen(true)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 50)
    }
    try {
      const vapi = await ensureVapi()
      await vapi.start(VAPI_ASSISTANT_ID)
    } catch (err: any) {
      setCallStatus('idle')
      setVoiceError(err?.message || 'Could not start voice call')
    }
  }

  const endVoice = () => {
    try {
      vapiRef.current?.stop?.()
    } catch {
      /* ignore */
    }
    setCallStatus('idle')
  }

  // Handle open/close with slide animation
  const handleToggle = () => {
    if (isOpen) {
      // End voice if closing the panel
      if (callStatus !== 'idle') endVoice()
      setIsAnimating(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsAnimating(false)
      }, 250)
    } else {
      setIsOpen(true)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 50)
    }
  }

  // Initialize with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: t('welcome'),
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, messages.length, t])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [messages, isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput('')
    setLoading(true)

    const pushAssistant = (content: string, sources?: Source[]) => {
      pushMessage({ role: 'assistant', content, sources, via: 'text' })
    }

    try {
      // Primary: Cloudflare AI Search (grounded answers over harvics.com).
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentInput }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.answer && data.answer.trim()) {
        pushAssistant(data.answer.trim(), Array.isArray(data.sources) ? data.sources : undefined)
      } else {
        // Fallback: legacy copilot, then canned responses.
        const response = await apiClient.sendCopilotMessage(currentInput)
        const fromCopilot =
          !response.error && response.data
            ? (response.data as any)?.response || (response.data as any)?.message
            : null
        pushAssistant(fromCopilot || getFallbackResponse(currentInput))
      }
    } catch (error) {
      console.error('Chatbot error:', error)
      pushAssistant(getFallbackResponse(currentInput))
    } finally {
      setLoading(false)
    }
  }

  const tFallback = useTranslations('chatbot.fallback')

  const getFallbackResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes('product') || lowerInput.includes('food') || lowerInput.includes('catalog')) {
      return tFallback('product')
    }

    if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('phone')) {
      return tFallback('contact')
    }

    if (lowerInput.includes('order') || lowerInput.includes('purchase') || lowerInput.includes('buy')) {
      return tFallback('order')
    }

    if (lowerInput.includes('about') || lowerInput.includes('company') || lowerInput.includes('who')) {
      return tFallback('about')
    }

    if (lowerInput.includes('help') || lowerInput.includes('support')) {
      return tFallback('help')
    }

    return tFallback('default')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Victorian horology telephone FAB — textile-v2 LPP gold palette */}
      <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 group/wrap">
        <span
          className="harvics-fab-tooltip pointer-events-none select-none text-[11px] font-medium tracking-wide uppercase text-harvics-burgundy bg-harvics-cream/95 backdrop-blur px-3 py-1.5 opacity-0 -translate-x-1 transition-all duration-300 group-hover/wrap:opacity-100 group-hover/wrap:translate-x-0"
          style={{
            borderRadius: '9999px',
            border: '1px solid rgba(184, 137, 62, 0.45)',
            boxShadow: '0 4px 14px rgba(61, 18, 18, 0.12)',
          }}
        >
          {isOpen ? 'Close' : 'Chat or talk with HarvyX'}
        </span>

        <button
          id="harvics-chat-trigger"
          type="button"
          onClick={handleToggle}
          className="harvics-chatbot-fab harvics-victorian-telephone-fab relative w-[3.25rem] h-[3.25rem] flex items-center justify-center p-0 overflow-visible transition-transform duration-200 hover:scale-[1.04] active:scale-95"
          aria-label={isOpen ? 'Close HarvyX' : 'Open HarvyX'}
          aria-expanded={isOpen}
          aria-controls="harvics-chat-panel"
        >
          <VictorianTelephoneIcon isOpen={isOpen} />
        </button>
      </div>

      {/* ═══ CHAT WINDOW — Glassmorphism Panel ═══ */}
      {isOpen && (
        <div
          id="harvics-chat-panel"
          role="dialog"
          aria-label="Harvics Chat Assistant"
          className="fixed bottom-[4.5rem] right-6 z-[9998] w-[320px] h-[460px] flex flex-col overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 241, 232, 0.95) 0%, rgba(255, 255, 255, 0.92) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(195, 163, 94, 0.2)',
            boxShadow: '0 25px 60px rgba(107, 31, 43, 0.15), 0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            animation: isAnimating && !isOpen ? 'chatSlideDown 0.25s ease-in forwards' : 'chatSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* ═══ HEADER ═══ */}
          <div
            className="relative px-5 py-4 flex items-center justify-between overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3D1212 0%, #4a1520 60%, #3a0e15 100%)',
            }}
          >
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(rgba(195, 163, 94,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(195, 163, 94,0.8) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
            {/* Bottom gold accent */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-harvics-gold/40 to-transparent" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 bg-harvics-gold/15 border border-harvics-gold/25 flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-4 h-4 text-harvics-gold"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 4v16" />
                  <path d="M19 4v16" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-tight">HarvyX</h3>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      callStatus === 'active' ? 'bg-emerald-400' : callStatus === 'connecting' ? 'bg-amber-300' : 'bg-emerald-400'
                    }`}
                    style={{ animation: 'statusPulse 2s ease-in-out infinite' }}
                  />
                  <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">
                    {callStatus === 'active'
                      ? 'On call'
                      : callStatus === 'connecting'
                        ? 'Connecting…'
                        : 'Chat · Voice'}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={callStatus === 'idle' ? startVoice : endVoice}
                disabled={callStatus === 'connecting'}
                className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  callStatus === 'active'
                    ? 'bg-red-500/90 text-white hover:bg-red-500'
                    : 'bg-harvics-gold/20 text-harvics-gold border border-harvics-gold/35 hover:bg-harvics-gold/30'
                } disabled:opacity-50`}
                aria-label={callStatus === 'active' ? 'End voice call' : 'Start voice call'}
              >
                {callStatus === 'active' ? 'End' : callStatus === 'connecting' ? '…' : 'Talk'}
              </button>
              <button
                onClick={handleToggle}
                className="text-white/60 hover:text-harvics-gold transition-colors duration-200 p-1.5"
                aria-label="Close Chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ═══ MESSAGES ═══ */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{
              background: 'linear-gradient(180deg, rgba(245, 241, 232, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
            }}
          >
            {messages.map((message, idx) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{
                  animation: 'msgFadeIn 0.3s ease-out forwards',
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-harvics-burgundy text-white'
                      : 'bg-white/80 text-harvics-burgundy border border-harvics-gold/15'
                  }`}
                  style={{
                    backdropFilter: message.role === 'assistant' ? 'blur(8px)' : undefined,
                    boxShadow: message.role === 'user'
                      ? '0 2px 8px rgba(107, 31, 43, 0.2)'
                      : '0 1px 4px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-harvics-gold/20">
                      <p className="text-[9px] uppercase tracking-[0.14em] text-harvics-burgundy/40 font-semibold mb-1.5">
                        Sources
                      </p>
                      <div className="flex flex-col gap-1">
                        {message.sources.map((s) => (
                          <a
                            key={s.url}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-harvics-burgundy/70 hover:text-harvics-burgundy underline decoration-[#C3A35E]/40 underline-offset-2 truncate"
                          >
                            {s.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className={`text-[10px] mt-1.5 flex items-center gap-1.5 ${message.role === 'user' ? 'text-white/40' : 'text-harvics-burgundy/30'}`}>
                    {message.via === 'voice' && (
                      <span className="uppercase tracking-wider text-[9px] opacity-80">Voice</span>
                    )}
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start" style={{ animation: 'msgFadeIn 0.3s ease-out forwards' }}>
                <div
                  className="bg-white/80 border border-harvics-gold/15 px-4 py-3"
                  style={{
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-harvics-gold rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out infinite' }} />
                    <span className="w-2 h-2 bg-harvics-gold rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out 0.2s infinite' }} />
                    <span className="w-2 h-2 bg-harvics-gold rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out 0.4s infinite' }} />
                    <span className="text-[10px] text-harvics-burgundy/40 ml-2 font-medium">{t('typing')}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ═══ INPUT ═══ */}
          <div
            className="px-4 py-3 border-t border-harvics-gold/10"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex gap-2">
              <button
                type="button"
                onClick={callStatus === 'idle' ? startVoice : endVoice}
                disabled={callStatus === 'connecting'}
                title={callStatus === 'active' ? 'End voice call' : 'Talk with HarvyX'}
                className={`shrink-0 px-3 py-2.5 transition-all duration-200 disabled:opacity-40 ${
                  callStatus === 'active'
                    ? 'bg-red-600 text-white'
                    : callStatus === 'connecting'
                      ? 'bg-harvics-gold/40 text-harvics-burgundy'
                      : 'bg-harvics-gold/20 text-harvics-burgundy border border-harvics-gold/30 hover:bg-harvics-gold/35'
                }`}
                aria-label={callStatus === 'active' ? 'End call' : 'Start voice'}
              >
                {callStatus === 'active' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  callStatus === 'active' ? 'Listening… or type here' : t('placeholder')
                }
                className="flex-1 px-3.5 py-2.5 text-sm text-harvics-burgundy bg-harvics-cream/60 border border-harvics-gold/15 focus:outline-none focus:border-harvics-gold/40 transition-colors duration-200 placeholder:text-harvics-burgundy/30"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-harvics-burgundy text-harvics-gold text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#5a1a24]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            {voiceError && (
              <p className="text-[10px] text-red-700/80 mt-1.5 text-center">{voiceError}</p>
            )}
            <p className="text-[10px] text-harvics-burgundy/25 mt-1.5 text-center font-medium tracking-wide">
              {callStatus === 'active'
                ? 'On call with Vapi · transcripts sync into this chat'
                : t('pressEnter')}
            </p>
          </div>
        </div>
      )}

      {/* Keyframes */}
      <style jsx>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatSlideDown {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(20px) scale(0.97); }
        }
        @keyframes chatPulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  )
}

export default ChatbotWidget

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'
import { VictorianTelephoneIcon } from '@/components/ui/VictorianHorology'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const ChatbotWidget: React.FC = () => {
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = useTranslations('chatbot')

  // Keyboard: Escape to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleToggle()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  // Handle open/close with slide animation
  const handleToggle = () => {
    if (isOpen) {
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

    try {
      const response = await apiClient.sendCopilotMessage(currentInput)
      
      if (response.error) {
        const responses = getFallbackResponse(currentInput)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responses,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else if (response.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            (response.data as any)?.response ||
            (response.data as any)?.message ||
            'Thank you for your message! Our team will get back to you soon.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const responses = getFallbackResponse(currentInput)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responses,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chatbot error:', error)
      const responses = getFallbackResponse(currentInput)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
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
            boxShadow: '0 4px 14px rgba(26, 5, 5, 0.12)',
          }}
        >
          {isOpen ? 'Close' : 'Contact Harvics'}
        </span>

        <button
          id="harvics-chat-trigger"
          type="button"
          onClick={handleToggle}
          className="harvics-chatbot-fab harvics-victorian-telephone-fab relative w-[3.25rem] h-[3.25rem] flex items-center justify-center p-0 overflow-visible transition-transform duration-200 hover:scale-[1.04] active:scale-95"
          aria-label={isOpen ? 'Close contact' : 'Contact Harvics'}
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
              background: 'linear-gradient(135deg, #6B1F2B 0%, #4a1520 60%, #3a0e15 100%)',
            }}
          >
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(rgba(195,163,94,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(195,163,94,0.8) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
            {/* Bottom gold accent */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3A35E]/40 to-transparent" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#C3A35E]/15 border border-[#C3A35E]/25 flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-4 h-4 text-[#C3A35E]"
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
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" style={{ animation: 'statusPulse 2s ease-in-out infinite' }} />
                  <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="relative z-10 text-white/60 hover:text-[#C3A35E] transition-colors duration-200 p-1.5"
              aria-label="Close Chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
                      ? 'bg-[#6B1F2B] text-white'
                      : 'bg-white/80 text-[#6B1F2B] border border-[#C3A35E]/15'
                  }`}
                  style={{
                    backdropFilter: message.role === 'assistant' ? 'blur(8px)' : undefined,
                    boxShadow: message.role === 'user'
                      ? '0 2px 8px rgba(107, 31, 43, 0.2)'
                      : '0 1px 4px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-[10px] mt-1.5 ${message.role === 'user' ? 'text-white/40' : 'text-[#6B1F2B]/30'}`}>
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
                  className="bg-white/80 border border-[#C3A35E]/15 px-4 py-3"
                  style={{
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#C3A35E] rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out infinite' }} />
                    <span className="w-2 h-2 bg-[#C3A35E] rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out 0.2s infinite' }} />
                    <span className="w-2 h-2 bg-[#C3A35E] rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out 0.4s infinite' }} />
                    <span className="text-[10px] text-[#6B1F2B]/40 ml-2 font-medium">{t('typing')}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ═══ INPUT ═══ */}
          <div
            className="px-4 py-3 border-t border-[#C3A35E]/10"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('placeholder')}
                className="flex-1 px-3.5 py-2.5 text-sm text-[#6B1F2B] bg-[#F5F0E8]/60 border border-[#C3A35E]/15 focus:outline-none focus:border-[#C3A35E]/40 transition-colors duration-200 placeholder:text-[#6B1F2B]/30"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-[#6B1F2B] text-[#C3A35E] text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#5a1a24]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-[#6B1F2B]/25 mt-1.5 text-center font-medium tracking-wide">
              {t('pressEnter')}
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

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const ChatbotWidget: React.FC = () => {
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = useTranslations('chatbot')

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
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100)
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
      // Try to use AI backend first
      const response = await apiClient.sendCopilotMessage(currentInput)
      
      if (response.error) {
        // If API returns an error, use fallback
        const responses = getFallbackResponse(currentInput)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responses,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else if (response.data) {
        // Success - use AI response
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
        // No data, use fallback
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
      // Network or other errors - use fallback
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
      {/* Chat Widget Button - Elegant & Premium */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-white text-black shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group border border-black200 hover:border-black300"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        aria-label="Open Chat"
      >
        {!isOpen ? (
          <svg
            className="w-7 h-7 group-hover:scale-110 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        ) : (
          <svg
            className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        {/* Elegant pulse animation when closed */}
        {!isOpen && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-60 animate-ping"></span>
        )}
        {/* Glow effect */}
        {!isOpen && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/20 blur-xl"></span>
        )}
      </button>

      {/* Chat Window - Elegant & Premium */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col border border-[#C3A35E]/20 overflow-hidden"
          style={{
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(139, 105, 20, 0.1)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
          }}
        >
          {/* Header - Elegant Gradient */}
          <div 
            className="bg-gradient-to-r from-[#6B1F2B] via-[#4a000a] to-[#ffffff] text-white p-4 flex items-center justify-between relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #6B1F2B 0%, #4a000a 50%, #ffffff 100%)',
            }}
          >
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}></div>
            <div className="relative z-10 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center border border-[#C3A35E]/20 backdrop-blur-sm">
                <span className="text-xl">🤖</span>
              </div>
            <div>
                <h3 className="font-bold text-lg tracking-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>HarvyX</h3>
                <p className="text-xs text-white/90 font-medium">Your AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/90 hover:text-[#C3A35E] hover:bg-white/10 transition-all duration-200 p-2 rounded-full relative z-10"
              aria-label="Close Chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages - Elegant Styling */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white50/50 to-white space-y-4" style={{
            background: 'linear-gradient(180deg, rgba(249, 250, 251, 0.5) 0%, rgba(255, 255, 255, 1) 100%)',
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animation: 'fadeIn 0.3s ease-out' }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#ffffff] text-white'
                      : 'bg-white/90 backdrop-blur-sm text-black border border-black200/50'
                  }`}
                  style={{
                    boxShadow: message.role === 'user' 
                      ? '0 4px 12px rgba(139, 105, 20, 0.25)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1.5 ${message.role === 'user' ? 'text-[#C3A35E]/90' : 'text-black'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white/90 backdrop-blur-sm text-black border border-black200/50 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-gradient-to-br from-[#ffffff] to-[#ffffff] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gradient-to-br from-[#ffffff] to-[#ffffff] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gradient-to-br from-[#ffffff] to-[#ffffff] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-xs text-black ml-2">{t('typing')}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Elegant Styling */}
          <div className="border-t border-black200/50 p-4 bg-white/95 backdrop-blur-sm">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('placeholder')}
                className="flex-1 px-4 py-2.5 border-2 border-black200 rounded-xl focus:outline-none focus:border-white focus:ring-2 focus:ring-black/20 text-black transition-all duration-200 bg-white/90"
                disabled={loading}
                style={{
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-[#ffffff] via-[#ffffff] to-[#ffffff] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  boxShadow: '0 4px 12px rgba(139, 105, 20, 0.3)',
                }}
              >
                {t('send')}
              </button>
            </div>
            <p className="text-xs text-black mt-2 text-center font-medium">
              {t('pressEnter')}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatbotWidget


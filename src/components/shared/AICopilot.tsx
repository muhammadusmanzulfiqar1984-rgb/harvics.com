'use client'

import { useState, useEffect, useRef } from 'react'
import { apiClient } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copilotData, setCopilotData] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCopilotData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadCopilotData = async () => {
    try {
      const response = await apiClient.getCopilotData()
      if (response.data) {
        setCopilotData(response.data)
        // Add welcome message
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m the Harvics AI Copilot. I can help you with orders, inventory, sales, and more. How can I assist you today?',
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error('Failed to load copilot data:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await apiClient.sendCopilotMessage(input)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: (response.data as any)?.response || (response.data as any)?.message || 'I received your message. Processing...',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check your connection.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6B1F2B] to-[#ffffff] text-white p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">🤖 Harvics AI Copilot</h1>
          <p className="text-sm text-[#C3A35E]/90">
            Level 4 Architecture - AI Copilot & Workflow Orchestration
          </p>
          {copilotData && (
            <div className="mt-2 flex space-x-4 text-xs">
              <span>Interactions Today: {copilotData.kpis?.interactionsToday || 0}</span>
              <span>Open Alerts: {copilotData.kpis?.openAlerts || 0}</span>
              <span>Recommended Actions: {copilotData.kpis?.recommendedActions || 0}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-white text-black'
                    : 'bg-white/90 text-black'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/90 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/90 border-t border-[#C3A35E]/30 p-4">
        <div className="max-w-4xl mx-auto flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about orders, inventory, sales, or logistics..."
            className="flex-1 px-4 py-2 border border-[#C3A35E]/30 rounded-lg focus:ring-2 focus:ring-black focus:border-white bg-white text-black"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-white hover:bg-white/80 disabled:bg-gray-400 text-black font-bold px-6 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {copilotData?.panels?.suggestions && copilotData.panels.suggestions.length > 0 && (
        <div className="bg-white/90 border-t border-[#C3A35E]/30 p-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm font-semibold text-black mb-2">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              {copilotData.panels.suggestions.slice(0, 5).map((suggestion: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion.action || suggestion.description || '')}
                  className="text-xs bg-white/20 hover:bg-white/30 text-black px-3 py-1 rounded-full transition-colors"
                >
                  {suggestion.action || suggestion.description}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


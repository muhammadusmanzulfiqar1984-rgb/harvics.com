'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MarketAttackProposal {
  territory: string
  sku: string
  strategy: string
  targetPrice: number
  usdtPeg: string
  margin: string
  alert: string
  confidenceScore: number
  timestamp: string
  passport?: {
    origin: string
    fairTradeStatus: string
    ethicalScore: number
  }
  agentManifest?: Record<string, unknown>
  loyaltyOffer?: Record<string, unknown>
}

export interface AlphaEngineState {
  /** Whether Socket.io is connected */
  connected: boolean
  /** Connection status for UI display */
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  /** Latest market attack proposals from AlphaEngine */
  proposals: MarketAttackProposal[]
  /** Most recent proposal */
  latestProposal: MarketAttackProposal | null
  /** Total proposals received in this session */
  totalReceived: number
  /** Error message if connection failed */
  error: string | null
  /** Timestamp of last received data */
  lastUpdate: string | null
}

interface UseAlphaEngineOptions {
  /** Maximum number of proposals to keep in memory. Default: 50 */
  maxHistory?: number
  /** Auto-connect on mount. Default: true */
  autoConnect?: boolean
  /** Backend URL override. Default: auto-detect */
  serverUrl?: string
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useAlphaEngine — Real-time Socket.io hook for Harvics Alpha Engine
 * 
 * Connects to the backend Socket.io server (port 4000) and listens for
 * 'market-attack-proposal' events emitted by HarvicsAlphaEngine.
 * 
 * Usage:
 *   const { connected, proposals, latestProposal, status } = useAlphaEngine()
 * 
 * Features:
 *   - Auto-reconnect with exponential backoff
 *   - History buffer (default 50 proposals)
 *   - Graceful disconnect on unmount
 *   - Works when backend is offline (status shows 'disconnected')
 *   - Manual connect/disconnect control
 */
export function useAlphaEngine(options: UseAlphaEngineOptions = {}) {
  const {
    maxHistory = 50,
    autoConnect = true,
    serverUrl,
  } = options

  const [state, setState] = useState<AlphaEngineState>({
    connected: false,
    status: 'disconnected',
    proposals: [],
    latestProposal: null,
    totalReceived: 0,
    error: null,
    lastUpdate: null,
  })

  const socketRef = useRef<Socket | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 10

  // Determine server URL
  const getServerUrl = useCallback(() => {
    if (serverUrl) return serverUrl
    // In production, Socket.io goes through the same origin
    // In dev, backend runs on port 4000
    if (typeof window !== 'undefined') {
      const isDev = window.location.port === '8080' || window.location.port === '3000'
      if (isDev) return 'http://localhost:4000'
    }
    return '' // Same origin
  }, [serverUrl])

  const connect = useCallback(() => {
    // Don't double-connect
    if (socketRef.current?.connected) return

    setState((prev) => ({ ...prev, status: 'connecting', error: null }))

    const url = getServerUrl()
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      autoConnect: true,
    })

    socketRef.current = socket

    // ─── Connection Events ───────────────────────────────────────────

    socket.on('connect', () => {
      reconnectAttempts.current = 0
      setState((prev) => ({
        ...prev,
        connected: true,
        status: 'connected',
        error: null,
      }))
      console.log('[AlphaEngine] Socket.io connected')
    })

    socket.on('disconnect', (reason) => {
      setState((prev) => ({
        ...prev,
        connected: false,
        status: 'disconnected',
      }))
      console.log(`[AlphaEngine] Socket.io disconnected: ${reason}`)
    })

    socket.on('connect_error', (err) => {
      reconnectAttempts.current++
      const errorMsg =
        reconnectAttempts.current >= maxReconnectAttempts
          ? 'Backend unreachable — AlphaEngine offline'
          : `Connecting to backend... (attempt ${reconnectAttempts.current})`

      setState((prev) => ({
        ...prev,
        connected: false,
        status: reconnectAttempts.current >= maxReconnectAttempts ? 'error' : 'connecting',
        error: errorMsg,
      }))

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.warn('[AlphaEngine] Max reconnect attempts reached')
        socket.close()
      }
    })

    // ─── Business Events ─────────────────────────────────────────────

    socket.on('market-attack-proposal', (data: MarketAttackProposal) => {
      setState((prev) => {
        const proposals = [data, ...prev.proposals].slice(0, maxHistory)
        return {
          ...prev,
          proposals,
          latestProposal: data,
          totalReceived: prev.totalReceived + 1,
          lastUpdate: data.timestamp || new Date().toISOString(),
        }
      })
    })

    // Generic data event (future-proofing)
    socket.on('alpha-engine-update', (data: Record<string, unknown>) => {
      console.log('[AlphaEngine] Generic update:', data)
    })
  }, [getServerUrl, maxHistory])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.close()
      socketRef.current = null
      setState((prev) => ({
        ...prev,
        connected: false,
        status: 'disconnected',
      }))
    }
  }, [])

  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      proposals: [],
      latestProposal: null,
      totalReceived: 0,
      lastUpdate: null,
    }))
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    ...state,
    connect,
    disconnect,
    clearHistory,
  }
}

export default useAlphaEngine

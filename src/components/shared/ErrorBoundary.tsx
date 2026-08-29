'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  i18n?: {
    heading?: string
    description?: string
    tryAgain?: string
    reload?: string
  }
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  reloading: boolean
}

const RELOAD_KEY = 'harvics_eb_reload'

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      reloading: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.componentError('ErrorBoundary', error, errorInfo)
    if (this.props.onError) this.props.onError(error, errorInfo)
    this.setState({ error, errorInfo })

    // Never leave the user stuck on "Something went wrong" after HMR/chunk failures.
    // Hard-navigate once per tab session; clear on successful boot (see ClearErrorReloadFlag).
    if (typeof window === 'undefined') return
    if (this.props.fallback !== undefined) return
    try {
      if (sessionStorage.getItem(RELOAD_KEY)) return
      sessionStorage.setItem(RELOAD_KEY, '1')
      this.setState({ reloading: true })
      const path = window.location.pathname || '/en'
      window.location.replace(`${path}?r=${Date.now()}`)
    } catch {
      /* ignore */
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      reloading: false,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback
      }

      if (this.state.reloading) {
        return (
          <div className="min-h-[40vh] flex items-center justify-center bg-white px-4">
            <p className="text-harvics-burgundy text-sm">Recovering…</p>
          </div>
        )
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="max-w-md w-full bg-white p-6 border border-harvics-gold/20">
            <h2 className="text-xl font-bold text-black text-center mb-2">
              {this.props.i18n?.heading || 'Something went wrong'}
            </h2>
            <p className="text-black text-center mb-4">
              {this.props.i18n?.description ||
                "We're sorry, but something unexpected happened. Please try refreshing the page."}
            </p>

            {this.state.error && (
              <details open className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-left">
                <summary className="cursor-pointer font-semibold mb-2 text-red-800">
                  Error Details
                </summary>
                <pre className="whitespace-pre-wrap text-xs text-red-700 max-h-48 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
                  {this.state.errorInfo?.componentStack || ''}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 bg-harvics-burgundy text-white px-4 py-2 font-semibold"
              >
                {this.props.i18n?.tryAgain || 'Try Again'}
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.removeItem(RELOAD_KEY)
                  } catch {
                    /* ignore */
                  }
                  window.location.assign((window.location.pathname || '/en') + '?r=' + Date.now())
                }}
                className="flex-1 border border-harvics-burgundy text-harvics-burgundy px-4 py-2 font-semibold"
              >
                {this.props.i18n?.reload || 'Reload Page'}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

/** Call once from layout chrome after a healthy mount so future crashes can auto-recover again. */
export function clearErrorBoundaryReloadFlag() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(RELOAD_KEY)
    sessionStorage.removeItem('harvics_chunk_reload')
    sessionStorage.removeItem('harvics_webpack_reload')
  } catch {
    /* ignore */
  }
}

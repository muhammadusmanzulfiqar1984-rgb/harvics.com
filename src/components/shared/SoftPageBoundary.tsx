'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Page content safety net — never traps the user on "Something went wrong".
 * On first/second failure: hard-navigate to a fresh homepage.
 * Only after repeated failures: show a single Reload button (no scary card).
 */
export default class SoftPageBoundary extends Component<
  { children: ReactNode },
  { failed: boolean; tries: number }
> {
  state = { failed: false, tries: 0 }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SoftPageBoundary]', error?.message, info?.componentStack)

    if (typeof window === 'undefined') return
    try {
      const key = 'harvics_soft_reload_count'
      const tries = Number(sessionStorage.getItem(key) || '0')
      if (tries < 2) {
        sessionStorage.setItem(key, String(tries + 1))
        const path = window.location.pathname || '/en'
        window.location.replace(`${path}?r=${Date.now()}`)
        return
      }
      this.setState({ tries })
    } catch {
      window.location.assign('/en')
    }
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-white px-4">
        <p className="text-harvics-burgundy text-sm">Page needs a fresh load.</p>
        <button
          type="button"
          className="bg-harvics-burgundy text-white px-6 py-3 font-semibold"
          onClick={() => {
            try {
              sessionStorage.removeItem('harvics_soft_reload_count')
              sessionStorage.removeItem('harvics_eb_reload')
            } catch {
              /* ignore */
            }
            window.location.assign('/en?r=' + Date.now())
          }}
        >
          Reload homepage
        </button>
      </div>
    )
  }
}

'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import DeferredMount from '@/components/shared/DeferredMount'
import ErrorBoundary, { clearErrorBoundaryReloadFlag } from '@/components/shared/ErrorBoundary'
import { HarvyXEngravedSeal } from '@/components/ui/HarvyXEngravedSeal'

const GlobalScrollReveal = dynamic(() => import('@/components/shared/GlobalScrollReveal'), { ssr: false })
const IntercomWidget = dynamic(() => import('@/components/shared/IntercomWidget'), { ssr: false })
const ZendeskWidget = dynamic(() => import('@/components/shared/ZendeskWidget'), { ssr: false })

function ClearErrorReloadFlag() {
  useEffect(() => {
    clearErrorBoundaryReloadFlag()
    try {
      sessionStorage.removeItem('harvics_soft_reload_count')
    } catch {
      /* ignore */
    }
  }, [])
  return null
}

/** Minimal deferred chrome — Intercom + reveals only. */
export default function DeferredSiteChrome() {
  return (
    <>
      <ClearErrorReloadFlag />
      <DeferredMount timeoutMs={400}>
        <ErrorBoundary fallback={null}>
          <GlobalScrollReveal />
        </ErrorBoundary>
      </DeferredMount>
      {/* Intercom launcher must never silently disappear */}
      <ErrorBoundary
        fallback={
          <div
            className="fixed z-[2147483000]"
            style={{ right: 24, bottom: 24 }}
            data-harvics-intercom-launcher="fallback"
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                try {
                  window.Intercom?.('show')
                } catch {
                  /* ignore */
                }
              }}
              aria-label="Open HarvyX"
              data-harvics-harvyx-launcher="1"
              className="harvics-harvyx-launcher-btn"
            >
              <HarvyXEngravedSeal size={56} className="harvics-harvyx-launcher-seal" />
            </button>
          </div>
        }
      >
        <IntercomWidget />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <ZendeskWidget />
      </ErrorBoundary>
    </>
  )
}

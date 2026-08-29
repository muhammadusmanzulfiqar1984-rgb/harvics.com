'use client'

/**
 * Zendesk Web Widget — support@harvicsglobalventures.zendesk.com
 * Left-bottom launcher (HarvyX sits right). Opens messenger on click.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { SUPPORT_EMAIL, ZENDESK_WIDGET_KEY, zendeskWidgetEnabled } from '@/lib/zendesk'

declare global {
  interface Window {
    zE?: (...args: unknown[]) => void
  }
}

function openZendesk() {
  if (typeof window.zE !== 'function') return false
  try {
    window.zE('messenger', 'open')
    return true
  } catch {
    /* classic widget API */
  }
  try {
    window.zE('webWidget', 'open')
    return true
  } catch {
    return false
  }
}

function configureZendeskPosition() {
  if (typeof window.zE !== 'function') return
  try {
    window.zE('webWidget', 'updateSettings', {
      webWidget: {
        position: { horizontal: 'left', vertical: 'bottom' },
        offset: { horizontal: '20px', vertical: '20px' },
      },
    })
  } catch {
    /* messaging-only accounts may ignore this */
  }
}

export default function ZendeskWidget() {
  const [ready, setReady] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const tried = useRef(false)

  const load = useCallback(() => {
    if (!zendeskWidgetEnabled() || tried.current) return
    tried.current = true

    if (document.getElementById('ze-snippet')) {
      configureZendeskPosition()
      setReady(typeof window.zE === 'function')
      return
    }

    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.async = true
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${ZENDESK_WIDGET_KEY}`
    script.onload = () => {
      let attempts = 0
      const wait = () => {
        attempts += 1
        if (typeof window.zE === 'function') {
          configureZendeskPosition()
          setReady(true)
          return
        }
        if (attempts < 40) window.setTimeout(wait, 250)
        else setHint('Support desk loading slowly — use the Support button or email us.')
      }
      wait()
    }
    script.onerror = () => setHint('Could not load Zendesk. Email support@harvicsglobalventures.zendesk.com')
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleOpen = () => {
    if (openZendesk()) {
      setHint(null)
      return
    }
    if (!ready) load()
    setHint(`Email ${SUPPORT_EMAIL} — widget still loading.`)
  }

  return (
    <div
      className="fixed z-[2147482990] flex flex-col items-start gap-2"
      style={{ left: 20, bottom: 20 }}
      data-harvics-zendesk="1"
    >
      {hint ? (
        <div className="max-w-[240px] border border-harvics-burgundy/20 bg-harvics-cream px-3 py-2 text-[11px] text-harvics-burgundy shadow-sm">
          {hint}
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open Zendesk support"
        title="Support"
        className="flex h-12 items-center gap-2 border border-harvics-burgundy/25 bg-white px-4 text-harvics-burgundy shadow-md transition hover:border-harvics-gold hover:shadow-lg"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-harvics-burgundy text-[10px] font-bold uppercase tracking-[0.06em] text-harvics-cream">
          ?
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Support</span>
      </button>
    </div>
  )
}

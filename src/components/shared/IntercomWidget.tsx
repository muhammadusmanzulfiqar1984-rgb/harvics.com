'use client'

/**
 * HarvyX assistant — Intercom chat + Vapi voice.
 * Custom gold round launcher (bottom-right).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { HarvyXEngravedSeal } from '@/components/ui/HarvyXEngravedSeal'

const APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || 'tnuivmad'
const API_BASE =
  process.env.NEXT_PUBLIC_INTERCOM_API_BASE || 'https://api-iam.intercom.io'
const WIDGET_SRC = `https://widget.intercom.io/widget/${APP_ID}`

declare global {
  interface Window {
    Intercom?: ((command?: string, ...args: unknown[]) => void) & {
      q?: unknown[]
      c?: (args: IArguments | unknown[]) => void
      booted?: boolean
    }
    intercomSettings?: Record<string, unknown>
  }
}

type CallStatus = 'idle' | 'connecting' | 'active'
type HarvyXMode = 'menu' | 'chat' | 'voice'

function installStub() {
  if (typeof window === 'undefined') return
  if (typeof window.Intercom === 'function') return
  const i: Window['Intercom'] = function () {
    // eslint-disable-next-line prefer-rest-params
    i!.c?.(arguments)
  }
  i!.q = []
  i!.c = function (args) {
    i!.q!.push(args)
  }
  window.Intercom = i
}

function buildSettings(): Record<string, unknown> {
  return {
    api_base: API_BASE,
    app_id: APP_ID,
    hide_default_launcher: true,
    action_color: '#C3A35E',
    background_color: '#3D1212',
    alignment: 'right',
    horizontal_padding: 24,
    vertical_padding: 100,
  }
}

/** Intercom injects its own maroon square Fin bubble — strip it; we use HarvyX FAB only. */
function hideIntercomDefaultLauncher() {
  if (typeof document === 'undefined') return
  const selectors = [
    '.intercom-lightweight-app-launcher',
    '.intercom-launcher-frame',
    '.intercom-launcher',
    'iframe[name="intercom-launcher-frame"]',
    '#intercom-container .intercom-launcher-frame',
    '.intercom-messenger-frame + .intercom-launcher',
  ]
  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach((el) => {
      const node = el as HTMLElement
      node.style.setProperty('display', 'none', 'important')
      node.style.setProperty('visibility', 'hidden', 'important')
      node.style.setProperty('opacity', '0', 'important')
      node.style.setProperty('pointer-events', 'none', 'important')
    })
  }
  try {
    window.Intercom?.('update', { hide_default_launcher: true })
  } catch {
    /* ignore */
  }
}

function injectWidgetScript(onLoad?: () => void) {
  if (typeof document === 'undefined') return
  const existing = document.querySelector(
    'script[data-harvics-intercom="1"]',
  ) as HTMLScriptElement | null
  if (existing) {
    if (existing.dataset.loaded === '1') onLoad?.()
    else existing.addEventListener('load', () => onLoad?.(), { once: true })
    return
  }
  const s = document.createElement('script')
  s.async = true
  s.src = WIDGET_SRC
  s.dataset.harvicsIntercom = '1'
  s.onload = () => {
    s.dataset.loaded = '1'
    onLoad?.()
  }
  s.onerror = () => {
    console.error('[HarvyX] Failed to load Intercom widget script')
  }
  document.head.appendChild(s)
}

export default function IntercomWidget() {
  const pathname = usePathname()
  const hideForEnergies = /(?:^|\/)energies(?:\/|$)/.test(pathname || '')
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<HarvyXMode>('menu')
  const [ready, setReady] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [stack, setStack] = useState<{ deepgram: boolean; vapi: boolean }>({
    deepgram: false,
    vapi: false,
  })
  const booted = useRef(false)
  const messengerReady = useRef(false)
  const vapiRef = useRef<{
    start: (id: string | object, opts?: Record<string, unknown>) => Promise<unknown>
    stop: () => void
    on: (event: string, cb: (...args: unknown[]) => void) => void
  } | null>(null)

  const bootIntercom = useCallback((extra?: Record<string, unknown>) => {
    if (!APP_ID || typeof window === 'undefined') return
    const settings = { ...buildSettings(), ...(extra || {}) }
    window.intercomSettings = settings
    installStub()

    const doBoot = () => {
      try {
        window.Intercom?.('boot', settings)
        window.Intercom!.booted = true
        messengerReady.current = true
        setReady(true)
        hideIntercomDefaultLauncher()
      } catch (err) {
        console.error('[HarvyX] Intercom boot failed', err)
        setHint('HarvyX chat failed to start. Refresh and try again.')
      }
    }

    injectWidgetScript(() => doBoot())

    if (!booted.current) {
      booted.current = true
      window.setTimeout(() => {
        if (!messengerReady.current && typeof window.Intercom === 'function') {
          doBoot()
        }
      }, 1500)
    }
  }, [])

  const openHarvyXChat = useCallback(() => {
    setHint(null)
    setMode('chat')
    setOpen(true)
    try {
      bootIntercom()
      const tryShow = (attempt = 0) => {
        try {
          if (typeof window.Intercom !== 'function') {
            if (attempt < 20) window.setTimeout(() => tryShow(attempt + 1), 250)
            else setHint('HarvyX is still loading…')
            return
          }
          if (!messengerReady.current && attempt < 12) {
            window.Intercom('boot', window.intercomSettings || buildSettings())
            messengerReady.current = true
            setReady(true)
          }
          window.Intercom('show')
        } catch {
          if (attempt < 10) window.setTimeout(() => tryShow(attempt + 1), 300)
          else setHint('Could not open HarvyX chat.')
        }
      }
      tryShow(0)
    } catch {
      setHint('Could not open HarvyX chat.')
    }
  }, [bootIntercom])

  const startHarvyXVoice = useCallback(async () => {
    setHint(null)
    setMode('voice')
    setOpen(true)
    try {
      if (callStatus === 'active' || callStatus === 'connecting') {
        vapiRef.current?.stop?.()
        setCallStatus('idle')
        window.dispatchEvent(new CustomEvent('harvics:vapi-call-end'))
        return
      }

      setCallStatus('connecting')
      const cfgRes = await fetch('/api/vapi/config')
      const cfg = await cfgRes.json()
      if (!cfgRes.ok || !cfg.publicKey || !cfg.assistantId) {
        setCallStatus('idle')
        setHint('Voice not configured. Use HarvyX chat instead.')
        return
      }
      setStack({ deepgram: Boolean(cfg.deepgram), vapi: true })

      if (!vapiRef.current) {
        const { default: Vapi } = await import('@vapi-ai/web')
        const vapi = new Vapi(cfg.publicKey)
        vapi.on('call-start', () => {
          setCallStatus('active')
          setHint(null)
          window.dispatchEvent(new CustomEvent('harvics:vapi-call-start'))
        })
        vapi.on('call-end', () => {
          setCallStatus('idle')
          window.dispatchEvent(new CustomEvent('harvics:vapi-call-end'))
        })
        vapi.on('error', (e: unknown) => {
          console.error('[HarvyX]', e)
          setCallStatus('idle')
          setHint('Voice failed. Try HarvyX chat.')
        })
        vapiRef.current = vapi
      }

      await vapiRef.current.start(cfg.assistantId, {
        metadata: {
          source: 'harvyx',
          product: 'harvyx',
          stt: 'deepgram',
          path: pathname || '/',
        },
        variableValues: {
          channel: 'harvyx',
          assistant_name: 'HarvyX',
          site_path: pathname || '/',
        },
        ...(cfg.deepgram
          ? {
              transcriber: {
                provider: 'deepgram',
                model: cfg.deepgramModel || 'nova-3',
                language: cfg.deepgramLanguage || 'en',
              },
            }
          : {}),
      })
    } catch (err) {
      console.error('[HarvyX voice]', err)
      setCallStatus('idle')
      setHint('Could not start HarvyX voice.')
    }
  }, [callStatus, pathname])

  useEffect(() => {
    if (hideForEnergies) return
    if (!APP_ID || typeof window === 'undefined') return
    bootIntercom()

    fetch('/api/vapi/config')
      .then((r) => r.json())
      .then((cfg) => {
        setStack({
          deepgram: Boolean(cfg.deepgram),
          vapi: Boolean(cfg.publicKey && cfg.assistantId),
        })
      })
      .catch(() => {})

    const onVoice = () => {
      void startHarvyXVoice()
    }
    window.addEventListener('harvics:fin-start-voice', onVoice)
    window.addEventListener('harvics:harvyx-start-voice', onVoice)

    return () => {
      window.removeEventListener('harvics:fin-start-voice', onVoice)
      window.removeEventListener('harvics:harvyx-start-voice', onVoice)
      try {
        vapiRef.current?.stop?.()
      } catch {
        /* ignore */
      }
    }
  }, [bootIntercom, startHarvyXVoice, hideForEnergies])

  useEffect(() => {
    if (hideForEnergies) return
    hideIntercomDefaultLauncher()
    const id = window.setInterval(hideIntercomDefaultLauncher, 2000)
    return () => window.clearInterval(id)
  }, [hideForEnergies, ready, open])

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      if (q.get('fin_voice') === '1' || q.get('harvyx_voice') === '1') void startHarvyXVoice()
      else if (q.get('fin') === '1' || q.get('harvyx') === '1') openHarvyXChat()
    } catch {
      /* ignore */
    }
  }, [openHarvyXChat, startHarvyXVoice])

  useEffect(() => {
    if (!messengerReady.current || typeof window.Intercom !== 'function') return
    try {
      window.Intercom('update', { last_request_at: Math.floor(Date.now() / 1000) })
    } catch {
      /* ignore */
    }
  }, [pathname])

  if (hideForEnergies) return null

  const toggleDock = () => {
    if (open) {
      setOpen(false)
      setMode('menu')
      if (callStatus === 'active' || callStatus === 'connecting') {
        try {
          vapiRef.current?.stop?.()
        } catch {
          /* ignore */
        }
        setCallStatus('idle')
      }
      try {
        window.Intercom?.('hide')
      } catch {
        /* ignore */
      }
      return
    }
    setOpen(true)
    setMode('menu')
  }

  const voiceActive = callStatus === 'active' || callStatus === 'connecting'

  return (
    <div
      className="fixed z-[2147483000] flex flex-col items-end gap-3"
      style={{ right: 24, bottom: 24 }}
      data-harvics-harvyx="1"
    >
      {open && mode === 'menu' && (
        <div
          className="w-[300px] overflow-hidden rounded-2xl border border-harvics-gold/50 bg-harvics-burgundy text-harvics-cream shadow-2xl"
          role="dialog"
          aria-label="HarvyX"
        >
          <div className="bg-gradient-to-br from-harvics-burgundy to-[#2a0c0c] px-5 py-4">
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.24em] text-harvics-gold">
              HarvyX
            </p>
            <p className="m-0 mt-1.5 text-[14px] font-medium leading-snug text-harvics-cream">
              Sovereign growth assistant — chat or voice.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 p-4">
            <button
              type="button"
              onClick={openHarvyXChat}
              className="rounded-xl border border-harvics-gold/40 bg-harvics-cream/10 px-4 py-3 text-left transition hover:border-harvics-gold hover:bg-harvics-gold/15"
            >
              <span className="block text-[13px] font-semibold text-harvics-gold">Chat with HarvyX</span>
              <span className="block text-[11px] text-harvics-cream/65">Trade, logistics, RFQ, OS</span>
            </button>
            <button
              type="button"
              onClick={() => void startHarvyXVoice()}
              disabled={!stack.vapi || callStatus === 'connecting'}
              className="rounded-xl border border-harvics-gold/40 bg-harvics-cream/10 px-4 py-3 text-left transition hover:border-harvics-gold hover:bg-harvics-gold/15 disabled:opacity-50"
            >
              <span className="block text-[13px] font-semibold text-harvics-gold">
                {callStatus === 'active' ? 'End voice call' : 'Talk to HarvyX'}
              </span>
              <span className="block text-[11px] text-harvics-cream/65">
                Voice{stack.deepgram ? ' · Deepgram' : ''}
              </span>
            </button>
          </div>
          {(hint || !ready) && (
            <p className="m-0 border-t border-harvics-gold/20 px-4 py-2.5 text-[11px] text-harvics-cream/75">
              {hint || (!ready ? 'Loading HarvyX…' : null)}
            </p>
          )}
        </div>
      )}

      {open && mode === 'voice' && (
        <div className="w-[300px] rounded-2xl border border-harvics-gold/50 bg-harvics-burgundy px-5 py-4 text-harvics-cream shadow-2xl">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.22em] text-harvics-gold">
            HarvyX · Voice
          </p>
          <p className="m-0 mt-2 text-[14px]">
            {callStatus === 'connecting' && 'Connecting…'}
            {callStatus === 'active' && 'Listening — speak with HarvyX'}
            {callStatus === 'idle' && (hint || 'Voice ended')}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void startHarvyXVoice()}
              className="rounded-lg border border-harvics-gold/50 px-3 py-1.5 text-[12px] text-harvics-gold"
            >
              {voiceActive ? 'End' : 'Retry'}
            </button>
            <button
              type="button"
              onClick={openHarvyXChat}
              className="rounded-lg border border-harvics-cream/25 px-3 py-1.5 text-[12px] text-harvics-cream/85"
            >
              Switch to chat
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleDock}
        aria-label={open ? 'Close HarvyX' : 'Open HarvyX'}
        title="HarvyX"
        data-harvics-harvyx-launcher="1"
        className={`harvics-harvyx-launcher-btn ${voiceActive ? 'is-voice-active' : ''} ${open ? 'is-open' : ''}`}
      >
        <HarvyXEngravedSeal size={56} className="harvics-harvyx-launcher-seal" />
      </button>
    </div>
  )
}

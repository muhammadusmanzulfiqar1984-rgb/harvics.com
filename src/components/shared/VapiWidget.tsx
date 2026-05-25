'use client'

import { useEffect } from 'react'

const VAPI_PUBLIC_KEY = 'f8b8d074-afb7-4dbf-add9-3dc6bf85a7c7'
const VAPI_ASSISTANT_ID = 'd365a886-edfa-45ca-ba41-905ae3ac29c6'
const VAPI_SRC = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js'

const config = {
  position: 'bottom-left',
  offset: '24px',
  width: '64px',
  height: '64px',
  idle: {
    color: 'rgb(195,163,94)',
    type: 'round',
    title: 'Talk to HARVICS',
    subtitle: 'Voice AI Assistant',
    icon: 'https://unpkg.com/lucide-static@latest/icons/phone-call.svg',
  },
  loading: {
    color: 'rgb(229,192,123)',
    type: 'round',
    title: 'Connecting…',
    subtitle: '',
    icon: 'https://unpkg.com/lucide-static@latest/icons/loader-2.svg',
  },
  active: {
    color: 'rgb(107,31,43)',
    type: 'round',
    title: 'On call',
    subtitle: 'Tap to end',
    icon: 'https://unpkg.com/lucide-static@latest/icons/phone-off.svg',
  },
}

type VapiWindow = {
  vapiSDK?: { run: (o: Record<string, unknown>) => unknown }
  vapiInstance?: unknown
  __vapiBootstrapped?: boolean
}

export default function VapiWidget() {
  useEffect(() => {
    const w = window as unknown as VapiWindow
    if (w.__vapiBootstrapped) return
    w.__vapiBootstrapped = true

    const tryInit = (attempt = 0) => {
      if (w.vapiInstance) return
      if (w.vapiSDK?.run) {
        try {
          w.vapiInstance = w.vapiSDK.run({
            apiKey: VAPI_PUBLIC_KEY,
            assistant: VAPI_ASSISTANT_ID,
            config,
          })
        } catch (err) {
          console.error('[Vapi] init failed:', err)
        }
        return
      }
      if (attempt < 40) {
        // Poll up to ~10s for window.vapiSDK to attach
        setTimeout(() => tryInit(attempt + 1), 250)
      } else {
        console.warn('[Vapi] vapiSDK never attached to window')
      }
    }

    if (!document.querySelector(`script[src="${VAPI_SRC}"]`)) {
      const s = document.createElement('script')
      s.src = VAPI_SRC
      s.defer = true
      s.async = true
      s.onload = () => tryInit()
      s.onerror = () => console.error('[Vapi] failed to load CDN script')
      document.head.appendChild(s)
    } else {
      tryInit()
    }
  }, [])

  return null
}

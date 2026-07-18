'use client'

import { useEffect } from 'react'

const VAPI_PUBLIC_KEY = 'f8b8d074-afb7-4dbf-add9-3dc6bf85a7c7'
const VAPI_ASSISTANT_ID = 'd365a886-edfa-45ca-ba41-905ae3ac29c6'
const VAPI_SRC = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js'

// Solid phone glyph from Lucide (white fill so it pops on the gold button)
const VICTORIAN_PHONE_SVG = 'https://unpkg.com/lucide-static@latest/icons/phone.svg'

const config = {
  position: 'bottom-right',
  // Mobile: stack widget above chatbot (chatbot is at bottom-4 = 16px, w-11 = 44px tall + padding)
  offset: '76px',
  width: '60px',
  height: '60px',
  idle: {
    color: 'rgb(195, 163, 94)',
    type: 'round',
    title: 'Talk to HARVICS',
    subtitle: 'Voice AI',
    icon: VICTORIAN_PHONE_SVG,
  },
  loading: {
    color: 'rgb(229,192,123)',
    type: 'round',
    title: 'Connecting…',
    subtitle: '',
    icon: VICTORIAN_PHONE_SVG,
  },
  active: {
    color: 'rgb(107,31,43)',
    type: 'round',
    title: 'On call',
    subtitle: 'Tap to end',
    icon: VICTORIAN_PHONE_SVG,
  },
}

type VapiWindow = {
  vapiSDK?: { run: (o: Record<string, unknown>) => unknown }
  vapiInstance?: unknown
  __vapiBootstrapped?: boolean
}

const STYLE_ID = 'harvics-vapi-victorian-style'

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return
  const css = `
    /* Victorian gold telephone button — Vapi widget */
    [id^="vapi-"], [class*="vapi"] button {
      transition: transform .25s ease, box-shadow .25s ease !important;
    }
    [id^="vapi-support-btn"], div[id^="vapi-"] > button:first-of-type {
      background: radial-gradient(circle at 30% 25%, #FBE7A1 0%, #D6B36A 45%, #8A6A1F 100%) !important;
      border: 2px solid #3d2208 !important;
      border-radius: 50% !important;
      box-shadow:
        inset 0 1px 2px rgba(255,255,255,.6),
        inset 0 -3px 6px rgba(61,34,8,.45),
        0 6px 14px rgba(107,31,43,.25),
        0 0 0 3px rgba(195, 163, 94,.18) !important;
      animation: harvicsRing 2.6s ease-in-out infinite !important;
    }
    /* Force the phone icon to be visible (white fill) */
    [id^="vapi-support-btn"] img, div[id^="vapi-"] > button:first-of-type img {
      filter: brightness(0) invert(1) drop-shadow(0 1px 1px rgba(0,0,0,.3)) !important;
      width: 50% !important;
      height: 50% !important;
    }
    [id^="vapi-support-btn"]:hover, div[id^="vapi-"] > button:first-of-type:hover {
      transform: translateY(-3px) scale(1.04) !important;
      box-shadow:
        inset 0 1px 2px rgba(255,255,255,.7),
        inset 0 -3px 6px rgba(61,34,8,.5),
        0 12px 24px rgba(107,31,43,.4),
        0 0 0 4px rgba(229,192,123,.35) !important;
    }
    @keyframes harvicsRing {
      0%, 60%, 100% { transform: rotate(0deg); }
      62% { transform: rotate(-8deg); }
      64% { transform: rotate(8deg); }
      66% { transform: rotate(-6deg); }
      68% { transform: rotate(6deg); }
      70% { transform: rotate(0deg); }
    }
    /* Mobile: bump up to 64×64, stack above the chatbot button instead of beside it */
    @media (max-width: 640px) {
      [id^="vapi-support-btn"], div[id^="vapi-"] > button:first-of-type {
        width: 64px !important;
        height: 64px !important;
        bottom: 76px !important;
        right: 12px !important;
        left: auto !important;
      }
    }
  `
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

export default function VapiWidget() {
  useEffect(() => {
    const w = window as unknown as VapiWindow
    if (w.__vapiBootstrapped) return
    w.__vapiBootstrapped = true

    injectStyle()

    const tryInit = (attempt = 0) => {
      if (w.vapiInstance) return
      if (w.vapiSDK?.run) {
        try {
          w.vapiInstance = w.vapiSDK.run({
            apiKey: VAPI_PUBLIC_KEY,
            assistant: VAPI_ASSISTANT_ID,
            config,
          })
          // Wire call lifecycle to background music pause/resume
          const inst = w.vapiInstance as { on?: (e: string, cb: () => void) => void } | undefined
          if (inst && typeof inst.on === 'function') {
            inst.on('call-start', () => {
              window.dispatchEvent(new CustomEvent('harvics:vapi-call-start'))
            })
            inst.on('call-end', () => {
              window.dispatchEvent(new CustomEvent('harvics:vapi-call-end'))
            })
          }
        } catch (err) {
          console.error('[Vapi] init failed:', err)
        }
        return
      }
      if (attempt < 40) {
        setTimeout(() => tryInit(attempt + 1), 250)
      }
    }

    if (!document.querySelector(`script[src="${VAPI_SRC}"]`)) {
      const s = document.createElement('script')
      s.src = VAPI_SRC
      s.defer = true
      s.async = true
      s.onload = () => tryInit()
      document.head.appendChild(s)
    } else {
      tryInit()
    }
  }, [])

  return null
}

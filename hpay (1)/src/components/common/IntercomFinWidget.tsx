import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { getCachedUser } from '../../services/hpayApi';

const APP_ID =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_INTERCOM_APP_ID ||
  'tnuivmad';
const API_BASE =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_INTERCOM_API_BASE ||
  'https://api-iam.intercom.io';
const WIDGET_SRC = `https://widget.intercom.io/widget/${APP_ID}`;

declare global {
  interface Window {
    Intercom?: ((command?: string, ...args: unknown[]) => void) & {
      q?: unknown[];
      c?: (args: IArguments | unknown[]) => void;
      booted?: boolean;
    };
    intercomSettings?: Record<string, unknown>;
  }
}

function installStub() {
  if (typeof window === 'undefined') return;
  if (typeof window.Intercom === 'function') return;
  const i: Window['Intercom'] = function () {
    // eslint-disable-next-line prefer-rest-params
    i!.c?.(arguments);
  };
  i!.q = [];
  i!.c = function (args) {
    i!.q!.push(args);
  };
  window.Intercom = i;
}

function buildSettings(extra?: Record<string, unknown>): Record<string, unknown> {
  const user = getCachedUser();
  return {
    api_base: API_BASE,
    app_id: APP_ID,
    hide_default_launcher: true,
    action_color: '#800020',
    background_color: '#180C10',
    alignment: 'right',
    horizontal_padding: 20,
    vertical_padding: 96,
    custom_launcher_selector: '[data-hpay-intercom-launcher]',
    ...(user
      ? {
          email: user.email,
          name: user.name,
          user_id: user.id,
          hpay_id: user.hpay_id,
          product: 'hpay',
        }
      : { product: 'hpay', visitor: true }),
    ...(extra || {}),
  };
}

function injectWidgetScript(onLoad?: () => void) {
  if (typeof document === 'undefined') return;
  const existing = document.querySelector(
    'script[data-hpay-intercom="1"]'
  ) as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === '1') onLoad?.();
    else existing.addEventListener('load', () => onLoad?.(), { once: true });
    return;
  }
  const s = document.createElement('script');
  s.async = true;
  s.src = WIDGET_SRC;
  s.dataset.hpayIntercom = '1';
  s.onload = () => {
    s.dataset.loaded = '1';
    onLoad?.();
  };
  s.onerror = () => {
    console.error('[HPay Fin] Failed to load Intercom widget');
  };
  document.head.appendChild(s);
}

type IntercomFinWidgetProps = {
  /** Bump when auth user changes so Intercom updates identity */
  identityKey?: string;
};

export const IntercomFinWidget: React.FC<IntercomFinWidgetProps> = ({ identityKey }) => {
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const messengerReady = useRef(false);
  const booted = useRef(false);

  const boot = useCallback((extra?: Record<string, unknown>) => {
    if (!APP_ID || typeof window === 'undefined') return;
    const settings = buildSettings(extra);
    window.intercomSettings = settings;
    installStub();

    const doBoot = () => {
      try {
        if (window.Intercom?.booted) {
          window.Intercom('update', settings);
        } else {
          window.Intercom?.('boot', settings);
          window.Intercom!.booted = true;
        }
        messengerReady.current = true;
        setReady(true);
        setHint(null);
      } catch (err) {
        console.error('[HPay Fin] boot failed', err);
        setHint('Fin chat failed to start');
      }
    };

    injectWidgetScript(doBoot);
    if (!booted.current) {
      booted.current = true;
      window.setTimeout(() => {
        if (!messengerReady.current && typeof window.Intercom === 'function') doBoot();
      }, 1500);
    }
  }, []);

  useEffect(() => {
    boot();
  }, [boot, identityKey]);

  const openChat = () => {
    setHint(null);
    boot();
    const tryShow = (attempt = 0) => {
      try {
        if (typeof window.Intercom !== 'function') {
          if (attempt < 20) window.setTimeout(() => tryShow(attempt + 1), 250);
          else setHint('Fin is still loading…');
          return;
        }
        if (!messengerReady.current && attempt < 12) {
          window.Intercom('boot', window.intercomSettings || buildSettings());
          messengerReady.current = true;
          setReady(true);
        }
        window.Intercom('show');
      } catch {
        if (attempt < 10) window.setTimeout(() => tryShow(attempt + 1), 300);
        else setHint('Could not open Fin');
      }
    };
    tryShow(0);
  };

  if (!APP_ID) return null;

  return (
    <div
      className="fixed z-[2147483000] flex flex-col items-end gap-2"
      style={{ right: 20, bottom: 20 }}
      data-hpay-fin="1"
    >
      {hint && (
        <p className="max-w-[220px] rounded-lg border border-[#3A1A22] bg-[#180C10] px-3 py-2 text-[11px] text-[#A89887]">
          {hint}
        </p>
      )}
      <button
        type="button"
        onClick={openChat}
        aria-label="Chat with Fin"
        title={ready ? 'Fin · Intercom' : 'Loading Fin…'}
        data-hpay-intercom-launcher="1"
        className="flex h-12 items-center gap-2 rounded-xl border border-[#7D2235] bg-[#180C10] px-3.5 text-[#E8DCC4] shadow-lg shadow-[#800020]/25 transition hover:bg-[#4A101D]"
      >
        <MessageCircle className="h-4 w-4 text-[#E8DCC4]" />
        <span className="text-xs font-semibold tracking-wide">Fin</span>
        {!ready && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4C3A3]" />}
      </button>
    </div>
  );
};

export default IntercomFinWidget;

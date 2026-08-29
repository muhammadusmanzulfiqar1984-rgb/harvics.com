'use client';

import { SignOutButton } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

function readNext(): string {
  if (typeof window === 'undefined') return '/app/sign-up';
  return (
    new URLSearchParams(window.location.search).get('next') ||
    '/app/sign-in?redirect_url=%2Fharvyx.html'
  );
}

/** Minimal sign-out: button + auto-click + hard redirect failsafe. */
export default function SignOutPage() {
  const next = readNext();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t1 = window.setTimeout(() => btnRef.current?.click(), 300);
    const t2 = window.setTimeout(() => {
      window.location.replace(next);
    }, 2000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [next]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#F5F0E8',
        color: '#3D1212',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <p style={{ margin: '0 0 8px', letterSpacing: '0.2em', fontSize: 11, fontWeight: 600, color: '#C3A35E' }}>
          HARVYX
        </p>
        <p style={{ margin: '0 0 20px', color: '#8A7D6B' }}>Signing out…</p>
        <SignOutButton redirectUrl={next}>
          <button
            ref={btnRef}
            type="button"
            style={{
              padding: '12px 22px',
              background: '#3D1212',
              color: '#F5F0E8',
              border: 0,
              borderRadius: 4,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </SignOutButton>
        <p style={{ marginTop: 16 }}>
          <a href={next} style={{ color: '#C3A35E' }}>
            Skip to sign-up →
          </a>
        </p>
      </div>
    </main>
  );
}

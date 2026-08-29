import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import HarvyXSignUpForm from './HarvyXSignUpForm';

export const dynamic = 'force-dynamic';

export default async function SignUpPage() {
  const pk =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '';

  if (!pk) {
    return (
      <main style={shell}>
        <p>Clerk is not configured.</p>
      </main>
    );
  }

  let signedIn = false;
  try {
    const session = await auth();
    signedIn = Boolean(session?.userId);
  } catch {
    signedIn = false;
  }

  if (signedIn) {
    return (
      <main style={shell}>
        <Brand />
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#8A7D6B', textAlign: 'center', maxWidth: 360 }}>
          You&apos;re already signed in. Sign out first to create a new account.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <Link href="/app/sign-out?next=/app/sign-up" style={btnPrimary}>
            Sign out
          </Link>
          <Link href="/harvyx.html" style={btnGhost}>
            Open console
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={shell}>
      <Brand subtitle="Create an account for the operator console" />
      <HarvyXSignUpForm />
      <Link href="/en/apps/harvyx" style={{ fontSize: 12, color: '#8A7D6B', textDecoration: 'none' }}>
        About HarvyX
      </Link>
    </main>
  );
}

function Brand({ subtitle }: { subtitle?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C3A35E' }}>
        HarvyX
      </p>
      <h1 style={{ margin: '12px 0 8px', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: '#3D1212', fontFamily: 'Georgia, serif' }}>
        Growth OS
      </h1>
      {subtitle ? <p style={{ margin: 0, fontSize: 14, color: '#8A7D6B' }}>{subtitle}</p> : null}
    </div>
  );
}

const shell: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 28,
  padding: '48px 24px',
  background:
    'radial-gradient(ellipse at 12% 0%, rgba(61,18,18,0.06) 0%, transparent 42%), radial-gradient(ellipse at 88% 100%, rgba(195,163,94,0.14) 0%, transparent 45%), #F5F0E8',
  color: '#3D1212',
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
};

const btnPrimary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 140,
  padding: '14px 28px',
  borderRadius: 4,
  background: '#3D1212',
  color: '#F5F0E8',
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none',
};

const btnGhost: CSSProperties = {
  ...btnPrimary,
  background: 'transparent',
  color: '#3D1212',
  border: '1px solid rgba(61,18,18,0.25)',
};

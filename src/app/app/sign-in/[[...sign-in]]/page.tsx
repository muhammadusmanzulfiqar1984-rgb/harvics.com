import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/** HarvyX login app — cream / burgundy / gold (site theme). No marketing chrome. */
export default function SignInPage() {
  const pk =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '';
  if (!pk) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#F5F0E8',
          color: '#3D1212',
          padding: 40,
          textAlign: 'center',
        }}
      >
        <div>
          <p>Clerk is not configured.</p>
          <a href="/harvyx.html" style={{ color: '#C3A35E' }}>
            Open console
          </a>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
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
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#C3A35E',
          }}
        >
          HarvyX
        </p>
        <h1
          style={{
            margin: '12px 0 8px',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#3D1212',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          Growth OS
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#8A7D6B' }}>
          Sign in to open the operator console
        </p>
      </div>

      <SignIn
        routing="path"
        path="/app/sign-in"
        signUpUrl="/app/sign-up"
        fallbackRedirectUrl="/harvyx.html"
        forceRedirectUrl="/harvyx.html"
        appearance={{
          variables: {
            colorPrimary: '#3D1212',
            colorBackground: '#FBF8F3',
            colorText: '#3D1212',
            colorInputBackground: '#ffffff',
            colorInputText: '#3D1212',
            borderRadius: '0.375rem',
          },
          elements: {
            rootBox: { margin: '0 auto', width: '100%', maxWidth: 400 },
            card: {
              boxShadow: 'none',
              border: '1px solid rgba(61,18,18,0.12)',
              background: '#FBF8F3',
            },
            headerTitle: { display: 'none' },
            headerSubtitle: { display: 'none' },
            formButtonPrimary: {
              background: '#3D1212',
              color: '#F5F0E8',
              boxShadow: 'none',
            },
            footerActionLink: { color: '#C3A35E' },
            socialButtonsBlockButton: {
              border: '1px solid rgba(61,18,18,0.15)',
              background: '#fff',
            },
          },
        }}
      />

      <Link href="/en/apps/harvyx" style={{ fontSize: 12, color: '#8A7D6B', textDecoration: 'none' }}>
        About HarvyX
      </Link>
    </main>
  );
}

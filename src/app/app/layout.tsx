import { ClerkProvider } from '@clerk/nextjs';
import '../globals.css';

export const dynamic = 'force-dynamic';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pk =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '';

  return (
    <html lang="en">
      <body className="min-h-screen m-0 bg-harvics-cream text-harvics-burgundy antialiased">
        {pk ? <ClerkProvider publishableKey={pk}>{children}</ClerkProvider> : children}
      </body>
    </html>
  );
}

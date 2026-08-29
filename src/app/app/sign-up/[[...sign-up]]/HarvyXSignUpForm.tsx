'use client';

import { SignUp } from '@clerk/nextjs';

export default function HarvyXSignUpForm() {
  return (
    <SignUp
      routing="path"
      path="/app/sign-up"
      signInUrl="/app/sign-in"
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
  );
}

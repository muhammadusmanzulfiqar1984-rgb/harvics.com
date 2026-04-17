import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use | Harvics Global Ventures',
  description: 'Terms and conditions governing the use of the Harvics Global Ventures website and services.',
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20" style={{ color: '#3d1a22' }}>
      <div style={{ marginBottom: '48px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C3A35E', marginBottom: '12px', fontFamily: '-apple-system, sans-serif' }}>
          Legal
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#6B1F2B', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginBottom: '16px' }}>
          Terms of Use
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(107,31,43,0.5)', fontFamily: '-apple-system, sans-serif' }}>
          Last updated: April 2026
        </p>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, #C3A35E, transparent)', marginTop: '24px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', fontSize: '15px', lineHeight: 1.75, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#3d1a22' }}>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>1. Acceptance of Terms</h2>
          <p>By accessing or using the Harvics Global Ventures website (harvics.com), you agree to be bound by these Terms of Use. If you do not agree, please do not use this website. These terms apply to all visitors, users, and enquirers.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>2. Use of the Website</h2>
          <p>This website is provided for informational and commercial enquiry purposes only. You agree not to misuse, scrape, copy, or reverse-engineer any part of this website. Unauthorised use may give rise to a claim for damages and/or be a criminal offence.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>3. Intellectual Property</h2>
          <p>All content on this website — including text, images, logos, product descriptions, and trade data — is the property of Harvics Global Ventures Ltd and is protected by applicable intellectual property laws. No content may be reproduced without prior written permission.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>4. Accuracy of Information</h2>
          <p>We endeavour to keep product listings, pricing, and market information accurate and up to date. However, Harvics makes no warranty as to the completeness or accuracy of any information on this website. All commercial terms are subject to formal written agreement.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>5. Limitation of Liability</h2>
          <p>Harvics Global Ventures Ltd shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this website or reliance on any information contained herein. Use of this website is at your own risk.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>6. Third-Party Links</h2>
          <p>This website may contain links to third-party websites. Harvics is not responsible for the content, privacy practices, or terms of any third-party site. Links are provided for convenience only and do not imply endorsement.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>7. Governing Law</h2>
          <p>These Terms of Use are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>8. Contact</h2>
          <p>For any questions regarding these terms, contact us at <a href="mailto:sales.uk@harvics.com" style={{ color: '#C3A35E', textDecoration: 'none' }}>sales.uk@harvics.com</a>.</p>
        </section>

      </div>
    </main>
  )
}

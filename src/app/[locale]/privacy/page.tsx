import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Harvics Global Ventures',
  description: 'How Harvics Global Ventures collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20" style={{ color: '#3d1a22' }}>
      <div style={{ marginBottom: '48px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C3A35E', marginBottom: '12px', fontFamily: '-apple-system, sans-serif' }}>
          Legal
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#6B1F2B', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginBottom: '16px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(107,31,43,0.5)', fontFamily: '-apple-system, sans-serif' }}>
          Last updated: April 2026
        </p>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, #C3A35E, transparent)', marginTop: '24px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', fontSize: '15px', lineHeight: 1.75, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#3d1a22' }}>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>1. Who We Are</h2>
          <p>Harvics Global Ventures Ltd is a global trading and distribution company headquartered in London, United Kingdom. We operate across 10 industry verticals in 42+ markets worldwide. References to "Harvics", "we", "us", or "our" in this policy refer to Harvics Global Ventures Ltd and its subsidiaries.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>2. Data We Collect</h2>
          <p>We collect information you provide directly — including your name, company, email address, phone number, and enquiry details when you submit a contact or sourcing form. We also collect standard server logs, browser type, and anonymised usage data to improve our platform.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>3. How We Use Your Data</h2>
          <p>Your data is used solely to respond to your enquiry, process your request, and improve our services. We do not sell, rent, or share your personal information with third parties for marketing purposes. Data may be shared with internal teams (sales, logistics, compliance) on a need-to-know basis.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>4. Data Retention</h2>
          <p>We retain enquiry and contact data for a maximum of 24 months unless a longer period is required by law or an active commercial relationship exists. You may request deletion of your data at any time by contacting us at <a href="mailto:sales.uk@harvics.com" style={{ color: '#C3A35E', textDecoration: 'none' }}>sales.uk@harvics.com</a>.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>5. Cookies</h2>
          <p>This website uses essential cookies to operate correctly and anonymous analytics cookies to understand site usage. No third-party advertising cookies are used. You may disable cookies in your browser settings; however, some features may not function as intended.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>6. Your Rights</h2>
          <p>Under GDPR and applicable UK data protection law, you have the right to access, correct, delete, or restrict the processing of your personal data. To exercise these rights, contact our Data Protection contact at <a href="mailto:sales.uk@harvics.com" style={{ color: '#C3A35E', textDecoration: 'none' }}>sales.uk@harvics.com</a>.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#6B1F2B', marginBottom: '10px', letterSpacing: '-0.01em' }}>7. Contact</h2>
          <p>Harvics Global Ventures Ltd<br />London, United Kingdom<br />
          Email: <a href="mailto:sales.uk@harvics.com" style={{ color: '#C3A35E', textDecoration: 'none' }}>sales.uk@harvics.com</a><br />
          Phone: +44 7405 527427</p>
        </section>

      </div>
    </main>
  )
}

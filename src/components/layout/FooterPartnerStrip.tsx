'use client'

const CACHE = 'v5'

type PartnerLogo = {
  name: string
  src: string
  w: number
}

const PARTNERS: PartnerLogo[] = [
  { name: 'Nebius', src: `/assets/brand/partners/nebius.svg?${CACHE}`, w: 120 },
  { name: 'ElevenLabs', src: `/assets/brand/partners/elevenlabs.svg?${CACHE}`, w: 140 },
  { name: 'MongoDB', src: `/assets/brand/partners/mongodb.svg?${CACHE}`, w: 130 },
  { name: 'Confluent', src: `/assets/brand/partners/confluent.svg?${CACHE}`, w: 130 },
  { name: 'Lambda', src: `/assets/brand/partners/lambda.svg?${CACHE}`, w: 120 },
  { name: 'NVIDIA Inception', src: `/assets/brand/partners/nvidia.svg?${CACHE}`, w: 120 },
  { name: 'Google for Startups', src: `/assets/brand/partners/google-for-startups.svg?${CACHE}`, w: 110 },
  { name: 'AWS', src: `/assets/brand/partners/aws.svg?${CACHE}`, w: 110 },
  { name: 'Cloudflare', src: `/assets/brand/partners/cloudflare.svg?${CACHE}`, w: 120 },
  { name: 'Deepgram', src: `/assets/brand/partners/deepgram-raw.svg?${CACHE}`, w: 130 },
  { name: 'Intercom', src: `/assets/brand/partners/intercom.svg?${CACHE}`, w: 120 },
]

export default function FooterPartnerStrip() {
  return (
    <section
      id="tech-partners"
      aria-labelledby="footer-partners-heading"
      style={{
        background: 'var(--harvics-cream)',
        padding: '28px 0 32px',
        borderTop: '1px solid rgba(195, 163, 94, 0.35)',
        borderBottom: '1px solid rgba(195, 163, 94, 0.2)',
      }}
    >
      <div className="universal-layout-frame px-4 sm:px-6 lg:px-8">
        <p
          id="footer-partners-heading"
          style={{
            margin: '0 0 20px',
            fontSize: 9,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'var(--harvics-burgundy)',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          Built on &amp; supported by
        </p>

        <ul
          aria-label="Technology partners"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px 40px',
          }}
        >
          {PARTNERS.map((partner) => (
            <li
              key={partner.name}
              title={partner.name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 40,
                minWidth: 88,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partner.src}
                alt={partner.name}
                width={partner.w}
                height={40}
                loading="eager"
                decoding="async"
                style={{
                  height: 40,
                  width: 'auto',
                  maxWidth: 150,
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'none',
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import HarvicsTvPlayer from '@/components/home/HarvicsTvPlayer'

/**
 * Harvics TV — recessed television on the homepage (between Live Listings and Apps).
 * Shell is a server component; the player loads the compressed reel only when on screen.
 */
export default async function HarvicsTvSection() {
  const locale = await getLocale()

  return (
    <section
      id="harvics-tv"
      className="relative overflow-hidden bg-[#0a0506] text-harvics-cream"
      style={{
        padding: 'clamp(72px, 9vw, 112px) 0 clamp(64px, 8vw, 96px)',
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 720px',
      }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[920px] px-5 md:px-8">
        <div className="mb-10 text-center md:mb-12">
          <h2
            className="mb-3 text-harvics-cream"
            style={{
              fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
              fontSize: 'clamp(42px, 6.5vw, 64px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
            }}
          >
            Harvics TV
          </h2>
          <p className="mx-auto max-w-[42ch] text-[15px] leading-relaxed text-harvics-cream/55">
            The house screen — Classic food reel for the corridor.
          </p>
        </div>

        <div className="mx-auto w-full">
          <div
            className="rounded-[26px] p-[14px] md:rounded-[32px] md:p-5"
            style={{
              background: 'linear-gradient(155deg, #3a282c 0%, #1a1012 38%, #0d0809 72%, #151012 100%)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(195,163,94,0.18)',
            }}
          >
            <div
              className="rounded-[18px] p-[10px] md:rounded-[22px] md:p-3"
              style={{ background: '#050303' }}
            >
              <HarvicsTvPlayer />
            </div>

            <div className="mt-4 flex items-center justify-between px-2 md:mt-5 md:px-3">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.28em] text-harvics-gold/80"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                HARVICS
              </span>
              <div className="flex items-center gap-2" aria-hidden>
                <span className="h-[3px] w-14 rounded-full bg-white/10" />
                <span className="h-2 w-2 rounded-full bg-harvics-gold/80" />
                <span className="h-[3px] w-14 rounded-full bg-white/10" />
              </div>
              <Link
                href={`/${locale}/fmcg`}
                className="text-[9px] font-bold uppercase tracking-[0.16em] text-harvics-cream/45 hover:text-harvics-gold"
              >
                Catalogue →
              </Link>
            </div>
          </div>

          <div className="mx-auto flex w-[26%] max-w-[160px] flex-col items-center" aria-hidden>
            <div
              className="h-4 w-[38%]"
              style={{ background: 'linear-gradient(180deg, #24181b 0%, #100b0c 100%)' }}
            />
            <div
              className="h-2 w-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, #2c1e22 18%, #3a282c 50%, #2c1e22 82%, transparent 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

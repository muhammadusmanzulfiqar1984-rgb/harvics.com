'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

/**
 * Landing teaser for Startup Academy — copy from startupAcademy.teaser.
 */
export default function StartupAcademyTeaser() {
  const locale = useLocale()
  const t = useTranslations('startupAcademy.teaser')

  return (
    <section
      id="startup-academy"
      className="relative flex min-h-[72vh] items-end overflow-hidden bg-harvics-burgundy"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/academy/academy-hero-lecture-hall.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover brightness-[0.45]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(61,18,18,0.92) 0%, rgba(61,18,18,0.45) 55%, rgba(61,18,18,0.2) 100%)',
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-20 pt-28 md:px-12">
        <p className="mb-3 harvics-corridor-eyebrow text-[11px] tracking-[0.22em] text-harvics-gold">
          {t('eyebrow')}
        </p>
        <h2
          className="mb-4 max-w-[14ch] harvics-corridor-display text-harvics-cream"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('title')}
        </h2>
        <p className="mb-8 max-w-[44ch] harvics-corridor-body text-harvics-cream/70">{t('body')}</p>
        <Link
          href={`/${locale}/startup-academy`}
          className="inline-flex items-center px-6 py-3.5 bg-harvics-gold text-harvics-burgundy text-[11px] font-bold uppercase tracking-[0.14em]"
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  )
}

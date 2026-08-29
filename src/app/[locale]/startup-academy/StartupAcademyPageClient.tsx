'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'

const IMG = {
  hero: '/assets/academy/academy-hero-lecture-hall.png',
  trade: '/assets/academy/academy-still-trade-tools.png',
  atelier: '/assets/academy/academy-atelier-textiles.png',
  salon: '/assets/academy/academy-salon-network.png',
  study: '/assets/academy/academy-study-intelligence.png',
  funding: '/assets/academy/academy-funding-still.png',
  library: '/assets/academy/academy-grand-library.png',
  harbor: '/assets/academy/academy-harbor-commerce.png',
  qc: '/assets/academy/academy-qc-instruments.png',
  boardroom: '/assets/academy/academy-boardroom.png',
  loft: '/assets/academy/academy-commodity-loft.png',
} as const

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-8% 0px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.97, y: 10 }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function StartupAcademyPageClient({ locale }: { locale: string }) {
  const t = useTranslations('startupAcademy')

  const stats = [
    ['120', t('stats.founders')],
    ['12', t('stats.sessions')],
    ['6', t('stats.weeks')],
    ['10', t('stats.verticals')],
  ] as const

  const whyItems = [
    [t('why.item1Title'), t('why.item1Body')],
    [t('why.item2Title'), t('why.item2Body')],
    [t('why.item3Title'), t('why.item3Body')],
  ] as const

  const modules = [
    { img: IMG.atelier, title: t('programme.m1Title'), body: t('programme.m1Body') },
    { img: IMG.study, title: t('programme.m2Title'), body: t('programme.m2Body') },
    { img: IMG.funding, title: t('programme.m3Title'), body: t('programme.m3Body') },
    { img: IMG.harbor, title: t('programme.m4Title'), body: t('programme.m4Body') },
    { img: IMG.qc, title: t('programme.m5Title'), body: t('programme.m5Body') },
    { img: IMG.loft, title: t('programme.m6Title'), body: t('programme.m6Body') },
  ]

  const weeks = [
    [t('rhythm.w1'), t('rhythm.w1Body')],
    [t('rhythm.w2'), t('rhythm.w2Body')],
    [t('rhythm.w3'), t('rhythm.w3Body')],
    [t('rhythm.w4'), t('rhythm.w4Body')],
    [t('rhythm.w5'), t('rhythm.w5Body')],
    [t('rhythm.w6'), t('rhythm.w6Body')],
  ] as const

  return (
    <div id="startup-academy-main" className="bg-harvics-cream text-harvics-burgundy">
      <section className="relative min-h-[88vh] overflow-hidden bg-harvics-burgundy">
        <Image
          src={IMG.hero}
          alt={t('hero.alt')}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(26,7,8,0.35) 0%, rgba(26,7,8,0.55) 40%, rgba(26,7,8,0.92) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-harvics-layout flex-col justify-end px-6 pb-16 pt-32 md:px-12 md:pb-20">
          <p className="harvics-corridor-eyebrow mb-4">{t('hero.eyebrow')}</p>
          <h1
            className="harvics-corridor-display max-w-[11ch] text-harvics-cream"
            style={{ fontSize: 'clamp(42px, 7vw, 76px)' }}
          >
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-[40ch] text-[16px] leading-[1.65] text-harvics-cream/80 md:text-[17px]">
            {t('hero.body')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="mailto:partnerships@harvics.com?subject=Harvics%20Startup%20Academy%20Cohort%2001"
              className="inline-flex border border-harvics-gold bg-harvics-gold px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-harvics-burgundy"
              style={{ borderRadius: 0 }}
            >
              {t('hero.apply')}
            </a>
            <a
              href="#programme"
              className="inline-flex border border-harvics-gold/50 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-harvics-cream"
              style={{ borderRadius: 0 }}
            >
              {t('hero.seeProgramme')}
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-harvics-gold/20 bg-white py-12 md:py-14">
        <div className="mx-auto grid max-w-harvics-layout grid-cols-2 gap-8 px-6 text-center md:grid-cols-4 md:px-12">
          {stats.map(([n, l]) => (
            <div key={l}>
              <p
                className="harvics-corridor-display m-0 text-harvics-burgundy"
                style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}
              >
                {n}
              </p>
              <p className="mt-2 m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-burgundy/50">
                {l}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-harvics-gold/15 py-16 md:py-24">
        <div className="mx-auto grid max-w-harvics-layout items-center gap-12 px-6 md:grid-cols-2 md:gap-16 md:px-12">
          <FadeIn>
            <p className="harvics-corridor-eyebrow mb-3">{t('why.eyebrow')}</p>
            <h2
              className="harvics-corridor-display m-0 max-w-[14ch]"
              style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              {t('why.title')}
            </h2>
            <p className="harvics-corridor-body mt-4 max-w-[42ch]">{t('why.body')}</p>
            <ul className="mt-8 space-y-4 border-t border-harvics-gold/20 pt-6">
              {whyItems.map(([title, body]) => (
                <li key={title}>
                  <p className="m-0 text-[15px] font-semibold text-harvics-burgundy">{title}</p>
                  <p className="harvics-corridor-body m-0 mt-1 text-[13px]">{body}</p>
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={0.08} className="relative aspect-square overflow-hidden">
            <Image
              src={IMG.trade}
              alt={t('why.imageAlt')}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </FadeIn>
        </div>
      </section>

      <section className="relative min-h-[62vh] overflow-hidden">
        <Image
          src={IMG.library}
          alt={t('knowledge.imageAlt')}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0708]/90 via-[#1a0708]/45 to-[#1a0708]/25" />
        <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-harvics-layout items-end px-6 pb-14 md:px-12">
          <FadeIn className="max-w-[32rem]">
            <p className="harvics-corridor-eyebrow mb-3">{t('knowledge.eyebrow')}</p>
            <h2
              className="harvics-corridor-display m-0 text-harvics-cream"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              {t('knowledge.title')}
            </h2>
            <p className="mt-4 m-0 text-[15px] leading-[1.65] text-harvics-cream/75">
              {t('knowledge.body')}
            </p>
          </FadeIn>
        </div>
      </section>

      <section id="programme" className="border-b border-harvics-gold/15 bg-white py-16 md:py-24">
        <div className="mx-auto max-w-harvics-layout px-6 md:px-12">
          <FadeIn>
            <p className="harvics-corridor-eyebrow mb-3">{t('programme.eyebrow')}</p>
            <h2
              className="harvics-corridor-display m-0 max-w-[16ch]"
              style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              {t('programme.title')}
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((item, i) => (
              <FadeIn key={item.title} delay={0.05 * i} className="flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
                <h3
                  className="harvics-corridor-display mt-5 m-0 text-harvics-burgundy"
                  style={{ fontSize: '22px' }}
                >
                  {item.title}
                </h3>
                <p className="harvics-corridor-body mt-2 m-0">{item.body}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-harvics-gold/15">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[52vh] overflow-hidden">
            <Image
              src={IMG.boardroom}
              alt={t('tracks.aAlt')}
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-[#1a0708]/55" />
            <div className="relative z-10 flex h-full min-h-[52vh] flex-col justify-end p-8 md:p-12">
              <p className="harvics-corridor-eyebrow mb-2">{t('tracks.aEyebrow')}</p>
              <h3
                className="harvics-corridor-display m-0 text-harvics-cream"
                style={{ fontSize: 'clamp(24px, 3vw, 34px)' }}
              >
                {t('tracks.aTitle')}
              </h3>
              <p className="mt-3 m-0 max-w-[34ch] text-[14px] leading-[1.65] text-harvics-cream/75">
                {t('tracks.aBody')}
              </p>
            </div>
          </div>
          <div className="relative min-h-[52vh] overflow-hidden">
            <Image
              src={IMG.salon}
              alt={t('tracks.bAlt')}
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-[#1a0708]/55" />
            <div className="relative z-10 flex h-full min-h-[52vh] flex-col justify-end p-8 md:p-12">
              <p className="harvics-corridor-eyebrow mb-2">{t('tracks.bEyebrow')}</p>
              <h3
                className="harvics-corridor-display m-0 text-harvics-cream"
                style={{ fontSize: 'clamp(24px, 3vw, 34px)' }}
              >
                {t('tracks.bTitle')}
              </h3>
              <p className="mt-3 m-0 max-w-[34ch] text-[14px] leading-[1.65] text-harvics-cream/75">
                {t('tracks.bBody')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-[58vh] overflow-hidden">
        <Image
          src={IMG.salon}
          alt={t('network.imageAlt')}
          fill
          className="object-cover object-[center_30%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(26,7,8,0.9) 0%, rgba(26,7,8,0.55) 55%, rgba(26,7,8,0.3) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-harvics-layout items-center px-6 py-20 md:px-12">
          <FadeIn className="max-w-[28rem]">
            <p className="harvics-corridor-eyebrow mb-3">{t('network.eyebrow')}</p>
            <h2
              className="harvics-corridor-display m-0 text-harvics-cream"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              {t('network.title')}
            </h2>
            <p className="mt-4 m-0 text-[15px] leading-[1.65] text-harvics-cream/75">
              {t('network.body')}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-harvics-gold/15 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-harvics-layout px-6 md:px-12">
          <FadeIn>
            <p className="harvics-corridor-eyebrow mb-3">{t('rhythm.eyebrow')}</p>
            <h2 className="harvics-corridor-display m-0" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              {t('rhythm.title')}
            </h2>
          </FadeIn>
          <div className="mt-10">
            {weeks.map(([week, what]) => (
              <div
                key={week}
                className="grid grid-cols-1 gap-1 border-b border-harvics-gold/15 py-4 md:grid-cols-[120px_1fr] md:gap-6"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-harvics-gold">
                  {week}
                </span>
                <span className="text-[15px] font-medium text-harvics-burgundy">{what}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-harvics-gold/15 py-10">
        <div className="mx-auto grid max-w-harvics-layout grid-cols-2 gap-3 px-6 md:grid-cols-4 md:gap-4 md:px-12">
          {[IMG.harbor, IMG.qc, IMG.loft, IMG.boardroom].map((src) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden">
              <Image src={src} alt="" fill className="object-cover" sizes="25vw" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-harvics-burgundy py-20 text-center md:py-28">
        <div className="mx-auto max-w-harvics-layout px-6 md:px-12">
          <p className="harvics-corridor-eyebrow mb-3">{t('apply.eyebrow')}</p>
          <h2
            className="harvics-corridor-display m-0 mx-auto max-w-[14ch] text-harvics-cream"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
          >
            {t('apply.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-[42ch] text-[15px] leading-[1.65] text-harvics-cream/70">
            {t('apply.body')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:partnerships@harvics.com?subject=Harvics%20Startup%20Academy%20Cohort%2001"
              className="inline-flex border border-harvics-gold bg-harvics-gold px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-harvics-burgundy"
              style={{ borderRadius: 0 }}
            >
              {t('apply.emailCta')}
            </a>
            <Link
              href={`/${locale}`}
              className="inline-flex border border-harvics-gold/40 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-harvics-cream"
              style={{ borderRadius: 0 }}
            >
              {t('apply.back')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

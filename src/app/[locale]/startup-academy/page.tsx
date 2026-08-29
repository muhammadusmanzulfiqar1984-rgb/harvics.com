import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import StartupAcademyPageClient from './StartupAcademyPageClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'startupAcademy' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: '/assets/academy/academy-hero-lecture-hall.png' }],
    },
    alternates: {
      canonical: `/${locale}/startup-academy`,
    },
  }
}

export function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function StartupAcademyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <StartupAcademyPageClient locale={locale} />
}

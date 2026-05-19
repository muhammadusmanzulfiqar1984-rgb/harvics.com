// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication
import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import AboutPageClient from './AboutPageClient'

import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'about')
}


// Generate static params for all locales
export async function generateStaticParams() {
  return generateAllLocaleParams()
}

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations('about')

  return (
    <AboutPageClient
      locale={locale}
      translations={{
        title: t('title'),
        subtitle: t('subtitle'),
        ourStory: t('ourStory'),
        story1: t('story1'),
        story2: t('story2'),
        est2018: t('est2018'),
        countries40: t('countries40'),
        productLines6: t('productLines6'),
      }}
    />
  )
}

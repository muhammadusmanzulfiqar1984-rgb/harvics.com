import type { Metadata } from 'next'
import AppsPageClient from './AppsPageClient'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export const metadata: Metadata = {
  title: 'App Store — Harvics OS',
  description: 'Enterprise-grade applications built on the Harvics platform. Explore and activate modules for HR, Finance, CRM, and more.',
}

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

interface AppsPageProps {
  params: Promise<{ locale: string }>
}

export default async function AppsPage({ params }: AppsPageProps) {
  const { locale } = await params
  return <AppsPageClient locale={locale} />
}

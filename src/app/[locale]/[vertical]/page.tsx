import { navVerticals } from '@/data/megaMenuData'
import { notFound } from 'next/navigation'
import VerticalPageClient from './VerticalPageClient'

const VALID_VERTICALS = navVerticals.map((v) => v.key)

export default async function VerticalPage({
  params,
}: {
  params: Promise<{ locale: string; vertical: string }>
}) {
  const { locale, vertical } = await params

  // Only handle known verticals — let other routes pass through
  if (!VALID_VERTICALS.includes(vertical)) {
    notFound()
  }

  const verticalData = navVerticals.find((v) => v.key === vertical)!

  return <VerticalPageClient vertical={verticalData} locale={locale} />
}

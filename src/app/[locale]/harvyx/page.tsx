import { redirect } from 'next/navigation'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

/** Marketing and nav should use the app page; legacy /harvyx URLs redirect there. */
export default async function HarvyXLegacyRedirect({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/apps/harvyx`)
}

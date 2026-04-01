import { redirect } from 'next/navigation'

export default async function InvestorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/investors/governance`)
}

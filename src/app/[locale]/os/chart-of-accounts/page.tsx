import { redirect } from 'next/navigation'

/** Canonical CoA is Module #1 Prisma GL at /os/finance — wave3 CoA tree is deprecated. */
export default async function ChartOfAccountsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/os/finance`)
}

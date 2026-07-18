import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import MeetRoomClient from '@/components/meet/MeetRoomClient'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function MeetRoomPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  return <MeetRoomClient meetingId={id} locale={locale} />
}

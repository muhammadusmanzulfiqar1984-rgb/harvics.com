import { redirect } from 'next/navigation'

export default async function MeetingIndexPage({
  params,
}: {
  params: Promise<{ meetingId: string }>
}) {
  const { meetingId } = await params
  redirect(`/meeting/${meetingId}/prejoin`)
}

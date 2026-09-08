import { randomBytes } from 'crypto'
import { prisma } from './db'
import type { MeetingStatus, RSVPStatus } from '@/generated/prisma'

export function generateMeetingCode() {
  return randomBytes(4).toString('hex')
}

export function roomNameFromCode(code: string) {
  return `harvics-meet-${code}`
}

export async function getMeetingByCode(meetingCode: string) {
  return prisma.meeting.findUnique({
    where: { meetingCode },
    include: {
      host: true,
      participants: { orderBy: { createdAt: 'asc' } },
      invitations: { orderBy: { createdAt: 'asc' } },
      artifacts: true,
    },
  })
}

export async function getMeetingById(id: string) {
  return prisma.meeting.findUnique({
    where: { id },
    include: {
      host: true,
      participants: { orderBy: { createdAt: 'asc' } },
      invitations: { orderBy: { createdAt: 'asc' } },
      artifacts: true,
    },
  })
}

export async function listMeetingsForHost(email: string) {
  return prisma.meeting.findMany({
    where: { host: { email } },
    orderBy: { startTime: 'desc' },
    include: {
      host: true,
      _count: { select: { participants: true, invitations: true } },
    },
    take: 50,
  })
}

export function mapUiRsvpToEnum(v: string): RSVPStatus | null {
  const key = v.trim().toLowerCase()
  if (key === 'yes' || key === 'accepted') return 'ACCEPTED'
  if (key === 'maybe' || key === 'tentative') return 'TENTATIVE'
  if (key === 'no' || key === 'declined') return 'DECLINED'
  if (key === 'pending') return 'PENDING'
  return null
}

export function mapEnumRsvpToUi(status: RSVPStatus) {
  switch (status) {
    case 'ACCEPTED':
      return 'Accepted'
    case 'TENTATIVE':
      return 'Tentative'
    case 'DECLINED':
      return 'Declined'
    default:
      return 'Pending'
  }
}

export function mapMeetingStatusLabel(status: MeetingStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

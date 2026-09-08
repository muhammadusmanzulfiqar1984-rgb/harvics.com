import type { ParticipantRole, RSVPStatus } from '@/generated/prisma'

export function canAdmitFromWaitingRoom(role: ParticipantRole | string) {
  return role === 'HOST' || role === 'CO_HOST'
}

export function canEndMeeting(role: ParticipantRole | string) {
  return role === 'HOST' || role === 'CO_HOST'
}

export function canJoinWithRsvp(rsvp: RSVPStatus | string, role: ParticipantRole | string) {
  if (role === 'HOST' || role === 'CO_HOST') return true
  return rsvp !== 'DECLINED'
}

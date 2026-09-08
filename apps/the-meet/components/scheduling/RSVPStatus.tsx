'use client'

const COLORS: Record<string, string> = {
  Accepted: 'text-emerald-300',
  ACCEPTED: 'text-emerald-300',
  Tentative: 'text-amber-300',
  TENTATIVE: 'text-amber-300',
  Declined: 'text-red-300',
  DECLINED: 'text-red-300',
  Pending: 'text-white/40',
  PENDING: 'text-white/40',
  Scheduled: 'text-sky-300',
  Live: 'text-emerald-300',
  Ended: 'text-white/40',
  Cancelled: 'text-red-300',
}

export function RSVPStatus({ rsvp }: { rsvp: string }) {
  return <span className={`text-xs font-semibold ${COLORS[rsvp] || COLORS.Pending}`}>{rsvp}</span>
}

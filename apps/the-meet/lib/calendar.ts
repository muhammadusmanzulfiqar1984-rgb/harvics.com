export function buildIcs(opts: {
  uid: string
  title: string
  description: string
  start: Date
  durationMins: number
  url: string
  organizerEmail?: string | null
}) {
  const end = new Date(opts.start.getTime() + opts.durationMins * 60_000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Harvics Meet//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${opts.uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(opts.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${opts.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${opts.description.replace(/\n/g, '\\n')}`,
    `URL:${opts.url}`,
    `LOCATION:${opts.url}`,
    opts.organizerEmail ? `ORGANIZER:mailto:${opts.organizerEmail}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

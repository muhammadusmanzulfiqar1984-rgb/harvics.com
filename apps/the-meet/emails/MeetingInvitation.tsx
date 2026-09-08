/** React email templates — render via Resend react or HTML string later. */

export function MeetingInvitation(props: {
  hostName: string
  title: string
  whenLabel: string
  joinUrl: string
  rsvpYesUrl: string
  rsvpMaybeUrl: string
  rsvpNoUrl: string
}) {
  return (
    <div>
      <p style={{ color: '#c3a35e', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        Harvics Meet
      </p>
      <h1>{props.title}</h1>
      <p>{props.hostName} invited you</p>
      <p>{props.whenLabel}</p>
      <p>
        <a href={props.joinUrl}>Join meeting</a>
      </p>
      <p>
        <a href={props.rsvpYesUrl}>Yes</a> · <a href={props.rsvpMaybeUrl}>Maybe</a> ·{' '}
        <a href={props.rsvpNoUrl}>No</a>
      </p>
    </div>
  )
}

export function MeetingReminder(props: { title: string; whenLabel: string; joinUrl: string }) {
  return (
    <div>
      <p style={{ color: '#c3a35e', textTransform: 'uppercase', fontSize: 11 }}>Reminder</p>
      <h1>{props.title}</h1>
      <p>Starts {props.whenLabel}</p>
      <a href={props.joinUrl}>Join</a>
    </div>
  )
}

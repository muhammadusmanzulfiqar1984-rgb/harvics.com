export function MeetingUpdated(props: { title: string; whenLabel: string; joinUrl: string }) {
  return (
    <div>
      <p style={{ color: '#c3a35e', textTransform: 'uppercase', fontSize: 11 }}>Updated</p>
      <h1>{props.title}</h1>
      <p>New time: {props.whenLabel}</p>
      <a href={props.joinUrl}>Open meeting</a>
    </div>
  )
}

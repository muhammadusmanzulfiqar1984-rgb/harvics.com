'use client'

/**
 * Live console iframe. Access is enforced by Clerk middleware on
 * /[locale]/harvyx/* and /harvyx.html — not by the old ops password gate.
 */
export default function HarvyXConsoleClient() {
  return (
    <iframe
      src="/harvyx.html?v=4"
      style={{
        width: '100%',
        height: '100vh',
        minHeight: 640,
        border: 'none',
        display: 'block',
      }}
      title="HarvyX Growth OS"
    />
  )
}

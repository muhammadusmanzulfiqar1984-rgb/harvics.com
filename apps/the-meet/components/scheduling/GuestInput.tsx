'use client'

export function GuestInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm ${props.className || ''}`}
      placeholder={props.placeholder || 'alice@co.com\nBob <bob@co.com>'}
    />
  )
}

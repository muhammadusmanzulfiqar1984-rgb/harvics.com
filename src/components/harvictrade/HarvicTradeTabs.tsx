'use client'

interface Props {
  locale: string
  children: React.ReactNode
}

/** Classic HarvicTrade shell (AI digital iframe trial removed). */
export default function HarvicTradeTabs({ children }: Props) {
  return <div className="min-h-screen bg-white">{children}</div>
}

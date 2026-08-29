'use client'

import { useEffect, useState } from 'react'

/** Mount children after idle — keeps chatbot / motion chrome off the critical path. */
export default function DeferredMount({
  children,
  timeoutMs = 3500,
}: {
  children: React.ReactNode
  timeoutMs?: number
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const onReady = () => setReady(true)
    const ric = window.requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined
    if (ric) {
      const id = ric(onReady, { timeout: timeoutMs })
      return () => window.cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(onReady, Math.min(timeoutMs, 1500))
    return () => window.clearTimeout(t)
  }, [timeoutMs])

  if (!ready) return null
  return <>{children}</>
}

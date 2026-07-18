'use client'

import React, { useState, useEffect, useRef } from 'react'

interface StatItem {
  num: string
  label: string
}

function parseNum(s: string): { prefix: string; target: number; suffix: string } | null {
  const match = s.match(/^([^\d]*)(\d[\d,]*)(.*)$/)
  if (!match) return null
  return {
    prefix: match[1],
    target: parseInt(match[2].replace(/,/g, ''), 10),
    suffix: match[3],
  }
}

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

function AnimatedNum({ num, started }: { num: string; started: boolean }) {
  const parsed = parseNum(num)
  if (!parsed) return <>{num}</>
  const count = useCountUp(parsed.target, 1800, started)
  const formatted = count >= 1000 ? count.toLocaleString() : count.toString()
  return <>{parsed.prefix}{formatted}{parsed.suffix}</>
}

export default function AnimatedStats({
  stats,
  numClassName = 'text-2xl font-bold text-harvics-gold',
  labelClassName = 'text-xs text-white/50 mt-1',
  containerClassName = '',
}: {
  stats: StatItem[]
  numClassName?: string
  labelClassName?: string
  containerClassName?: string
}) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={containerClassName}>
      {stats.map((s) => (
        <div key={s.label}>
          <div className={numClassName}>
            <AnimatedNum num={s.num} started={visible} />
          </div>
          <div className={labelClassName}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

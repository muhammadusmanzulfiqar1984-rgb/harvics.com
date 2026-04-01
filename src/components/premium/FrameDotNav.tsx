'use client'

import { useEffect, useState } from 'react'

const FRAME_LABELS = [
  'Hero',
  'Industries',
  '3D Viewer',
  'Showcase',
  'Story',
  'Supply Chain',
  'World Map',
  'Contact',
  'Footer',
]

export default function FrameDotNav({ totalFrames }: { totalFrames: number }) {
  const [activeFrame, setActiveFrame] = useState(0)

  useEffect(() => {
    const main = document.getElementById('homepage-main')
    if (!main) return

    const onScroll = () => {
      const frameH = main.clientHeight
      const idx = Math.round(main.scrollTop / frameH)
      setActiveFrame(Math.min(idx, totalFrames - 1))
    }

    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [totalFrames])

  const goToFrame = (idx: number) => {
    const main = document.getElementById('homepage-main')
    if (!main) return
    main.scrollTo({ top: idx * main.clientHeight, behavior: 'smooth' })
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
      }}
    >
      {FRAME_LABELS.slice(0, totalFrames).map((label, i) => (
        <button
          key={i}
          onClick={() => goToFrame(i)}
          title={label}
          style={{
            width: activeFrame === i ? '8px' : '6px',
            height: activeFrame === i ? '8px' : '6px',
            borderRadius: '50%',
            background: activeFrame === i ? 'var(--harvics-gold)' : 'var(--harvics-gold-muted)',
            border: activeFrame === i ? '1.5px solid var(--harvics-gold)' : '1.5px solid var(--harvics-gold-muted)',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.3s ease',
            boxShadow: activeFrame === i ? '0 0 8px var(--harvics-gold-muted)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

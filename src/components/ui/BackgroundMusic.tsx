'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

const BackgroundMusic: React.FC = () => {
  const t = useTranslations('music')
  const pathname = usePathname()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.3) // Default volume at 30%
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Check if we're on the home page (handles both / and /[locale] paths)
  const isHomePage = React.useMemo(() => {
    if (!pathname) return false
    return pathname === '/' || /^\/[a-z]{2}\/?$/.test(pathname)
  }, [pathname])

  // Load mute state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMuteState = localStorage.getItem('harvics-music-muted')
      if (savedMuteState === 'true') {
        setIsMuted(true)
      }
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Set initial volume and enable loop
    audio.volume = isMuted ? 0 : volume
    audio.loop = true

    // Check if user previously muted the music
    const savedMuteState = typeof window !== 'undefined' ? localStorage.getItem('harvics-music-muted') : null
    const wasMuted = savedMuteState === 'true'

    // If not on home page, pause the music
    if (!isHomePage) {
      if (audio && !audio.paused) {
        audio.pause()
        setIsPlaying(false)
      }
      return
    }

    // We're on home page - handle auto-play logic
    // Try to auto-play immediately when component mounts (only on home page)
    const attemptAutoplay = async () => {
      if (wasMuted) {
        // User previously muted - don't auto-play
        return
      }
      try {
        await audio.play()
        setIsPlaying(true)
        setHasUserInteracted(true)
      } catch (error) {
        // Autoplay prevented, wait for user interaction
        setupUserInteractionListeners()
      }
    }

    // Setup user interaction listeners for when autoplay is blocked
    const setupUserInteractionListeners = () => {
      const handleUserInteraction = async () => {
        if (!hasUserInteracted && !wasMuted) {
          try {
            await audio.play()
            setIsPlaying(true)
            setHasUserInteracted(true)
          } catch (error) {
            // Error playing audio - user interaction may be required
          }
        }
        // Remove listeners after first successful interaction
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('touchstart', handleUserInteraction)
        document.removeEventListener('keydown', handleUserInteraction)
      }

      document.addEventListener('click', handleUserInteraction)
      document.addEventListener('touchstart', handleUserInteraction)
      document.addEventListener('keydown', handleUserInteraction)
    }

    // Only attempt autoplay if not already playing and on home page and not muted
    if (!isPlaying && isHomePage && !wasMuted) {
      attemptAutoplay()
    }

    return () => {
      document.removeEventListener('click', setupUserInteractionListeners)
      document.removeEventListener('touchstart', setupUserInteractionListeners)
      document.removeEventListener('keydown', setupUserInteractionListeners)
    }
  }, [volume, hasUserInteracted, isHomePage, isMuted, isPlaying]) // Added isPlaying

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    // Check if muted - if so, don't allow playing
    if (isMuted && audio.paused) {
      // User wants to play but is muted - unmute first
      toggleMute()
      return
    }

    if (audio.paused) {
      // Audio is paused, so play it
      audio.play().then(() => {
        setIsPlaying(true)
        setHasUserInteracted(true)
      }).catch((error) => {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
      })
    } else {
      // Audio is playing, so pause it
      audio.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
      // Save unmute state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('harvics-music-muted', 'false')
      }
    } else {
      audio.volume = 0
      setIsMuted(true)
      // Save mute state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('harvics-music-muted', 'true')
      }
      // Also pause if playing
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      }
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    
    const audio = audioRef.current
    if (audio && !isMuted) {
      audio.volume = newVolume
    }
  }

  // Auto-pause music while a Vapi voice call is active, then resume after
  useEffect(() => {
    let wasPlayingBeforeCall = false
    const onCallStart = () => {
      const audio = audioRef.current
      if (!audio) return
      wasPlayingBeforeCall = !audio.paused
      if (wasPlayingBeforeCall) {
        audio.pause()
        setIsPlaying(false)
      }
    }
    const onCallEnd = () => {
      const audio = audioRef.current
      if (!audio || !wasPlayingBeforeCall) return
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    }
    window.addEventListener('harvics:vapi-call-start', onCallStart)
    window.addEventListener('harvics:vapi-call-end', onCallEnd)
    return () => {
      window.removeEventListener('harvics:vapi-call-start', onCallStart)
      window.removeEventListener('harvics:vapi-call-end', onCallEnd)
    }
  }, [])

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        muted={false}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => console.error('Audio error:', e)}
      >
        <source src="/Music/emotional-inspiring-violin-342019.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Music Control Button — Stylish round burgundy pill with hover tooltip */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 group/wrap">
        <button
          onClick={togglePlayPause}
          className="harvics-music-fab relative w-11 h-11 flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95 group"
          style={{
            background:
              'radial-gradient(circle at 30% 22%, #9b3344 0%, #6B1F2B 50%, #3d1119 100%)',
            border: '1px solid rgba(195, 163, 94, 0.5)',
            borderRadius: '9999px',
            boxShadow:
              '0 10px 30px rgba(107, 31, 43, 0.4), 0 2px 6px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -2px 4px rgba(0,0,0,0.3)',
          }}
          title={isPlaying ? t('pause') : t('play')}
          aria-label={isPlaying ? t('pause') : t('play')}
        >
          {/* Subtle gold hairline */}
          <span
            aria-hidden
            className="absolute inset-[2px] pointer-events-none"
            style={{
              borderRadius: '9999px',
              border: '1px solid rgba(232, 212, 160, 0.18)',
            }}
          />
          {isPlaying ? (
            <svg
              className="relative w-[16px] h-[16px] text-[#E8D4A0] group-hover:text-white transition-colors duration-200"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg
              className="relative w-[16px] h-[16px] text-[#E8D4A0] group-hover:text-white transition-colors duration-200"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 6.5v11a1 1 0 0 0 1.55.83l8.5-5.5a1 1 0 0 0 0-1.66l-8.5-5.5A1 1 0 0 0 9 6.5z" />
            </svg>
          )}
          {/* Soft gold pulse ring — only when paused */}
          {!isPlaying && (
            <span
              className="harvics-chatbot-pulse absolute inset-0 border border-[#C3A35E]/35 pointer-events-none"
              style={{ borderRadius: '9999px', animation: 'chatPulse 2.8s ease-out infinite' }}
            />
          )}
        </button>

        {/* Hover tooltip */}
        <span
          className="harvics-fab-tooltip pointer-events-none select-none text-[11px] font-medium tracking-wide uppercase text-[#1A0505] bg-[#F5F0E8]/95 backdrop-blur px-3 py-1.5 opacity-0 translate-x-1 transition-all duration-300 group-hover/wrap:opacity-100 group-hover/wrap:translate-x-0"
          style={{
            borderRadius: '9999px',
            border: '1px solid rgba(195, 163, 94, 0.45)',
            boxShadow: '0 4px 14px rgba(26, 5, 5, 0.12)',
          }}
        >
          {isPlaying ? 'Pause Music' : 'Play Music'}
        </span>
      </div>
    </>
  )
}

export default BackgroundMusic

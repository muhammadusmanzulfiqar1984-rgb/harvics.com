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
        console.log('Music started playing')
      }).catch((error) => {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
      })
    } else {
      // Audio is playing, so pause it
      audio.pause()
      audio.currentTime = 0 // Reset to beginning
      setIsPlaying(false)
      console.log('Music paused and reset')
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

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        muted={false}
        onPlay={() => {
          console.log('Audio started playing')
          setIsPlaying(true)
        }}
        onPause={() => {
          console.log('Audio paused')
          setIsPlaying(false)
        }}
        onEnded={() => {
          console.log('Audio ended')
          setIsPlaying(false)
        }}
        onError={(e) => console.error('Audio error:', e)}
        onLoadStart={() => console.log('Audio loading started')}
        onCanPlay={() => console.log('Audio can play')}
      >
        <source src="/Music/emotional-inspiring-violin-342019.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Music Control Button - Compact Mobile Design */}
      <div className="fixed bottom-2 left-2 md:bottom-4 md:left-4 z-50">
        <div className="bg-white/20 backdrop-blur-sm rounded-full shadow-sm border border-white/10 p-1.5 transition-all duration-300 hover:bg-white/30 flex items-center gap-1.5">
          {/* Autoplay indicator - Hidden on mobile */}
          {!hasUserInteracted && !isPlaying && isHomePage && (
            <div className="hidden md:block text-xs text-center text-black/70 px-1">
              🎵
            </div>
          )}
          
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="w-7 h-7 bg-white/30 backdrop-blur-sm hover:bg-white/50 text-black rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border border-[#C3A35E]/20"
            title={isPlaying ? t('pause') : t('play')}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Mute/Unmute Button */}
          <button
            onClick={toggleMute}
            className="w-7 h-7 bg-white/30 backdrop-blur-sm hover:bg-white/50 text-black rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border border-[#C3A35E]/20"
            title={isMuted ? t('unmute') : t('mute')}
          >
            {isMuted ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

export default BackgroundMusic

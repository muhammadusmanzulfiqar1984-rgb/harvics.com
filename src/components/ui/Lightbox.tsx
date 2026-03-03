'use client'

import React, { useEffect, useRef } from 'react'

interface LightboxProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  imageAlt: string
}

const Lightbox: React.FC<LightboxProps> = ({ isOpen, onClose, imageSrc, imageAlt }) => {
  const lightboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent scrolling when lightbox is open
    } else {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset' // Restore scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (lightboxRef.current && !lightboxRef.current.contains(event.target as Node)) {
      onClose()
    }
  }

  return (
    <div 
      className={`lightbox-overlay ${isOpen ? 'active' : ''}`}
      onClick={handleClickOutside}
    >
      <div className="lightbox-content" ref={lightboxRef}>
        <button className="lightbox-close" onClick={onClose}>
          &times;
        </button>
        <img src={imageSrc} alt={imageAlt} className="lightbox-image" />
      </div>
    </div>
  )
}

export default Lightbox

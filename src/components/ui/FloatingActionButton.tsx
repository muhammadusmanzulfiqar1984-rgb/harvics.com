'use client'

import React from 'react'

/**
 * Floating telephone button. Single icon, no label, gold-on-dark.
 * Tapping it triggers a phone call.
 */
const FloatingActionButton: React.FC = () => {
  const callUrl = 'tel:+12295455206'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={callUrl}
        aria-label="Call HarvyX"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#3D1212] text-[#C3A35E] border border-[#C3A35E]/45 hover:border-[#C3A35E] shadow-[0_10px_28px_rgba(26,5,5,0.45)] hover:shadow-[0_12px_32px_rgba(195,163,94,0.35)] transition-all duration-200"
      >
        {/* Soft pulse ring */}
        <span className="absolute inset-0 rounded-full ring-1 ring-[#C3A35E]/30 animate-ping opacity-50 group-hover:opacity-80" />
        {/* Phone handset icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="relative group-hover:scale-110 transition-transform duration-200"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
        </svg>
      </a>
    </div>
  )
}

export default FloatingActionButton

'use client'

import React, { useEffect, useState } from 'react'

const SimpleThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (prefersDark) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return (
      <button className="relative w-12 h-6 bg-white rounded-full transition-colors duration-300" disabled>
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"></div>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 bg-gradient-to-r from-[#C3A35E] to-[#C3A35E] rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-offset-2 shadow-lg hover:shadow-xl"
      style={{
        backgroundColor: theme === 'dark' ? '#6B1F2B' : '#C3A35E',
        boxShadow: theme === 'dark' ? '0 0 10px rgba(31, 41, 55, 0.5)' : '0 0 15px rgba(245, 158, 11, 0.6)'
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center ${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {theme === 'light' ? (
          <span className="text-[#C3A35E] text-sm">☀️</span>
        ) : (
          <span className="text-[#6B1F2B] text-sm">🌙</span>
        )}
      </div>
    </button>
  )
}

export default SimpleThemeToggle

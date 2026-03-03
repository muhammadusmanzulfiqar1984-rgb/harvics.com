'use client'

import React, { useEffect, useState } from 'react'

export default function DarkModeToggle() {
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
      
      // Apply theme classes
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-black text-xs sm:text-sm font-medium">Dark mode</span>
        <button className="relative w-12 h-6 bg-white rounded-full transition-colors duration-300" disabled>
          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"></div>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Dark mode text */}
      <span className="text-black text-xs sm:text-sm font-medium">Dark mode</span>
      
      {/* Info icon */}
      <button
        className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs hover:bg-white0 transition-colors"
        aria-label="Dark mode information"
        title="Toggle between light and dark theme"
      >
        <span className="text-xs font-bold">i</span>
      </button>
      
      {/* Toggle Switch */}
      <button
        onClick={toggleTheme}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#6B1F2B] focus:ring-offset-2 ${
          theme === 'dark' ? 'bg-white' : 'bg-white'
        }`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        role="switch"
        aria-checked={theme === 'dark'}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}


'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

const InteractiveWorldMap: React.FC = () => {
  const [activeOffice, setActiveOffice] = useState<string | null>(null)
  
  // Offices mapped to percentage coordinates
  const offices = [
    { id: 'london', name: 'Harvics Head Office', x: 48, y: 22, isHQ: true },
    { id: 'milan', name: 'Harvics Office', x: 51, y: 26, isHQ: false },
    { id: 'new-york', name: 'Harvics Office', x: 28, y: 26, isHQ: false }
  ]

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % offices.length
      setActiveOffice(offices[currentIndex].id)
    }, 4000)
    
    setActiveOffice(offices[0].id)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative w-full overflow-hidden bg-white py-20">
      
      {/* Background Water/Glow Effect */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/4 left-2/3 w-[500px] h-[500px] bg-[#6B1F2B] rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-[#6B1F2B]">Global Presence</h2>
          <div className="w-24 h-1 mx-auto rounded-full bg-[#C3A35E]"></div>
        </div>

        {/* Map Container */}
        <div className="relative w-full aspect-[2/1] max-w-6xl mx-auto rounded-2xl overflow-visible">
          
          {/* True Vector World Map using Mask for Light Maroon Color */}
          <div className="absolute inset-0 opacity-80">
            <div 
              className="w-full h-full bg-[#6B1F2B]" // Light maroon color
              style={{
                maskImage: 'url(/world-map-svg.svg)',
                WebkitMaskImage: 'url(/world-map-svg.svg)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            />
          </div>

          {/* Offices & Lights overlay */}
          <div className="absolute inset-0 w-full h-full">
            {offices.map((office) => {
              const isActive = activeOffice === office.id
              
              return (
                <div 
                  key={office.id} 
                  className="absolute z-20 transition-all duration-700"
                  style={{ left: `${office.x}%`, top: `${office.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  
                  {/* Glowing Highlight Circle */}
                  <div 
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C3A35E] transition-all duration-1000 ease-out ${isActive ? 'w-48 h-48 opacity-15 blur-xl' : 'w-0 h-0 opacity-0'}`} 
                  />

                  {/* Animated Pulse Ring */}
                  {isActive && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#C3A35E] opacity-0 animate-[ping_2s_ease-out_infinite] w-12 h-12" />
                  )}

                  {/* Solid Office Dot */}
                  <div 
                    className={`relative rounded-full border-2 border-white shadow-lg transition-all duration-500 ${office.isHQ ? 'w-4 h-4 bg-[#C3A35E]' : 'w-3 h-3 bg-[#6B1F2B]'}`}
                    style={{ transform: isActive ? 'scale(1.2)' : 'scale(1)' }}
                  />

                  {/* Label - Shows BELOW the office dot */}
                  <div 
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap transition-all duration-500 origin-top ${isActive ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                  >
                    <div className="px-4 py-2 rounded-lg bg-white/95 border border-[#C3A35E]/30 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                      <p className="text-[#6B1F2B] font-bold text-[13px] tracking-wide text-center">
                        {office.name.toUpperCase()}
                      </p>
                      {office.isHQ && (
                        <p className="text-[10px] text-[#C3A35E] text-center uppercase mt-0.5 font-semibold tracking-wider">
                          Headquarters
                        </p>
                      )}
                    </div>
                    {/* Tiny triangle pointing up to the dot */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-l border-t border-[#C3A35E]/30 rotate-45" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default InteractiveWorldMap
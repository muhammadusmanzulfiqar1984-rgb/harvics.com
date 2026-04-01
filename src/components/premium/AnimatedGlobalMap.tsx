'use client'

import React, { useState, useEffect } from 'react'

interface TradeRoute {
  id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  color: string
}

interface Region {
  id: string
  name: string
  d: string // SVG path data
  baseColor: string
  glowColor: string
}

const AnimatedGlobalMap: React.FC = () => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  // Trade routes with animated freight movement
  const tradeRoutes: TradeRoute[] = [
    { id: 'route1', from: { x: 150, y: 300 }, to: { x: 500, y: 200 }, color: '#C3A35E' }, // US to Europe
    { id: 'route2', from: { x: 500, y: 250 }, to: { x: 650, y: 300 }, color: '#8B4513' }, // Europe to Middle East
    { id: 'route3', from: { x: 650, y: 320 }, to: { x: 850, y: 350 }, color: '#C3A35E' }, // Middle East to Asia
    { id: 'route4', from: { x: 500, y: 280 }, to: { x: 520, y: 450 }, color: '#8B4513' }, // Europe to Africa
    { id: 'route5', from: { x: 850, y: 380 }, to: { x: 200, y: 350 }, color: '#C3A35E' }, // Asia to Americas
  ]

  // Natural world regions with realistic continent shapes
  const regions: Region[] = [
    {
      id: 'north-america',
      name: 'North America',
      d: 'M 100 120 Q 90 100 110 85 L 140 75 Q 160 80 165 100 L 180 90 L 195 95 L 200 115 L 210 135 L 220 155 L 225 180 L 220 205 L 210 225 L 195 240 L 185 255 L 170 270 L 155 280 L 140 285 L 125 280 L 110 270 L 95 255 L 85 235 L 80 210 L 78 185 L 82 160 L 90 140 Z',
      baseColor: '#E8E8E8',
      glowColor: '#C3A35E'
    },
    {
      id: 'south-america',
      name: 'South America',
      d: 'M 185 320 L 195 315 L 210 320 L 220 335 L 228 355 L 232 380 L 230 410 L 225 440 L 218 465 L 208 485 L 195 500 L 180 510 L 165 512 L 150 505 L 140 490 L 135 470 L 138 445 L 145 420 L 155 395 L 165 370 L 175 345 Z',
      baseColor: '#E8E8E8',
      glowColor: '#C3A35E'
    },
    {
      id: 'europe',
      name: 'Europe',
      d: 'M 450 165 L 465 160 L 485 158 L 505 162 L 520 170 L 535 182 L 545 198 L 548 215 L 545 235 L 538 252 L 525 265 L 510 272 L 495 275 L 480 273 L 465 265 L 455 250 L 448 230 L 445 210 L 447 190 L 450 175 Z',
      baseColor: '#E8E8E8',
      glowColor: '#C3A35E'
    },
    {
      id: 'africa',
      name: 'Africa',
      d: 'M 475 285 L 490 282 L 510 285 L 528 292 L 542 305 L 550 325 L 554 350 L 553 380 L 548 410 L 540 440 L 528 465 L 512 485 L 495 500 L 478 508 L 460 510 L 445 505 L 435 490 L 432 470 L 435 445 L 442 420 L 452 395 L 462 370 L 468 345 L 472 320 L 474 300 Z',
      baseColor: '#E8E8E8',
      glowColor: '#C3A35E'
    },
    {
      id: 'middle-east',
      name: 'Middle East',
      d: 'M 555 245 L 570 240 L 590 242 L 610 248 L 628 258 L 640 272 L 645 290 L 642 310 L 635 328 L 622 340 L 605 345 L 588 343 L 572 335 L 560 320 L 553 302 L 550 282 L 552 265 Z',
      baseColor: '#E8E8E8',
      glowColor: '#C3A35E'
    },
    {
      id: 'asia',
      name: 'Asia',
      d: 'M 650 150 L 680 145 L 715 148 L 750 155 L 785 165 L 820 178 L 850 195 L 875 215 L 892 240 L 900 270 L 898 300 L 888 328 L 870 350 L 845 365 L 815 375 L 780 378 L 745 372 L 715 360 L 690 342 L 670 320 L 658 295 L 652 270 L 650 245 L 652 220 L 655 195 L 658 175 Z',
      baseColor: '#E8E8E8',
      glowColor: '#C3A35E'
    },
    {
      id: 'oceania',
      name: 'Oceania',
      d: 'M 820 410 L 845 408 L 870 412 L 890 420 L 905 432 L 912 448 L 912 468 L 905 485 L 892 498 L 875 505 L 855 508 L 835 505 L 818 495 L 808 480 L 805 460 L 808 440 L 815 425 Z',
      baseColor: '#E8E8E8',
      glowColor: '#C3A35E'
    }
  ]

  return (
    <div className="w-full h-screen bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #6B1F2B 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      
      {/* Main SVG Map */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))' }}
      >
        <defs>
          {/* Glow filters for each region */}
          {regions.map(region => (
            <filter key={`glow-${region.id}`} id={`glow-${region.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          ))}

          {/* Animated gradient for freight routes */}
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C3A35E" stopOpacity="0">
              <animate attributeName="offset" values="0;1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#C3A35E" stopOpacity="1">
              <animate attributeName="offset" values="0;1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#8B4513" stopOpacity="0">
              <animate attributeName="offset" values="0;1" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Pulse animation for dots */}
          <radialGradient id="pulseGradient">
            <stop offset="0%" stopColor="#C3A35E" stopOpacity="1" />
            <stop offset="100%" stopColor="#C3A35E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Draw trade routes (nerves) with animation */}
        <g className="trade-routes">
          {tradeRoutes.map((route) => (
            <g key={route.id}>
              {/* Main route line */}
              <line
                x1={route.from.x}
                y1={route.from.y}
                x2={route.to.x}
                y2={route.to.y}
                stroke={route.color}
                strokeWidth="2"
                strokeOpacity="0.3"
                strokeDasharray="5,5"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="10"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </line>

              {/* Animated freight dot */}
              <circle r="6" fill={route.color}>
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path={`M ${route.from.x} ${route.from.y} L ${route.to.x} ${route.to.y}`}
                />
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Pulse effect on freight */}
              <circle r="12" fill="url(#pulseGradient)">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path={`M ${route.from.x} ${route.from.y} L ${route.to.x} ${route.to.y}`}
                />
                <animate
                  attributeName="r"
                  values="8;20;8"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}
        </g>

        {/* Draw regions (continents) */}
        <g className="regions">
          {regions.map((region) => {
            const isHovered = hoveredRegion === region.id
            const isActive = activeRegion === region.id

            return (
              <g key={region.id}>
                {/* Region path */}
                <path
                  d={region.d}
                  fill={region.baseColor}
                  fillOpacity={isHovered || isActive ? 0.9 : 0.6}
                  stroke={region.glowColor}
                  strokeWidth={isHovered || isActive ? 3 : 1}
                  strokeOpacity={isHovered || isActive ? 1 : 0.4}
                  filter={isHovered || isActive ? `url(#glow-${region.id})` : 'none'}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion(activeRegion === region.id ? null : region.id)}
                  className="cursor-pointer transition-all duration-500"
                  style={{
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Animated glow pulse */}
                  <animate
                    attributeName="fill-opacity"
                    values={isActive ? "0.6;0.9;0.6" : "0.6"}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Region label (shows on hover) */}
                {isHovered && (
                  <text
                    x={region.d.includes('M') ? parseInt(region.d.split(' ')[1]) + 40 : 0}
                    y={region.d.includes('M') ? parseInt(region.d.split(' ')[2]) + 20 : 0}
                    fill="#6B1F2B"
                    fontSize="18"
                    fontWeight="700"
                    className="pointer-events-none"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                  >
                    {region.name}
                  </text>
                )}
              </g>
            )
          })}
        </g>

        {/* Major hub cities (pulsing dots) */}
        <g className="hubs">
          {[
            { x: 150, y: 250, name: 'New York' },
            { x: 500, y: 220, name: 'London' },
            { x: 650, y: 300, name: 'Dubai' },
            { x: 850, y: 320, name: 'Shanghai' },
            { x: 520, y: 400, name: 'Lagos' },
          ].map((hub, i) => (
            <g key={i}>
              <circle
                cx={hub.x}
                cy={hub.y}
                r="8"
                fill="#C3A35E"
                opacity="0.8"
              >
                <animate
                  attributeName="r"
                  values="6;10;6"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
              </circle>
              <circle
                cx={hub.x}
                cy={hub.y}
                r="15"
                fill="none"
                stroke="#C3A35E"
                strokeWidth="2"
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  values="8;25;8"
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
              </circle>
            </g>
          ))}
        </g>
      </svg>

      {/* Stats overlay */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-[#6B1F2B]/20 shadow-xl">
          <div className="text-[#6B1F2B] text-sm font-bold mb-4 tracking-wider">GLOBAL NETWORK</div>
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="text-[#6B1F2B] text-4xl font-bold">50+</div>
              <div className="text-gray-600 text-sm mt-1">Countries</div>
            </div>
            <div>
              <div className="text-[#6B1F2B] text-4xl font-bold">10</div>
              <div className="text-gray-600 text-sm mt-1">Industries</div>
            </div>
            <div>
              <div className="text-[#C3A35E] text-4xl font-bold">24/7</div>
              <div className="text-gray-600 text-sm mt-1">Operations</div>
            </div>
            <div>
              <div className="text-[#C3A35E] text-4xl font-bold">Live</div>
              <div className="text-gray-600 text-sm mt-1">Trade Flows</div>
            </div>
          </div>
        </div>

        {activeRegion && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-[#C3A35E]/30 shadow-xl animate-fade-in">
            <div className="text-[#6B1F2B] text-sm font-bold mb-2 tracking-wider">
              {regions.find(r => r.id === activeRegion)?.name.toUpperCase()}
            </div>
            <div className="text-gray-700 text-sm">
              Click to explore regional operations
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnimatedGlobalMap

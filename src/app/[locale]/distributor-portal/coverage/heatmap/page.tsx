'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'

export default function CoverageHeatmap() {
  const locale = useLocale()
  const [selectedLayer, setSelectedLayer] = useState<string[]>(['GT', 'MT'])

  const toggleLayer = (layer: string) => {
    setSelectedLayer(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#C3A35E]">Coverage Heatmap</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Side Panel - Harvey Suggestions */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[#6B1F2B] to-[#ffffff] p-6 text-white shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-bold">Harvey Suggestions</h2>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-semibold mb-2">Uncovered Zones:</div>
              <ul className="space-y-1 text-[#C3A35E]/90">
                <li>• Downtown LA - Low GT coverage</li>
                <li>• Brooklyn - No HoReCa presence</li>
                <li>• Islamabad - Expanding opportunity</li>
              </ul>
            </div>
            <div className="border-t border-[#C3A35E]/20 pt-4">
              <div className="font-semibold mb-2">Recommended Expansion:</div>
              <p className="text-[#C3A35E]/90">Consider requesting territory in San Francisco for high-growth market potential.</p>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="lg:col-span-3 bg-white border border-black200 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#C3A35E] mb-4">Map View</h2>
            
            {/* Layer Toggles */}
            <div className="flex space-x-4 mb-4">
              {['GT', 'MT', 'HoReCa'].map(layer => (
                <label key={layer} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLayer.includes(layer)}
                    onChange={() => toggleLayer(layer)}
                    className="mr-2"
                  />
                  <span className="text-sm font-semibold text-[#C3A35E]/90">{layer} Coverage</span>
                </label>
              ))}
            </div>

            {/* Color Legend */}
            <div className="flex items-center space-x-6 text-sm mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>High Coverage</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white rounded"></div>
                <span>Medium Coverage</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Low/No Coverage</span>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="h-96 bg-gradient-to-br from-white100 to-white200 flex items-center justify-center border-2 border-dashed border-black300">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <div className="text-[#C3A35E]/90 font-semibold">Interactive Map Component</div>
              <div className="text-sm text-[#C3A35E]/90 mt-1">Integration with mapping service required</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


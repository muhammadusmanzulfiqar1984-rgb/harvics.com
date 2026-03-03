'use client'

import React, { ReactNode } from 'react'

interface MapTemplateProps {
  title: string
  map: ReactNode
  sidePanel?: ReactNode
  controls?: ReactNode
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

const MapTemplate: React.FC<MapTemplateProps> = ({
  title,
  map,
  sidePanel,
  controls,
  loading = false,
  error = null,
  onRetry
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B1F2B]"></div>
        <p className="mt-4 text-black">Loading map...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        <p className="mb-2">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black">{title}</h1>
        {controls && <div className="flex gap-3">{controls}</div>}
      </div>

      {/* Map Container */}
      <div className={sidePanel ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : ''}>
        <div className={sidePanel ? 'lg:col-span-2' : 'w-full'}>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="w-full h-[600px] rounded-lg">
              {map || (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <p className="text-black">Map view coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {sidePanel && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              {sidePanel}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapTemplate


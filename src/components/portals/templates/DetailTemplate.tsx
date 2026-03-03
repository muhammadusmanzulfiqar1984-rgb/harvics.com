'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'

interface DetailTemplateProps {
  title: string
  backHref: string
  backLabel?: string
  children: ReactNode
  actions?: ReactNode
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

const DetailTemplate: React.FC<DetailTemplateProps> = ({
  title,
  backHref,
  backLabel = 'Back',
  children,
  actions,
  loading = false,
  error = null,
  onRetry
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B1F2B]"></div>
        <p className="mt-4 text-black">Loading...</p>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={backHref}
            className="text-black hover:text-[#6B1F2B] transition-colors"
          >
            ← {backLabel}
          </Link>
          <h1 className="text-3xl font-bold text-black">{title}</h1>
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {children}
      </div>
    </div>
  )
}

export default DetailTemplate


'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'

interface ListTemplateProps {
  title: string
  createButton?: {
    label: string
    href: string
  }
  filters?: ReactNode
  table: ReactNode
  pagination?: ReactNode
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  onRetry?: () => void
}

const ListTemplate: React.FC<ListTemplateProps> = ({
  title,
  createButton,
  filters,
  table,
  pagination,
  loading = false,
  error = null,
  emptyMessage = 'No data available',
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black">{title}</h1>
        {createButton && (
          <Link
            href={createButton.href}
            className="px-4 py-2 bg-white text-white rounded-md hover:bg-white transition-colors font-medium"
          >
            {createButton.label}
          </Link>
        )}
      </div>

      {/* Filters */}
      {filters && (
        <div className="bg-white rounded-lg shadow p-4">
          {filters}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {table || (
          <div className="p-12 text-center text-black">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center">
          {pagination}
        </div>
      )}
    </div>
  )
}

export default ListTemplate


'use client'

import React, { useState, useRef, useEffect } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ActionBarAction {
  id: string
  label: string
  icon: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ai'
  disabled?: boolean
  tooltip?: string
  /** Show only when items are selected */
  requiresSelection?: boolean
}

export interface ActionBarProps {
  /** Primary actions shown as buttons */
  actions: ActionBarAction[]
  /** Number of selected items (enables bulk actions) */
  selectedCount?: number
  /** Callback to clear selection */
  onClearSelection?: () => void
  /** Search functionality */
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  searchValue?: string
  /** Filter button */
  onFilter?: () => void
  filterActive?: boolean
  /** Export functionality */
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void
  /** Refresh data */
  onRefresh?: () => void
  /** AI action buttons */
  onAISuggest?: () => void
  onAIPredict?: () => void
  onAIAlert?: () => void
  /** Custom class */
  className?: string
  /** View mode toggle */
  viewMode?: 'table' | 'grid' | 'kanban'
  onViewModeChange?: (mode: 'table' | 'grid' | 'kanban') => void
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function ExportDropdown({ onExport }: { onExport: (format: 'csv' | 'excel' | 'pdf') => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#6B1F2B] bg-white border border-[#C3A35E]/30 hover:border-[#C3A35E] hover:bg-[#F5F1E8] transition-colors uppercase tracking-wider"
        style={{ borderRadius: 0 }}
        title="Export data"
      >
        <span>↓</span>
        <span>Export</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 bg-white border border-[#C3A35E]/30 shadow-lg z-50 min-w-[140px]"
          style={{ borderRadius: 0 }}
        >
          <button
            onClick={() => { onExport('csv'); setOpen(false) }}
            className="block w-full text-left px-4 py-2.5 text-xs text-[#6B1F2B] hover:bg-[#F5F1E8] transition-colors font-medium"
          >
            Export as CSV
          </button>
          <button
            onClick={() => { onExport('excel'); setOpen(false) }}
            className="block w-full text-left px-4 py-2.5 text-xs text-[#6B1F2B] hover:bg-[#F5F1E8] transition-colors font-medium border-t border-[#C3A35E]/10"
          >
            Export as Excel
          </button>
          <button
            onClick={() => { onExport('pdf'); setOpen(false) }}
            className="block w-full text-left px-4 py-2.5 text-xs text-[#6B1F2B] hover:bg-[#F5F1E8] transition-colors font-medium border-t border-[#C3A35E]/10"
          >
            Export as PDF
          </button>
        </div>
      )}
    </div>
  )
}

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: 'table' | 'grid' | 'kanban'
  onChange: (m: 'table' | 'grid' | 'kanban') => void
}) {
  const modes: Array<{ key: 'table' | 'grid' | 'kanban'; icon: string; label: string }> = [
    { key: 'table', icon: '☰', label: 'Table' },
    { key: 'grid', icon: '▦', label: 'Grid' },
    { key: 'kanban', icon: '▥', label: 'Kanban' },
  ]

  return (
    <div className="flex border border-[#C3A35E]/30" style={{ borderRadius: 0 }}>
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`px-2.5 py-2 text-xs transition-colors ${
            mode === m.key
              ? 'bg-[#6B1F2B] text-[#C3A35E]'
              : 'bg-white text-[#6B1F2B]/60 hover:bg-[#F5F1E8] hover:text-[#6B1F2B]'
          }`}
          title={m.label}
          style={{ borderRadius: 0 }}
        >
          {m.icon}
        </button>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ActionBar({
  actions,
  selectedCount = 0,
  onClearSelection,
  searchPlaceholder = 'Search...',
  onSearch,
  searchValue = '',
  onFilter,
  filterActive = false,
  onExport,
  onRefresh,
  onAISuggest,
  onAIPredict,
  onAIAlert,
  className = '',
  viewMode,
  onViewModeChange,
}: ActionBarProps) {
  const hasSelection = selectedCount > 0
  const visibleActions = actions.filter(
    (a) => !a.requiresSelection || hasSelection
  )

  const getVariantClasses = (variant: ActionBarAction['variant'] = 'secondary') => {
    switch (variant) {
      case 'primary':
        return 'bg-[#6B1F2B] text-white hover:bg-[#4A1520] border-[#6B1F2B]'
      case 'danger':
        return 'bg-white text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400'
      case 'ai':
        return 'bg-[#C3A35E] text-[#6B1F2B] hover:bg-[#D4B86A] border-[#C3A35E]'
      default:
        return 'bg-white text-[#6B1F2B] border-[#C3A35E]/30 hover:border-[#C3A35E] hover:bg-[#F5F1E8]'
    }
  }

  return (
    <div
      className={`bg-white border border-[#C3A35E]/20 px-4 py-3 mb-4 ${className}`}
      style={{ borderRadius: 0, boxShadow: 'none' }}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Selection indicator */}
        {hasSelection && (
          <div className="flex items-center gap-2 pr-3 border-r border-[#C3A35E]/30">
            <span className="text-xs font-bold text-[#6B1F2B] bg-[#C3A35E]/20 px-2.5 py-1">
              {selectedCount} selected
            </span>
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="text-xs text-[#6B1F2B]/60 hover:text-[#6B1F2B] transition-colors underline"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Primary action buttons */}
        <div className="flex items-center gap-2">
          {visibleActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border transition-colors uppercase tracking-wider ${getVariantClasses(
                action.variant
              )} ${action.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={{ borderRadius: 0 }}
              title={action.tooltip || action.label}
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* AI Action buttons */}
        {(onAISuggest || onAIPredict || onAIAlert) && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#C3A35E]/30">
            {onAISuggest && (
              <button
                onClick={onAISuggest}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-[#6B1F2B] bg-[#C3A35E]/10 border border-[#C3A35E]/30 hover:bg-[#C3A35E]/25 transition-colors"
                style={{ borderRadius: 0 }}
                title="AI Suggest — get AI recommendations"
              >
                <span>✨</span>
                <span>AI Suggest</span>
              </button>
            )}
            {onAIPredict && (
              <button
                onClick={onAIPredict}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-[#6B1F2B] bg-[#C3A35E]/10 border border-[#C3A35E]/30 hover:bg-[#C3A35E]/25 transition-colors"
                style={{ borderRadius: 0 }}
                title="AI Predict — see AI forecasts"
              >
                <span>📈</span>
                <span>AI Predict</span>
              </button>
            )}
            {onAIAlert && (
              <button
                onClick={onAIAlert}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-[#6B1F2B] bg-[#C3A35E]/10 border border-[#C3A35E]/30 hover:bg-[#C3A35E]/25 transition-colors"
                style={{ borderRadius: 0 }}
                title="AI Alert — check for anomalies"
              >
                <span>🔔</span>
                <span>AI Alert</span>
              </button>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        {onSearch && (
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-48 lg:w-64 px-3 py-2 text-xs text-[#6B1F2B] bg-white border border-[#C3A35E]/30 focus:border-[#C3A35E] focus:outline-none placeholder:text-[#6B1F2B]/30 transition-colors"
              style={{ borderRadius: 0 }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B1F2B]/30 text-xs pointer-events-none">
              🔍
            </span>
          </div>
        )}

        {/* Filter */}
        {onFilter && (
          <button
            onClick={onFilter}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border transition-colors uppercase tracking-wider ${
              filterActive
                ? 'bg-[#6B1F2B] text-[#C3A35E] border-[#6B1F2B]'
                : 'bg-white text-[#6B1F2B] border-[#C3A35E]/30 hover:border-[#C3A35E] hover:bg-[#F5F1E8]'
            }`}
            style={{ borderRadius: 0 }}
            title="Toggle filters"
          >
            <span>⚙</span>
            <span>Filter</span>
          </button>
        )}

        {/* Export */}
        {onExport && <ExportDropdown onExport={onExport} />}

        {/* Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#6B1F2B] bg-white border border-[#C3A35E]/30 hover:border-[#C3A35E] hover:bg-[#F5F1E8] transition-colors"
            style={{ borderRadius: 0 }}
            title="Refresh data"
          >
            <span>↻</span>
          </button>
        )}

        {/* View Mode */}
        {viewMode && onViewModeChange && (
          <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
        )}
      </div>
    </div>
  )
}

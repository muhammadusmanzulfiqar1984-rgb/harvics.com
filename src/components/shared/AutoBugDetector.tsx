'use client'

import { useEffect, useState } from 'react'
import { autoBugDetector, type BugReport } from '@/services/auto-bug-detector'

export default function AutoBugDetector() {
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [stats, setStats] = useState(autoBugDetector.getStats())
  const [monitorSnapshot, setMonitorSnapshot] = useState(autoBugDetector.getMonitorSnapshot())
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Update bugs every 5 seconds
    const interval = setInterval(() => {
      setBugs(autoBugDetector.getUnfixedBugs())
      setStats(autoBugDetector.getStats())
      setMonitorSnapshot(autoBugDetector.getMonitorSnapshot())
    }, 5000)

    // Initial load
    setBugs(autoBugDetector.getUnfixedBugs())
    setStats(autoBugDetector.getStats())
    setMonitorSnapshot(autoBugDetector.getMonitorSnapshot())

    return () => clearInterval(interval)
  }, [])

  if (stats.unfixed === 0 && !isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-xs">
      <div className="bg-white rounded-lg shadow-xl border border-[#C3A35E]/20 overflow-hidden">
        {/* Header - Smaller */}
        <div
          className="bg-white border-b border-black200 text-black p-2 cursor-pointer"
          onClick={() => setIsVisible(!isVisible)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-base">🔍</span>
              <div>
                <div className="font-semibold text-xs">Auto Bug Detector</div>
                <div className="text-[10px] text-[#C3A35E]/90">
                  {stats.unfixed} unfixed • {stats.fixesApplied} fixed
                </div>
              </div>
            </div>
            <div className="text-xs">
              {stats.unfixed > 0 && (
                <span className="bg-white text-black px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  {stats.unfixed}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content - Smaller */}
        {isVisible && (
          <div className="p-2 max-h-80 overflow-y-auto">
            {/* Stats - Smaller */}
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="bg-white/10 p-1.5 rounded">
                <div className="text-[10px] text-black/70">Total</div>
                <div className="font-bold text-xs text-black">{stats.total}</div>
              </div>
              <div className="bg-white/10 p-1.5 rounded">
                <div className="text-[10px] text-black/70">Fixed</div>
                <div className="font-bold text-xs text-green-600">{stats.fixed}</div>
              </div>
              <div className="bg-white/10 p-1.5 rounded">
                <div className="text-[10px] text-black/70">Critical</div>
                <div className="font-bold text-xs text-red-600">{stats.bySeverity.critical}</div>
              </div>
              <div className="bg-white/10 p-1.5 rounded">
                <div className="text-[10px] text-black/70">High</div>
                <div className="font-bold text-xs text-orange-600">{stats.bySeverity.high}</div>
              </div>
            </div>

            {monitorSnapshot && (
              <div className="mb-2 border border-[#C3A35E]/30 rounded p-2 bg-white/5 text-[10px] text-black/80">
                <div className="font-bold text-black mb-1 text-xs">Infrastructure</div>
                <div className="flex justify-between">
                  <span>Backend</span>
                  <span className={monitorSnapshot.runtime?.backend?.healthy ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {monitorSnapshot.runtime?.backend?.healthy ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Frontend</span>
                  <span className={monitorSnapshot.runtime?.frontend?.healthy ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {monitorSnapshot.runtime?.frontend?.healthy ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            )}

            {/* Bugs List - Smaller */}
            {bugs.length > 0 ? (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-black mb-1">Unfixed Bugs:</div>
                {bugs.slice(0, 3).map((bug) => (
                  <div
                    key={bug.id}
                    className="p-1.5 bg-red-50 border border-red-200 rounded text-[10px]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-red-800 text-xs">{bug.type}</div>
                        <div className="text-black/70 mt-0.5 line-clamp-1">{bug.message}</div>
                        <div className="text-black/50 mt-0.5">
                          {bug.severity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {bugs.length > 3 && (
                  <div className="text-[10px] text-center text-black/70">
                    +{bugs.length - 3} more
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2 text-green-600">
                <div className="text-lg mb-1">✅</div>
                <div className="text-xs font-semibold">All fixed!</div>
              </div>
            )}

            {/* Actions - Smaller */}
            <div className="mt-2 flex space-x-1.5">
              <button
                onClick={() => {
                  autoBugDetector.clearFixedBugs()
                  setBugs(autoBugDetector.getUnfixedBugs())
                  setStats(autoBugDetector.getStats())
                  setMonitorSnapshot(autoBugDetector.getMonitorSnapshot())
                }}
                className="flex-1 bg-white/20 hover:bg-white/30 text-black text-[10px] py-1 px-2 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  autoBugDetector.performCheck()
                  setTimeout(() => {
                    setBugs(autoBugDetector.getUnfixedBugs())
                    setStats(autoBugDetector.getStats())
                    setMonitorSnapshot(autoBugDetector.getMonitorSnapshot())
                  }, 1000)
                }}
                className="flex-1 bg-white hover:bg-[#ffffff] text-white text-[10px] py-1 px-2 rounded transition-colors"
              >
                Check
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


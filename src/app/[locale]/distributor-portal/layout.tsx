import React from 'react'

export default function DistributorPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
    </div>
  )
}

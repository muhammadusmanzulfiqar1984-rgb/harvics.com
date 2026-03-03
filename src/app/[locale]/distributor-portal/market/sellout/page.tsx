'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'

export default function SelloutUpload() {
  const locale = useLocale()
  const [selectedMonth, setSelectedMonth] = useState('2025-01')
  const [uploaded, setUploaded] = useState(false)
  const [uploadData, setUploadData] = useState<any>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Simulate file processing
      setUploaded(true)
      setUploadData({
        skuCount: 45,
        totalVolume: 125000,
        insights: 'Predicted gaps in confectionery category. Consider increasing order for Premium Chocolate Bar by 15%.'
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#C3A35E]">Sell-out Upload</h1>

      <div className="bg-white rounded-lg border border-black200 shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Month *</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Upload File (CSV/Excel) *</label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
            />
            <p className="text-xs text-[#C3A35E]/90 mt-2">
              <a href="#" className="text-white hover:underline">Download template</a> for correct format
            </p>
          </div>

          {uploaded && uploadData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">✅</span>
                <h3 className="font-semibold text-green-800">File Uploaded Successfully</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-[#C3A35E]/90">SKUs Count</div>
                  <div className="text-xl font-bold text-[#C3A35E]">{uploadData.skuCount}</div>
                </div>
                <div>
                  <div className="text-sm text-[#C3A35E]/90">Total Volume</div>
                  <div className="text-xl font-bold text-white">${uploadData.totalVolume.toLocaleString()}</div>
                </div>
              </div>
              
              {/* Harvey Insights */}
              <div className="bg-gradient-to-r from-[#6B1F2B] to-[#ffffff] rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">🤖</span>
                  <h4 className="font-semibold">Harvey Insights</h4>
                </div>
                <p className="text-sm text-[#C3A35E]/90">{uploadData.insights}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


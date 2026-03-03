
import React from 'react'
import { getTranslations } from 'next-intl/server'
import KPICard from '@/components/shared/KPICard'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'

export default async function AnalyticsReportsPage() {
  const t = await getTranslations('common')
  const categories = getFolderBasedCategories()

  return (
    <div className="bg-gray-50 flex flex-col min-h-full">
      <div className="fixed top-0 left-0 right-0 z-[1000] bg-white">
        <Header categories={categories} />
      </div>
      <div className="h-20" /> {/* Spacer */}
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#6B1F2B]">Analytics Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive overview of system performance and market metrics.</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            label="Total Revenue"
            value="$4.2M"
            icon="💰"
            change={12.5}
            changeLabel="vs last month"
          />
          <KPICard
            label="Active Users"
            value="12.5K"
            icon="👥"
            change={8.2}
            changeLabel="vs last month"
          />
          <KPICard
            label="Market Share"
            value="28%"
            icon="📈"
            change={2.1}
            changeLabel="vs last month"
          />
          <KPICard
            label="System Health"
            value="99.9%"
            icon="⚡"
            change={0}
            changeLabel="stable"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-xl font-bold text-[#6B1F2B] mb-4">Revenue Trend</h3>
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
              [Revenue Chart Visualization]
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-xl font-bold text-[#6B1F2B] mb-4">User Growth</h3>
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
              [User Growth Chart Visualization]
            </div>
          </div>
        </div>

        {/* Detailed Report Table */}
        <div className="mt-8 bg-white rounded-lg shadow border border-[#C3A35E]/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#C3A35E]/20 bg-[#6B1F2B]/5">
            <h3 className="text-lg font-bold text-[#6B1F2B]">Recent Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#C3A35E]/10">
              <thead className="bg-[#C3A35E]/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">Report Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#C3A35E]/10">
                {[
                  { name: 'Q4 Financial Summary', date: '2025-12-31', type: 'Finance', status: 'Completed' },
                  { name: 'Market Penetration Analysis', date: '2026-01-15', type: 'Strategy', status: 'Completed' },
                  { name: 'Supply Chain Audit', date: '2026-01-20', type: 'Operations', status: 'In Progress' },
                  { name: 'Customer Satisfaction Survey', date: '2026-01-28', type: 'Marketing', status: 'Pending' },
                ].map((report, idx) => (
                  <tr key={idx} className="hover:bg-[#C3A35E]/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#6B1F2B]">{report.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{report.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{report.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                        report.status === 'Completed' ? 'bg-green-100 text-green-800 border border-green-200' : 
                        report.status === 'In Progress' ? 'bg-[#C3A35E]/20 text-[#6B1F2B] border border-[#C3A35E]/40' : 
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-[#6B1F2B] hover:text-[#C3A35E] font-bold uppercase text-xs border border-[#6B1F2B]/20 hover:border-[#C3A35E] px-3 py-1 rounded transition-all">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

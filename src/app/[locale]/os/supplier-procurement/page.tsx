'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import KPICard from '@/components/shared/KPICard'

export default function SupplierProcurementOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const portal = pathname?.includes('/portal/distributor') ? 'distributor' :
                 pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={portal}
      pageTitle="Supplier & Procurement OS"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Active Suppliers"
            value="156"
            icon="🏭"
          />
          <KPICard
            label="Open RFQs"
            value="23"
            icon="📄"
          />
          <KPICard
            label="Pending POs"
            value="45"
            icon="📋"
          />
          <KPICard
            label="Avg Lead Time"
            value="5.2"
            icon="⏱️"
          />
        </div>

        <div className="border-t border-[#C3A35E]/30 pt-6">
          <h3 className="text-lg font-semibold text-[#6B1F2B] mb-4">Procurement Workflow</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white border border-[#C3A35E]/30 hover:shadow-md transition-shadow">
              <div className="text-2xl grayscale-0">1️⃣</div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#6B1F2B]">RFQ (Request for Quotation)</h4>
                <p className="text-sm text-[#6B1F2B]/70">Create and send RFQs to suppliers</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white border border-[#C3A35E]/30 hover:shadow-md transition-shadow">
              <div className="text-2xl grayscale-0">2️⃣</div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#6B1F2B]">Purchase Orders</h4>
                <p className="text-sm text-[#6B1F2B]/70">Create and manage purchase orders</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white border border-[#C3A35E]/30 hover:shadow-md transition-shadow">
              <div className="text-2xl grayscale-0">3️⃣</div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#6B1F2B]">GRN (Goods Receipt Note)</h4>
                <p className="text-sm text-[#6B1F2B]/70">Process goods receipts and quality checks</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white border border-[#C3A35E]/30 hover:shadow-md transition-shadow">
              <div className="text-2xl grayscale-0">4️⃣</div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#6B1F2B]">Payment Processing</h4>
                <p className="text-sm text-[#6B1F2B]/70">Manage supplier payments and invoices</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#C3A35E]/30 pt-6">
          <h3 className="text-lg font-semibold text-[#6B1F2B] mb-4">Supplier Performance</h3>
          <div className="bg-white border border-[#C3A35E]/30 p-4 shadow-sm">
            <p className="text-[#6B1F2B]/80 mb-4">
              Track supplier performance metrics including on-time delivery,
              quality scores, lead times, and payment terms.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#6B1F2B]">
              <div className="p-3 bg-[#F5F1E8] border border-[#C3A35E]/10">
                <div className="font-semibold opacity-70 mb-1">On-Time Delivery</div>
                <div className="text-xl font-bold text-[#6B1F2B]">96%</div>
              </div>
              <div className="p-3 bg-[#F5F1E8] border border-[#C3A35E]/10">
                <div className="font-semibold opacity-70 mb-1">Quality Score</div>
                <div className="text-xl font-bold text-[#6B1F2B]">94%</div>
              </div>
              <div className="p-3 bg-[#F5F1E8] border border-[#C3A35E]/10">
                <div className="font-semibold opacity-70 mb-1">Avg Lead Time</div>
                <div className="text-xl font-bold text-[#6B1F2B]">5.2 days</div>
              </div>
              <div className="p-3 bg-[#F5F1E8] border border-[#C3A35E]/10">
                <div className="font-semibold opacity-70 mb-1">Payment Score</div>
                <div className="text-xl font-bold text-[#6B1F2B]">98%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

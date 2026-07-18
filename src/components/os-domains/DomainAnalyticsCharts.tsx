'use client'

import React from 'react'
import { LineChartCard, BarChartCard, PieChartCard, AreaChartCard } from '@/components/charts'

// ═══════════════════════════════════════════════════
// CRM ANALYTICS CHARTS
// ═══════════════════════════════════════════════════
export function CRMAnalyticsCharts() {
  const pipelineData = [
    { name: 'Jul', won: 380000, lost: 92000, pipeline: 620000 },
    { name: 'Aug', won: 420000, lost: 85000, pipeline: 680000 },
    { name: 'Sep', won: 510000, lost: 62000, pipeline: 720000 },
    { name: 'Oct', won: 480000, lost: 95000, pipeline: 810000 },
    { name: 'Nov', won: 560000, lost: 71000, pipeline: 880000 },
    { name: 'Dec', won: 620000, lost: 44000, pipeline: 930000 },
    { name: 'Jan', won: 540000, lost: 88000, pipeline: 860000 },
    { name: 'Feb', won: 580000, lost: 78000, pipeline: 870000 },
    { name: 'Mar', won: 650000, lost: 56000, pipeline: 980000 },
    { name: 'Apr', won: 710000, lost: 52000, pipeline: 1050000 },
    { name: 'May', won: 740000, lost: 41000, pipeline: 1120000 },
    { name: 'Jun', won: 820000, lost: 38000, pipeline: 1240000 },
  ]
  const segmentData = [
    { name: 'Enterprise', value: 38 },
    { name: 'Mid-Market', value: 26 },
    { name: 'SMB', value: 21 },
    { name: 'Startup', value: 10 },
    { name: 'Government', value: 5 },
  ]
  const leadSourceData = [
    { name: 'Referral', leads: 142, conversion: 38 },
    { name: 'Website', leads: 118, conversion: 22 },
    { name: 'Trade Events', leads: 94, conversion: 32 },
    { name: 'LinkedIn', leads: 87, conversion: 18 },
    { name: 'Cold Outreach', leads: 72, conversion: 12 },
    { name: 'Partners', leads: 63, conversion: 34 },
    { name: 'Inbound Call', leads: 41, conversion: 28 },
  ]
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold text-harvics-cream">CRM Analytics Dashboard</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="Pipeline Trend (12 Months)" data={pipelineData} dataKeys={['won', 'pipeline']} colors={['#059669', 'var(--harvics-gold)']} height={280} />
        <PieChartCard title="Customer Segmentation" data={segmentData} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)', '#0891b2', '#f59e0b', '#7c3aed']} height={280} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard title="Lead Sources & Conversion %" data={leadSourceData} dataKeys={['leads', 'conversion']} colors={['var(--harvics-burgundy)', '#059669']} height={260} />
        <LineChartCard title="Deal Velocity (Won vs Lost)" data={pipelineData} dataKeys={['won', 'lost']} colors={['#059669', '#dc2626']} height={260} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// SALES / ORDERS ANALYTICS CHARTS
// ═══════════════════════════════════════════════════
export function SalesAnalyticsCharts() {
  const revenueData = [
    { name: 'Jan', revenue: 1840000, orders: 186, target: 2000000 },
    { name: 'Feb', revenue: 2120000, orders: 214, target: 2000000 },
    { name: 'Mar', revenue: 2380000, orders: 242, target: 2200000 },
    { name: 'Apr', revenue: 1960000, orders: 198, target: 2200000 },
    { name: 'May', revenue: 2650000, orders: 268, target: 2400000 },
    { name: 'Jun', revenue: 2890000, orders: 294, target: 2400000 },
  ]
  const channelData = [
    { name: 'Direct', value: 42 },
    { name: 'Distributors', value: 31 },
    { name: 'HarvicTrade', value: 18 },
    { name: 'Partners', value: 9 },
  ]
  const verticalData = [
    { name: 'FMCG', revenue: 890000, margin: 24 },
    { name: 'Textiles', revenue: 720000, margin: 18 },
    { name: 'Industrial', revenue: 540000, margin: 32 },
    { name: 'Commodities', revenue: 430000, margin: 12 },
    { name: 'Minerals', revenue: 310000, margin: 28 },
  ]
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold text-harvics-cream">Sales Analytics Dashboard</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="Revenue vs Target (MTD)" data={revenueData} dataKeys={['revenue', 'target']} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)']} height={280} />
        <PieChartCard title="Revenue by Channel" data={channelData} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)', '#8B3A4A', '#D4B46E']} height={280} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard title="Revenue by Vertical" data={verticalData} dataKeys={['revenue', 'margin']} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)']} height={260} />
        <LineChartCard title="Order Volume Trend" data={revenueData} dataKeys={['orders']} colors={['var(--harvics-burgundy)']} height={260} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// HR ANALYTICS CHARTS
// ═══════════════════════════════════════════════════
export function HRAnalyticsCharts() {
  const headcountData = [
    { name: 'Jan', headcount: 342, hires: 12, exits: 4 },
    { name: 'Feb', headcount: 350, hires: 14, exits: 6 },
    { name: 'Mar', headcount: 358, hires: 16, exits: 8 },
    { name: 'Apr', headcount: 366, hires: 18, exits: 10 },
    { name: 'May', headcount: 378, hires: 22, exits: 10 },
    { name: 'Jun', headcount: 392, hires: 24, exits: 10 },
  ]
  const departmentData = [
    { name: 'Sales', value: 28 },
    { name: 'Operations', value: 22 },
    { name: 'Technology', value: 18 },
    { name: 'Finance', value: 12 },
    { name: 'HR', value: 8 },
    { name: 'Other', value: 12 },
  ]
  const payrollData = [
    { name: 'Jan', payroll: 1420000, benefits: 284000 },
    { name: 'Feb', payroll: 1450000, benefits: 290000 },
    { name: 'Mar', payroll: 1480000, benefits: 296000 },
    { name: 'Apr', payroll: 1520000, benefits: 304000 },
    { name: 'May', payroll: 1560000, benefits: 312000 },
    { name: 'Jun', payroll: 1620000, benefits: 324000 },
  ]
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold text-harvics-cream">HR Analytics Dashboard</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="Headcount Growth" data={headcountData} dataKeys={['headcount']} colors={['var(--harvics-burgundy)']} height={280} />
        <PieChartCard title="Workforce by Department" data={departmentData} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)', '#8B3A4A', '#D4B46E', '#4A1018', '#E5C07B']} height={280} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard title="Hires vs Exits" data={headcountData} dataKeys={['hires', 'exits']} colors={['#16a34a', '#dc2626']} height={260} />
        <AreaChartCard title="Payroll & Benefits Cost" data={payrollData} dataKeys={['payroll', 'benefits']} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)']} height={260} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// LOGISTICS ANALYTICS CHARTS
// ═══════════════════════════════════════════════════
export function LogisticsAnalyticsCharts() {
  const deliveryData = [
    { name: 'Jan', onTime: 92, delayed: 8, shipments: 186 },
    { name: 'Feb', onTime: 94, delayed: 6, shipments: 214 },
    { name: 'Mar', onTime: 91, delayed: 9, shipments: 242 },
    { name: 'Apr', onTime: 96, delayed: 4, shipments: 198 },
    { name: 'May', onTime: 94, delayed: 6, shipments: 268 },
    { name: 'Jun', onTime: 95, delayed: 5, shipments: 294 },
  ]
  const routeData = [
    { name: 'UAE-UK', value: 32 },
    { name: 'Pakistan-EU', value: 24 },
    { name: 'Turkey-GCC', value: 18 },
    { name: 'Spain-ME', value: 14 },
    { name: 'Other', value: 12 },
  ]
  const costData = [
    { name: 'Jan', freight: 342000, customs: 68000, warehouse: 94000 },
    { name: 'Feb', freight: 358000, customs: 72000, warehouse: 96000 },
    { name: 'Mar', freight: 412000, customs: 82000, warehouse: 98000 },
    { name: 'Apr', freight: 386000, customs: 77000, warehouse: 95000 },
    { name: 'May', freight: 428000, customs: 86000, warehouse: 102000 },
    { name: 'Jun', freight: 462000, customs: 92000, warehouse: 108000 },
  ]
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold text-harvics-cream">Logistics Analytics Dashboard</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard title="On-Time Delivery Rate (%)" data={deliveryData} dataKeys={['onTime', 'delayed']} colors={['#16a34a', '#dc2626']} height={280} />
        <PieChartCard title="Shipments by Trade Route" data={routeData} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)', '#8B3A4A', '#D4B46E', '#4A1018']} height={280} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="Logistics Cost Breakdown" data={costData} dataKeys={['freight', 'customs', 'warehouse']} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)', '#8B3A4A']} height={260} />
        <BarChartCard title="Monthly Shipment Volume" data={deliveryData} dataKeys={['shipments']} colors={['var(--harvics-burgundy)']} height={260} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// EXECUTIVE DASHBOARD CHARTS
// ═══════════════════════════════════════════════════
export function ExecutiveAnalyticsCharts() {
  const plData = [
    { name: 'Q1 2025', revenue: 8200000, cogs: 5400000, ebitda: 1800000 },
    { name: 'Q2 2025', revenue: 9100000, cogs: 5900000, ebitda: 2100000 },
    { name: 'Q3 2025', revenue: 10400000, cogs: 6700000, ebitda: 2500000 },
    { name: 'Q4 2025', revenue: 11800000, cogs: 7500000, ebitda: 2900000 },
    { name: 'Q1 2026', revenue: 12600000, cogs: 7900000, ebitda: 3200000 },
  ]
  const regionData = [
    { name: 'Middle East', value: 35 },
    { name: 'Europe', value: 25 },
    { name: 'Africa', value: 18 },
    { name: 'Asia', value: 14 },
    { name: 'Americas', value: 8 },
  ]
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold text-harvics-cream">Executive Dashboard</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="P&L Trend (Quarterly)" data={plData} dataKeys={['revenue', 'ebitda']} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)']} height={280} />
        <PieChartCard title="Revenue by Region" data={regionData} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)', '#8B3A4A', '#D4B46E', '#4A1018']} height={280} />
      </div>
      <BarChartCard title="Revenue vs COGS vs EBITDA" data={plData} dataKeys={['revenue', 'cogs', 'ebitda']} colors={['var(--harvics-burgundy)', '#dc2626', '#16a34a']} height={280} />
    </div>
  )
}

// ═══════════════════════════════════════════════════
// FINANCE ANALYTICS CHARTS
// ═══════════════════════════════════════════════════
export function FinanceAnalyticsCharts() {
  const cashflowData = [
    { name: 'Jan', inflow: 2800000, outflow: 2200000, net: 600000 },
    { name: 'Feb', inflow: 3100000, outflow: 2400000, net: 700000 },
    { name: 'Mar', inflow: 2900000, outflow: 2600000, net: 300000 },
    { name: 'Apr', inflow: 3400000, outflow: 2500000, net: 900000 },
    { name: 'May', inflow: 3200000, outflow: 2700000, net: 500000 },
    { name: 'Jun', inflow: 3800000, outflow: 2800000, net: 1000000 },
  ]
  const budgetData = [
    { name: 'Sales', budget: 1200000, actual: 1340000 },
    { name: 'Marketing', budget: 450000, actual: 420000 },
    { name: 'Operations', budget: 800000, actual: 860000 },
    { name: 'Technology', budget: 600000, actual: 580000 },
    { name: 'HR', budget: 350000, actual: 340000 },
  ]
  const arApData = [
    { name: 'Jan', receivable: 1800000, payable: 1200000 },
    { name: 'Feb', receivable: 2100000, payable: 1400000 },
    { name: 'Mar', receivable: 1900000, payable: 1500000 },
    { name: 'Apr', receivable: 2400000, payable: 1300000 },
    { name: 'May', receivable: 2200000, payable: 1600000 },
    { name: 'Jun', receivable: 2600000, payable: 1400000 },
  ]
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold text-harvics-cream">Finance Analytics Dashboard</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="Cash Flow (Inflow vs Outflow)" data={cashflowData} dataKeys={['inflow', 'outflow', 'net']} colors={['#16a34a', '#dc2626', 'var(--harvics-gold)']} height={280} />
        <BarChartCard title="Budget vs Actual by Dept" data={budgetData} dataKeys={['budget', 'actual']} colors={['var(--harvics-gold)', 'var(--harvics-burgundy)']} height={280} />
      </div>
      <LineChartCard title="Accounts Receivable vs Payable" data={arApData} dataKeys={['receivable', 'payable']} colors={['var(--harvics-burgundy)', '#dc2626']} height={260} />
    </div>
  )
}

// ═══════════════════════════════════════════════════
// INVESTOR ANALYTICS CHARTS
// ═══════════════════════════════════════════════════
export function InvestorAnalyticsCharts() {
  const stockData = [
    { name: 'Oct', price: 36.20, volume: 142000 },
    { name: 'Nov', price: 38.50, volume: 168000 },
    { name: 'Dec', price: 37.80, volume: 154000 },
    { name: 'Jan', price: 39.40, volume: 186000 },
    { name: 'Feb', price: 41.20, volume: 198000 },
    { name: 'Mar', price: 42.50, volume: 212000 },
    { name: 'Apr', price: 43.80, volume: 224000 },
  ]
  const earningsData = [
    { name: 'Q1 2025', eps: 0.82, revenue: 8.2 },
    { name: 'Q2 2025', eps: 0.91, revenue: 9.1 },
    { name: 'Q3 2025', eps: 1.04, revenue: 10.4 },
    { name: 'Q4 2025', eps: 1.18, revenue: 11.8 },
    { name: 'Q1 2026', eps: 1.26, revenue: 12.6 },
  ]
  const shareholderData = [
    { name: 'Founder', value: 52 },
    { name: 'Institutional', value: 28 },
    { name: 'Retail', value: 12 },
    { name: 'ESOP', value: 8 },
  ]
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold text-harvics-cream">Investor Analytics Dashboard</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="Share Price (6 Months)" data={stockData} dataKeys={['price']} colors={['#16a34a']} height={280} />
        <PieChartCard title="Shareholder Structure" data={shareholderData} colors={['var(--harvics-burgundy)', 'var(--harvics-gold)', '#8B3A4A', '#D4B46E']} height={280} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard title="Quarterly EPS" data={earningsData} dataKeys={['eps']} colors={['var(--harvics-burgundy)']} height={260} />
        <LineChartCard title="Revenue Trend ($M)" data={earningsData} dataKeys={['revenue']} colors={['var(--harvics-gold)']} height={260} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// COMPETITOR ANALYTICS CHARTS
// ═══════════════════════════════════════════════════
export function CompetitorAnalyticsCharts() {
  const marketShareData = [
    { name: 'Harvics', value: 18 },
    { name: 'Competitor A', value: 24 },
    { name: 'Competitor B', value: 16 },
    { name: 'Competitor C', value: 12 },
    { name: 'Others', value: 30 },
  ]
  const pricingData = [
    { name: 'FMCG', harvics: 100, compA: 108, compB: 95 },
    { name: 'Textiles', harvics: 100, compA: 112, compB: 98 },
    { name: 'Industrial', harvics: 100, compA: 104, compB: 102 },
    { name: 'Commodities', harvics: 100, compA: 98, compB: 106 },
  ]
  const trendData = [
    { name: 'Q1', harvics: 14, compA: 22, compB: 16 },
    { name: 'Q2', harvics: 16, compA: 23, compB: 15 },
    { name: 'Q3', harvics: 17, compA: 24, compB: 16 },
    { name: 'Q4', harvics: 18, compA: 24, compB: 16 },
  ]
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold text-harvics-cream">Competitive Intelligence Dashboard</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartCard title="Market Share Distribution" data={marketShareData} colors={['var(--harvics-gold)', 'var(--harvics-burgundy)', '#8B3A4A', '#D4B46E', '#ccc']} height={280} />
        <LineChartCard title="Market Share Trend (%)" data={trendData} dataKeys={['harvics', 'compA', 'compB']} colors={['var(--harvics-gold)', 'var(--harvics-burgundy)', '#8B3A4A']} height={280} />
      </div>
      <BarChartCard title="Price Index by Vertical (Harvics = 100)" data={pricingData} dataKeys={['harvics', 'compA', 'compB']} colors={['var(--harvics-gold)', 'var(--harvics-burgundy)', '#8B3A4A']} height={260} />
    </div>
  )
}

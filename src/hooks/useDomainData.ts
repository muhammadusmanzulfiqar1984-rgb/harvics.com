'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'

// ── Rich mock data that mirrors exact backend shape ────────────────────────
const MOCK: Record<string, any> = {
  crm: {
    totalCustomers: 487, activeCustomers: 412, newCustomers: 47, satisfaction: 96,
    revenueByMonth: [1840000, 2120000, 1950000, 2380000, 2650000, 2800000, 2950000, 2700000, 3100000, 3250000, 3400000, 3600000],
    customersByRegion: [
      { region: 'Middle East', count: 132, revenue: 5800000 },
      { region: 'South Asia', count: 104, revenue: 4200000 },
      { region: 'East Africa', count: 88, revenue: 3100000 },
      { region: 'North America', count: 72, revenue: 6400000 },
      { region: 'Europe', count: 54, revenue: 2900000 },
      { region: 'Southeast Asia', count: 37, revenue: 1800000 },
    ],
    customers: [
      { id: 'C001', name: 'Al Amin Trading', type: 'Distributor', country: 'UAE 🇦🇪', status: 'Active', lifetimeValue: 4200000, orders: 124, lastOrder: '2 days ago' },
      { id: 'C002', name: 'Pacific Grocers', type: 'Retailer', country: 'USA 🇺🇸', status: 'Active', lifetimeValue: 2700000, orders: 89, lastOrder: '5 days ago' },
      { id: 'C003', name: 'Karachi Wholesale', type: 'Distributor', country: 'Pakistan 🇵🇰', status: 'Active', lifetimeValue: 1900000, orders: 67, lastOrder: '1 day ago' },
      { id: 'C004', name: 'Nairobi Distributors', type: 'Distributor', country: 'Kenya 🇰🇪', status: 'Active', lifetimeValue: 480000, orders: 34, lastOrder: '3 days ago' },
      { id: 'C005', name: 'Singapore Traders', type: 'Retailer', country: 'Singapore 🇸🇬', status: 'Inactive', lifetimeValue: 920000, orders: 28, lastOrder: '2 weeks ago' },
      { id: 'C006', name: 'Istanbul Imports', type: 'Distributor', country: 'Turkey 🇹🇷', status: 'Active', lifetimeValue: 1100000, orders: 52, lastOrder: '4 days ago' },
      { id: 'C007', name: 'Mumbai Distributors', type: 'Distributor', country: 'India 🇮🇳', status: 'Active', lifetimeValue: 3400000, orders: 108, lastOrder: '1 day ago' },
      { id: 'C008', name: 'London Premium', type: 'Retailer', country: 'UK 🇬🇧', status: 'Active', lifetimeValue: 760000, orders: 19, lastOrder: '1 week ago' },
      { id: 'C009', name: 'Gulf Foods Group', type: 'Wholesaler', country: 'Saudi Arabia 🇸🇦', status: 'Active', lifetimeValue: 5600000, orders: 142, lastOrder: '1 day ago' },
      { id: 'C010', name: 'Lagos FMCG Ltd', type: 'Distributor', country: 'Nigeria 🇳🇬', status: 'Active', lifetimeValue: 890000, orders: 41, lastOrder: '6 days ago' },
      { id: 'C011', name: 'Berlin Health Co', type: 'Retailer', country: 'Germany 🇩🇪', status: 'Active', lifetimeValue: 620000, orders: 22, lastOrder: '3 days ago' },
      { id: 'C012', name: 'Dhaka Trading House', type: 'Wholesaler', country: 'Bangladesh 🇧🇩', status: 'Active', lifetimeValue: 1340000, orders: 58, lastOrder: '2 days ago' },
    ],
    leads: [
      { id: 'L001', company: 'Gulf Foods Group', contact: 'Ahmed Al-Rashid', estimatedValue: 850000, stage: 'Proposal', probability: 70 },
      { id: 'L002', company: 'West Africa Traders', contact: 'James Okonkwo', estimatedValue: 320000, stage: 'Negotiation', probability: 85 },
      { id: 'L003', company: 'Vietnam Imports Co', contact: 'Nguyen Minh', estimatedValue: 240000, stage: 'Qualified', probability: 45 },
      { id: 'L004', company: 'Cairo Distribution', contact: 'Hassan El-Masry', estimatedValue: 680000, stage: 'Proposal', probability: 60 },
      { id: 'L005', company: 'Johannesburg Retail', contact: 'Thabo Molefe', estimatedValue: 410000, stage: 'Contacted', probability: 35 },
      { id: 'L006', company: 'Kuala Lumpur Foods', contact: 'Amir bin Yusof', estimatedValue: 560000, stage: 'Negotiation', probability: 80 },
    ],
    complaints: [
      { id: 'CP001', customer: 'Pacific Grocers', issue: 'Delivery delay — shipment 3 days late', status: 'Resolved', date: '2 days ago', priority: 'Medium' },
      { id: 'CP002', customer: 'Istanbul Imports', issue: 'Invoice discrepancy — $4,200 overcharge', status: 'Open', date: '1 day ago', priority: 'High' },
      { id: 'CP003', customer: 'Nairobi Distributors', issue: 'Damaged packaging on 12 cartons', status: 'In Progress', date: '3 days ago', priority: 'High' },
      { id: 'CP004', customer: 'London Premium', issue: 'Wrong SKU shipped — expected UK-GRANOLA-8PK', status: 'Open', date: '4 hours ago', priority: 'Critical' },
    ],
  },
  orders: {
    total: 2140, pending: 187, completed: 1820, inTransit: 133, cancelled: 0, revenue: 28400000,
    revenueByMonth: [1800000, 2100000, 1950000, 2400000, 2650000, 2800000, 2950000, 2700000, 3100000, 3250000, 3400000, 3500000],
    ordersByChannel: [
      { channel: 'Modern Trade', count: 890, revenue: 14200000 },
      { channel: 'General Trade', count: 720, revenue: 8100000 },
      { channel: 'E-Commerce', count: 310, revenue: 4200000 },
      { channel: 'Institutional', count: 220, revenue: 1900000 },
    ],
    orders: [
      { id: 'ORD-8841', customer: 'Al Amin Trading', amount: 320000, status: 'Completed', date: '2026-03-20', channel: 'Modern Trade', country: 'UAE' },
      { id: 'ORD-8842', customer: 'Pacific Grocers', amount: 185000, status: 'In Transit', date: '2026-03-21', channel: 'Premium Grocery', country: 'USA' },
      { id: 'ORD-8843', customer: 'Karachi Wholesale', amount: 94000, status: 'Pending', date: '2026-03-21', channel: 'General Trade', country: 'Pakistan' },
      { id: 'ORD-8844', customer: 'Mumbai Distributors', amount: 265000, status: 'Completed', date: '2026-03-19', channel: 'Modern Trade', country: 'India' },
      { id: 'ORD-8845', customer: 'Nairobi Distributors', amount: 48000, status: 'In Transit', date: '2026-03-20', channel: 'General Trade', country: 'Kenya' },
      { id: 'ORD-8846', customer: 'Istanbul Imports', amount: 132000, status: 'Completed', date: '2026-03-18', channel: 'Modern Trade', country: 'Turkey' },
      { id: 'ORD-8847', customer: 'London Premium', amount: 76000, status: 'Pending', date: '2026-03-21', channel: 'Premium Retail', country: 'UK' },
      { id: 'ORD-8848', customer: 'Gulf Foods Group', amount: 210000, status: 'Completed', date: '2026-03-20', channel: 'Institutional', country: 'Saudi Arabia' },
    ],
  },
  inventory: {
    totalValue: 18400000, lowStock: 14, totalSkus: 247, warehouseCount: 12, turnoverDays: 28,
    valueByCategory: [
      { category: 'Beverages', value: 7200000, skus: 89 },
      { category: 'FMCG Foods', value: 5100000, skus: 72 },
      { category: 'Personal Care', value: 3200000, skus: 48 },
      { category: 'Confectionery', value: 1900000, skus: 24 },
      { category: 'Other', value: 1000000, skus: 14 },
    ],
    stockTrend: [19200000, 18800000, 19400000, 18200000, 17900000, 18600000, 19100000, 18400000, 18700000, 18400000, 18100000, 18400000],
    skus: [
      { sku: 'AE-ENERGY-12PK', description: 'Energy Infusion 12pk', category: 'Beverages', onHand: 520, minStock: 400, value: 87000, status: 'OK' },
      { sku: 'PK-JUICE-MANGO', description: 'Mango Nectar 1L', category: 'Beverages', onHand: 180, minStock: 250, value: 12600, status: 'Low' },
      { sku: 'US-PROTEIN-BAR', description: 'Protein Crunch Bars 24pk', category: 'FMCG Foods', onHand: 310, minStock: 280, value: 62000, status: 'OK' },
      { sku: 'AE-WATER-500ML', description: 'Premium Still Water 500ml', category: 'Beverages', onHand: 1240, minStock: 800, value: 31000, status: 'OK' },
      { sku: 'UK-GRANOLA-8PK', description: 'Organic Granola 8pk', category: 'FMCG Foods', onHand: 95, minStock: 150, value: 8550, status: 'Low' },
      { sku: 'IN-SPICE-MIX', description: 'Premium Spice Mix 250g', category: 'FMCG Foods', onHand: 440, minStock: 300, value: 22000, status: 'OK' },
    ],
  },
  finance: {
    revenue: 28400000, expenses: 19800000, grossProfit: 8600000, netProfit: 6200000,
    pendingPayments: 1840000, cashOnHand: 4200000, arBalance: 7800000, apBalance: 3400000,
    revenueByMonth: [2100000, 2300000, 2200000, 2600000, 2800000, 2950000, 3100000, 2850000, 3300000, 3450000, 3600000, 3700000],
    expenseByMonth: [1600000, 1700000, 1650000, 1820000, 1900000, 2000000, 2100000, 1950000, 2200000, 2300000, 2350000, 2400000],
    expenseBreakdown: [
      { category: 'Cost of Goods', amount: 11200000, pct: 57 },
      { category: 'Logistics', amount: 3100000, pct: 16 },
      { category: 'Salaries', amount: 2400000, pct: 12 },
      { category: 'Marketing', amount: 1600000, pct: 8 },
      { category: 'Overheads', amount: 1500000, pct: 7 },
    ],
  },
  hr: {
    totalEmployees: 847, fieldForce: 312, salesOfficers: 84, attendanceRate: 96,
    openPositions: 23, newHires: 18, attritionRate: 4.2,
    headcountByDept: [
      { dept: 'Sales & Field', count: 312 },
      { dept: 'Logistics & Ops', count: 198 },
      { dept: 'Finance & Admin', count: 124 },
      { dept: 'Marketing', count: 89 },
      { dept: 'Technology', count: 74 },
      { dept: 'HR & Legal', count: 50 },
    ],
    attendanceTrend: [94, 96, 95, 97, 96, 94, 97, 96, 98, 96, 97, 96],
    employees: [
      { id: 'E001', name: 'Fatima Al-Hassan', dept: 'Sales', role: 'Regional Manager', country: 'UAE', status: 'Active', performance: 'Excellent' },
      { id: 'E002', name: 'Rajesh Kumar', dept: 'Logistics', role: 'Route Planner', country: 'India', status: 'Active', performance: 'Good' },
      { id: 'E003', name: 'Sarah Mitchell', dept: 'Finance', role: 'Senior Accountant', country: 'UK', status: 'Active', performance: 'Excellent' },
      { id: 'E004', name: 'Omar Abdullah', dept: 'Sales', role: 'Sales Officer', country: 'Pakistan', status: 'Active', performance: 'Good' },
      { id: 'E005', name: 'Chen Wei', dept: 'Technology', role: 'Backend Engineer', country: 'Singapore', status: 'Active', performance: 'Excellent' },
    ],
  },
  executive: {
    totalRevenue: 28400000, netProfit: 6200000, profitMargin: 21.8, growthYoY: 14.2,
    marketShare: 18.4, roi: 22.1, customerRetention: 94, employeeSatisfaction: 87,
    kpiTrend: [
      { month: 'Oct', revenue: 3300000, profit: 720000, orders: 1840 },
      { month: 'Nov', revenue: 3450000, profit: 780000, orders: 1960 },
      { month: 'Dec', revenue: 3600000, profit: 840000, orders: 2080 },
      { month: 'Jan', revenue: 3700000, profit: 890000, orders: 2140 },
    ],
    alerts: [
      { id: 'A001', type: 'warning', message: 'Pakistan inventory below threshold in 3 SKUs', domain: 'Inventory', time: '2h ago' },
      { id: 'A002', type: 'info', message: 'Q1 revenue target achieved 3 weeks early', domain: 'Finance', time: '4h ago' },
      { id: 'A003', type: 'success', message: 'UAE distributor onboarding completed', domain: 'CRM', time: '6h ago' },
      { id: 'A004', type: 'warning', message: 'Logistics efficiency dip in East Africa (82%)', domain: 'Logistics', time: '8h ago' },
    ],
  },
}

type Domain = 'crm' | 'orders' | 'inventory' | 'finance' | 'hr' | 'executive'

const API_MAP: Record<Domain, () => Promise<any>> = {
  crm: () => apiClient.getDomainCRM(),
  orders: () => apiClient.getDomainOrders(),
  inventory: () => apiClient.getDomainInventory(),
  finance: () => apiClient.getDomainFinance(),
  hr: () => apiClient.getDomainHR(),
  executive: () => apiClient.getDomainExecutive(),
}

export function useDomainData(domain: Domain) {
  const [data, setData] = useState<any>(MOCK[domain])
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState<'mock' | 'live'>('mock')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await API_MAP[domain]()
      if (result?.data && !result?.error && Object.keys(result.data).length > 0) {
        setData({ ...MOCK[domain], ...result.data })
        setSource('live')
      }
    } catch {
      // keep mock data
    } finally {
      setLastUpdated(new Date())
      setLoading(false)
    }
  }, [domain])

  useEffect(() => {
    refresh()
    // Auto-refresh every 60s
    const interval = setInterval(refresh, 60000)
    return () => clearInterval(interval)
  }, [refresh])

  return { data, loading, source, lastUpdated, refresh }
}

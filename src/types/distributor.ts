export interface DistributorOverview {
  totalSales: { value: number; growth: number }
  totalOrders: { value: number; growth: number }
  avgOrderValue: { value: number; growth: number }
  satisfaction: { value: number; growth: number }
  salesTrend: { month: string; sales: number }[]
  productCategories: { name: string; value: number; color: string }[]
  topCustomers: { name: string; orders: number; revenue: number }[]
  regionPerformance: { region: string; sales: number; growth: number }[]
}

export type DistributorPortal = Record<string, unknown>

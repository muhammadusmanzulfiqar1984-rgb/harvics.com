import { fetchDomainOverview } from './crm.service'

const safeNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : fallback

export const getDistributorDashboardViewModel = async () => {
  const overview = await fetchDomainOverview()

  const orders = overview.orders || {}
  const inventory = overview.inventory || {}
  const logistics = overview.logistics || {}
  const finance = overview.finance || {}
  const crm = overview.crm || {}

  return {
    ordersToday: safeNumber(orders.total),
    pendingDeliveries: safeNumber(orders.inTransit) + safeNumber(orders.pending),
    retailers: safeNumber(crm.totalCustomers),
    attendance: safeNumber(crm.promotions) + safeNumber(logistics.activeRoutes),
    lowStockSkus: safeNumber(inventory.lowStock),
    outstandingInvoices: safeNumber(finance.pendingPayments),
    creditLimit: safeNumber(finance.revenue) * 0.2,
    complaints: safeNumber(crm.complaints),
    currency: finance.currency || orders.currency || '',
  }
}

export const getSupplierDashboardViewModel = async () => {
  const overview = await fetchDomainOverview()

  const orders = overview.orders || {}
  const logistics = overview.logistics || {}
  const finance = overview.finance || {}
  const crm = overview.crm || {}

  return {
    purchaseOrders: safeNumber(orders.total),
    shipments: safeNumber(logistics.deliveries),
    invoices: safeNumber(finance.revenue),
    paymentsPending: safeNumber(finance.pendingPayments),
    qualityComplaints: safeNumber(crm.complaints),
    forecast: safeNumber(finance.revenue) * 1.08,
    currency: finance.currency || orders.currency || '',
  }
}


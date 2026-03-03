import { apiClient, ApiResponse } from '@/lib/api'

const safeData = <T>(response: ApiResponse<T>) =>
  response && 'data' in response ? (response as any).data : null

export const fetchDomainOverview = async (countryCode?: string) => {
  const [
    ordersRes,
    inventoryRes,
    logisticsRes,
    financeRes,
    crmRes,
  ] = await Promise.all([
    apiClient.getDomainOrders(countryCode),
    apiClient.getDomainInventory(countryCode),
    apiClient.getDomainLogistics(countryCode),
    apiClient.getDomainFinance(countryCode),
    apiClient.getDomainCRM(countryCode),
  ])

  return {
    orders: safeData(ordersRes),
    inventory: safeData(inventoryRes),
    logistics: safeData(logisticsRes),
    finance: safeData(financeRes),
    crm: safeData(crmRes),
  }
}


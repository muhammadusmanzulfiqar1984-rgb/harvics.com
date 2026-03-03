import { mockProvidersEnabled, getMockDataOcean } from '../../external/mockProviders'

interface DataOceanSummary {
  countryCode: string
  manufacturers: number
  distributors: number
  wholesalers: number
  importers: number
  retailers: number
  annualSalesUSD: number
  annualProcurementUSD: number
  categoryLeaders: Array<{ category: string; leader: string }>
}

interface DataOceanFlow {
  from: string
  to: string
  category: string
  valueUSD: number
  velocity: string
}

const defaultSummary: DataOceanSummary = {
  countryCode: 'GLOBAL',
  manufacturers: 10,
  distributors: 25,
  wholesalers: 50,
  importers: 8,
  retailers: 400,
  annualSalesUSD: 500000000,
  annualProcurementUSD: 200000000,
  categoryLeaders: [{ category: 'Snacks', leader: 'Harvics Core' }]
}

const defaultFlows: DataOceanFlow[] = [
  { from: 'Manufacturer', to: 'Distributor', category: 'Snacks', valueUSD: 25000000, velocity: '1.1x' },
  { from: 'Distributor', to: 'Retailer', category: 'Beverages', valueUSD: 18000000, velocity: '1.0x' }
]

const useMocks = mockProvidersEnabled()

export const getDataOceanSummary = (countryCode: string) => {
  if (useMocks) {
    const intel = getMockDataOcean(countryCode)
    if (intel?.summary) {
      return intel.summary as DataOceanSummary
    }
  }
  return { ...defaultSummary, countryCode: countryCode.toUpperCase() }
}

export const getDataOceanFlows = (countryCode: string) => {
  if (useMocks) {
    const intel = getMockDataOcean(countryCode)
    if (intel?.flows) {
      return intel.flows as DataOceanFlow[]
    }
  }
  return defaultFlows
}


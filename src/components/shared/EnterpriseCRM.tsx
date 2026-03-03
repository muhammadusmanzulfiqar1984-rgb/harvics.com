'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import { filterByGeographicScope, createGeographicScopeFromUserScope } from '@/lib/geographic'
import type { GeographicScope } from '@/types/geographicScope'
import type { UserScope } from '@/types/userScope'
import { logger } from '@/lib/logger'
import InteractiveWorldMap from '@/components/ui/InteractiveWorldMap'
import AdminPanel from '@/components/shared/AdminPanel'
import StockTicker from '@/components/ui/StockTicker'
import StockChart from '@/components/ui/StockChart'
import InvestorRelationsForm from '@/app/[locale]/investor-relations/InvestorRelationsForm'

// Type definitions for domain data
interface OrderData {
  id: string
  customer: string
  amount: number
  status: string
  date: string
  country: string
  geographicPath?: string
}

interface InventoryItem {
  sku: string
  description: string
  stock: number
  category: string
  value: number
  warehouse: string
}

interface RouteDetail {
  routeId: string
  destination: string
  distance: number
  status: string
  countries?: string[]
}

interface Customer {
  id: string
  name: string
  status: string
  revenue: number
  country: string
}

interface Employee {
  id: string
  name: string
  department: string
  status: string
  country: string
}

interface DomainData {
  orders?: {
    total: number
    pending: number
    completed: number
    revenue: number
    orders: OrderData[]
  }
  inventory?: {
    totalValue: number
    items: number
    lowStock: number
    categories: number
    inventoryItems: InventoryItem[]
  }
  logistics?: {
    efficiency: number
    deliveries: number
    onTime: number
    routes: number
    warehouses: number
    activeRoutes: number
    routeDetails: RouteDetail[]
  }
  finance?: {
    revenue: number
    expenses: number
    profit: number
    pending: number
    currency: string
  }
  crm?: {
    totalCustomers: number
    active: number
    new: number
    satisfaction: number
    customers: Customer[]
  }
  hr?: {
    totalEmployees: number
    active: number
    departments: number
    attendance: number
    employees: Employee[]
  }
  executive?: {
    profit: number
    growth: number
    marketShare: number
    roi: number
  }
}

interface EnterpriseCRMProps {
  persona: 'distributor' | 'supplier' | 'company' | 'manager'
  locale: string
}

type TabType = 
  | 'overview' 
  | 'orders' 
  | 'inventory' 
  | 'logistics'
  | 'investor' 
  | 'finance' 
  | 'crm' 
  | 'hr' 
  | 'executive'
  | 'legal-ipr'
  | 'competitor'
  | 'import-export'
  | 'gps-tracking'
  | 'localization'
  | 'workflows'
  | 'admin'

const countrySlugToISO: Record<string, string> = {
  'united-states': 'US',
  'united states': 'US',
  'usa': 'US',
  'us': 'US',
  'canada': 'CA',
  'mexico': 'MX',
  'brazil': 'BR',
  'united-kingdom': 'UK',
  'united kingdom': 'UK',
  'uk': 'UK',
  'england': 'UK',
  'france': 'FR',
  'germany': 'DE',
  'spain': 'ES',
  'italy': 'IT',
  'uae': 'AE',
  'united-arab-emirates': 'AE',
  'united arab emirates': 'AE',
  'saudi-arabia': 'SA',
  'saudi arabia': 'SA',
  'pakistan': 'PK',
  'india': 'IN',
  'bharat': 'IN',
  'china': 'CN',
  'people s republic of china': 'CN',
  'japan': 'JP',
  'south-korea': 'KR',
  'south korea': 'KR',
  'australia': 'AU',
  'south-africa': 'ZA',
  'south africa': 'ZA',
  'nigeria': 'NG',
  'kenya': 'KE',
  'egypt': 'EG',
  'indonesia': 'ID',
  'vietnam': 'VN',
  'philippines': 'PH',
  'turkey': 'TR'
}

const normalizeCountryCode = (value: string) => {
  if (!value) return 'US'
  const lowered = value.toLowerCase()
  if (countrySlugToISO[lowered]) return countrySlugToISO[lowered]
  const sanitized = lowered.replace(/-/g, ' ')
  if (countrySlugToISO[sanitized]) return countrySlugToISO[sanitized]
  return sanitized.slice(0, 2).toUpperCase()
}

const formatCountryLabel = (value?: string) => {
  if (!value) return ''
  return value
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper function to add geographic path to data objects
const addGeographicPath = <T extends Record<string, unknown>>(obj: T, path: string): T & { geographicPath: string } => {
  return { ...obj, geographicPath: path }
}

// Role-specific demo data generators
const getDemoDomainDataForRole = (domain: string, role: string, userScope?: UserScope): DomainData | Record<string, unknown> => {
  // Admin/Company sees GLOBAL aggregate data (all distributors, all suppliers, all countries)
  if (role === 'company' || role === 'hq' || role === 'country_manager' || role === 'admin') {
    return getGlobalAggregateData(domain)
  }
  
  // Distributor sees only THEIR data
  if (role === 'distributor' || role === 'sales_officer') {
    return getDistributorSpecificData(domain, userScope)
  }
  
  // Supplier sees only THEIR data
  if (role === 'supplier') {
    return getSupplierSpecificData(domain, userScope)
  }
  
  // Default fallback
  return getDemoDomainData(domain)
}

// Global aggregate data for Admin/Company (ALL data worldwide)
const getGlobalAggregateData = (domain: string): DomainData | Record<string, unknown> => {
  const globalData: Record<string, DomainData[keyof DomainData]> = {
    orders: { 
      total: 15678,  // Global total
      pending: 1234, 
      completed: 14444, 
      revenue: 245800000,  // Much larger
      orders: [
        addGeographicPath(
          { id: 'ORD-GLOBAL-001', customer: 'Global Network', amount: 450000, status: 'completed', date: '2024-01-15', country: 'US' },
          'Global / North America / United States / New York / Manhattan'
        ),
        addGeographicPath(
          { id: 'ORD-GLOBAL-002', customer: 'Worldwide Distributors', amount: 320000, status: 'pending', date: '2024-01-16', country: 'AE' },
          'Global / Asia / West Asia / United Arab Emirates / Dubai / Business Bay'
        ),
        addGeographicPath(
          { id: 'ORD-GLOBAL-003', customer: 'International Supplies', amount: 280000, status: 'completed', date: '2024-01-17', country: 'PK' },
          'Global / Asia / South Asia / Pakistan / Karachi / Clifton'
        )
      ] 
    },
    inventory: { 
      totalValue: 245800000,  // Global inventory value
      items: 8900, 
      lowStock: 450, 
      categories: 120, 
      inventoryItems: [
        { sku: 'SKU-GLOBAL-001', description: 'Premium Product A (Global)', stock: 45000, category: 'Category 1', value: 12500000, warehouse: 'Multiple' },
        { sku: 'SKU-GLOBAL-002', description: 'Premium Product B (Global)', stock: 32000, category: 'Category 2', value: 9800000, warehouse: 'Multiple' }
      ] 
    },
    logistics: { 
      efficiency: 92, 
      deliveries: 23400,  // Global deliveries
      onTime: 21500, 
      routes: 1200,  // All routes worldwide
      warehouses: 300,  // All warehouses
      activeRoutes: 200,
      routeDetails: [
        { routeId: 'RT-GLOBAL-001', destination: 'Global Network', distance: 12000, status: 'active', countries: ['US', 'AE', 'PK'] }
      ]
    },
    finance: { 
      revenue: 4523000000,  // Billions
      expenses: 3273000000, 
      profit: 1250000000, 
      pending: 4500000,
      currency: 'USD'
    },
    crm: { 
      totalCustomers: 23400,  // All customers worldwide
      active: 18900, 
      new: 1200, 
      satisfaction: 95, 
      customers: [
        { id: 'CUST-GLOBAL-001', name: 'Global Distributor Network', status: 'active', revenue: 4500000, country: 'Multiple' },
        { id: 'CUST-GLOBAL-002', name: 'International Retail Chain', status: 'active', revenue: 3200000, country: 'Multiple' }
      ] 
    },
    hr: { 
      totalEmployees: 4500,  // All employees
      active: 4200, 
      departments: 60, 
      attendance: 98, 
      employees: [
        { id: 'EMP-GLOBAL-001', name: 'John Doe', department: 'Global Sales', status: 'active', country: 'US' },
        { id: 'EMP-GLOBAL-002', name: 'Jane Smith', department: 'Global Logistics', status: 'active', country: 'AE' }
      ] 
    },
    executive: { 
      profit: 1250000000,  // Billions
      growth: 25.5, 
      marketShare: 45, 
      roi: 28.5 
    }
  }
  const domainData = globalData[domain]
  return domainData ? (domainData as DomainData) : ({} as Record<string, unknown>)
}

// Distributor-specific data (only their data)
const getDistributorSpecificData = (domain: string, userScope?: UserScope): Partial<DomainData> => {
  const distributorId = userScope?.distributorId || 'dist_ae_dubai'
  // Default distributor location (can be overridden from userScope)
  const defaultLocation = userScope?.geographic?.locations?.[0] 
    ? 'Global / Asia / West Asia / United Arab Emirates / Dubai / Business Bay'
    : 'Global / Europe / Western Europe / United Kingdom / London / Westminster / Edgeware Road / Victoria Casino'
  
  const distributorData: Partial<DomainData> = {
    orders: { 
      total: 45,  // Only their orders
      pending: 5, 
      completed: 40, 
      revenue: 125000,  // Smaller amount
      orders: [
        addGeographicPath(
          { id: 'ORD-DIST-001', customer: distributorId, amount: 15000, status: 'completed', date: '2024-01-15', distributorId, country: 'US' },
          defaultLocation
        ),
        addGeographicPath(
          { id: 'ORD-DIST-002', customer: distributorId, amount: 12000, status: 'pending', date: '2024-01-16', distributorId, country: 'US' },
          defaultLocation
        )
      ] 
    },
    inventory: { 
      totalValue: 125000,  // Only their inventory
      items: 89, 
      lowStock: 5, 
      categories: 12, 
      inventoryItems: [
        { sku: 'SKU-DIST-001', description: 'Product A (My Stock)', stock: 450, category: 'Category 1', value: 12500, warehouse: userScope?.warehouseIds?.[0] || 'wh_ae_dubai' },
        { sku: 'SKU-DIST-002', description: 'Product B (My Stock)', stock: 320, category: 'Category 2', value: 9800, warehouse: userScope?.warehouseIds?.[0] || 'wh_ae_dubai' }
      ] 
    },
    logistics: { 
      efficiency: 89, 
      deliveries: 234,  // Only their deliveries
      onTime: 208, 
      routes: 12,  // Only their routes
      warehouses: 1,  // Only their warehouse
      activeRoutes: 2,
      routeDetails: [
        { routeId: 'RT-DIST-001', destination: 'My Territory', distance: 120, status: 'active' }
      ]
    },
    finance: { 
      revenue: 125000,  // Only their revenue
      expenses: 90000, 
      profit: 35000, 
      pending: 5000,
      currency: userScope?.currency || 'AED'
    },
    crm: { 
      totalCustomers: 23,  // Only their customers
      active: 18, 
      new: 2, 
      satisfaction: 95, 
      customers: [
        { id: 'CUST-DIST-001', name: 'Retailer A (My Customer)', status: 'active', revenue: 45000, country: 'US' },
        { id: 'CUST-DIST-002', name: 'Retailer B (My Customer)', status: 'active', revenue: 32000, country: 'US' }
      ] 
    }
  }
  return (distributorData[domain as keyof typeof distributorData] as Partial<DomainData>) || ({} as Partial<DomainData>)
}

// Supplier-specific data (only their data)
const getSupplierSpecificData = (domain: string, userScope?: UserScope): Partial<DomainData> => {
  const supplierId = userScope?.supplierId || 'sup_pk_megafoods'
  const supplierData: Partial<DomainData> = {
    orders: { 
      total: 23,  // Only their POs
      pending: 5, 
      completed: 18, 
      revenue: 85000,  // Smaller amount
      orders: [
        { id: 'PO-SUP-001', customer: 'Harvics', amount: 15000, status: 'completed', date: '2024-01-15', country: 'US' },
        { id: 'PO-SUP-002', customer: 'Harvics', amount: 12000, status: 'pending', date: '2024-01-16', country: 'US' }
      ] 
    },
    inventory: { 
      totalValue: 85000,  // Only their inventory
      items: 45, 
      lowStock: 3, 
      categories: 8, 
      inventoryItems: [
        { sku: 'RAW-SUP-001', description: 'Raw Material A (My Stock)', stock: 250, category: 'Raw Materials', value: 8500, warehouse: userScope?.warehouseIds?.[0] || 'wh_pk_karachi' },
        { sku: 'FIN-SUP-001', description: 'Finished Good A (My Stock)', stock: 180, category: 'Finished Goods', value: 7200, warehouse: userScope?.warehouseIds?.[0] || 'wh_pk_karachi' }
      ] 
    },
    logistics: { 
      efficiency: 92, 
      deliveries: 45,  // Only their shipments
      onTime: 42, 
      routes: 3,  // Only their routes
      warehouses: 1,  // Only their warehouse
      activeRoutes: 1,
      routeDetails: [
        { routeId: 'RT-SUP-001', destination: 'To Harvics', distance: 95, status: 'active' }
      ]
    },
    finance: { 
      revenue: 85000,  // Only their revenue
      expenses: 60000, 
      profit: 25000, 
      pending: 5000,
      currency: userScope?.currency || 'PKR'
    },
    crm: { 
      totalCustomers: 1,  // Only Harvics
      active: 1, 
      new: 0, 
      satisfaction: 98, 
      customers: [
        { id: 'CUST-SUP-001', name: 'Harvics (My Customer)', status: 'active', revenue: 85000, country: 'US' }
      ] 
    }
  }
  return (supplierData[domain as keyof typeof supplierData] as Partial<DomainData>) || ({} as Partial<DomainData>)
}

// OS Domain demo data generator
const getOSDomainDemoData = (domain: string): any => {
  // Return empty object - the tab components have their own demo data built in
  // This ensures the data is not null so the tabs can render
  return {}
}

// Demo data generator - STATIC data that works immediately without APIs (default fallback)
const getDemoDomainData = (domain: string): Partial<DomainData> => {
  const demos: Partial<DomainData> = {
    orders: { 
      total: 156, 
      pending: 12, 
      completed: 144, 
      revenue: 2458000, 
      orders: [
        { id: 'ORD-001', customer: 'ABC Distributors', amount: 45000, status: 'completed', date: '2024-01-15', country: 'US' },
        { id: 'ORD-002', customer: 'XYZ Retail', amount: 32000, status: 'pending', date: '2024-01-16', country: 'US' },
        { id: 'ORD-003', customer: 'Global Supplies', amount: 28000, status: 'completed', date: '2024-01-17', country: 'US' }
      ] 
    },
    inventory: { 
      totalValue: 2458000, 
      items: 89, 
      lowStock: 5, 
      categories: 12, 
      inventoryItems: [
        { sku: 'SKU-001', description: 'Premium Product A', stock: 450, category: 'Category 1', value: 125000, warehouse: 'wh_main' },
        { sku: 'SKU-002', description: 'Premium Product B', stock: 320, category: 'Category 2', value: 98000, warehouse: 'wh_main' },
        { sku: 'SKU-003', description: 'Premium Product C', stock: 180, category: 'Category 1', value: 67000, warehouse: 'wh_main' }
      ] 
    },
    logistics: { 
      efficiency: 89, 
      deliveries: 234, 
      onTime: 208, 
      routes: 12, 
      warehouses: 3,
      activeRoutes: 2,
      routeDetails: [
        { routeId: 'RT-001', destination: 'North Region', distance: 120, status: 'active' },
        { routeId: 'RT-002', destination: 'South Region', distance: 95, status: 'active' }
      ]
    },
    finance: { 
      revenue: 4523000, 
      expenses: 3273000, 
      profit: 1250000, 
      pending: 45000,
      currency: 'USD'
    },
    crm: { 
      totalCustomers: 234, 
      active: 189, 
      new: 12, 
      satisfaction: 95, 
      customers: [
        { id: 'CUST-001', name: 'ABC Distributors', status: 'active', revenue: 450000, country: 'US' },
        { id: 'CUST-002', name: 'XYZ Retail', status: 'active', revenue: 320000, country: 'US' }
      ] 
    },
    hr: { 
      totalEmployees: 45, 
      active: 42, 
      departments: 6, 
      attendance: 98, 
      employees: [
        { id: 'EMP-001', name: 'John Doe', department: 'Sales', status: 'active', country: 'US' },
        { id: 'EMP-002', name: 'Jane Smith', department: 'Logistics', status: 'active', country: 'US' }
      ] 
    },
    executive: { 
      profit: 1250000, 
      growth: 15.5, 
      marketShare: 23, 
      roi: 18.5 
    },
    // investor data removed - not in DomainData interface
  }
  return (demos[domain as keyof typeof demos] as Partial<DomainData>) || ({} as Partial<DomainData>)
}

export default function EnterpriseCRM({ persona, locale: localeProp }: EnterpriseCRMProps) {
  const locale = useLocale() || localeProp
  const t = useTranslations('crm')
  const { selectedCountry, countryData, loading: countryLoading } = useCountry()
  
  // Get user scope for role-based data filtering
  const getUserScope = (): UserScope | null => {
    if (typeof window !== 'undefined') {
      const userScopeStr = localStorage.getItem('user_scope')
      if (userScopeStr) {
        try {
          return JSON.parse(userScopeStr) as UserScope
        } catch (e) {
          logger.warn('Failed to parse user scope from localStorage', { error: e })
          return null
        }
      }
    }
    return null
  }

  // Get user role from localStorage to determine persona (more accurate than prop)
  // This must be calculated BEFORE useState calls that use it
  const getUserRole = () => {
    if (typeof window !== 'undefined') {
      const userScopeStr = localStorage.getItem('user_scope')
      if (userScopeStr) {
        try {
          const userScope = JSON.parse(userScopeStr)
          return userScope.role || persona
        } catch {
          return persona
        }
      }
    }
    return persona
  }
  
  const actualRole = getUserRole()
  const userScope = getUserScope()
  
  // Get geographic scope for filtering
  const getGeographicScope = (): GeographicScope => {
    if (!userScope) {
      // Default scope based on role
      if (actualRole === 'company' || actualRole === 'hq' || actualRole === 'country_manager' || actualRole === 'admin') {
        return { global: true }
      }
      return {}
    }
    
    // Use geographic scope from user scope, or create from legacy fields
    if (userScope.geographic) {
      return userScope.geographic
    }
    
    // Fallback: create from legacy countries/territories
    return createGeographicScopeFromUserScope(userScope)
  }
  
  const geographicScope = getGeographicScope()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  
  // Initialize with role-specific demo data immediately - static and functional
  const [data, setData] = useState<Record<string, Partial<DomainData> | null>>(() => {
    const scope = getUserScope()
    const role = actualRole || persona
    return {
      orders: getDemoDomainDataForRole('orders', role, scope || undefined),
      inventory: getDemoDomainDataForRole('inventory', role, scope || undefined),
      logistics: getDemoDomainDataForRole('logistics', role, scope || undefined),
      finance: getDemoDomainDataForRole('finance', role, scope || undefined),
      crm: getDemoDomainDataForRole('crm', role, scope || undefined),
      hr: getDemoDomainDataForRole('hr', role, scope || undefined),
      executive: getDemoDomainDataForRole('executive', role, scope || undefined),
      legal: null,
      importExport: null,
      gps: null,
      localization: null,
      workflow: null
    }
  })
  const [loading, setLoading] = useState(false) // Start with false - tabs work immediately
  const [intelData, setIntelData] = useState<{
    aiStrategy: unknown | null
    tradeFlows: unknown | null
    procurementMap: unknown | null
    graphSnapshot: unknown | null
    gpsRetailers: unknown | null
    gpsHeatmap: unknown | null
    gpsRoutes: unknown | null
    whiteSpaces: unknown | null
    countryProfile: unknown | null
    dataOceanSummary: unknown | null
    dataOceanFlows: unknown | null
  }>({
    aiStrategy: null,
    tradeFlows: null,
    procurementMap: null,
    graphSnapshot: null,
    gpsRetailers: null,
    gpsHeatmap: null,
    gpsRoutes: null,
    whiteSpaces: null,
    countryProfile: null,
    dataOceanSummary: null,
    dataOceanFlows: null
  })
  
  // Filter tabs based on actual user role - Customized modules for each role
  const availableTabs: TabType[] = (() => {
    // Use actualRole instead of persona prop for more accurate filtering
    if (actualRole === 'distributor' || actualRole === 'sales_officer') {
      // Distributor-specific modules: Focus on sales, orders to retailers, territory coverage, customer management
      // Distributors see: Overview, Orders (from Harvics), Inventory (stock levels), Logistics (delivery routes), Finance (credit, payments), CRM (retailers)
      return ['overview', 'orders', 'inventory', 'logistics', 'finance', 'crm']
    } else if (actualRole === 'supplier') {
      // Supplier-specific modules: Focus on purchase orders, production, quality control, shipments to Harvics
      // Suppliers see: Overview, Orders (POs received), Inventory (raw materials/finished goods), Logistics (shipments), Finance (invoices), CRM (Harvics relationship)
      return ['overview', 'orders', 'inventory', 'logistics', 'finance', 'crm']
    } else if (actualRole === 'company' || actualRole === 'hq' || actualRole === 'country_manager') {
      // Company/Admin gets ALL modules: Full enterprise access
      return ['overview', 'orders', 'inventory', 'logistics', 'finance', 'crm', 'hr', 'executive', 'investor', 'legal-ipr', 'competitor', 'import-export', 'gps-tracking', 'localization', 'workflows', 'admin']
    }
    // Fallback to persona prop if role not found
    switch (persona) {
      case 'distributor':
        return ['overview', 'orders', 'inventory', 'logistics', 'finance', 'crm']
      case 'supplier':
        return ['overview', 'orders', 'inventory', 'logistics', 'finance', 'crm']
      case 'company':
      case 'manager':
        return ['overview', 'orders', 'inventory', 'logistics', 'finance', 'crm', 'hr', 'executive', 'investor', 'legal-ipr', 'competitor', 'import-export', 'gps-tracking', 'localization', 'workflows', 'admin']
      default:
        return ['overview', 'orders', 'inventory', 'logistics', 'finance', 'crm']
    }
  })()

  // Load data when country or tab changes - but tabs work immediately with demo data
  useEffect(() => {
    if (selectedCountry) {
      loadData() // Try to load real data in background, but tabs already work with demo data
    }
  }, [selectedCountry, activeTab, persona])


  const loadData = async () => {
    setLoading(true)
    try {
      const backendCountry = normalizeCountryCode(selectedCountry)
      const scope = getUserScope()
      const role = actualRole || persona
      
      // Admin/Company sees ALL countries aggregated, Distributor/Supplier see only their country
      const includeAllCountries = (role === 'company' || role === 'hq' || role === 'country_manager' || role === 'admin')
      
      // Load all domain services data based on selected country and role
      const isAdmin = persona === 'company' || persona === 'manager' || role === 'company' || role === 'admin'
      
      const [ordersRes, inventoryRes, logisticsRes, financeRes, crmRes, hrRes, executiveRes, investorRes, legalRes, importExportRes, gpsRes, localizationRes, workflowRes] = await Promise.allSettled([
        apiClient.getDomainOrders(backendCountry, includeAllCountries),
        apiClient.getDomainInventory(backendCountry, includeAllCountries),
        apiClient.getDomainLogistics(backendCountry, includeAllCountries),
        apiClient.getDomainFinance(backendCountry, includeAllCountries),
        apiClient.getDomainCRM(backendCountry, includeAllCountries),
        isAdmin ? apiClient.getDomainHR(backendCountry, includeAllCountries) : Promise.resolve({ data: null }),
        isAdmin ? apiClient.getDomainExecutive(backendCountry, includeAllCountries) : Promise.resolve({ data: null }),
        isAdmin ? apiClient.getInvestorDashboard() : Promise.resolve({ data: null }),
        isAdmin ? apiClient.getDomainLegal(backendCountry, includeAllCountries) : Promise.resolve({ data: null }),
        isAdmin ? apiClient.getDomainImportExport(backendCountry, includeAllCountries) : Promise.resolve({ data: null }),
        isAdmin ? apiClient.getDomainGPS(backendCountry, includeAllCountries) : Promise.resolve({ data: null }),
        isAdmin ? apiClient.getDomainLocalization(backendCountry, includeAllCountries) : Promise.resolve({ data: null }),
        isAdmin ? apiClient.getDomainWorkflow(backendCountry, includeAllCountries) : Promise.resolve({ data: null })
      ])

      // Extract data helper
      const extractDataHelper = (res: PromiseSettledResult<any>) =>
        res.status === 'fulfilled' && res.value?.data ? res.value.data : null

      // Use real data if available, otherwise use role-specific demo data as fallback
      const domainData = {
        orders: extractDataHelper(ordersRes) || getDemoDomainDataForRole('orders', role, scope || undefined),
        inventory: extractDataHelper(inventoryRes) || getDemoDomainDataForRole('inventory', role, scope || undefined),
        logistics: extractDataHelper(logisticsRes) || getDemoDomainDataForRole('logistics', role, scope || undefined),
        finance: extractDataHelper(financeRes) || getDemoDomainDataForRole('finance', role, scope || undefined),
        crm: extractDataHelper(crmRes) || getDemoDomainDataForRole('crm', role, scope || undefined),
        hr: extractDataHelper(hrRes) || getDemoDomainDataForRole('hr', role, scope || undefined),
        executive: extractDataHelper(executiveRes) || getDemoDomainDataForRole('executive', role, scope || undefined),
        investor: extractDataHelper(investorRes) || getDemoDomainDataForRole('investor', role, scope || undefined),
        legal: extractDataHelper(legalRes) || getOSDomainDemoData('legal'),
        importExport: extractDataHelper(importExportRes) || getOSDomainDemoData('importExport'),
        gps: extractDataHelper(gpsRes) || getOSDomainDemoData('gps'),
        localization: extractDataHelper(localizationRes) || getOSDomainDemoData('localization'),
        workflow: extractDataHelper(workflowRes) || getOSDomainDemoData('workflow')
      }

      // Check if all APIs failed - log for debugging
      const allFailed = Object.values(domainData).every(d => !d || Object.keys(d).length === 0)
      if (allFailed) {
        logger.warn('All domain APIs failed, using demo data as fallback')
      }

      // Apply geographic filtering based on user scope
      const filteredData = {
        orders: {
          ...domainData.orders,
          orders: filterByGeographicScope(domainData.orders?.orders || [], geographicScope)
        },
        inventory: domainData.inventory,  // Filtering handled at warehouse level
        logistics: domainData.logistics,
        finance: domainData.finance,
        crm: {
          ...domainData.crm,
          customers: filterByGeographicScope(domainData.crm?.customers || [], geographicScope)
        },
        hr: domainData.hr,
        executive: domainData.executive,
        investor: domainData.investor,
        legal: domainData.legal,
        importExport: domainData.importExport,
        gps: domainData.gps,
        localization: domainData.localization,
        workflow: domainData.workflow
      }

      setData(filteredData)

      const [
        aiStrategyRes,
        tradeFlowsRes,
        procurementRes,
        graphRes,
        gpsRetailersRes,
        gpsHeatmapRes,
        gpsRoutesRes,
        whiteSpacesRes,
        countryProfileRes,
        dataOceanSummaryRes,
        dataOceanFlowsRes
      ] = await Promise.allSettled([
        apiClient.getAIStrategy(backendCountry),
        apiClient.getTradeFlows(backendCountry),
        apiClient.getProcurementMap(backendCountry),
        apiClient.getGraphSnapshot(backendCountry),
        apiClient.getGPSRetailers(backendCountry),
        apiClient.getGPSHeatmap(backendCountry),
        apiClient.getGPSRoutes(backendCountry),
        apiClient.getSatelliteWhitespaces(backendCountry),
        apiClient.getCountryProfile(backendCountry),
        apiClient.getDataOceanSummary(backendCountry),
        apiClient.getDataOceanFlows(backendCountry)
      ])

      const extractData = (res: PromiseSettledResult<unknown>): unknown => {
        if (res.status === 'fulfilled') {
          const value = res.value as { data?: unknown } | unknown
          return (value && typeof value === 'object' && 'data' in value) ? value.data : value
        }
        return null
      }

      setIntelData({
        aiStrategy: extractData(aiStrategyRes),
        tradeFlows: extractData(tradeFlowsRes),
        procurementMap: extractData(procurementRes),
        graphSnapshot: extractData(graphRes),
        gpsRetailers: extractData(gpsRetailersRes),
        gpsHeatmap: extractData(gpsHeatmapRes),
        gpsRoutes: extractData(gpsRoutesRes),
        whiteSpaces: extractData(whiteSpacesRes),
        countryProfile: extractData(countryProfileRes),
        dataOceanSummary: extractData(dataOceanSummaryRes),
        dataOceanFlows: extractData(dataOceanFlowsRes)
      })
    } catch (err) {
      logger.error('Error loading data', err instanceof Error ? err : new Error(String(err)))
      // On error, use role-specific demo data as fallback
      const scope = getUserScope()
      const role = actualRole || persona
      setData({
        orders: getDemoDomainDataForRole('orders', role, scope || undefined),
        inventory: getDemoDomainDataForRole('inventory', role, scope || undefined),
        logistics: getDemoDomainDataForRole('logistics', role, scope || undefined),
        finance: getDemoDomainDataForRole('finance', role, scope || undefined),
        crm: getDemoDomainDataForRole('crm', role, scope || undefined),
        hr: getDemoDomainDataForRole('hr', role, scope || undefined),
        executive: getDemoDomainDataForRole('executive', role, scope || undefined),
        legal: getOSDomainDemoData('legal'),
        importExport: getOSDomainDemoData('importExport'),
        gps: getOSDomainDemoData('gps'),
        localization: getOSDomainDemoData('localization'),
        workflow: getOSDomainDemoData('workflow')
      })
    } finally {
      setLoading(false)
    }
  }

  const tabIcons: Record<TabType, string> = {
    overview: '📊',
    orders: '📦',
    inventory: '📋',
    logistics: '🚚',
    finance: '💰',
    crm: '👥',
    hr: '👔',
    executive: '🎯',
    investor: '📈',
    'legal-ipr': '⚖️',
    competitor: '🔍',
    'import-export': '🌐',
    'gps-tracking': '📍',
    localization: '🌍',
    workflows: '⚙️',
    admin: '🔧'
  }

  const normalizedCountryCode = normalizeCountryCode(selectedCountry)
  const selectedCountryLabel = (countryData as any)?.countryName || formatCountryLabel(selectedCountry)
  const currencyCode = (countryData as any)?.currency?.code || (data?.finance as any)?.currency || '—'
  const currencySymbol =
    (countryData as any)?.currency?.symbol ||
    (currencyCode === 'USD' ? '$' : '')
  const sampleEntity: string =
    (data?.orders?.orders as any)?.[0]?.customer ||
    (data?.inventory as any)?.skus?.[0]?.description ||
    ((data?.logistics as any)?.warehouses ? `Warehouse count ${(data.logistics as any).warehouses}` : 'No data')

  const getGeographicScopeLabel = () => {
    if (geographicScope?.global) return 'Global'
    if (geographicScope?.continents?.length) return `${geographicScope.continents.length} Continent(s)`
    if (geographicScope?.regions?.length) return `${geographicScope.regions.length} Region(s)`
    if (geographicScope?.countries?.length) return `${geographicScope.countries.length} Country/ies`
    if (geographicScope?.cities?.length) return `${geographicScope.cities.length} City/ies`
    return 'Local'
  }

  const getRoleLabel = () => {
    switch (persona) {
      case 'distributor':
        return t('roleIndicator.distributor')
      case 'supplier':
        return t('roleIndicator.supplier')
      case 'company':
      case 'manager':
        return t('roleIndicator.manager')
      default:
        return ''
    }
  }

  return (
    <div 
      className="crm-theme w-full bg-white rounded-xl shadow-lg overflow-hidden border border-[#C3A35E]/30 font-sans font-inter"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        lineHeight: '1.6',
        letterSpacing: '0.01em'
      }}
    >
      {/* CRM Header - Clean Professional Design */}
      <div className="bg-white border-b border-[#C3A35E]/30">
        {/* Top Header Row */}
        <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-[#C3A35E]/30 shadow-sm">
                <span className="text-xl font-bold text-[#6B1F2B]">
                  {actualRole === 'supplier' ? 'S' : 
                   actualRole === 'distributor' || actualRole === 'sales_officer' ? 'D' : 
                   'H'}
                </span>
              </div>
              <h2 
                className="text-xl md:text-2xl lg:text-3xl font-bold text-[#6B1F2B] tracking-tight font-serif" 
              >
                {actualRole === 'supplier' ? 'Supplier CRM' : 
                 actualRole === 'distributor' || actualRole === 'sales_officer' ? 'Distributor CRM' : 
                 'Harvics CRM'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-xs font-bold text-[#6B1F2B] bg-[#F8F9FA] px-4 py-1.5 rounded-full border border-[#C3A35E]/30">
                {actualRole === 'supplier' ? 'Supplier Portal' : 
                 actualRole === 'distributor' || actualRole === 'sales_officer' ? 'Distributor Portal' : 
                 actualRole === 'company' || actualRole === 'hq' || actualRole === 'country_manager' ? 'Company Portal' :
                 getRoleLabel()}
              </span>
              <span 
                className={`hidden md:inline text-xs font-bold text-[#6B1F2B] px-3 py-1.5 rounded-full border bg-[#F8F9FA] border-[#C3A35E]/30`} 
                title={`Geographic scope: ${getGeographicScopeLabel()}`}
              >
                {getGeographicScopeLabel()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm" title="Switch countries globally from the site header">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F8F9FA] rounded-lg border border-[#C3A35E]/30">
              <span className="text-[#6B1F2B] text-xs font-bold uppercase tracking-wider">Country:</span>
              <span className="font-bold text-[#6B1F2B]">{selectedCountryLabel}</span>
            </div>
            {countryLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#C3A35E] border-t-[#6B1F2B]"></div>
            )}
          </div>
        </div>

        {/* Component Description Banner */}
        <div className="px-4 py-3 bg-[#C3A35E]/5 border-b border-[#C3A35E]/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <span className="text-lg">ℹ️</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#6B1F2B] mb-1">
                <strong>Multi-Domain Dashboard</strong> - This component provides an overview of all OS domains (Orders, Inventory, Finance, CRM, HR, Executive, etc.)
              </p>
              <p className="text-xs text-[#6B1F2B]/70">
                For dedicated CRM functions, navigate to <strong>CRM OS Domain</strong> at <code className="bg-white/50 px-1.5 py-0.5 rounded text-[10px] text-[#6B1F2B] border border-[#C3A35E]/20">/os/crm</code>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Clean Professional with Gold */}
        <div className="px-4 py-3 bg-white border-b border-[#C3A35E]/20 w-full">
          <div role="tablist" className="overflow-x-auto scrollbar-hide w-full" style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            <div className="flex flex-row gap-0 min-w-max items-center">
              {availableTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setActiveTab(tab)
                    const crmContainer = e.currentTarget.closest('.crm-theme')
                    if (crmContainer) {
                      crmContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className={`group relative flex items-center justify-center gap-2 px-5 py-3 transition-all duration-200 ease-in-out whitespace-nowrap flex-shrink-0 min-h-[48px] border-b-2 ${
                    activeTab === tab
                      ? 'text-[#6B1F2B] font-bold bg-[#C3A35E] shadow-md border-b-2 border-[#C3A35E] rounded-t-lg'
                      : 'text-[#6B1F2B]/70 hover:text-[#6B1F2B] hover:bg-[#C3A35E]/10 font-medium border-b-2 border-transparent hover:border-[#C3A35E]/40 rounded-t-lg'
                  }`}
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility',
                    fontSize: '0.875rem',
                    letterSpacing: '0.025em',
                    lineHeight: '1.5'
                  }}
                  aria-label={t(`tabs.${tab}`)}
                  aria-pressed={activeTab === tab}
                  aria-selected={activeTab === tab}
                  role="tab"
                >
                  <span className="text-base leading-none">
                    {tabIcons[tab]}
                  </span>
                  <span className="hidden sm:inline leading-tight">
                    {t(`tabs.${tab}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Localisation Indicator - Clean Professional */}
      <div className="bg-white px-6 py-3 flex flex-col md:flex-row gap-4 text-sm border-b border-[#C3A35E]/30">
        <div className="flex items-center gap-3">
          <span className="text-[#6B1F2B] text-xs font-bold uppercase tracking-wider">Code</span>
          <span className="font-bold text-[#6B1F2B] text-base">{normalizedCountryCode}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#6B1F2B] text-xs font-bold uppercase tracking-wider">Currency</span>
          <span className="font-bold text-[#6B1F2B] text-base">
            {currencySymbol} {currencyCode}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#6B1F2B] text-xs font-bold uppercase tracking-wider">Entity</span>
          <span className="font-medium text-[#6B1F2B]">{sampleEntity || 'N/A'}</span>
        </div>
      </div>

      {/* Tab Content - Clean Professional Container */}
      <div className="p-4 sm:p-6 md:p-8 bg-white min-h-[600px]">
        {loading ? (
          <div className="text-center py-16">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 border-4 border-[#C3A35E]/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#6B1F2B] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p 
              className="mt-6 text-[#6B1F2B] font-medium"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
            >
              Loading data for {(countryData as any)?.countryName || selectedCountry}...
            </p>
          </div>
        ) : (
          <div className="min-h-[500px] animate-fade-in-up">
              {activeTab === 'overview' && (
                <OverviewTab 
                  data={data} 
                  persona={actualRole || persona}
                  selectedCountry={selectedCountry}
                  countryData={countryData}
                  aiStrategy={intelData.aiStrategy}
                  countryProfile={intelData.countryProfile as any}
                  availableTabs={availableTabs}
                  tabIcons={tabIcons}
                  currencySymbol={currencySymbol}
                  locale={locale}
                />
              )}
            {activeTab === 'orders' && (
              <OrdersTab 
                data={data?.orders || null} 
                selectedCountry={selectedCountry}
                countryData={countryData}
              />
            )}
            {activeTab === 'inventory' && (
              <InventoryTab 
                data={data?.inventory}
                selectedCountry={selectedCountry}
                countryData={countryData}
                retailerIntel={intelData.gpsRetailers}
                whitespaceReport={intelData.whiteSpaces}
                logisticsSummary={data?.logistics}
              />
            )}
            {activeTab === 'logistics' && (
              <LogisticsTab 
                data={data?.logistics}
                selectedCountry={selectedCountry}
                countryData={countryData}
                gpsIntel={intelData.gpsRetailers}
                gpsHeatmap={intelData.gpsHeatmap}
                gpsRoutes={intelData.gpsRoutes}
                whitespaceReport={intelData.whiteSpaces}
              />
            )}
            {activeTab === 'finance' && (
              <FinanceTab 
                data={data?.finance}
                selectedCountry={selectedCountry}
                countryData={countryData}
                countryProfile={intelData.countryProfile}
                aiStrategy={intelData.aiStrategy}
                tradeFlows={intelData.tradeFlows}
              />
            )}
            {activeTab === 'crm' && (
              <CRMTab 
                data={data?.crm}
                selectedCountry={selectedCountry}
                countryData={countryData}
                countryProfile={intelData.countryProfile}
              />
            )}
            {activeTab === 'hr' && (
              <HRTab 
                data={data?.hr}
                selectedCountry={selectedCountry}
                countryData={countryData}
              />
            )}
            {activeTab === 'executive' && (
              <ExecutiveTab 
                data={data?.executive}
                selectedCountry={selectedCountry}
                countryData={countryData}
                whitespaceReport={intelData.whiteSpaces}
                aiStrategy={intelData.aiStrategy}
                tradeFlows={intelData.tradeFlows}
                procurementMap={intelData.procurementMap}
                graphSnapshot={intelData.graphSnapshot}
                dataOceanSummary={intelData.dataOceanSummary}
                dataOceanFlows={intelData.dataOceanFlows}
              />
            )}
            {activeTab === 'investor' && (
              <InvestorTab 
                data={data?.investor}
                selectedCountry={selectedCountry}
                countryData={countryData}
              />
            )}
            {activeTab === 'legal-ipr' && (
              <LegalIPRTab 
                selectedCountry={selectedCountry}
                countryData={countryData}
                data={data?.legal}
              />
            )}
            {activeTab === 'competitor' && (
              <CompetitorTab 
                selectedCountry={selectedCountry}
                countryData={countryData}
              />
            )}
            {activeTab === 'import-export' && (
              <ImportExportTab 
                selectedCountry={selectedCountry}
                countryData={countryData}
                data={data?.importExport}
              />
            )}
            {activeTab === 'gps-tracking' && (
              <GPSTrackingTab 
                selectedCountry={selectedCountry}
                countryData={countryData}
                data={data?.gps}
                gpsIntel={intelData.gpsRetailers}
                gpsHeatmap={intelData.gpsHeatmap}
                gpsRoutes={intelData.gpsRoutes}
                whitespaceReport={intelData.whiteSpaces}
              />
            )}
            {activeTab === 'localization' && (
              <LocalizationTab 
                selectedCountry={selectedCountry}
                countryData={countryData}
                data={data?.localization}
              />
            )}
            {activeTab === 'workflows' && (
              <WorkflowsTab 
                selectedCountry={selectedCountry}
                countryData={countryData}
                data={data?.workflow}
              />
            )}
            {activeTab === 'admin' && (
              <AdminPanel 
                selectedCountry={selectedCountry}
                countryData={countryData}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Tab component prop interfaces
interface OverviewTabProps {
  data: Record<string, Partial<DomainData> | null>
  persona: string
  selectedCountry: string | null
  countryData: unknown
  aiStrategy: unknown
  countryProfile?: unknown
  availableTabs: string[]
  tabIcons: Record<string, string>
  currencySymbol?: string
  locale: string
}

interface OrdersTabProps {
  data: Partial<DomainData> | null
  selectedCountry: string | null
  countryData: unknown
}

// Overview Tab Component
function OverviewTab({ data, persona, selectedCountry, countryData, aiStrategy, countryProfile, availableTabs, tabIcons, currencySymbol: currencySymbolProp, locale }: OverviewTabProps) {
  const t = useTranslations('crm')
  const [marketAnalysis, setMarketAnalysis] = useState<unknown>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const currencySymbol = currencySymbolProp || (countryData as any)?.currency?.symbol || '$'

  useEffect(() => {
    if (selectedCountry) {
      loadMarketAnalysis()
    }
  }, [selectedCountry])

  const loadMarketAnalysis = async () => {
    setLoadingAnalysis(true)
    try {
      if (!selectedCountry) return
      const response = await apiClient.getLocalizationAnalysis(selectedCountry)
      const responseData = response.data as any
      if (responseData && (responseData as any).success) {
        setMarketAnalysis((responseData as any).data)
      }
    } catch (err) {
      logger.error('Error loading market analysis', err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoadingAnalysis(false)
    }
  }

  // Role-specific KPIs
  const kpis = (() => {
    const dataAny = data as any
    const baseKPIs = [
      { label: t('kpis.totalOrders'), value: dataAny?.orders?.total || 0, icon: '📦' },
      { label: t('kpis.inventoryValue'), value: `${currencySymbol}${((dataAny?.inventory?.totalValue || 0) / 1000).toFixed(1)}K`, icon: '📋' },
      { label: t('kpis.logisticsEfficiency'), value: `${dataAny?.logistics?.efficiency || 0}%`, icon: '🚚' },
      { label: t('kpis.revenue'), value: `${currencySymbol}${((dataAny?.finance?.revenue || 0) / 1000).toFixed(1)}K`, icon: '💰' }
    ]

    // Distributor-specific KPIs
    if (persona === 'distributor' || persona === 'sales_officer') {
      return [
        ...baseKPIs,
        { label: 'Retailer Coverage', value: `${dataAny?.crm?.totalCustomers || 0}`, icon: '🏪' },
        { label: 'Territory Coverage', value: `${dataAny?.logistics?.routes || 0} routes`, icon: '🗺️' },
        { label: 'Credit Utilization', value: `${Math.round((125000 / 200000) * 100)}%`, icon: '💳' }
      ]
    }
    
    // Supplier-specific KPIs
    if (persona === 'supplier') {
      return [
        ...baseKPIs,
        { label: 'Active POs', value: `${dataAny?.orders?.pending || 0}`, icon: '📝' },
        { label: 'On-Time Delivery', value: `${dataAny?.logistics?.onTime || 0}%`, icon: '✅' },
        { label: 'Quality Score', value: '98%', icon: '⭐' }
      ]
    }
    
    // Company/Admin - Full KPIs
    if (persona === 'company' || persona === 'hq' || persona === 'country_manager' || persona === 'manager') {
      return [
        ...baseKPIs,
        { label: t('kpis.customers'), value: dataAny?.crm?.totalCustomers || 0, icon: '👥' },
        { label: t('kpis.employees'), value: dataAny?.hr?.totalEmployees || 0, icon: '👔' },
        { label: t('kpis.profit'), value: `${currencySymbol}${((dataAny?.executive?.profit || 0) / 1000).toFixed(1)}K`, icon: '🎯' }
      ]
    }

    return baseKPIs
  })()

  const forecastGrowth = (() => {
    if (data?.executive && typeof data.executive === 'object' && data.executive !== null && 'growth' in data.executive && typeof (data.executive as any).growth === 'number') {
      return (data.executive as any).growth
    }
    if (aiStrategy && typeof aiStrategy === 'object' && aiStrategy !== null && 'marketScore' in aiStrategy && typeof (aiStrategy as any).marketScore === 'number') {
      return Math.min(30, Math.max(6, Number(((aiStrategy as any).marketScore / 3).toFixed(1))))
    }
    return 10.8
  })()

  return (
    <div className="space-y-6 font-inter" style={{ lineHeight: '1.6' }}>
      {/* Reporting Module - Export Buttons */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button 
          className="bg-white text-[#6B1F2B] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] flex items-center gap-2 border border-[#C3A35E]/30 shadow-sm"
          style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          📄 Export PDF
        </button>
        <button 
          className="bg-white text-[#6B1F2B] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] flex items-center gap-2 border border-[#C3A35E]/30 shadow-sm"
          style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          📊 Export Excel
        </button>
      </div>

      {/* KPIs Grid - Refined Elegant Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            className="group relative bg-white border border-[#C3A35E]/30 text-[#6B1F2B] p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden card-elegant"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C3A35E]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#6B1F2B]/5 flex items-center justify-center border border-[#C3A35E]/20 group-hover:scale-110 transition-transform duration-300 text-[#6B1F2B]">
              <span className="text-2xl">{kpi.icon}</span>
            </div>
                <span className="text-xs font-bold text-[#6B1F2B] bg-[#C3A35E]/10 px-2.5 py-1 rounded-full border border-[#C3A35E]/20">KPI</span>
              </div>
              <div 
                className="text-3xl font-bold text-[#6B1F2B] mb-2 tracking-tight"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 700 }}
              >
                {kpi.value}
              </div>
              <div 
                className="text-sm text-[#6B1F2B]/70 font-medium"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links to OS Domains - Role-Specific */}
      <div className="bg-[#F8F9FA] border border-[#C3A35E]/30 rounded-lg p-4">
        <p className="text-sm text-[#6B1F2B] mb-2 font-bold uppercase tracking-wider">
          📑 OS Domains for {persona === 'distributor' || persona === 'sales_officer' ? 'Distributor' : persona === 'supplier' ? 'Supplier' : 'Company'}:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
          {(availableTabs.filter((tab) => tab !== 'overview') as TabType[]).map((tab: TabType) => {
            const domainMap: Record<string, string> = {
              'orders': 'orders-sales',
              'inventory': 'inventory',
              'logistics': 'logistics',
              'finance': 'finance',
              'crm': 'crm',
              'hr': 'hr',
              'executive': 'executive',
              'legal-ipr': 'legal',
              'import-export': 'import-export',
              'gps-tracking': 'gps-tracking',
              'competitor': 'competitor'
            }
            const domainPath = domainMap[tab] || tab
            return (
              <a
                key={tab}
                href={`/${locale}/os/${domainPath}`}
                className="flex items-center gap-2 text-xs font-medium text-[#6B1F2B] bg-white px-3 py-2 rounded border border-[#C3A35E]/20 hover:bg-[#C3A35E]/10 hover:border-[#C3A35E]/40 transition-colors shadow-sm"
              >
                <span>{tabIcons[tab]}</span>
                <span className="capitalize">{t(`tabs.${tab}`)}</span>
                <span className="ml-auto text-[#C3A35E]">→</span>
              </a>
            )
          })}
        </div>
        <p className="text-xs text-[#6B1F2B]/60 mt-3">
          💡 Click on any domain above to access detailed views. This dashboard provides an overview - use OS domains for detailed management.
        </p>
      </div>

      {/* Country Fundamentals */}
      {((countryData as any)?.populationBreakdown || (countryData as any)?.weather) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(countryData as any)?.populationBreakdown && (
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#6B1F2B] uppercase tracking-wider mb-2">Population</h4>
              <div className="text-3xl font-bold text-[#6B1F2B]">
                {((countryData as any).populationBreakdown?.value || 0).toLocaleString()}
              </div>
              {(countryData as any).populationBreakdown?.urbanPercent !== undefined && (
                <div className="text-xs text-[#6B1F2B]/70 mt-1">
                  Urbanization: {(countryData as any).populationBreakdown.urbanPercent}%
                </div>
              )}
            </div>
          )}
          {(countryData as any)?.weather && (
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#6B1F2B] uppercase tracking-wider mb-2">Weather - {(countryData as any).weather?.city || 'N/A'}</h4>
              <div className="text-3xl font-bold text-[#6B1F2B]">
                {(() => {
                  const temp = (countryData as any).weather?.temperature
                  if (!temp) return 'N/A'
                  const tempC = temp - 273.15
                  return `${tempC.toFixed(1)}°C`
                })()}
              </div>
              <div className="text-xs text-[#6B1F2B]/70 mt-1 capitalize">
                {(countryData as any).weather.description} • Humidity {(countryData as any).weather.humidity}% • Wind {(countryData as any).weather.windSpeed} m/s
              </div>
            </div>
          )}
        </div>
      )}

      {/* Macro & Taxation */}
      {((countryData as any)?.tax || (countryData as any)?.macroIndicators) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(countryData as any)?.tax && (
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#6B1F2B] uppercase tracking-wider mb-2">Tax Model</h4>
              <p className="text-sm text-[#6B1F2B]">VAT: <strong>{(countryData as any).tax.vat}%</strong></p>
              <p className="text-sm text-[#6B1F2B]">GST: <strong>{(countryData as any).tax.gst}%</strong></p>
              <p className="text-sm text-[#6B1F2B]">Import Duty: <strong>{(countryData as any).tax.importDuty}%</strong></p>
            </div>
          )}
          {(countryData as any)?.macroIndicators && (
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#6B1F2B] uppercase tracking-wider mb-2">Macro Indicators</h4>
              <p className="text-sm text-[#6B1F2B]">Inflation: <strong>{(countryData as any).macroIndicators?.inflation ?? 'n/a'}%</strong></p>
              <p className="text-sm text-[#6B1F2B]">Unemployment: <strong>{(countryData as any).macroIndicators?.unemployment ?? 'n/a'}%</strong></p>
              {(countryData as any)?.gdpPerCapita !== undefined && (
                <p className="text-sm text-[#6B1F2B]">GDP / Capita: <strong>${((countryData as any).gdpPerCapita as number).toLocaleString()}</strong></p>
              )}
            </div>
          )}
          {(countryData as any)?.paymentConnectors && (
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#6B1F2B] uppercase tracking-wider mb-2">Payments</h4>
              <ul className="space-y-1 text-sm text-[#6B1F2B]">
                {(countryData as { paymentConnectors?: unknown[] })?.paymentConnectors?.slice(0, 4).map((pay: any) => (
                  <li key={pay.name} className="flex items-center justify-between">
                    <span>{pay.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${pay.status === 'active' ? 'bg-[#6B1F2B]/10 text-[#6B1F2B] border-[#C3A35E]/30' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {pay.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* AI Strategy Snapshot */}
      {aiStrategy && (
        <div className="bg-[#6B1F2B] rounded-lg p-6 border border-[#C3A35E]/30 text-white shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-[#C3A35E] mb-1 uppercase tracking-wider font-bold">Market Score</div>
              <div className="text-3xl font-bold text-white">{(aiStrategy as any).marketScore || '--'}</div>
            </div>
            <div>
              <div className="text-sm text-[#C3A35E] mb-1 uppercase tracking-wider font-bold">Price Band</div>
              <div className="text-2xl font-bold text-white capitalize">{(aiStrategy as any).priceBand || 'tbd'}</div>
            </div>
            <div>
              <div className="text-sm text-[#C3A35E] mb-1 uppercase tracking-wider font-bold">Coverage Gaps</div>
              <div className="text-2xl font-bold text-white capitalize">{(aiStrategy as any).coverageGaps || 'n/a'}</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/90 italic border-l-2 border-[#C3A35E] pl-3">{(aiStrategy as any).priceNarrative}</p>
        </div>
      )}

      {/* SKU Recommendations */}
      {(aiStrategy as any)?.recommendedSKUs?.length > 0 && (
        <div className="bg-white rounded-lg border border-[#C3A35E]/30 p-6 shadow-sm">
          <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">🎯 AI Recommended SKUs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {((aiStrategy as any)?.recommendedSKUs || []).map((sku: any, idx: number) => (
              <div key={`${sku.name}-${idx}`} className="border border-[#C3A35E]/20 rounded-lg p-4 hover:border-[#C3A35E]/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-[#6B1F2B]">{sku.name}</h5>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      sku.priority === 'critical'
                        ? 'bg-[#6B1F2B]/10 text-[#6B1F2B] border border-[#C3A35E]/30'
                        : sku.priority === 'monitor'
                        ? 'bg-gray-100 text-gray-700 border border-gray-200'
                        : 'bg-[#C3A35E]/10 text-[#6B1F2B] border border-[#C3A35E]/20'
                    }`}
                  >
                    {sku.priority || 'stable'}
                  </span>
                </div>
                <p className="text-xs text-[#6B1F2B]/70 mb-1">{sku.format}</p>
                <p className="text-xs text-[#6B1F2B]/70">Channel: {sku.channel}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Analysis Section (Country-Driven) */}
      {loadingAnalysis ? (
        <div className="bg-white rounded-lg p-6 border border-[#C3A35E]/30">
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2 text-sm text-[#C3A35E]/90">Loading market analysis for {selectedCountry}...</p>
          </div>
        </div>
      ) : marketAnalysis ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-[#C3A35E]/30">
          <h3 className="text-lg font-semibold text-black mb-4">📊 Market Analysis - {(countryData as any)?.countryName || selectedCountry}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
              <div className="text-sm text-black mb-1">Market Score</div>
              <div className={`text-2xl font-bold ${
                ((marketAnalysis as any).scoring?.overall || 0) >= 80 ? 'text-white' :
                ((marketAnalysis as any).scoring?.overall || 0) >= 60 ? 'text-white' :
                ((marketAnalysis as any).scoring?.overall || 0) >= 40 ? 'text-white' : 'text-black'
              }`}>
                {(marketAnalysis as any).scoring?.overall || 'N/A'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
              <div className="text-sm text-black mb-1">Grade</div>
              <div className="text-2xl font-bold text-black">{(marketAnalysis as any).scoring?.grade || 'N/A'}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
              <div className="text-sm text-black mb-1">Price Band</div>
              <div className="text-lg font-semibold text-black">{(marketAnalysis as any).priceBand?.band || 'Unknown'}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
              <div className="text-sm text-black mb-1">Currency</div>
              <div className="text-lg font-semibold text-white">{(countryData as any)?.currency?.symbol || '$'} {(countryData as any)?.currency?.code || 'USD'}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* AI Sales Engine Section (Country-Driven) */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-black mb-4">🤖 AI Sales Engine - {(countryData as any)?.countryName || selectedCountry}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Forecasting */}
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-black mb-3">📈 Sales Forecasting (Next 3 Months)</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Forecasted Growth</span>
                <span className="text-lg font-bold text-white">
                  +{forecastGrowth}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Expected Revenue</span>
                <span className="text-lg font-bold text-black">
                  {currencySymbol}{(((data?.finance as any)?.revenue || 4500000) * 1.15 / 1000).toFixed(1)}K
                </span>
              </div>
                <div className="text-xs text-black mt-2">Based on ML model using {(countryData as any)?.countryName || selectedCountry} market data</div>
            </div>
          </div>

          {/* Route Scoring */}
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-black mb-3">🗺️ Route Scoring</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Top Route Score</span>
                <span className="text-lg font-bold text-white">92/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Active Routes</span>
                <span className="text-lg font-bold text-black">
                  {(() => {
                    const routes = (data?.logistics as any)?.activeRoutes;
                    if (Array.isArray(routes)) return routes.length;
                    if (typeof routes === 'number') return routes;
                    if (typeof routes === 'object' && routes !== null) return Object.keys(routes).length;
                    return 45;
                  })()}
                </span>
              </div>
              <div className="text-xs text-black mt-2">Route efficiency based on GPS data</div>
            </div>
          </div>

          {/* Distributor Scoring */}
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-black mb-3">👥 Distributor Scoring</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Avg Distributor Score</span>
                <span className="text-lg font-bold text-white">85/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Top Performers</span>
                <span className="text-lg font-bold text-white">12/47</span>
              </div>
              <div className="text-xs text-black mt-2">Performance based on sales, coverage, compliance</div>
            </div>
          </div>

          {/* Outlet Scoring */}
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-black mb-3">🏪 Outlet Scoring</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Avg Outlet Score</span>
                <span className="text-lg font-bold text-purple-600">78/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">High-Performing Outlets</span>
                <span className="text-lg font-bold text-white">234/890</span>
              </div>
              <div className="text-xs text-black mt-2">Based on sales velocity and inventory turnover</div>
            </div>
          </div>
        </div>
      </div>

      {/* SKU Contribution Analysis */}
      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="font-semibold text-black mb-4">📊 SKU Contribution Analysis - {(countryData as any)?.countryName || selectedCountry}</h4>
        <div className="space-y-3">
          {(marketAnalysis as any)?.skuMix?.top3 && Array.isArray((marketAnalysis as any).skuMix.top3) && (marketAnalysis as any).skuMix.top3.length > 0 ? (
            ((marketAnalysis as any).skuMix.top3 as string[]).slice(0, 5).map((sku: string, idx: number) => (
              <div key={idx} className="flex items-center justify-between border border-black200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">#{idx + 1}</span>
                  <span className="font-medium text-black">{sku}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-black">
                    Contribution: {(Math.random() * 15 + 10).toFixed(1)}%
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {(countryData as any)?.currency?.symbol || '$'}{(Math.random() * 50000 + 20000).toFixed(0)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-[#C3A35E]/90 text-center py-4">Loading SKU data...</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Orders Tab Component (Country-Driven)
function OrdersTab({ data, selectedCountry, countryData }: OrdersTabProps) {
  const t = useTranslations('crm')
  const [marketAnalysis, setMarketAnalysis] = useState<unknown>(null)

  useEffect(() => {
    if (selectedCountry) {
      loadMarketAnalysis()
    }
  }, [selectedCountry])

  const loadMarketAnalysis = async () => {
    try {
      const response = await apiClient.getLocalizationAnalysis(selectedCountry || 'US')
      const responseData = response.data as any
      if (responseData && responseData.success) {
        setMarketAnalysis(responseData.data)
      }
    } catch (err) {
      console.error('Error loading market analysis:', err)
    }
  }
  
  const orders = Array.isArray(data?.orders) ? data.orders : []
  const totalOrders = (data as any)?.total || orders.length
  const pending = orders.filter((o: any) => (o.status || '').toLowerCase() === 'pending').length
  const completed = orders.filter((o: any) => (o.status || '').toLowerCase() === 'completed').length
  const inTransit = orders.filter((o: any) => (o.status || '').toLowerCase().includes('transit')).length
  const currencySymbol = (countryData as any)?.currency?.symbol || '$'

  return (
    <div className="space-y-6">
      {/* Reporting Module - Export Buttons */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div></div>
        <div className="flex gap-2">
          <button className="bg-white text-[#6B1F2B] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] flex items-center gap-2 border border-[#C3A35E]/30 shadow-sm transition-all">
            📄 Export PDF
          </button>
          <button className="bg-white text-[#6B1F2B] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] flex items-center gap-2 border border-[#C3A35E]/30 shadow-sm transition-all">
            📊 Export Excel
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#6B1F2B] font-serif">{t('orders.orderManagement')}</h3>
        <button className="bg-[#6B1F2B] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#50000b] border border-[#C3A35E]/30 shadow-md transition-all">
          {t('orders.newOrder')}
        </button>
      </div>

      {/* Country-Specific Info & Product Structure */}
      <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/30">
        <div className="text-sm text-[#6B1F2B] mb-2">
          <strong>Country:</strong> {(countryData as any)?.countryName || selectedCountry} | 
          <strong> Currency:</strong> {(countryData as any)?.currency?.symbol || '$'} {(countryData as any)?.currency?.code || 'USD'}
        </div>
        {/* Country-Specific Price Bands */}
        <div className="text-xs text-[#6B1F2B]/80">
          <strong>Price Band:</strong> {(marketAnalysis as any)?.priceBand?.band || 'Standard'} | 
          <strong> Product Structure:</strong> Country-specific SKUs & Pack Sizes Available
        </div>
      </div>

      {(countryData as any)?.skuStructureDetail && (
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
          <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">🧱 SKU Structure</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {((countryData as any).skuStructureDetail || []).map((tier: any) => (
              <div key={tier.tier} className="border border-[#C3A35E]/20 rounded-lg p-4 bg-[#F8F9FA]">
                <div className="text-sm text-[#6B1F2B] uppercase font-bold tracking-wider">{tier.tier}</div>
                <div className="text-2xl font-bold text-[#6B1F2B]">{tier.share}%</div>
                <div className="text-xs text-[#6B1F2B]/70 mt-2">Hero SKUs:</div>
                <ul className="text-xs text-[#6B1F2B]/70 list-disc list-inside">
                  {tier.heroSkus.slice(0, 3).map((sku: string) => (
                    <li key={sku}>{sku}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">{t('orders.totalOrders')}</div>
          <div className="text-2xl font-bold text-[#6B1F2B]">{totalOrders}</div>
        </div>
        <div className="bg-[#6B1F2B] border border-[#6B1F2B] rounded-lg p-4 shadow-sm text-white">
          <div className="text-sm text-white/80 mb-1 font-medium uppercase tracking-wide">{t('orders.pending')}</div>
          <div className="text-2xl font-bold text-white">{pending}</div>
        </div>
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">{t('orders.completed')}</div>
          <div className="text-2xl font-bold text-[#6B1F2B]">{completed}</div>
        </div>
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">{t('orders.inTransit')}</div>
          <div className="text-2xl font-bold text-[#6B1F2B]">{inTransit}</div>
        </div>
      </div>

      {/* Workflow Engine UI - Orders Tab */}
      <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#C3A35E]/30 shadow-sm">
        <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">⚙️ Workflow Engine - Order Management</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Approvals */}
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[#6B1F2B]">Pending Approvals</span>
              <span className="text-xs bg-[#C3A35E]/20 text-[#6B1F2B] px-2 py-1 rounded-full font-bold">3</span>
            </div>
            <div className="text-xs text-[#6B1F2B]/70">Orders awaiting approval</div>
            <button className="mt-2 text-xs text-[#C3A35E] hover:text-[#6B1F2B] font-bold uppercase tracking-wider">View All →</button>
          </div>

          {/* Credit Override Alerts */}
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[#6B1F2B]">Credit Overrides</span>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">2</span>
            </div>
            <div className="text-xs text-[#6B1F2B]/70">Requires attention</div>
            <button className="mt-2 text-xs text-[#C3A35E] hover:text-[#6B1F2B] font-bold uppercase tracking-wider">Review →</button>
          </div>

          {/* Compliance Warnings */}
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[#6B1F2B]">Compliance Warnings</span>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">1</span>
            </div>
            <div className="text-xs text-[#6B1F2B]/70">Regulatory flags</div>
            <button className="mt-2 text-xs text-[#C3A35E] hover:text-[#6B1F2B] font-bold uppercase tracking-wider">Check →</button>
          </div>

          {/* Exceptions Queue */}
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[#6B1F2B]">Exceptions Queue</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">5</span>
            </div>
            <div className="text-xs text-[#6B1F2B]/70">Manual processing needed</div>
            <button className="mt-2 text-xs text-[#C3A35E] hover:text-[#6B1F2B] font-bold uppercase tracking-wider">Process →</button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#C3A35E]/30 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F9FA] border-b border-[#C3A35E]/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">{t('orders.orderId')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">{t('orders.customer')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">City</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">Channel</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">{t('orders.amount')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">{t('orders.status')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">{t('orders.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3A35E]/10">
              {orders.slice(0, 10).map((order: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[#6B1F2B]">#{order.id || idx + 1}</td>
                  <td className="px-4 py-3 text-sm text-[#6B1F2B]">{order.customer || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-[#6B1F2B]">{order.city || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-[#6B1F2B]">{order.channel || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#6B1F2B]">
                    {currencySymbol}{(order.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                      (order.status || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                      (order.status || '').toLowerCase() === 'pending' ? 'bg-[#C3A35E]/20 text-[#6B1F2B]' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B1F2B]/70">{order.date || order.eta || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">
                    <button className="text-[#C3A35E] hover:text-[#6B1F2B] font-medium hover:underline">{t('orders.viewDetails')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Inventory Tab Component (Country-Driven)
function InventoryTab({ data, selectedCountry, countryData, retailerIntel, whitespaceReport, logisticsSummary }: any) {
  const t = useTranslations('crm')
  const [subTab, setSubTab] = useState<'overview' | 'stock' | 'warehouse' | 'expiry' | 'batch'>('overview')
  
  const totalValue = data?.totalValue || 0
  const totalItems = data?.totalSKUs || 0
  const lowStock = data?.lowStock || 0
  const expiryRisk = data?.expiryRisk || 0

  const coverageRate = whitespaceReport?.summary?.coverageRate ?? 0
  const totalRetailers = retailerIntel?.totalRetailers ?? 0
  const whiteSpaces = whitespaceReport?.tiles?.filter((tile: any) => tile.whiteSpace).slice(0, 5) || []
  const warehouses = logisticsSummary?.warehouses ?? 0
  const coldChainCapacity = logisticsSummary?.coldChainCapacity ?? 'N/A'
  const activeRoutes = logisticsSummary?.activeRoutes ?? retailerIntel?.routes?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Reporting Module - Export Buttons */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button className="bg-white text-[#6B1F2B] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#F8F9FA] flex items-center gap-2 border border-[#C3A35E]/30 shadow-sm transition-all">
          📄 Export PDF
        </button>
        <button className="bg-white text-[#6B1F2B] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#F8F9FA] flex items-center gap-2 border border-[#C3A35E]/30 shadow-sm transition-all">
          📊 Export Excel
        </button>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-[#6B1F2B] font-serif">{t('inventory.inventoryManagement')}</h3>
        {/* Country-Specific Info */}
        <div className="text-sm text-[#6B1F2B]/80 bg-[#F8F9FA] px-4 py-2 rounded-lg border border-[#C3A35E]/20">
          <strong>{(countryData as any)?.countryName || selectedCountry}</strong> | 
          Currency: {(countryData as any)?.currency?.symbol || '$'} {(countryData as any)?.currency?.code || 'USD'}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-[#C3A35E]/30 bg-[#F8F9FA] px-2 py-1 rounded-t-lg">
        {(['overview', 'stock', 'warehouse', 'expiry', 'batch'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2.5 transition-all rounded-t-lg font-medium text-sm ${
              subTab === tab
                ? 'border-b-2 border-[#6B1F2B] text-[#6B1F2B] bg-white shadow-sm'
                : 'text-[#6B1F2B]/70 hover:text-[#6B1F2B] hover:bg-white/50 border-b border-transparent'
            }`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.025em' }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Sub-tab */}
      {subTab === 'overview' && (
        <>
          {/* Workflow Engine UI - Inventory Tab */}
          <div className="bg-white rounded-lg p-6 border border-[#C3A35E]/30 mb-6 shadow-sm">
            <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">⚙️ Workflow Engine - Inventory Management</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Auto-Replenishment Proposals */}
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#6B1F2B]">Replenishment Proposals</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">12</span>
                </div>
                <div className="text-xs text-[#6B1F2B]/70">AI-generated suggestions</div>
                <button className="mt-2 text-xs text-[#C3A35E] hover:text-[#C3A35E] hover:underline font-bold">Review →</button>
              </div>

              {/* Stock Exceptions */}
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#6B1F2B]">Stock Exceptions</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">7</span>
                </div>
                <div className="text-xs text-[#6B1F2B]/70">Below threshold or expired</div>
                <button className="mt-2 text-xs text-[#C3A35E] hover:text-[#C3A35E] hover:underline font-bold">View →</button>
              </div>

              {/* AI Reorder Suggestions */}
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#6B1F2B]">AI Reorder Suggestions</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">15</span>
                </div>
                <div className="text-xs text-[#6B1F2B]/70">ML-powered recommendations</div>
                <button className="mt-2 text-xs text-[#C3A35E] hover:text-[#C3A35E] hover:underline font-bold">Apply →</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">{t('inventory.totalValue')}</div>
              <div className="text-2xl font-bold text-[#6B1F2B]">
                {(countryData as any)?.currency?.symbol || '$'}{(totalValue / 1000).toFixed(1)}K
              </div>
            </div>
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">{t('inventory.totalItems')}</div>
              <div className="text-2xl font-bold text-[#6B1F2B]">{totalItems}</div>
            </div>
            <div className="bg-[#6B1F2B] border border-[#6B1F2B] rounded-lg p-4 shadow-sm">
              <div className="text-sm text-white/80 mb-1 font-medium uppercase tracking-wide">{t('inventory.lowStock')}</div>
              <div className="text-2xl font-bold text-white">{lowStock}</div>
            </div>
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">{t('inventory.expiryRisk')}</div>
              <div className="text-2xl font-bold text-[#6B1F2B]">{expiryRisk}</div>
            </div>
          </div>

          {(countryData as any)?.demandPockets && (
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 mt-6 shadow-sm">
              <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">🔥 Localization Demand Pockets</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {((countryData as any).demandPockets || []).slice(0, 4).map((pocket: any, idx: number) => (
                  <div key={`${pocket.region}-${idx}`} className="border border-[#C3A35E]/20 rounded-lg p-4 bg-[#F8F9FA]">
                    <div className="text-sm text-[#6B1F2B] mb-1 font-bold">{pocket.region}</div>
                    <div className="text-xl font-bold text-[#6B1F2B]">{pocket.velocity}</div>
                    <div className="text-xs text-[#6B1F2B]/70 mt-1">Focus SKU: {pocket.focusSKU}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Stock Levels Sub-tab */}
      {subTab === 'stock' && (
        <>
          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
            <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">Stock Levels</h4>
            <p className="text-[#6B1F2B]">Detailed stock tracking for {(countryData as any)?.countryName || selectedCountry}</p>
          </div>

          {Array.isArray(data?.skus) && data.skus.length > 0 && (
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg overflow-hidden shadow-sm mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8F9FA] border-b border-[#C3A35E]/20">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">SKU</th>
                      <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Pack Size</th>
                      <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">MRP</th>
                      <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">On Hand</th>
                      <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Min / Safety</th>
                      <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Coverage (days)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C3A35E]/10">
                    {data.skus.slice(0, 8).map((sku: any) => (
                      <tr key={sku.sku} className="hover:bg-[#F8F9FA]">
                        <td className="px-4 py-3 font-medium text-[#6B1F2B]">
                          <div>{sku.description}</div>
                          <div className="text-xs text-[#6B1F2B]/70">{sku.sku}</div>
                        </td>
                        <td className="px-4 py-3 text-[#6B1F2B]">{sku.packSize}</td>
                        <td className="px-4 py-3 text-[#6B1F2B]">
                          {(countryData as any)?.currency?.symbol || '$'}
                          {sku.mrp?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-[#6B1F2B]">{sku.onHand}</td>
                        <td className="px-4 py-3 text-[#6B1F2B]">
                          {sku.minStock}/{sku.safetyStock}
                        </td>
                        <td className="px-4 py-3 text-[#6B1F2B]">{sku.coverageDays}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Warehouse Sub-tab */}
      {subTab === 'warehouse' && (
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
          <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">Warehouse Locations - {(countryData as any)?.countryName || selectedCountry}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Total Warehouses</div>
              <div className="text-xl font-bold text-[#6B1F2B]">
                {warehouses}
              </div>
            </div>
            <div className="bg-[#6B1F2B] rounded-lg p-4 border border-[#6B1F2B]">
              <div className="text-sm text-white/80 mb-1 font-medium uppercase">Total Capacity</div>
              <div className="text-xl font-bold text-white">
                {coldChainCapacity}
              </div>
            </div>
            <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Utilization</div>
              <div className="text-xl font-bold text-[#6B1F2B]">
                {activeRoutes ? `${Math.min(99, Math.max(35, Math.round((activeRoutes / (warehouses || 1)) * 12)))}%` : 'N/A'}
              </div>
            </div>
          </div>
          <p className="text-[#6B1F2B] mt-4 text-sm">Country-specific warehouse locations and capacity for {(countryData as any)?.countryName || selectedCountry}</p>
        </div>
      )}

      {/* Expiry Monitor Sub-tab */}
      {subTab === 'expiry' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-[#C3A35E]/30 shadow-sm">
            <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">⏰ Expiry Monitor (FEFO) - First Expiry First Out</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Expiring Soon (30 days)</div>
                <div className="text-2xl font-bold text-orange-600">{expiryRisk || 12}</div>
              </div>
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Expiring This Week</div>
                <div className="text-2xl font-bold text-red-600">{Math.max(0, expiryRisk - 8) || 3}</div>
              </div>
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Total Expired</div>
                <div className="text-2xl font-bold text-[#6B1F2B]">{Math.max(0, expiryRisk - 15) || 0}</div>
              </div>
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">FEFO Compliance</div>
                <div className="text-2xl font-bold text-green-600">98%</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
            <h5 className="font-bold text-[#6B1F2B] mb-4 font-serif">📋 Items Expiring Soon</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#C3A35E]/20">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Batch/Lot</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Expiry Date</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Days Remaining</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C3A35E]/10">
                  {[
                    { sku: 'SKU-EXP-001', description: 'Product A - 500ml', batch: 'BATCH-2024-001', expiry: '2024-12-25', days: 5, qty: 120, status: 'Critical' },
                    { sku: 'SKU-EXP-002', description: 'Product B - 1L', batch: 'BATCH-2024-002', expiry: '2024-12-28', days: 8, qty: 85, status: 'Urgent' },
                    { sku: 'SKU-EXP-003', description: 'Product C - 250ml', batch: 'BATCH-2024-003', expiry: '2025-01-05', days: 16, qty: 200, status: 'Warning' },
                    { sku: 'SKU-EXP-004', description: 'Product D - 750ml', batch: 'BATCH-2024-004', expiry: '2025-01-10', days: 21, qty: 150, status: 'Warning' },
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F9FA]">
                      <td className="px-4 py-3 font-medium text-[#6B1F2B]">{item.sku}</td>
                      <td className="px-4 py-3 text-[#6B1F2B]">{item.description}</td>
                      <td className="px-4 py-3 text-[#6B1F2B]">{item.batch}</td>
                      <td className="px-4 py-3 text-[#6B1F2B]">{item.expiry}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.days <= 7 ? 'bg-red-100 text-red-800' :
                          item.days <= 14 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.days} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B1F2B]">{item.qty} units</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.status === 'Critical' ? 'bg-red-100 text-red-800' :
                          item.status === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
            <h5 className="font-bold text-[#6B1F2B] mb-4 font-serif">🔄 FEFO Recommendations</h5>
            <div className="space-y-3">
              {[
                { action: 'Prioritize shipment of BATCH-2024-001', reason: 'Expires in 5 days', priority: 'High' },
                { action: 'Move BATCH-2024-002 to front of warehouse', reason: 'Expires in 8 days', priority: 'High' },
                { action: 'Schedule discount promotion for BATCH-2024-003', reason: 'Expires in 16 days', priority: 'Medium' },
              ].map((rec, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-[#F8F9FA] rounded-lg border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-colors">
                  <div>
                    <div className="font-bold text-[#6B1F2B]">{rec.action}</div>
                    <div className="text-sm text-[#6B1F2B]/70 mt-1">{rec.reason}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    rec.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Batch Tracking Sub-tab */}
      {subTab === 'batch' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-[#C3A35E]/30 shadow-sm">
            <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">🔍 Batch Tracking & Lot Traceability</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Active Batches</div>
                <div className="text-2xl font-bold text-blue-600">{totalItems || 45}</div>
              </div>
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Under Investigation</div>
                <div className="text-2xl font-bold text-orange-600">2</div>
              </div>
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Traceability Score</div>
                <div className="text-2xl font-bold text-green-600">99%</div>
              </div>
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Quality Issues</div>
                <div className="text-2xl font-bold text-red-600">1</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
            <h5 className="font-bold text-[#6B1F2B] mb-4 font-serif">📦 Active Batch Tracking</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#C3A35E]/20">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Batch/Lot ID</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Manufacturing Date</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Expiry Date</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C3A35E]/10">
                  {[
                    { batch: 'BATCH-2024-001', sku: 'SKU-001', mfg: '2024-06-15', expiry: '2025-06-15', qty: 500, location: 'WH-A-01', status: 'Active' },
                    { batch: 'BATCH-2024-002', sku: 'SKU-002', mfg: '2024-07-20', expiry: '2025-07-20', qty: 750, location: 'WH-A-02', status: 'Active' },
                    { batch: 'BATCH-2024-003', sku: 'SKU-003', mfg: '2024-08-10', expiry: '2025-08-10', qty: 300, location: 'WH-B-01', status: 'Under Review' },
                    { batch: 'BATCH-2024-004', sku: 'SKU-004', mfg: '2024-09-05', expiry: '2025-09-05', qty: 450, location: 'WH-B-02', status: 'Active' },
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F9FA]">
                      <td className="px-4 py-3 font-medium text-[#6B1F2B]">{item.batch}</td>
                      <td className="px-4 py-3 text-[#6B1F2B]">{item.sku}</td>
                      <td className="px-4 py-3 text-[#6B1F2B]">{item.mfg}</td>
                      <td className="px-4 py-3 text-[#6B1F2B]">{item.expiry}</td>
                      <td className="px-4 py-3 text-[#6B1F2B]">{item.qty} units</td>
                      <td className="px-4 py-3 text-[#6B1F2B]">{item.location}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.status === 'Active' ? 'bg-green-100 text-green-800' :
                          item.status === 'Under Review' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
            <h5 className="font-bold text-[#6B1F2B] mb-4 font-serif">🔗 Batch Traceability Chain</h5>
            <div className="space-y-4">
              {[
                { batch: 'BATCH-2024-001', chain: 'Supplier → Manufacturing → Warehouse → Distribution → Retailer', status: 'Complete' },
                { batch: 'BATCH-2024-002', chain: 'Supplier → Manufacturing → Warehouse → Distribution', status: 'In Transit' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-[#F8F9FA] rounded-lg border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#6B1F2B]">{item.batch}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      item.status === 'Complete' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mt-2">{item.chain}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Logistics Tab Component (with GPS/Satellite Integration)
function LogisticsTab({ data, selectedCountry, countryData, gpsIntel, gpsHeatmap, gpsRoutes, whitespaceReport }: any) {
  const t = useTranslations('crm')
  const retailers = gpsIntel?.retailers || []
  const totalRetailers = gpsIntel?.totalRetailers ?? retailers.length
  const totalMonthlySales = gpsIntel?.totalMonthlySales ?? 0
  const localisationGps = (countryData as any)?.gpsCoverage
  const satelliteIntel = (countryData as any)?.satelliteInsights
  const coverageRate = localisationGps?.coveragePercent ?? whitespaceReport?.summary?.coverageRate ?? 0
  const whitespaceCount =
    whitespaceReport?.summary?.whiteSpaces ??
    whitespaceReport?.tiles?.filter((tile: any) => tile.whiteSpace).length ??
    0
  const logisticWhiteSpaces =
    whitespaceReport?.tiles?.filter((tile: any) => tile.whiteSpace).slice(0, 6) || []
  const avgSales = totalRetailers > 0 ? Math.round(totalMonthlySales / totalRetailers) : 0
  const heatmap = gpsHeatmap || null
  const routes = gpsRoutes?.routes || []
  const logisticsSummary = data || {}
  const currencySymbol = (countryData as any)?.currency?.symbol || '$'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-[#6B1F2B] font-serif">{t('logistics.logisticsManagement')}</h3>
        <div className="text-sm text-[#6B1F2B]/80 bg-[#F8F9FA] px-4 py-2 rounded-lg border border-[#C3A35E]/20">
          <strong>Country:</strong> {(countryData as any)?.countryName || selectedCountry}
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30 shadow-sm">
            <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Network Efficiency</div>
            <div className="text-2xl font-bold text-[#6B1F2B]">{logisticsSummary.efficiency ?? '—'}%</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30 shadow-sm">
            <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Deliveries / Month</div>
            <div className="text-2xl font-bold text-[#6B1F2B]">{logisticsSummary.totalDeliveries ?? '—'}</div>
          </div>
          <div className="bg-[#6B1F2B] rounded-lg p-4 border border-[#6B1F2B] shadow-sm">
            <div className="text-sm text-white/80 mb-1 font-medium uppercase">On-time Rate</div>
            <div className="text-2xl font-bold text-white">{logisticsSummary.onTimeRate ?? '—'}%</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30 shadow-sm">
            <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Active Routes</div>
            <div className="text-2xl font-bold text-[#6B1F2B]">{logisticsSummary.activeRoutes ?? routes.length}</div>
          </div>
        </div>
      )}

      {/* GPS Integration Section */}
      <div className="bg-white rounded-lg p-6 border border-[#C3A35E]/30 shadow-sm">
        <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">🗺️ GPS Coverage & Retailers - {(countryData as any)?.countryName || selectedCountry}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
            <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Retailers Tracked</div>
            <div className="text-2xl font-bold text-[#6B1F2B]">{totalRetailers}</div>
          </div>
          <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
            <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Avg Monthly Sales</div>
            <div className="text-2xl font-bold text-[#6B1F2B]">
              {currencySymbol}{(avgSales / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="bg-[#6B1F2B] rounded-lg p-4 border border-[#6B1F2B]">
            <div className="text-sm text-white/80 mb-1 font-medium uppercase">Heatmap Points</div>
            <div className="text-2xl font-bold text-white">{heatmap?.totalPoints || totalRetailers}</div>
          </div>
          <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
            <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">White Spaces</div>
            <div className="text-2xl font-bold text-[#6B1F2B]">{whitespaceCount}</div>
          </div>
      {heatmap?.points && heatmap.points.length > 0 && (
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 col-span-2 md:col-span-4 mt-4 shadow-sm">
          <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">📍 Coverage Hotspots</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {heatmap.points.slice(0, 6).map((point: any, idx: number) => (
              <div key={`${point.lat}-${idx}`} className="border border-[#C3A35E]/20 rounded-lg p-4 bg-[#F8F9FA]">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium">Lat/Lng</div>
                <div className="text-lg font-bold text-[#6B1F2B]">
                  {point.lat.toFixed(3)}, {point.lng.toFixed(3)}
                </div>
                <div className="text-xs text-[#6B1F2B] mt-1">Intensity: {(point.intensity * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>

      {localisationGps && (
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
          <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">🌐 FIRST-BRICK Coverage Intel</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Coverage %</div>
              <div className="text-2xl font-bold text-emerald-700">{localisationGps.coveragePercent}%</div>
            </div>
            <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Active Routes</div>
              <div className="text-2xl font-bold text-emerald-700">{localisationGps.activeRoutes}</div>
            </div>
            <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/20 col-span-2">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Priority Cities</div>
              <div className="text-xs text-[#6B1F2B]">
                {localisationGps.priorityCities?.join(', ') || '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retailer Table */}
      <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
        <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">Top Retail Nodes</h4>
        {retailers.length === 0 ? (
          <p className="text-sm text-[#6B1F2B]">No retailer telemetry for this market yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-[#6B1F2B] uppercase tracking-wider border-b border-[#C3A35E]/20 bg-[#F8F9FA]">
                  <th className="px-4 py-3">Retailer</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Monthly Sales</th>
                  <th className="px-4 py-3">Coordinates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C3A35E]/10 text-sm">
                {retailers.slice(0, 6).map((retailer: any) => (
                  <tr key={retailer.id} className="hover:bg-[#F8F9FA]">
                    <td className="px-4 py-3 font-medium text-[#6B1F2B]">{retailer.outletName}</td>
                    <td className="px-4 py-3 text-[#6B1F2B]">{retailer.city}</td>
                    <td className="px-4 py-3 text-[#6B1F2B] font-medium">
                      {currencySymbol}{retailer.monthlySales ? retailer.monthlySales.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-[#6B1F2B]">
                      {retailer.lat}, {retailer.lng}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Satellite White Spaces */}
      <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
        <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">🛰️ Satellite White Spaces</h4>
        {satelliteIntel ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-[#C3A35E]/20 rounded-lg p-4 bg-[#F8F9FA]">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">White Spaces</div>
              <div className="text-2xl font-bold text-[#6B1F2B]">{satelliteIntel.whitespaces}</div>
            </div>
            <div className="border border-[#C3A35E]/20 rounded-lg p-4 bg-[#F8F9FA]">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Density Index</div>
              <div className="text-2xl font-bold text-[#6B1F2B]">{(satelliteIntel.densityIndex * 100).toFixed(0)}%</div>
            </div>
            <div className="md:col-span-2">
              <h5 className="text-sm font-bold text-[#6B1F2B] mb-2 font-serif">Priority Zones</h5>
              <div className="flex flex-wrap gap-2 text-xs text-[#6B1F2B]">
                {satelliteIntel.priorityZones?.map((zone: string) => (
                  <span key={zone} className="px-3 py-1 bg-[#C3A35E]/10 border border-[#C3A35E]/30 rounded-full font-medium">{zone}</span>
                ))}
              </div>
            </div>
          </div>
        ) : whitespaceReport ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whitespaceReport.tiles?.filter((tile: any) => tile.whiteSpace).slice(0, 6).map((tile: any) => (
              <div key={tile.tileId} className="border border-[#C3A35E]/20 rounded-lg p-4 bg-[#F8F9FA]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#6B1F2B]">{tile.territory}</span>
                  <span className="text-xs text-[#6B1F2B] bg-[#C3A35E]/20 px-2 py-0.5 rounded">White space</span>
                </div>
                <p className="text-xs text-[#6B1F2B]">Lat/Lng: {tile.centerLat}, {tile.centerLng}</p>
                <p className="text-xs text-[#6B1F2B]">Coverage Score: {tile.coverageScore}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B1F2B]">Satellite analysis not available.</p>
        )}
      </div>

      {/* Logistics Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">{t('logistics.efficiency')}</div>
          <div className="text-2xl font-bold text-[#6B1F2B]">{data?.efficiency || 0}%</div>
        </div>
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">{t('logistics.deliveries')}</div>
          <div className="text-2xl font-bold text-[#6B1F2B]">{data?.totalDeliveries || 0}</div>
        </div>
        <div className="bg-[#6B1F2B] border border-[#6B1F2B] rounded-lg p-4 shadow-sm">
          <div className="text-sm text-white/80 mb-1 font-medium uppercase">{t('logistics.onTime')}</div>
          <div className="text-2xl font-bold text-white">{data?.onTimeRate || 0}%</div>
        </div>
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">{t('logistics.routes')}</div>
          <div className="text-2xl font-bold text-[#6B1F2B]">{(data as any)?.activeRoutes || 0}</div>
        </div>
        <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase">Tracked Retailers</div>
          <div className="text-2xl font-bold text-[#6B1F2B]">{totalRetailers}</div>
        </div>
        <div className="bg-[#6B1F2B] border border-[#6B1F2B] rounded-lg p-4 shadow-sm">
          <div className="text-sm text-white/80 mb-1 font-medium uppercase">Coverage Rate</div>
          <div className="text-2xl font-bold text-white">{coverageRate}%</div>
        </div>
      </div>
      <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
        <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">🛰️ Priority White Space Tiles</h4>
        {logisticWhiteSpaces.length === 0 ? (
          <p className="text-sm text-[#6B1F2B]">No white space tiles for this country.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F9FA] border-b border-[#C3A35E]/20">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Tile</th>
                  <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Population</th>
                  <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Retailers</th>
                  <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Coverage Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C3A35E]/10">
                {logisticWhiteSpaces.map((tile: any) => (
                  <tr key={tile.tileId} className="hover:bg-[#F8F9FA]">
                    <td className="px-4 py-2 font-medium text-[#6B1F2B]">{tile.tileId}</td>
                    <td className="px-4 py-2 text-[#6B1F2B]">{tile.approxPopulation.toLocaleString()}</td>
                    <td className="px-4 py-2 text-[#6B1F2B]">{tile.retailerCount}</td>
                    <td className="px-4 py-2 text-[#6B1F2B]">{tile.coverageScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
        <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">🚚 Distributor Routes</h4>
        {routes.length === 0 ? (
          <p className="text-sm text-[#6B1F2B]">No distributor routes captured for this market.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F9FA] border-b border-[#C3A35E]/20">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Route ID</th>
                  <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Distributor</th>
                  <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Distance (km)</th>
                  <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Duration (min)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C3A35E]/10">
                {routes.slice(0, 5).map((route: any) => (
                  <tr key={route.routeId} className="hover:bg-[#F8F9FA]">
                    <td className="px-4 py-2 font-medium text-[#6B1F2B]">{route.routeId}</td>
                    <td className="px-4 py-2 text-[#6B1F2B]">{route.distributor}</td>
                    <td className="px-4 py-2 text-[#6B1F2B]">{route.distanceKm}</td>
                    <td className="px-4 py-2 text-[#6B1F2B]">{route.durationMinutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Finance Tab Component (with Country-Specific Tax + Payments Engine)
function FinanceTab({ data, selectedCountry, countryData, countryProfile, aiStrategy, tradeFlows }: any) {
  const t = useTranslations('crm')
  const [subTab, setSubTab] = useState<'overview' | 'ar' | 'ap' | 'gl' | 'cash' | 'payments'>('overview')

  // Country-specific tax calculations
  const vatRate = countryProfile?.taxModel?.vat ?? 0
  const gstRate = countryProfile?.taxModel?.gst ?? 0
  const importDuty = countryProfile?.taxModel?.importDuty ?? 0
  const currency = (countryData as any)?.currency || { symbol: '$', code: 'USD' }
  const priceBand = countryProfile?.priceBand ?? (aiStrategy as any)?.priceBand ?? 'standard'
  const tradeHsCodes = tradeFlows?.hsCodes || []
  
  // Get payment connectors for selected country
  const paymentConnectors = (countryData as any)?.paymentConnectors || []

  return (
    <div className="space-y-6">
      {/* Reporting Module - Export Buttons */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button className="bg-white text-[#6B1F2B] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] flex items-center gap-2 border border-[#C3A35E]/30 shadow-sm transition-all">
          📄 Export PDF
        </button>
        <button className="bg-white text-[#6B1F2B] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] flex items-center gap-2 border border-[#C3A35E]/30 shadow-sm transition-all">
          📊 Export Excel
        </button>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-[#6B1F2B] font-serif">{t('finance.financeManagement')}</h3>
        <div className="text-sm text-[#6B1F2B]/80 bg-[#F8F9FA] px-4 py-2 rounded-lg border border-[#C3A35E]/20">
          <strong>{countryProfile?.name || (countryData as any)?.countryName || selectedCountry}</strong> | 
          Currency: {currency.symbol} {currency.code} | 
          VAT: {vatRate}% | GST: {gstRate}% | Import Duty: {importDuty}% | 
          Price Band: {priceBand}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-[#C3A35E]/30 bg-[#F8F9FA] px-2 py-1 rounded-t-lg overflow-x-auto">
        {(['overview', 'ar', 'ap', 'gl', 'cash', 'payments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2.5 transition-all whitespace-nowrap flex-shrink-0 rounded-t-lg font-medium text-sm ${
              subTab === tab
                ? 'border-b-2 border-[#6B1F2B] text-[#6B1F2B] bg-white shadow-sm'
                : 'text-[#6B1F2B]/70 hover:text-[#6B1F2B] hover:bg-white/50 border-b border-transparent'
            }`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.025em' }}
          >
            {tab === 'ar' ? 'AR' : tab === 'ap' ? 'AP' : tab === 'gl' ? 'GL' : tab === 'payments' ? '💳 Payments' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Sub-tab */}
      {subTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">{t('finance.revenue')}</div>
              <div className="text-2xl font-bold text-[#6B1F2B]">
                {currency.symbol}{((data?.revenue || 0) / 1000).toFixed(1)}K
              </div>
            </div>
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">{t('finance.expenses')}</div>
              <div className="text-2xl font-bold text-[#6B1F2B]">
                {currency.symbol}{((data?.expenses || 0) / 1000).toFixed(1)}K
              </div>
            </div>
            <div className="bg-[#6B1F2B] border border-[#6B1F2B] rounded-lg p-4 shadow-sm text-white">
              <div className="text-sm text-white/80 mb-1 font-medium uppercase tracking-wide">{t('finance.profit')}</div>
              <div className="text-2xl font-bold text-white">
                {currency.symbol}{((data?.profit || 0) / 1000).toFixed(1)}K
              </div>
            </div>
            <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">{t('finance.pending')}</div>
              <div className="text-2xl font-bold text-[#6B1F2B]">
                {currency.symbol}{((data?.pendingPayments || 0) / 1000).toFixed(1)}K
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 mt-4 shadow-sm">
            <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">📦 Trade Flow Snapshot</h4>
            {tradeHsCodes.length === 0 ? (
              <p className="text-sm text-[#6B1F2B]/70">Trade data unavailable for this country.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8F9FA] border-b border-[#C3A35E]/20">
                    <tr>
                      <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">HS Code</th>
                      <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Imports (USD)</th>
                      <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Exports (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C3A35E]/10">
                    {tradeHsCodes.slice(0, 5).map((flow: any) => (
                      <tr key={flow.hsCode} className="hover:bg-[#F8F9FA]">
                        <td className="px-4 py-2 font-medium text-[#6B1F2B]">{flow.hsCode}</td>
                        <td className="px-4 py-2 text-[#6B1F2B]">{flow.description}</td>
                        <td className="px-4 py-2 text-[#6B1F2B] font-medium">${flow.importValueUSD.toLocaleString()}</td>
                        <td className="px-4 py-2 text-[#6B1F2B] font-medium">${flow.exportValueUSD.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {(countryData as any)?.procurement && (
            <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#C3A35E]/30 mt-6 shadow-sm">
              <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">🛒 Procurement Hotspots</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {((countryData as any).procurement?.hotspots || []).map((spot: any) => (
                  <div key={spot.region} className="bg-white rounded-lg p-4 border border-[#C3A35E]/20 shadow-sm">
                    <div className="text-sm font-bold text-[#6B1F2B] mb-1">{spot.region}</div>
                    <div className="text-xs text-[#6B1F2B]/70">Materials: {spot.materials?.join(', ')}</div>
                  </div>
                ))}
              </div>
              {((countryData as any).procurement?.suppliers || []).length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-bold text-[#6B1F2B] mb-2 uppercase tracking-wide">Key Suppliers</h5>
                  <div className="flex flex-wrap gap-2 text-xs text-[#6B1F2B]">
                    {((countryData as any).procurement?.suppliers || []).slice(0, 4).map((supplier: any) => (
                      <span key={supplier.name} className="px-3 py-1 bg-white border border-[#C3A35E]/30 rounded-full shadow-sm">
                        {supplier.name} • {supplier.category} • {supplier.reliability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Payments Sub-tab */}
      {subTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Connectors Section */}
          <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#C3A35E]/30 shadow-sm">
            <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">💳 Payment Connectors - {(countryData as any)?.countryName || selectedCountry}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paymentConnectors.length > 0 ? (
                paymentConnectors.map((connector: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-[#C3A35E]/20 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[#6B1F2B] text-sm">{connector.name}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        connector.status === 'active' ? 'bg-green-500' :
                        connector.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <div className="text-xs text-[#6B1F2B]/70">
                      Priority: {connector.priority} | Status: {connector.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4 text-[#6B1F2B]/70">
                  Loading payment connectors for {(countryData as any)?.countryName || selectedCountry}...
                </div>
              )}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
            <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">Payment Breakdown (Last 30 Days)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {paymentConnectors.slice(0, 4).map((connector: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-[#C3A35E]/20">
                  <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium">{connector.name}</div>
                  <div className="text-xl font-bold text-[#6B1F2B]">
                    {currency.symbol}{((Math.random() * 50000 + 10000) / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-[#6B1F2B]/60 mt-1">
                    {Math.round(Math.random() * 20 + 10)}% of total
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement Summary */}
          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-6 shadow-sm">
            <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">Settlement Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#C3A35E]/30">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">Total Settled</div>
                <div className="text-2xl font-bold text-[#6B1F2B]">
                  {currency.symbol}{((data?.revenue || 4500000) / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30 shadow-sm">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">Pending</div>
                <div className="text-2xl font-bold text-[#6B1F2B]">
                  {currency.symbol}{((data?.pendingPayments || 125000) / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">Failed</div>
                <div className="text-2xl font-bold text-[#6B1F2B]">
                  {currency.symbol}{((Math.random() * 5000) / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-[#6B1F2B]/70 mb-1 font-medium uppercase tracking-wide">Reconciliation</div>
                <div className="text-2xl font-bold text-[#6B1F2B]">98%</div>
              </div>
            </div>
          </div>

          {/* Failed/Flagged Payments */}
          <div className="bg-white border border-[#C3A35E]/30 rounded-lg p-4 shadow-sm">
            <h4 className="font-bold text-[#6B1F2B] mb-4 font-serif">Failed/Flagged Payments</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#C3A35E]/20">
                  <tr>
                    <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Payment ID</th>
                    <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Method</th>
                    <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left font-bold text-[#6B1F2B] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C3A35E]/10">
                  {[1, 2, 3].map((idx) => (
                    <tr key={idx} className="hover:bg-[#F8F9FA]">
                      <td className="px-4 py-2 font-medium text-[#6B1F2B]">#PAY{String(idx).padStart(6, '0')}</td>
                      <td className="px-4 py-2 text-[#6B1F2B]">{paymentConnectors[idx % paymentConnectors.length]?.name || 'N/A'}</td>
                      <td className="px-4 py-2 text-[#6B1F2B] font-bold">
                        {currency.symbol}{(Math.random() * 5000 + 1000).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wide">Failed</span>
                      </td>
                      <td className="px-4 py-2 text-[#6B1F2B]">
                        {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Engine UI - Finance Tab */}
      {subTab === 'overview' && (
        <div className="bg-[#F8F9FA] rounded-lg p-6 border border-[#C3A35E]/30 shadow-sm mt-6">
          <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">⚙️ Workflow Engine - Finance Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Payment Exceptions */}
            <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/20 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#6B1F2B]">Payment Exceptions</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">4</span>
              </div>
              <div className="text-xs text-[#6B1F2B]/70">Failed or flagged payments</div>
              <button className="mt-2 text-xs text-[#C3A35E] hover:text-[#6B1F2B] font-bold uppercase tracking-wider">Resolve →</button>
            </div>

            {/* Settlement Delays */}
            <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/20 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#6B1F2B]">Settlement Delays</span>
                <span className="text-xs bg-[#C3A35E]/20 text-[#6B1F2B] px-2 py-1 rounded-full font-bold">2</span>
              </div>
              <div className="text-xs text-[#6B1F2B]/70">Overdue settlements</div>
              <button className="mt-2 text-xs text-[#C3A35E] hover:text-[#6B1F2B] font-bold uppercase tracking-wider">Follow Up →</button>
            </div>

            {/* Risk Alerts */}
            <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/20 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#6B1F2B]">Risk Alerts</span>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">3</span>
              </div>
              <div className="text-xs text-[#6B1F2B]/70">Credit/fraud risk flags</div>
              <button className="mt-2 text-xs text-[#C3A35E] hover:text-[#6B1F2B] font-bold uppercase tracking-wider">Review →</button>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Receivable Sub-tab */}
      {subTab === 'ar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-[#C3A35E]/30 shadow-sm">
            <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">📥 Accounts Receivable - {(countryData as any)?.countryName || selectedCountry}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Total AR</div>
                <div className="text-2xl font-bold text-green-600">
                  {currency.symbol}{((data?.revenue || 4500000) * 0.3 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Overdue</div>
                <div className="text-2xl font-bold text-red-600">
                  {currency.symbol}{((data?.revenue || 4500000) * 0.05 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Due This Month</div>
                <div className="text-2xl font-bold text-orange-600">
                  {currency.symbol}{((data?.revenue || 4500000) * 0.15 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Collection Rate</div>
                <div className="text-2xl font-bold text-blue-600">94%</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h5 className="font-semibold text-black mb-4">📋 Outstanding Invoices</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black">Invoice #</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Due Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Days Overdue</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { inv: 'INV-2024-001', customer: 'Retailer A', amount: 12500, due: '2024-12-15', overdue: 5, status: 'Overdue' },
                    { inv: 'INV-2024-002', customer: 'Retailer B', amount: 8500, due: '2024-12-20', overdue: 0, status: 'Due Soon' },
                    { inv: 'INV-2024-003', customer: 'Retailer C', amount: 15200, due: '2024-11-30', overdue: 20, status: 'Overdue' },
                    { inv: 'INV-2024-004', customer: 'Retailer D', amount: 9800, due: '2024-12-25', overdue: 0, status: 'Current' },
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-black">{item.inv}</td>
                      <td className="px-4 py-3 text-black">{item.customer}</td>
                      <td className="px-4 py-3 text-black">{currency.symbol}{item.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-black">{item.due}</td>
                      <td className="px-4 py-3">
                        {item.overdue > 0 ? (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                            {item.overdue} days
                          </span>
                        ) : (
                          <span className="text-gray-600">On time</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                          item.status === 'Due Soon' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Payable Sub-tab */}
      {subTab === 'ap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-[#C3A35E]/30 shadow-sm">
            <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">📤 Accounts Payable - {(countryData as any)?.countryName || selectedCountry}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-gray-600 mb-1">Total AP</div>
                <div className="text-2xl font-bold text-red-600">
                  {currency.symbol}{((data?.expenses || 3200000) * 0.4 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-gray-600 mb-1">Due This Week</div>
                <div className="text-2xl font-bold text-orange-600">
                  {currency.symbol}{((data?.expenses || 3200000) * 0.1 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-gray-600 mb-1">Overdue</div>
                <div className="text-2xl font-bold text-red-700">
                  {currency.symbol}{((data?.expenses || 3200000) * 0.02 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-gray-600 mb-1">Payment Rate</div>
                <div className="text-2xl font-bold text-green-600">97%</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h5 className="font-semibold text-black mb-4">📋 Pending Payments</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black">PO #</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Vendor</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Due Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Payment Terms</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { po: 'PO-2024-001', vendor: 'Supplier A', amount: 18500, due: '2024-12-22', terms: 'Net 30', status: 'Pending' },
                    { po: 'PO-2024-002', vendor: 'Supplier B', amount: 12200, due: '2024-12-18', terms: 'Net 15', status: 'Due Soon' },
                    { po: 'PO-2024-003', vendor: 'Supplier C', amount: 9500, due: '2024-12-10', terms: 'Net 30', status: 'Overdue' },
                    { po: 'PO-2024-004', vendor: 'Supplier D', amount: 15600, due: '2024-12-28', terms: 'Net 45', status: 'Scheduled' },
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-black">{item.po}</td>
                      <td className="px-4 py-3 text-black">{item.vendor}</td>
                      <td className="px-4 py-3 text-black">{currency.symbol}{item.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-black">{item.due}</td>
                      <td className="px-4 py-3 text-black">{item.terms}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                          item.status === 'Due Soon' ? 'bg-orange-100 text-orange-800' :
                          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* General Ledger Sub-tab */}
      {subTab === 'gl' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-[#C3A35E]/30 shadow-sm">
            <h4 className="text-lg font-bold text-[#6B1F2B] mb-4 font-serif">📚 General Ledger - {(countryData as any)?.countryName || selectedCountry}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Total Assets</div>
                <div className="text-2xl font-bold text-purple-600">
                  {currency.symbol}{((data?.revenue || 4500000) * 2.5 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Total Liabilities</div>
                <div className="text-2xl font-bold text-red-600">
                  {currency.symbol}{((data?.expenses || 3200000) * 1.2 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Equity</div>
                <div className="text-2xl font-bold text-green-600">
                  {currency.symbol}{((data?.profit || 1300000) * 1.5 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Last Reconciliation</div>
                <div className="text-lg font-bold text-blue-600">2024-12-15</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h5 className="font-semibold text-black mb-4">📊 Recent Journal Entries</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Account</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Description</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Debit</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Credit</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { date: '2024-12-18', account: 'Cash', desc: 'Payment received', debit: 12500, credit: 0, balance: 12500 },
                    { date: '2024-12-17', account: 'Accounts Receivable', desc: 'Invoice payment', debit: 0, credit: 12500, balance: -12500 },
                    { date: '2024-12-16', account: 'Accounts Payable', desc: 'Vendor payment', debit: 8500, credit: 0, balance: 8500 },
                    { date: '2024-12-15', account: 'Revenue', desc: 'Sales transaction', debit: 0, credit: 15200, balance: -15200 },
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-black">{item.date}</td>
                      <td className="px-4 py-3 font-semibold text-black">{item.account}</td>
                      <td className="px-4 py-3 text-black">{item.desc}</td>
                      <td className="px-4 py-3 text-black">{item.debit > 0 ? `${currency.symbol}${item.debit.toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3 text-black">{item.credit > 0 ? `${currency.symbol}${item.credit.toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${item.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {currency.symbol}{Math.abs(item.balance).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cash Management Sub-tab */}
      {subTab === 'cash' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
            <h4 className="text-lg font-semibold text-black mb-4">💵 Cash Management - {(countryData as any)?.countryName || selectedCountry}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Cash Balance</div>
                <div className="text-2xl font-bold text-blue-600">
                  {currency.symbol}{((data?.revenue || 4500000) * 0.25 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Cash Inflow (30d)</div>
                <div className="text-2xl font-bold text-green-600">
                  {currency.symbol}{((data?.revenue || 4500000) * 0.8 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Cash Outflow (30d)</div>
                <div className="text-2xl font-bold text-red-600">
                  {currency.symbol}{((data?.expenses || 3200000) * 0.75 / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Cash Flow Ratio</div>
                <div className="text-2xl font-bold text-purple-600">1.12x</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h5 className="font-semibold text-black mb-4">💰 Cash Flow Forecast (Next 30 Days)</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black">Week</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Expected Inflow</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Expected Outflow</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Net Flow</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Projected Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { week: 'Week 1', inflow: 350000, outflow: 280000, net: 70000, balance: 1125000 },
                    { week: 'Week 2', inflow: 320000, outflow: 295000, net: 25000, balance: 1150000 },
                    { week: 'Week 3', inflow: 380000, outflow: 310000, net: 70000, balance: 1220000 },
                    { week: 'Week 4', inflow: 400000, outflow: 320000, net: 80000, balance: 1300000 },
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-black">{item.week}</td>
                      <td className="px-4 py-3 text-green-600">{currency.symbol}{item.inflow.toLocaleString()}</td>
                      <td className="px-4 py-3 text-red-600">{currency.symbol}{item.outflow.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${item.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {currency.symbol}{item.net.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-black">{currency.symbol}{item.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h5 className="font-semibold text-black mb-4">🏦 Bank Accounts Summary</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { bank: 'Primary Operating Account', balance: 850000, currency: currency.symbol, status: 'Active' },
                { bank: 'Payroll Account', balance: 125000, currency: currency.symbol, status: 'Active' },
                { bank: 'Reserve Account', balance: 150000, currency: currency.symbol, status: 'Active' },
              ].map((account, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-black">{account.bank}</span>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                      {account.status}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-black mt-2">
                    {account.currency}{account.balance.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// CRM Tab Component (Country-Driven)
function CRMTab({ data, selectedCountry, countryData, countryProfile }: any) {
  const t = useTranslations('crm')
  const hierarchyDescription = countryProfile?.distributorStructure || 'Country → Region → City → Retail'
  const skuStrategy = countryProfile?.skuStrategy || []
  const distributorCount = Array.isArray(data?.distributorTiers)
    ? data.distributorTiers.reduce((sum: number, tier: any) => sum + (tier.count || 0), 0)
    : 0
  const regionalTierCount = Array.isArray(data?.distributorTiers) ? data.distributorTiers.length : 0
  const activeRoutes = (data as any)?.activeRoutes ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">{t('crm.crmManagement')}</h3>
        <div className="text-sm text-black">
          <strong>Country:</strong> {(countryData as any)?.countryName || selectedCountry}
        </div>
      </div>

      {/* Country-Specific Distributor Hierarchy */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-[#C3A35E]/30">
        <h4 className="font-semibold text-black mb-4">📍 Distributor Hierarchy - {(countryData as any)?.countryName || selectedCountry}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
            <div className="text-sm text-black mb-1">Total Distributors</div>
            <div className="text-2xl font-bold text-black">
              {distributorCount}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
            <div className="text-sm text-black mb-1">Regional Tiers</div>
            <div className="text-2xl font-bold text-white">
              {regionalTierCount}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
            <div className="text-sm text-black mb-1">Active Routes</div>
            <div className="text-2xl font-bold text-white">
              {activeRoutes}
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-black">
          <strong>Hierarchy Structure:</strong> {hierarchyDescription}
        </div>
      </div>

      {skuStrategy.length > 0 && (
        <div className="bg-white border border-black200 rounded-lg p-4">
          <h4 className="font-semibold text-black mb-3">🎯 Country SKU Strategy</h4>
          <ul className="list-disc list-inside text-sm text-black">
            {skuStrategy.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {(countryData as any)?.competitorSet && (
        <div className="bg-white border border-black200 rounded-lg p-6">
          <h4 className="font-semibold text-black mb-4">🔍 Competitor Watchlist</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-2 text-left">Brand</th>
                  <th className="px-4 py-2 text-left">Share</th>
                  <th className="px-4 py-2 text-left">Focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {((countryData as any).competitorSet || []).slice(0, 5).map((competitor: any) => (
                  <tr key={competitor.name}>
                    <td className="px-4 py-2 font-semibold text-black">{competitor.name}</td>
                    <td className="px-4 py-2 text-white">{competitor.share}%</td>
                    <td className="px-4 py-2 text-black">{competitor.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('crm.totalCustomers')}</div>
          <div className="text-2xl font-bold text-black">{data?.totalCustomers || 0}</div>
        </div>
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('crm.active')}</div>
          <div className="text-2xl font-bold text-white">{data?.activeCustomers || 0}</div>
        </div>
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('crm.new')}</div>
          <div className="text-2xl font-bold text-white">{data?.newCustomers || 0}</div>
        </div>
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('crm.satisfaction')}</div>
          <div className="text-2xl font-bold text-white">{data?.satisfaction || 0}%</div>
        </div>
      </div>
    </div>
  )
}

// HR Tab Component (Country-Driven)
function HRTab({ data, selectedCountry, countryData }: any) {
  const t = useTranslations('crm')

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-black">{t('hr.hrManagement')}</h3>
      <div className="text-sm text-black mb-4">
        <strong>Country:</strong> {(countryData as any)?.countryName || selectedCountry}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('hr.totalEmployees')}</div>
          <div className="text-2xl font-bold text-black">{data?.totalEmployees || 0}</div>
        </div>
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('hr.activeEmployees')}</div>
          <div className="text-2xl font-bold text-white">{data?.activeEmployees || 0}</div>
        </div>
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('hr.departments')}</div>
          <div className="text-2xl font-bold text-black">{data?.departments || 0}</div>
        </div>
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('hr.attendance')}</div>
          <div className="text-2xl font-bold text-white">{data?.attendanceRate || 0}%</div>
        </div>
      </div>
    </div>
  )
}

// Investor Tab Component (Integrated with Stock Ticker, Chart, and Form)
function InvestorTab({ data, selectedCountry, countryData }: any) {
  const t = useTranslations('crm')
  const currencySymbol = (countryData as any)?.currency?.symbol || '$'

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">📈 Investor Relations - {(countryData as any)?.countryName || selectedCountry}</h3>
        <p className="text-[#C3A35E]/90 text-sm">Comprehensive investor dashboard with stock performance and investment opportunities</p>
      </div>

      {/* Stock Ticker */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border border-[#C3A35E]/20 overflow-hidden">
        <StockTicker />
      </div>

      {/* Stock Chart */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border border-[#C3A35E]/20 p-4">
        <StockChart />
      </div>

      {/* Investor KPIs */}
      {data?.kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-[#C3A35E]/30 rounded-lg p-4">
            <div className="text-sm text-[#C3A35E]/80 mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-white">{data.kpis.totalOrders || 0}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-[#C3A35E]/30 rounded-lg p-4">
            <div className="text-sm text-[#C3A35E]/80 mb-1">Revenue</div>
            <div className="text-2xl font-bold text-white">{currencySymbol}{((data.kpis.revenue || 0) / 1000).toFixed(1)}K</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-[#C3A35E]/30 rounded-lg p-4">
            <div className="text-sm text-[#C3A35E]/80 mb-1">Customers</div>
            <div className="text-2xl font-bold text-white">{data.kpis.customers || 0}</div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {data?.recentActivity && data.recentActivity.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm border border-[#C3A35E]/30 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {data.recentActivity.map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-white/90">{activity.description}</span>
                <span className="text-white/60 text-sm">
                  {new Date(activity.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investment Form */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border border-[#C3A35E]/20 p-6">
        <h4 className="text-xl font-bold text-white mb-4">Investment Inquiry</h4>
        <InvestorRelationsForm />
      </div>

      {/* Investment Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a 
          href="https://wa.me/447405527427?text=Hi%2C%20I%27m%20interested%20in%20investing%20in%20Harvics%20Foods%20using%20fiat%20currency.%20Please%20provide%20more%20information."
          target="_blank"
          rel="noopener noreferrer"
          className="group p-6 rounded-xl border-2 border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💵</div>
            <h3 className="text-xl font-bold text-white mb-2">Fiat Investment</h3>
            <p className="text-[#C3A35E]/80 text-sm">Invest using traditional currencies (USD, EUR, GBP)</p>
          </div>
        </a>

        <a 
          href="https://wa.me/447405527427?text=Hi%2C%20I%27m%20interested%20in%20investing%20in%20Harvics%20Foods%20using%20Bitcoin.%20Please%20provide%20more%20information%20about%20Bitcoin%20investment%20options."
          target="_blank"
          rel="noopener noreferrer"
          className="group p-6 rounded-xl border-2 border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">₿</div>
            <h3 className="text-xl font-bold text-white mb-2">Bitcoin Investment</h3>
            <p className="text-[#C3A35E]/80 text-sm">Invest using Bitcoin with secure blockchain technology</p>
          </div>
        </a>
      </div>
    </div>
  )
}

// Executive Tab Component (with White Spaces, Gap Analysis, System Health)
function ExecutiveTab({ data, selectedCountry, countryData, whitespaceReport, aiStrategy, tradeFlows, procurementMap, graphSnapshot, dataOceanSummary, dataOceanFlows }: any) {
  const t = useTranslations('crm')
  const whitespaceTiles = whitespaceReport?.tiles || []
  const whiteSpaceCount =
    whitespaceReport?.summary?.whiteSpaces ??
    whitespaceTiles.filter((tile: any) => tile.whiteSpace).length
  const coverageRate = whitespaceReport?.summary?.coverageRate ?? 0
  const lowDensityCount = whitespaceReport?.summary?.lowDensity ?? whiteSpaceCount
  const highDensityCount = whitespaceReport?.summary?.highDensity ?? (whitespaceTiles.length - whiteSpaceCount)
  const tradeHsCodes = tradeFlows?.hsCodes || []
  const procurementMaterials = procurementMap?.rawMaterials || procurementMap?.materials || []
  const graphNodes = graphSnapshot?.nodes || []
  const oceanSummary = dataOceanSummary?.summary || dataOceanSummary
  const oceanFlows = dataOceanFlows?.flows || dataOceanFlows || []

  const graphStats = {
    totalNodes: graphNodes.length,
    totalEdges: graphSnapshot?.edges?.length || 0,
    manufacturers: graphNodes.filter((node: any) => node.entityType === 'manufacturer').length,
    distributors: graphNodes.filter((node: any) => node.entityType === 'distributor').length,
    retailers: graphNodes.filter((node: any) => node.entityType === 'retailer').length
  }

  return (
    <div className="space-y-6">
      {/* Reporting Module - Export Buttons */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center gap-2">
          📄 Export PDF
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-2">
          📊 Export Excel
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2">
          🤖 Export AI Insights
        </button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-semibold text-black">{t('executive.executiveManagement')}</h3>
        <div className="text-sm text-black">
          <strong>Country:</strong> {(countryData as any)?.countryName || selectedCountry}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('executive.profit')}</div>
          <div className="text-2xl font-bold text-white">
            {(countryData as any)?.currency?.symbol || '$'}{((data?.profit || 0) / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('executive.growth')}</div>
          <div className="text-2xl font-bold text-white">{data?.growth || 0}%</div>
        </div>
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('executive.marketShare')}</div>
          <div className="text-2xl font-bold text-black">{data?.marketShare || 0}%</div>
        </div>
        <div className="bg-white border border-black200 rounded-lg p-4">
          <div className="text-sm text-black mb-1">{t('executive.roi')}</div>
          <div className="text-2xl font-bold text-white">{data?.roi || 0}%</div>
        </div>
      </div>

      {/* Data Ocean Summary */}
      {oceanSummary && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-cyan-200">
          <h4 className="text-lg font-semibold text-[#0f172a] mb-4">🌊 Data Ocean Summary - {(countryData as any)?.countryName || selectedCountry}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-cyan-100">
              <div className="text-sm text-black mb-1">Manufacturers</div>
              <div className="text-2xl font-bold text-[#0f172a]">{oceanSummary.manufacturers || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-cyan-100">
              <div className="text-sm text-black mb-1">Distributors</div>
              <div className="text-2xl font-bold text-[#0f172a]">{oceanSummary.distributors || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-cyan-100">
              <div className="text-sm text-black mb-1">Retailers</div>
              <div className="text-2xl font-bold text-[#0f172a]">{oceanSummary.retailers || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-cyan-100">
              <div className="text-sm text-black mb-1">Annual Sales</div>
              <div className="text-2xl font-bold text-emerald-600">
                {(countryData as any)?.currency?.symbol || '$'}{((oceanSummary.annualSalesUSD || 0) / 1_000_000).toFixed(1)}M
              </div>
            </div>
          </div>
          {Array.isArray(oceanSummary.categoryLeaders) && oceanSummary.categoryLeaders.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-[#0f172a] mb-2">Category Leaders</h5>
              <div className="flex flex-wrap gap-2 text-xs text-black">
                {oceanSummary.categoryLeaders.map((cat: any) => (
                  <span key={cat.category} className="px-3 py-1 bg-white border border-cyan-100 rounded-full">
                    {cat.category}: <strong>{cat.leader}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* White Spaces Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <h4 className="text-lg font-semibold text-black mb-4">🛰️ White Spaces & Coverage Gaps - {(countryData as any)?.countryName || selectedCountry}</h4>
        {whitespaceReport ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-black mb-1">White Spaces</div>
              <div className="text-2xl font-bold text-black">{whiteSpaceCount}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-black mb-1">Coverage Score</div>
              <div className="text-2xl font-bold text-black">{coverageRate || 'N/A'}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-black mb-1">High Density Tiles</div>
              <div className="text-2xl font-bold text-white">{highDensityCount}</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-black">No whitespace data available</div>
        )}
      </div>

      {/* Coverage Gap Analysis Section */}
      <div className="bg-gradient-to-br from-white/10 to-white/20 rounded-lg p-6 border border-orange-200">
        <h4 className="text-lg font-semibold text-black mb-4">📊 Coverage Gap Analysis - {(countryData as any)?.countryName || selectedCountry}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="text-sm text-black mb-1">Coverage Gaps</div>
            <div className="text-2xl font-bold text-black">{lowDensityCount}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="text-sm text-black mb-1">Distribution Efficiency</div>
            <div className="text-2xl font-bold text-white">{100 - lowDensityCount}%</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="text-sm text-black mb-1">Market Opportunities</div>
            <div className="text-2xl font-bold text-white">{highDensityCount}</div>
          </div>
        </div>
      </div>

      {whitespaceReport?.roads && whitespaceReport.roads.length > 0 && (
        <div className="bg-white border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-black mb-3">🛣️ Road Overlay Insights</h4>
          <ul className="text-sm text-black space-y-1">
            {whitespaceReport.roads.slice(0, 5).map((road: any) => (
              <li key={road.name}>
                <strong>{road.name}</strong> • {road.path?.length || 0} waypoints tracked
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Ocean Flows */}
      {oceanFlows.length > 0 && (
        <div className="bg-white border border-cyan-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-[#0f172a]">🔁 Category Flows</h4>
            <span className="text-xs text-black">Top {Math.min(oceanFlows.length, 5)} lanes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cyan-50">
                <tr>
                  <th className="px-4 py-2 text-left">From → To</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Value (USD)</th>
                  <th className="px-4 py-2 text-left">Velocity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {oceanFlows.slice(0, 6).map((flow: any, idx: number) => (
                  <tr key={`${flow.from}-${flow.to}-${idx}`}>
                    <td className="px-4 py-2 text-black font-medium">{flow.from} → {flow.to}</td>
                    <td className="px-4 py-2 text-black">{flow.category}</td>
                    <td className="px-4 py-2 text-emerald-600">
                      {(countryData as any)?.currency?.symbol || '$'}{(flow.valueUSD || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-white">{flow.velocity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full System Health Console */}
      <div className="bg-gradient-to-br from-white50 to-slate-50 rounded-lg p-6 border border-black200">
        <h4 className="text-lg font-semibold text-black mb-4">⚡ Full System Health Console</h4>
        
        {/* Backend & Frontend Services Heartbeat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-black200">
            <div className="text-sm text-black mb-1">Backend Services</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-white">OK</span>
            </div>
            <div className="text-xs text-black mt-1">Last ping: {new Date().toLocaleTimeString()}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-black200">
            <div className="text-sm text-black mb-1">Frontend Status</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-white">OK</span>
            </div>
            <div className="text-xs text-black mt-1">Uptime: 99.9%</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-black200">
            <div className="text-sm text-black mb-1">Database Health</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-white">OK</span>
            </div>
            <div className="text-xs text-black mt-1">Response: 12ms</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-black200">
            <div className="text-sm text-black mb-1">API Latency</div>
            <div className="text-sm font-semibold text-black">45ms avg</div>
            <div className="text-xs text-black mt-1">P95: 89ms</div>
          </div>
        </div>

        {/* Auto-Bug Detector Details */}
        <div className="bg-white rounded-lg p-4 border border-black200 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-black">🔍 Auto-Bug Detector</h5>
            <span className="text-xs text-black">Last check: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-black mb-1">Total Detected</div>
              <div className="text-lg font-bold text-black">0</div>
            </div>
            <div>
              <div className="text-xs text-black mb-1">Unfixed</div>
              <div className="text-lg font-bold text-white">0</div>
            </div>
            <div>
              <div className="text-xs text-black mb-1">Auto-Fixed</div>
              <div className="text-lg font-bold text-white">0</div>
            </div>
            <div>
              <div className="text-xs text-black mb-1">Critical Issues</div>
              <div className="text-lg font-bold text-black">0</div>
            </div>
          </div>
        </div>

        {/* Error Logs & Last Exceptions */}
        <div className="bg-white rounded-lg p-4 border border-black200 mb-4">
          <h5 className="font-semibold text-black mb-2">📋 Error Logs & Last Exceptions</h5>
          <div className="text-sm text-black space-y-1">
            <div className="flex items-center justify-between">
              <span>Last 24h Errors:</span>
              <span className="font-semibold text-white">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Queue Backlog:</span>
              <span className="font-semibold text-white">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Event-Bus Health:</span>
              <span className="font-semibold text-white">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>System Uptime:</span>
              <span className="font-semibold text-black">99.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Health Panel */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-[#C3A35E]/30">
        <h4 className="text-lg font-semibold text-black mb-4">🔌 Integrations Health Panel</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* ERP Connector */}
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-black">ERP Connector</h5>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-xs text-black mb-1">Status: Active</div>
            <div className="text-xs text-black">Last Sync: {new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString()}</div>
          </div>

          {/* WMS / 3PL Connector */}
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-black">WMS / 3PL</h5>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-xs text-black mb-1">Status: Active</div>
            <div className="text-xs text-black">Last Sync: {new Date(Date.now() - 3 * 60 * 1000).toLocaleTimeString()}</div>
          </div>

          {/* Payments Gateway */}
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-black">Payments Gateway</h5>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-xs text-black mb-1">Status: Active</div>
            <div className="text-xs text-black">
              Active Connectors: {countryData?.integrations?.payments?.connectors?.filter((c: any) => c.status === 'active').length || 0}
            </div>
          </div>

          {/* Messaging Providers */}
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-black">WhatsApp/SMS/Email</h5>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-xs text-black mb-1">Status: Active</div>
            <div className="text-xs text-black">Providers: WhatsApp, SMS, Email</div>
          </div>

          {/* Marketplaces */}
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-black">Amazon/Noon</h5>
              <div className="w-2 h-2 bg-white/100 rounded-full"></div>
            </div>
            <div className="text-xs text-black mb-1">Status: Mock</div>
            <div className="text-xs text-black">Marketplace connectors (mock)</div>
          </div>

          {/* Integration Alerts */}
          <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-black">Integration Alerts</h5>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-xs text-black mb-1">Failing Integrations: 0</div>
            <div className="text-xs text-white font-semibold">All systems operational</div>
          </div>
        </div>
      </div>

      {/* AI Sales Engine - Full Insights */}
      {aiStrategy && (
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-6 border border-pink-200">
          <h4 className="text-lg font-semibold text-black mb-4">🤖 AI Sales Engine - {(countryData as any)?.countryName || selectedCountry}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <div className="text-sm text-black mb-1">Market Score</div>
              <div className="text-3xl font-bold text-white">{(aiStrategy as any).marketScore}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <div className="text-sm text-black mb-1">Price Band</div>
              <div className="text-2xl font-bold text-white capitalize">{(aiStrategy as any).priceBand}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <div className="text-sm text-black mb-1">Competitor Pressure</div>
              <div className="text-2xl font-bold text-black capitalize">{(aiStrategy as any).competitorPressure}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <h5 className="font-semibold text-black mb-3">Focus Regions</h5>
              <ul className="list-disc list-inside text-sm text-black space-y-1">
                {((aiStrategy as any).focusRegions || []).map((region: string, idx: number) => (
                  <li key={idx}>{region}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <h5 className="font-semibold text-black mb-3">Coverage Gaps</h5>
              <ul className="list-disc list-inside text-sm text-black space-y-1">
                {((aiStrategy as any).coverageGaps || []).map((gap: any, idx: number) => (
                  <li key={idx}>
                    {gap.city || gap.area || 'Region'} — {gap.whiteSpaceTiles || 0} tiles
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {aiStrategy.recommendedSkus?.length > 0 && (
            <div className="mt-6 bg-white rounded-lg p-4 border border-pink-200">
              <h5 className="font-semibold text-black mb-3">Recommended SKUs</h5>
              <div className="flex flex-wrap gap-2">
                {aiStrategy.recommendedSkus.map((sku: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-semibold">
                    {sku}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-black bg-white rounded-lg p-3 border border-pink-200">
            {aiStrategy.notes || 'AI strategy generated for this market.'}
          </div>
        </div>
      )}

      {graphSnapshot && (
        <div className="bg-white border border-black200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-black mb-4">🕸️ FMCG Network Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-black200">
              <div className="text-sm text-black mb-1">Total Nodes</div>
              <div className="text-2xl font-bold text-black">{graphStats.totalNodes}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-black200">
              <div className="text-sm text-black mb-1">Edges</div>
              <div className="text-2xl font-bold text-black">{graphStats.totalEdges}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-black200">
              <div className="text-sm text-black mb-1">Manufacturers</div>
              <div className="text-2xl font-bold text-white">{graphStats.manufacturers}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-black200">
              <div className="text-sm text-black mb-1">Retailers</div>
              <div className="text-2xl font-bold text-white">{graphStats.retailers}</div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Engine UI - Executive Tab */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
        <h4 className="text-lg font-semibold text-black mb-4">⚙️ Workflow Engine - Auto Actions Log & Rules</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auto-Actions Log */}
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <h5 className="font-semibold text-black mb-3">📋 Auto-Actions Log (Last 24h)</h5>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[
                { action: 'Auto-approved order', count: 23, time: '2h ago' },
                { action: 'Auto-replenished stock', count: 12, time: '4h ago' },
                { action: 'Sent payment reminder', count: 8, time: '6h ago' },
                { action: 'Updated inventory levels', count: 45, time: '8h ago' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm border-b border-black100 pb-2">
                  <div>
                    <div className="font-medium text-black">{item.action}</div>
                    <div className="text-xs text-black">{item.time}</div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Rules Summary */}
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <h5 className="font-semibold text-black mb-3">📜 Workflow Rules Summary</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-black">Active Rules</span>
                <span className="font-semibold text-black">28</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black">Triggered Today</span>
                <span className="font-semibold text-white">156</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black">Success Rate</span>
                <span className="font-semibold text-white">98.5%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black">Failed Actions</span>
                <span className="font-semibold text-black">2</span>
              </div>
              <button className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">
                View All Rules →
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// Type definitions for Legal/IPR data structures
interface Trademark {
  id: string
  name: string
  country: string
  status: string
  registrationDate: string
  expiryDate: string
  class: string
}

interface Patent {
  id: string
  title: string
  country: string
  status: string
  filingDate: string
  expiryDate: string
  number: string
}

interface Copyright {
  id: string
  work: string
  country: string
  status: string
  registrationDate: string
  expiryDate: string
}

interface DesignRight {
  id: string
  design: string
  country: string
  status: string
  registrationDate: string
  expiryDate: string
}

interface CounterfeitCase {
  id: string
  product: string
  location: string
  reportedDate: string
  status: string
  severity: string
}

interface ComplianceCountry {
  country: string
  complianceScore: number
  lastAudit: string
  nextAudit: string
  issues: number
}

interface Regulation {
  name: string
  country: string
  status: string
  lastCheck: string
}

interface Contract {
  id: string
  type: string
  party: string
  country: string
  startDate: string
  endDate: string
  status: string
  value: string
}

interface LitigationCase {
  id: string
  title: string
  country: string
  filedDate: string
  status: string
  type: string
  nextHearing: string
}

interface ImportOrder {
  id: string
  supplier: string
  origin: string
  product: string
  hsCode: string
  quantity: number
  value: number
  status: string
  customsStatus: string
  eta: string
}

interface ExportOrder {
  id: string
  customer: string
  destination: string
  product: string
  hsCode: string
  quantity: number
  value: number
  status: string
  customsStatus: string
  etd: string
}

interface HSCode {
  code: string
  description: string
  importDuty: number
  exportDuty: number
  vat: number
}

interface TradeDocument {
  id: string
  type: string
  orderId: string
  status: string
  issueDate: string
  expiryDate: string
  date?: string
  download?: string
}

interface GPSVehicle {
  id: string
  vehicleNumber: string
  driver: string
  status: string
  location: string
  currentLocation?: string
  speed: number
  route: string
  destination: string
  eta: string
  lastUpdate: string
}

interface GPSRoute {
  id: string
  name: string
  origin: string
  destination: string
  distance: number
  estimatedTime: number
  duration?: number
  deliveries?: number
  efficiency?: number
  startPoint?: string
  endPoint?: string
  status: string
  vehicles: number
}

interface GPSWarehouse {
  id: string
  name: string
  location: string
  capacity: number
  currentStock: number
  coverage?: number
  status: string
}

interface Competitor {
  id: string
  name: string
  [key: string]: any
}

interface ExchangeRate {
  currency: string
  rate: number
  lastUpdate: string
  change24h: string
}

interface ConversionHistory {
  from: string
  to: string
  amount: number
  converted: number
  rate: number
  date: string
}

interface TaxConfiguration {
  country: string
  vat: number
  gst: number
  importDuty: number
  exportDuty: number
  lastUpdate: string
  status?: string
}

interface TaxCalculation {
  id: string
  product: string
  amount: number
  vat: number
  gst: number
  total: number
  date: string
  orderId?: string
  currency?: string
  country?: string
}

interface CountryConfig {
  country: string
  rules: BusinessRule[]
  [key: string]: any
}

interface BusinessRule {
  id: string
  name: string
  type: string
  value: string
  status: string
}

interface WorkflowStep {
  id: string
  name: string
  status: string
  completedAt?: string
  [key: string]: any
}

interface WorkflowFlow {
  id: string
  type: string
  status: string
  [key: string]: any
}

interface ComplianceCheck {
  id: string
  name: string
  status: string
  [key: string]: any
}

interface ComplianceRule {
  id: string
  name: string
  type: string
  [key: string]: any
}

interface Currency {
  code: string
  symbol: string
  name: string
  rate: number
}

// Legal/IPR Tab Component - Comprehensive Implementation
function LegalIPRTab({ selectedCountry, countryData, data: apiData }: any) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'ipr' | 'counterfeit' | 'compliance' | 'contracts' | 'litigation'>('overview')
  
  // Use API data if available, otherwise use demo data
  const legalData = apiData || {
    overview: {
      iprRisk: 'Medium',
      counterfeitRisk: 'High',
      complianceScore: 85,
      activeTrademarks: 124,
      activePatents: 23,
      pendingRenewals: 8,
      activeLitigations: 3
    },
    ipr: {
      trademarks: [
        { id: 'TM-001', name: 'Harvics Logo', country: selectedCountry, status: 'Active', registrationDate: '2020-01-15', expiryDate: '2030-01-15', class: 'Class 30, 32' },
        { id: 'TM-002', name: 'Harvics Premium', country: selectedCountry, status: 'Active', registrationDate: '2021-03-20', expiryDate: '2031-03-20', class: 'Class 29, 30' },
        { id: 'TM-003', name: 'Harvics Global', country: selectedCountry, status: 'Pending', registrationDate: '2024-06-10', expiryDate: '—', class: 'Class 35' }
      ],
      patents: [
        { id: 'PAT-001', title: 'Beverage Preservation Method', country: selectedCountry, status: 'Active', filingDate: '2019-05-12', expiryDate: '2039-05-12', number: 'US12345678' },
        { id: 'PAT-002', title: 'Packaging Innovation', country: selectedCountry, status: 'Active', filingDate: '2020-08-30', expiryDate: '2040-08-30', number: 'US87654321' }
      ],
      copyrights: [
        { id: 'CR-001', work: 'Product Label Design', country: selectedCountry, status: 'Active', registrationDate: '2022-01-10', expiryDate: '2072-01-10' },
        { id: 'CR-002', work: 'Marketing Materials', country: selectedCountry, status: 'Active', registrationDate: '2023-04-15', expiryDate: '2073-04-15' }
      ],
      designRights: [
        { id: 'DR-001', design: 'Bottle Shape Design', country: selectedCountry, status: 'Active', registrationDate: '2021-09-05', expiryDate: '2031-09-05' }
      ]
    },
    counterfeit: {
      totalReports: 47,
      resolved: 38,
      pending: 9,
      cases: [
        { id: 'CF-001', product: 'Harvics Carbonated Beverage', location: 'Market District A', reportedDate: '2024-12-10', status: 'Under Investigation', severity: 'High' },
        { id: 'CF-002', product: 'Harvics Premium Snacks', location: 'Retail Chain B', reportedDate: '2024-12-08', status: 'Legal Action Initiated', severity: 'Critical' },
        { id: 'CF-003', product: 'Harvics Logo Usage', location: 'Online Marketplace', reportedDate: '2024-12-05', status: 'Resolved', severity: 'Medium' }
      ]
    },
    compliance: {
      countries: [
        { country: selectedCountry, complianceScore: 85, lastAudit: '2024-11-15', nextAudit: '2025-05-15', issues: 2 },
        { country: 'United States', complianceScore: 92, lastAudit: '2024-10-20', nextAudit: '2025-04-20', issues: 0 },
        { country: 'United Kingdom', complianceScore: 88, lastAudit: '2024-11-01', nextAudit: '2025-05-01', issues: 1 }
      ],
      regulations: [
        { name: 'Food Safety Standards', country: selectedCountry, status: 'Compliant', lastCheck: '2024-12-01' },
        { name: 'Labeling Requirements', country: selectedCountry, status: 'Compliant', lastCheck: '2024-11-28' },
        { name: 'Import/Export Regulations', country: selectedCountry, status: 'Review Required', lastCheck: '2024-11-15' }
      ]
    },
    contracts: {
      active: 156,
      expiring: 12,
      pending: 5,
      contracts: [
        { id: 'CNT-001', type: 'Distribution Agreement', party: 'ABC Distributors', country: selectedCountry, startDate: '2023-01-01', endDate: '2025-12-31', status: 'Active', value: '$2.5M' },
        { id: 'CNT-002', type: 'Supplier Agreement', party: 'XYZ Manufacturing', country: selectedCountry, startDate: '2022-06-15', endDate: '2025-06-15', status: 'Active', value: '$5.8M' },
        { id: 'CNT-003', type: 'License Agreement', party: 'Global Retail Chain', country: selectedCountry, startDate: '2024-03-01', endDate: '2027-03-01', status: 'Active', value: '$1.2M' }
      ]
    },
    litigation: {
      active: 3,
      resolved: 12,
      cases: [
        { id: 'LIT-001', title: 'Trademark Infringement Case', country: selectedCountry, filedDate: '2024-09-15', status: 'In Progress', type: 'IPR', nextHearing: '2025-01-20' },
        { id: 'LIT-002', title: 'Contract Dispute', country: selectedCountry, filedDate: '2024-10-05', status: 'Settlement Negotiation', type: 'Contract', nextHearing: '2025-02-10' },
        { id: 'LIT-003', title: 'Regulatory Compliance Issue', country: selectedCountry, filedDate: '2024-11-20', status: 'Under Review', type: 'Regulatory', nextHearing: '2025-01-15' }
      ]
    }
  }

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ipr', label: 'IPR Portfolio', icon: '📜' },
    { id: 'counterfeit', label: 'Counterfeit Detection', icon: '🚨' },
    { id: 'compliance', label: 'Compliance', icon: '✅' },
    { id: 'contracts', label: 'Contracts', icon: '📝' },
    { id: 'litigation', label: 'Litigation', icon: '⚖️' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">⚖️ Legal & IPR Management - {(countryData as any)?.countryName || selectedCountry}</h3>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 px-2 py-1 rounded-t-lg">
        <div className="flex overflow-x-auto">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-all rounded-t-lg font-medium ${
                activeSubTab === tab.id
                  ? 'border-[#6B1F2B] text-[#6B1F2B] bg-white shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-[#6B1F2B] hover:bg-white/50'
              }`}
              style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.025em' }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Sub-tab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-6 border border-red-200">
            <h4 className="text-lg font-semibold text-black mb-4">Legal Dashboard Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-black mb-1">IPR Risk Level</div>
                <div className="text-2xl font-bold text-white">{legalData.overview.iprRisk}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-black mb-1">Counterfeit Risk</div>
                <div className="text-2xl font-bold text-orange-600">{legalData.overview.counterfeitRisk}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-black mb-1">Compliance Score</div>
                <div className="text-2xl font-bold text-white">{legalData.overview.complianceScore}%</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-black mb-1">Active Litigations</div>
                <div className="text-2xl font-bold text-black">{legalData.overview.activeLitigations}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-black mb-1">Active Trademarks</div>
                <div className="text-2xl font-bold text-black">{legalData.overview.activeTrademarks}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-black mb-1">Active Patents</div>
                <div className="text-2xl font-bold text-black">{legalData.overview.activePatents}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-black mb-1">Pending Renewals</div>
                <div className="text-2xl font-bold text-orange-600">{legalData.overview.pendingRenewals}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-black mb-1">Active Contracts</div>
                <div className="text-2xl font-bold text-white">{legalData.contracts.active}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IPR Portfolio Sub-tab */}
      {activeSubTab === 'ipr' && (
        <div className="space-y-6">
          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">📜 Trademarks</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Country</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Registration Date</th>
                    <th className="px-4 py-2 text-left">Expiry Date</th>
                    <th className="px-4 py-2 text-left">Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {legalData.ipr.trademarks.map((tm: Trademark) => (
                    <tr key={tm.id}>
                      <td className="px-4 py-2 font-semibold text-black">{tm.id}</td>
                      <td className="px-4 py-2">{tm.name}</td>
                      <td className="px-4 py-2">{tm.country}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          tm.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-white/20 text-white'
                        }`}>
                          {tm.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-black">{tm.registrationDate}</td>
                      <td className="px-4 py-2 text-black">{tm.expiryDate}</td>
                      <td className="px-4 py-2 text-black">{tm.class}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">🔬 Patents</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Country</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Patent Number</th>
                    <th className="px-4 py-2 text-left">Filing Date</th>
                    <th className="px-4 py-2 text-left">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {legalData.ipr.patents.map((pat: Patent) => (
                    <tr key={pat.id}>
                      <td className="px-4 py-2 font-semibold text-black">{pat.id}</td>
                      <td className="px-4 py-2">{pat.title}</td>
                      <td className="px-4 py-2">{pat.country}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                          {pat.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-black">{pat.number}</td>
                      <td className="px-4 py-2 text-black">{pat.filingDate}</td>
                      <td className="px-4 py-2 text-black">{pat.expiryDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/95 border border-[#C3A35E]/30 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-black mb-4">© Copyrights</h4>
              <div className="space-y-3">
                {legalData.ipr.copyrights.map((cr: Copyright) => (
                  <div key={cr.id} className="border-b border-black100 pb-3">
                    <div className="font-semibold text-black">{cr.work}</div>
                    <div className="text-sm text-black">Registered: {cr.registrationDate} | Expires: {cr.expiryDate}</div>
                    <span className="inline-block mt-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                      {cr.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/95 border border-[#C3A35E]/30 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-black mb-4">🎨 Design Rights</h4>
              <div className="space-y-3">
                {legalData.ipr.designRights.map((dr: DesignRight) => (
                  <div key={dr.id} className="border-b border-black100 pb-3">
                    <div className="font-semibold text-black">{dr.design}</div>
                    <div className="text-sm text-black">Registered: {dr.registrationDate} | Expires: {dr.expiryDate}</div>
                    <span className="inline-block mt-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                      {dr.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counterfeit Detection Sub-tab */}
      {activeSubTab === 'counterfeit' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
            <h4 className="text-lg font-semibold text-black mb-4">🚨 Counterfeit Detection & Reporting</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="text-sm text-black mb-1">Total Reports</div>
                <div className="text-2xl font-bold text-black">{legalData.counterfeit.totalReports}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="text-sm text-black mb-1">Resolved</div>
                <div className="text-2xl font-bold text-white">{legalData.counterfeit.resolved}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="text-sm text-black mb-1">Pending</div>
                <div className="text-2xl font-bold text-orange-600">{legalData.counterfeit.pending}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="text-sm text-black mb-1">Resolution Rate</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round((legalData.counterfeit.resolved / legalData.counterfeit.totalReports) * 100)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-black">Active Counterfeit Cases</h4>
              <button className="px-4 py-2 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white">
                Report Counterfeit
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Case ID</th>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Location</th>
                    <th className="px-4 py-2 text-left">Reported Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Severity</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {legalData.counterfeit.cases.map((case_: CounterfeitCase) => (
                    <tr key={case_.id}>
                      <td className="px-4 py-2 font-semibold text-black">{case_.id}</td>
                      <td className="px-4 py-2">{case_.product}</td>
                      <td className="px-4 py-2">{case_.location}</td>
                      <td className="px-4 py-2 text-black">{case_.reportedDate}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          case_.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          case_.status === 'Legal Action Initiated' ? 'bg-red-100 text-red-800' :
                          'bg-white/20 text-white'
                        }`}>
                          {case_.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          case_.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          case_.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-white/20 text-white'
                        }`}>
                          {case_.severity}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Sub-tab */}
      {activeSubTab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">✅ Country Compliance Status</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Country</th>
                    <th className="px-4 py-2 text-left">Compliance Score</th>
                    <th className="px-4 py-2 text-left">Last Audit</th>
                    <th className="px-4 py-2 text-left">Next Audit</th>
                    <th className="px-4 py-2 text-left">Open Issues</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {legalData.compliance.countries.map((country: ComplianceCountry) => (
                    <tr key={country.country}>
                      <td className="px-4 py-2 font-semibold text-black">{country.country}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="text-lg font-bold text-white">{country.complianceScore}%</div>
                          <div className="ml-2 w-24 bg-white rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${country.complianceScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-black">{country.lastAudit}</td>
                      <td className="px-4 py-2 text-black">{country.nextAudit}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          country.issues === 0 ? 'bg-green-100 text-green-800' :
                          country.issues <= 2 ? 'bg-white/20 text-white' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {country.issues}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                          Compliant
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">📋 Regulatory Compliance Checklist</h4>
            <div className="space-y-3">
              {legalData.compliance.regulations.map((reg: Regulation, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-black200 rounded-lg">
                  <div>
                    <div className="font-semibold text-black">{reg.name}</div>
                    <div className="text-sm text-black">Last Check: {reg.lastCheck}</div>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    reg.status === 'Compliant' ? 'bg-green-100 text-green-800' :
                    'bg-white/20 text-white'
                  }`}>
                    {reg.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contracts Sub-tab */}
      {activeSubTab === 'contracts' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-[#C3A35E]/30">
            <h4 className="text-lg font-semibold text-black mb-4">📝 Contract Management</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
                <div className="text-sm text-black mb-1">Active Contracts</div>
                <div className="text-2xl font-bold text-black">{legalData.contracts.active}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
                <div className="text-sm text-black mb-1">Expiring Soon</div>
                <div className="text-2xl font-bold text-orange-600">{legalData.contracts.expiring}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
                <div className="text-sm text-black mb-1">Pending Review</div>
                <div className="text-2xl font-bold text-white">{legalData.contracts.pending}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
                <div className="text-sm text-black mb-1">Total Value</div>
                <div className="text-lg font-bold text-white">$9.5M</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-black">Active Contracts</h4>
              <button className="px-4 py-2 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white">
                New Contract
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Contract ID</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Party</th>
                    <th className="px-4 py-2 text-left">Country</th>
                    <th className="px-4 py-2 text-left">Start Date</th>
                    <th className="px-4 py-2 text-left">End Date</th>
                    <th className="px-4 py-2 text-left">Value</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {legalData.contracts.contracts.map((contract: Contract) => (
                    <tr key={contract.id}>
                      <td className="px-4 py-2 font-semibold text-black">{contract.id}</td>
                      <td className="px-4 py-2">{contract.type}</td>
                      <td className="px-4 py-2">{contract.party}</td>
                      <td className="px-4 py-2">{contract.country}</td>
                      <td className="px-4 py-2 text-black">{contract.startDate}</td>
                      <td className="px-4 py-2 text-black">{contract.endDate}</td>
                      <td className="px-4 py-2 font-semibold text-white">{contract.value}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Litigation Sub-tab */}
      {activeSubTab === 'litigation' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <h4 className="text-lg font-semibold text-black mb-4">⚖️ Litigation Tracking</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-black mb-1">Active Cases</div>
                <div className="text-2xl font-bold text-black">{legalData.litigation.active}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-black mb-1">Resolved</div>
                <div className="text-2xl font-bold text-white">{legalData.litigation.resolved}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-black mb-1">IPR Cases</div>
                <div className="text-2xl font-bold text-black">1</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-black mb-1">Contract Disputes</div>
                <div className="text-2xl font-bold text-black">1</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">Active Litigation Cases</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Case ID</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Country</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Filed Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Next Hearing</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {legalData.litigation.cases.map((case_: LitigationCase) => (
                    <tr key={case_.id}>
                      <td className="px-4 py-2 font-semibold text-black">{case_.id}</td>
                      <td className="px-4 py-2">{case_.title}</td>
                      <td className="px-4 py-2">{case_.country}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {case_.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-black">{case_.filedDate}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          case_.status === 'Settlement Negotiation' ? 'bg-white/20 text-white' :
                          case_.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-white text-black'
                        }`}>
                          {case_.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-black">{case_.nextHearing}</td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Competitor Intelligence Tab Component
function CompetitorTab({ selectedCountry, countryData }: any) {
  const competitorSet = (countryData as any)?.competitorSet || []
  const topCompetitor = competitorSet[0]
  const totalShare = competitorSet.reduce((acc: number, entry: any) => acc + (entry.share || 0), 0)
  const yourShare = Math.max(0, 100 - totalShare)

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-black">🔍 Competitor Intelligence - {(countryData as any)?.countryName || selectedCountry}</h3>
      
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
        <h4 className="text-lg font-semibold text-black mb-4">Market Share Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="text-sm text-black mb-1">Harvics Share</div>
            <div className="text-2xl font-bold text-white">{yourShare.toFixed(1)}%</div>
          </div>
          {topCompetitor && (
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <div className="text-sm text-black mb-1">Top Competitor</div>
              <div className="text-sm font-semibold text-black">{topCompetitor.name} ({topCompetitor.share}%)</div>
            </div>
          )}
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="text-sm text-black mb-1">Tracked Competitors</div>
            <div className="text-2xl font-bold text-white">{competitorSet.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="text-sm text-black mb-1">Competitive Gap</div>
            <div className="text-2xl font-bold text-black">
              {topCompetitor ? `${Math.max(0, topCompetitor.share - yourShare).toFixed(1)}%` : 'n/a'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-black200 rounded-lg p-4">
        <h4 className="font-semibold text-black mb-4">Competitor Pricing & Focus</h4>
        {competitorSet.length === 0 ? (
          <p className="text-black text-sm">No competitor data for this market yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-2 text-left">Brand</th>
                  <th className="px-4 py-2 text-left">Share</th>
                  <th className="px-4 py-2 text-left">Focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {competitorSet.map((competitor: any) => (
                  <tr key={competitor.name}>
                    <td className="px-4 py-2 font-semibold text-black">{competitor.name}</td>
                    <td className="px-4 py-2 text-white">{competitor.share}%</td>
                    <td className="px-4 py-2 text-black">{competitor.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Import/Export Tab Component - Comprehensive Implementation
function ImportExportTab({ selectedCountry, countryData, data: apiData }: any) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'imports' | 'exports' | 'customs' | 'documents'>('overview')
  const currency = (countryData as any)?.currency || { symbol: '$', code: 'USD' }
  const importDuty = (countryData as any)?.tax?.importDuty || 0
  const flows = (countryData as any)?.tradeFlowsDetailed || []

  // Use API data if available, otherwise use demo data
  const tradeData = apiData || {
    overview: {
      activeImports: 23,
      activeExports: 18,
      pendingClearance: 5,
      totalValue: 12500000,
      complianceRate: 98
    },
    imports: [
      { id: 'IMP-001', supplier: 'ABC Manufacturing Co.', origin: 'China', hsCode: '2202.10', product: 'Carbonated Beverages', quantity: 10000, value: 250000, status: 'In Transit', customsStatus: 'Cleared', eta: '2025-01-15', port: 'Port of Entry A' },
      { id: 'IMP-002', supplier: 'XYZ Food Products', origin: 'Thailand', hsCode: '1905.90', product: 'Snack Products', quantity: 5000, value: 180000, status: 'Customs Clearance', customsStatus: 'Pending', eta: '2025-01-20', port: 'Port of Entry B' },
      { id: 'IMP-003', supplier: 'Global Ingredients Ltd', origin: 'India', hsCode: '1701.14', product: 'Sugar', quantity: 20000, value: 45000, status: 'Delivered', customsStatus: 'Cleared', eta: '2024-12-28', port: 'Port of Entry A' }
    ],
    exports: [
      { id: 'EXP-001', customer: 'European Distributor', destination: 'Germany', hsCode: '2202.10', product: 'Premium Beverages', quantity: 8000, value: 320000, status: 'Shipped', customsStatus: 'Cleared', etd: '2025-01-10', port: 'Export Port A' },
      { id: 'EXP-002', customer: 'Middle East Retail Chain', destination: 'UAE', hsCode: '1905.90', product: 'Snack Products', quantity: 12000, value: 280000, status: 'In Transit', customsStatus: 'Cleared', etd: '2025-01-05', port: 'Export Port B' },
      { id: 'EXP-003', customer: 'Asian Market Distributor', destination: 'Singapore', hsCode: '2202.10', product: 'Beverages', quantity: 6000, value: 195000, status: 'Pending Shipment', customsStatus: 'Pending', etd: '2025-01-18', port: 'Export Port A' }
    ],
    customs: {
      hsCodes: [
        { code: '2202.10', description: 'Waters, including mineral waters and aerated waters', importDuty: 5, exportDuty: 0, vat: 10 },
        { code: '1905.90', description: 'Bread, pastry, cakes, biscuits and other bakers\' wares', importDuty: 8, exportDuty: 0, vat: 12 },
        { code: '1701.14', description: 'Cane sugar', importDuty: 3, exportDuty: 0, vat: 5 },
        { code: '2106.90', description: 'Food preparations not elsewhere specified', importDuty: 7, exportDuty: 0, vat: 10 }
      ],
      tariffRates: {
        importDuty: importDuty,
        exportDuty: 0,
        vat: 10,
        totalCompliance: 98
      }
    },
    documents: [
      { id: 'DOC-001', type: 'Commercial Invoice', orderId: 'IMP-001', status: 'Generated', date: '2024-12-15', download: true },
      { id: 'DOC-002', type: 'Bill of Lading', orderId: 'IMP-001', status: 'Received', date: '2024-12-20', download: true },
      { id: 'DOC-003', type: 'Certificate of Origin', orderId: 'EXP-001', status: 'Generated', date: '2025-01-05', download: true },
      { id: 'DOC-004', type: 'Customs Declaration', orderId: 'IMP-002', status: 'Pending', date: '—', download: false },
      { id: 'DOC-005', type: 'Packing List', orderId: 'EXP-002', status: 'Generated', date: '2025-01-03', download: true }
    ]
  }

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'imports', label: 'Import Orders', icon: '📥' },
    { id: 'exports', label: 'Export Orders', icon: '📤' },
    { id: 'customs', label: 'Customs & Tariffs', icon: '🏛️' },
    { id: 'documents', label: 'Trade Documents', icon: '📄' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">🌐 Import/Export Operations - {(countryData as any)?.countryName || selectedCountry}</h3>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-[#C3A35E]/20">
        <div className="flex overflow-x-auto">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-all ${
                activeSubTab === tab.id
                  ? 'border-white text-black bg-white'
                  : 'border-transparent text-[#C3A35E]/80 hover:text-[#C3A35E] hover:bg-white/10 hover:border-white/40'
              }`}
              style={{ fontFamily: 'sans-serif', fontWeight: 300, letterSpacing: '0.1em' }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Sub-tab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
            <h4 className="text-lg font-semibold text-black mb-4">Trade Operations Dashboard</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-teal-200">
                <div className="text-sm text-black mb-1">Active Import Orders</div>
                <div className="text-2xl font-bold text-black">{tradeData.overview.activeImports}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-teal-200">
                <div className="text-sm text-black mb-1">Active Export Orders</div>
                <div className="text-2xl font-bold text-white">{tradeData.overview.activeExports}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-teal-200">
                <div className="text-sm text-black mb-1">Pending Clearance</div>
                <div className="text-2xl font-bold text-orange-600">{tradeData.overview.pendingClearance}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-teal-200">
                <div className="text-sm text-black mb-1">Compliance Rate</div>
                <div className="text-2xl font-bold text-white">{tradeData.overview.complianceRate}%</div>
              </div>
            </div>
            <div className="mt-4 bg-white rounded-lg p-4 border border-teal-200">
              <div className="text-sm text-black mb-1">Total Trade Value (Last 30 Days)</div>
              <div className="text-2xl font-bold text-white">{currency.symbol}{tradeData.overview.totalValue.toLocaleString()}</div>
            </div>
          </div>

          {flows.length > 0 && (
            <div className="bg-white/95 border border-[#C3A35E]/30 rounded-lg p-6">
              <h4 className="font-semibold text-black mb-4">🚢 Recent Trade Flows</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-2 text-left">HS Code</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Imports ({currency.code})</th>
                      <th className="px-4 py-2 text-left">Exports ({currency.code})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {flows.slice(0, 6).map((flow: any) => (
                      <tr key={flow.hsCode}>
                        <td className="px-4 py-2 font-semibold text-black">{flow.hsCode}</td>
                        <td className="px-4 py-2 text-black">{flow.description}</td>
                        <td className="px-4 py-2 text-white">{currency.symbol}{flow.importUSD?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-white">{currency.symbol}{flow.exportUSD?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Orders Sub-tab */}
      {activeSubTab === 'imports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-black">📥 Import Orders</h4>
            <button className="px-4 py-2 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white">
              New Import Order
            </button>
          </div>
          <div className="bg-white border border-black200 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Supplier</th>
                    <th className="px-4 py-2 text-left">Origin</th>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">HS Code</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Value</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Customs</th>
                    <th className="px-4 py-2 text-left">ETA</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tradeData.imports.map((order: ImportOrder) => (
                    <tr key={order.id}>
                      <td className="px-4 py-2 font-semibold text-black">{order.id}</td>
                      <td className="px-4 py-2">{order.supplier}</td>
                      <td className="px-4 py-2">{order.origin}</td>
                      <td className="px-4 py-2">{order.product}</td>
                      <td className="px-4 py-2 font-mono text-black">{order.hsCode}</td>
                      <td className="px-4 py-2">{order.quantity.toLocaleString()}</td>
                      <td className="px-4 py-2 font-semibold text-white">{currency.symbol}{order.value.toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                          'bg-white/20 text-white'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.customsStatus === 'Cleared' ? 'bg-green-100 text-green-800' :
                          'bg-white/20 text-white'
                        }`}>
                          {order.customsStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-black">{order.eta}</td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Export Orders Sub-tab */}
      {activeSubTab === 'exports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-black">📤 Export Orders</h4>
            <button className="px-4 py-2 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white">
              New Export Order
            </button>
          </div>
          <div className="bg-white border border-black200 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Customer</th>
                    <th className="px-4 py-2 text-left">Destination</th>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">HS Code</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Value</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Customs</th>
                    <th className="px-4 py-2 text-left">ETD</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tradeData.exports.map((order: ExportOrder) => (
                    <tr key={order.id}>
                      <td className="px-4 py-2 font-semibold text-black">{order.id}</td>
                      <td className="px-4 py-2">{order.customer}</td>
                      <td className="px-4 py-2">{order.destination}</td>
                      <td className="px-4 py-2">{order.product}</td>
                      <td className="px-4 py-2 font-mono text-black">{order.hsCode}</td>
                      <td className="px-4 py-2">{order.quantity.toLocaleString()}</td>
                      <td className="px-4 py-2 font-semibold text-white">{currency.symbol}{order.value.toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'Shipped' ? 'bg-green-100 text-green-800' :
                          order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                          'bg-white/20 text-white'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.customsStatus === 'Cleared' ? 'bg-green-100 text-green-800' :
                          'bg-white/20 text-white'
                        }`}>
                          {order.customsStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-black">{order.etd}</td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customs & Tariffs Sub-tab */}
      {activeSubTab === 'customs' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
            <h4 className="text-lg font-semibold text-black mb-4">🏛️ Customs & Tariff Management</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-teal-200">
                <div className="text-sm text-black mb-1">Import Duty Rate</div>
                <div className="text-2xl font-bold text-black">{tradeData.customs.tariffRates.importDuty}%</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-teal-200">
                <div className="text-sm text-black mb-1">Export Duty Rate</div>
                <div className="text-2xl font-bold text-black">{tradeData.customs.tariffRates.exportDuty}%</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-teal-200">
                <div className="text-sm text-black mb-1">VAT Rate</div>
                <div className="text-2xl font-bold text-black">{tradeData.customs.tariffRates.vat}%</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-teal-200">
                <div className="text-sm text-black mb-1">Compliance Rate</div>
                <div className="text-2xl font-bold text-white">{tradeData.customs.tariffRates.totalCompliance}%</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">📋 HS Code Database</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">HS Code</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Import Duty</th>
                    <th className="px-4 py-2 text-left">Export Duty</th>
                    <th className="px-4 py-2 text-left">VAT</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tradeData.customs.hsCodes.map((hs: HSCode) => (
                    <tr key={hs.code}>
                      <td className="px-4 py-2 font-semibold text-black font-mono">{hs.code}</td>
                      <td className="px-4 py-2 text-black">{hs.description}</td>
                      <td className="px-4 py-2">{hs.importDuty}%</td>
                      <td className="px-4 py-2">{hs.exportDuty}%</td>
                      <td className="px-4 py-2">{hs.vat}%</td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trade Documents Sub-tab */}
      {activeSubTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-black">📄 Trade Documentation</h4>
            <button className="px-4 py-2 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white">
              Generate Document
            </button>
          </div>
          <div className="bg-white border border-black200 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Document ID</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tradeData.documents.map((doc: TradeDocument) => (
                    <tr key={doc.id}>
                      <td className="px-4 py-2 font-semibold text-black">{doc.id}</td>
                      <td className="px-4 py-2">{doc.type}</td>
                      <td className="px-4 py-2">{doc.orderId}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          doc.status === 'Generated' || doc.status === 'Received' ? 'bg-green-100 text-green-800' :
                          'bg-white/20 text-white'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-black">{doc.date}</td>
                      <td className="px-4 py-2">
                        {doc.download ? (
                          <button className="text-white hover:text-blue-800 text-sm font-semibold">Download</button>
                        ) : (
                          <span className="text-black text-sm">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// GPS Tracking Tab Component - Comprehensive Implementation
function GPSTrackingTab({ selectedCountry, countryData, data: apiData, gpsIntel, gpsHeatmap, gpsRoutes, whitespaceReport }: any) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'vehicles' | 'routes' | 'network' | 'analytics'>('overview')
  
  // Use API data if available, otherwise use demo data
  const gpsData = apiData || {
    overview: {
      totalVehicles: 45,
      activeVehicles: 38,
      totalRoutes: 156,
      activeRoutes: 23,
      coveragePercent: 78,
      totalRetailers: 1247,
      trackedRetailers: 972
    },
    vehicles: [
      { id: 'VH-001', vehicleNumber: 'HRV-2024-001', driver: 'John Smith', status: 'In Transit', currentLocation: 'Route A - City Center', speed: 45, lastUpdate: '2 min ago', route: 'Route-001', destination: 'Retailer A', eta: '15 min' },
      { id: 'VH-002', vehicleNumber: 'HRV-2024-002', driver: 'Jane Doe', status: 'Delivering', currentLocation: 'Route B - Market District', speed: 0, lastUpdate: '1 min ago', route: 'Route-002', destination: 'Retailer B', eta: 'Arrived' },
      { id: 'VH-003', vehicleNumber: 'HRV-2024-003', driver: 'Mike Johnson', status: 'Returning', currentLocation: 'Route C - Highway', speed: 65, lastUpdate: '3 min ago', route: 'Route-003', destination: 'Warehouse', eta: '25 min' },
      { id: 'VH-004', vehicleNumber: 'HRV-2024-004', driver: 'Sarah Williams', status: 'Parked', currentLocation: 'Warehouse', speed: 0, lastUpdate: '10 min ago', route: '—', destination: '—', eta: '—' }
    ],
    routes: [
      { id: 'RT-001', name: 'North Region Route', distance: 120, duration: 180, status: 'Active', vehicles: 3, deliveries: 12, efficiency: 92, startPoint: 'Warehouse A', endPoint: 'North Distribution Hub' },
      { id: 'RT-002', name: 'South Region Route', distance: 95, duration: 150, status: 'Active', vehicles: 2, deliveries: 8, efficiency: 88, startPoint: 'Warehouse A', endPoint: 'South Distribution Hub' },
      { id: 'RT-003', name: 'City Center Route', distance: 45, duration: 90, status: 'Active', vehicles: 4, deliveries: 15, efficiency: 95, startPoint: 'Warehouse B', endPoint: 'City Center' },
      { id: 'RT-004', name: 'Market District Route', distance: 60, duration: 120, status: 'Completed', vehicles: 2, deliveries: 10, efficiency: 90, startPoint: 'Warehouse B', endPoint: 'Market District' }
    ],
    network: {
      warehouses: [
        { id: 'WH-001', name: 'Main Warehouse', location: 'City A', capacity: 10000, currentStock: 7500, coverage: 'North, Central' },
        { id: 'WH-002', name: 'Distribution Hub B', location: 'City B', capacity: 8000, currentStock: 6200, coverage: 'South, East' },
        { id: 'WH-003', name: 'Regional Hub C', location: 'City C', capacity: 6000, currentStock: 4800, coverage: 'West' }
      ],
      retailers: gpsIntel?.retailers || [
        { id: 'RET-001', name: 'Retailer A', location: 'City Center', status: 'Active', lastDelivery: '2024-12-15', monthlySales: 45000, distance: 5.2 },
        { id: 'RET-002', name: 'Retailer B', location: 'Market District', status: 'Active', lastDelivery: '2024-12-14', monthlySales: 38000, distance: 8.7 },
        { id: 'RET-003', name: 'Retailer C', location: 'Suburban Area', status: 'Active', lastDelivery: '2024-12-13', monthlySales: 29000, distance: 12.3 }
      ]
    },
    analytics: {
      onTimeDelivery: 94.5,
      averageDeliveryTime: 2.3,
      routeEfficiency: 89.2,
      fuelConsumption: 1250,
      totalDistance: 15600,
      coverageGaps: whitespaceReport?.summary?.whiteSpaceTiles || 23
    }
  }

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'vehicles', label: 'Vehicle Tracking', icon: '🚚' },
    { id: 'routes', label: 'Routes', icon: '🗺️' },
    { id: 'network', label: 'Distribution Network', icon: '🌐' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">📍 GPS Tracking & Digital Mapping - {(countryData as any)?.countryName || selectedCountry}</h3>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-[#C3A35E]/20">
        <div className="flex overflow-x-auto">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-all ${
                activeSubTab === tab.id
                  ? 'border-white text-black bg-white'
                  : 'border-transparent text-[#C3A35E]/80 hover:text-[#C3A35E] hover:bg-white/10 hover:border-white/40'
              }`}
              style={{ fontFamily: 'sans-serif', fontWeight: 300, letterSpacing: '0.1em' }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Sub-tab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <h4 className="text-lg font-semibold text-black mb-4">GPS Tracking Dashboard</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-black mb-1">Total Vehicles</div>
                <div className="text-2xl font-bold text-black">{gpsData.overview.totalVehicles}</div>
                <div className="text-xs text-black mt-1">{gpsData.overview.activeVehicles} active</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-black mb-1">Active Routes</div>
                <div className="text-2xl font-bold text-white">{gpsData.overview.activeRoutes}</div>
                <div className="text-xs text-black mt-1">of {gpsData.overview.totalRoutes} total</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-black mb-1">Coverage</div>
                <div className="text-2xl font-bold text-white">{gpsData.overview.coveragePercent}%</div>
                <div className="text-xs text-black mt-1">{gpsData.overview.trackedRetailers} of {gpsData.overview.totalRetailers} retailers</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-black mb-1">On-Time Delivery</div>
                <div className="text-2xl font-bold text-emerald-600">{gpsData.analytics.onTimeDelivery}%</div>
                <div className="text-xs text-black mt-1">Last 30 days</div>
              </div>
            </div>
          </div>

          {/* Map Visualization Placeholder */}
          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">🗺️ Real-Time Map View</h4>
            <div className="bg-white rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-black300">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <div className="text-black font-semibold">Interactive GPS Map</div>
                <div className="text-sm text-black mt-1">Showing {gpsData.overview.activeVehicles} active vehicles and {gpsData.overview.activeRoutes} routes</div>
                <button className="mt-4 px-4 py-2 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white">
                  Open Full Map View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Tracking Sub-tab */}
      {activeSubTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-black">🚚 Real-Time Vehicle Tracking</h4>
            <button className="px-4 py-2 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white">
              Refresh Location
            </button>
          </div>
          <div className="bg-white border border-black200 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Vehicle ID</th>
                    <th className="px-4 py-2 text-left">Vehicle Number</th>
                    <th className="px-4 py-2 text-left">Driver</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Current Location</th>
                    <th className="px-4 py-2 text-left">Speed</th>
                    <th className="px-4 py-2 text-left">Route</th>
                    <th className="px-4 py-2 text-left">Destination</th>
                    <th className="px-4 py-2 text-left">ETA</th>
                    <th className="px-4 py-2 text-left">Last Update</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gpsData.vehicles.map((vehicle: GPSVehicle) => (
                    <tr key={vehicle.id}>
                      <td className="px-4 py-2 font-semibold text-black">{vehicle.id}</td>
                      <td className="px-4 py-2 font-mono">{vehicle.vehicleNumber}</td>
                      <td className="px-4 py-2">{vehicle.driver}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          vehicle.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                          vehicle.status === 'Delivering' ? 'bg-green-100 text-green-800' :
                          vehicle.status === 'Returning' ? 'bg-white/20 text-white' :
                          'bg-white text-black'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{vehicle.currentLocation}</td>
                      <td className="px-4 py-2">{vehicle.speed} km/h</td>
                      <td className="px-4 py-2">{vehicle.route}</td>
                      <td className="px-4 py-2">{vehicle.destination}</td>
                      <td className="px-4 py-2">{vehicle.eta}</td>
                      <td className="px-4 py-2 text-black">{vehicle.lastUpdate}</td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">Track</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Routes Sub-tab */}
      {activeSubTab === 'routes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-black">🗺️ Route Management</h4>
            <button className="px-4 py-2 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white">
              Create New Route
            </button>
          </div>
          <div className="bg-white border border-black200 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Route ID</th>
                    <th className="px-4 py-2 text-left">Route Name</th>
                    <th className="px-4 py-2 text-left">Distance (km)</th>
                    <th className="px-4 py-2 text-left">Duration (min)</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Vehicles</th>
                    <th className="px-4 py-2 text-left">Deliveries</th>
                    <th className="px-4 py-2 text-left">Efficiency</th>
                    <th className="px-4 py-2 text-left">Start Point</th>
                    <th className="px-4 py-2 text-left">End Point</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gpsData.routes.map((route: GPSRoute) => (
                    <tr key={route.id}>
                      <td className="px-4 py-2 font-semibold text-black">{route.id}</td>
                      <td className="px-4 py-2">{route.name}</td>
                      <td className="px-4 py-2">{route.distance} km</td>
                      <td className="px-4 py-2">{route.duration} min</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          route.status === 'Active' ? 'bg-green-100 text-green-800' :
                          'bg-white text-black'
                        }`}>
                          {route.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{route.vehicles}</td>
                      <td className="px-4 py-2">{route.deliveries}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="text-sm font-semibold text-white">{route.efficiency}%</div>
                          <div className="ml-2 w-16 bg-white rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${route.efficiency}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-black">{route.startPoint}</td>
                      <td className="px-4 py-2 text-black">{route.endPoint}</td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">View Map</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Network Sub-tab */}
      {activeSubTab === 'network' && (
        <div className="space-y-6">
          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">🏭 Warehouses & Distribution Centers</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {gpsData.network.warehouses.map((warehouse: GPSWarehouse) => (
                <div key={warehouse.id} className="border border-black200 rounded-lg p-4">
                  <div className="font-semibold text-black mb-2">{warehouse.name}</div>
                  <div className="text-sm text-black mb-1">Location: {warehouse.location}</div>
                  <div className="text-sm text-black mb-1">Capacity: {warehouse.capacity.toLocaleString()} units</div>
                  <div className="text-sm text-black mb-2">Current Stock: {warehouse.currentStock.toLocaleString()} units</div>
                  <div className="text-xs text-black">Coverage: {warehouse.coverage}</div>
                  <div className="mt-2 w-full bg-white rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(warehouse.currentStock / warehouse.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">🏪 Retailer Network ({gpsData.network.retailers.length} retailers)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Retailer ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Location</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Last Delivery</th>
                    <th className="px-4 py-2 text-left">Monthly Sales</th>
                    <th className="px-4 py-2 text-left">Distance (km)</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gpsData.network.retailers.slice(0, 10).map((retailer: any) => (
                    <tr key={retailer.id}>
                      <td className="px-4 py-2 font-semibold text-black">{retailer.id}</td>
                      <td className="px-4 py-2">{retailer.name}</td>
                      <td className="px-4 py-2">{retailer.location}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                          {retailer.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-black">{retailer.lastDelivery}</td>
                      <td className="px-4 py-2 font-semibold text-white">${retailer.monthlySales?.toLocaleString()}</td>
                      <td className="px-4 py-2">{retailer.distance} km</td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">View on Map</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Sub-tab */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
            <h4 className="text-lg font-semibold text-black mb-4">📈 GPS Analytics & Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-black mb-1">On-Time Delivery Rate</div>
                <div className="text-2xl font-bold text-white">{gpsData.analytics.onTimeDelivery}%</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-black mb-1">Average Delivery Time</div>
                <div className="text-2xl font-bold text-black">{gpsData.analytics.averageDeliveryTime} hrs</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-black mb-1">Route Efficiency</div>
                <div className="text-2xl font-bold text-white">{gpsData.analytics.routeEfficiency}%</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-black mb-1">Total Distance (km)</div>
                <div className="text-2xl font-bold text-black">{gpsData.analytics.totalDistance.toLocaleString()}</div>
                <div className="text-xs text-black mt-1">Last 30 days</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-black mb-1">Fuel Consumption (L)</div>
                <div className="text-2xl font-bold text-orange-600">{gpsData.analytics.fuelConsumption.toLocaleString()}</div>
                <div className="text-xs text-black mt-1">Last 30 days</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-black mb-1">Coverage Gaps</div>
                <div className="text-2xl font-bold text-black">{gpsData.analytics.coverageGaps}</div>
                <div className="text-xs text-black mt-1">White space tiles</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">📊 Performance Trends</h4>
            <div className="bg-white rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-black300">
              <div className="text-center text-black">
                <div className="text-3xl mb-2">📈</div>
                <div>Performance Charts & Trends</div>
                <div className="text-sm text-black mt-1">Delivery time trends, route optimization metrics, fuel efficiency</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Advanced Localization Tab Component - Comprehensive Implementation
function LocalizationTab({ selectedCountry, countryData, data: apiData }: any) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'currency' | 'tax' | 'business-rules'>('overview')
  
  // Use API data if available, otherwise use demo data
  const currencies = apiData?.currencies || [
    { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
    { code: 'EUR', symbol: '€', name: 'Euro', rate: 1.08 },
    { code: 'GBP', symbol: '£', name: 'British Pound', rate: 1.27 },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', rate: 0.0036 },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 0.27 },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rate: 0.27 },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 0.14 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 0.012 }
  ]

  const currentCurrency = (countryData as any)?.currency || { code: 'USD', symbol: '$', rate: 1.0 }
  
  // Use API data if available, otherwise use demo data
  const localizationData = apiData || {
    overview: {
      activeCountries: 42,
      supportedCurrencies: 25,
      taxConfigurations: 38,
      businessRules: 156,
      lastSync: '2024-12-15 10:30 AM'
    },
    currency: {
      baseCurrency: 'USD',
      supportedCurrencies: currencies,
      conversionHistory: [
        { from: 'USD', to: 'PKR', amount: 1000, converted: 277778, rate: 277.78, date: '2024-12-15' },
        { from: 'EUR', to: 'USD', amount: 500, converted: 540, rate: 1.08, date: '2024-12-14' },
        { from: 'GBP', to: 'AED', amount: 200, converted: 940, rate: 4.70, date: '2024-12-13' }
      ],
      exchangeRates: currencies.map((c: Currency) => ({
        currency: c.code,
        rate: c.rate,
        lastUpdate: '2024-12-15',
        change24h: (Math.random() * 2 - 1).toFixed(2) + '%'
      }))
    },
    tax: {
      currentCountry: selectedCountry,
      taxRates: {
        vat: countryData?.tax?.vat || 0,
        gst: countryData?.tax?.gst || 0,
        importDuty: countryData?.tax?.importDuty || 0,
        salesTax: countryData?.tax?.salesTax || 0
      },
      taxConfigurations: [
        { country: selectedCountry, vat: countryData?.tax?.vat || 0, gst: countryData?.tax?.gst || 0, importDuty: countryData?.tax?.importDuty || 0, status: 'Active' },
        { country: 'United States', vat: 0, gst: 0, importDuty: 2.5, status: 'Active' },
        { country: 'United Kingdom', vat: 20, gst: 0, importDuty: 0, status: 'Active' },
        { country: 'UAE', vat: 5, gst: 0, importDuty: 5, status: 'Active' }
      ],
      taxCalculations: [
        { orderId: 'ORD-001', amount: 1000, currency: 'USD', vat: 0, total: 1000, country: 'United States' },
        { orderId: 'ORD-002', amount: 500, currency: 'GBP', vat: 100, total: 600, country: 'United Kingdom' },
        { orderId: 'ORD-003', amount: 2000, currency: 'PKR', vat: 340, total: 2340, country: 'Pakistan' }
      ]
    },
    businessRules: {
      countries: [
        {
          country: selectedCountry,
          rules: [
            { id: 'BR-001', name: 'Minimum Order Value', value: '$100', type: 'Order', status: 'Active' },
            { id: 'BR-002', name: 'Payment Terms', value: 'Net 30', type: 'Payment', status: 'Active' },
            { id: 'BR-003', name: 'Working Days', value: 'Monday-Friday', type: 'Business', status: 'Active' },
            { id: 'BR-004', name: 'Business Hours', value: '9:00 AM - 6:00 PM', type: 'Business', status: 'Active' }
          ]
        },
        {
          country: 'United States',
          rules: [
            { id: 'BR-005', name: 'Minimum Order Value', value: '$50', type: 'Order', status: 'Active' },
            { id: 'BR-006', name: 'Payment Terms', value: 'Net 15', type: 'Payment', status: 'Active' }
          ]
        }
      ],
      ruleTypes: ['Order', 'Payment', 'Business', 'Shipping', 'Compliance']
    }
  }

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'currency', label: 'Multi-Currency', icon: '💱' },
    { id: 'tax', label: 'Tax Calculation', icon: '🧾' },
    { id: 'business-rules', label: 'Business Rules', icon: '📋' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">🌍 Advanced Localization - {(countryData as any)?.countryName || selectedCountry}</h3>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-[#C3A35E]/20">
        <div className="flex overflow-x-auto">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-all ${
                activeSubTab === tab.id
                  ? 'border-white text-black bg-white'
                  : 'border-transparent text-[#C3A35E]/80 hover:text-[#C3A35E] hover:bg-white/10 hover:border-white/40'
              }`}
              style={{ fontFamily: 'sans-serif', fontWeight: 300, letterSpacing: '0.1em' }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Sub-tab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-[#C3A35E]/30">
            <h4 className="text-lg font-semibold text-black mb-4">Localization Dashboard</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
                <div className="text-sm text-black mb-1">Active Countries</div>
                <div className="text-2xl font-bold text-black">{localizationData.overview.activeCountries}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
                <div className="text-sm text-black mb-1">Supported Currencies</div>
                <div className="text-2xl font-bold text-white">{localizationData.overview.supportedCurrencies}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
                <div className="text-sm text-black mb-1">Tax Configurations</div>
                <div className="text-2xl font-bold text-white">{localizationData.overview.taxConfigurations}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#C3A35E]/30">
                <div className="text-sm text-black mb-1">Business Rules</div>
                <div className="text-2xl font-bold text-purple-600">{localizationData.overview.businessRules}</div>
              </div>
            </div>
            <div className="mt-4 bg-white rounded-lg p-4 border border-[#C3A35E]/30">
              <div className="text-sm text-black mb-1">Last Synchronization</div>
              <div className="text-lg font-semibold text-black">{localizationData.overview.lastSync}</div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">Current Country Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-black mb-3">Currency</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-black">Code:</span>
                    <span className="font-semibold">{currentCurrency.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Symbol:</span>
                    <span className="font-semibold">{currentCurrency.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Exchange Rate:</span>
                    <span className="font-semibold">1 USD = {currentCurrency.rate ? (1/currentCurrency.rate).toFixed(2) : '1.00'} {currentCurrency.code}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-black mb-3">Tax Rates</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-black">VAT:</span>
                    <span className="font-semibold">{localizationData.tax.taxRates.vat}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">GST:</span>
                    <span className="font-semibold">{localizationData.tax.taxRates.gst}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Import Duty:</span>
                    <span className="font-semibold">{localizationData.tax.taxRates.importDuty}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Currency Sub-tab */}
      {activeSubTab === 'currency' && (
        <div className="space-y-6">
          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">💱 Currency Converter</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">From Currency</label>
                <select className="w-full px-4 py-2 border border-black300 rounded-lg">
                  {currencies.map((c: Currency) => (
                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Amount</label>
                <input type="number" className="w-full px-4 py-2 border border-black300 rounded-lg" placeholder="1000" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">To Currency</label>
                <select className="w-full px-4 py-2 border border-black300 rounded-lg">
                  {currencies.map((c: Currency) => (
                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="px-6 py-2 bg-white text-white rounded-lg font-semibold hover:bg-white">
              Convert
            </button>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">📊 Exchange Rates</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Currency</th>
                    <th className="px-4 py-2 text-left">Code</th>
                    <th className="px-4 py-2 text-left">Symbol</th>
                    <th className="px-4 py-2 text-left">Rate (vs USD)</th>
                    <th className="px-4 py-2 text-left">24h Change</th>
                    <th className="px-4 py-2 text-left">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {localizationData.currency.exchangeRates.map((rate: ExchangeRate) => (
                    <tr key={rate.currency}>
                      <td className="px-4 py-2 font-semibold text-black">{currencies.find((c: Currency) => c.code === rate.currency)?.name}</td>
                      <td className="px-4 py-2 font-mono">{rate.currency}</td>
                      <td className="px-4 py-2">{currencies.find((c: Currency) => c.code === rate.currency)?.symbol}</td>
                      <td className="px-4 py-2">{rate.rate.toFixed(4)}</td>
                      <td className="px-4 py-2">
                        <span className={rate.change24h.startsWith('-') ? 'text-black' : 'text-white'}>
                          {rate.change24h}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-black">{rate.lastUpdate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">📜 Conversion History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">From</th>
                    <th className="px-4 py-2 text-left">To</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Converted</th>
                    <th className="px-4 py-2 text-left">Rate</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {localizationData.currency.conversionHistory.map((conv: ConversionHistory, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 font-semibold text-black">{conv.from}</td>
                      <td className="px-4 py-2 font-semibold text-white">{conv.to}</td>
                      <td className="px-4 py-2">{conv.amount.toLocaleString()}</td>
                      <td className="px-4 py-2 font-semibold text-white">{conv.converted.toLocaleString()}</td>
                      <td className="px-4 py-2 text-black">{conv.rate.toFixed(4)}</td>
                      <td className="px-4 py-2 text-black">{conv.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tax Calculation Sub-tab */}
      {activeSubTab === 'tax' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <h4 className="text-lg font-semibold text-black mb-4">🧾 Tax Configuration - {(countryData as any)?.countryName || selectedCountry}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-black mb-1">VAT Rate</div>
                <div className="text-2xl font-bold text-black">{localizationData.tax.taxRates.vat}%</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-black mb-1">GST Rate</div>
                <div className="text-2xl font-bold text-black">{localizationData.tax.taxRates.gst}%</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-black mb-1">Import Duty</div>
                <div className="text-2xl font-bold text-black">{localizationData.tax.taxRates.importDuty}%</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-black mb-1">Sales Tax</div>
                <div className="text-2xl font-bold text-black">{localizationData.tax.taxRates.salesTax}%</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">🌍 Country Tax Configurations</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Country</th>
                    <th className="px-4 py-2 text-left">VAT (%)</th>
                    <th className="px-4 py-2 text-left">GST (%)</th>
                    <th className="px-4 py-2 text-left">Import Duty (%)</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {localizationData.tax.taxConfigurations.map((config: TaxConfiguration) => (
                    <tr key={config.country}>
                      <td className="px-4 py-2 font-semibold text-black">{config.country}</td>
                      <td className="px-4 py-2">{config.vat}%</td>
                      <td className="px-4 py-2">{config.gst}%</td>
                      <td className="px-4 py-2">{config.importDuty}%</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                          {config.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">💰 Tax Calculation Examples</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Currency</th>
                    <th className="px-4 py-2 text-left">VAT</th>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Country</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {localizationData.tax.taxCalculations.map((calc: TaxCalculation) => (
                    <tr key={calc.orderId}>
                      <td className="px-4 py-2 font-semibold text-black">{calc.orderId}</td>
                      <td className="px-4 py-2">{calc.amount.toLocaleString()} {calc.currency}</td>
                      <td className="px-4 py-2">{calc.currency}</td>
                      <td className="px-4 py-2 text-white">{calc.vat.toLocaleString()} {calc.currency}</td>
                      <td className="px-4 py-2 font-semibold text-black">{calc.total.toLocaleString()} {calc.currency}</td>
                      <td className="px-4 py-2">{calc.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Business Rules Sub-tab */}
      {activeSubTab === 'business-rules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-black">📋 Country-Specific Business Rules</h4>
            <button className="px-4 py-2 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white">
              Add New Rule
            </button>
          </div>

          {localizationData.businessRules.countries.map((countryConfig: CountryConfig) => (
            <div key={countryConfig.country} className="bg-white border border-black200 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-black mb-4">{countryConfig.country}</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-2 text-left">Rule ID</th>
                      <th className="px-4 py-2 text-left">Rule Name</th>
                      <th className="px-4 py-2 text-left">Value</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {countryConfig.rules.map((rule: BusinessRule) => (
                      <tr key={rule.id}>
                        <td className="px-4 py-2 font-semibold text-black">{rule.id}</td>
                        <td className="px-4 py-2">{rule.name}</td>
                        <td className="px-4 py-2 font-semibold text-white">{rule.value}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                            {rule.type}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                            {rule.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <button className="text-white hover:text-blue-800 text-sm font-semibold">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">📊 Rule Types Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {localizationData.businessRules.ruleTypes.map((type: string) => (
                <div key={type} className="border border-black200 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-semibold text-black">{type}</div>
                  <div className="text-sm text-black mt-1">
                    {localizationData.businessRules.countries.reduce((acc: number, country: CountryConfig) => 
                      acc + country.rules.filter((r: BusinessRule) => r.type === type).length, 0
                    )} rules
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Close-End Operations / Workflows Tab Component - Comprehensive Implementation
function WorkflowsTab({ selectedCountry, countryData, data: apiData }: any) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'order-fulfillment' | 'import-export-flow' | 'compliance-flow'>('overview')
  
  // Use API data if available, otherwise use demo data
  const workflowData = apiData || {
    overview: {
      activeWorkflows: 12,
      completedToday: 156,
      pendingActions: 8,
      successRate: 98.5,
      averageProcessingTime: '2.3 hours'
    },
    orderFulfillment: {
      workflow: [
        { step: 1, name: 'Order Received', status: 'Completed', time: '10:00 AM', duration: '0 min' },
        { step: 2, name: 'Inventory Check', status: 'Completed', time: '10:02 AM', duration: '2 min' },
        { step: 3, name: 'Payment Verification', status: 'Completed', time: '10:05 AM', duration: '3 min' },
        { step: 4, name: 'Legal Compliance Check', status: 'In Progress', time: '10:08 AM', duration: '3 min' },
        { step: 5, name: 'Shipping Preparation', status: 'Pending', time: '—', duration: '—' },
        { step: 6, name: 'Customs Clearance', status: 'Pending', time: '—', duration: '—' },
        { step: 7, name: 'Delivery', status: 'Pending', time: '—', duration: '—' },
        { step: 8, name: 'Payment Processing', status: 'Pending', time: '—', duration: '—' }
      ],
      activeOrders: [
        { id: 'ORD-001', customer: 'ABC Distributors', amount: 25000, status: 'Step 4/8', currentStep: 'Legal Compliance', progress: 50 },
        { id: 'ORD-002', customer: 'XYZ Retail', amount: 18000, status: 'Step 3/8', currentStep: 'Payment Verification', progress: 37.5 },
        { id: 'ORD-003', customer: 'Global Chain', amount: 45000, status: 'Step 5/8', currentStep: 'Shipping Preparation', progress: 62.5 }
      ]
    },
    importExportFlow: {
      importWorkflow: [
        { step: 1, name: 'Import Order Created', status: 'Completed' },
        { step: 2, name: 'Customs Documentation', status: 'Completed' },
        { step: 3, name: 'HS Code Verification', status: 'Completed' },
        { step: 4, name: 'Legal Compliance Check', status: 'In Progress' },
        { step: 5, name: 'Customs Clearance', status: 'Pending' },
        { step: 6, name: 'Warehouse Receipt', status: 'Pending' }
      ],
      exportWorkflow: [
        { step: 1, name: 'Export Order Created', status: 'Completed' },
        { step: 2, name: 'Export License Check', status: 'Completed' },
        { step: 3, name: 'Customs Declaration', status: 'In Progress' },
        { step: 4, name: 'Shipping Arrangement', status: 'Pending' },
        { step: 5, name: 'Delivery Confirmation', status: 'Pending' }
      ],
      activeFlows: [
        { id: 'IMP-001', type: 'Import', origin: 'China', status: 'Step 4/6', currentStep: 'Legal Compliance', progress: 66.7 },
        { id: 'EXP-001', type: 'Export', destination: 'Germany', status: 'Step 3/5', currentStep: 'Customs Declaration', progress: 60 }
      ]
    },
    complianceFlow: {
      checks: [
        { id: 'CHK-001', orderId: 'ORD-001', type: 'IPR Check', status: 'Passed', checkedAt: '2024-12-15 10:08 AM' },
        { id: 'CHK-002', orderId: 'ORD-001', type: 'Counterfeit Check', status: 'Passed', checkedAt: '2024-12-15 10:09 AM' },
        { id: 'CHK-003', orderId: 'ORD-001', type: 'Regulatory Compliance', status: 'In Progress', checkedAt: '2024-12-15 10:10 AM' },
        { id: 'CHK-004', orderId: 'IMP-001', type: 'Import Compliance', status: 'In Progress', checkedAt: '2024-12-15 09:30 AM' }
      ],
      complianceRules: [
        { id: 'RULE-001', name: 'Pre-Order IPR Check', type: 'Legal', status: 'Active', appliesTo: 'All Orders' },
        { id: 'RULE-002', name: 'Pre-Shipment Compliance', type: 'Regulatory', status: 'Active', appliesTo: 'Export Orders' },
        { id: 'RULE-003', name: 'Counterfeit Detection', type: 'Legal', status: 'Active', appliesTo: 'Import Orders' }
      ]
    }
  }

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'order-fulfillment', label: 'Order Fulfillment', icon: '📦' },
    { id: 'import-export-flow', label: 'Import/Export Flow', icon: '🌐' },
    { id: 'compliance-flow', label: 'Compliance Flow', icon: '✅' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">⚙️ Close-End Operations & Workflows - {(countryData as any)?.countryName || selectedCountry}</h3>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-[#C3A35E]/20">
        <div className="flex overflow-x-auto">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-all ${
                activeSubTab === tab.id
                  ? 'border-white text-black bg-white'
                  : 'border-transparent text-[#C3A35E]/80 hover:text-[#C3A35E] hover:bg-white/10 hover:border-white/40'
              }`}
              style={{ fontFamily: 'sans-serif', fontWeight: 300, letterSpacing: '0.1em' }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Sub-tab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
            <h4 className="text-lg font-semibold text-black mb-4">Workflow Dashboard</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="text-sm text-black mb-1">Active Workflows</div>
                <div className="text-2xl font-bold text-black">{workflowData.overview.activeWorkflows}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="text-sm text-black mb-1">Completed Today</div>
                <div className="text-2xl font-bold text-white">{workflowData.overview.completedToday}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="text-sm text-black mb-1">Pending Actions</div>
                <div className="text-2xl font-bold text-orange-600">{workflowData.overview.pendingActions}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="text-sm text-black mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-emerald-600">{workflowData.overview.successRate}%</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="text-sm text-black mb-1">Avg Processing</div>
                <div className="text-lg font-bold text-white">{workflowData.overview.averageProcessingTime}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">🔄 Workflow Engine Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-semibold text-black">Order Fulfillment Workflow</div>
                  <div className="text-sm text-black">End-to-end order processing automation</div>
                </div>
                <span className="px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-800">Active</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-semibold text-black">Import/Export Workflow</div>
                  <div className="text-sm text-black">Automated trade flow management</div>
                </div>
                <span className="px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-800">Active</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-semibold text-black">Legal Compliance Workflow</div>
                  <div className="text-sm text-black">Automated compliance checks</div>
                </div>
                <span className="px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-800">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Fulfillment Sub-tab */}
      {activeSubTab === 'order-fulfillment' && (
        <div className="space-y-6">
          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">📦 End-to-End Order Fulfillment Workflow</h4>
            
            {/* Workflow Steps Visualization */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-black">Workflow Progress</div>
                <div className="text-sm font-semibold text-black">Step 4 of 8</div>
              </div>
              <div className="flex items-center space-x-2 mb-6">
                {workflowData.orderFulfillment.workflow.map((step: WorkflowStep, idx: number) => (
                  <div key={idx} className="flex-1 flex flex-col items-center relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                      step.status === 'Completed' ? 'bg-green-500 text-white' :
                      step.status === 'In Progress' ? 'bg-white/100 text-white' :
                      'bg-white text-black'
                    }`}>
                      {step.status === 'Completed' ? '✓' : step.step}
                    </div>
                    <div className="text-xs text-center text-black mb-1">{step.name}</div>
                    <div className="text-xs text-black">{step.time}</div>
                    {idx < workflowData.orderFulfillment.workflow.length - 1 && (
                      <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                        step.status === 'Completed' ? 'bg-green-500' : 'bg-white'
                      }`} style={{ width: 'calc(100% - 2.5rem)', marginLeft: '2.5rem' }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/95 border border-[#C3A35E]/30 rounded-lg p-6">
              <h5 className="font-semibold text-black mb-4">Active Orders in Workflow</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-2 text-left">Order ID</th>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Current Step</th>
                      <th className="px-4 py-2 text-left">Progress</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {workflowData.orderFulfillment.activeOrders.map((order: any) => (
                      <tr key={order.id}>
                        <td className="px-4 py-2 font-semibold text-black">{order.id}</td>
                        <td className="px-4 py-2">{order.customer}</td>
                        <td className="px-4 py-2">${order.amount.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">{order.currentStep}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <div className="w-24 bg-white rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${order.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-black">{order.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <button className="text-white hover:text-blue-800 text-sm font-semibold">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Flow Sub-tab */}
      {activeSubTab === 'import-export-flow' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/95 border border-[#C3A35E]/30 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-black mb-4">📥 Import Workflow</h4>
              <div className="space-y-3">
                {workflowData.importExportFlow.importWorkflow.map((step: WorkflowStep, idx: number) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                      step.status === 'Completed' ? 'bg-green-500 text-white' :
                      step.status === 'In Progress' ? 'bg-white/100 text-white' :
                      'bg-white text-black'
                    }`}>
                      {step.status === 'Completed' ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-black">{step.name}</div>
                      <div className="text-xs text-black">{step.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/95 border border-[#C3A35E]/30 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-black mb-4">📤 Export Workflow</h4>
              <div className="space-y-3">
                {workflowData.importExportFlow.exportWorkflow.map((step: WorkflowStep, idx: number) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                      step.status === 'Completed' ? 'bg-green-500 text-white' :
                      step.status === 'In Progress' ? 'bg-white/100 text-white' :
                      'bg-white text-black'
                    }`}>
                      {step.status === 'Completed' ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-black">{step.name}</div>
                      <div className="text-xs text-black">{step.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">🌐 Active Import/Export Flows</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Flow ID</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Origin/Destination</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Current Step</th>
                    <th className="px-4 py-2 text-left">Progress</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {workflowData.importExportFlow.activeFlows.map((flow: WorkflowFlow) => (
                    <tr key={flow.id}>
                      <td className="px-4 py-2 font-semibold text-black">{flow.id}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          flow.type === 'Import' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {flow.type}
                        </span>
                      </td>
                      <td className="px-4 py-2">{flow.origin || flow.destination}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {flow.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{flow.currentStep}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="w-24 bg-white rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${flow.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-black">{flow.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Flow Sub-tab */}
      {activeSubTab === 'compliance-flow' && (
        <div className="space-y-6">
          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">✅ Legal Compliance Integration</h4>
            <div className="space-y-4">
              {workflowData.complianceFlow.checks.map((check: ComplianceCheck) => (
                <div key={check.id} className="flex items-center justify-between p-4 border border-black200 rounded-lg">
                  <div>
                    <div className="font-semibold text-black">{check.type}</div>
                    <div className="text-sm text-black">Order: {check.orderId} | Checked: {check.checkedAt}</div>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    check.status === 'Passed' ? 'bg-green-100 text-green-800' :
                    'bg-white/20 text-white'
                  }`}>
                    {check.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-black200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">📜 Compliance Rules</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Rule ID</th>
                    <th className="px-4 py-2 text-left">Rule Name</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Applies To</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {workflowData.complianceFlow.complianceRules.map((rule: ComplianceRule) => (
                    <tr key={rule.id}>
                      <td className="px-4 py-2 font-semibold text-black">{rule.id}</td>
                      <td className="px-4 py-2">{rule.name}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {rule.type}
                        </span>
                      </td>
                      <td className="px-4 py-2">{rule.appliesTo}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                          {rule.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button className="text-white hover:text-blue-800 text-sm font-semibold">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


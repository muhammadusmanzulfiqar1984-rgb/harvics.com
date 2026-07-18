import { DistributorOverview, DistributorPortal } from '@/types/distributor';
import { ManufacturerPortal } from '@/types/manufacturer';
import { LogisticsPortal } from '@/types/logistics';
import { RetailerPortal } from '@/types/retailer';
import { UserScope } from '@/types/userScope';

// API client for backend integration
// All requests go through Next.js on port 3000, which rewrites /api/* to backend on 4000
// This makes everything appear to run on port 3000
const isServer = typeof window === 'undefined';
const RAW_BASE_URL = isServer 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '') // Server: use Next.js port, rewrites handle proxying
  : ''; // Client: relative URL, uses same origin (port 3000)
const API_BASE_URL = `${RAW_BASE_URL}/api`

export interface ApiResponse<T> {
  data?: T
  error?: string
}

// Login response types
export interface LoginResponseData {
  success?: boolean
  token: string
  user: {
    username: string
    role: string
    scope: UserScope
  }
  error?: string
}

export interface LoginResult {
  data?: {
    token: string
    user: {
      username: string
      role: string
      scope: UserScope
    }
  }
  error?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private userScope: UserScope | null = null
  private backendStatus: 'loading' | 'ok' | 'error' = 'loading'

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      const storedScope = localStorage.getItem('user_scope')
      if (storedScope) {
        try {
          this.userScope = JSON.parse(storedScope)
        } catch {
          this.userScope = null
        }
      }
    }
  }

  setBackendStatus(status: 'loading' | 'ok' | 'error') {
    this.backendStatus = status
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (this.backendStatus === 'error' && endpoint !== '/health') {
      return { error: 'Service temporarily unavailable. Please try again later.' }
    }

    const headers = new Headers(options.headers)
    headers.set('Content-Type', 'application/json')

    // UNIFIED SYSTEM: Get current locale and send to backend
    // This ensures backend returns localized responses
    let clientLocale = 'en' // Default fallback
    try {
      if (typeof window !== 'undefined') {
        // Try to get from URL path first (most reliable)
        const pathSegments = window.location.pathname.split('/').filter(Boolean)
        if (pathSegments.length > 0) {
          const firstSegment = pathSegments[0]
          const validLocales = ['en', 'ar', 'es', 'fr', 'de', 'zh', 'hi', 'ur', 'pt', 'ru', 'it', 'tr', 'ja', 'ko', 'nl', 'pl', 'vi', 'th', 'id', 'ms', 'sw', 'uk', 'ro', 'cs', 'sv', 'da', 'fi', 'no', 'el', 'hu', 'bg', 'hr', 'sk', 'sr', 'bn', 'fa', 'ps', 'he']
          if (validLocales.includes(firstSegment)) {
            clientLocale = firstSegment
          }
        }
        
        // Fallback to localStorage/sessionStorage
        if (clientLocale === 'en') {
          const storedLocale = (localStorage.getItem('preferred_language') || 
                             sessionStorage.getItem('harvics_locale')) as string
          if (storedLocale && typeof storedLocale === 'string') {
            clientLocale = storedLocale
          }
        }
      }
    } catch (e) {
      console.warn('Error detecting locale in API client:', e)
    }
    
    // Send locale to backend via Accept-Language header (standard HTTP header)
    // Backend will use this to return localized content
    headers.set('Accept-Language', clientLocale)
    headers.set('X-Locale', clientLocale) // Custom header for explicit locale

    // Include token if available — always re-read from localStorage so demo tokens
    // set after module load are picked up correctly
    const activeToken = this.token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null)
    if (activeToken) {
      headers.set('Authorization', `Bearer ${activeToken}`)
    }

    // Include user scope in headers for backend filtering
    const activeScope = this.userScope || (typeof window !== 'undefined' ? (() => { try { const s = localStorage.getItem('user_scope'); return s ? JSON.parse(s) : null } catch { return null } })() : null)
    if (activeScope) {
      headers.set('X-User-Scope', JSON.stringify(activeScope))
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData: { error?: string; message?: string; code?: string } = { error: 'Request failed' };
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText || 'Request failed' };
        }

        // Handle expired token globally — clear session and redirect to portals
        if (response.status === 401 && errorData.code === 'TOKEN_EXPIRED') {
          this.clearToken()
          if (typeof window !== 'undefined') {
            const locale = window.location.pathname.split('/')[1] || 'en'
            window.location.href = `/${locale}/portals/?reason=session_expired`
          }
          return { error: 'Session expired. Please log in again.' }
        }

        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: Request failed`;
        return { error: errorMessage };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Network error: The server is unavailable. Please check your internet connection and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { error: errorMessage };
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  setUserScope(scope: UserScope) {
    this.userScope = scope
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_scope', JSON.stringify(scope))
    }
  }

  getUserScope() {
    return this.userScope
  }

  clearToken() {
    this.token = null
    this.userScope = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_scope')
    }
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<LoginResult> {
    const response = await this.request<LoginResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })

    // Handle backend response format: { success: true, token: "...", user: {...} }
    // The request method wraps it in { data: { success: true, token: "...", user: {...} } }
    const responseData = response.data as LoginResponseData | undefined;
    const token = responseData?.token;
    const user = responseData?.user;

    if (token) {
      this.setToken(token)
      if (user?.scope) {
        // Ensure geographic scope is set (create from legacy fields if needed)
        const scope = user.scope
        if (!scope.geographic) {
          // Create geographic scope from legacy countries/territories
          scope.geographic = {
            global: scope.role === 'admin' || scope.role === 'company',
            countries: scope.countries || [],
            territories: scope.territories || []
          }
        }
        this.setUserScope(scope)
      }
    } else if (responseData?.success === false || response.error) {
      // Backend returned error in response body or request failed
      return { error: responseData?.error || response.error || 'Login failed' }
    }

    // Return in expected format
    if (token && user) {
      return { data: { token, user } }
    }

    // If no token but no error, return the response as-is
    return response
  }

  async verifyToken() {
    const response = await this.request<{ valid: boolean; user: { username: string; role: string; scope: UserScope } | null }>('/auth/verify')
    if (response.data?.valid && response.data.user?.scope) {
      this.setUserScope(response.data.user.scope)
    }
    return response
  }

  // Home page public API
  async getHomePage(): Promise<ApiResponse<any>> {
    return this.request('/home')
  }

  // BFF (Backend for Frontend) endpoints - Level 2 Architecture
  async getBFFPayload<T>(persona: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/bff/${persona}`)
  }

  // Persona-specific portals
  async getDistributorPortal(): Promise<ApiResponse<DistributorPortal>> {
    return this.getBFFPayload('distributor')
  }

  async getDistributorOverview(): Promise<ApiResponse<DistributorOverview>> {
    return this.getBFFPayload('distributor/overview')
  }

  async getManufacturerPortal(): Promise<ApiResponse<ManufacturerPortal>> {
    return this.getBFFPayload('manufacturer')
  }

  async getLogisticsPortal(): Promise<ApiResponse<LogisticsPortal>> {
    return this.getBFFPayload('logistics')
  }

  async getRetailerPortal(): Promise<ApiResponse<RetailerPortal>> {
    return this.getBFFPayload('retailer')
  }

  async getSalesPortal() {
    return this.getBFFPayload('sales')
  }

  async getManagerCockpit() {
    return this.getBFFPayload('manager')
  }

  async getInvestorDashboard() {
    return this.getBFFPayload('investor')
  }

  async getCopilotData() {
    return this.getBFFPayload('copilot')
  }

  // Domain Services endpoints - Level 3 Architecture
  // These automatically filter based on user scope (distributor/supplier see only their data, admin sees all)
  async getDomainOrders(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/orders/overview${query}`)
  }

  async getDomainInventory(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/inventory/overview${query}`)
  }

  async getDomainLogistics(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/logistics/overview${query}`)
  }

  async getDomainFinance(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/finance/overview${query}`)
  }

  async getDomainCRM(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/crm/overview${query}`)
  }

  async getDomainHR(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/hr/overview${query}`)
  }

  async getDomainExecutive(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/executive/overview${query}`)
  }

  // Legal Domain endpoints
  async getDomainLegal(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/legal/overview${query}`)
  }

  async getDomainLegalIPR(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/legal/ipr${query}`)
  }

  async getDomainLegalCounterfeit(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/legal/counterfeit${query}`)
  }

  async getDomainLegalCompliance(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/legal/compliance${query}`)
  }

  async getDomainLegalContracts(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/legal/contracts${query}`)
  }

  async getDomainLegalLitigation(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/legal/litigation${query}`)
  }

  // Import/Export Domain endpoints
  async getDomainImportExport(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/import-export/overview${query}`)
  }

  async getDomainImportOrders(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/import-export/imports${query}`)
  }

  async getDomainExportOrders(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/import-export/exports${query}`)
  }

  async getDomainHSCodes(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/import-export/hs-codes${query}`)
  }

  async getDomainTradeDocuments(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/import-export/documents${query}`)
  }

  // GPS Domain endpoints - now correctly map to backend routes
  async getDomainGPS(countryCode?: string, includeAllCountries: boolean = false) {
    // Map to /gps/overview/:country endpoint
    if (!countryCode) countryCode = 'AE'; // Default country
    return this.request(`/gps/overview/${countryCode}`)
  }

  async getDomainGPSVehicles(countryCode?: string) {
    if (!countryCode) countryCode = 'AE';
    return this.request(`/gps/vehicles/${countryCode}`)
  }

  async getDomainGPSRoutes(countryCode?: string) {
    if (!countryCode) countryCode = 'AE';
    return this.request(`/gps/routes/${countryCode}`)
  }

  async getDomainGPSWarehouses(countryCode?: string) {
    if (!countryCode) countryCode = 'AE';
    return this.request(`/gps/warehouses/${countryCode}`)
  }

  async getDomainGPSRetailers(countryCode?: string) {
    if (!countryCode) countryCode = 'AE';
    return this.request(`/gps/retailers/${countryCode}`)
  }

  async getDomainGPSAnalytics(countryCode?: string) {
    if (!countryCode) countryCode = 'AE';
    return this.request(`/gps/analytics/${countryCode}`)
  }

  // Localization Domain endpoints
  async getDomainLocalization(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/localization/overview${query}`)
  }

  async getDomainCurrencies() {
    return this.request('/domains/localization/currencies')
  }

  async getDomainTaxConfiguration(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/localization/tax${query}`)
  }

  async getDomainBusinessRules(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/localization/business-rules${query}`)
  }

  async convertCurrency(amount: number, from: string, to: string) {
    return this.request('/domains/localization/convert-currency', {
      method: 'POST',
      body: JSON.stringify({ amount, from, to }),
    })
  }

  // Workflow Domain endpoints
  async getDomainWorkflow(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/workflow/overview${query}`)
  }

  async getDomainOrderFulfillmentWorkflow(orderId?: string, countryCode?: string) {
    const params = new URLSearchParams()
    if (orderId) params.append('orderId', orderId)
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/workflow/order-fulfillment${query}`)
  }

  async getDomainImportExportWorkflow(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/workflow/import-export${query}`)
  }

  async getDomainComplianceWorkflow(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/workflow/compliance${query}`)
  }

  // AI Copilot endpoints - Level 4 Architecture
  async getAICopilot() {
    return this.request('/dashboard/ai-copilot')
  }

  async sendCopilotMessage(message: string) {
    return this.request('/dashboard/ai-copilot', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  // Real GPS-Based Localization endpoints
  async getLocalizedData(countryCode: string) {
    return this.request(`/localization/realtime/${countryCode}`)
  }

  async getCountryFromGPS(latitude: number, longitude: number) {
    return this.request('/localization/gps-to-country', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    })
  }

  async getLocalizedDashboard(countryCode: string) {
    return this.request(`/localization/dashboard/${countryCode}`)
  }

  async getCountriesSummary() {
    return this.request('/localization/countries/summary')
  }

  async getLocalizationAnalysis(countryCode: string) {
    return this.request(`/localization/analysis/${countryCode}`)
  }

  async getCountryProfile(countryCode: string) {
    return this.request(`/localisation/country/${countryCode}`)
  }

  // Language & Localization endpoints
  async getSupportedLanguages() {
    return this.request('/localisation/languages')
  }

  async saveLanguagePreference(languageCode: string, countryCode?: string) {
    return this.request('/localisation/language-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ languageCode, countryCode })
    } as RequestInit)
  }

  async getTranslations(locale: string) {
    return this.request(`/localisation/translations/${locale}`)
  }

  // GPS endpoints
  async getGPSHeatmap(countryCode: string) {
    return this.request(`/gps/heatmap/${countryCode}`)
  }

  async getGPSPoints(countryCode: string) {
    return this.request(`/gps/points?countryCode=${countryCode}`)
  }

  async getGPSRetailers(countryCode: string) {
    return this.request(`/gps/retailers/${countryCode}`)
  }

  async addGPSRetailer(payload: {
    name: string
    latitude: number
    longitude: number
    countryCode: string
    address?: string
    phone?: string
    email?: string
  }) {
    return this.request('/gps/retailers', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  // Territory endpoints - fixed to use query params matching backend
  async getContinents() {
    return this.request('/territory/continents')
  }

  async getRegionals(continentCode: string) {
    // Backend uses query param: /territory/regions?continentCode=...
    return this.request(`/territory/regions?continentCode=${continentCode}`)
  }

  async getCountries(regionCode?: string, continentCode?: string) {
    // Backend uses query params: /territory/countries?regionCode=...&continentCode=...
    const params = new URLSearchParams()
    if (regionCode) params.append('regionCode', regionCode)
    if (continentCode) params.append('continentCode', continentCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/territory/countries${query}`)
  }

  async getCities(countryCode: string) {
    // Backend uses query param: /territory/cities?countryCode=...
    return this.request(`/territory/cities?countryCode=${countryCode}`)
  }

  async getDistricts(cityCode: string) {
    // Backend uses query param: /territory/districts?cityCode=...
    return this.request(`/territory/districts?cityCode=${cityCode}`)
  }

  async getAreas(districtCode: string) {
    // Backend uses query param: /territory/areas?districtCode=...
    return this.request(`/territory/areas?districtCode=${districtCode}`)
  }

  async getLocations(areaCode?: string, districtCode?: string) {
    // Backend uses query params: /territory/locations?areaCode=...&districtCode=...
    const params = new URLSearchParams()
    if (areaCode) params.append('areaCode', areaCode)
    if (districtCode) params.append('districtCode', districtCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/territory/locations${query}`)
  }

  async getTerritoryHierarchy(locationId: string) {
    // Backend uses: /territory/hierarchy/:locationId
    return this.request(`/territory/hierarchy/${locationId}`)
  }

  // Satellite Whitespace endpoints
  async getSatelliteWhitespace(countryCode: string) {
    return this.request(`/satellite/whitespaces/${countryCode}`)
  }

  // FMCG Supply Chain Graph endpoints
  async getSupplyChainGraph(countryCode: string) {
    return this.request(`/graph/${countryCode}`)
  }

  // Distributor Routes (from GPS module)
  async getDistributorRoutes(countryCode: string) {
    return this.request(`/gps/routes/${countryCode}`)
  }

  // Logistics CRUD endpoints
  async getLogisticsSummary() {
    return this.request('/logistics/summary')
  }

  async getLogisticsRoutes(filters?: { status?: string; driver?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.driver) params.append('driver', filters.driver)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/logistics/routes${query}`)
  }

  async createLogisticsRoute(payload: { origin: string; destination: string; driver?: string; vehicle?: string; distance?: number; orderId?: string }) {
    return this.request('/logistics/routes', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async updateLogisticsRouteStatus(routeId: string, status: string, reason?: string) {
    return this.request(`/logistics/routes/${routeId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    })
  }

  // Dashboard overview methods (used by useDashboardData)
  async getDashboardOverview() {
    return this.request('/domains/executive/overview')
  }

  async getInventory() {
    return this.request('/domains/inventory/overview')
  }

  async getTopProducts() {
    return this.request('/inventory/items?limit=10&sort=quantity')
  }

  async getProcurement() {
    return this.request('/domains/import-export/overview')
  }

  async getSales() {
    return this.request('/orders/summary')
  }

  async getDistribution() {
    return this.request('/domains/logistics/overview')
  }

  async getLogistics() {
    return this.request('/logistics/summary')
  }

  async getRetailers() {
    return this.request('/gps/retailers/AE')
  }

  async getPayments() {
    return this.request('/finance/summary')
  }

  async getAccounting() {
    return this.request('/finance/summary')
  }

  async getHR() {
    return this.request('/hr/summary')
  }

  async getTargets() {
    return this.request('/domains/executive/overview')
  }

  async getMarketing() {
    return this.request('/crm/summary')
  }

  async getMasterPL() {
    return this.request('/finance/summary')
  }

  // Company Dashboard
  async getCompanyDashboard(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters || {})
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/bff/company${query}`)
  }

  // Distributor methods
  async getDistributorProfile() {
    return this.request('/bff/distributor/profile')
  }

  async updateDistributorProfile(data: Record<string, unknown>) {
    return this.request('/bff/distributor/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getDistributorInvoices(filters?: Record<string, unknown>) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v != null) params.append(k, String(v)) })
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/bff/distributor/invoices${query}`)
  }

  async getDistributorOrders(filters?: Record<string, unknown>) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v != null) params.append(k, String(v)) })
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/bff/distributor/orders${query}`)
  }

  async getDistributorOrder(orderId: string) {
    return this.request(`/bff/distributor/orders/${orderId}`)
  }

  async createDistributorOrder(data: Record<string, unknown>) {
    return this.request('/bff/distributor/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getProducts() {
    return this.request('/inventory/items')
  }

  // Forex & Financial
  async getForexRates(baseCurrency: string) {
    return this.request(`/finance/forex?base=${baseCurrency}`)
  }

  async getStockPrice(symbol: string) {
    return this.request(`/finance/stock/${symbol}`)
  }

  async getLiveFinancialData() {
    return this.request('/finance/live')
  }

  // Maps & GPS
  async getEmployeesLocations() {
    return this.request('/gps/employees/locations')
  }

  async getRoutes(employeeId?: string, filters?: { start_date?: string; end_date?: string }) {
    const params = new URLSearchParams()
    if (employeeId) params.append('employeeId', employeeId)
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/gps/routes/AE${query}`)
  }

  // Legal / Trademarks
  async getTrademarks(filters?: { country?: string; status?: string }) {
    const params = new URLSearchParams()
    if (filters?.country) params.append('country', filters.country)
    if (filters?.status) params.append('status', filters.status)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/legal/trademarks${query}`)
  }

  async updateTrademark(id: string, data: Record<string, unknown>) {
    return this.request(`/domains/legal/trademarks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async createTrademark(data: Record<string, unknown>) {
    return this.request('/domains/legal/trademarks', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Import/Export orders
  async getImportOrder(orderId: string) {
    return this.request(`/domains/import-export/imports/${orderId}`)
  }

  // Enterprise CRM methods
  async getAIStrategy(countryCode: string) {
    return this.request(`/intelligence/recommendations/orders?country=${countryCode}`)
  }

  async getTradeFlows(countryCode: string) {
    return this.request(`/domains/import-export/overview?countryCode=${countryCode}`)
  }

  async getProcurementMap(countryCode: string) {
    return this.request(`/domains/import-export/overview?countryCode=${countryCode}`)
  }

  async getGraphSnapshot(countryCode: string) {
    return this.request(`/graph/${countryCode}`)
  }

  async getGPSRoutes(countryCode: string) {
    return this.request(`/gps/routes/${countryCode}`)
  }

  async getSatelliteWhitespaces(countryCode: string) {
    return this.request(`/satellite/whitespaces/${countryCode}`)
  }

  async getDataOceanSummary(countryCode: string) {
    return this.request(`/domains/executive/overview?countryCode=${countryCode}`)
  }

  async getDataOceanFlows(countryCode: string) {
    return this.request(`/domains/logistics/overview?countryCode=${countryCode}`)
  }

  // Territory extended
  async getTerritoryPath(locationId: string) {
    return this.request(`/territory/hierarchy/${locationId}`)
  }

  async getStreets(districtCode: string) {
    return this.request(`/territory/areas?districtCode=${districtCode}`)
  }

  async getPoints(areaCode: string) {
    return this.request(`/territory/locations?areaCode=${areaCode}`)
  }
}

const apiClient = new ApiClient(API_BASE_URL)

export { apiClient }
export default apiClient

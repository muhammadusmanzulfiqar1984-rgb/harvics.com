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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (this.backendStatus === 'error' && endpoint !== '/health') {
      return { error: 'Backend is offline. Please try again later.' }
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

    // Include token if available (optional for some endpoints like chatbot)
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }

    // Include user scope in headers for backend filtering
    if (this.userScope) {
      headers.set('X-User-Scope', JSON.stringify(this.userScope))
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData: { error?: string; message?: string } = { error: 'Request failed' };
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText || 'Request failed' };
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

  // GPS Domain endpoints
  async getDomainGPS(countryCode?: string, includeAllCountries: boolean = false) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    if (includeAllCountries) params.append('includeAllCountries', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/gps/overview${query}`)
  }

  async getDomainGPSVehicles(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/gps/vehicles${query}`)
  }

  async getDomainGPSRoutes(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/gps/routes${query}`)
  }

  async getDomainGPSWarehouses(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/gps/warehouses${query}`)
  }

  async getDomainGPSRetailers(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/gps/retailers${query}`)
  }

  async getDomainGPSAnalytics(countryCode?: string) {
    const params = new URLSearchParams()
    if (countryCode) params.append('countryCode', countryCode)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/domains/gps/analytics${query}`)
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

  // Territory endpoints
  async getContinents() {
    return this.request('/territory/continents')
  }

  async getRegionals(continentId: string) {
    return this.request(`/territory/continent/${continentId}/regionals`)
  }

  async getCountries(regionalId: string) {
    return this.request(`/territory/regional/${regionalId}/countries`)
  }

  async getCities(countryId: string) {
    return this.request(`/territory/country/${countryId}/cities`)
  }

  async getDistricts(cityId: string) {
    return this.request(`/territory/city/${cityId}/districts`)
  }

  async getStreets(districtId: string) {
    return this.request(`/territory/district/${districtId}/streets`)
  }

  async getPoints(streetId: string) {
    return this.request(`/territory/street/${streetId}/points`)
  }

  async getTerritoryPath(pointId: string) {
    return this.request(`/territory/point/${pointId}/path`)
  }
}

const apiClient = new ApiClient(API_BASE_URL)

export { apiClient }
export default apiClient

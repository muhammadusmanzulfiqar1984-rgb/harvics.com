/** Module #12 — Distributor portal API helpers */

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

export async function dpFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) }, cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  return json as T
}

export async function fetchSalesOrders(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : ''
  const j = await dpFetch<{ data: any[] }>(`/api/wave5/sales-orders${q}`)
  return j.data || []
}

export async function createSalesOrder(body: {
  customerName: string
  customerId?: string
  paymentTerms?: string
  notes?: string
  lines: Array<{ sku: string; description?: string; quantity: number; unitPrice: number }>
}) {
  return dpFetch<{ data: any }>('/api/wave5/sales-orders', { method: 'POST', body: JSON.stringify(body) })
}

export async function fetchArInvoices() {
  const j = await dpFetch<{ data: any[] }>('/api/finance/invoices?type=AR&limit=200')
  return j.data || []
}

export async function fetchCreditLimits() {
  const j = await dpFetch<{ data: any[] }>('/api/crm/credit-limits')
  return j.data || []
}

export async function fetchInventoryProducts(limit = 100) {
  const j = await dpFetch<{ data: any[] }>(`/api/inventory?limit=${limit}`)
  const rows = j.data
  return Array.isArray(rows) ? rows : (rows as any)?.data ?? []
}

export async function fetchPriceForSku(sku: string) {
  try {
    const j = await dpFetch<{ data?: { unitPrice?: number } }>(`/api/wave5/price-lists/lookup?sku=${encodeURIComponent(sku)}&qty=1`)
    return j.data?.unitPrice
  } catch {
    return undefined
  }
}

export async function fetchTerritories() {
  try {
    const j = await dpFetch<{ data: any[] }>('/api/wave3/territory/assignments?limit=200')
    return j.data || []
  } catch {
    return []
  }
}

export async function fetchDocuments(category = 'Distributor') {
  try {
    const j = await dpFetch<{ data: any[] }>(`/api/v2/documents?limit=200`)
    const rows = j.data || []
    return rows.filter((d) => !category || String(d.category || '').toLowerCase().includes(category.toLowerCase()))
  } catch {
    return []
  }
}

export const CART_STORAGE_KEY = 'harvics_distributor_cart'

export type CartLine = { sku: string; name: string; packSize: string; cartonSize: number; unitPrice: number; quantity: number }

export function loadCart(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveCart(cart: CartLine[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

export function clearCart() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_STORAGE_KEY)
}

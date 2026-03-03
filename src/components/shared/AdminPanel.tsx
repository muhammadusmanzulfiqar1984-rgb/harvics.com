'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'

interface AdminPanelProps {
  selectedCountry: string
  countryData: any
}

export default function AdminPanel({ selectedCountry, countryData }: AdminPanelProps) {
  const t = useTranslations('crm')
  const [activeSection, setActiveSection] = useState<'payments' | 'api-keys' | 'countries' | 'tax' | 'competitors' | 'pricing' | 'market-data' | 'diagnostics'>('payments')
  const [paymentConfig, setPaymentConfig] = useState<any>({})
  const [taxConfig, setTaxConfig] = useState<any>(countryData?.tax || { vat: 0, gst: 0, importDuty: 0 })

  // Payment Gateways Setup
  const PaymentGatewaysSection = () => {
    const connectors = countryData?.integrations?.payments?.connectors || []
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-black">💳 Payment Gateways Setup - {countryData?.countryName || selectedCountry}</h3>
        
        <div className="bg-white border border-black200 rounded-lg p-6">
          <div className="space-y-4">
            {connectors.map((connector: any, idx: number) => (
              <div key={idx} className="border border-black200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-black">{connector.name}</h4>
                    <p className="text-sm text-black">Code: {connector.code}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={connector.status === 'active'}
                      onChange={() => {
                        // Toggle status
                        console.log(`Toggle ${connector.name}`)
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">API Key</label>
                    <input
                      type="password"
                      placeholder="Enter API key..."
                      className="w-full px-3 py-2 border border-black300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Environment</label>
                    <select className="w-full px-3 py-2 border border-black300 rounded-lg text-sm">
                      <option value="sandbox">Sandbox</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>
                
                <button className="mt-4 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90">
                  Test Connection
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // API Key Management
  const APIKeysSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-black">🔑 API Key Management</h3>
      <div className="bg-white border border-black200 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-black200 pb-4">
            <div>
              <h4 className="font-semibold text-black">Backend API Key</h4>
              <p className="text-sm text-black">For external integrations</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                Generate New
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700">
                Revoke
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between border-b border-black200 pb-4">
            <div>
              <h4 className="font-semibold text-black">Frontend API Key</h4>
              <p className="text-sm text-black">For client-side access</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                Generate New
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-black">GPS/Satellite API Key</h4>
              <p className="text-sm text-black">For location services</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                Generate New
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Country Management
  const CountryManagementSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-black">🌍 Country Management</h3>
      <div className="bg-white border border-black200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-black">Active Countries</h4>
          <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90">
            + Add Country
          </button>
        </div>
        <div className="space-y-2">
          {['pakistan', 'united-states', 'uae', 'india', 'china'].map((country, idx) => (
            <div key={idx} className="flex items-center justify-between border border-black200 rounded-lg p-3">
              <span className="font-medium text-black">{country.charAt(0).toUpperCase() + country.slice(1).replace('-', ' ')}</span>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:underline text-sm">Edit</button>
                <button className="text-red-600 hover:underline text-sm">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Tax Models Editor
  const TaxModelsSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-black">📊 Tax Models Editor - {countryData?.countryName || selectedCountry}</h3>
      <div className="bg-white border border-black200 rounded-lg p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">VAT (%)</label>
            <input
              type="number"
              value={taxConfig.vat || 0}
              onChange={(e) => setTaxConfig({ ...taxConfig, vat: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-black300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">GST (%)</label>
            <input
              type="number"
              value={taxConfig.gst || 0}
              onChange={(e) => setTaxConfig({ ...taxConfig, gst: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-black300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Import Duty (%)</label>
            <input
              type="number"
              value={taxConfig.importDuty || 0}
              onChange={(e) => setTaxConfig({ ...taxConfig, importDuty: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-black300 rounded-lg"
            />
          </div>
        </div>
        <button className="mt-4 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-white/90">
          Save Tax Configuration
        </button>
      </div>
    </div>
  )

  // Competitor Set Editor
  const CompetitorSetEditor = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-black">🏆 Competitor Set Editor - {countryData?.countryName || selectedCountry}</h3>
      <div className="bg-white border border-black200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-black">Competitors</h4>
          <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90">
            + Add Competitor
          </button>
        </div>
        <div className="space-y-2">
          {['Competitor A', 'Competitor B', 'Competitor C'].map((comp, idx) => (
            <div key={idx} className="flex items-center justify-between border border-black200 rounded-lg p-3">
              <span className="font-medium text-black">{comp}</span>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:underline text-sm">Edit</button>
                <button className="text-red-600 hover:underline text-sm">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Pricing Structure Editor
  const PricingStructureEditor = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-black">💰 Pricing Structure Editor - {countryData?.countryName || selectedCountry}</h3>
      <div className="bg-white border border-black200 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Price Band</label>
            <select className="w-full px-3 py-2 border border-black300 rounded-lg">
              <option value="premium">Premium</option>
              <option value="standard">Standard</option>
              <option value="economy">Economy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">SKU Structure</label>
            <textarea
              placeholder="Enter SKU structure (JSON format)..."
              className="w-full px-3 py-2 border border-black300 rounded-lg h-32"
            />
          </div>
          <button className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-white/90">
            Save Pricing Structure
          </button>
        </div>
      </div>
    </div>
  )

  // Market Data Upload
  const MarketDataUpload = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-black">📤 Market Data Upload - {countryData?.countryName || selectedCountry}</h3>
      <div className="bg-white border border-black200 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Upload CSV File</label>
            <input
              type="file"
              accept=".csv"
              className="w-full px-3 py-2 border border-black300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Or API Hook</label>
            <input
              type="text"
              placeholder="Enter API endpoint..."
              className="w-full px-3 py-2 border border-black300 rounded-lg"
            />
          </div>
          <button className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-white/90">
            Upload Market Data
          </button>
        </div>
      </div>
    </div>
  )

  // System Diagnostics
  const SystemDiagnostics = () => {
    const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null)
    const [running, setRunning] = useState(false)

    const runDiagnostics = async () => {
      setRunning(true)
      // Simulate running diagnostics
      setTimeout(() => {
        setDiagnosticsResult({
          backend: { status: 'OK', responseTime: '45ms' },
          frontend: { status: 'OK', errors: 0 },
          database: { status: 'OK', queries: '250ms avg' },
          integrations: { active: 5, failed: 0 }
        })
        setRunning(false)
      }, 2000)
    }

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-black">🔧 Quick Check System Diagnostics</h3>
        <div className="bg-white border border-black200 rounded-lg p-6">
          <button
            onClick={runDiagnostics}
            disabled={running}
            className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? 'Running Diagnostics...' : 'Run System Diagnostics'}
          </button>
          
          {diagnosticsResult && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-black mb-1">Backend Status</div>
                  <div className="text-lg font-bold text-green-600">{diagnosticsResult.backend.status}</div>
                  <div className="text-xs text-black">Response: {diagnosticsResult.backend.responseTime}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-black mb-1">Frontend Status</div>
                  <div className="text-lg font-bold text-green-600">{diagnosticsResult.frontend.status}</div>
                  <div className="text-xs text-black">Errors: {diagnosticsResult.frontend.errors}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-black mb-1">Database Status</div>
                  <div className="text-lg font-bold text-green-600">{diagnosticsResult.database.status}</div>
                  <div className="text-xs text-black">Queries: {diagnosticsResult.database.queries}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-black mb-1">Integrations</div>
                  <div className="text-lg font-bold text-green-600">{diagnosticsResult.integrations.active} Active</div>
                  <div className="text-xs text-black">Failed: {diagnosticsResult.integrations.failed}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const sections = [
    { id: 'payments' as const, label: '💳 Payment Gateways', icon: '💳' },
    { id: 'api-keys' as const, label: '🔑 API Keys', icon: '🔑' },
    { id: 'countries' as const, label: '🌍 Countries', icon: '🌍' },
    { id: 'tax' as const, label: '📊 Tax Models', icon: '📊' },
    { id: 'competitors' as const, label: '🏆 Competitors', icon: '🏆' },
    { id: 'pricing' as const, label: '💰 Pricing', icon: '💰' },
    { id: 'market-data' as const, label: '📤 Market Data', icon: '📤' },
    { id: 'diagnostics' as const, label: '🔧 Diagnostics', icon: '🔧' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">⚙️ Admin Panel</h3>
        <div className="text-sm text-black">
          <strong>Country:</strong> {countryData?.countryName || selectedCountry}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="border-b border-black200 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                activeSection === section.id
                  ? 'border-b-2 border-white text-black'
                  : 'text-black hover:text-black'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div>
        {activeSection === 'payments' && <PaymentGatewaysSection />}
        {activeSection === 'api-keys' && <APIKeysSection />}
        {activeSection === 'countries' && <CountryManagementSection />}
        {activeSection === 'tax' && <TaxModelsSection />}
        {activeSection === 'competitors' && <CompetitorSetEditor />}
        {activeSection === 'pricing' && <PricingStructureEditor />}
        {activeSection === 'market-data' && <MarketDataUpload />}
        {activeSection === 'diagnostics' && <SystemDiagnostics />}
      </div>
    </div>
  )
}


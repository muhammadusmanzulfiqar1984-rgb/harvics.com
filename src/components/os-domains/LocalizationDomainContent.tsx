'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import KPICard from '@/components/shared/KPICard'

interface LocalizationDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 1.08 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 1.27 },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', rate: 0.0036 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 0.27 },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rate: 0.27 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 0.14 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 0.012 }
]

const localizationData = {
  overview: { activeCountries: 42, supportedCurrencies: 25, taxConfigurations: 38, businessRules: 156, lastSync: '2024-12-15 10:30 AM' },
  taxConfigurations: [
    { country: 'UAE', vat: 5, gst: 0, importDuty: 5, status: 'Active' },
    { country: 'United States', vat: 0, gst: 0, importDuty: 2.5, status: 'Active' },
    { country: 'United Kingdom', vat: 20, gst: 0, importDuty: 0, status: 'Active' },
    { country: 'Pakistan', vat: 0, gst: 17, importDuty: 10, status: 'Active' }
  ],
  businessRules: [
    { id: 'BR-001', name: 'Minimum Order Value', value: '$100', type: 'Order', country: 'UAE', status: 'Active' },
    { id: 'BR-002', name: 'Payment Terms', value: 'Net 30', type: 'Payment', country: 'UAE', status: 'Active' },
    { id: 'BR-003', name: 'Working Days', value: 'Sun-Thu', type: 'Business', country: 'UAE', status: 'Active' },
    { id: 'BR-004', name: 'Minimum Order Value', value: '$50', type: 'Order', country: 'United States', status: 'Active' },
    { id: 'BR-005', name: 'Payment Terms', value: 'Net 15', type: 'Payment', country: 'United States', status: 'Active' }
  ]
}

function LocalizationOverviewScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Active Countries" value={localizationData.overview.activeCountries} icon="" />
        <KPICard label="Supported Currencies" value={localizationData.overview.supportedCurrencies} icon="" />
        <KPICard label="Tax Configurations" value={localizationData.overview.taxConfigurations} icon="" />
        <KPICard label="Business Rules" value={localizationData.overview.businessRules} icon="" />
      </div>
      <div className="bg-[#F5F5F7] border-l-4 border-[#E5E5EA] p-4" style={{ borderRadius: 0 }}>
        <div className="text-sm text-[#8E8E93]">Last Synchronization</div>
        <div className="text-lg font-semibold text-[#1A1A1A]">{localizationData.overview.lastSync}</div>
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">8-Level Geographic Hierarchy</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Global', 'Region', 'Country', 'City', 'District', 'Area', 'Zone', 'Location'].map((level, i) => (
            <div key={level} className="p-4 bg-[#F5F5F7] border border-[#E5E5EA]/20" style={{ borderRadius: 0 }}>
              <div className="text-xs font-semibold text-[#1A1A1A]/50 uppercase">Level {i + 1}</div>
              <div className="text-lg font-semibold text-[#1A1A1A]">{level}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MultiCurrencyScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Exchange Rates</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Currency</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Code</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Symbol</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Rate (vs USD)</th>
            </tr></thead>
            <tbody>
              {currencies.map((c, i) => (
                <tr key={c.code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{c.name}</td>
                  <td className="px-4 py-3 font-mono">{c.code}</td>
                  <td className="px-4 py-3 text-center">{c.symbol}</td>
                  <td className="px-4 py-3 text-right">{c.rate.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TaxConfigScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Country Tax Configurations</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Country</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">VAT (%)</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">GST (%)</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Import Duty (%)</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
            </tr></thead>
            <tbody>
              {localizationData.taxConfigurations.map((t, i) => (
                <tr key={t.country} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{t.country}</td>
                  <td className="px-4 py-3 text-right">{t.vat}%</td>
                  <td className="px-4 py-3 text-right">{t.gst}%</td>
                  <td className="px-4 py-3 text-right">{t.importDuty}%</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BusinessRulesScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Country-Specific Business Rules</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Rule ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Country</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Value</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Type</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
            </tr></thead>
            <tbody>
              {localizationData.businessRules.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.id}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.country}</td>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.value}</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{r.type}</span></td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function LocalizationDomainContent({ persona, locale }: LocalizationDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    { id: 'loc-overview', label: 'Localization Dashboard', icon: '', description: 'Country configs, geographic hierarchy, and sync status', component: <LocalizationOverviewScreen />, tier3Screens: [{ id: 'overview', label: 'Dashboard', icon: '', component: <LocalizationOverviewScreen /> }] },
    { id: 'multi-currency', label: 'Multi-Currency', icon: '', description: 'Exchange rates, currency converter, and conversion history', component: <MultiCurrencyScreen />, tier3Screens: [{ id: 'rates', label: 'Exchange Rates', icon: '', component: <MultiCurrencyScreen /> }] },
    { id: 'tax-config', label: 'Tax Configuration', icon: '', description: 'Country-specific VAT, GST, import duty, and sales tax rates', component: <TaxConfigScreen />, tier3Screens: [{ id: 'taxes', label: 'Tax Rates', icon: '', component: <TaxConfigScreen /> }] },
    { id: 'business-rules', label: 'Business Rules', icon: '', description: 'Country-specific order rules, payment terms, and operational configs', component: <BusinessRulesScreen />, tier3Screens: [{ id: 'rules', label: 'Rules', icon: '', component: <BusinessRulesScreen /> }] }
  ]

  return (
    <OSDomainTierStructure
      domainId="localization"
      domainName="Advanced Localization OS"
      tier2Modules={tier2Modules}
      defaultModule="loc-overview"
    />
  )
}

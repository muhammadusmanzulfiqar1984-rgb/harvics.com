'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'

export default function Profile() {
  const locale = useLocale()
  const [formData, setFormData] = useState({
    companyName: 'Costco West',
    legalEntityName: 'Costco West Distributors LLC',
    taxId: 'TAX-123456',
    vat: 'VAT-789012',
    country: 'United States',
    headOfficeAddress: '123 Business Street, Los Angeles, CA 90001',
    primaryContact: {
      name: 'John Doe',
      phone: '+1 555-0123',
      email: 'john.doe@costcowest.com'
    },
    warehouses: [
      { id: 1, address: '456 Warehouse Lane, Los Angeles, CA 90002' },
      { id: 2, address: '789 Storage Ave, San Francisco, CA 94102' }
    ]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Profile updated successfully!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#C3A35E]">Profile</h1>

      <div className="bg-white rounded-lg border border-black200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Company Name *</label>
              <input
                required
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Legal Entity Name *</label>
              <input
                required
                type="text"
                value={formData.legalEntityName}
                onChange={(e) => setFormData({...formData, legalEntityName: e.target.value})}
                className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Tax ID / VAT</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
                placeholder="Tax ID"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">VAT Number</label>
              <input
                type="text"
                value={formData.vat}
                onChange={(e) => setFormData({...formData, vat: e.target.value})}
                className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
                placeholder="VAT"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Country *</label>
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
              >
                <option value="United States">United States</option>
                <option value="Pakistan">Pakistan</option>
                <option value="UAE">UAE</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Head Office Address *</label>
              <textarea
                required
                rows={3}
                value={formData.headOfficeAddress}
                onChange={(e) => setFormData({...formData, headOfficeAddress: e.target.value})}
                className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="md:col-span-2 border-t border-black200 pt-6">
              <h3 className="text-lg font-bold text-[#C3A35E] mb-4">Primary Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.primaryContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      primaryContact: {...formData.primaryContact, name: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Phone *</label>
                  <input
                    required
                    type="tel"
                    value={formData.primaryContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      primaryContact: {...formData.primaryContact, phone: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.primaryContact.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      primaryContact: {...formData.primaryContact, email: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 border-t border-black200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#C3A35E]/90">Warehouse Addresses</h3>
                <button
                  type="button"
                  className="text-white hover:underline font-semibold"
                >
                  + Add Warehouse
                </button>
              </div>
              <div className="space-y-3">
                {formData.warehouses.map((warehouse, index) => (
                  <div key={warehouse.id} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={warehouse.address}
                      onChange={(e) => {
                        const newWarehouses = [...formData.warehouses]
                        newWarehouses[index].address = e.target.value
                        setFormData({...formData, warehouses: newWarehouses})
                      }}
                      className="flex-1 px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          warehouses: formData.warehouses.filter(w => w.id !== warehouse.id)
                        })
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-white text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="bg-white text-[#C3A35E]/90 px-8 py-3 rounded-lg font-semibold hover:bg-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


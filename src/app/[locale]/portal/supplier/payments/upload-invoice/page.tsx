'use client'

/**
 * Supplier Portal - Upload Invoice Page
 * Suppliers upload invoices for approval
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import AuthGuard from '@/components/shared/AuthGuard'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import SectionCard from '@/components/shared/SectionCard'
import paymentApi from '@/lib/api-payments'

export default function UploadInvoicePage() {
  const locale = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    amount: '',
    currency: 'USD',
    dueDate: '',
    pdfFile: null as File | null
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB')
        return
      }
      setFormData(prev => ({ ...prev, pdfFile: file }))
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!formData.invoiceNumber || !formData.amount || !formData.pdfFile) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // TODO: Upload PDF file to server and get URL
      // For now, using a placeholder URL
      const pdfUrl = '/uploads/invoices/' + formData.pdfFile.name

      const result = await paymentApi.uploadSupplierInvoice({
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        dueDate: formData.dueDate || undefined,
        pdfUrl
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/${locale}/portal/supplier/payments/payment-status`)
        }, 2000)
      } else {
        setError(result.error || 'Failed to upload invoice')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard allowedRoles={['supplier']}>
      <OSDomainPageWrapper
        title="Upload Invoice"
        description="Upload your invoice for payment processing"
        domain="finance"
        portal="supplier"
      >
        <div className="space-y-6">
          <SectionCard
            title="Upload Invoice"
            subtitle="Submit your invoice for approval and payment"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div className="p-4 bg-green-100 border border-green-300 rounded text-green-800">
                  Invoice uploaded successfully! Redirecting...
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-100 border border-red-300 rounded text-red-800">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Invoice Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-black200 text-black focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
                    placeholder="INV-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Invoice Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-black200 text-black focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Amount <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-black200 text-black focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Currency <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-black200 text-black focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="PKR">PKR (₨)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-black200 text-black focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Invoice PDF <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                    className="w-full px-3 py-2 border border-black200 text-black focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
                  />
                  <p className="text-xs text-black/70 mt-1">
                    Maximum file size: 10MB. PDF format only.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-black100">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#F5C542] text-white font-medium rounded hover:bg-[#F5C542]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Uploading...' : 'Upload Invoice'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-black200 text-black font-medium rounded hover:bg-[#F2F2F2] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      </OSDomainPageWrapper>
    </AuthGuard>
  )
}


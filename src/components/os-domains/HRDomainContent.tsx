'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import EmployeeListContent from '@/components/domains/hr/EmployeeListContent'
import PayrollProcessingContent from '@/components/domains/hr/PayrollProcessingContent'
import PerformanceReviewsContent from '@/components/domains/hr/PerformanceReviewsContent'

interface HRDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function HRDomainContent({ persona, locale }: HRDomainContentProps) {
  // Tier 2 Modules for HR Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'employee-master',
      label: 'Employee Master',
      icon: '👔',
      description: 'Employee records, organizational structure, and employee database',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              👔 Employee Master
            </h3>
            <p className="text-black">Employee records, organizational structure, and employee database</p>
          </div>
        </div>
      ),
      tier3Screens: [
        {
          id: 'employee-list',
          label: 'Employee List',
          icon: '📋',
          component: <EmployeeListContent persona={persona} locale={locale} />
        },
        {
          id: 'employee-details',
          label: 'Employee Details',
          icon: '👤',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Employee Details</h3><p>Detailed employee profiles and information</p></div>
        },
        {
          id: 'org-chart',
          label: 'Organization Chart',
          icon: '🏢',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Organization Chart</h3><p>Visual organizational hierarchy and structure</p></div>
        }
      ]
    },
    {
      id: 'payroll',
      label: 'Payroll & Incentives',
      icon: '💰',
      description: 'Salary processing, bonuses, commissions, and incentive calculations',
      tier3Screens: [
        {
          id: 'payroll-processing',
          label: 'Payroll Processing',
          icon: '💳',
          component: <PayrollProcessingContent persona={persona} locale={locale} />
        },
        {
          id: 'salary-reports',
          label: 'Salary Reports',
          icon: '📊',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Salary Reports</h3><p>Payroll summaries and salary analytics</p></div>
        },
        {
          id: 'payroll-history',
          label: 'Payroll History',
          icon: '📜',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Payroll History</h3><p>Historical payroll records and transactions</p></div>
        }
      ]
    },
    {
      id: 'performance',
      label: 'Performance Tracking',
      icon: '📈',
      description: 'KPI tracking, performance reviews, and employee assessments',
      tier3Screens: [
        {
          id: 'performance-reviews',
          label: 'Performance Reviews',
          icon: '📝',
          component: <PerformanceReviewsContent persona={persona} locale={locale} />
        },
        {
          id: 'kpi-dashboard',
          label: 'KPI Dashboard',
          icon: '📊',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">KPI Dashboard</h3><p>Key performance indicators for employees</p></div>
        },
        {
          id: 'assessments',
          label: 'Assessments',
          icon: '✅',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Assessments</h3><p>Employee assessment and evaluation forms</p></div>
        }
      ]
    }
  ]

  return (
    <OSDomainTierStructure
      domainId="hr"
      domainName="HR OS"
      tier2Modules={tier2Modules}
      defaultModule="employee-master"
    />
  )
}


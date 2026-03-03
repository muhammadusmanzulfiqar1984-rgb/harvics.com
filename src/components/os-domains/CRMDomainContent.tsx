'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import CustomerListContent from '@/components/domains/crm/CustomerListContent'

interface CRMDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function CRMDomainContent({ persona, locale }: CRMDomainContentProps) {
  const t = useTranslations('crm.domain')
  
  // Tier 2 Modules for CRM Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'customer-360',
      label: t('customer360.title'),
      icon: '👥',
      description: t('customer360.description'),
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              👥 {t('customer360.title')}
            </h3>
            <p className="text-black">{t('customer360.description')}</p>
          </div>
          <CustomerListContent persona={persona} locale={locale} />
        </div>
      ),
      tier3Screens: [
        {
          id: 'customer-list',
          label: 'Customer List',
          icon: '📋',
          component: <CustomerListContent persona={persona} locale={locale} />
        },
        {
          id: 'customer-analytics',
          label: 'Customer Analytics',
          icon: '📊',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Customer Analytics</h3><p>Customer insights and segmentation</p></div>
        }
      ]
    },
    {
      id: 'campaigns',
      label: t('campaigns.title'),
      icon: '📢',
      description: t('campaigns.description')
    },
    {
      id: 'leads',
      label: t('leads.title'),
      icon: '🎯',
      description: t('leads.description')
    },
    {
      id: 'support',
      label: t('support.title'),
      icon: '🎧',
      description: t('support.description')
    },
    {
      id: 'loyalty',
      label: t('loyalty.title'),
      icon: '🎁',
      description: t('loyalty.description')
    }
  ]

  return (
    <OSDomainTierStructure
      domainId="crm"
      domainName={t('title')}
      tier2Modules={tier2Modules}
      defaultModule="customer-360"
    />
  )
}


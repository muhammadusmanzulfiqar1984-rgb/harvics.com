'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface ServiceInfo {
  id: string
  title: string
  description: string
  icon: string
  link?: string
}

interface ServiceInfoBannerProps {
  services?: ServiceInfo[]
}

const ServiceInfoBanner: React.FC<ServiceInfoBannerProps> = ({ services }) => {
  const t = useTranslations('footer')

  // Default services if none provided
  const defaultServices: ServiceInfo[] = [
    {
      id: 'global-shipping',
      title: t('feature1Title'),
      description: t('feature1Desc'),
      icon: 'shopping-bag',
      link: '/contact'
    },
    {
      id: 'premium-quality',
      title: t('feature2Title'),
      description: t('feature2Desc'),
      icon: 'delivery-van',
      link: '/products'
    },
    {
      id: 'expert-support',
      title: t('feature3Title'),
      description: t('feature3Desc'),
      icon: 'return-arrow',
      link: '/contact'
    }
  ]

  const displayServices = services || defaultServices

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shopping-bag':
        return (
          <svg className="w-8 h-8" fill="none" stroke="#C3A35E" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        )
      case 'delivery-van':
        return (
          <svg className="w-8 h-8" fill="none" stroke="#C3A35E" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'return-arrow':
        return (
          <svg className="w-8 h-8" fill="none" stroke="#C3A35E" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ background: '#F5F1E8', borderBottom: '1px solid rgba(195,163,94,0.3)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center divide-x divide-[#C3A35E]/20 py-4">
          {displayServices.map((service, index) => {
            const content = (
              <div className="flex items-center space-x-3 px-6">
                <div style={{ color: '#C3A35E' }}>
                  {getIcon(service.icon)}
                </div>
                <div>
                  <div className="text-sm font-ui-semibold" style={{ color: '#6B1F2B' }}>{service.title}</div>
                  <div className="text-xs font-ui" style={{ color: '#6B1F2B', opacity: 0.6 }}>{service.description}</div>
                </div>
              </div>
            )

            if (service.link) {
              return (
                <Link
                  key={service.id}
                  href={service.link}
                  className="hover:bg-[#C3A35E]/10 transition-all duration-200 first:pl-0 last:pr-0 group"
                >
                  {content}
                </Link>
              )
            }

            return (
              <div key={service.id} className="first:pl-0 last:pr-0">
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ServiceInfoBanner




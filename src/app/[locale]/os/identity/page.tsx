'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import KPICard from '@/components/shared/KPICard'

export default function IdentityOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const portal = pathname?.includes('/portal/distributor') ? 'distributor' :
                 pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={portal}
      pageTitle="Identity & Access Engine"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KPICard
            label="Total Users"
            value="2,345"
            icon="👥"
          />
          <KPICard
            label="Active Roles"
            value="12"
            icon="🔐"
          />
          <KPICard
            label="SSO Enabled"
            value="100%"
            icon="🔗"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-black200 rounded-lg">
            <h3 className="text-lg font-semibold text-black mb-2">User Management</h3>
            <p className="text-sm text-black mb-4">Manage users, roles, and permissions across all portals and OS domains.</p>
            <ul className="space-y-2 text-sm text-black list-disc list-inside">
              <li>User creation and management</li>
              <li>Role assignment</li>
              <li>Permission configuration</li>
              <li>Account status tracking</li>
            </ul>
          </div>
          <div className="p-6 bg-white border border-black200 rounded-lg">
            <h3 className="text-lg font-semibold text-black mb-2">SSO Integration</h3>
            <p className="text-sm text-black mb-4">Single Sign-On configuration for seamless authentication across all systems.</p>
            <ul className="space-y-2 text-sm text-black list-disc list-inside">
              <li>SAML 2.0 support</li>
              <li>OAuth 2.0 integration</li>
              <li>LDAP/Active Directory</li>
              <li>Multi-factor authentication</li>
            </ul>
          </div>
          <div className="p-6 bg-white border border-black200 rounded-lg">
            <h3 className="text-lg font-semibold text-black mb-2">Access Control</h3>
            <p className="text-sm text-black mb-4">Role-based access control (RBAC) with fine-grained permissions.</p>
            <ul className="space-y-2 text-sm text-black list-disc list-inside">
              <li>Role hierarchy management</li>
              <li>Permission matrix</li>
              <li>Scope-based access</li>
              <li>Audit logging</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

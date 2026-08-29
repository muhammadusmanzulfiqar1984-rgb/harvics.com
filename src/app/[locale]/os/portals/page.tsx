'use client'

/**
 * Portals hub — Modules #69–71
 * Dedicated paths: /os/portal-customer, /os/portal-vendor, /os/portal-field
 */

import Link from 'next/link'
import { useLocale } from 'next-intl'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import { PORTAL_META, type PortalType } from '@/components/os-domains/PortalsModulePanel'

export default function PortalsHubPage() {
  const locale = useLocale()
  return (
    <HarvicsOSShell
      title="Portals"
      subtitle="Modules #69–71 — customer, vendor, field officer"
      activeDomain="portals"
      breadcrumbs={[{ label: 'OS', href: '/os' }, { label: 'Portals' }]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">
            Modules #69–71 · Portals
          </p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Portal Directory
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Each portal has a dedicated OS path with live Bearer-auth session CRUD.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(Object.keys(PORTAL_META) as PortalType[]).map((t) => {
            const m = PORTAL_META[t]
            return (
              <Link
                key={t}
                href={`/${locale}${m.path}`}
                className="border border-harvics-burgundy/15 bg-white p-5 transition hover:border-harvics-gold"
                style={{ borderTop: '3px solid #C3A35E' }}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">
                  Module {m.no} · {m.status}
                </div>
                <div className="mt-2 text-lg font-semibold">{m.title}</div>
                <div className="mt-1 font-mono text-[11px] text-harvics-burgundy/60">{m.path}</div>
                <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-harvics-gold">
                  Open →
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </HarvicsOSShell>
  )
}

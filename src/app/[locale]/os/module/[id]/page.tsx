'use client'

/**
 * Dynamic universal module page: /[locale]/os/module/[id]
 *
 * Renders any HARVICS module (1..72) via the UniversalModuleScreen which
 * pulls data from the generic factory endpoint /api/m/:id.
 */

import { useParams } from 'next/navigation'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import UniversalModuleScreen from '@/components/shared/UniversalModuleScreen'
import { getModuleById, TOTAL_MODULES } from '@/lib/modules/registry'

export default function ModulePage() {
  const params = useParams<{ id: string; locale: string }>()
  const id = Number(params?.id)
  if (!Number.isInteger(id) || id < 1 || id > TOTAL_MODULES) {
    return (
      <HarvicsOSShell title="Invalid module" subtitle={`Module id must be 1–${TOTAL_MODULES}`} activeDomain="modules">
        <div style={{ padding: 32, fontFamily: 'system-ui' }}>
          <h1>Invalid module id</h1>
          <p>Module id must be an integer between 1 and {TOTAL_MODULES}.</p>
        </div>
      </HarvicsOSShell>
    )
  }
  const entry = getModuleById(id)
  return (
    <HarvicsOSShell
      title={entry?.name ?? `Module #${id}`}
      subtitle={`Module #${id}${entry?.band ? ` — ${entry.band}` : ''}`}
      activeDomain="modules"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'All Modules', href: '/os/catalog' },
        { label: entry?.name ?? `#${id}` },
      ]}
    >
      <UniversalModuleScreen moduleId={id} />
    </HarvicsOSShell>
  )
}

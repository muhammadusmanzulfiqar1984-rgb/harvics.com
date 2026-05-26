'use client'

/**
 * Dynamic universal module page: /[locale]/os/module/[id]
 *
 * Renders any HARVICS module (1..71) via the UniversalModuleScreen which
 * pulls data from the generic factory endpoint /api/m/:id.
 */

import { useParams } from 'next/navigation'
import UniversalModuleScreen from '@/components/shared/UniversalModuleScreen'

export default function ModulePage() {
  const params = useParams<{ id: string; locale: string }>()
  const id = Number(params?.id)
  if (!Number.isInteger(id) || id < 1 || id > 71) {
    return (
      <div style={{ padding: 32, fontFamily: 'system-ui' }}>
        <h1>Invalid module id</h1>
        <p>Module id must be an integer between 1 and 71.</p>
      </div>
    )
  }
  return <UniversalModuleScreen moduleId={id} />
}

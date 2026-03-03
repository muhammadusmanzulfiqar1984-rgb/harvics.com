'use client'

import { useState, useEffect } from 'react'
import { GeographicScope } from '@/types/geographicScope'
import { createGeographicScopeFromUserScope } from '@/lib/geographic'

export function useGeographicScope(): GeographicScope {
  const [scope, setScope] = useState<GeographicScope>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userScopeStr = localStorage.getItem('user_scope')
      if (userScopeStr) {
        try {
          const userScope = JSON.parse(userScopeStr)
          const geographicScope = userScope.geographic || createGeographicScopeFromUserScope(userScope)
          setScope(geographicScope)
          return
        } catch (e) {
          console.error('Error parsing user scope:', e)
        }
      }
    }
    setScope({})
  }, [])

  return scope
}


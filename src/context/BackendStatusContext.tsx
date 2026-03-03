'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useBackendStatus } from '@/hooks/useBackendStatus';

type BackendStatus = 'loading' | 'ok' | 'error';

const BackendStatusContext = createContext<BackendStatus>('loading');

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const status = useBackendStatus();

  return (
    <BackendStatusContext.Provider value={status}>
      {children}
    </BackendStatusContext.Provider>
  );
}

export function useBackendStatusContext() {
  return useContext(BackendStatusContext);
}

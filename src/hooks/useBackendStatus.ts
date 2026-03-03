import { useState, useEffect } from 'react';

type BackendStatus = 'loading' | 'ok' | 'error';

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>('loading');

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setStatus('ok');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    }

    checkBackend();
  }, []);

  return status;
}

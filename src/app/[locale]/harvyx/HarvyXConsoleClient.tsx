'use client'

import OpsAccessGate from '@/components/auth/OpsAccessGate'

export default function HarvyXConsoleClient() {
  return (
    <OpsAccessGate
      title="HarvyX Growth OS"
      subtitle="Enter the ops access code to open the console. App store visitors start on the HarvyX app page."
    >
      <iframe
        src="/harvyx.html?v=3"
        style={{
          width: '100%',
          height: 'calc(100vh - 140px)',
          minHeight: 640,
          border: 'none',
          display: 'block',
        }}
        title="HarvyX Growth OS"
      />
    </OpsAccessGate>
  )
}

'use client'

import { useEffect } from 'react'

export default function InflationPage() {
  useEffect(() => {
    window.location.href = '/inflation/index.html'
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'monospace',
      color: '#1b2a4a'
    }}>
      Loading Inflation Dashboard...
    </div>
  )
}

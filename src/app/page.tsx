import { Suspense } from 'react'
import { fetchAllLiveRates }  from '@/lib/publicApis'
import { getAnnotations, getAlertHistory, getFomcDecisions } from '@/lib/supabase'
import Dashboard from '@/components/Dashboard'

// Revalidate every 5 minutes
export const revalidate = 300

export default async function Home() {
  // Fetch everything in parallel on server
  const [liveRates, annotations, alertHistory, fomcDecisions] = await Promise.allSettled([
    fetchAllLiveRates(),
    getAnnotations(),
    getAlertHistory(20),
    getFomcDecisions(),
  ])

  const live        = liveRates.status      === 'fulfilled' ? liveRates.value      : null
  const annots      = annotations.status    === 'fulfilled' ? annotations.value    : []
  const alerts      = alertHistory.status   === 'fulfilled' ? alertHistory.value   : []
  const fomc        = fomcDecisions.status  === 'fulfilled' ? fomcDecisions.value  : []

  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontFamily: 'monospace' }}>Loading dashboard...</div>}>
      <Dashboard
        liveRates={live}
        annotations={annots}
        alertHistory={alerts}
        fomcDecisions={fomc}
      />
    </Suspense>
  )
}

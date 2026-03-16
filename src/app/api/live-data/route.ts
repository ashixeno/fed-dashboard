import { NextResponse } from 'next/server'
import { fetchAllLiveRates } from '@/lib/publicApis'
import { upsertRateData, getLatestRates } from '@/lib/supabase'

// GET /api/live-data — returns latest live rates (served from Supabase cache if fresh)
export async function GET() {
  try {
    // Check Supabase cache first (within last 5 minutes)
    const cached = await getLatestRates('EFFR', 1)
    if (cached.length > 0) {
      const ageMs = Date.now() - new Date(cached[0].date + 'T00:00:00Z').getTime()
      const isToday = new Date(cached[0].date).toDateString() === new Date().toDateString()
      if (isToday) {
        // Return cached data
        const [effr, sofr, y2, y10, cpi, unemp] = await Promise.all([
          getLatestRates('EFFR', 1),
          getLatestRates('SOFR', 1),
          getLatestRates('YIELD_2Y', 1),
          getLatestRates('YIELD_10Y', 1),
          getLatestRates('CPI', 1),
          getLatestRates('UNEMP', 1),
        ])
        return NextResponse.json({
          effr:         effr[0]?.value ?? null,
          sofr:         sofr[0]?.value ?? null,
          yield2y:      y2[0]?.value ?? null,
          yield10y:     y10[0]?.value ?? null,
          cpiYoy:       cpi[0]?.value ?? null,
          unemployment: unemp[0]?.value ?? null,
          lastUpdated:  effr[0]?.date ?? null,
          source:       'supabase_cache',
        })
      }
    }

    // Fetch fresh data from public APIs
    const live = await fetchAllLiveRates()
    const today = new Date().toISOString().slice(0, 10)

    // Store in Supabase
    const rows = [
      live.effr         !== null && { series_id: 'EFFR',     value: live.effr,         date: today, source: 'nyfed' },
      live.sofr         !== null && { series_id: 'SOFR',     value: live.sofr,         date: today, source: 'nyfed' },
      live.yield2y      !== null && { series_id: 'YIELD_2Y', value: live.yield2y,      date: today, source: 'treasury' },
      live.yield10y     !== null && { series_id: 'YIELD_10Y',value: live.yield10y,     date: today, source: 'treasury' },
      live.cpiYoy       !== null && { series_id: 'CPI',      value: live.cpiYoy,       date: today, source: 'bls' },
      live.unemployment !== null && { series_id: 'UNEMP',    value: live.unemployment, date: today, source: 'bls' },
    ].filter(Boolean) as any[]

    if (rows.length > 0) await upsertRateData(rows)

    return NextResponse.json({ ...live, source: 'live_fetch' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/live-data — force refresh (called by cron)
export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const live = await fetchAllLiveRates()
  const today = new Date().toISOString().slice(0, 10)

  const rows = [
    live.effr         !== null && { series_id: 'EFFR',     value: live.effr,         date: today, source: 'nyfed' },
    live.sofr         !== null && { series_id: 'SOFR',     value: live.sofr,         date: today, source: 'nyfed' },
    live.yield2y      !== null && { series_id: 'YIELD_2Y', value: live.yield2y,      date: today, source: 'treasury' },
    live.yield10y     !== null && { series_id: 'YIELD_10Y',value: live.yield10y,     date: today, source: 'treasury' },
    live.cpiYoy       !== null && { series_id: 'CPI',      value: live.cpiYoy,       date: today, source: 'bls' },
    live.unemployment !== null && { series_id: 'UNEMP',    value: live.unemployment, date: today, source: 'bls' },
  ].filter(Boolean) as any[]

  await upsertRateData(rows)

  return NextResponse.json({ ok: true, updated: rows.length, data: live })
}

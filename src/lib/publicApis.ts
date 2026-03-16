// ═══════════════════════════════════════════════════════════════════════════
// Public API fetchers — No API key needed
// NY Fed + Treasury.gov + BLS
// ═══════════════════════════════════════════════════════════════════════════

export interface LiveRates {
  effr:        number | null
  sofr:        number | null
  yield2y:     number | null
  yield10y:    number | null
  cpiYoy:      number | null
  unemployment:number | null
  lastUpdated: string
}

// ── NY Fed: EFFR + SOFR ──────────────────────────────────────────────────────
export async function fetchNYFedRates() {
  try {
    const [effrRes, sofrRes] = await Promise.all([
      fetch('https://markets.newyorkfed.org/api/rates/effr/last/5.json', { next: { revalidate: 300 } }),
      fetch('https://markets.newyorkfed.org/api/rates/sofr/last/5.json', { next: { revalidate: 300 } }),
    ])

    let effr = null, sofr = null

    if (effrRes.ok) {
      const d = await effrRes.json()
      const obs = d?.refRates || []
      if (obs.length > 0) effr = parseFloat(obs[obs.length - 1].percentRate)
    }

    if (sofrRes.ok) {
      const d = await sofrRes.json()
      const obs = d?.refRates || []
      if (obs.length > 0) sofr = parseFloat(obs[obs.length - 1].percentRate)
    }

    return { effr, sofr }
  } catch (e) {
    console.warn('NY Fed fetch failed:', e)
    return { effr: null, sofr: null }
  }
}

// ── Treasury.gov: Yields ─────────────────────────────────────────────────────
export async function fetchTreasuryYields() {
  try {
    const url = 'https://api.fiscaldata.treasury.gov/services/api/v1/accounting/od/avg_interest_rates' +
      '?fields=record_date,security_desc,avg_interest_rate_amt' +
      '&filter=security_desc:in:(Treasury%20Notes,Treasury%20Bonds)' +
      '&sort=-record_date&page[size]=10'

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('Treasury API error')

    const json = await res.json()
    const rows = json?.data || []

    const notes = rows.find((r: any) => r.security_desc === 'Treasury Notes')
    const bonds = rows.find((r: any) => r.security_desc === 'Treasury Bonds')

    return {
      yield2y:  notes ? parseFloat(notes.avg_interest_rate_amt) : null,
      yield10y: bonds ? parseFloat(bonds.avg_interest_rate_amt) : null,
    }
  } catch (e) {
    console.warn('Treasury fetch failed:', e)
    return { yield2y: null, yield10y: null }
  }
}

// ── BLS: CPI + Unemployment ──────────────────────────────────────────────────
export async function fetchBLSData() {
  try {
    const currentYear = new Date().getFullYear()
    const res = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesid: ['CUSR0000SA0', 'LNS14000000'],
        startyear: String(currentYear - 1),
        endyear:   String(currentYear),
      }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error('BLS API error')
    const json = await res.json()
    if (json.status !== 'REQUEST_SUCCEEDED') throw new Error('BLS error: ' + json.message?.[0])

    let cpiYoy = null, unemployment = null

    for (const series of json.Results?.series || []) {
      const latest = series.data?.[0]
      if (!latest) continue
      const val = parseFloat(latest.value)

      if (series.seriesID === 'CUSR0000SA0') {
        const prev = series.data?.find(
          (d: any) => d.year === String(parseInt(latest.year) - 1) && d.period === latest.period
        )
        if (prev) {
          cpiYoy = parseFloat((((val - parseFloat(prev.value)) / parseFloat(prev.value)) * 100).toFixed(2))
        }
      }
      if (series.seriesID === 'LNS14000000') {
        unemployment = val
      }
    }

    return { cpiYoy, unemployment }
  } catch (e) {
    console.warn('BLS fetch failed:', e)
    return { cpiYoy: null, unemployment: null }
  }
}

// ── Master fetch: all sources in parallel ────────────────────────────────────
export async function fetchAllLiveRates(): Promise<LiveRates> {
  const [nyfed, treasury, bls] = await Promise.all([
    fetchNYFedRates(),
    fetchTreasuryYields(),
    fetchBLSData(),
  ])

  return {
    effr:         nyfed.effr,
    sofr:         nyfed.sofr,
    yield2y:      treasury.yield2y,
    yield10y:     treasury.yield10y,
    cpiYoy:       bls.cpiYoy,
    unemployment: bls.unemployment,
    lastUpdated:  new Date().toISOString(),
  }
}

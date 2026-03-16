'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LiveRates } from '@/lib/publicApis'
import type { Annotation, AlertEntry, FomcDecision } from '@/lib/supabase'
import { FED_RATES, CPI_DATA, UNEMP_DATA, YIELD_2Y, YIELD_10Y, SHORT_LABELS, MORTGAGE_RATE, BALANCE_SHEET } from '@/lib/constants'

import Header           from './Header'
import NavBar           from './NavBar'
import KPIGrid          from './KPIGrid'
import LiveBar          from './LiveBar'
import RateChart        from './RateChart'
import FOMCTable        from './FOMCTable'
import DualMandate      from './DualMandate'
import AlertsPanel      from './AlertsPanel'
import AnnotationsPanel from './AnnotationsPanel'
import { YieldCurve, BalanceSheet, MortgageChart, MacroCpiChart, MacroUnempChart } from './Charts'

interface Props {
  liveRates:     LiveRates | null
  annotations:   Annotation[]
  alertHistory:  AlertEntry[]
  fomcDecisions: FomcDecision[]
}

export default function Dashboard({ liveRates: initialLive, annotations: initialAnnots, alertHistory: initialAlerts, fomcDecisions }: Props) {
  const [live,         setLive]         = useState<LiveRates | null>(initialLive)
  const [annotations,  setAnnotations]  = useState<Annotation[]>(initialAnnots)
  const [alerts,       setAlerts]       = useState<AlertEntry[]>(initialAlerts)
  const [lastUpdated,  setLastUpdated]  = useState(initialLive?.lastUpdated || '')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const rates = [...FED_RATES]; const cpi = [...CPI_DATA]; const unemp = [...UNEMP_DATA]
  const y2 = [...YIELD_2Y];     const y10 = [...YIELD_10Y]
  if (live?.effr)         rates[rates.length-1] = live.effr
  if (live?.cpiYoy)       cpi[cpi.length-1]     = live.cpiYoy
  if (live?.unemployment) unemp[unemp.length-1] = live.unemployment
  if (live?.yield2y)      y2[y2.length-1]       = live.yield2y
  if (live?.yield10y)     y10[y10.length-1]     = live.yield10y

  const currentRate  = live?.effr         ?? rates[rates.length-1]
  const currentCpi   = live?.cpiYoy       ?? cpi[cpi.length-1]
  const currentUnemp = live?.unemployment ?? unemp[unemp.length-1]
  const currentY10   = live?.yield10y     ?? y10[y10.length-1]

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [lR, aR, alR] = await Promise.all([fetch('/api/live-data'), fetch('/api/annotations'), fetch('/api/alerts')])
      if (lR.ok)  { setLive(await lR.json()); setLastUpdated(new Date().toISOString()) }
      if (aR.ok)  setAnnotations(await aR.json())
      if (alR.ok) setAlerts(await alR.json())
    } catch(e) { console.warn('Refresh failed', e) }
    setIsRefreshing(false)
  }, [])

  useEffect(() => { const t = setInterval(refresh, 5*60*1000); return () => clearInterval(t) }, [refresh])

  const handleAddAnnotation    = async (date: string, label: string, color: string) => {
    const res = await fetch('/api/annotations', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({date,label,color}) })
    if (res.ok) { const a = await res.json(); setAnnotations(p=>[...p,a]) }
  }
  const handleDeleteAnnotation = async (id: number) => {
    await fetch(\`/api/annotations?id=\${id}\`, {method:'DELETE'})
    setAnnotations(p=>p.filter(a=>a.id!==id))
  }
  const handleLogAlert = async (type: string, message: string, severity: string) => {
    await fetch('/api/alerts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({type,message,severity}) })
    setAlerts(p=>[{type,message,severity:severity as any,triggered_at:new Date().toISOString()},...p])
  }

  return (
    <div>
      <Header />
      <LiveBar lastUpdated={lastUpdated} isRefreshing={isRefreshing} onRefresh={refresh}
        liveRate={currentRate} prevRate={rates[rates.length-2]} onAlert={handleLogAlert}
        currentCpi={currentCpi} currentUnemp={currentUnemp}
        yield2y={live?.yield2y??y2[y2.length-1]} yield10y={currentY10} />
      <NavBar />
      <main style={{maxWidth:1440,margin:'0 auto',padding:'16px 20px 80px'}}>
        <section id="section-kpi"><KPIGrid currentRate={currentRate} cpi={currentCpi} unemployment={currentUnemp} yield10y={currentY10} /></section>
        <section id="section-rate" style={{marginBottom:16}}>
          <div className="panel">
            <div className="panel-header">
              <div><div className="panel-title">Federal Funds Rate — Historical Trend</div><div style={{fontFamily:'monospace',fontSize:9,color:'var(--muted)',marginTop:3}}>Jan 2023–Present · Source: NY Fed API</div></div>
              {live?.effr && <span style={{display:'flex',alignItems:'center',gap:6,fontSize:9,fontFamily:'monospace',color:'#1a6b3a'}}><span className="live-dot"/>Live · NY Fed</span>}
            </div>
            <div className="panel-body"><RateChart labels={SHORT_LABELS} rates={rates} annotations={annotations}/></div>
          </div>
        </section>
        <section id="section-fomc" style={{marginBottom:16}}><FOMCTable decisions={fomcDecisions}/></section>
        <section id="section-mandate" style={{marginBottom:16}}><DualMandate rates={rates} cpi={cpi} unemp={unemp} labels={SHORT_LABELS} liveRate={currentRate} liveCpi={currentCpi} liveUnemp={currentUnemp}/></section>
        <section id="section-yield"   style={{marginBottom:16}}><YieldCurve   labels={SHORT_LABELS} y2={y2} y10={y10} rates={rates}/></section>
        <section id="section-balance" style={{marginBottom:16}}><BalanceSheet  labels={SHORT_LABELS} assets={BALANCE_SHEET} rates={rates}/></section>
        <section id="section-mortgage"style={{marginBottom:16}}><MortgageChart labels={SHORT_LABELS} mortgage={MORTGAGE_RATE} rates={rates}/></section>
        <section id="section-macro"   style={{marginBottom:16}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:2}}>
            <MacroCpiChart   labels={SHORT_LABELS} rates={rates} cpi={cpi}/>
            <MacroUnempChart labels={SHORT_LABELS} rates={rates} unemp={unemp}/>
          </div>
        </section>
        <section id="section-tools" style={{marginBottom:16}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:2}}>
            <AlertsPanel      alerts={alerts} onLogAlert={handleLogAlert}/>
            <AnnotationsPanel annotations={annotations} onAdd={handleAddAnnotation} onDelete={handleDeleteAnnotation}/>
          </div>
        </section>
      </main>
      <footer style={{background:'var(--navy)',color:'rgba(255,255,255,0.7)',textAlign:'center',padding:'20px 24px',fontSize:10,fontFamily:'monospace',letterSpacing:0.5,lineHeight:1.8}}>
        <div>Trading Discussion — Xeno- · Fed Funds Rate Dashboard</div>
        <div>NY Fed · Treasury.gov · BLS · Auto-refresh 5min · Supabase DB</div>
        <a href="https://t.me/theXENO" target="_blank" rel="noopener" style={{display:'inline-flex',alignItems:'center',gap:8,marginTop:10,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'#d4a843',padding:'6px 16px',textDecoration:'none',fontSize:11,fontWeight:700}}>Join t.me/theXENO</a>
        <div style={{marginTop:8,fontSize:9,opacity:0.5}}>© 2022–Present Trading Discussion. Exclusively for mentorship students.</div>
      </footer>
    </div>
  )
}

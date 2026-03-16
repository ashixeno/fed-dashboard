'use client'
import { useEffect, useRef } from 'react'
import { MANDATE, COLORS } from '@/lib/constants'

interface Props {
  rates:     number[]
  cpi:       number[]
  unemp:     number[]
  labels:    string[]
  liveRate:  number
  liveCpi:   number
  liveUnemp: number
}

function getPressure(cpiGap: number, unempGap: number, rateGap: number) {
  const score = (cpiGap * 1.5) + (-unempGap * 1.0) + (-rateGap * 0.5)
  if      (score >  2.0) return { label: 'VERY HAWKISH', color: '#9b2020', score }
  else if (score >  0.5) return { label: 'HAWKISH',      color: '#c0392b', score }
  else if (score > -0.5) return { label: 'NEUTRAL',      color: '#8b6914', score }
  else if (score > -2.0) return { label: 'DOVISH',       color: '#1a6b3a', score }
  else                   return { label: 'VERY DOVISH',  color: '#0d5e2e', score }
}

export default function DualMandate({ rates, cpi, unemp, labels, liveRate, liveCpi, liveUnemp }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)

  const cpiGap   = parseFloat((liveCpi   - MANDATE.cpiTarget).toFixed(2))
  const unempGap = parseFloat((liveUnemp - MANDATE.nairu).toFixed(2))
  const rateGap  = parseFloat((liveRate  - MANDATE.neutralRate).toFixed(2))
  const pressure = getPressure(cpiGap, unempGap, rateGap)

  useEffect(() => {
    async function init() {
      const { default: Chart } = await import('chart.js/auto')
      if (chartRef.current) chartRef.current.destroy()
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      const n = labels.length
      const cpiGaps   = cpi.slice(0,n).map(v => parseFloat((v - MANDATE.cpiTarget).toFixed(2)))
      const unempGaps = unemp.slice(0,n).map(v => parseFloat((v - MANDATE.nairu).toFixed(2)))
      const rateGaps  = rates.slice(0,n).map(v => parseFloat((v - MANDATE.neutralRate).toFixed(2)))

      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'CPI Gap (vs 2% target)',
              data: cpiGaps,
              backgroundColor: cpiGaps.map(v => v > 0 ? 'rgba(155,32,32,0.65)' : 'rgba(26,107,58,0.55)'),
              borderColor:     cpiGaps.map(v => v > 0 ? '#9b2020' : '#1a6b3a'),
              borderWidth: 1,
              yAxisID: 'yGap', order: 2,
            },
            {
              label: 'Unemp Gap (vs 4% NAIRU)',
              data: unempGaps,
              backgroundColor: unempGaps.map(v => v > 0 ? 'rgba(139,105,20,0.55)' : 'rgba(26,107,58,0.45)'),
              borderColor:     unempGaps.map(v => v > 0 ? '#8b6914' : '#1a6b3a'),
              borderWidth: 1,
              yAxisID: 'yGap', order: 3,
            },
            {
              label: 'Rate Gap (vs 2.5% neutral)',
              data: rateGaps,
              type: 'line',
              borderColor: '#1b2a4a',
              backgroundColor: 'transparent',
              borderWidth: 2.5,
              pointRadius: 2,
              fill: false,
              tension: 0.3,
              yAxisID: 'yRate', order: 1,
            },
            {
              label: 'Target (zero)',
              data: labels.map(() => 0),
              type: 'line',
              borderColor: 'rgba(0,0,0,0.15)',
              borderWidth: 1,
              borderDash: [3,3],
              pointRadius: 0,
              fill: false,
              yAxisID: 'yGap', order: 4,
            },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: true, position: 'top', labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 12, padding: 12,
              filter: (item: any) => item.text !== 'Target (zero)' } },
            tooltip: { callbacks: { label: (c: any) => ` ${c.dataset.label}: ${c.parsed.y > 0 ? '+' : ''}${c.parsed.y.toFixed(2)}%` } }
          },
          scales: {
            x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6b7280', font: { size: 9 }, maxRotation: 30, maxTicksLimit: 14 } },
            yGap:  { position: 'left',  grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: (v: any) => (v>0?'+':'')+v.toFixed(1)+'%', color: '#6b7280', font: { size: 9 } }, title: { display: true, text: 'Gap from Target', color: '#6b7280', font: { size: 9 } } },
            yRate: { position: 'right', grid: { display: false },             ticks: { callback: (v: any) => (v>0?'+':'')+v.toFixed(1)+'%', color: '#1b2a4a', font: { size: 9 } }, title: { display: true, text: 'Rate Gap',        color: '#1b2a4a', font: { size: 9 } } },
          }
        }
      })
    }
    init()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [labels, rates, cpi, unemp])

  const gapBar = (gap: number, max: number, posColor: string, negColor: string) => {
    const w = Math.min(Math.abs(gap) / max * 100, 100)
    return <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', marginBottom: 4 }}>
      <div style={{ width: `${w}%`, height: '100%', background: gap > 0 ? posColor : negColor, transition: 'width 0.8s ease' }} />
    </div>
  }

  const scoreItems = [
    { label: 'Inflation Mandate', status: cpiGap > 1 ? 'NOT MET' : cpiGap > 0 ? 'CLOSE' : 'MET', color: cpiGap > 1 ? '#9b2020' : cpiGap > 0 ? '#8b6914' : '#1a6b3a', detail: `CPI ${cpiGap>0?'+':''}${cpiGap.toFixed(2)}% vs 2%` },
    { label: 'Employment Mandate', status: unempGap > 0.5 ? 'SOFTENING' : unempGap < -0.3 ? 'OVERHEAT' : 'MET', color: unempGap > 0.5 ? '#8b6914' : unempGap < -0.3 ? '#9b2020' : '#1a6b3a', detail: `Unemp ${unempGap>0?'+':''}${unempGap.toFixed(2)}% vs 4%` },
    { label: 'Rate vs Neutral', status: rateGap > 1.5 ? 'VERY TIGHT' : rateGap > 0.5 ? 'RESTRICTIVE' : rateGap < -0.5 ? 'ACCOMM.' : 'NEUTRAL', color: rateGap > 1 ? '#9b2020' : rateGap > 0 ? '#1b2a4a' : '#1a6b3a', detail: `${rateGap>0?'+':''}${rateGap.toFixed(2)}% above neutral` },
    { label: 'Next Move Bias', status: pressure.label, color: pressure.color, detail: `Score: ${pressure.score>0?'+':''}${pressure.score.toFixed(2)}` },
  ]

  return (
    <div className="panel">
      <div className="panel-header" style={{ borderLeftColor: 'var(--navy)' }}>
        <div>
          <div className="panel-title">Fed Dual Mandate — Policy Gap Dashboard</div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>
            Price Stability (2% CPI) · Max Employment (4% NAIRU) · Rate Neutral (2.5%)
          </div>
        </div>
        <div style={{ padding: '6px 14px', background: 'rgba(27,42,74,0.06)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>Policy Pressure</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: pressure.color }}>{pressure.label}</div>
        </div>
      </div>
      <div className="panel-body">

        {/* 3 Gap Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, marginBottom: 16 }}>
          {[
            { label: 'CPI Inflation Gap', val: liveCpi, target: '2.0%', gap: cpiGap, unit: 'target', posColor: '#9b2020', negColor: '#1a6b3a', max: 5 },
            { label: 'Unemployment Gap', val: liveUnemp, target: '4.0% NAIRU', gap: unempGap, unit: 'NAIRU', posColor: '#8b6914', negColor: '#1a6b3a', max: 3 },
            { label: 'Rate Restrictiveness', val: liveRate, target: '2.50% neutral', gap: rateGap, unit: 'neutral', posColor: '#1b2a4a', negColor: '#1a6b3a', max: 4 },
          ].map((c, i) => (
            <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '14px 16px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 700, color: c.gap > 0.3 ? c.posColor : c.gap < -0.3 ? c.negColor : '#1a6b3a', lineHeight: 1, marginBottom: 4 }}>
                {c.val.toFixed(1)}%
              </div>
              <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 8 }}>
                Target: {c.target} &nbsp;·&nbsp;
                <span style={{ color: c.gap > 0 ? c.posColor : c.negColor, fontWeight: 700 }}>
                  {c.gap > 0 ? '+' : ''}{c.gap.toFixed(2)}% {c.gap > 0 ? 'above' : 'below'}
                </span>
              </div>
              {gapBar(c.gap, c.max, c.posColor, c.negColor)}
              <div style={{ fontSize: 9, color: c.gap > 0.3 ? c.posColor : '#1a6b3a' }}>
                {c.gap > 0.5 ? 'Pressure to hike/hold' : c.gap < -0.3 ? 'Pressure to cut' : 'Near target'}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ position: 'relative', height: 280, marginBottom: 16 }}>
          <canvas ref={canvasRef} />
        </div>

        {/* Scorecard */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--navy)', padding: '12px 16px', marginBottom: 12 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: 10 }}>Policy Pressure Scorecard</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }}>
            {scoreItems.map((s, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid var(--border)', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 1.5, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.status}</div>
                <div style={{ fontSize: 9, color: 'var(--muted)' }}>{s.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

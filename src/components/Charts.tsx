'use client'
import { useEffect, useRef } from 'react'

// ─── Reusable chart hook ─────────────────────────────────────────────────────
function useChart(buildConfig: () => any, deps: any[]) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)
  useEffect(() => {
    async function init() {
      const { default: Chart } = await import('chart.js/auto')
      if (chartRef.current) chartRef.current.destroy()
      if (!canvasRef.current) return
      chartRef.current = new Chart(canvasRef.current, buildConfig())
    }
    init()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, deps)
  return canvasRef
}

const OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: true, position: 'top' as const, labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 12, padding: 12 } } },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6b7280', font: { size: 9 }, maxRotation: 30, maxTicksLimit: 14 } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6b7280', font: { size: 9 } } }
  }
}

// ─── Yield Curve ─────────────────────────────────────────────────────────────
export function YieldCurve({ labels, y2, y10, rates }: { labels: string[]; y2: number[]; y10: number[]; rates: number[] }) {
  const ref = useChart(() => ({
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: '2Y Treasury', data: y2,    borderColor: '#9b2020', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 1.5, tension: 0.3 },
        { label: '10Y Treasury',data: y10,   borderColor: '#8b6914', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 1.5, tension: 0.3 },
        { label: 'Fed Funds',   data: rates, borderColor: '#1b2a4a', backgroundColor: 'transparent', borderWidth: 1.5, borderDash: [4,3], pointRadius: 0, tension: 0.3 },
      ]
    },
    options: { ...OPTS, plugins: { ...OPTS.plugins, tooltip: { mode: 'index', intersect: false, callbacks: { label: (c: any) => ` ${c.dataset.label}: ${c.parsed.y.toFixed(2)}%` } } }, scales: { ...OPTS.scales, y: { ...OPTS.scales.y, ticks: { ...OPTS.scales.y.ticks, callback: (v: any) => v.toFixed(2) + '%' } } } }
  }), [labels, y2, y10, rates])

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">Yield Curve — 2Y vs 10Y Treasury Spread</div>
      </div>
      <div className="panel-body">
        <div style={{ position: 'relative', height: 260 }}><canvas ref={ref} /></div>
        {y2[y2.length-1] > y10[y10.length-1] && (
          <div style={{ marginTop: 10, background: 'rgba(155,32,32,0.06)', border: '1px solid rgba(155,32,32,0.2)', borderLeft: '3px solid #9b2020', padding: '8px 12px', fontSize: 10, color: '#9b2020', fontFamily: 'monospace' }}>
            INVERTED: 2Y ({y2[y2.length-1].toFixed(2)}%) &gt; 10Y ({y10[y10.length-1].toFixed(2)}%) — Recession indicator
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Balance Sheet ────────────────────────────────────────────────────────────
export function BalanceSheet({ labels, assets, rates }: { labels: string[]; assets: number[]; rates: number[] }) {
  const ref = useChart(() => {
    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Fed Total Assets ($T)', data: assets, borderColor: '#1b2a4a', backgroundColor: 'rgba(27,42,74,0.08)', borderWidth: 2.5, pointRadius: 1.5, fill: true, tension: 0.3, yAxisID: 'yAsset' },
          { label: 'Fed Funds Rate (%)',    data: rates,  borderColor: '#8b6914', backgroundColor: 'transparent',        borderWidth: 1.5, borderDash: [4,3], pointRadius: 0, tension: 0.3, yAxisID: 'yRate'  },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top', labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 12, padding: 12 } }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6b7280', font: { size: 9 }, maxRotation: 30, maxTicksLimit: 14 } },
          yAsset: { position: 'left',  grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: (v: any) => '$'+v.toFixed(1)+'T', color: '#1b2a4a', font: { size: 9 } } },
          yRate:  { position: 'right', grid: { display: false },             ticks: { callback: (v: any) => v.toFixed(2)+'%',       color: '#8b6914', font: { size: 9 } } },
        }
      }
    }
  }, [labels, assets, rates])

  return (
    <div className="panel">
      <div className="panel-header"><div className="panel-title">Fed Balance Sheet — QE &amp; QT History</div></div>
      <div className="panel-body"><div style={{ position: 'relative', height: 260 }}><canvas ref={ref} /></div></div>
    </div>
  )
}

// ─── Mortgage Chart ───────────────────────────────────────────────────────────
export function MortgageChart({ labels, mortgage, rates }: { labels: string[]; mortgage: number[]; rates: number[] }) {
  const ref = useChart(() => ({
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: '30Y Mortgage Rate', data: mortgage, borderColor: '#8b6914', backgroundColor: 'rgba(139,105,20,0.08)', borderWidth: 2.5, pointRadius: 1.5, fill: true,  tension: 0.3 },
        { label: 'Fed Funds Rate',    data: rates,    borderColor: '#1b2a4a', backgroundColor: 'transparent',          borderWidth: 1.5, borderDash: [4,3], pointRadius: 0, tension: 0.3 },
      ]
    },
    options: { ...OPTS, plugins: { ...OPTS.plugins, tooltip: { mode: 'index', intersect: false, callbacks: { label: (c: any) => ` ${c.dataset.label}: ${c.parsed.y.toFixed(2)}%` } } }, scales: { ...OPTS.scales, y: { ...OPTS.scales.y, ticks: { ...OPTS.scales.y.ticks, callback: (v: any) => v.toFixed(2) + '%' } } } }
  }), [labels, mortgage, rates])

  return (
    <div className="panel">
      <div className="panel-header"><div className="panel-title">30-Year Mortgage Rate vs Fed Funds Rate</div></div>
      <div className="panel-body"><div style={{ position: 'relative', height: 260 }}><canvas ref={ref} /></div></div>
    </div>
  )
}

// ─── Macro CPI Chart ──────────────────────────────────────────────────────────
export function MacroCpiChart({ labels, rates, cpi }: { labels: string[]; rates: number[]; cpi: number[] }) {
  const ref = useChart(() => ({
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'CPI YoY %',     data: cpi,   borderColor: '#9b2020', backgroundColor: 'rgba(155,32,32,0.06)', borderWidth: 2, pointRadius: 1.5, fill: true, tension: 0.3, yAxisID: 'yCpi' },
        { label: 'Fed Funds %',   data: rates, borderColor: '#1b2a4a', backgroundColor: 'transparent',          borderWidth: 2, pointRadius: 1.5,            tension: 0.3, yAxisID: 'yRate' },
        { label: 'CPI Target 2%', data: labels.map(() => 2), borderColor: 'rgba(155,32,32,0.3)', borderWidth: 1, borderDash: [3,3], pointRadius: 0, fill: false, yAxisID: 'yCpi' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 12, padding: 12, filter: (i: any) => i.text !== 'CPI Target 2%' } }, tooltip: { mode: 'index', intersect: false } },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6b7280', font: { size: 9 }, maxRotation: 30, maxTicksLimit: 14 } },
        yCpi:  { position: 'left',  grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: (v: any) => v.toFixed(1)+'%', color: '#9b2020', font: { size: 9 } } },
        yRate: { position: 'right', grid: { display: false },             ticks: { callback: (v: any) => v.toFixed(2)+'%', color: '#1b2a4a', font: { size: 9 } } },
      }
    }
  }), [labels, rates, cpi])

  return (
    <div className="panel">
      <div className="panel-header"><div className="panel-title">Fed Rate vs CPI Inflation</div></div>
      <div className="panel-body"><div style={{ position: 'relative', height: 260 }}><canvas ref={ref} /></div></div>
    </div>
  )
}

// ─── Macro Unemployment Chart ─────────────────────────────────────────────────
export function MacroUnempChart({ labels, rates, unemp }: { labels: string[]; rates: number[]; unemp: number[] }) {
  const ref = useChart(() => ({
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Unemployment %',   data: unemp, borderColor: '#8b6914', backgroundColor: 'rgba(139,105,20,0.06)', borderWidth: 2, pointRadius: 1.5, fill: true, tension: 0.3, yAxisID: 'yUnemp' },
        { label: 'Fed Funds %',      data: rates, borderColor: '#1b2a4a', backgroundColor: 'transparent',           borderWidth: 2, pointRadius: 1.5,            tension: 0.3, yAxisID: 'yRate' },
        { label: 'NAIRU 4%', data: labels.map(() => 4), borderColor: 'rgba(139,105,20,0.35)', borderWidth: 1, borderDash: [3,3], pointRadius: 0, fill: false, yAxisID: 'yUnemp' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 12, padding: 12, filter: (i: any) => i.text !== 'NAIRU 4%' } }, tooltip: { mode: 'index', intersect: false } },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6b7280', font: { size: 9 }, maxRotation: 30, maxTicksLimit: 14 } },
        yUnemp:{ position: 'left',  grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: (v: any) => v.toFixed(1)+'%', color: '#8b6914', font: { size: 9 } } },
        yRate: { position: 'right', grid: { display: false },             ticks: { callback: (v: any) => v.toFixed(2)+'%', color: '#1b2a4a', font: { size: 9 } } },
      }
    }
  }), [labels, rates, unemp])

  return (
    <div className="panel">
      <div className="panel-header"><div className="panel-title">Fed Rate vs Unemployment Rate</div></div>
      <div className="panel-body"><div style={{ position: 'relative', height: 260 }}><canvas ref={ref} /></div></div>
    </div>
  )
}

export default YieldCurve

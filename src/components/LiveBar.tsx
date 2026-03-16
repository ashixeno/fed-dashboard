'use client'
import { useState, useEffect } from 'react'

interface Props {
  lastUpdated:  string
  isRefreshing: boolean
  onRefresh:    () => void
  liveRate:     number
  prevRate:     number
  onAlert:      (type: string, msg: string, severity: string) => void
  currentCpi:   number
  currentUnemp: number
  yield2y:      number
  yield10y:     number
}

export default function LiveBar({ lastUpdated, isRefreshing, onRefresh, liveRate, prevRate, onAlert, currentCpi, currentUnemp, yield2y, yield10y }: Props) {
  const [countdown, setCountdown] = useState('')
  const [nextRefresh, setNextRefresh] = useState(Date.now() + 5 * 60 * 1000)
  const [toasts, setToasts] = useState<{id:number,msg:string,color:string}[]>([])

  // Countdown
  useEffect(() => {
    const t = setInterval(() => {
      const rem = Math.max(0, nextRefresh - Date.now())
      const m = Math.floor(rem / 60000)
      const s = Math.floor((rem % 60000) / 1000)
      setCountdown(`${m}:${String(s).padStart(2,'0')}`)
    }, 1000)
    return () => clearInterval(t)
  }, [nextRefresh])

  // Alert checks on data change
  useEffect(() => {
    if (!liveRate || !prevRate) return
    const diff = Math.abs(liveRate - prevRate)
    if (diff >= 0.25) {
      const dir = liveRate > prevRate ? 'HIKED' : 'CUT'
      const msg = `Fed ${dir} by ${(diff*100).toFixed(0)}bps — New: ${liveRate.toFixed(2)}%`
      onAlert('rateChange', msg, liveRate > prevRate ? 'danger' : 'success')
      showToast(msg, liveRate > prevRate ? '#9b2020' : '#1a6b3a')
    }
    if (currentCpi > 3.5) {
      onAlert('cpiSpike', `CPI ${currentCpi.toFixed(1)}% above 3.5% threshold`, 'warning')
      showToast(`CPI spike: ${currentCpi.toFixed(1)}%`, '#8b6914')
    }
    if (yield2y > yield10y) {
      onAlert('yieldInvert', `Yield curve INVERTED — 2Y: ${yield2y.toFixed(2)}% > 10Y: ${yield10y.toFixed(2)}%`, 'danger')
      showToast(`Yield curve inverted!`, '#9b2020')
    }
  }, [liveRate, currentCpi, yield2y, yield10y])

  function showToast(msg: string, color: string) {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, color }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 7000)
  }

  const ts = lastUpdated ? new Date(lastUpdated).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }) : ''

  return (
    <>
      <div style={{ background: '#f0f4f0', borderBottom: '1px solid var(--border)', padding: '6px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="live-dot" />
            <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 1.5, color: '#1a6b3a', textTransform: 'uppercase' }}>
              {isRefreshing ? 'Refreshing...' : `Live · NY Fed · Treasury · BLS${ts ? ` · ${ts}` : ''}`}
            </span>
          </div>
          {countdown && (
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--muted)' }}>
              Next refresh {countdown}
            </span>
          )}
        </div>
        <button
          onClick={() => { onRefresh(); setNextRefresh(Date.now() + 5*60*1000) }}
          disabled={isRefreshing}
          style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '3px 10px', cursor: 'pointer' }}>
          {isRefreshing ? 'Loading...' : 'Refresh Now'}
        </button>
      </div>

      {/* Toast container */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: 'white', borderLeft: `4px solid ${t.color}`, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '12px 16px', maxWidth: 320, animation: 'slideInToast 0.3s ease' }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: t.color, marginBottom: 4, fontFamily: 'monospace' }}>Dashboard Alert</div>
            <div style={{ fontSize: 11, color: 'var(--navy)', lineHeight: 1.5, fontFamily: 'monospace' }}>{t.msg}</div>
            <div onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} style={{ marginTop: 6, fontSize: 9, color: 'var(--muted)', cursor: 'pointer' }}>Dismiss ×</div>
          </div>
        ))}
      </div>
    </>
  )
}

'use client'
import { useState } from 'react'
import type { AlertEntry } from '@/lib/supabase'

interface Props {
  alerts:     AlertEntry[]
  onLogAlert: (type: string, msg: string, severity: string) => void
}

const SEVERITY_COLORS: Record<string, string> = {
  danger:  '#9b2020',
  warning: '#8b6914',
  success: '#1a6b3a',
  info:    '#1b2a4a',
}

export default function AlertsPanel({ alerts, onLogAlert }: Props) {
  const [cpiThreshold,  setCpiThreshold]  = useState('3.5')
  const [sofrThreshold, setSofrThreshold] = useState('20')

  return (
    <div className="panel" style={{ borderLeft: '3px solid #9b2020' }}>
      <div className="panel-header" style={{ borderLeftColor: '#9b2020' }}>
        <div>
          <div className="panel-title">Rate Change Alerts</div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>
            Auto-triggered · Saved to Supabase · Shared across all users
          </div>
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="live-dot" style={{ width: 6, height: 6 }} /> DB Synced
        </span>
      </div>
      <div className="panel-body" style={{ padding: 0 }}>

        {/* Thresholds */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>Alert Thresholds</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>CPI Alert Above (%)</div>
              <select value={cpiThreshold} onChange={e => setCpiThreshold(e.target.value)}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: 10, padding: '5px 8px', background: 'white', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}>
                <option value="3.0">3.0%</option>
                <option value="3.5">3.5%</option>
                <option value="4.0">4.0%</option>
                <option value="4.5">4.5%</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>SOFR Spread Alert (bps)</div>
              <select value={sofrThreshold} onChange={e => setSofrThreshold(e.target.value)}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: 10, padding: '5px 8px', background: 'white', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}>
                <option value="10">10 bps</option>
                <option value="20">20 bps</option>
                <option value="30">30 bps</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alert History */}
        <div style={{ padding: '8px 16px 4px', fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>
          Alert Log — {alerts.length} entries
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {alerts.length === 0 ? (
            <div style={{ fontSize: 10, color: 'var(--muted)', padding: 16, textAlign: 'center' }}>
              No alerts triggered yet — connect to live data to start monitoring
            </div>
          ) : alerts.map((a, i) => (
            <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: SEVERITY_COLORS[a.severity] || '#8b6914', flexShrink: 0, marginTop: 4 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'var(--text)', lineHeight: 1.5 }}>{a.message}</div>
                <div style={{ fontSize: 8, color: 'var(--muted)', marginTop: 2, letterSpacing: 0.5 }}>
                  {a.triggered_at ? new Date(a.triggered_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

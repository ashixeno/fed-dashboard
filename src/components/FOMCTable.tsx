'use client'
import type { FomcDecision } from '@/lib/supabase'

interface Props { decisions: FomcDecision[] }

const DECISION_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  HIKE: { bg: 'rgba(155,32,32,0.08)',  color: '#9b2020', border: 'rgba(155,32,32,0.3)' },
  CUT:  { bg: 'rgba(26,107,58,0.08)',  color: '#1a6b3a', border: 'rgba(26,107,58,0.3)' },
  HOLD: { bg: 'rgba(0,0,0,0.03)',       color: '#6b7280', border: '#d5cfc0' },
}

export default function FOMCTable({ decisions }: Props) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">FOMC Decision Log</div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>
            All meetings 2023–2026 · {decisions.length} decisions
          </div>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 500 }}>
          <thead>
            <tr>
              {['Date','Decision','Change','New Rate','Vote'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Decision' || h === 'Change' || h === 'Vote' ? 'center' : 'left', fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {decisions.slice(0, 20).map((d, i) => {
              const style = DECISION_STYLE[d.decision] || DECISION_STYLE.HOLD
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : 'var(--bg2)' }}>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 10, color: '#1b2a4a', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {new Date(d.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', fontFamily: 'monospace', fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                      {d.decision}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'center', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: d.bps > 0 ? '#9b2020' : d.bps < 0 ? '#1a6b3a' : '#6b7280' }}>
                    {d.bps === 0 ? '—' : (d.bps > 0 ? '+' : '') + d.bps + ' bps'}
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 11, color: 'var(--navy)', fontWeight: 600 }}>
                    {d.new_rate}
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'center', fontFamily: 'monospace', fontSize: 10, color: 'var(--muted)' }}>
                    {d.vote || '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import type { Annotation } from '@/lib/supabase'

interface Props {
  annotations: Annotation[]
  onAdd:       (date: string, label: string, color: string) => Promise<void>
  onDelete:    (id: number) => Promise<void>
}

const PRESETS = [
  { date: '2023-03', label: 'SVB Crisis',  color: '#9b2020' },
  { date: '2023-07', label: 'Last Hike',   color: '#9b2020' },
  { date: '2024-09', label: 'First Cut',   color: '#1a6b3a' },
  { date: '2024-11', label: 'US Election', color: '#8b6914' },
  { date: '2025-01', label: 'Hold Pause',  color: '#5b8ed6' },
  { date: '2025-09', label: 'Sep Cut',     color: '#1a6b3a' },
]

export default function AnnotationsPanel({ annotations, onAdd, onDelete }: Props) {
  const [date,    setDate]    = useState('')
  const [label,   setLabel]   = useState('')
  const [color,   setColor]   = useState('#8b6914')
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!date || !label) return
    setLoading(true)
    await onAdd(date, label, color)
    setDate(''); setLabel('')
    setLoading(false)
  }

  return (
    <div className="panel">
      <div className="panel-header" style={{ borderLeftColor: '#8b6914' }}>
        <div>
          <div className="panel-title">Chart Annotations</div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>
            Marks on rate chart · Saved to Supabase · Visible to everyone
          </div>
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="live-dot" style={{ width: 6, height: 6 }} /> DB Synced
        </span>
      </div>
      <div className="panel-body">

        {/* Add form */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '2px solid #8b6914', padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: '#8b6914', textTransform: 'uppercase', marginBottom: 10 }}>Add Annotation</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>Date (YYYY-MM)</div>
              <input type="month" value={date} onChange={e => setDate(e.target.value)} min="2023-01" max="2027-12"
                style={{ width: '100%', fontFamily: 'monospace', fontSize: 10, padding: '5px 8px', background: 'white', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>Color</div>
              <select value={color} onChange={e => setColor(e.target.value)}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: 10, padding: '5px 8px', background: 'white', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}>
                <option value="#8b6914">Gold</option>
                <option value="#9b2020">Red</option>
                <option value="#1a6b3a">Green</option>
                <option value="#1b2a4a">Navy</option>
                <option value="#5b8ed6">Blue</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>Label</div>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. SVB Crisis, First Cut..."
              style={{ width: '100%', fontFamily: 'monospace', fontSize: 10, padding: '6px 8px', background: 'white', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={handleAdd} disabled={loading || !date || !label}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', background: 'var(--navy)', color: 'white', border: 'none', padding: 8, cursor: 'pointer', opacity: (!date || !label) ? 0.5 : 1 }}>
            {loading ? 'Saving...' : 'Add to Chart'}
          </button>
        </div>

        {/* Quick presets */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 7 }}>Quick Presets</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {PRESETS.map(p => (
              <button key={p.date} onClick={() => onAdd(p.date, p.label, p.color)}
                style={{ fontFamily: 'monospace', fontSize: 8, padding: '3px 9px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>
          Saved — {annotations.length} annotations
        </div>
        <div style={{ border: '1px solid var(--border)', maxHeight: 200, overflowY: 'auto' }}>
          {annotations.length === 0 ? (
            <div style={{ fontSize: 10, color: 'var(--muted)', padding: 12, textAlign: 'center' }}>No annotations added</div>
          ) : annotations.map((a, i) => (
            <div key={a.id || i} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, background: a.color, flexShrink: 0, borderRadius: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--muted)' }}>{a.date}</div>
                <div style={{ fontSize: 11, color: 'var(--text)' }}>{a.label}</div>
              </div>
              <button onClick={() => a.id && onDelete(a.id)}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '2px 7px', fontSize: 10, cursor: 'pointer' }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'
interface Props { currentRate: number; cpi: number; unemployment: number; yield10y: number }

export default function KPIGrid({ currentRate, cpi, unemployment, yield10y }: Props) {
  const kpis = [
    { label: 'Current Fed Funds Rate', value: currentRate.toFixed(2), unit: '%', sub: 'Target: 3.50–3.75%', highlight: true },
    { label: 'CPI Inflation',          value: cpi.toFixed(1),         unit: '%', sub: `${cpi > 2 ? '+' : ''}${(cpi-2).toFixed(1)}% above 2% target`, color: cpi > 3 ? '#9b2020' : cpi > 2 ? '#8b6914' : '#1a6b3a' },
    { label: 'Unemployment Rate',      value: unemployment.toFixed(1), unit: '%', sub: `${unemployment > 4 ? 'Above' : 'Near'} 4% NAIRU`, color: unemployment > 4.5 ? '#8b6914' : '#1a6b3a' },
    { label: '10Y Treasury Yield',     value: yield10y.toFixed(2),    unit: '%', sub: 'US Treasury 10-year', color: '#1b2a4a' },
    { label: 'Cycle Peak',             value: '5.33',                  unit: '%', sub: 'Jul 2023 – Aug 2024', color: '#9b2020' },
    { label: 'Total Cuts (2024–25)',   value: '−175',                  unit: 'bps', sub: '6 FOMC meetings', color: '#1a6b3a' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2, marginBottom: 16 }}>
      {kpis.map((k, i) => (
        <div key={i} className="kpi" style={{ borderTopColor: i === 0 ? 'var(--navy)' : undefined }}>
          <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{k.label}</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 700, color: k.color || 'var(--navy)', lineHeight: 1 }}>{k.value}<span style={{ fontSize: '0.9rem', marginLeft: 2 }}>{k.unit}</span></div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 6 }}>{k.sub}</div>
        </div>
      ))}
    </div>
  )
}

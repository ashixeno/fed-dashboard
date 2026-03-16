'use client'
export default function Header() {
  return (
    <>
      <div style={{ height: 3, background: 'var(--navy)' }} />
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '5px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>
          Board of Governors — Federal Reserve System — Washington, D.C.
        </span>
      </div>
      <header style={{ background: 'white', borderBottom: '2px solid var(--navy)', padding: '14px 20px', boxShadow: '0 2px 8px rgba(27,42,74,0.08)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 3 }}>
                Trading Discussion — Xeno-
              </div>
              <div style={{ fontFamily: "'EB Garamond', serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.1 }}>
                Fed Funds Rate
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--muted)', marginTop: 4, letterSpacing: 1 }}>
                Live Dashboard · Auto-refreshes every 5 min · No setup needed
              </div>
            </div>
          </div>
          <a href="https://t.me/theXENO" target="_blank" rel="noopener"
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--navy)', border: '1px solid var(--navy)', padding: '8px 16px', textDecoration: 'none', color: 'white', transition: 'all 0.2s' }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 2, fontFamily: 'monospace' }}>Join Channel</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#d4a843', letterSpacing: 1, fontFamily: 'monospace' }}>t.me/theXENO</div>
            </div>
          </a>
        </div>
      </header>
    </>
  )
}

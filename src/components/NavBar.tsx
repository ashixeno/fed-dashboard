'use client'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '#section-kpi',     label: 'KPIs' },
  { href: '#section-rate',    label: 'Rate' },
  { href: '#section-fomc',    label: 'FOMC' },
  { href: '#section-mandate', label: 'Dual Mandate' },
  { href: '#section-yield',   label: 'Yield Curve' },
  { href: '#section-balance', label: 'Balance Sheet' },
  { href: '#section-mortgage',label: 'Mortgage' },
  { href: '#section-macro',   label: 'Macro' },
  { href: '#section-tools',   label: 'Alerts' },
]

export default function NavBar() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive('#' + e.target.id) }),
      { rootMargin: '-20% 0px -70% 0px' }
    )
    NAV_ITEMS.forEach(item => {
      const el = document.querySelector(item.href)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(27,42,74,0.98)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 36, gap: 0 }}>
        {NAV_ITEMS.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: 'flex', alignItems: 'center', height: '100%',
              padding: '0 12px',
              fontFamily: 'monospace', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
              color: active === item.href ? '#d4a843' : 'rgba(255,255,255,0.55)',
              textDecoration: 'none',
              borderBottom: active === item.href ? '2px solid #d4a843' : '2px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

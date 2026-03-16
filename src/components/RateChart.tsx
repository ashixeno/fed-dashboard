'use client'
import { useEffect, useRef } from 'react'
import type { Annotation } from '@/lib/supabase'
import { COLORS } from '@/lib/constants'

interface Props {
  labels:      string[]
  rates:       number[]
  annotations: Annotation[]
}

export default function RateChart({ labels, rates, annotations }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)

  useEffect(() => {
    let Chart: any
    async function init() {
      const mod = await import('chart.js/auto')
      Chart = mod.default

      // Annotation plugin
      const annotPlugin = {
        id: 'userAnnotations',
        afterDraw(chart: any) {
          const { ctx, chartArea, scales } = chart
          if (!chartArea) return
          annotations.forEach(ann => {
            const idx = labels.findIndex(l => {
              const parts = l.split("'")
              if (parts.length !== 2) return false
              const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
              const mo = monthNames.indexOf(parts[0])
              const yr = '20' + parts[1]
              return ann.date.startsWith(`${yr}-${String(mo+1).padStart(2,'0')}`)
            })
            if (idx < 0) return
            const x = scales.x.getPixelForValue(idx)
            ctx.save()
            ctx.beginPath()
            ctx.strokeStyle = ann.color
            ctx.lineWidth = 1.5
            ctx.setLineDash([4, 3])
            ctx.moveTo(x, chartArea.top)
            ctx.lineTo(x, chartArea.bottom)
            ctx.stroke()
            ctx.setLineDash([])
            ctx.fillStyle = ann.color
            ctx.font = "9px 'Source Code Pro', monospace"
            ctx.fillText(ann.label, x + 4, chartArea.top + 12)
            ctx.restore()
          })
        }
      }
      Chart.register(annotPlugin)

      if (chartRef.current) chartRef.current.destroy()
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      const gradient = ctx.createLinearGradient(0, 0, 0, 300)
      gradient.addColorStop(0, 'rgba(27,42,74,0.15)')
      gradient.addColorStop(1, 'rgba(27,42,74,0.01)')

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Fed Funds Rate (%)',
            data: rates,
            borderColor: COLORS.navy,
            backgroundColor: gradient,
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: COLORS.navy,
            fill: true,
            tension: 0.3,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c: any) => ` Fed Funds: ${c.parsed.y.toFixed(2)}%`
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { color: '#6b7280', font: { size: 9 }, maxRotation: 30, maxTicksLimit: 14 }
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { callback: (v: any) => v.toFixed(2) + '%', color: '#6b7280', font: { size: 9 } }
            }
          }
        }
      })
    }
    init()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [labels, rates, annotations])

  return (
    <div style={{ position: 'relative', height: 300 }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

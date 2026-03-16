import { NextResponse } from 'next/server'
import { getAlertHistory, logAlert } from '@/lib/supabase'

// GET /api/alerts
export async function GET() {
  const data = await getAlertHistory(50)
  return NextResponse.json(data)
}

// POST /api/alerts — log new alert
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, message, severity } = body
    if (!type || !message) return NextResponse.json({ error: 'type and message required' }, { status: 400 })
    await logAlert({ type, message, severity: severity || 'warning' })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

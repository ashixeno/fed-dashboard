import { NextResponse } from 'next/server'
import { getAnnotations, addAnnotationDB, deleteAnnotationDB } from '@/lib/supabase'

// GET /api/annotations
export async function GET() {
  const data = await getAnnotations()
  return NextResponse.json(data)
}

// POST /api/annotations — add new
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { date, label, color } = body
    if (!date || !label) return NextResponse.json({ error: 'date and label required' }, { status: 400 })
    const result = await addAnnotationDB({ date, label, color: color || '#8b6914' })
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/annotations?id=123
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = parseInt(url.searchParams.get('id') || '')
    if (isNaN(id)) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await deleteAnnotationDB(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Types ────────────────────────────────────────────────────────────────────
export interface RateDataRow {
  id?: number
  series_id: string
  value: number
  date: string
  source: string
  fetched_at?: string
}

export interface Annotation {
  id?: number
  date: string
  label: string
  color: string
  created_at?: string
}

export interface AlertEntry {
  id?: number
  type: string
  message: string
  severity: 'info' | 'warning' | 'danger' | 'success'
  triggered_at?: string
}

export interface FomcDecision {
  id?: number
  meeting_date: string
  decision: 'HIKE' | 'CUT' | 'HOLD'
  bps: number
  new_rate: string
  vote?: string
  notes?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// Upsert live rate data
export async function upsertRateData(rows: RateDataRow[]) {
  const { error } = await supabase
    .from('rate_data')
    .upsert(rows, { onConflict: 'series_id,date' })
  if (error) console.error('upsertRateData:', error.message)
}

// Get latest N values for a series
export async function getLatestRates(seriesId: string, limit = 38) {
  const { data, error } = await supabase
    .from('rate_data')
    .select('date,value')
    .eq('series_id', seriesId)
    .order('date', { ascending: true })
    .limit(limit)
  if (error) console.error('getLatestRates:', error.message)
  return data || []
}

// Get all annotations
export async function getAnnotations(): Promise<Annotation[]> {
  const { data } = await supabase
    .from('annotations')
    .select('*')
    .order('date', { ascending: true })
  return data || []
}

// Add annotation
export async function addAnnotationDB(ann: Omit<Annotation, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('annotations')
    .insert(ann)
    .select()
    .single()
  if (error) throw error
  return data
}

// Delete annotation
export async function deleteAnnotationDB(id: number) {
  const { error } = await supabase.from('annotations').delete().eq('id', id)
  if (error) throw error
}

// Get alert history
export async function getAlertHistory(limit = 50): Promise<AlertEntry[]> {
  const { data } = await supabase
    .from('alert_history')
    .select('*')
    .order('triggered_at', { ascending: false })
    .limit(limit)
  return data || []
}

// Log alert
export async function logAlert(alert: Omit<AlertEntry, 'id' | 'triggered_at'>) {
  await supabase.from('alert_history').insert(alert)
}

// Get FOMC decisions
export async function getFomcDecisions(): Promise<FomcDecision[]> {
  const { data } = await supabase
    .from('fomc_decisions')
    .select('*')
    .order('meeting_date', { ascending: false })
  return data || []
}

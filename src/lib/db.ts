import { supabase } from './supabase'
import type { Riad, Prestataire, Estimation, AppState } from '@/types'

export async function loadFromDB(): Promise<Partial<AppState> | null> {
  if (!supabase) return null
  try {
    const [riadsRes, prestaRes, estRes] = await Promise.all([
      supabase.from('riads').select('id, data').order('id'),
      supabase.from('prestataires').select('id, data').order('id'),
      supabase.from('estimation').select('data').eq('id', 1).maybeSingle(),
    ])
    const riads: Riad[] = (riadsRes.data || []).map((r: any) => ({ ...r.data, id: r.id }))
    const prestataires: Prestataire[] = (prestaRes.data || []).map((r: any) => ({ ...r.data, id: r.id }))
    const estimation: Estimation | null = estRes.data?.data ?? null
    return {
      riads, prestataires,
      estimation: estimation ?? undefined,
      nextId: riads.reduce((m, r) => Math.max(m, r.id), 0) + 1,
      nextPrestaId: prestataires.reduce((m, p) => Math.max(m, p.id), 0) + 1,
    }
  } catch (e) {
    console.error('loadFromDB error:', e)
    return null
  }
}

export async function saveRiad(riad: Riad) {
  if (!supabase) return
  try {
    const { id, ...data } = riad
    const { error } = await supabase.from('riads').upsert({ id, data }, { onConflict: 'id' })
    if (error) console.error('saveRiad error:', error)
  } catch (e) { console.error('saveRiad catch:', e) }
}

export async function deleteRiad(id: number) {
  if (!supabase) return
  try { await supabase.from('riads').delete().eq('id', id) } catch {}
}

export async function savePrestataire(p: Prestataire) {
  if (!supabase) return
  try {
    const { id, ...data } = p
    const { error } = await supabase.from('prestataires').upsert({ id, data }, { onConflict: 'id' })
    if (error) console.error('savePrestataire error:', error)
  } catch (e) { console.error('savePrestataire catch:', e) }
}

export async function deletePrestataire(id: number) {
  if (!supabase) return
  try { await supabase.from('prestataires').delete().eq('id', id) } catch {}
}

export async function saveEstimation(est: Estimation) {
  if (!supabase) return
  try {
    const { error } = await supabase.from('estimation').upsert({ id: 1, data: est }, { onConflict: 'id' })
    if (error) console.error('saveEstimation error:', error)
  } catch (e) { console.error('saveEstimation catch:', e) }
}

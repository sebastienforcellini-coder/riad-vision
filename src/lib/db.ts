import { getSupabase } from './supabase'
import type { Riad, Prestataire, Estimation, AppState } from '@/types'

export async function loadFromDB(): Promise<Partial<AppState> | null> {
  try {
    const sb = getSupabase()
    if (!sb) return null

    const [riadsRes, prestaRes, estRes] = await Promise.all([
      sb.from('riads').select('id, data').order('id'),
      sb.from('prestataires').select('id, data').order('id'),
      sb.from('estimation').select('data').eq('id', 1).maybeSingle(),
    ])

    const riads: Riad[] = (riadsRes.data || []).map((r: any) => ({ ...r.data, id: r.id }))
    const prestataires: Prestataire[] = (prestaRes.data || []).map((r: any) => ({ ...r.data, id: r.id }))
    const estimation: Estimation | null = estRes.data?.data ?? null

    return {
      riads,
      prestataires,
      estimation: estimation ?? undefined,
      nextId: riads.reduce((m, r) => Math.max(m, r.id), 0) + 1,
      nextPrestaId: prestataires.reduce((m, p) => Math.max(m, p.id), 0) + 1,
    }
  } catch { return null }
}

export async function saveRiad(riad: Riad) {
  try {
    const sb = getSupabase(); if (!sb) return
    const { id, ...data } = riad
    await sb.from('riads').upsert({ id, data }, { onConflict: 'id' })
  } catch {}
}

export async function deleteRiad(id: number) {
  try {
    const sb = getSupabase(); if (!sb) return
    await sb.from('riads').delete().eq('id', id)
  } catch {}
}

export async function savePrestataire(p: Prestataire) {
  try {
    const sb = getSupabase(); if (!sb) return
    const { id, ...data } = p
    await sb.from('prestataires').upsert({ id, data }, { onConflict: 'id' })
  } catch {}
}

export async function deletePrestataire(id: number) {
  try {
    const sb = getSupabase(); if (!sb) return
    await sb.from('prestataires').delete().eq('id', id)
  } catch {}
}

export async function saveEstimation(est: Estimation) {
  try {
    const sb = getSupabase(); if (!sb) return
    await sb.from('estimation').upsert({ id: 1, data: est }, { onConflict: 'id' })
  } catch {}
}

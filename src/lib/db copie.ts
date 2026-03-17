/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabase } from './supabase'
import type { Riad, Prestataire, Estimation, AppState } from '@/types'

export async function loadFromDB(): Promise<Partial<AppState> | null> {
  const sb = getSupabase()
  if (!sb) return null
  try {
    const [riadsRes, prestaRes, estRes] = await Promise.all([
      sb.from('riads').select('id, data').order('id') as any,
      sb.from('prestataires').select('id, data').order('id') as any,
      sb.from('estimation').select('data').eq('id', 1).maybeSingle() as any,
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
  } catch (e) { console.error('loadFromDB:', e); return null }
}

export async function saveRiad(riad: Riad) {
  const sb = getSupabase(); if (!sb) return
  try { const { id, ...data } = riad; await (sb.from('riads') as any).upsert({ id, data }, { onConflict: 'id' }) } catch (e) { console.error('saveRiad:', e) }
}

export async function deleteRiad(id: number) {
  const sb = getSupabase(); if (!sb) return
  try { await sb.from('riads').delete().eq('id', id) } catch {}
}

export async function savePrestataire(p: Prestataire) {
  const sb = getSupabase(); if (!sb) return
  try { const { id, ...data } = p; await (sb.from('prestataires') as any).upsert({ id, data }, { onConflict: 'id' }) } catch (e) { console.error('savePrestataire:', e) }
}

export async function deletePrestataire(id: number) {
  const sb = getSupabase(); if (!sb) return
  try { await sb.from('prestataires').delete().eq('id', id) } catch {}
}

export async function saveEstimation(est: Estimation) {
  const sb = getSupabase(); if (!sb) return
  try { await (sb.from('estimation') as any).upsert({ id: 1, data: est }, { onConflict: 'id' }) } catch (e) { console.error('saveEstimation:', e) }
}

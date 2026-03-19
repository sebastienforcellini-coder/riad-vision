import type { Riad, Prestataire, Estimation, AppState } from '@/types'

async function dbCall(body: object) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function loadFromDB(): Promise<Partial<AppState> | null> {
  try {
    const res = await fetch('/api/db')
    if (!res.ok) return null
    const { riads, prestataires, estimation } = await res.json()
    return {
      riads: riads || [],
      prestataires: prestataires || [],
      estimation: estimation ?? undefined,
      nextId: (riads || []).reduce((m: number, r: Riad) => Math.max(m, r.id), 0) + 1,
      nextPrestaId: (prestataires || []).reduce((m: number, p: Prestataire) => Math.max(m, p.id), 0) + 1,
    }
  } catch (e) { console.error('loadFromDB:', e); return null }
}

export async function saveRiad(riad: Riad) {
  try {
    const { id, ...data } = riad
    await dbCall({ action: 'upsert', table: 'riads', id, data })
  } catch (e) { console.error('saveRiad:', e) }
}

export async function deleteRiad(id: number) {
  try { await dbCall({ action: 'delete', table: 'riads', id }) } catch {}
}

export async function savePrestataire(p: Prestataire) {
  try {
    const { id, ...data } = p
    await dbCall({ action: 'upsert', table: 'prestataires', id, data })
  } catch (e) { console.error('savePrestataire:', e) }
}

export async function deletePrestataire(id: number) {
  try { await dbCall({ action: 'delete', table: 'prestataires', id }) } catch {}
}

export async function saveEstimation(est: Estimation) {
  try { await dbCall({ action: 'upsert', table: 'estimation', id: 1, data: est }) } catch (e) { console.error('saveEstimation:', e) }
}

export async function saveRdv(rdv: import('@/types').Rdv) {
  try {
    const { id, ...data } = rdv
    await dbCall({ action: 'upsert', table: 'rdvs', id, data })
  } catch (e) { console.error('saveRdv:', e) }
}

export async function deleteRdv(id: number) {
  try { await dbCall({ action: 'delete', table: 'rdvs', id }) } catch {}
}

export async function saveProprietaire(p: import('@/types').Proprietaire) {
  try { const { id, ...data } = p; await dbCall({ action: 'upsert', table: 'proprietaires', id, data }) } catch (e) { console.error('saveProprietaire:', e) }
}

export async function deleteProprietaire(id: number) {
  try { await dbCall({ action: 'delete', table: 'proprietaires', id }) } catch {}
}

export async function saveMarchePrix(data: Record<string, unknown>) {
  try { await dbCall({ action: 'upsert', table: 'estimation', id: 2, data }) } catch (e) { console.error('saveMarchePrix:', e) }
}

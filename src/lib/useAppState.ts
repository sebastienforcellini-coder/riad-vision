'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppState, Riad, Estimation, Prestataire, Rdv, Proprietaire, ZonesSurfaces } from '@/types'
import { loadFromDB, saveRiad, deleteRiad as dbDeleteRiad, savePrestataire, deletePrestataire as dbDeletePresta, saveEstimation, saveRdv, deleteRdv as dbDeleteRdv, saveProprietaire, deleteProprietaire as dbDeleteProprio } from './db'

const LS_KEY = 'riad-vision-v7'

const DEFAULT_ZONES: ZonesSurfaces = { patio: 0, salon: 0, cuisine: 0, chambres: 0, sdb: 0, terrasse: 0, rooftop: 0, circulation: 0, autres: 0 }

const DEMO_RIADS: Riad[] = [
  { id: 1, nom: 'Riad Almas', typeBien: 'riad', reference: '', agenceSource: '', lienSource: '', adresse: 'Derb Sidi Bouamar', quartier: 'Mouassine', proximite: '5 min Jemaa el-Fna', vue: '', surface: 280, niveaux: 3, chambres: 6, sdb: 6, terrasse: 40, terrasse2: null, terrasse3: null, etat: 'moyen', prixD: 9240000, prixN: 8400000, statut: 'negociation', titre: true, meuble: false, enActivite: false, piscine: false, bassin: false, clim: false, potentiel: "Maison d'hôtes — 8 chambres", contraintes: 'Plomberie à refaire', notes: "Zellige d'origine conservé", tarifNuit: 1800, tauxOccupation: 65, createdAt: new Date().toISOString() },
  { id: 2, nom: 'Riad El Bahja', typeBien: 'riad', reference: '', agenceSource: '', lienSource: '', adresse: 'Derb Chorfa Lakbir', quartier: 'Bab Doukkala', proximite: '', vue: '', surface: 180, niveaux: 2, chambres: 4, sdb: 4, terrasse: 20, terrasse2: null, terrasse3: null, etat: 'bon', prixD: 6600000, prixN: 5940000, statut: 'proposition', titre: true, meuble: true, enActivite: false, piscine: false, bassin: true, clim: true, potentiel: 'Résidence principale', contraintes: 'R+2 max', notes: '', tarifNuit: null, tauxOccupation: null, createdAt: new Date().toISOString() },
  { id: 3, nom: 'Riad Dar Salam', typeBien: 'riad', reference: '', agenceSource: '', lienSource: '', adresse: 'Rue Bab Taghzout', quartier: 'Kasbah', proximite: '', vue: 'Vue sur les toits', surface: 350, niveaux: 4, chambres: null, sdb: null, terrasse: null, terrasse2: null, terrasse3: null, etat: 'mauvais', prixD: null, prixN: null, statut: 'visite', titre: false, meuble: false, enActivite: false, piscine: false, bassin: false, clim: false, potentiel: 'Grand projet — 12 chambres', contraintes: 'Toiture à reprendre', notes: 'R+4, potentiel rare', tarifNuit: null, tauxOccupation: null, createdAt: new Date().toISOString() },
]

const DEFAULT_STATE: AppState = {
  riads: DEMO_RIADS,
  estimation: { riadId: null, mode: 'rapide', niveau: 'complete', surface: 200, zones: { ...DEFAULT_ZONES }, transf: [], prixPerso: '' },
  prestataires: [], rdvs: [], proprietaires: [],
  nextId: 4, nextPrestaId: 1, nextRdvId: 1, nextProprioId: 1,
}

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE)
  const [loaded, setLoaded] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    async function init() {
      try {
        const dbData = await Promise.race([loadFromDB(), new Promise<null>(res => setTimeout(() => res(null), 4000))])
        if (dbData && dbData.riads && (dbData.riads as Riad[]).length > 0) {
          setState(s => ({ ...s, ...dbData }))
          try { localStorage.setItem(LS_KEY, JSON.stringify({ ...DEFAULT_STATE, ...dbData })) } catch {}
        } else {
          try {
            const raw = localStorage.getItem(LS_KEY)
            if (raw) {
              const local = JSON.parse(raw) as AppState
              setState(local)
              setTimeout(() => Promise.all([
                ...local.riads.map(r => saveRiad(r)),
                ...(local.prestataires || []).map(p => savePrestataire(p)),
                ...(local.rdvs || []).map(r => saveRdv(r)),
                ...(local.proprietaires || []).map(p => saveProprietaire(p)),
                saveEstimation(local.estimation),
              ]).catch(() => {}), 100)
            }
          } catch {}
        }
      } catch {}
      setLoaded(true)
    }
    init()
  }, [])

  useEffect(() => { if (!loaded) return; try { localStorage.setItem(LS_KEY, JSON.stringify(state)) } catch {} }, [state, loaded])

  const addRiad = useCallback((riad: Omit<Riad, 'id' | 'createdAt'>) => { setState(s => { const r: Riad = { ...riad, id: s.nextId, createdAt: new Date().toISOString() }; setTimeout(() => saveRiad(r), 0); return { ...s, riads: [...s.riads, r], nextId: s.nextId + 1 } }) }, [])
  const updateRiad = useCallback((updated: Riad) => { setState(s => { setTimeout(() => saveRiad(updated), 0); return { ...s, riads: s.riads.map(r => r.id === updated.id ? updated : r) } }) }, [])
  const deleteRiad = useCallback((id: number) => { setState(s => { setTimeout(() => dbDeleteRiad(id), 0); return { ...s, riads: s.riads.filter(r => r.id !== id) } }) }, [])
  const setEstimation = useCallback((est: Partial<Estimation>) => { setState(s => { const u = { ...s.estimation, ...est }; setTimeout(() => saveEstimation(u), 0); return { ...s, estimation: u } }) }, [])
  const addPrestataire = useCallback((p: Omit<Prestataire, 'id' | 'createdAt'>) => { setState(s => { const np: Prestataire = { ...p, id: s.nextPrestaId, createdAt: new Date().toISOString() }; setTimeout(() => savePrestataire(np), 0); return { ...s, prestataires: [...s.prestataires, np], nextPrestaId: s.nextPrestaId + 1 } }) }, [])
  const updatePrestataire = useCallback((updated: Prestataire) => { setState(s => { setTimeout(() => savePrestataire(updated), 0); return { ...s, prestataires: s.prestataires.map(p => p.id === updated.id ? updated : p) } }) }, [])
  const deletePrestataire = useCallback((id: number) => { setState(s => { setTimeout(() => dbDeletePresta(id), 0); return { ...s, prestataires: s.prestataires.filter(p => p.id !== id) } }) }, [])
  const addRdv = useCallback((rdv: Omit<Rdv, 'id' | 'createdAt'>) => { setState(s => { const r: Rdv = { ...rdv, id: s.nextRdvId, createdAt: new Date().toISOString() }; setTimeout(() => saveRdv(r), 0); return { ...s, rdvs: [...s.rdvs, r], nextRdvId: s.nextRdvId + 1 } }) }, [])
  const updateRdv = useCallback((updated: Rdv) => { setState(s => { setTimeout(() => saveRdv(updated), 0); return { ...s, rdvs: s.rdvs.map(r => r.id === updated.id ? updated : r) } }) }, [])
  const deleteRdv = useCallback((id: number) => { setState(s => { setTimeout(() => dbDeleteRdv(id), 0); return { ...s, rdvs: s.rdvs.filter(r => r.id !== id) } }) }, [])
  const addProprietaire = useCallback((p: Omit<Proprietaire, 'id' | 'createdAt'>) => { setState(s => { const np: Proprietaire = { ...p, id: s.nextProprioId, createdAt: new Date().toISOString() }; setTimeout(() => saveProprietaire(np), 0); return { ...s, proprietaires: [...s.proprietaires, np], nextProprioId: s.nextProprioId + 1 } }) }, [])
  const updateProprietaire = useCallback((updated: Proprietaire) => { setState(s => { setTimeout(() => saveProprietaire(updated), 0); return { ...s, proprietaires: s.proprietaires.map(p => p.id === updated.id ? updated : p) } }) }, [])
  const deleteProprietaire = useCallback((id: number) => { setState(s => { setTimeout(() => dbDeleteProprio(id), 0); return { ...s, proprietaires: s.proprietaires.filter(p => p.id !== id) } }) }, [])

  return { state, loaded, addRiad, updateRiad, deleteRiad, setEstimation, addPrestataire, updatePrestataire, deletePrestataire, addRdv, updateRdv, deleteRdv, addProprietaire, updateProprietaire, deleteProprietaire }
}

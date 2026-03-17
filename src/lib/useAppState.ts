'use client'
import { useState, useEffect, useCallback } from 'react'
import type { AppState, Riad, Estimation } from '@/types'
import { DEFAULT_ZONES } from '@/lib/constants'

const STORAGE_KEY = 'riad-vision-v3'

const DEMO_RIADS: Riad[] = [
  {
    id: 1, nom: 'Riad Almas', typeBien: 'riad', reference: '', agenceSource: '', lienSource: '',
    adresse: 'Derb Sidi Bouamar', quartier: 'Mouassine', proximite: '5 min Jemaa el-Fna', vue: '',
    surface: 280, niveaux: 3, chambres: 6, sdb: 6, terrasse: 40,
    etat: 'moyen', prixD: 9240000, prixN: 8400000, statut: 'negociation',
    titre: true, meuble: false, enActivite: false, piscine: false, bassin: false, clim: false,
    potentiel: "Maison d'hôtes — 8 chambres", contraintes: 'Plomberie à refaire',
    notes: "Zellige d'origine conservé", createdAt: new Date().toISOString(),
  },
  {
    id: 2, nom: 'Riad El Bahja', typeBien: 'riad', reference: '', agenceSource: '', lienSource: '',
    adresse: 'Derb Chorfa Lakbir', quartier: 'Bab Doukkala', proximite: '', vue: '',
    surface: 180, niveaux: 2, chambres: 4, sdb: 4, terrasse: 20,
    etat: 'bon', prixD: 6600000, prixN: 5940000, statut: 'proposition',
    titre: true, meuble: true, enActivite: false, piscine: false, bassin: true, clim: true,
    potentiel: 'Résidence principale — 4 chambres', contraintes: 'R+2 max',
    notes: '', createdAt: new Date().toISOString(),
  },
  {
    id: 3, nom: 'Riad Dar Salam', typeBien: 'riad', reference: '', agenceSource: '', lienSource: '',
    adresse: 'Rue Bab Taghzout', quartier: 'Kasbah', proximite: '', vue: 'Vue sur les toits de la Médina',
    surface: 350, niveaux: 4, chambres: null, sdb: null, terrasse: null,
    etat: 'mauvais', prixD: null, prixN: null, statut: 'visite',
    titre: false, meuble: false, enActivite: false, piscine: false, bassin: false, clim: false,
    potentiel: 'Grand projet — 12 chambres', contraintes: 'Toiture à reprendre',
    notes: 'R+4, potentiel rare', createdAt: new Date().toISOString(),
  },
]

const DEFAULT_ESTIMATION: Estimation = {
  riadId: null, mode: 'rapide', niveau: 'complete', surface: 200,
  zones: { ...DEFAULT_ZONES }, transf: [], prixPerso: '',
}

const DEFAULT_STATE: AppState = {
  riads: DEMO_RIADS, estimation: DEFAULT_ESTIMATION, nextId: 4,
}

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState(JSON.parse(raw) as AppState)
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state, loaded])

  const addRiad = useCallback((riad: Omit<Riad, 'id' | 'createdAt'>) => {
    setState(s => ({
      ...s,
      riads: [...s.riads, { ...riad, id: s.nextId, createdAt: new Date().toISOString() }],
      nextId: s.nextId + 1,
    }))
  }, [])

  const updateRiad = useCallback((updated: Riad) => {
    setState(s => ({ ...s, riads: s.riads.map(r => r.id === updated.id ? updated : r) }))
  }, [])

  const deleteRiad = useCallback((id: number) => {
    setState(s => ({ ...s, riads: s.riads.filter(r => r.id !== id) }))
  }, [])

  const setEstimation = useCallback((est: Partial<Estimation>) => {
    setState(s => ({ ...s, estimation: { ...s.estimation, ...est } }))
  }, [])

  return { state, loaded, addRiad, updateRiad, deleteRiad, setEstimation }
}

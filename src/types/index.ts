export type Statut = 'visite' | 'negociation' | 'proposition' | 'signe' | 'archive'
export type Etat = 'tres_bon' | 'bon' | 'moyen' | 'mauvais' | 'ruine'
export type TypeBien = 'riad' | 'douirya' | 'maison_hotes' | 'villa' | 'appartement' | 'autre'
export type NiveauRenovation = 'rafraich' | 'standard' | 'complete' | 'luxe'
export type ModeEstimation = 'rapide' | 'detaille'

export interface Riad {
  id: number
  nom: string
  typeBien: TypeBien | ''
  reference: string
  agenceSource: string
  lienSource: string
  statut: Statut | ''
  adresse: string
  quartier: string
  proximite: string
  vue: string
  surface: number | null
  niveaux: number | null
  chambres: number | null
  sdb: number | null
  terrasse: number | null
  etat: Etat | ''
  titre: boolean
  meuble: boolean
  enActivite: boolean
  piscine: boolean
  bassin: boolean
  clim: boolean
  prixD: number | null
  prixN: number | null
  potentiel: string
  contraintes: string
  notes: string
  // Rentabilité
  tarifNuit: number | null
  tauxOccupation: number | null
  createdAt: string
}

export interface ZonesSurfaces {
  patio: number; salon: number; cuisine: number; chambres: number
  sdb: number; terrasse: number; rooftop: number; circulation: number; autres: number
}

export interface Estimation {
  riadId: number | null
  mode: ModeEstimation
  niveau: NiveauRenovation
  surface: number
  zones: ZonesSurfaces
  transf: string[]
  prixPerso: string
}

export interface AppState {
  riads: Riad[]
  estimation: Estimation
  nextId: number
}

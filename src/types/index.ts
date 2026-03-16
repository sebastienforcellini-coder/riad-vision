export type Statut = 'visite' | 'negociation' | 'proposition' | 'signe' | 'archive'
export type Etat = 'bon' | 'moyen' | 'mauvais' | 'ruine'
export type NiveauRenovation = 'rafraich' | 'standard' | 'complete' | 'luxe'
export type ModeEstimation = 'rapide' | 'detaille'

export interface Riad {
  id: number
  nom: string
  adresse: string
  quartier: string
  surface: number | null
  niveaux: number | null
  etat: Etat | ''
  prixD: number | null  // prix demandé en MAD
  prixN: number | null  // prix négocié en MAD
  statut: Statut | ''
  potentiel: string
  contraintes: string
  notes: string
  createdAt: string
}

export interface ZonesSurfaces {
  patio: number
  salon: number
  cuisine: number
  chambres: number
  sdb: number
  terrasse: number
  rooftop: number
  circulation: number
  autres: number
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

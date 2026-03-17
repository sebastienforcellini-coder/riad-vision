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
  chambres: number | null
  sdb: number | null
  terrasse: number | null
  etat: Etat | ''
  prixD: number | null
  prixN: number | null
  statut: Statut | ''
  potentiel: string
  contraintes: string
  notes: string
  // Nouveaux champs
  reference: string
  lienSource: string
  titre: boolean
  meuble: boolean
  enActivite: boolean
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

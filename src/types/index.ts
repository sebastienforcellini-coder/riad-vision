export type Statut = 'visite' | 'negociation' | 'proposition' | 'signe' | 'archive'
export type Etat = 'bon' | 'moyen' | 'mauvais' | 'ruine'
export type TypeBien = 'riad' | 'douirya' | 'maison_hotes' | 'villa' | 'appartement' | 'autre'
export type NiveauRenovation = 'rafraich' | 'standard' | 'complete' | 'luxe'
export type ModeEstimation = 'rapide' | 'detaille'

export interface Riad {
  id: number
  // Identification
  nom: string
  typeBien: TypeBien | ''
  reference: string
  agenceSource: string
  lienSource: string
  statut: Statut | ''
  // Localisation
  adresse: string
  quartier: string
  proximite: string       // ex: "5 min Jemaa el-Fna, tombeaux Saadiens"
  vue: string             // ex: "Vue Palais Royal, jardins"
  // Caractéristiques
  surface: number | null
  niveaux: number | null
  chambres: number | null
  sdb: number | null
  terrasse: number | null
  etat: Etat | ''
  // Équipements
  titre: boolean
  meuble: boolean
  enActivite: boolean
  piscine: boolean
  bassin: boolean
  clim: boolean
  // Prix
  prixD: number | null
  prixN: number | null
  // Contenu
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

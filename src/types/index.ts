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
  terrasse: number | null       // terrasse principale
  terrasse2: number | null      // 2ème terrasse / rooftop
  terrasse3: number | null      // 3ème niveau terrasse
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
  prestaId: number | null   // prestataire sélectionné
  mode: ModeEstimation
  niveau: NiveauRenovation
  surface: number
  zones: ZonesSurfaces
  transf: string[]
  prixPerso: string
}

export type TypeRdv = 'visite' | 'negociation' | 'signature' | 'appel' | 'autre'

export interface Rdv {
  id: number
  titre: string
  type: TypeRdv
  riadId: number | null
  date: string       // YYYY-MM-DD
  heure: string      // HH:MM
  duree: number      // minutes
  lieu: string
  contact: string
  notes: string
  fait: boolean
  createdAt: string
}

export type TypeContact = 'proprietaire' | 'prospect' | 'notaire' | 'agent' | 'autre'
export type StatutContact = 'actif' | 'chaud' | 'froid' | 'clos'

export interface Interaction {
  id: string
  date: string
  type: 'appel' | 'email' | 'visite' | 'whatsapp' | 'autre'
  notes: string
}

export interface Proprietaire {
  id: number
  typeContact: TypeContact
  statut: StatutContact
  nom: string
  prenom: string
  telephone: string
  email: string
  langue: string        // fr, ar, en, es...
  origine: string       // comment il a été trouvé
  // Biens liés
  riadsIds: number[]    // riads associés
  // Infos vente
  motivation: string    // pourquoi vend-il ?
  prixSouhaite: number | null
  delaiVente: string    // urgent, 3 mois, 1 an...
  // Prospect acheteur
  budget: number | null
  criteres: string      // ce qu'il cherche
  // Historique
  interactions: Interaction[]
  notes: string
  createdAt: string
}

export interface AppState {
  riads: Riad[]
  estimation: Estimation
  prestataires: Prestataire[]
  rdvs: Rdv[]
  proprietaires: Proprietaire[]
  nextId: number
  nextPrestaId: number
  nextRdvId: number
  nextProprioId: number
}

// ── PRESTATAIRES ──────────────────────────────────────────────────────────
export type SpecialitePrestataire =
  | 'moe'          // Maître d'œuvre général
  | 'maconnerie'   // Maçonnerie / structure
  | 'plomberie'
  | 'electricite'
  | 'menuiserie'   // Menuiserie / Zellige
  | 'peinture'     // Peinture / Tadelakt
  | 'piscine'      // Piscine / Bassin
  | 'clim'         // Climatisation
  | 'autre'

export interface TarifPrestataire {
  id: string
  label: string          // ex: "Rénovation complète au m²", "Bassin standard", "Escalier"
  type: 'm2' | 'forfait' | 'unite'  // au m², forfait fixe, ou à l'unité
  prix: number           // en MAD
  unite?: string         // ex: "m²", "escalier", "pièce"
  notes?: string
}

export interface Prestataire {
  id: number
  nom: string
  specialite: SpecialitePrestataire
  telephone: string
  email: string
  ville: string
  note: 1 | 2 | 3 | 4 | 5 | null   // étoiles
  fiabilite: 'excellent' | 'bon' | 'moyen' | 'deconseille' | ''
  tarifs: TarifPrestataire[]
  projetsRealises: string            // description libre
  observations: string
  createdAt: string
}

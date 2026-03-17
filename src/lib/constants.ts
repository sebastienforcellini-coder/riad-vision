import type { NiveauRenovation, Statut, TypeBien, ZonesSurfaces } from '@/types'

export const EUR_RATE = 11

export const LEVELS: Record<NiveauRenovation, { label: string; min: number; max: number; color: string; bg: string }> = {
  rafraich: { label: 'Rafraîchissement',      min: 4000,  max: 7000,  color: '#3A7D5C', bg: '#EAF3EC' },
  standard: { label: 'Rénovation standard',   min: 8000,  max: 14000, color: '#6B6560', bg: '#F0EDE8' },
  complete: { label: 'Rénovation complète',   min: 16000, max: 24000, color: '#8C5A28', bg: '#F5EDE3' },
  luxe:     { label: "Luxe / maison d'hôtes", min: 26000, max: 35000, color: '#1A1814', bg: '#EDEAE3' },
}

export const STATUTS: Record<Statut, { l: string; c: string }> = {
  visite:      { l: 'Visite',      c: '#6B6560' },
  negociation: { l: 'Négociation', c: '#8C5A28' },
  proposition: { l: 'Proposition', c: '#3A7D5C' },
  signe:       { l: 'Signé',       c: '#1A1814' },
  archive:     { l: 'Archivé',     c: '#B0AA9E' },
}

export const TYPES_BIEN: Record<TypeBien, string> = {
  riad:         'Riad',
  douirya:      'Douirya',
  maison_hotes: "Maison d'hôtes",
  villa:        'Villa',
  appartement:  'Appartement',
  autre:        'Autre',
}

export const ETATS: Record<string, string> = {
  tres_bon: 'Très bon état',
  bon:      'Bon état / rénové',
  moyen:    'État moyen',
  mauvais:  'Mauvais état',
  ruine:    'À rénover',
}

export const QUARTIERS = [
  '', 'Mouassine', 'Dar El Bacha', 'Kasbah',
  'Riad Zitoun', 'Ksour', 'Bab Doukkala', 'Mellah',
  'Centre médina', 'Autre'
]

export const ZONES: { k: keyof ZonesSurfaces; l: string }[] = [
  { k: 'patio',       l: 'Patio' },
  { k: 'salon',       l: 'Salon' },
  { k: 'cuisine',     l: 'Cuisine' },
  { k: 'chambres',    l: 'Chambres' },
  { k: 'sdb',         l: 'Salles de bain' },
  { k: 'terrasse',    l: 'Terrasse' },
  { k: 'rooftop',     l: 'Rooftop' },
  { k: 'circulation', l: 'Circulation' },
  { k: 'autres',      l: 'Autres' },
]

export const TRANSFORMATIONS: { k: string; l: string; f: number }[] = [
  { k: 'escalier',        l: 'Escalier',         f: 45000  },
  { k: 'verriere',        l: 'Verrière patio',   f: 120000 },
  { k: 'bassin',          l: 'Bassin',            f: 80000  },
  { k: 'piscinePatio',    l: 'Piscine patio',    f: 350000 },
  { k: 'piscineTerrasse', l: 'Piscine terrasse', f: 280000 },
  { k: 'surelevation',    l: 'Surélévation',     f: 800000 },
  { k: 'rooftopAm',       l: 'Rooftop aménagé',  f: 150000 },
  { k: 'clim',            l: 'Climatisation',    f: 35000  },
  { k: 'hammam',          l: 'Hammam',            f: 90000  },
  { k: 'pergola',         l: 'Pergola',           f: 50000  },
]

export const DEFAULT_ZONES: ZonesSurfaces = {
  patio: 0, salon: 0, cuisine: 0, chambres: 0, sdb: 0,
  terrasse: 0, rooftop: 0, circulation: 0, autres: 0,
}

export const fmtMAD = (n: number) =>
  new Intl.NumberFormat('fr-MA').format(Math.round(n)) + ' MAD'

export const fmtM = (n: number | null | undefined): string => {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + ' M MAD'
  return Math.round(n / 1000) + ' K MAD'
}

export const fmtEUR = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n))

export const calcPrixM2 = (prix: number | null, surface: number | null) => {
  if (!prix || !surface || surface === 0) return null
  return { mad: Math.round(prix / surface), eur: Math.round(prix / surface / EUR_RATE) }
}

export const calcEstimation = (
  niveau: NiveauRenovation, surf: number, transf: string[], prixPerso: string
) => {
  const lvl = LEVELS[niveau]
  const pp = prixPerso ? Number(prixPerso) : null
  const pMin = pp ? pp * 0.85 : lvl.min
  const pMax = pp ? pp * 1.15 : lvl.max
  const pMoy = pp || Math.round((lvl.min + lvl.max) / 2)
  let extras = 0
  transf.forEach(k => { const t = TRANSFORMATIONS.find(x => x.k === k); if (t) extras += t.f })
  return { surf, pMin, pMax, pMoy, tMin: surf * pMin + extras, tMax: surf * pMax + extras, total: surf * pMoy + extras, extras, lvl }
}

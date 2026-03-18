'use client'
import { useState } from 'react'
import type { Riad } from '@/types'
import { ETATS, TYPES_BIEN, LEVELS, fmtM, fmtEUR } from '@/lib/constants'
import { PageHeader, Btn, Card } from '@/components/ui'

const MAX = 3

// Calcul budget travaux estimé selon état du bien
function estimeBudgetTravaux(riad: Riad): { min: number; moy: number; max: number } | null {
  if (!riad.surface) return null
  const surf = riad.surface
  let niveau: keyof typeof LEVELS = 'standard'
  if (riad.etat === 'ruine') niveau = 'luxe'
  else if (riad.etat === 'mauvais') niveau = 'complete'
  else if (riad.etat === 'moyen') niveau = 'standard'
  else if (riad.etat === 'bon' || riad.etat === 'tres_bon') niveau = 'rafraich'
  else return null
  const lvl = LEVELS[niveau]
  return {
    min: surf * lvl.min,
    moy: surf * Math.round((lvl.min + lvl.max) / 2),
    max: surf * lvl.max,
  }
}

function RiadCard({ riad, onRemove, rank }: { riad: Riad; onRemove: () => void; rank: { prix: boolean; surface: boolean; rendement: boolean; projetTotal: boolean } }) {
  const prix = riad.prixN ?? riad.prixD
  const m2mad = prix && riad.surface ? Math.round(prix / riad.surface) : null
  const m2eur = m2mad ? Math.round(m2mad / 11) : null

  const travaux = estimeBudgetTravaux(riad)
  const projetTotal = prix && travaux ? prix + travaux.moy : null
  const projetM2 = projetTotal && riad.surface ? Math.round(projetTotal / riad.surface) : null

  const nuits = riad.tarifNuit && riad.tauxOccupation ? Math.round(365 * riad.tauxOccupation / 100) : null
  const caNet = nuits && riad.tarifNuit ? Math.round(riad.tarifNuit * nuits * 0.6) : null
  const rendSurAchat = caNet && prix ? ((caNet / prix) * 100).toFixed(1) : null
  const rendSurProjet = caNet && projetTotal ? ((caNet / projetTotal) * 100).toFixed(1) : null

  const surfTotale = (riad.surface ?? 0) + (riad.terrasse ?? 0) + (riad.terrasse2 ?? 0) + (riad.terrasse3 ?? 0)

  const badges = [
    riad.titre && { l: 'Titré', c: '#3A7D5C' },
    riad.piscine && { l: 'Piscine', c: '#185FA5' },
    riad.bassin && !riad.piscine && { l: 'Bassin', c: '#185FA5' },
    riad.clim && { l: 'Clim', c: '#6B6560' },
    riad.enActivite && { l: 'En activité', c: '#8C5A28' },
    riad.meuble && { l: 'Meublé', c: '#6B6560' },
  ].filter(Boolean) as { l: string; c: string }[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* En-tête */}
      <div style={{ background: 'var(--accent-bg)', border: '1px solid rgba(140,90,40,0.2)', borderRadius: '10px 10px 0 0', padding: '14px 16px', position: 'relative' }}>
        <button onClick={onRemove} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--soft)', fontSize: 14 }}>✕</button>
        {riad.typeBien && riad.typeBien !== 'riad' && (
          <div style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: 1, marginBottom: 3 }}>{TYPES_BIEN[riad.typeBien]?.toUpperCase()}</div>
        )}
        <div className="serif" style={{ fontSize: 18, color: 'var(--accent)', fontStyle: 'italic', fontWeight: 300, marginBottom: 2 }}>{riad.nom}</div>
        <div style={{ fontSize: 11, color: 'var(--soft)' }}>{riad.quartier}{riad.adresse ? ' · ' + riad.adresse : ''}</div>
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
            {badges.map(b => (
              <span key={b.l} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 8, background: b.c + '18', color: b.c, border: `1px solid ${b.c}33` }}>{b.l}</span>
            ))}
          </div>
        )}
      </div>

      {/* Prix achat */}
      <div style={{ border: '1px solid var(--line)', borderTop: 'none', padding: '12px 16px', background: rank.prix ? '#EAF3EC' : 'var(--white)' }}>
        <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 2 }}>PRIX {riad.prixN ? 'NÉGOCIÉ' : 'DEMANDÉ'}</div>
        {prix ? (
          <>
            <div className="serif" style={{ fontSize: 22, color: rank.prix ? '#3A7D5C' : 'var(--text)', fontWeight: 300 }}>
              {fmtM(prix)} {rank.prix && <span style={{ fontSize: 11 }}>✓</span>}
            </div>
            {m2mad && <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>{m2mad.toLocaleString()} MAD/m² · {fmtEUR(m2eur!)}/m²</div>}
          </>
        ) : <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic' }}>Non renseigné</div>}
      </div>

      {/* Budget travaux */}
      <div style={{ border: '1px solid var(--line)', borderTop: 'none', padding: '12px 16px', background: 'var(--white)' }}>
        <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 6 }}>BUDGET TRAVAUX ESTIMÉ</div>
        {travaux ? (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '6px', background: 'var(--bg)', borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: 'var(--soft)', marginBottom: 2 }}>Min</div>
                <div style={{ fontSize: 12, color: 'var(--mid)' }}>{fmtM(travaux.min)}</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '6px', background: '#F5EDE3', borderRadius: 6, border: '1px solid rgba(140,90,40,0.2)' }}>
                <div style={{ fontSize: 9, color: 'var(--accent)', marginBottom: 2 }}>Estimé</div>
                <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>{fmtM(travaux.moy)}</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '6px', background: 'var(--bg)', borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: 'var(--soft)', marginBottom: 2 }}>Max</div>
                <div style={{ fontSize: 12, color: 'var(--mid)' }}>{fmtM(travaux.max)}</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--soft)', fontStyle: 'italic' }}>
              Basé sur état : {riad.etat ? ETATS[riad.etat] : '—'} · {riad.surface} m²
            </div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--soft)', fontStyle: 'italic' }}>État du bien non renseigné</div>
        )}
      </div>

      {/* Projet total */}
      <div style={{ border: '1px solid var(--line)', borderTop: 'none', padding: '12px 16px', background: rank.projetTotal ? '#EAF3EC' : 'var(--white)' }}>
        <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 4 }}>PROJET TOTAL (achat + travaux)</div>
        {projetTotal ? (
          <>
            <div className="serif" style={{ fontSize: 20, color: rank.projetTotal ? '#3A7D5C' : 'var(--text)', fontWeight: 300 }}>
              {fmtM(projetTotal)} {rank.projetTotal && <span style={{ fontSize: 11 }}>✓</span>}
            </div>
            {projetM2 && <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>{projetM2.toLocaleString()} MAD/m² rénové</div>}
          </>
        ) : <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic' }}>Données insuffisantes</div>}
      </div>

      {/* Surface */}
      <div style={{ border: '1px solid var(--line)', borderTop: 'none', padding: '12px 16px', background: rank.surface ? '#EAF3EC' : 'var(--white)' }}>
        <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 6 }}>SURFACE & STRUCTURE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            ['Sol', riad.surface ? riad.surface + ' m²' : '—'],
            ['Niveaux', riad.niveaux ? riad.niveaux + ' niv.' : '—'],
            ['Chambres', riad.chambres ? riad.chambres + ' ch.' : '—'],
            ['SDB', riad.sdb ? riad.sdb + ' sdb' : '—'],
            ['Terrasse', riad.terrasse ? riad.terrasse + ' m²' : '—'],
            ['Total', surfTotale > 0 ? surfTotale + ' m²' : '—'],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 9, color: 'var(--soft)' }}>{l}</div>
              <div style={{ fontSize: 13, color: rank.surface && l === 'Total' ? '#3A7D5C' : 'var(--text)', fontWeight: l === 'Total' ? 500 : 400 }}>
                {v} {rank.surface && l === 'Total' && v !== '—' && '✓'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* État */}
      <div style={{ border: '1px solid var(--line)', borderTop: 'none', padding: '12px 16px', background: 'var(--white)' }}>
        <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 4 }}>ÉTAT DU BIEN</div>
        <div style={{ fontSize: 13, color: 'var(--text)' }}>{riad.etat ? ETATS[riad.etat] : '—'}</div>
        {riad.proximite && <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 4 }}>📍 {riad.proximite}</div>}
        {riad.vue && <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>👁 {riad.vue}</div>}
      </div>

      {/* Rentabilité */}
      <div style={{ border: '1px solid var(--line)', borderTop: 'none', padding: '12px 16px', background: rank.rendement ? '#EAF3EC' : 'var(--white)' }}>
        <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 6 }}>RENTABILITÉ LOCATIVE</div>
        {caNet ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div><div style={{ fontSize: 9, color: 'var(--soft)' }}>Tarif nuit</div><div style={{ fontSize: 13 }}>{riad.tarifNuit?.toLocaleString()} MAD</div></div>
            <div><div style={{ fontSize: 9, color: 'var(--soft)' }}>Occupation</div><div style={{ fontSize: 13 }}>{riad.tauxOccupation}%</div></div>
            <div><div style={{ fontSize: 9, color: 'var(--soft)' }}>Net annuel</div><div style={{ fontSize: 13 }}>{fmtM(caNet)}</div></div>
            <div>
              <div style={{ fontSize: 9, color: 'var(--soft)' }}>Rendement</div>
              <div style={{ fontSize: 9, color: 'var(--soft)' }}>Sur achat : <span style={{ color: rank.rendement ? '#3A7D5C' : 'var(--text)', fontWeight: 500 }}>{rendSurAchat}%</span></div>
              {rendSurProjet && <div style={{ fontSize: 9, color: 'var(--soft)' }}>Sur projet : <span style={{ color: 'var(--mid)', fontWeight: 500 }}>{rendSurProjet}%</span></div>}
            </div>
          </div>
        ) : <div style={{ fontSize: 11, color: 'var(--soft)', fontStyle: 'italic' }}>Données insuffisantes</div>}
      </div>

      {/* Potentiel */}
      <div style={{ border: '1px solid var(--line)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 16px', background: 'var(--white)' }}>
        <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 4 }}>POTENTIEL</div>
        <div style={{ fontSize: 12, color: 'var(--mid)', fontStyle: 'italic', minHeight: 36 }}>{riad.potentiel || '—'}</div>
        {riad.contraintes && <div style={{ fontSize: 11, color: '#C0392B', marginTop: 6 }}>⚠ {riad.contraintes}</div>}
      </div>
    </div>
  )
}
export default function Comparateur({ riads }: { riads: Riad[] }) {
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch] = useState('')

  const toggle = (id: number) => {
    if (selected.includes(id)) setSelected(s => s.filter(x => x !== id))
    else if (selected.length < MAX) setSelected(s => [...s, id])
  }

  const selectedRiads = selected.map(id => riads.find(r => r.id === id)!).filter(Boolean)
  const filtered = riads.filter(r => r.nom.toLowerCase().includes(search.toLowerCase()) || r.quartier?.toLowerCase().includes(search.toLowerCase()))

  // Calculs pour ranking
  const prix = selectedRiads.map(r => r.prixN ?? r.prixD ?? Infinity)
  const surfaces = selectedRiads.map(r => (r.surface ?? 0) + (r.terrasse ?? 0) + (r.terrasse2 ?? 0) + (r.terrasse3 ?? 0))
  const projets = selectedRiads.map(r => {
    const p = r.prixN ?? r.prixD
    const t = estimeBudgetTravaux(r)
    return p && t ? p + t.moy : Infinity
  })
  const rendements = selectedRiads.map(r => {
    if (!r.tarifNuit || !r.tauxOccupation) return 0
    const net = r.tarifNuit * Math.round(365 * r.tauxOccupation / 100) * 0.6
    const p = r.prixN ?? r.prixD
    return p ? net / p * 100 : 0
  })

  const minPrix = Math.min(...prix.filter(p => p !== Infinity))
  const maxSurf = Math.max(...surfaces)
  const minProjet = Math.min(...projets.filter(p => p !== Infinity))
  const maxRend = Math.max(...rendements)

  return (
    <div>
      <PageHeader
        title="Comparateur"
        subtitle={`${selected.length}/${MAX} riads sélectionnés`}
        action={selected.length > 0 ? <Btn label="Réinitialiser" onClick={() => setSelected([])} /> : undefined}
      />

      {/* Sélection */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 12 }}>
          Sélectionnez 2 ou 3 riads à comparer
        </div>
        <input
          className="field-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un riad…"
          style={{ marginBottom: 12 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(r => {
            const isSelected = selected.includes(r.id)
            const isDisabled = !isSelected && selected.length >= MAX
            const prix = r.prixN ?? r.prixD
            return (
              <button key={r.id} onClick={() => !isDisabled && toggle(r.id)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 8, cursor: isDisabled ? 'not-allowed' : 'pointer',
                background: isSelected ? 'var(--accent-bg)' : isDisabled ? 'var(--bg)' : 'var(--white)',
                border: `1px solid ${isSelected ? 'rgba(140,90,40,0.4)' : 'var(--line)'}`,
                opacity: isDisabled ? 0.4 : 1, textAlign: 'left',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: isSelected ? 'var(--accent)' : 'var(--text)', fontWeight: isSelected ? 500 : 400 }}>
                    {isSelected ? '✓ ' : ''}{r.nom}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--soft)' }}>{r.quartier}{r.surface ? ` · ${r.surface} m²` : ''}</div>
                </div>
                {prix && <div style={{ fontSize: 13, color: 'var(--soft)' }}>{fmtM(prix)}</div>}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Comparaison */}
      {selectedRiads.length >= 2 && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 12, display: 'flex', gap: 16 }}>
            <span style={{ color: '#3A7D5C' }}>✓ Meilleur dans la catégorie</span>
            <span>⚠ Contrainte à noter</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedRiads.length}, 1fr)`, gap: 12 }}>
            {selectedRiads.map((r, i) => (
              <RiadCard
                key={r.id}
                riad={r}
                onRemove={() => toggle(r.id)}
                rank={{
                  prix: prix[i] === minPrix && minPrix !== Infinity,
                  surface: surfaces[i] === maxSurf && maxSurf > 0,
                  projetTotal: projets[i] === minProjet && minProjet !== Infinity,
                  rendement: rendements[i] === maxRend && maxRend > 0,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {selectedRiads.length === 1 && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--soft)', fontSize: 13, fontStyle: 'italic' }}>
          Sélectionnez au moins un autre riad pour comparer
        </div>
      )}

      {selected.length === 0 && riads.length > 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--soft)', fontSize: 13, fontStyle: 'italic' }}>
          Sélectionnez 2 ou 3 riads dans la liste ci-dessus
        </div>
      )}

      {riads.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--soft)', fontSize: 13, fontStyle: 'italic' }}>
          Ajoutez des riads dans votre portefeuille pour les comparer
        </div>
      )}
    </div>
  )
}

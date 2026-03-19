'use client'
import { useState } from 'react'
import type { QuartierMarche } from '@/types'
import { QUARTIERS_MARCHE_DEFAULT } from '@/lib/constants'
import { PageHeader, Card, SectionLabel, Btn } from '@/components/ui'

export default function Marche({ marchePrix, onSave }: {
  marchePrix: Record<string, QuartierMarche>
  onSave: (prix: Record<string, QuartierMarche>) => void
}) {
  const [local, setLocal] = useState<Record<string, QuartierMarche>>({ ...marchePrix })
  const [saved, setSaved] = useState(false)

  const set = (key: string, field: 'brut' | 'renove', bound: 'min' | 'max', val: number) => {
    setLocal(prev => ({ ...prev, [key]: { ...prev[key], [field]: { ...prev[key][field], [bound]: val } } }))
    setSaved(false)
  }

  const reset = () => { setLocal({ ...QUARTIERS_MARCHE_DEFAULT }); setSaved(false) }

  const save = () => { onSave(local); setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <PageHeader
        title="Fourchettes marché"
        subtitle="Prix de référence par quartier — mis à jour 2025"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Réinitialiser" onClick={reset} />
            <Btn label={saved ? '✓ Sauvegardé !' : 'Sauvegarder'} onClick={save} primary />
          </div>
        }
      />

      <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--accent-bg)', borderRadius: 8, border: '1px solid rgba(140,90,40,0.2)', fontSize: 12, color: 'var(--mid)' }}>
        Ces fourchettes sont utilisées pour analyser les prix des annonces importées. Ajustez-les selon votre connaissance terrain.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.entries(local).map(([key, q]) => (
          <Card key={key} style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 14 }}>{q.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Brut à rénover */}
              <div>
                <div style={{ fontSize: 10, color: 'var(--soft)', letterSpacing: 0.5, marginBottom: 8 }}>BRUT À RÉNOVER (MAD/m²)</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 4 }}>Min</div>
                    <input className="field-input" type="number" value={q.brut.min} onChange={e => set(key, 'brut', 'min', Number(e.target.value))}
                      style={{ padding: '6px 10px', fontSize: 13 }} />
                  </div>
                  <div style={{ color: 'var(--soft)', marginTop: 16 }}>—</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 4 }}>Max</div>
                    <input className="field-input" type="number" value={q.brut.max} onChange={e => set(key, 'brut', 'max', Number(e.target.value))}
                      style={{ padding: '6px 10px', fontSize: 13 }} />
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--soft)', marginTop: 4 }}>
                  Moy. {Math.round((q.brut.min + q.brut.max) / 2).toLocaleString()} MAD/m²
                </div>
              </div>
              {/* Rénové */}
              <div>
                <div style={{ fontSize: 10, color: '#3A7D5C', letterSpacing: 0.5, marginBottom: 8 }}>RÉNOVÉ (MAD/m²)</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 4 }}>Min</div>
                    <input className="field-input" type="number" value={q.renove.min} onChange={e => set(key, 'renove', 'min', Number(e.target.value))}
                      style={{ padding: '6px 10px', fontSize: 13 }} />
                  </div>
                  <div style={{ color: 'var(--soft)', marginTop: 16 }}>—</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 4 }}>Max</div>
                    <input className="field-input" type="number" value={q.renove.max} onChange={e => set(key, 'renove', 'max', Number(e.target.value))}
                      style={{ padding: '6px 10px', fontSize: 13 }} />
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#3A7D5C', marginTop: 4 }}>
                  Moy. {Math.round((q.renove.min + q.renove.max) / 2).toLocaleString()} MAD/m²
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── COMPOSANT ANALYSE PRIX ────────────────────────────────────────────────
export function AnalysePrix({ prix, surface, quartierKey, etat, marchePrix, nomRiad }: {
  prix: number | null; surface: number | null; quartierKey: string | null
  etat: string | null; marchePrix: Record<string, QuartierMarche>; nomRiad?: string
}) {
  if (!prix || !surface || !quartierKey) return null
  const q = marchePrix[quartierKey]
  if (!q) return null

  const prixM2 = Math.round(prix / surface)
  const isRenove = etat === 'tres_bon' || etat === 'bon'
  const fourchette = isRenove ? q.renove : q.brut
  const moy = Math.round((fourchette.min + fourchette.max) / 2)

  let verdict: { label: string; color: string; bg: string; emoji: string; detail: string }
  if (prixM2 < fourchette.min * 0.9) {
    verdict = { emoji: '🟢', label: 'Sous le marché', color: '#3A7D5C', bg: '#EAF3EC', detail: `${((fourchette.min - prixM2) / fourchette.min * 100).toFixed(0)}% sous la fourchette basse — opportunité !` }
  } else if (prixM2 <= fourchette.max * 1.05) {
    verdict = { emoji: '🟡', label: 'Dans la fourchette', color: '#8C5A28', bg: '#F5EDE3', detail: `Prix cohérent avec le marché ${q.label}` }
  } else {
    verdict = { emoji: '🔴', label: 'Au-dessus du marché', color: '#C0392B', bg: '#FDECEA', detail: `${((prixM2 - fourchette.max) / fourchette.max * 100).toFixed(0)}% au-dessus de la fourchette haute` }
  }

  const negoMin = Math.round(surface * fourchette.min)
  const negoMax = Math.round(surface * moy)

  return (
    <div style={{ padding: '14px 16px', background: verdict.bg, borderRadius: 10, border: `1px solid ${verdict.color}33` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{verdict.emoji}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: verdict.color }}>{verdict.label}</div>
          <div style={{ fontSize: 11, color: 'var(--mid)' }}>{verdict.detail}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ background: 'white', borderRadius: 6, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, color: 'var(--soft)', marginBottom: 2 }}>PRIX ANNONCÉ /m²</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{prixM2.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: 'var(--soft)' }}>MAD/m²</div>
        </div>
        <div style={{ background: 'white', borderRadius: 6, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, color: 'var(--soft)', marginBottom: 2 }}>MARCHÉ {isRenove ? 'RÉNOVÉ' : 'BRUT'}</div>
          <div style={{ fontSize: 13, color: 'var(--mid)' }}>{fourchette.min.toLocaleString()} – {fourchette.max.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: 'var(--soft)' }}>MAD/m² · {q.label}</div>
        </div>
        <div style={{ background: 'white', borderRadius: 6, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, color: 'var(--soft)', marginBottom: 2 }}>CIBLE NÉGOCIATION</div>
          <div style={{ fontSize: 12, color: '#3A7D5C', fontWeight: 500 }}>{(negoMin/1000000).toFixed(1)} – {(negoMax/1000000).toFixed(1)} M</div>
          <div style={{ fontSize: 9, color: 'var(--soft)' }}>MAD · fourchette basse→moy</div>
        </div>
      </div>
    </div>
  )
}

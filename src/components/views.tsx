'use client'
import { useState } from 'react'
import type { Riad, Estimation } from '@/types'
import {
  LEVELS, STATUTS, ETATS, ZONES, TRANSFORMATIONS, QUARTIERS,
  fmtM, fmtMAD, fmtEUR, calcEstimation,
} from '@/lib/constants'
import { Card, SectionLabel, Divider, StatutChip, FieldInput, FieldSelect, StatRow, PrixM2Block, PageHeader, Btn, Chip } from './ui'

export function RiadsList({ riads, onNew, onEdit, onEstimate }: {
  riads: Riad[]; onNew: () => void
  onEdit: (r: Riad) => void; onEstimate: (r: Riad) => void
}) {
  return (
    <div>
      <PageHeader title="Mes riads" subtitle={riads.length + ' biens'} action={<Btn label="Nouveau riad" onClick={onNew} primary sm />} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {riads.map(r => {
          const prix = r.prixN ?? r.prixD
          const m2mad = prix && r.surface ? Math.round(prix / r.surface) : null
          const m2eur = m2mad ? Math.round(m2mad / 11) : null
          return (
            <Card key={r.id} style={{ padding: '16px 20px' }}>
              <div className="riad-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className="serif" style={{ fontSize: 18, color: 'var(--text)', fontStyle: 'italic', fontWeight: 300 }}>{r.nom}</span>
                    <StatutChip statut={r.statut} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--soft)', marginBottom: 8 }}>
                    {r.quartier ? r.quartier + ' — ' : ''}{r.adresse || 'Adresse à renseigner'}
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {[(r.surface ?? '—') + ' m²', (r.niveaux ?? '—') + ' niveaux', r.etat ? ETATS[r.etat] : 'État à préciser'].map(t => (
                      <span key={t} style={{ fontSize: 12, color: 'var(--mid)' }}>{t}</span>
                    ))}
                  </div>
                  {r.potentiel && <div style={{ fontSize: 12, color: 'var(--soft)', marginTop: 6, fontStyle: 'italic' }}>{r.potentiel}</div>}
                </div>
                <div className="riad-card-price" style={{ textAlign: 'right', minWidth: 160 }}>
                  {prix ? (
                    <>
                      <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 2 }}>Prix {r.prixN ? 'négocié' : 'demandé'}</div>
                      <div className="serif" style={{ fontSize: 20, color: r.prixN ? 'var(--accent)' : 'var(--mid)', fontWeight: 300 }}>{fmtM(prix)}</div>
                      {m2mad && <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>{new Intl.NumberFormat('fr-MA').format(m2mad)} MAD/m² · {fmtEUR(m2eur!)}/m²</div>}
                      {r.prixN && r.prixD && r.prixD !== r.prixN && <div style={{ fontSize: 11, color: 'var(--soft)', textDecoration: 'line-through', marginTop: 2 }}>{fmtM(r.prixD)}</div>}
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic' }}>Prix à renseigner</div>
                  )}
                  <div className="riad-card-btns" style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
                    <Btn label="Fiche" onClick={() => onEdit(r)} sm />
                    <Btn label="Estimer" onClick={() => onEstimate(r)} primary sm />
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function RiadFiche({ initial, onSave, onCancel }: {
  initial: Partial<Riad> | null; onSave: (r: Partial<Riad>) => void; onCancel: () => void
}) {
  const [r, setR] = useState<Partial<Riad>>(initial ?? {})
  const isNew = !r.id
  const set = (k: keyof Riad, v: unknown) => setR(prev => ({ ...prev, [k]: v }))
  const prix = r.prixN ?? r.prixD ?? null
  const surf = r.surface ?? null

  return (
    <div>
      <PageHeader
        title={isNew ? 'Nouveau riad' : 'Modifier la fiche'}
        subtitle="Bien immobilier"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Annuler" onClick={onCancel} />
            <Btn label={isNew ? 'Créer' : 'Enregistrer'} onClick={() => { if (r.nom) onSave(r) }} primary />
          </div>
        }
      />
      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <SectionLabel>Identification</SectionLabel>
          <FieldInput label="Nom du riad" value={r.nom} onChange={v => set('nom', v)} placeholder="Riad Almas…" />
          <FieldInput label="Adresse" value={r.adresse} onChange={v => set('adresse', v)} placeholder="Derb Sidi Bouamar…" />
          <FieldSelect label="Quartier" value={r.quartier ?? ''} onChange={v => set('quartier', v)}
            options={QUARTIERS.map(q => [q, q || '— Quartier —'])} />
          <FieldSelect label="Statut" value={r.statut ?? ''} onChange={v => set('statut', v)}
            options={[['', '— Statut —'], ['visite', 'Visite planifiée'], ['negociation', 'En négociation'], ['proposition', 'Proposition envoyée'], ['signe', 'Signé'], ['archive', 'Archivé']]} />
          <FieldSelect label="État du bien" value={r.etat ?? ''} onChange={v => set('etat', v)}
            options={[['', '— État —'], ['bon', 'Bon état'], ['moyen', 'État moyen'], ['mauvais', 'Mauvais état'], ['ruine', 'À rénover']]} />
        </Card>

        <Card>
          <SectionLabel>Surface & structure</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldInput label="Surface au sol (m²)" value={r.surface} onChange={v => set('surface', v ? Number(v) : null)} type="number" placeholder="280" />
            <FieldInput label="Niveaux" value={r.niveaux} onChange={v => set('niveaux', v ? Number(v) : null)} type="number" placeholder="3" />
          </div>
          <Divider />
          <SectionLabel>Prix — après mandat</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldInput label="Prix demandé (MAD)" value={r.prixD} onChange={v => set('prixD', v ? Number(v) : null)} type="number" placeholder="—" />
            <FieldInput label="Prix négocié (MAD)" value={r.prixN} onChange={v => set('prixN', v ? Number(v) : null)} type="number" placeholder="—" />
          </div>
          <PrixM2Block prix={prix} surface={surf} />
        </Card>

        <Card>
          <SectionLabel>Potentiel & contraintes</SectionLabel>
          <div style={{ marginBottom: 16 }}>
            <div className="label">Potentiel d&apos;aménagement</div>
            <textarea className="field-input" value={r.potentiel ?? ''} onChange={e => set('potentiel', e.target.value)}
              placeholder="Maison d'hôtes — 8 chambres, piscine envisageable…" style={{ height: 68, resize: 'vertical' }} />
          </div>
          <div>
            <div className="label">Contraintes</div>
            <textarea className="field-input" value={r.contraintes ?? ''} onChange={e => set('contraintes', e.target.value)}
              placeholder="Plomberie à refaire, mitoyenneté…" style={{ height: 60, resize: 'vertical' }} />
          </div>
        </Card>

        <Card>
          <SectionLabel>Notes</SectionLabel>
          <textarea className="field-input" value={r.notes ?? ''} onChange={e => set('notes', e.target.value)}
            placeholder="Observations, points forts, contexte vendeur…" style={{ height: 130, resize: 'vertical' }} />
        </Card>
      </div>
    </div>
  )
}

export function Estimateur({ riads, estimation, onChange, onResults }: {
  riads: Riad[]; estimation: Estimation
  onChange: (e: Partial<Estimation>) => void; onResults: () => void
}) {
  const e = estimation
  const surfTotal = e.mode === 'rapide'
    ? Number(e.surface) || 0
    : Object.values(e.zones).reduce((a, b) => a + (Number(b) || 0), 0)
  const lvl = LEVELS[e.niveau]
  const quickTotal = surfTotal * Math.round((lvl.min + lvl.max) / 2)

  const toggleTransf = (k: string) => {
    const t = e.transf.includes(k) ? e.transf.filter(x => x !== k) : [...e.transf, k]
    onChange({ transf: t })
  }

  return (
    <div>
      <PageHeader title="Estimation travaux" subtitle="Chiffrage rapide ou détaillé" action={<Btn label="Voir les résultats →" onClick={onResults} primary sm />} />
      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <SectionLabel>Configuration</SectionLabel>
          <div style={{ marginBottom: 16 }}>
            <div className="label">Riad concerné</div>
            <select className="field-input" value={e.riadId ?? ''} onChange={ev => {
              const id = ev.target.value ? Number(ev.target.value) : null
              const r = riads.find(x => x.id === id)
              onChange({ riadId: id, ...(r?.surface ? { surface: r.surface } : {}) })
            }}>
              <option value="">— Aucun riad sélectionné —</option>
              {riads.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className="label">Mode</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
              {([['rapide', 'Rapide'], ['detaille', 'Détaillé']] as const).map(([m, ml]) => (
                <button key={m} onClick={() => onChange({ mode: m })} style={{
                  flex: 1, padding: '8px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  background: e.mode === m ? 'var(--text)' : 'var(--white)',
                  color: e.mode === m ? 'var(--white)' : 'var(--mid)',
                  border: `1px solid ${e.mode === m ? 'var(--text)' : 'var(--line2)'}`,
                }}>{ml}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className="label">Niveau de rénovation</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 5 }}>
              {(Object.entries(LEVELS) as [string, typeof LEVELS[keyof typeof LEVELS]][]).map(([k, v]) => (
                <button key={k} onClick={() => onChange({ niveau: k as Estimation['niveau'] })} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left',
                  background: e.niveau === k ? v.bg : 'var(--white)',
                  border: `1px solid ${e.niveau === k ? v.color + '55' : 'var(--line)'}`,
                }}>
                  <span style={{ fontSize: 12, color: e.niveau === k ? v.color : 'var(--mid)' }}>{v.label}</span>
                  <span style={{ fontSize: 11, color: e.niveau === k ? v.color : 'var(--soft)' }}>
                    {Math.round(v.min / 1000)}–{Math.round(v.max / 1000)} K/m²
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label">Prix maître d&apos;œuvre (MAD/m²)</div>
            <input className="field-input" type="number" value={e.prixPerso}
              onChange={ev => onChange({ prixPerso: ev.target.value })}
              placeholder="Optionnel — remplace les fourchettes" />
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {e.mode === 'rapide' ? (
            <Card>
              <SectionLabel>Surface à rénover</SectionLabel>
              <div style={{ marginBottom: 16 }}>
                <div className="label">m² total</div>
                <input className="field-input" type="number" value={e.surface}
                  onChange={ev => onChange({ surface: Number(ev.target.value) })} placeholder="200" />
              </div>
              <Divider />
              <div style={{ padding: '6px 0' }}>
                <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 8 }}>Estimation rapide</div>
                <div className="serif" style={{ fontSize: 34, color: 'var(--text)', fontWeight: 300 }}>{fmtM(quickTotal)}</div>
                <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 6 }}>
                  {Math.round(surfTotal)} m² × {Math.round((lvl.min + lvl.max) / 2).toLocaleString()} MAD/m²
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <SectionLabel>Surfaces par zone</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ZONES.map(z => (
                  <div key={z.k}>
                    <div className="label">{z.l}</div>
                    <input className="field-input" type="number" value={e.zones[z.k] || 0}
                      onChange={ev => onChange({ zones: { ...e.zones, [z.k]: Number(ev.target.value) } })}
                      placeholder="0" style={{ padding: '7px 10px' }} />
                  </div>
                ))}
              </div>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--mid)' }}>Total</span>
                <span className="serif" style={{ fontSize: 16, fontWeight: 300 }}>{surfTotal} m²</span>
              </div>
            </Card>
          )}

          <Card>
            <SectionLabel>Transformations</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TRANSFORMATIONS.map(t => {
                const checked = e.transf.includes(t.k)
                return (
                  <button key={t.k} onClick={() => toggleTransf(t.k)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', borderRadius: 6, cursor: 'pointer', textAlign: 'left',
                    background: checked ? 'var(--accent-bg)' : 'var(--bg)',
                    border: `1px solid ${checked ? 'rgba(140,90,40,0.35)' : 'var(--line)'}`,
                  }}>
                    <span style={{ fontSize: 12, color: checked ? 'var(--accent)' : 'var(--mid)' }}>
                      {checked ? '✓  ' : ''}{t.l}
                    </span>
                    <span style={{ fontSize: 11, color: checked ? 'var(--accent)' : 'var(--soft)' }}>{fmtM(t.f)}</span>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function Resultats({ estimation, riads, onBack, onRiads }: {
  estimation: Estimation; riads: Riad[]; onBack: () => void; onRiads: () => void
}) {
  const e = estimation
  const surf = e.mode === 'rapide'
    ? Number(e.surface) || 0
    : Object.values(e.zones).reduce((a, b) => a + (Number(b) || 0), 0)

  const res = calcEstimation(e.niveau, surf, e.transf, e.prixPerso)
  const riad = riads.find(r => r.id === e.riadId)
  const maxBudget = surf * LEVELS.luxe.max

  return (
    <div>
      <PageHeader
        title="Résultats travaux"
        subtitle={(riad ? riad.nom + ' — ' : '') + res.lvl.label}
        action={<Btn label="← Modifier" onClick={onBack} />}
      />

      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <div style={{ padding: '12px 0 18px' }}>
              <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 10 }}>Budget travaux estimé</div>
              <div className="serif" style={{ fontSize: 44, color: 'var(--text)', fontWeight: 300, lineHeight: 1 }}>{fmtM(res.total)}</div>
              <div style={{ fontSize: 12, color: 'var(--soft)', marginTop: 8 }}>
                Fourchette — {fmtM(res.tMin)} à {fmtM(res.tMax)}
              </div>
            </div>
            <Divider />
            <StatRow label="Surface" value={res.surf + ' m²'} />
            <StatRow label="Prix moyen retenu" value={new Intl.NumberFormat('fr-MA').format(Math.round(res.pMoy)) + ' MAD/m²'} />
            <StatRow label="Budget minimum" value={fmtM(res.tMin)} />
            <StatRow label="Budget maximum" value={fmtM(res.tMax)} />
            {res.extras > 0 && <StatRow label="Transformations" value={fmtM(res.extras)} color="var(--accent)" />}
          </Card>

          <Card style={{ padding: '14px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 4 }}>Coût au m²</div>
                <div className="serif" style={{ fontSize: 24, color: res.lvl.color, fontWeight: 300 }}>
                  {new Intl.NumberFormat('fr-MA').format(Math.round(res.pMoy))} MAD
                </div>
                <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>
                  ≈ {fmtEUR(Math.round(res.pMoy / 11))}/m²
                </div>
              </div>
              <Chip text={res.lvl.label} color={res.lvl.color} />
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {e.transf.length > 0 && (
            <Card>
              <SectionLabel>Transformations incluses</SectionLabel>
              {e.transf.map(k => {
                const t = TRANSFORMATIONS.find(x => x.k === k)
                return t ? <StatRow key={k} label={'✓ ' + t.l} value={fmtM(t.f)} color="var(--accent)" /> : null
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', marginTop: 4, borderTop: '1px solid var(--line)' }}>
                <span style={{ fontSize: 12, color: 'var(--mid)' }}>Total transformations</span>
                <span className="serif" style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 300 }}>{fmtM(res.extras)}</span>
              </div>
            </Card>
          )}

          <Card>
            <SectionLabel>Comparatif niveaux</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(Object.entries(LEVELS) as [string, typeof LEVELS[keyof typeof LEVELS]][]).map(([k, v]) => {
                const tot = surf * Math.round((v.min + v.max) / 2)
                const active = k === e.niveau
                const pct = maxBudget > 0 ? Math.round(tot / maxBudget * 100) : 0
                return (
                  <div key={k} style={{ opacity: active ? 1 : 0.45 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: active ? v.color : 'var(--mid)' }}>{v.label}</span>
                      <span className="serif" style={{ fontSize: 13, color: active ? v.color : 'var(--mid)', fontWeight: 300 }}>{fmtM(tot)}</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--line)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: pct + '%', background: active ? v.color : 'var(--soft)', borderRadius: 2 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {riad && (
            <Card>
              <SectionLabel>Riad associé</SectionLabel>
              <div className="serif" style={{ fontSize: 18, color: 'var(--text)', fontStyle: 'italic', fontWeight: 300, marginBottom: 4 }}>{riad.nom}</div>
              <div style={{ fontSize: 12, color: 'var(--soft)', marginBottom: riad.potentiel ? 8 : 12 }}>
                {riad.quartier ? riad.quartier + ' — ' : ''}{riad.adresse}
              </div>
              {riad.potentiel && <div style={{ fontSize: 12, color: 'var(--mid)', fontStyle: 'italic', marginBottom: 12 }}>{riad.potentiel}</div>}
              <div style={{ display: 'flex', gap: 20, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--soft)' }}>Surface</div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{(riad.surface ?? '—') + ' m²'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--soft)' }}>Prix</div>
                  <div style={{ fontSize: 13, color: (riad.prixN ?? riad.prixD) ? 'var(--accent)' : 'var(--soft)', marginTop: 2 }}>
                    {fmtM(riad.prixN ?? riad.prixD)}
                  </div>
                </div>
                {(riad.prixN ?? riad.prixD) && riad.surface ? (
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--soft)' }}>Au m²</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>
                      {new Intl.NumberFormat('fr-MA').format(Math.round((riad.prixN ?? riad.prixD)! / riad.surface))} MAD
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Modifier" onClick={onBack} style={{ flex: 1 }} />
            <Btn label="Mes riads" onClick={onRiads} ghost style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

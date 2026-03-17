'use client'
import { useState } from 'react'
import type { Prestataire, TarifPrestataire, SpecialitePrestataire } from '@/types'
import { SPECIALITES, FIABILITE_LABELS, fmtMAD, LIBELLES_TRAVAUX } from '@/lib/constants'
import { Card, SectionLabel, Divider, PageHeader, Btn, FieldInput, FieldSelect, Chip } from '@/components/ui'

const EMPTY_PRESTA: Omit<Prestataire, 'id' | 'createdAt'> = {
  nom: '', specialite: 'moe', telephone: '', email: '', ville: 'Marrakech',
  note: null, fiabilite: '', tarifs: [], projetsRealises: '', observations: '',
}

const EMPTY_TARIF = (): TarifPrestataire => ({
  id: Math.random().toString(36).slice(2), label: '', type: 'm2', prix: 0, unite: '', notes: '',
})

const Stars = ({ note, onChange }: { note: number | null; onChange?: (n: number) => void }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1,2,3,4,5].map(n => (
      <span key={n} onClick={() => onChange?.(n)} style={{ fontSize: 16, cursor: onChange ? 'pointer' : 'default', color: (note ?? 0) >= n ? '#BA7517' : 'var(--line2)', lineHeight: 1 }}>★</span>
    ))}
  </div>
)

// ── FICHE PRESTATAIRE ──────────────────────────────────────────────────────
function PrestataireFiche({ initial, onSave, onCancel }: {
  initial: Partial<Prestataire> | null
  onSave: (p: Omit<Prestataire, 'id' | 'createdAt'>) => void
  onCancel: () => void
}) {
  const [p, setP] = useState<Omit<Prestataire, 'id' | 'createdAt'>>({ ...EMPTY_PRESTA, ...(initial ?? {}) })
  const set = (k: keyof typeof p, v: unknown) => setP(prev => ({ ...prev, [k]: v }))
  const isNew = !(initial as Prestataire)?.id

  const addTarif = () => setP(prev => ({ ...prev, tarifs: [...prev.tarifs, EMPTY_TARIF()] }))

  const updateTarif = (id: string, k: keyof TarifPrestataire, v: unknown) =>
    setP(prev => ({ ...prev, tarifs: prev.tarifs.map(t => t.id === id ? { ...t, [k]: v } : t) }))

  const removeTarif = (id: string) =>
    setP(prev => ({ ...prev, tarifs: prev.tarifs.filter(t => t.id !== id) }))

  const sp = SPECIALITES[p.specialite]

  return (
    <div>
      <PageHeader
        title={isNew ? 'Nouveau prestataire' : 'Modifier le prestataire'}
        subtitle="Fiche artisan / entreprise"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Annuler" onClick={onCancel} />
            <Btn label={isNew ? 'Créer' : 'Enregistrer'} onClick={() => { if (p.nom) onSave(p) }} primary />
          </div>
        }
      />

      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <SectionLabel>Identification</SectionLabel>
          <FieldInput label="Nom / Raison sociale" value={p.nom} onChange={v => set('nom', v)} placeholder="Mohamed Benali, SARL Réno Médina…" />
          <div style={{ marginBottom: 16 }}>
            <div className="label">Spécialité</div>
            <select className="field-input" value={p.specialite} onChange={e => set('specialite', e.target.value as SpecialitePrestataire)}>
              {Object.entries(SPECIALITES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldInput label="Téléphone" value={p.telephone} onChange={v => set('telephone', v)} placeholder="+212 6…" />
            <FieldInput label="Ville" value={p.ville} onChange={v => set('ville', v)} placeholder="Marrakech" />
          </div>
          <FieldInput label="Email" value={p.email} onChange={v => set('email', v)} placeholder="contact@…" />
          <Divider />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="label">Note globale</div>
              <div style={{ marginTop: 8 }}>
                <Stars note={p.note} onChange={n => set('note', n as 1|2|3|4|5)} />
              </div>
            </div>
            <FieldSelect label="Fiabilité" value={p.fiabilite} onChange={v => set('fiabilite', v)}
              options={[['', '— Fiabilité —'], ['excellent', 'Excellent'], ['bon', 'Bon'], ['moyen', 'Moyen'], ['deconseille', 'Déconseillé']]} />
          </div>
        </Card>

        <Card>
          <SectionLabel>Notes & projets</SectionLabel>
          <div style={{ marginBottom: 14 }}>
            <div className="label">Projets réalisés</div>
            <textarea className="field-input" value={p.projetsRealises} onChange={e => set('projetsRealises', e.target.value)}
              placeholder="Riad Almas — rénovation complète 2023, Riad Bahja — plomberie…" style={{ height: 80, resize: 'vertical' }} />
          </div>
          <div>
            <div className="label">Observations</div>
            <textarea className="field-input" value={p.observations} onChange={e => set('observations', e.target.value)}
              placeholder="Ponctuel, bon rapport qualité/prix, spécialisé zellige…" style={{ height: 80, resize: 'vertical' }} />
          </div>
        </Card>

        {/* Grille tarifaire */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionLabel>Grille tarifaire</SectionLabel>
            <Btn label="+ Ajouter un tarif" onClick={addTarif} sm />
          </div>

          {p.tarifs.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic', padding: '12px 0' }}>
              Aucun tarif — cliquez &quot;Ajouter un tarif&quot; pour commencer
            </div>
          )}

          {p.tarifs.map(t => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'flex-end', marginBottom: 10, padding: '12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
              <div>
                <div className="label">Prestation</div>
                <select className="field-input" value={t.label} onChange={e => {
                  const found = LIBELLES_TRAVAUX.find(l => l.label === e.target.value)
                  updateTarif(t.id, 'label', e.target.value)
                  if (found && e.target.value !== 'Autre (libellé libre)') updateTarif(t.id, 'type', found.type)
                }}>
                  <option value="">— Choisir une prestation —</option>
                  {LIBELLES_TRAVAUX.map(l => <option key={l.label} value={l.label}>{l.label}</option>)}
                </select>
                {t.label === 'Autre (libellé libre)' && (
                  <input className="field-input" style={{ marginTop: 6 }} value={t.notes || ''} onChange={e => updateTarif(t.id, 'notes', e.target.value)} placeholder="Précisez le libellé…" />
                )}
              </div>
              <div>
                <div className="label">Type</div>
                <select className="field-input" value={t.type} onChange={e => updateTarif(t.id, 'type', e.target.value)}>
                  <option value="m2">Au m²</option>
                  <option value="forfait">Forfait</option>
                  <option value="unite">À l&apos;unité</option>
                </select>
              </div>
              <div>
                <div className="label">Prix (MAD)</div>
                <input className="field-input" type="number" value={t.prix || ''} onChange={e => updateTarif(t.id, 'prix', Number(e.target.value))} placeholder="0" />
              </div>
              <div>
                <div className="label">Notes</div>
                <input className="field-input" value={t.notes || ''} onChange={e => updateTarif(t.id, 'notes', e.target.value)} placeholder="Hors matériaux…" />
              </div>
              <button onClick={() => removeTarif(t.id)} style={{ padding: '8px', borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--soft)', cursor: 'pointer', fontSize: 14, marginBottom: 0 }}>✕</button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ── LISTE PRESTATAIRES ─────────────────────────────────────────────────────
export default function Prestataires({ prestataires, onAdd, onEdit, onDelete }: {
  prestataires: Prestataire[]
  onAdd: (p: Omit<Prestataire, 'id' | 'createdAt'>) => void
  onEdit: (p: Prestataire) => void
  onDelete: (id: number) => void
}) {
  const [view, setView] = useState<'list' | 'fiche'>('list')
  const [editing, setEditing] = useState<Partial<Prestataire> | null>(null)
  const [filterSpec, setFilterSpec] = useState<string>('')

  const openNew = () => { setEditing(null); setView('fiche') }
  const openEdit = (p: Prestataire) => { setEditing(p); setView('fiche') }

  if (view === 'fiche') {
    return (
      <PrestataireFiche
        initial={editing}
        onSave={p => { if ((editing as Prestataire)?.id) onEdit({ ...p, id: (editing as Prestataire).id, createdAt: (editing as Prestataire).createdAt }); else onAdd(p); setView('list') }}
        onCancel={() => setView('list')}
      />
    )
  }

  const filtered = filterSpec ? prestataires.filter(p => p.specialite === filterSpec) : prestataires

  return (
    <div>
      <PageHeader
        title="Prestataires"
        subtitle={prestataires.length + ' artisans & entreprises'}
        action={<Btn label="Nouveau prestataire" onClick={openNew} primary sm />}
      />

      {/* Filtres par spécialité */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterSpec('')} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, cursor: 'pointer', background: !filterSpec ? 'var(--text)' : 'var(--white)', color: !filterSpec ? 'var(--white)' : 'var(--mid)', border: `1px solid ${!filterSpec ? 'var(--text)' : 'var(--line)'}` }}>
          Tous
        </button>
        {Object.entries(SPECIALITES).map(([k, v]) => {
          const count = prestataires.filter(p => p.specialite === k).length
          if (count === 0) return null
          const active = filterSpec === k
          return (
            <button key={k} onClick={() => setFilterSpec(active ? '' : k)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, cursor: 'pointer', background: active ? v.color : 'var(--white)', color: active ? 'white' : 'var(--mid)', border: `1px solid ${active ? v.color : 'var(--line)'}` }}>
              {v.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Liste vide */}
      {prestataires.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="serif" style={{ fontSize: 20, color: 'var(--soft)', fontStyle: 'italic', fontWeight: 300, marginBottom: 8 }}>Aucun prestataire</div>
          <div style={{ fontSize: 13, color: 'var(--soft)', marginBottom: 20 }}>Ajoutez vos artisans et leurs tarifs pour obtenir des estimations précises</div>
          <Btn label="+ Ajouter le premier prestataire" onClick={openNew} primary />
        </Card>
      )}

      {/* Cartes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(p => {
          const sp = SPECIALITES[p.specialite]
          const fi = p.fiabilite ? FIABILITE_LABELS[p.fiabilite] : null
          const tarifPrincipal = p.tarifs[0]
          return (
            <Card key={p.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: sp.color + '18', color: sp.color, border: `1px solid ${sp.color}33` }}>{sp.label}</span>
                    <span className="serif" style={{ fontSize: 17, color: 'var(--text)', fontWeight: 300 }}>{p.nom}</span>
                    {p.note && <Stars note={p.note} />}
                    {fi && <Chip text={fi.l} color={fi.c} />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--soft)', marginBottom: 8 }}>
                    {p.ville}{p.telephone ? ' · ' + p.telephone : ''}{p.email ? ' · ' + p.email : ''}
                  </div>

                  {/* Tarifs résumés */}
                  {p.tarifs.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      {p.tarifs.slice(0, 4).map(t => (
                        <div key={t.id} style={{ fontSize: 11, padding: '4px 10px', background: 'var(--accent-bg)', borderRadius: 6, border: '1px solid rgba(140,90,40,0.15)', color: 'var(--accent)' }}>
                          {t.label} — <strong>{new Intl.NumberFormat('fr-MA').format(t.prix)} MAD</strong>
                          {t.type === 'm2' ? '/m²' : t.type === 'unite' ? '/u' : ' (forfait)'}
                        </div>
                      ))}
                      {p.tarifs.length > 4 && <div style={{ fontSize: 11, color: 'var(--soft)', padding: '4px 0' }}>+{p.tarifs.length - 4} autres</div>}
                    </div>
                  )}

                  {p.observations && (
                    <div style={{ fontSize: 12, color: 'var(--soft)', marginTop: 8, fontStyle: 'italic' }}>{p.observations}</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                  <Btn label="Modifier" onClick={() => openEdit(p)} sm />
                  <button onClick={() => onDelete(p.id)} style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: 'var(--soft)', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; (e.currentTarget as HTMLElement).style.borderColor = '#f0b8b5' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--soft)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}>
                    ✕
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

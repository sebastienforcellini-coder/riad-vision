'use client'
import { useState, useMemo } from 'react'
import type { Proprietaire, Riad, TypeContact, StatutContact, Interaction } from '@/types'
import { TYPES_CONTACT, STATUTS_CONTACT, TYPES_INTERACTION, fmtM } from '@/lib/constants'
import { Card, SectionLabel, Divider, PageHeader, Btn, FieldInput, FieldSelect, Chip } from '@/components/ui'

const EMPTY: Omit<Proprietaire, 'id' | 'createdAt'> = {
  typeContact: 'proprietaire', statut: 'actif', nom: '', prenom: '',
  telephone: '', email: '', langue: 'Français', origine: '',
  riadsIds: [], motivation: '', prixSouhaite: null,
  delaiVente: '', budget: null, criteres: '', interactions: [], notes: '',
}

function ContactBadge({ type }: { type: TypeContact }) {
  const t = TYPES_CONTACT[type]
  return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: t.bg, color: t.color, border: `1px solid ${t.color}33`, fontWeight: 500 }}>{t.label}</span>
}

function StatutBadge({ statut }: { statut: StatutContact }) {
  const s = STATUTS_CONTACT[statut]
  return <span style={{ fontSize: 10, color: s.color, fontWeight: 500 }}>{s.label}</span>
}

// ── FICHE CONTACT ────────────────────────────────────────────────────────────
function ContactFiche({ initial, riads, onSave, onCancel }: {
  initial: Partial<Proprietaire> | null; riads: Riad[]
  onSave: (p: Omit<Proprietaire, 'id' | 'createdAt'>) => void; onCancel: () => void
}) {
  const [p, setP] = useState<Omit<Proprietaire, 'id' | 'createdAt'>>({ ...EMPTY, ...(initial ?? {}) })
  const [newInter, setNewInter] = useState({ type: 'appel' as keyof typeof TYPES_INTERACTION, notes: '' })
  const isNew = !(initial as Proprietaire)?.id
  const set = (k: keyof typeof p, v: unknown) => setP(prev => ({ ...prev, [k]: v }))
  const isProprio = p.typeContact === 'proprietaire'
  const isProspect = p.typeContact === 'prospect'

  const addInteraction = () => {
    if (!newInter.notes) return
    const inter: Interaction = {
      id: Math.random().toString(36).slice(2),
      date: new Date().toISOString().slice(0, 10),
      type: newInter.type,
      notes: newInter.notes,
    }
    set('interactions', [inter, ...p.interactions])
    setNewInter({ type: 'appel', notes: '' })
  }

  const toggleRiad = (id: number) => {
    const ids = p.riadsIds.includes(id) ? p.riadsIds.filter(x => x !== id) : [...p.riadsIds, id]
    set('riadsIds', ids)
  }

  return (
    <div>
      <PageHeader
        title={isNew ? 'Nouveau contact' : `${p.prenom} ${p.nom}`}
        subtitle="Fiche CRM"
        action={<div style={{ display: 'flex', gap: 8 }}><Btn label="Annuler" onClick={onCancel} /><Btn label={isNew ? 'Créer' : 'Enregistrer'} onClick={() => { if (p.nom) onSave(p) }} primary /></div>}
      />

      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Colonne gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <SectionLabel>Identité</SectionLabel>
            {/* Type de contact */}
            <div style={{ marginBottom: 14 }}>
              <div className="label">Type</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {(Object.entries(TYPES_CONTACT) as [TypeContact, typeof TYPES_CONTACT[TypeContact]][]).map(([k, v]) => (
                  <button key={k} onClick={() => set('typeContact', k)} style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                    background: p.typeContact === k ? v.bg : 'var(--bg)',
                    color: p.typeContact === k ? v.color : 'var(--soft)',
                    border: `1px solid ${p.typeContact === k ? v.color + '55' : 'var(--line)'}`,
                    fontWeight: p.typeContact === k ? 500 : 400,
                  }}>{v.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FieldInput label="Prénom" value={p.prenom} onChange={v => set('prenom', v)} placeholder="Mohamed" />
              <FieldInput label="Nom" value={p.nom} onChange={v => set('nom', v)} placeholder="Benali" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FieldInput label="Téléphone" value={p.telephone} onChange={v => set('telephone', v)} placeholder="+212 6…" />
              <FieldInput label="Email" value={p.email} onChange={v => set('email', v)} placeholder="contact@…" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div className="label">Langue</div>
                <select className="field-input" value={p.langue} onChange={e => set('langue', e.target.value)}>
                  {['Français', 'Arabe', 'Anglais', 'Espagnol', 'Italien', 'Autre'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <div className="label">Statut</div>
                <select className="field-input" value={p.statut} onChange={e => set('statut', e.target.value as StatutContact)}>
                  {(Object.entries(STATUTS_CONTACT) as [StatutContact, typeof STATUTS_CONTACT[StatutContact]][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <FieldInput label="Origine (comment trouvé)" value={p.origine} onChange={v => set('origine', v)} placeholder="Recommandation, Côté Médina, terrain…" />
          </Card>

          {/* Infos selon type */}
          {isProprio && (
            <Card>
              <SectionLabel>Informations vendeur</SectionLabel>
              <div>
                <div className="label">Motivation de vente</div>
                <textarea className="field-input" value={p.motivation} onChange={e => set('motivation', e.target.value)}
                  placeholder="Héritage, départ à l'étranger, besoin de liquidités…" style={{ height: 60, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <FieldInput label="Prix souhaité (MAD)" value={p.prixSouhaite} onChange={v => set('prixSouhaite', v ? Number(v) : null)} type="number" placeholder="—" />
                <div>
                  <div className="label">Délai de vente</div>
                  <select className="field-input" value={p.delaiVente} onChange={e => set('delaiVente', e.target.value)}>
                    <option value="">— Délai —</option>
                    <option value="urgent">Urgent</option>
                    <option value="3mois">3 mois</option>
                    <option value="6mois">6 mois</option>
                    <option value="1an">1 an</option>
                    <option value="sanspresse">Sans presse</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {isProspect && (
            <Card>
              <SectionLabel>Critères acheteur</SectionLabel>
              <FieldInput label="Budget (MAD)" value={p.budget} onChange={v => set('budget', v ? Number(v) : null)} type="number" placeholder="—" />
              <div style={{ marginTop: 12 }}>
                <div className="label">Ce qu&apos;il recherche</div>
                <textarea className="field-input" value={p.criteres} onChange={e => set('criteres', e.target.value)}
                  placeholder="Riad avec piscine, Mouassine, min 4 chambres, budget max…" style={{ height: 72, resize: 'vertical' }} />
              </div>
            </Card>
          )}

          <Card>
            <SectionLabel>Notes</SectionLabel>
            <textarea className="field-input" value={p.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Observations, contexte, points importants…" style={{ height: 80, resize: 'vertical' }} />
          </Card>
        </div>

        {/* Colonne droite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Riads associés */}
          <Card>
            <SectionLabel>Riads associés</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {riads.map(r => (
                <button key={r.id} onClick={() => toggleRiad(r.id)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  background: p.riadsIds.includes(r.id) ? 'var(--accent-bg)' : 'var(--bg)',
                  border: `1px solid ${p.riadsIds.includes(r.id) ? 'rgba(140,90,40,0.35)' : 'var(--line)'}`,
                }}>
                  <div>
                    <div style={{ fontSize: 13, color: p.riadsIds.includes(r.id) ? 'var(--accent)' : 'var(--text)', fontWeight: p.riadsIds.includes(r.id) ? 500 : 400 }}>
                      {p.riadsIds.includes(r.id) ? '✓ ' : ''}{r.nom}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--soft)' }}>{r.quartier}{r.surface ? ` · ${r.surface} m²` : ''}</div>
                  </div>
                  {(r.prixN ?? r.prixD) && <div style={{ fontSize: 11, color: 'var(--soft)' }}>{fmtM(r.prixN ?? r.prixD)}</div>}
                </button>
              ))}
              {riads.length === 0 && <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic' }}>Aucun riad dans le portefeuille</div>}
            </div>
          </Card>

          {/* Historique interactions */}
          <Card>
            <SectionLabel>Historique des échanges</SectionLabel>
            {/* Nouvelle interaction */}
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <div className="label" style={{ marginBottom: 6 }}>Ajouter un échange</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {(Object.entries(TYPES_INTERACTION) as [keyof typeof TYPES_INTERACTION, typeof TYPES_INTERACTION[keyof typeof TYPES_INTERACTION]][]).map(([k, v]) => (
                  <button key={k} onClick={() => setNewInter(n => ({ ...n, type: k }))} style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                    background: newInter.type === k ? 'var(--text)' : 'var(--white)',
                    color: newInter.type === k ? 'var(--white)' : 'var(--soft)',
                    border: `1px solid ${newInter.type === k ? 'var(--text)' : 'var(--line)'}`,
                  }}>{v.emoji} {v.label}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea className="field-input" value={newInter.notes} onChange={e => setNewInter(n => ({ ...n, notes: e.target.value }))}
                  placeholder="Notes sur l'échange…" style={{ height: 52, resize: 'none', flex: 1 }} />
                <button onClick={addInteraction} disabled={!newInter.notes} style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 12, cursor: newInter.notes ? 'pointer' : 'default',
                  background: newInter.notes ? 'var(--text)' : 'var(--bg)', color: newInter.notes ? 'var(--white)' : 'var(--soft)',
                  border: 'none', alignSelf: 'flex-end',
                }}>+ Ajouter</button>
              </div>
            </div>

            {/* Liste interactions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {p.interactions.length === 0 && <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic' }}>Aucun échange enregistré</div>}
              {p.interactions.map(inter => {
                const t = TYPES_INTERACTION[inter.type]
                return (
                  <div key={inter.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 16, lineHeight: 1, marginTop: 2 }}>{t.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--mid)' }}>{t.label}</span>
                        <span style={{ fontSize: 10, color: 'var(--soft)' }}>
                          {new Date(inter.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text)' }}>{inter.notes}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── LISTE CRM ────────────────────────────────────────────────────────────────
export default function CRM({ proprietaires, riads, onAdd, onEdit, onDelete }: {
  proprietaires: Proprietaire[]; riads: Riad[]
  onAdd: (p: Omit<Proprietaire, 'id' | 'createdAt'>) => void
  onEdit: (p: Proprietaire) => void
  onDelete: (id: number) => void
}) {
  const [view, setView] = useState<'list' | 'fiche'>('list')
  const [editing, setEditing] = useState<Partial<Proprietaire> | null>(null)
  const [filtre, setFiltre] = useState<TypeContact | 'tous'>('tous')

  const openNew = () => { setEditing(null); setView('fiche') }
  const openEdit = (p: Proprietaire) => { setEditing(p); setView('fiche') }

  if (view === 'fiche') {
    return (
      <ContactFiche
        initial={editing}
        riads={riads}
        onSave={p => {
          if ((editing as Proprietaire)?.id) onEdit({ ...p, id: (editing as Proprietaire).id, createdAt: (editing as Proprietaire).createdAt })
          else onAdd(p)
          setView('list')
        }}
        onCancel={() => setView('list')}
      />
    )
  }

  const filtered = filtre === 'tous' ? proprietaires : proprietaires.filter(p => p.typeContact === filtre)
  const sorted = [...filtered].sort((a, b) => {
    const order = { chaud: 0, actif: 1, froid: 2, clos: 3 }
    return order[a.statut] - order[b.statut]
  })

  return (
    <div>
      <PageHeader
        title="Contacts & Prospects"
        subtitle={proprietaires.length + ' contacts'}
        action={<Btn label="Nouveau contact" onClick={openNew} primary sm />}
      />

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFiltre('tous')} style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer', background: filtre === 'tous' ? 'var(--text)' : 'var(--white)', color: filtre === 'tous' ? 'var(--white)' : 'var(--mid)', border: `1px solid ${filtre === 'tous' ? 'var(--text)' : 'var(--line)'}` }}>
          Tous ({proprietaires.length})
        </button>
        {(Object.entries(TYPES_CONTACT) as [TypeContact, typeof TYPES_CONTACT[TypeContact]][]).map(([k, v]) => {
          const count = proprietaires.filter(p => p.typeContact === k).length
          if (count === 0) return null
          return (
            <button key={k} onClick={() => setFiltre(k)} style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer', background: filtre === k ? v.color : 'var(--white)', color: filtre === k ? 'white' : 'var(--mid)', border: `1px solid ${filtre === k ? v.color : 'var(--line)'}` }}>
              {v.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Liste vide */}
      {proprietaires.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="serif" style={{ fontSize: 20, color: 'var(--soft)', fontStyle: 'italic', fontWeight: 300, marginBottom: 8 }}>Aucun contact</div>
          <div style={{ fontSize: 13, color: 'var(--soft)', marginBottom: 20 }}>Ajoutez vos propriétaires et prospects</div>
          <Btn label="+ Nouveau contact" onClick={openNew} primary />
        </Card>
      )}

      {/* Cartes contacts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map(p => {
          const tc = TYPES_CONTACT[p.typeContact]
          const sc = STATUTS_CONTACT[p.statut]
          const linkedRiads = riads.filter(r => p.riadsIds.includes(r.id))
          const lastInter = p.interactions[0]
          return (
            <Card key={p.id} style={{ padding: '16px 20px', borderLeft: `3px solid ${tc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <ContactBadge type={p.typeContact} />
                    <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--text)' }}>{p.prenom} {p.nom}</span>
                    <StatutBadge statut={p.statut} />
                    {p.langue && p.langue !== 'Français' && <span style={{ fontSize: 10, color: 'var(--soft)' }}>{p.langue}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
                    {p.telephone && <span style={{ fontSize: 12, color: 'var(--mid)' }}>📞 {p.telephone}</span>}
                    {p.email && <span style={{ fontSize: 12, color: 'var(--mid)' }}>✉️ {p.email}</span>}
                    {p.origine && <span style={{ fontSize: 12, color: 'var(--soft)' }}>Via {p.origine}</span>}
                  </div>
                  {/* Riads liés */}
                  {linkedRiads.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                      {linkedRiads.map(r => (
                        <span key={r.id} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 10, border: '1px solid rgba(140,90,40,0.2)' }}>{r.nom}</span>
                      ))}
                    </div>
                  )}
                  {/* Infos rapides */}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {p.typeContact === 'proprietaire' && p.prixSouhaite && <span style={{ fontSize: 11, color: 'var(--soft)' }}>Prix souhaité : {fmtM(p.prixSouhaite)}</span>}
                    {p.typeContact === 'prospect' && p.budget && <span style={{ fontSize: 11, color: 'var(--soft)' }}>Budget : {fmtM(p.budget)}</span>}
                    {p.interactions.length > 0 && <span style={{ fontSize: 11, color: 'var(--soft)' }}>💬 {p.interactions.length} échange{p.interactions.length > 1 ? 's' : ''}</span>}
                  </div>
                  {/* Dernier échange */}
                  {lastInter && (
                    <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 4, fontStyle: 'italic' }}>
                      Dernier : {TYPES_INTERACTION[lastInter.type].emoji} {lastInter.notes.slice(0, 60)}{lastInter.notes.length > 60 ? '…' : ''}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                  <Btn label="Fiche" onClick={() => openEdit(p)} sm />
                  <button onClick={() => onDelete(p.id)} style={{ padding: '6px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: 'var(--soft)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; (e.currentTarget as HTMLElement).style.borderColor = '#f0b8b5' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--soft)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}>✕</button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

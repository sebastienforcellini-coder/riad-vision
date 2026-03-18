'use client'
import { useState, useMemo } from 'react'
import type { Rdv, Riad, TypeRdv } from '@/types'
import { TYPES_RDV } from '@/lib/constants'
import { Card, SectionLabel, Divider, PageHeader, Btn, FieldInput, FieldSelect } from '@/components/ui'

const EMPTY_RDV: Omit<Rdv, 'id' | 'createdAt'> = {
  titre: '', type: 'visite', riadId: null, date: '', heure: '10:00',
  duree: 60, lieu: '', contact: '', notes: '', fait: false,
}

function TypeBadge({ type }: { type: TypeRdv }) {
  const t = TYPES_RDV[type]
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: t.bg, color: t.color, border: `1px solid ${t.color}33`, fontWeight: 500 }}>
      {t.label}
    </span>
  )
}

function RdvForm({ initial, riads, onSave, onCancel }: {
  initial: Partial<Rdv> | null; riads: Riad[]
  onSave: (r: Omit<Rdv, 'id' | 'createdAt'>) => void; onCancel: () => void
}) {
  const [r, setR] = useState<Omit<Rdv, 'id' | 'createdAt'>>({ ...EMPTY_RDV, ...(initial ?? {}) })
  const set = (k: keyof typeof r, v: unknown) => setR(prev => ({ ...prev, [k]: v }))
  const isNew = !(initial as Rdv)?.id

  // Pré-remplir le titre si riad sélectionné
  const handleRiad = (id: string) => {
    const rid = id ? Number(id) : null
    const riad = riads.find(x => x.id === rid)
    set('riadId', rid)
    if (riad && !r.titre) set('titre', `${TYPES_RDV[r.type].label} — ${riad.nom}`)
    if (riad?.adresse && !r.lieu) set('lieu', riad.adresse)
  }

  return (
    <div>
      <PageHeader title={isNew ? 'Nouveau RDV' : 'Modifier le RDV'} subtitle="Agenda"
        action={<div style={{ display: 'flex', gap: 8 }}><Btn label="Annuler" onClick={onCancel} /><Btn label={isNew ? 'Créer' : 'Enregistrer'} onClick={() => { if (r.titre && r.date) onSave(r) }} primary /></div>}
      />
      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <SectionLabel>Détails</SectionLabel>
          <FieldInput label="Titre du RDV" value={r.titre} onChange={v => set('titre', v)} placeholder="Visite Riad Almas…" />
          <div style={{ marginBottom: 16 }}>
            <div className="label">Type</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {(Object.entries(TYPES_RDV) as [TypeRdv, typeof TYPES_RDV[TypeRdv]][]).map(([k, v]) => (
                <button key={k} onClick={() => set('type', k)} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                  background: r.type === k ? v.bg : 'var(--bg)',
                  color: r.type === k ? v.color : 'var(--soft)',
                  border: `1px solid ${r.type === k ? v.color + '55' : 'var(--line)'}`,
                  fontWeight: r.type === k ? 500 : 400,
                }}>{v.label}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div className="label">Riad concerné</div>
            <select className="field-input" value={r.riadId ?? ''} onChange={e => handleRiad(e.target.value)}>
              <option value="">— Aucun riad —</option>
              {riads.map(riad => <option key={riad.id} value={riad.id}>{riad.nom}</option>)}
            </select>
          </div>
          <FieldInput label="Contact (nom / téléphone)" value={r.contact} onChange={v => set('contact', v)} placeholder="Mohamed +212 6…" />
          <FieldInput label="Lieu" value={r.lieu} onChange={v => set('lieu', v)} placeholder="Derb Sidi Bouamar, Médina…" />
        </Card>

        <Card>
          <SectionLabel>Date & heure</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <FieldInput label="Date" value={r.date} onChange={v => set('date', v)} type="date" placeholder="" />
            <FieldInput label="Heure" value={r.heure} onChange={v => set('heure', v)} type="time" placeholder="" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div className="label">Durée</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              {[30, 60, 90, 120].map(d => (
                <button key={d} onClick={() => set('duree', d)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                  background: r.duree === d ? 'var(--text)' : 'var(--bg)',
                  color: r.duree === d ? 'var(--white)' : 'var(--mid)',
                  border: `1px solid ${r.duree === d ? 'var(--text)' : 'var(--line)'}`,
                }}>{d >= 60 ? `${d / 60}h` : `${d}min`}{d === 90 ? '30' : ''}</button>
              ))}
            </div>
          </div>
          <Divider />
          <SectionLabel>Notes</SectionLabel>
          <textarea className="field-input" value={r.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Prévoir les plans, contacter le notaire…" style={{ height: 80, resize: 'vertical' }} />
        </Card>
      </div>
    </div>
  )
}

export default function Agenda({ rdvs, riads, onAdd, onEdit, onDelete, onToggleFait }: {
  rdvs: Rdv[]; riads: Riad[]
  onAdd: (r: Omit<Rdv, 'id' | 'createdAt'>) => void
  onEdit: (r: Rdv) => void
  onDelete: (id: number) => void
  onToggleFait: (r: Rdv) => void
}) {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editing, setEditing] = useState<Partial<Rdv> | null>(null)
  const [filtre, setFiltre] = useState<'tous' | 'aVenir' | 'passes'>('aVenir')

  const today = new Date().toISOString().slice(0, 10)

  const sorted = useMemo(() => {
    return [...rdvs].sort((a, b) => (a.date + a.heure).localeCompare(b.date + b.heure))
  }, [rdvs])

  const filtered = useMemo(() => {
    if (filtre === 'aVenir') return sorted.filter(r => r.date >= today && !r.fait)
    if (filtre === 'passes') return sorted.filter(r => r.date < today || r.fait).reverse()
    return sorted
  }, [sorted, filtre, today])

  // Prochains RDV pour le dashboard
  const prochains = sorted.filter(r => r.date >= today && !r.fait).slice(0, 3)

  const openNew = () => { setEditing(null); setView('form') }
  const openEdit = (r: Rdv) => { setEditing(r); setView('form') }

  if (view === 'form') {
    return (
      <RdvForm
        initial={editing}
        riads={riads}
        onSave={r => {
          if ((editing as Rdv)?.id) onEdit({ ...r, id: (editing as Rdv).id, createdAt: (editing as Rdv).createdAt })
          else onAdd(r)
          setView('list')
        }}
        onCancel={() => setView('list')}
      />
    )
  }

  const formatDate = (d: string) => {
    if (!d) return ''
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const isToday = (d: string) => d === today
  const isTomorrow = (d: string) => {
    const t = new Date(); t.setDate(t.getDate() + 1)
    return d === t.toISOString().slice(0, 10)
  }
  const dayLabel = (d: string) => {
    if (isToday(d)) return "Aujourd'hui"
    if (isTomorrow(d)) return 'Demain'
    return formatDate(d)
  }

  // Grouper par date
  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = []
    acc[r.date].push(r)
    return acc
  }, {} as Record<string, Rdv[]>)

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle={rdvs.filter(r => r.date >= today && !r.fait).length + ' RDV à venir'}
        action={<Btn label="Nouveau RDV" onClick={openNew} primary sm />}
      />

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([['aVenir', 'À venir'], ['tous', 'Tous'], ['passes', 'Passés']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFiltre(k)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            background: filtre === k ? 'var(--text)' : 'var(--white)',
            color: filtre === k ? 'var(--white)' : 'var(--mid)',
            border: `1px solid ${filtre === k ? 'var(--text)' : 'var(--line)'}`,
          }}>{l}</button>
        ))}
      </div>

      {/* Liste vide */}
      {filtered.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="serif" style={{ fontSize: 20, color: 'var(--soft)', fontStyle: 'italic', fontWeight: 300, marginBottom: 8 }}>
            {filtre === 'aVenir' ? 'Aucun RDV à venir' : 'Aucun RDV'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--soft)', marginBottom: 20 }}>Planifiez vos visites et rendez-vous</div>
          <Btn label="+ Nouveau RDV" onClick={openNew} primary />
        </Card>
      )}

      {/* Groupes par date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Object.entries(grouped).map(([date, rdvList]) => (
          <div key={date}>
            {/* En-tête de date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                fontSize: 12, fontWeight: 500,
                color: isToday(date) ? '#8C5A28' : 'var(--mid)',
                background: isToday(date) ? '#F5EDE3' : 'transparent',
                padding: isToday(date) ? '3px 10px' : '0',
                borderRadius: isToday(date) ? 10 : 0,
              }}>
                {dayLabel(date)}
              </div>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <div style={{ fontSize: 11, color: 'var(--soft)' }}>{rdvList.length} RDV</div>
            </div>

            {/* RDVs de cette date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rdvList.map(r => {
                const riad = riads.find(x => x.id === r.riadId)
                const t = TYPES_RDV[r.type]
                return (
                  <Card key={r.id} style={{ padding: '14px 18px', opacity: r.fait ? 0.6 : 1, borderLeft: `3px solid ${t.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: r.fait ? 'var(--soft)' : 'var(--text)', textDecoration: r.fait ? 'line-through' : 'none' }}>{r.titre}</span>
                          <TypeBadge type={r.type} />
                        </div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>🕐 {r.heure}{r.duree ? ` · ${r.duree >= 60 ? r.duree / 60 + 'h' : r.duree + 'min'}` : ''}</span>
                          {r.lieu && <span style={{ fontSize: 12, color: 'var(--soft)' }}>📍 {r.lieu}</span>}
                          {r.contact && <span style={{ fontSize: 12, color: 'var(--soft)' }}>👤 {r.contact}</span>}
                          {riad && <span style={{ fontSize: 12, color: 'var(--mid)', fontStyle: 'italic' }}>{riad.nom}</span>}
                        </div>
                        {r.notes && <div style={{ fontSize: 12, color: 'var(--soft)', marginTop: 6, fontStyle: 'italic' }}>{r.notes}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 12 }}>
                        {/* Bouton fait / à faire */}
                        <button onClick={() => onToggleFait({ ...r, fait: !r.fait })} title={r.fait ? 'Marquer à faire' : 'Marquer fait'} style={{
                          width: 28, height: 28, borderRadius: '50%', border: `2px solid ${r.fait ? '#3A7D5C' : 'var(--line)'}`,
                          background: r.fait ? '#3A7D5C' : 'transparent', color: r.fait ? 'white' : 'var(--soft)',
                          cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✓</button>
                        <Btn label="Modifier" onClick={() => openEdit(r)} sm />
                        <button onClick={() => onDelete(r.id)} style={{ padding: '6px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: 'var(--soft)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; (e.currentTarget as HTMLElement).style.borderColor = '#f0b8b5' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--soft)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}>✕</button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

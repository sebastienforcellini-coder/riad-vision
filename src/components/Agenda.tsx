'use client'
import { useState, useMemo } from 'react'
import type { Rdv, Riad, TypeRdv } from '@/types'
import { TYPES_RDV } from '@/lib/constants'
import { Card, SectionLabel, Divider, PageHeader, Btn, FieldInput } from '@/components/ui'

const EMPTY_RDV: Omit<Rdv, 'id' | 'createdAt'> = {
  titre: '', type: 'visite', riadId: null, date: '', heure: '10:00',
  duree: 60, lieu: '', contact: '', notes: '', fait: false,
}

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

function TypeBadge({ type }: { type: TypeRdv }) {
  const t = TYPES_RDV[type]
  return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: t.bg, color: t.color, border: `1px solid ${t.color}33`, fontWeight: 500 }}>{t.label}</span>
}

// ── CALENDRIER ──────────────────────────────────────────────────────────────
function Calendrier({ rdvs, riads, onNewRdv, onEditRdv }: {
  rdvs: Rdv[]; riads: Riad[]
  onNewRdv: (date: string) => void
  onEditRdv: (r: Rdv) => void
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const todayStr = today.toISOString().slice(0, 10)

  // Jours du mois
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // lundi = 0
  const daysInMonth = lastDay.getDate()

  // RDVs indexés par date
  const rdvsByDate = useMemo(() => {
    const idx: Record<string, Rdv[]> = {}
    rdvs.forEach(r => { if (!idx[r.date]) idx[r.date] = []; idx[r.date].push(r) })
    return idx
  }, [rdvs])

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  // Compléter pour avoir des rangées complètes
  while (cells.length % 7 !== 0) cells.push(null)

  const formatTooltipDate = (d: string) => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      .replace(/^./, c => c.toUpperCase())
  }

  const hoveredRdvs = hovered ? (rdvsByDate[hovered] || []) : []

  return (
    <div style={{ position: 'relative' }}>
      {/* Navigation mois */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: 'var(--mid)', fontSize: 14 }}>‹</button>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontStyle: 'italic', color: 'var(--text)', fontWeight: 300 }}>
          {MOIS[month]} {year}
        </div>
        <button onClick={nextMonth} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: 'var(--mid)', fontSize: 14 }}>›</button>
      </div>

      {/* Grille */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {/* En-têtes jours */}
        {JOURS.map(j => (
          <div key={j} style={{ textAlign: 'center', fontSize: 10, color: 'var(--soft)', padding: '4px 0', fontWeight: 500, letterSpacing: 0.5 }}>{j}</div>
        ))}

        {/* Cases */}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayRdvs = rdvsByDate[dateStr] || []
          const hasRdv = dayRdvs.length > 0
          const isToday = dateStr === todayStr
          const isHovered = hovered === dateStr

          return (
            <div
              key={i}
              onMouseEnter={e => { if (hasRdv) { setHovered(dateStr); setTooltipPos({ x: e.clientX, y: e.clientY }) } }}
              onMouseMove={e => { if (hasRdv) setTooltipPos({ x: e.clientX, y: e.clientY }) }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => hasRdv ? onEditRdv(dayRdvs[0]) : onNewRdv(dateStr)}
              style={{
                position: 'relative',
                textAlign: 'center',
                padding: '8px 4px',
                borderRadius: 8,
                cursor: 'pointer',
                background: isHovered ? 'var(--accent-bg)' : isToday ? '#F5EDE3' : 'transparent',
                border: isToday ? '1px solid #8C5A28' : '1px solid transparent',
                transition: 'all 0.1s',
              }}
            >
              {/* Numéro du jour */}
              <div style={{
                fontSize: 13,
                color: isToday ? '#8C5A28' : 'var(--text)',
                fontWeight: isToday ? 600 : 400,
                lineHeight: 1,
                marginBottom: hasRdv ? 4 : 0,
              }}>{day}</div>

              {/* Points RDV */}
              {hasRdv && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {dayRdvs.slice(0, 3).map((r, idx) => (
                    <div key={idx} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: r.fait ? 'var(--soft)' : TYPES_RDV[r.type].color,
                    }} />
                  ))}
                  {dayRdvs.length > 3 && <div style={{ fontSize: 8, color: 'var(--soft)', lineHeight: '5px' }}>+{dayRdvs.length - 3}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tooltip au survol */}
      {hovered && hoveredRdvs.length > 0 && (
        <div style={{
          position: 'fixed',
          left: tooltipPos.x + 12,
          top: tooltipPos.y - 10,
          zIndex: 999,
          background: 'var(--white)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: '12px 14px',
          minWidth: 220,
          maxWidth: 300,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 8 }}>{formatTooltipDate(hovered)}</div>
          {hoveredRdvs.map(r => {
            const riad = riads.find(x => x.id === r.riadId)
            return (
              <div key={r.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: hoveredRdvs.indexOf(r) < hoveredRdvs.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: TYPES_RDV[r.type].color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: r.fait ? 'var(--soft)' : 'var(--text)', textDecoration: r.fait ? 'line-through' : 'none' }}>{r.titre}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--soft)', paddingLeft: 12 }}>
                  🕐 {r.heure}{r.duree ? ` · ${r.duree >= 60 ? r.duree / 60 + 'h' : r.duree + 'min'}` : ''}
                  {r.lieu ? ` · ${r.lieu}` : ''}
                  {riad ? <div style={{ marginTop: 2, fontStyle: 'italic' }}>{riad.nom}</div> : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Légende */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
        {(Object.entries(TYPES_RDV) as [TypeRdv, typeof TYPES_RDV[TypeRdv]][]).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: v.color }} />
            <span style={{ fontSize: 10, color: 'var(--soft)' }}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── FORMULAIRE ──────────────────────────────────────────────────────────────
function RdvForm({ initial, riads, onSave, onCancel }: {
  initial: Partial<Rdv> | null; riads: Riad[]
  onSave: (r: Omit<Rdv, 'id' | 'createdAt'>) => void; onCancel: () => void
}) {
  const [r, setR] = useState<Omit<Rdv, 'id' | 'createdAt'>>({ ...EMPTY_RDV, ...(initial ?? {}) })
  const set = (k: keyof typeof r, v: unknown) => setR(prev => ({ ...prev, [k]: v }))
  const isNew = !(initial as Rdv)?.id

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
                  background: r.type === k ? v.bg : 'var(--bg)', color: r.type === k ? v.color : 'var(--soft)',
                  border: `1px solid ${r.type === k ? v.color + '55' : 'var(--line)'}`, fontWeight: r.type === k ? 500 : 400,
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
                }}>{d === 30 ? '30min' : d === 60 ? '1h' : d === 90 ? '1h30' : '2h'}</button>
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

// ── AGENDA PRINCIPAL ─────────────────────────────────────────────────────────
export default function Agenda({ rdvs, riads, onAdd, onEdit, onDelete, onToggleFait }: {
  rdvs: Rdv[]; riads: Riad[]
  onAdd: (r: Omit<Rdv, 'id' | 'createdAt'>) => void
  onEdit: (r: Rdv) => void
  onDelete: (id: number) => void
  onToggleFait: (r: Rdv) => void
}) {
  const [view, setView] = useState<'calendrier' | 'liste' | 'form'>('calendrier')
  const [editing, setEditing] = useState<Partial<Rdv> | null>(null)
  const [filtre, setFiltre] = useState<'tous' | 'aVenir' | 'passes'>('aVenir')

  const today = new Date().toISOString().slice(0, 10)
  const sorted = useMemo(() => [...rdvs].sort((a, b) => (a.date + a.heure).localeCompare(b.date + b.heure)), [rdvs])
  const filtered = useMemo(() => {
    if (filtre === 'aVenir') return sorted.filter(r => r.date >= today && !r.fait)
    if (filtre === 'passes') return sorted.filter(r => r.date < today || r.fait).reverse()
    return sorted
  }, [sorted, filtre, today])

  const openNew = (date?: string) => {
    setEditing(date ? { ...EMPTY_RDV, date } : null)
    setView('form')
  }
  const openEdit = (r: Rdv) => { setEditing(r); setView('form') }

  if (view === 'form') {
    return (
      <RdvForm
        initial={editing}
        riads={riads}
        onSave={r => {
          if ((editing as Rdv)?.id) onEdit({ ...r, id: (editing as Rdv).id, createdAt: (editing as Rdv).createdAt })
          else onAdd(r)
          setView('calendrier')
        }}
        onCancel={() => setView('calendrier')}
      />
    )
  }

  const dayLabel = (d: string) => {
    const t = new Date(); const tom = new Date(); tom.setDate(t.getDate() + 1)
    if (d === today) return "Aujourd'hui"
    if (d === tom.toISOString().slice(0, 10)) return 'Demain'
    return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, c => c.toUpperCase())
  }

  const grouped = filtered.reduce((acc, r) => { if (!acc[r.date]) acc[r.date] = []; acc[r.date].push(r); return acc }, {} as Record<string, Rdv[]>)

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle={rdvs.filter(r => r.date >= today && !r.fait).length + ' RDV à venir'}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
              {(['calendrier', 'liste'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '7px 14px', fontSize: 12, cursor: 'pointer', border: 'none',
                  background: view === v ? 'var(--text)' : 'var(--white)',
                  color: view === v ? 'var(--white)' : 'var(--mid)',
                }}>{v === 'calendrier' ? '📅 Calendrier' : '☰ Liste'}</button>
              ))}
            </div>
            <Btn label="+ RDV" onClick={() => openNew()} primary sm />
          </div>
        }
      />

      {/* VUE CALENDRIER */}
      {view === 'calendrier' && (
        <Card>
          <Calendrier rdvs={rdvs} riads={riads} onNewRdv={openNew} onEditRdv={openEdit} />
        </Card>
      )}

      {/* VUE LISTE */}
      {view === 'liste' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['aVenir', 'tous', 'passes'] as const).map(k => (
              <button key={k} onClick={() => setFiltre(k)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: filtre === k ? 'var(--text)' : 'var(--white)',
                color: filtre === k ? 'var(--white)' : 'var(--mid)',
                border: `1px solid ${filtre === k ? 'var(--text)' : 'var(--line)'}`,
              }}>{{ aVenir: 'À venir', tous: 'Tous', passes: 'Passés' }[k]}</button>
            ))}
          </div>

          {filtered.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div className="serif" style={{ fontSize: 20, color: 'var(--soft)', fontStyle: 'italic', fontWeight: 300, marginBottom: 8 }}>Aucun RDV</div>
              <div style={{ fontSize: 13, color: 'var(--soft)', marginBottom: 20 }}>Planifiez vos visites et rendez-vous</div>
              <Btn label="+ Nouveau RDV" onClick={() => openNew()} primary />
            </Card>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Object.entries(grouped).map(([date, rdvList]) => (
              <div key={date}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: date === today ? '#8C5A28' : 'var(--mid)', background: date === today ? '#F5EDE3' : 'transparent', padding: date === today ? '3px 10px' : '0', borderRadius: date === today ? 10 : 0 }}>
                    {dayLabel(date)}
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                  <div style={{ fontSize: 11, color: 'var(--soft)' }}>{rdvList.length} RDV</div>
                </div>
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
                              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>🕐 {r.heure}{r.duree ? ` · ${r.duree === 30 ? '30min' : r.duree === 60 ? '1h' : r.duree === 90 ? '1h30' : '2h'}` : ''}</span>
                              {r.lieu && <span style={{ fontSize: 12, color: 'var(--soft)' }}>📍 {r.lieu}</span>}
                              {r.contact && <span style={{ fontSize: 12, color: 'var(--soft)' }}>👤 {r.contact}</span>}
                              {riad && <span style={{ fontSize: 12, color: 'var(--mid)', fontStyle: 'italic' }}>{riad.nom}</span>}
                            </div>
                            {r.notes && <div style={{ fontSize: 12, color: 'var(--soft)', marginTop: 6, fontStyle: 'italic' }}>{r.notes}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 12 }}>
                            <button onClick={() => onToggleFait({ ...r, fait: !r.fait })} title={r.fait ? 'Marquer à faire' : 'Marquer fait'} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${r.fait ? '#3A7D5C' : 'var(--line)'}`, background: r.fait ? '#3A7D5C' : 'transparent', color: r.fait ? 'white' : 'var(--soft)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</button>
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
      )}
    </div>
  )
}

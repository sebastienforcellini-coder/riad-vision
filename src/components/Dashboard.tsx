'use client'
import { useState, useEffect } from 'react'
import type { Riad, Rdv } from '@/types'
import type { View } from '@/app/page'
import { STATUTS, TYPES_RDV, fmtM } from '@/lib/constants'
import { Card, StatutChip, Btn } from './ui'

function Clock() {
  const [now, setNow] = useState(new Date())
  const [tz, setTz] = useState<'Europe/Paris' | 'Africa/Casablanca'>('Europe/Paris')

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const date = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz })
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: tz })
  const dateCapitalized = date.charAt(0).toUpperCase() + date.slice(1)

  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(14px, 2vw, 22px)', fontStyle: 'italic', color: 'var(--text)', fontWeight: 300, letterSpacing: 1 }}>{time}</div>
      <div style={{ fontSize: 'clamp(9px, 1.2vw, 11px)', color: 'var(--soft)', marginTop: 2 }}>{dateCapitalized}</div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
        {(['Europe/Paris', 'Africa/Casablanca'] as const).map(t => (
          <button key={t} onClick={() => setTz(t)} style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 10, cursor: 'pointer', letterSpacing: 0.5,
            background: tz === t ? '#8C5A28' : 'transparent',
            color: tz === t ? 'white' : 'var(--soft)',
            border: `1px solid ${tz === t ? '#8C5A28' : 'var(--line)'}`,
            transition: 'all 0.15s',
          }}>
            {t === 'Europe/Paris' ? 'Paris' : 'Maroc'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ riads, rdvs, onNavigate }: {
  riads: Riad[]
  rdvs: Rdv[]
  onNavigate: (v: View, opts?: { riad?: Partial<Riad> }) => void
}) {
  const today = new Date().toISOString().slice(0, 10)

  const totalVal = riads.reduce((a, r) => a + (r.prixN ?? r.prixD ?? 0), 0)

  // Prochains RDV — à venir, non faits, triés par date+heure
  const prochains = [...rdvs]
    .filter(r => r.date >= today && !r.fait)
    .sort((a, b) => (a.date + a.heure).localeCompare(b.date + b.heure))
    .slice(0, 5)

  const kpis = [
    { l: 'Riads',       v: String(riads.length) },
    { l: 'Valeur',      v: fmtM(totalVal) },
    { l: 'Négociation', v: String(riads.filter(r => r.statut === 'negociation').length) },
    { l: 'RDV à venir', v: String(rdvs.filter(r => r.date >= today && !r.fait).length) },
  ]

  const actions = [
    { l: '+ Nouveau riad',        fn: () => onNavigate('fiche', { riad: {} }) },
    { l: '+ Nouveau RDV',         fn: () => onNavigate('agenda') },
    { l: '📊 Estimer des travaux', fn: () => onNavigate('estimateur') },
    { l: '⚖ Comparer des riads',  fn: () => onNavigate('comparateur') },
  ]

  const formatDate = (d: string) => {
    const t = new Date()
    const tom = new Date(); tom.setDate(t.getDate() + 1)
    const tStr = t.toISOString().slice(0, 10)
    const tomStr = tom.toISOString().slice(0, 10)
    if (d === tStr) return "Aujourd'hui"
    if (d === tomStr) return 'Demain'
    return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header logo + horloge */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '16px 0 8px' }}>
        <div />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 52px)', fontStyle: 'italic', fontWeight: 400, color: 'var(--text)', lineHeight: 1.1 }}>Riad Vision</div>
          <div style={{ height: 1, background: '#8C5A28', margin: '6px 40px 5px', opacity: 0.7 }} />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 11, color: '#8C5A28', letterSpacing: 6, textAlign: 'center' }}>MARRAKECH</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Clock />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {kpis.map(s => (
          <div key={s.l} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 6 }}>{s.l}</div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--text)', fontWeight: 300 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Ligne 2 : Riads + RDV */}
      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Biens récents */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--mid)' }}>Biens récents</div>
            <Btn label="Voir tout" onClick={() => onNavigate('riads')} ghost sm />
          </div>
          {riads.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic', padding: '10px 0' }}>Aucun riad — ajoutez votre premier bien</div>
          )}
          {riads.slice(0, 4).map(r => (
            <div key={r.id} onClick={() => onNavigate('fiche', { riad: r })}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13 }}>{r.nom}</div>
                <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>{r.quartier || r.adresse}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: (r.prixN ?? r.prixD) ? 'var(--accent)' : 'var(--soft)' }}>{fmtM(r.prixN ?? r.prixD)}</div>
                <StatutChip statut={r.statut} />
              </div>
            </div>
          ))}
        </Card>

        {/* Prochains RDV */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--mid)' }}>Prochains RDV</div>
            <Btn label="Agenda" onClick={() => onNavigate('agenda')} ghost sm />
          </div>
          {prochains.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic', padding: '10px 0' }}>
              Aucun RDV à venir —{' '}
              <span onClick={() => onNavigate('agenda')} style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>planifier</span>
            </div>
          )}
          {prochains.map(r => {
            const t = TYPES_RDV[r.type]
            const isToday = r.date === today
            return (
              <div key={r.id} onClick={() => onNavigate('agenda')}
                style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer', alignItems: 'flex-start' }}>
                {/* Point coloré */}
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, marginTop: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 400 }}>{r.titre}</div>
                    <div style={{ fontSize: 10, color: isToday ? '#8C5A28' : 'var(--soft)', fontWeight: isToday ? 600 : 400, background: isToday ? '#F5EDE3' : 'transparent', padding: isToday ? '1px 6px' : '0', borderRadius: 8, whiteSpace: 'nowrap', marginLeft: 8 }}>
                      {formatDate(r.date)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2, display: 'flex', gap: 8 }}>
                    <span style={{ color: t.color, fontWeight: 500 }}>{r.heure}</span>
                    {r.lieu && <span>📍 {r.lieu}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 12 }}>Actions rapides</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {actions.map(a => (
            <button key={a.l} onClick={a.fn}
              style={{ padding: '11px 14px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text)', fontSize: 12, cursor: 'pointer', transition: 'border-color 0.15s', textAlign: 'left' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}>
              {a.l}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

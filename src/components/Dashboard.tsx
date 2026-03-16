'use client'
import type { Riad } from '@/types'
import type { View } from '@/app/page'
import { STATUTS, fmtM } from '@/lib/constants'
import { Card, StatutChip, PageHeader, Btn } from './ui'

export default function Dashboard({ riads, onNavigate }: { riads: Riad[]; onNavigate: (v: View, opts?: { riad?: Partial<Riad> }) => void }) {
  const totalVal = riads.reduce((a, r) => a + (r.prixN ?? r.prixD ?? 0), 0)

  const kpis = [
    { l: 'Riads',       v: String(riads.length) },
    { l: 'Valeur',      v: fmtM(totalVal) },
    { l: 'Négociation', v: String(riads.filter(r => r.statut === 'negociation').length) },
    { l: 'Surface',     v: riads.reduce((a, r) => a + (r.surface ?? 0), 0) + ' m²' },
  ]

  const actions = [
    { l: 'Ajouter un riad',      fn: () => onNavigate('fiche', { riad: {} }) },
    { l: 'Nouvelle estimation',  fn: () => onNavigate('estimateur') },
    { l: 'Voir les résultats',   fn: () => onNavigate('resultats') },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Bonjour," subtitle="Vue d'ensemble du portefeuille" />

      <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {kpis.map(s => (
          <div key={s.l} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 6 }}>{s.l}</div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--text)', fontWeight: 300 }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--mid)' }}>Biens récents</div>
            <Btn label="Voir tout" onClick={() => onNavigate('riads')} ghost sm />
          </div>
          {riads.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic', padding: '10px 0' }}>
              Aucun riad — ajoutez votre premier bien
            </div>
          )}
          {riads.slice(0, 4).map(r => (
            <div
              key={r.id}
              onClick={() => onNavigate('fiche', { riad: r })}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
            >
              <div>
                <div style={{ fontSize: 13 }}>{r.nom}</div>
                <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>{r.quartier || r.adresse}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: (r.prixN ?? r.prixD) ? 'var(--accent)' : 'var(--soft)' }}>
                  {fmtM(r.prixN ?? r.prixD)}
                </div>
                <StatutChip statut={r.statut} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 16 }}>Actions rapides</div>
          {actions.map(a => (
            <button
              key={a.l}
              onClick={a.fn}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px', marginBottom: 8, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text)', fontSize: 13, cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
            >
              {a.l}
            </button>
          ))}
        </Card>
      </div>
    </div>
  )
}

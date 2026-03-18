'use client'
import { useState } from 'react'
import { useAppState } from '@/lib/useAppState'
import Sidebar, { Logo } from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import { RiadsList, RiadFiche, Estimateur, Resultats, Presentation } from '@/components/views'
import Prestataires from '@/components/Prestataires'
import Agenda from '@/components/Agenda'
import CRM from '@/components/CRM'
import Comparateur from '@/components/Comparateur'
import type { Riad } from '@/types'

export type View = 'dashboard' | 'riads' | 'fiche' | 'estimateur' | 'resultats' | 'presentation' | 'prestataires' | 'agenda' | 'crm' | 'comparateur'

const VIEW_LABELS: Record<View, string> = {
  dashboard: 'Accueil', riads: 'Mes Riads', fiche: 'Fiche Riad',
  estimateur: 'Estimateur', resultats: 'Résultats', presentation: 'Présentation',
  prestataires: 'Prestataires', agenda: 'Agenda', crm: 'Contacts', comparateur: 'Comparateur',
}

export default function HomePage() {
  const app = useAppState()
  const [view, setView] = useState<View>('dashboard')
  const [editRiad, setEditRiad] = useState<Partial<Riad> | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [confirmDeletePresta, setConfirmDeletePresta] = useState<number | null>(null)
  const [confirmDeleteRdv, setConfirmDeleteRdv] = useState<number | null>(null)
  const [confirmDeleteProprio, setConfirmDeleteProprio] = useState<number | null>(null)

  const navigate = (v: View, opts?: { riad?: Partial<Riad> }) => {
    if (opts?.riad !== undefined) setEditRiad(opts.riad)
    setView(v); setMenuOpen(false)
  }

  const startEstimate = (riad: Riad) => {
    app.setEstimation({ riadId: riad.id, surface: riad.surface ?? app.state.estimation.surface })
    navigate('estimateur')
  }

  const startPresentation = (riad: Riad) => {
    app.setEstimation({ riadId: riad.id, surface: riad.surface ?? app.state.estimation.surface })
    navigate('presentation')
  }

  if (!app.loaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--soft)', fontSize: 12, letterSpacing: 2 }}>
        CHARGEMENT...
      </div>
    )
  }

  return (
    <>
      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--mid)', padding: '6px 10px', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>☰</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.1 }}>Riad Vision</div>
          <div style={{ height: '0.5px', background: '#8C5A28', margin: '2px 6px', opacity: 0.7 }} />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 7, color: '#8C5A28', letterSpacing: 2 }}>MARRAKECH</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--soft)' }}>{VIEW_LABELS[view]}</div>
      </div>

      {/* Mobile drawer */}
      <div className={`mobile-nav-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />
      <div className={`mobile-nav-drawer${menuOpen ? ' open' : ''}`}>
        <Sidebar currentView={view} onNavigate={navigate} />
      </div>

      {/* Delete riad modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 10, padding: 28, maxWidth: 360, width: '90%', border: '1px solid var(--line)' }}>
            <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', fontWeight: 300, marginBottom: 10 }}>Supprimer ce riad ?</div>
            <div style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 24 }}>Cette action est irréversible.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}>Annuler</button>
              <button onClick={() => { app.deleteRiad(confirmDelete); setConfirmDelete(null) }} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#C0392B', border: 'none', color: 'white' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete prestataire modal */}
      {confirmDeletePresta && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 10, padding: 28, maxWidth: 360, width: '90%', border: '1px solid var(--line)' }}>
            <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', fontWeight: 300, marginBottom: 10 }}>Supprimer ce prestataire ?</div>
            <div style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 24 }}>Ses tarifs seront perdus.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDeletePresta(null)} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}>Annuler</button>
              <button onClick={() => { app.deletePrestataire(confirmDeletePresta); setConfirmDeletePresta(null) }} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#C0392B', border: 'none', color: 'white' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete proprio modal */}
      {confirmDeleteProprio && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 10, padding: 28, maxWidth: 360, width: '90%', border: '1px solid var(--line)' }}>
            <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', fontWeight: 300, marginBottom: 10 }}>Supprimer ce contact ?</div>
            <div style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 24 }}>Son historique sera perdu.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDeleteProprio(null)} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}>Annuler</button>
              <button onClick={() => { app.deleteProprietaire(confirmDeleteProprio); setConfirmDeleteProprio(null) }} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#C0392B', border: 'none', color: 'white' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete rdv modal */}
      {confirmDeleteRdv && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 10, padding: 28, maxWidth: 360, width: '90%', border: '1px solid var(--line)' }}>
            <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', fontWeight: 300, marginBottom: 10 }}>Supprimer ce RDV ?</div>
            <div style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 24 }}>Cette action est irréversible.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDeleteRdv(null)} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}>Annuler</button>
              <button onClick={() => { app.deleteRdv(confirmDeleteRdv); setConfirmDeleteRdv(null) }} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#C0392B', border: 'none', color: 'white' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div className="desktop-sidebar">
          <Sidebar currentView={view} onNavigate={navigate} />
        </div>
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {view === 'dashboard' && <Dashboard riads={app.state.riads} onNavigate={navigate} />}
          {view === 'riads' && (
            <RiadsList
              riads={app.state.riads}
              onNew={() => navigate('fiche', { riad: {} })}
              onEdit={r => navigate('fiche', { riad: r })}
              onEstimate={startEstimate}
              onPresent={startPresentation}
              onDelete={id => setConfirmDelete(id)}
            />
          )}
          {view === 'fiche' && (
            <RiadFiche
              initial={editRiad}
              onSave={r => { if (r.id) app.updateRiad(r as Riad); else app.addRiad(r as Omit<Riad, 'id' | 'createdAt'>); navigate('riads') }}
              onCancel={() => navigate('riads')}
            />
          )}
          {view === 'estimateur' && (
            <Estimateur riads={app.state.riads} prestataires={app.state.prestataires} estimation={app.state.estimation} onChange={app.setEstimation} onResults={() => navigate('resultats')} />
          )}
          {view === 'resultats' && (
            <Resultats estimation={app.state.estimation} riads={app.state.riads} onBack={() => navigate('estimateur')} onRiads={() => navigate('riads')} onPresent={() => navigate('presentation')} />
          )}
          {view === 'presentation' && (
            <Presentation estimation={app.state.estimation} riads={app.state.riads} onBack={() => navigate('resultats')} />
          )}
          {view === 'prestataires' && (
            <Prestataires
              prestataires={app.state.prestataires}
              onAdd={app.addPrestataire}
              onEdit={app.updatePrestataire}
              onDelete={id => setConfirmDeletePresta(id)}
            />
          )}
          {view === 'agenda' && (
            <Agenda
              rdvs={app.state.rdvs}
              riads={app.state.riads}
              onAdd={app.addRdv}
              onEdit={app.updateRdv}
              onDelete={id => setConfirmDeleteRdv(id)}
              onToggleFait={app.updateRdv}
            />
          )}
          {view === 'comparateur' && (
            <Comparateur riads={app.state.riads} />
          )}
          {view === 'crm' && (
            <CRM
              proprietaires={app.state.proprietaires}
              riads={app.state.riads}
              onAdd={app.addProprietaire}
              onEdit={app.updateProprietaire}
              onDelete={id => setConfirmDeleteProprio(id)}
            />
          )}
        </main>
      </div>
    </>
  )
}
export const dynamic = 'force-dynamic'

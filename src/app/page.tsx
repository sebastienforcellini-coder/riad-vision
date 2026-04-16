'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAppState } from '@/lib/useAppState'
import Sidebar, { Logo } from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import { RiadsList, RiadFiche, Estimateur, Resultats, Presentation } from '@/components/views'
import Prestataires from '@/components/Prestataires'
import Agenda from '@/components/Agenda'
import CRM from '@/components/CRM'
import Comparateur from '@/components/Comparateur'
import CarteMarrakech from '@/components/CarteMarrakech'
import Marche from '@/components/Marche'
import type { Riad } from '@/types'

export type View = 'dashboard' | 'riads' | 'fiche' | 'estimateur' | 'resultats' | 'presentation' | 'prestataires' | 'agenda' | 'crm' | 'comparateur' | 'carte' | 'marche'

const VIEW_LABELS: Record<View, string> = {
  dashboard: 'Accueil', riads: 'Mes Riads', fiche: 'Fiche Riad',
  estimateur: 'Estimateur', resultats: 'Résultats', presentation: 'Présentation',
  prestataires: 'Prestataires', agenda: 'Agenda', crm: 'Contacts', comparateur: 'Comparateur', carte: 'Carte', marche: 'Marché',
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
  const [isOffline, setIsOffline] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [lastCreatedId, setLastCreatedId] = useState<number | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    setIsOffline(!navigator.onLine)
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
  }, [])

  // Effacer le highlight après 4s
  useEffect(() => {
    if (!lastCreatedId) return
    const t = setTimeout(() => setLastCreatedId(null), 4000)
    return () => clearTimeout(t)
  }, [lastCreatedId])

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

  const handleSaveRiad = (r: Partial<Riad>) => {
    const isNew = !r.id
    if (isNew) {
      const newId = app.state.nextId
      app.addRiad(r as Omit<Riad, 'id' | 'createdAt'>)
      setLastCreatedId(newId)
      showToast(`${r.nom} ajouté à votre portefeuille`)
    } else {
      app.updateRiad(r as Riad)
      showToast(`${r.nom} enregistré`)
    }
    navigate('riads')
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
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 500, background: toast.type === 'success' ? '#1A1814' : '#C0392B',
          color: 'white', padding: '12px 24px', borderRadius: 10, fontSize: 13,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.msg}
        </div>
      )}

      {/* Bandeau hors-ligne */}
      {isOffline && (
        <div style={{ background: '#8C5A28', color: 'white', textAlign: 'center', padding: '6px', fontSize: 12, letterSpacing: 0.5 }}>
          📵 Mode hors-ligne — données en cache disponibles
        </div>
      )}

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
              <button onClick={() => { app.deleteRiad(confirmDelete); setConfirmDelete(null); showToast('Riad supprimé', 'error') }} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#C0392B', border: 'none', color: 'white' }}>Supprimer</button>
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
              <button onClick={() => { app.deletePrestataire(confirmDeletePresta); setConfirmDeletePresta(null); showToast('Prestataire supprimé', 'error') }} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#C0392B', border: 'none', color: 'white' }}>Supprimer</button>
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
              <button onClick={() => { app.deleteProprietaire(confirmDeleteProprio); setConfirmDeleteProprio(null); showToast('Contact supprimé', 'error') }} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#C0392B', border: 'none', color: 'white' }}>Supprimer</button>
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
              <button onClick={() => { app.deleteRdv(confirmDeleteRdv); setConfirmDeleteRdv(null); showToast('RDV supprimé', 'error') }} style={{ flex: 1, padding: 10, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#C0392B', border: 'none', color: 'white' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div className="desktop-sidebar">
          <Sidebar currentView={view} onNavigate={navigate} />
        </div>
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {view === 'dashboard' && <Dashboard riads={app.state.riads} rdvs={app.state.rdvs} onNavigate={navigate} />}
          {view === 'riads' && (
            <RiadsList
              riads={app.state.riads}
              lastCreatedId={lastCreatedId}
              onNew={() => navigate('fiche', { riad: {} })}
              onEdit={r => navigate('fiche', { riad: r })}
              onEstimate={startEstimate}
              onPresent={startPresentation}
              onDelete={id => setConfirmDelete(id)}
              onToggleCategorie={r => { app.updateRiad({ ...r, categorie: (r.categorie ?? 'portefeuille') === 'portefeuille' ? 'prospection' : 'portefeuille' }); showToast('Catégorie mise à jour') }}
            />
          )}
          {view === 'fiche' && (
            <RiadFiche
              initial={editRiad}
              marchePrix={app.state.marchePrix}
              onSave={handleSaveRiad}
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
          {view === 'agenda' && (
            <Agenda
              rdvs={app.state.rdvs}
              riads={app.state.riads}
              onAdd={r => { app.addRdv(r); showToast('RDV ajouté') }}
              onEdit={r => { app.updateRdv(r); showToast('RDV enregistré') }}
              onDelete={id => setConfirmDeleteRdv(id)}
              onToggleFait={r => { app.updateRdv(r); showToast(r.fait ? 'RDV marqué fait ✓' : 'RDV rouvert') }}
            />
          )}
          {view === 'comparateur' && (
            <Comparateur riads={app.state.riads} />
          )}
          {view === 'carte' && (
            <CarteMarrakech riads={app.state.riads} onSelectRiad={r => navigate('fiche', { riad: r })} />
          )}
          {(view === 'marche' || view === 'prestataires') && (
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)' }}>
                {([['marche', 'Fourchettes marché'], ['prestataires', 'Prestataires']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => navigate(v)} style={{
                    padding: '8px 18px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'transparent',
                    color: view === v ? 'var(--text)' : 'var(--soft)',
                    fontWeight: view === v ? 500 : 400,
                    borderBottom: view === v ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: -1, transition: 'all 0.15s',
                  }}>{l}</button>
                ))}
              </div>
              {view === 'marche' && <Marche marchePrix={app.state.marchePrix} onSave={p => { app.setMarchePrix(p); showToast('Fourchettes sauvegardées') }} />}
              {view === 'prestataires' && (
                <Prestataires
                  prestataires={app.state.prestataires}
                  onAdd={p => { app.addPrestataire(p); showToast('Prestataire ajouté') }}
                  onEdit={p => { app.updatePrestataire(p); showToast('Prestataire enregistré') }}
                  onDelete={id => setConfirmDeletePresta(id)}
                />
              )}
            </div>
          )}
          {view === 'crm' && (
            <CRM
              proprietaires={app.state.proprietaires}
              riads={app.state.riads}
              onAdd={p => { app.addProprietaire(p); showToast('Contact ajouté') }}
              onEdit={p => { app.updateProprietaire(p); showToast('Contact enregistré') }}
              onDelete={id => setConfirmDeleteProprio(id)}
            />
          )}
        </main>
      </div>
    </>
  )
}
export const dynamic = 'force-dynamic'

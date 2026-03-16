'use client'
import { useState } from 'react'
import { useAppState } from '@/lib/useAppState'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import { RiadsList, RiadFiche, Estimateur, Resultats } from '@/components/views'
import type { Riad } from '@/types'

export type View = 'dashboard' | 'riads' | 'fiche' | 'estimateur' | 'resultats'

const VIEW_LABELS: Record<View, string> = {
  dashboard: 'Accueil',
  riads: 'Mes Riads',
  fiche: 'Fiche Riad',
  estimateur: 'Estimateur',
  resultats: 'Résultats',
}

export default function HomePage() {
  const app = useAppState()
  const [view, setView] = useState<View>('dashboard')
  const [editRiad, setEditRiad] = useState<Partial<Riad> | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = (v: View, opts?: { riad?: Partial<Riad> }) => {
    if (opts?.riad !== undefined) setEditRiad(opts.riad)
    setView(v)
    setMenuOpen(false)
  }

  const startEstimate = (riad: Riad) => {
    app.setEstimation({
      riadId: riad.id,
      surface: riad.surface ?? app.state.estimation.surface,
    })
    navigate('estimateur')
  }

  if (!app.loaded) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        color: 'var(--muted)',
        fontSize: 12,
        letterSpacing: 2,
      }}>
        CHARGEMENT...
      </div>
    )
  }

  return (
    <>
      {/* ── Mobile topbar ── */}
      <div className="mobile-topbar">
        <button
          onClick={() => setMenuOpen(true)}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--gold)',
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 20, height: 20,
            background: 'var(--gold)',
            clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
            flexShrink: 0,
          }} />
          <div className="serif" style={{ fontSize: 14, color: 'var(--gold-l)', letterSpacing: 2 }}>
            RIAD VISION PRO
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1 }}>
          {VIEW_LABELS[view]}
        </div>
      </div>

      {/* ── Mobile nav overlay + drawer ── */}
      <div
        className={`mobile-nav-overlay${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />
      <div className={`mobile-nav-drawer${menuOpen ? ' open' : ''}`}>
        <Sidebar currentView={view} onNavigate={navigate} />
      </div>

      {/* ── Desktop layout ── */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div className="desktop-sidebar">
          <Sidebar currentView={view} onNavigate={navigate} />
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {view === 'dashboard' && (
            <Dashboard riads={app.state.riads} onNavigate={navigate} />
          )}
          {view === 'riads' && (
            <RiadsList
              riads={app.state.riads}
              onNew={() => navigate('fiche', { riad: {} })}
              onEdit={(r) => navigate('fiche', { riad: r })}
              onEstimate={startEstimate}
            />
          )}
          {view === 'fiche' && (
            <RiadFiche
              initial={editRiad}
              onSave={(r) => {
                if (r.id) app.updateRiad(r as Riad)
                else app.addRiad(r as Omit<Riad, 'id' | 'createdAt'>)
                navigate('riads')
              }}
              onCancel={() => navigate('riads')}
            />
          )}
          {view === 'estimateur' && (
            <Estimateur
              riads={app.state.riads}
              estimation={app.state.estimation}
              onChange={app.setEstimation}
              onResults={() => navigate('resultats')}
            />
          )}
          {view === 'resultats' && (
            <Resultats
              estimation={app.state.estimation}
              riads={app.state.riads}
              onBack={() => navigate('estimateur')}
              onRiads={() => navigate('riads')}
            />
          )}
        </main>
      </div>
    </>
  )
}

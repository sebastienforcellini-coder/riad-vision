'use client'
import type { View } from '@/app/page'

const NAV = [
  { k: 'dashboard'    as View, l: 'Accueil'       },
  { k: 'riads'        as View, l: 'Mes riads'      },
  { k: 'estimateur'   as View, l: 'Estimateur'     },
  { k: 'resultats'    as View, l: 'Résultats'      },
  { k: 'presentation' as View, l: 'Présentation'   },
]

export default function Sidebar({ currentView, onNavigate }: { currentView: View; onNavigate: (v: View) => void }) {
  return (
    <aside style={{ width: 180, background: 'var(--sidebar)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '24px 20px 20px' }}>
        <div className="serif" style={{ fontSize: 15, color: 'var(--text)', fontStyle: 'italic', fontWeight: 300 }}>Riad Vision</div>
        <div style={{ fontSize: 10, color: 'var(--soft)', marginTop: 3, letterSpacing: 0.5 }}>Marrakech</div>
      </div>
      <nav style={{ flex: 1, padding: '4px 10px' }}>
        {NAV.map(item => {
          const active = currentView === item.k
          return (
            <button key={item.k} onClick={() => onNavigate(item.k)} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', marginBottom: 2,
              borderRadius: 6, fontSize: 13, cursor: 'pointer',
              color: active ? 'var(--text)' : 'var(--mid)',
              background: active ? 'var(--white)' : 'transparent',
              border: 'none', fontWeight: active ? 500 : 400, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(26,24,20,0.04)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >{item.l}</button>
          )
        })}
      </nav>
      <div style={{ padding: '14px 20px', fontSize: 10, color: 'var(--soft)', borderTop: '1px solid var(--line)' }}>Bêta privée</div>
    </aside>
  )
}

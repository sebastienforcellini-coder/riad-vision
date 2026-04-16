'use client'
import type { View } from '@/app/page'

// Résultats et Présentation sont accessibles depuis l'Estimateur
// Prestataires est accessible depuis Marché (onglets)
const NAV: { k: View; l: string; group?: View[] }[] = [
  { k: 'dashboard',   l: 'Accueil'    },
  { k: 'riads',       l: 'Mes riads'  },
  { k: 'carte',       l: 'Carte'      },
  { k: 'comparateur', l: 'Comparer'   },
  { k: 'estimateur',  l: 'Estimateur', group: ['resultats', 'presentation'] },
  { k: 'agenda',      l: 'Agenda'     },
  { k: 'crm',         l: 'Contacts'   },
  { k: 'marche',      l: 'Marché',    group: ['prestataires'] },
]

const Logo = ({ size = 'sm' }: { size?: 'sm' | 'lg' }) => {
  if (size === 'sm') return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontStyle: 'italic', fontWeight: 400, color: 'var(--text)', lineHeight: 1.2 }}>Riad Vision</div>
      <div style={{ height: '0.5px', background: '#8C5A28', margin: '4px 8px 3px', opacity: 0.7 }} />
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 7, color: '#8C5A28', letterSpacing: 3 }}>MARRAKECH</div>
    </div>
  )
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 48, fontStyle: 'italic', fontWeight: 400, color: 'var(--text)', lineHeight: 1.1 }}>Riad Vision</div>
      <div style={{ height: '1px', background: '#8C5A28', margin: '8px 40px 6px', opacity: 0.7 }} />
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 11, color: '#8C5A28', letterSpacing: 6 }}>MARRAKECH</div>
    </div>
  )
}

export default function Sidebar({ currentView, onNavigate }: { currentView: View; onNavigate: (v: View) => void }) {
  return (
    <aside style={{ width: 180, background: 'var(--sidebar)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '20px 16px 18px', display: 'flex', justifyContent: 'center' }}>
        <Logo size="sm" />
      </div>
      <nav style={{ flex: 1, padding: '4px 10px' }}>
        {NAV.map((item, i) => {
          const active = currentView === item.k || (item.group ?? []).includes(currentView)
          const isSeparator = i === 4
          return (
            <div key={item.k}>
              {isSeparator && <div style={{ height: 1, background: 'var(--line)', margin: '8px 4px' }} />}
              <button onClick={() => onNavigate(item.k)} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', marginBottom: 2,
                borderRadius: 6, fontSize: 13, cursor: 'pointer',
                color: active ? 'var(--text)' : 'var(--mid)',
                background: active ? 'var(--white)' : 'transparent',
                border: 'none', fontWeight: active ? 500 : 400, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(26,24,20,0.04)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >{item.l}</button>
            </div>
          )
        })}
      </nav>
      <div style={{ padding: '14px 20px', fontSize: 10, color: 'var(--soft)', borderTop: '1px solid var(--line)' }}>Bêta privée</div>
    </aside>
  )
}

export { Logo }

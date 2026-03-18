'use client'
import type { View } from '@/app/page'

const NAV = [
  { k: 'dashboard'     as View, l: 'Accueil'      },
  { k: 'riads'         as View, l: 'Mes riads'     },
  { k: 'estimateur'    as View, l: 'Estimateur'    },
  { k: 'resultats'     as View, l: 'Résultats'     },
  { k: 'presentation'  as View, l: 'Présentation'  },
  { k: 'prestataires'  as View, l: 'Prestataires'  },
]

const Logo = ({ size = 'sm' }: { size?: 'sm' | 'lg' }) => {
  const fs = size === 'lg' ? 42 : 18
  const sub = size === 'lg' ? 10 : 8
  const w = size === 'lg' ? 280 : 148
  const h = size === 'lg' ? 64 : 44
  const cx = w / 2
  const ty = size === 'lg' ? 30 : 20
  const ly = size === 'lg' ? 40 : 28
  const sy = size === 'lg' ? 54 : 38
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <text
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={fs}
        fontWeight="400"
        fontStyle="italic"
        fill="#1A1814"
        x={cx} y={ty}
        textAnchor="middle"
        dominantBaseline="hanging"
      >Riad Vision</text>
      <line x1={cx - 60} y1={ly} x2={cx + 60} y2={ly} stroke="#8C5A28" strokeWidth="0.7"/>
      <text
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={sub}
        fill="#8C5A28"
        x={cx} y={sy}
        textAnchor="middle"
        dominantBaseline="hanging"
        letterSpacing="4"
      >MARRAKECH</text>
    </svg>
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
          const active = currentView === item.k
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

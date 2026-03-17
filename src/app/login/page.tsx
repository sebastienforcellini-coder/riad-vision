'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(false)
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push(params.get('from') || '/')
    } else {
      setError(true); setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 320 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="serif" style={{ fontSize: 28, color: 'var(--text)', fontStyle: 'italic', fontWeight: 300 }}>
            Riad Vision
          </div>
          <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 6, letterSpacing: 0.5 }}>
            Marrakech · Accès bêta
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <div className="label">Mot de passe</div>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error && (
            <div style={{ fontSize: 12, color: 'var(--red, #C0392B)', marginBottom: 12, padding: '8px 12px', background: '#fdf0ef', border: '1px solid #f0b8b5', borderRadius: 6 }}>
              Mot de passe incorrect
            </div>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 8, padding: '11px' }}>
            {loading ? 'Connexion…' : 'Accéder'}
          </button>
        </form>

        <div style={{ marginTop: 32, fontSize: 10, color: 'var(--soft)', textAlign: 'center', letterSpacing: 0.5 }}>
          Version bêta privée
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
export const dynamic = 'force-dynamic'

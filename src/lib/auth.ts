// Authentification bêta : logique partagée entre middleware (Edge) et /api/auth (Node).
// Web Crypto est disponible dans les deux runtimes.

export const COOKIE_NAME = 'rvp_auth'

// Mot de passe attendu, normalisé. null si non configuré : dans ce cas l'accès est refusé.
export function getExpectedPassword(): string | null {
  const pw = process.env.BETA_PASSWORD?.trim()
  return pw ? pw : null
}

// Valeur stockée dans le cookie : empreinte SHA-256, jamais le mot de passe en clair.
export async function authToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`rvp:v1:${password.trim()}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
